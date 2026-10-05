import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../db/prisma/prisma.service.js';
import { ObjetivoReserva, StatusReserva } from '../generated/prisma/client.js';
import {
  hasTimeOverlap,
  normalizeDateRange,
  validateAdvanceNotice,
  validateTimeSlots,
} from '../utils/reservation.utils.js';
import { CreateReservationDto } from './dtos/create-reservation.dto.js';

const LOWER_PRIORITY_OBJECTIVES: ObjetivoReserva[] = [
  ObjetivoReserva.PESQUISA,
  ObjetivoReserva.TCC,
];

@Injectable()
export class ReservationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOccupiedSlots(local: string, date: string, objetivo?: string) {
    if (!local || !date) {
      throw new BadRequestException(
        'O laboratório e a data são obrigatórios para consultar horários.',
      );
    }

    const { startOfDay, endOfDay, dayOfWeek } = normalizeDateRange(date);
    const isPracticalClass = objetivo === ObjetivoReserva.AULA_PRATICA;

    const activeReservations = await this.prisma.reservaEspaco.findMany({
      where: {
        local,
        status: {
          notIn: [StatusReserva.REJEITADA, StatusReserva.CANCELADA],
        },
        ...(isPracticalClass && {
          objetivo: {
            notIn: LOWER_PRIORITY_OBJECTIVES,
          },
        }),
        OR: [
          {
            data_reserva: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
          {
            pratica_recorrente: true,
            dia_semana: dayOfWeek,
            data_reserva: {
              lte: endOfDay,
            },
          },
        ],
      },
      include: {
        horarios: true,
      },
    });

    const occupiedMap = new Map<
      string,
      { hora_inicio: string; hora_fim: string }
    >();

    for (const reservation of activeReservations) {
      for (const slot of reservation.horarios) {
        const key = `${slot.hora_inicio}-${slot.hora_fim}`;
        occupiedMap.set(key, {
          hora_inicio: slot.hora_inicio,
          hora_fim: slot.hora_fim,
        });
      }
    }

    return Array.from(occupiedMap.values());
  }

  async getDailyAvailability(date: string, local?: string) {
    if (!date) {
      throw new BadRequestException(
        'A data é obrigatória para consultar a disponibilidade.',
      );
    }

    const { startOfDay, endOfDay, dayOfWeek } = normalizeDateRange(date);
    const shouldFilterByLab = local && local !== 'Todos';

    const activeReservations = await this.prisma.reservaEspaco.findMany({
      where: {
        ...(shouldFilterByLab && { local }),
        status: {
          notIn: [StatusReserva.REJEITADA, StatusReserva.CANCELADA],
        },
        OR: [
          {
            data_reserva: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
          {
            pratica_recorrente: true,
            dia_semana: dayOfWeek,
            data_reserva: {
              lte: endOfDay,
            },
          },
        ],
      },
      include: {
        horarios: true,
        professor: {
          select: {
            nome: true,
          },
        },
      },
    });

    const occupiedDetails: Array<{
      local: string;
      hora_inicio: string;
      hora_fim: string;
      status: StatusReserva;
      objetivo: string;
      titulo: string;
      quantidade_alunos: number;
      professor_nome: string;
    }> = [];

    for (const reservation of activeReservations) {
      for (const slot of reservation.horarios) {
        occupiedDetails.push({
          local: reservation.local,
          hora_inicio: slot.hora_inicio,
          hora_fim: slot.hora_fim,
          status: reservation.status,
          objetivo: reservation.objetivo,
          titulo: reservation.titulo,
          quantidade_alunos: reservation.quantidade_alunos,
          professor_nome: reservation.professor.nome,
        });
      }
    }

    return occupiedDetails;
  }

  async createReservation(professorId: string, data: CreateReservationDto) {
    const isRecurring = Boolean(data.pratica_recorrente);
    const isPracticalClass = data.objetivo === ObjetivoReserva.AULA_PRATICA;

    if (
      isPracticalClass &&
      (!data.quantidade_alunos || data.quantidade_alunos <= 0)
    ) {
      throw new BadRequestException(
        'Informe uma quantidade válida de alunos para a aula prática.',
      );
    }

    validateTimeSlots(data.horarios);
    validateAdvanceNotice(data.data_reserva, data.horarios, isRecurring);

    const { startOfDay, endOfDay, dayOfWeek } = normalizeDateRange(
      data.data_reserva,
    );

    return this.prisma.$transaction(async (tx) => {
      const conflictingReservations = await tx.reservaEspaco.findMany({
        where: {
          local: data.local,
          status: {
            notIn: [StatusReserva.REJEITADA, StatusReserva.CANCELADA],
          },
          OR: isRecurring
            ? [
                {
                  dia_semana: dayOfWeek,
                  data_reserva: { gte: startOfDay },
                },
                {
                  pratica_recorrente: true,
                  dia_semana: dayOfWeek,
                },
              ]
            : [
                {
                  data_reserva: {
                    gte: startOfDay,
                    lte: endOfDay,
                  },
                },
                {
                  pratica_recorrente: true,
                  dia_semana: dayOfWeek,
                  data_reserva: { lte: endOfDay },
                },
              ],
        },
        include: {
          horarios: true,
        },
      });

      for (const requestedSlot of data.horarios) {
        for (const existing of conflictingReservations) {
          const canOverridePriority =
            isPracticalClass &&
            LOWER_PRIORITY_OBJECTIVES.includes(existing.objetivo);

          if (canOverridePriority) {
            continue;
          }

          const conflict = existing.horarios.find((existingSlot) =>
            hasTimeOverlap(
              requestedSlot.hora_inicio,
              requestedSlot.hora_fim,
              existingSlot.hora_inicio,
              existingSlot.hora_fim,
            ),
          );

          if (conflict) {
            throw new BadRequestException(
              `O horário ${requestedSlot.hora_inicio} — ${requestedSlot.hora_fim} já está reservado para este laboratório.`,
            );
          }
        }
      }

      const initialStatus = isRecurring
        ? StatusReserva.AVISO_SIMPLES
        : StatusReserva.PENDENTE;

      return tx.reservaEspaco.create({
        data: {
          professor_id: professorId,
          local: data.local,
          data_reserva: startOfDay,
          dia_semana: dayOfWeek,
          objetivo: data.objetivo,
          titulo: data.titulo,
          quantidade_alunos: isPracticalClass ? data.quantidade_alunos! : 0,
          observacoes: data.observacoes || null,
          pratica_recorrente: isRecurring,
          status: initialStatus,
          horarios: {
            create: data.horarios.map((slot) => ({
              hora_inicio: slot.hora_inicio,
              hora_fim: slot.hora_fim,
            })),
          },
        },
        include: {
          horarios: true,
        },
      });
    });
  }

  async listReservations(userId: string, userProfile: string) {
    const whereClause =
      userProfile === 'PROFESSOR' ? { professor_id: userId } : {};

    const reservations = await this.prisma.reservaEspaco.findMany({
      where: whereClause,
      orderBy: { data_reserva: 'asc' },
      include: {
        horarios: true,
        professor: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });

    const enriched = reservations.map((res) => {
      const isHighPriority = res.objetivo === ObjetivoReserva.AULA_PRATICA;

      const hasPriorityConflict =
        isHighPriority &&
        reservations.some((other) => {
          if (
            other.id === res.id ||
            other.local !== res.local ||
            other.status === StatusReserva.REJEITADA ||
            other.status === StatusReserva.CANCELADA ||
            !LOWER_PRIORITY_OBJECTIVES.includes(other.objetivo)
          ) {
            return false;
          }

          const sameDay =
            other.data_reserva.getTime() === res.data_reserva.getTime() ||
            ((other.pratica_recorrente || res.pratica_recorrente) &&
              other.dia_semana === res.dia_semana);

          if (!sameDay) return false;

          return res.horarios.some((slotA) =>
            other.horarios.some((slotB) =>
              hasTimeOverlap(
                slotA.hora_inicio,
                slotA.hora_fim,
                slotB.hora_inicio,
                slotB.hora_fim,
              ),
            ),
          );
        });

      return {
        ...res,
        prioridade_maxima: isHighPriority,
        alerta_conflito_remanejamento: hasPriorityConflict,
      };
    });

    return enriched.sort((a, b) => {
      if (a.prioridade_maxima !== b.prioridade_maxima) {
        return a.prioridade_maxima ? -1 : 1;
      }
      return a.data_reserva.getTime() - b.data_reserva.getTime();
    });
  }
}
