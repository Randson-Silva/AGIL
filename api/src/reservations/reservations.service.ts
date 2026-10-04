import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../db/prisma/prisma.service.js';
import { StatusReserva } from '../generated/prisma/client.js';
import {
  hasTimeOverlap,
  normalizeDateRange,
  validateAdvanceNotice,
  validateTimeSlots,
} from '../utils/reservation.utils.js';
import { CreateReservationDto } from './dtos/create-reservation.dto.js';

@Injectable()
export class ReservationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOccupiedSlots(local: string, date: string) {
    if (!local || !date) {
      throw new BadRequestException(
        'O laboratório e a data são obrigatórios para consultar horários.',
      );
    }

    const { startOfDay, endOfDay, dayOfWeek } = normalizeDateRange(date);

    const activeReservations = await this.prisma.reservaEspaco.findMany({
      where: {
        local,
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

  async createReservation(professorId: string, data: CreateReservationDto) {
    const isRecurring = Boolean(data.pratica_recorrente);

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
          quantidade_alunos: data.quantidade_alunos,
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
      userProfile === 'TECNICO' ? {} : { professor_id: userId };

    return this.prisma.reservaEspaco.findMany({
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
  }
}
