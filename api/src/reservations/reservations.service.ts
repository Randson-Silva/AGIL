import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BreakdownService } from '../breakdown/breakdown.service.js';
import { PrismaService } from '../db/prisma/prisma.service.js';
import {
  ObjetivoReserva,
  Perfil,
  StatusReserva,
  TipoAvaria,
} from '../generated/prisma/client.js';
import { MailService } from '../mail/mail.service.js';
import {
  hasTimeOverlap,
  normalizeDateRange,
  validateLabCapacity,
  validateNotPastReservation,
  validateTimeSlots,
} from '../utils/reservation.utils.js';
import { CreateReservationDto } from './dtos/create-reservation.dto.js';
import { CreateUsageLogDto } from './dtos/create-usage-log.dto.js';
import { UpdateUsageLogDto } from './dtos/update-usage-log.dto.js';

const LOWER_PRIORITY_OBJECTIVES: ObjetivoReserva[] = [
  ObjetivoReserva.PESQUISA,
  ObjetivoReserva.TCC,
];

const RESERVATION_RELATIONS = {
  horarios: true,
  ataUso: true,
  professor: {
    select: {
      id: true,
      nome: true,
      email: true,
      perfil: true,
    },
  },
} as const;

@Injectable()
export class ReservationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly breakdownService: BreakdownService,
  ) {}

  async getOccupiedSlots(local: string, date: string, isRecurring = false) {
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
      quantidade_grupos: number;
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
          quantidade_grupos: reservation.quantidade_grupos,
          professor_nome: reservation.professor.nome,
        });
      }
    }

    return occupiedDetails;
  }

  async createReservation(professorId: string, data: CreateReservationDto) {
    const isRecurring = Boolean(data.pratica_recorrente);
    const isPracticalClass = data.objetivo === ObjetivoReserva.AULA_PRATICA;

    if (isPracticalClass) {
      if (!data.quantidade_alunos || data.quantidade_alunos <= 0) {
        throw new BadRequestException(
          'Informe uma quantidade válida de alunos para a aula prática.',
        );
      }
      if (!data.quantidade_grupos || data.quantidade_grupos <= 0) {
        throw new BadRequestException(
          'Informe uma quantidade válida de grupos para a aula prática.',
        );
      }
      validateLabCapacity(data.local, data.quantidade_alunos);
    }

    validateTimeSlots(data.horarios);
    validateNotPastReservation(data.data_reserva, data.horarios);

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

      return tx.reservaEspaco.create({
        data: {
          professor_id: professorId,
          local: data.local,
          data_reserva: startOfDay,
          dia_semana: dayOfWeek,
          objetivo: data.objetivo,
          titulo: data.titulo,
          quantidade_alunos: isPracticalClass ? data.quantidade_alunos! : 0,
          quantidade_grupos: isPracticalClass ? data.quantidade_grupos! : 0,
          observacoes: data.observacoes || null,
          pratica_recorrente: isRecurring,
          status: StatusReserva.PENDENTE,
          horarios: {
            create: data.horarios.map((slot) => ({
              hora_inicio: slot.hora_inicio,
              hora_fim: slot.hora_fim,
            })),
          },
        },
        include: RESERVATION_RELATIONS,
      });
    });
  }

  async listReservations(userId: string, userProfile: string) {
    const whereClause =
      userProfile === 'PROFESSOR' ? { professor_id: userId } : {};

    const reservations = await this.prisma.reservaEspaco.findMany({
      where: whereClause,
      orderBy: { data_reserva: 'asc' },
      include: RESERVATION_RELATIONS,
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

  async approveReservation(id: string) {
    const reservation = await this.prisma.reservaEspaco.findUnique({
      where: { id },
      include: { horarios: true},
    });

    if (!reservation) {
      throw new NotFoundException('Reserva não encontrada.');
    }

    if (
      reservation.status !== StatusReserva.PENDENTE &&
      reservation.status !== StatusReserva.AVISO_SIMPLES
    ) {
      throw new BadRequestException(
        'Apenas reservas pendentes podem ser aprovadas.',
      );
    }
    
    validateNotPastReservation(reservation.data_reserva.toISOString(), reservation.horarios);

    const updatedReservation = await this.prisma.reservaEspaco.update({
      where: { id },
      data: {
        status: StatusReserva.APROVADA,
        analisada_em: new Date(),
      },
      include: RESERVATION_RELATIONS,
    });

    await this.mailService.sendReservationStatusEmail({
      to: updatedReservation.professor.email,
      professorNome: updatedReservation.professor.nome,
      local: updatedReservation.local,
      titulo: updatedReservation.titulo,
      dataReserva: updatedReservation.data_reserva,
      horarios: updatedReservation.horarios,
      status: 'APROVADA',
    });

    return updatedReservation;
  }

  async rejectReservation(id: string, motivoRejeicao: string) {
    const reservation = await this.prisma.reservaEspaco.findUnique({
      where: { id },
    });

    if (!reservation) {
      throw new NotFoundException('Reserva não encontrada.');
    }

    if (
      reservation.status !== StatusReserva.PENDENTE &&
      reservation.status !== StatusReserva.AVISO_SIMPLES
    ) {
      throw new BadRequestException(
        'Apenas reservas pendentes podem ser rejeitadas.',
      );
    }

    const updatedReservation = await this.prisma.reservaEspaco.update({
      where: { id },
      data: {
        status: StatusReserva.REJEITADA,
        motivo_rejeicao: motivoRejeicao,
        analisada_em: new Date(),
      },
      include: RESERVATION_RELATIONS,
    });

    await this.mailService.sendReservationStatusEmail({
      to: updatedReservation.professor.email,
      professorNome: updatedReservation.professor.nome,
      local: updatedReservation.local,
      titulo: updatedReservation.titulo,
      dataReserva: updatedReservation.data_reserva,
      horarios: updatedReservation.horarios,
      status: 'REJEITADA',
      motivoRejeicao,
    });

    return updatedReservation;
  }

  async registerAbsence(id: string) {
    const reservation = await this.prisma.reservaEspaco.findUnique({
      where: { id },
    });

    if (!reservation) {
      throw new NotFoundException('Reserva não encontrada.');
    }

    if (reservation.status !== StatusReserva.APROVADA) {
      throw new BadRequestException(
        'Apenas reservas aprovadas podem ter ausência registrada.',
      );
    }

    return this.prisma.reservaEspaco.update({
      where: { id },
      data: {
        status: StatusReserva.REJEITADA,
        motivo_rejeicao: 'Ausência registrada pelo técnico.',
        analisada_em: new Date(),
      },
      include: RESERVATION_RELATIONS,
    });
  }

  async listReservationHistory(filters: {
    startDate?: string;
    endDate?: string;
    status?: string;
    search?: string;
  }) {
    const { startDate, endDate, status = 'TODAS', search } = filters;

    const normalizedStatus = status.toUpperCase();
    const allowedStatuses: StatusReserva[] =
      normalizedStatus === 'ACEITAS'
        ? [StatusReserva.APROVADA]
        : normalizedStatus === 'RECUSADAS'
          ? [StatusReserva.REJEITADA, StatusReserva.CANCELADA]
          : [
              StatusReserva.APROVADA,
              StatusReserva.REJEITADA,
              StatusReserva.CANCELADA,
            ];

    const dateFilter: { gte?: Date; lte?: Date } = {};
    if (startDate) {
      dateFilter.gte = new Date(`${startDate}T00:00:00.000-03:00`);
    }
    if (endDate) {
      dateFilter.lte = new Date(`${endDate}T23:59:59.999-03:00`);
    }
    const hasDateFilter = Boolean(startDate || endDate);

    let reservations = await this.prisma.reservaEspaco.findMany({
      where: {
        status: { in: allowedStatuses },
        ...(hasDateFilter && {
          OR: [
            { analisada_em: dateFilter },
            { analisada_em: null, created_at: dateFilter },
          ],
        }),
      },
      include: RESERVATION_RELATIONS,
    });

    if (search && search.trim()) {
      const term = search.trim().toLowerCase();
      reservations = reservations.filter(
        (res) =>
          res.local.toLowerCase().includes(term) ||
          res.titulo.toLowerCase().includes(term) ||
          res.professor.nome.toLowerCase().includes(term),
      );
    }

    reservations.sort((a, b) => {
      const dateA = new Date(a.analisada_em ?? a.created_at).getTime();
      const dateB = new Date(b.analisada_em ?? b.created_at).getTime();
      return dateB - dateA;
    });

    return reservations;
  }

  async createUsageLog(
    reservaId: string,
    professorId: string,
    dto: CreateUsageLogDto,
  ) {
    const reserva = await this.prisma.reservaEspaco.findUnique({
      where: { id: reservaId },
      include: {
        horarios: true,
        ataUso: true,
      },
    });

    if (!reserva) {
      throw new NotFoundException('Reserva não encontrada.');
    }

    if (reserva.professor_id !== professorId) {
      throw new ForbiddenException(
        'Você só pode preencher a ata das suas próprias reservas.',
      );
    }

    if (reserva.ataUso || reserva.status === StatusReserva.CONCLUIDA_COM_ATA) {
      throw new ConflictException('Esta reserva já possui uma ata registrada.');
    }

    const statusPermitidos: StatusReserva[] = [
      StatusReserva.APROVADA,
      StatusReserva.AVISO_SIMPLES,
    ];
    if (!statusPermitidos.includes(reserva.status)) {
      throw new BadRequestException(
        'Apenas reservas aprovadas ou confirmadas podem receber ata de uso.',
      );
    }

    // só permitir após o término do último horário reservado
    const dataFimReserva = this.getReservationEndDateTime(
      reserva.data_reserva,
      reserva.horarios,
    );

    if (new Date() < dataFimReserva) {
      throw new BadRequestException(
        'A ata digital só pode ser preenchida após a conclusão do horário reservado.',
      );
    }

    // valida se os insumos das avarias existem no inventário
    if (dto.avarias?.length) {
      const insumoIds = [
        ...new Set<string>(
          dto.avarias.map((avaria: { insumo_id: string }) => avaria.insumo_id),
        ),
      ];
      const encontrados = await this.prisma.insumo.count({
        where: { id: { in: insumoIds } },
      });

      if (encontrados !== insumoIds.length) {
        throw new NotFoundException(
          'Um ou mais materiais selecionados para avaria não foram encontrados no inventário.',
        );
      }
    }

    // cria a ata e atualiza o status da reserva atomicamente
    const [ata] = await this.prisma.$transaction([
      this.prisma.ataUso.create({
        data: {
          reservaId: reserva.id,
          nomePratica: dto.nomePratica.trim(),
          professorResponsavel: dto.professorResponsavel.trim(),
          numeroAlunos: dto.numeroAlunos,
        },
      }),
      this.prisma.reservaEspaco.update({
        where: { id: reserva.id },
        data: { status: StatusReserva.CONCLUIDA_COM_ATA },
      }),
    ]);

    // registra as avarias no módulo de breakdown
    const avariasRegistradas: Awaited<
      ReturnType<BreakdownService['reportBreakdown']>
    >[] = [];
    if (dto.avarias?.length) {
      for (const avaria of dto.avarias) {
        const descricaoFormatada = avaria.descricao?.trim()
          ? `[Ata: ${dto.nomePratica.trim()}] ${avaria.descricao.trim()}`
          : `[Ata: ${dto.nomePratica.trim()}] Avaria registrada durante a prática.`;

        const registro = await this.breakdownService.reportBreakdown(
          professorId,
          {
            insumo_id: avaria.insumo_id,
            quantidade: avaria.quantidade ?? 1,
            tipo_ocorrencia: avaria.tipo_ocorrencia ?? TipoAvaria.OUTRO,
            descricao: descricaoFormatada,
          },
        );

        avariasRegistradas.push(registro);
      }
    }

    return {
      ...ata,
      avarias: avariasRegistradas,
    };
  }

  async getUsageLog(reservaId: string, user: { id: string; role: Perfil }) {
    const reserva = await this.prisma.reservaEspaco.findUnique({
      where: { id: reservaId },
      include: { ataUso: true },
    });

    if (!reserva) {
      throw new NotFoundException('Reserva não encontrada.');
    }

    // tecnico passa direto, se for prof verifica o id correspondente
    if (user.role !== Perfil.TECNICO && reserva.professor_id !== user.id) {
      throw new ForbiddenException('Sem permissão para visualizar esta ata.');
    }

    if (!reserva.ataUso) {
      throw new NotFoundException('Nenhuma ata registrada para esta reserva.');
    }

    return reserva.ataUso;
  }

  private getReservationEndDateTime(
    dataReserva: Date,
    horarios: { hora_fim: string }[],
  ): Date {
    // aqui pega o maior hora_fim da reserva (ex: "17:30")
    const ultimoHorario = horarios
      .map((h) => h.hora_fim)
      .sort()
      .pop();

    const dataFim = new Date(dataReserva);

    if (!ultimoHorario) {
      dataFim.setHours(23, 59, 59, 999);
      return dataFim;
    }

    const [horas, minutos] = ultimoHorario.split(':').map(Number);
    dataFim.setHours(horas, minutos, 0, 0);

    return dataFim;
  }

  async listUsageLogs(user: { id: string; role: Perfil }) {
    const whereClause =
      user.role === Perfil.PROFESSOR
        ? { reserva: { professor_id: user.id } }
        : {};

    return this.prisma.ataUso.findMany({
      where: whereClause,
      orderBy: { criadoEm: 'desc' },
      include: {
        reserva: {
          select: {
            id: true,
            local: true,
            data_reserva: true,
            titulo: true,
            status: true,
            horarios: true,
            professor: {
              select: {
                id: true,
                nome: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  async updateUsageLog(
    reservaId: string,
    user: { id: string; role: Perfil },
    dto: UpdateUsageLogDto,
  ) {
    const reserva = await this.prisma.reservaEspaco.findUnique({
      where: { id: reservaId },
      include: { ataUso: true },
    });

    if (!reserva) {
      throw new NotFoundException('Reserva não encontrada.');
    }

    if (user.role !== Perfil.TECNICO && reserva.professor_id !== user.id) {
      throw new ForbiddenException('Sem permissão para editar esta ata.');
    }

    if (!reserva.ataUso) {
      throw new NotFoundException('Nenhuma ata registrada para esta reserva.');
    }

    return this.prisma.ataUso.update({
      where: { reservaId: reserva.id },
      data: {
        ...(dto.nomePratica !== undefined && {
          nomePratica: dto.nomePratica.trim(),
        }),
        ...(dto.professorResponsavel !== undefined && {
          professorResponsavel: dto.professorResponsavel.trim(),
        }),
        ...(dto.numeroAlunos !== undefined && {
          numeroAlunos: dto.numeroAlunos,
        }),
      },
    });
  }

  async deleteUsageLog(reservaId: string) {
    const reserva = await this.prisma.reservaEspaco.findUnique({
      where: { id: reservaId },
      include: { ataUso: true },
    });

    if (!reserva) {
      throw new NotFoundException('Reserva não encontrada.');
    }

    if (!reserva.ataUso) {
      throw new NotFoundException('Nenhuma ata registrada para esta reserva.');
    }

    await this.prisma.$transaction([
      this.prisma.ataUso.delete({
        where: { reservaId: reserva.id },
      }),
      this.prisma.reservaEspaco.update({
        where: { id: reserva.id },
        data: { status: StatusReserva.APROVADA },
      }),
    ]);

    return { message: 'Ata removida com sucesso.' };
  }
}
