import { BadRequestException } from '@nestjs/common';

export interface TimeSlotInput {
  hora_inicio: string;
  hora_fim: string;
}

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
const MIN_ADVANCE_HOURS = 24;

export function validateTimeSlots(slots: TimeSlotInput[]): void {
  if (!slots || slots.length === 0) {
    throw new BadRequestException(
      'Selecione pelo menos um horário para a reserva.',
    );
  }

  const seenSlots = new Set<string>();

  for (const slot of slots) {
    if (!TIME_REGEX.test(slot.hora_inicio) || !TIME_REGEX.test(slot.hora_fim)) {
      throw new BadRequestException(
        'Os horários devem estar no formato HH:MM.',
      );
    }

    if (slot.hora_inicio >= slot.hora_fim) {
      throw new BadRequestException(
        `O horário de início (${slot.hora_inicio}) deve ser anterior ao horário de término (${slot.hora_fim}).`,
      );
    }

    const slotKey = `${slot.hora_inicio}-${slot.hora_fim}`;
    if (seenSlots.has(slotKey)) {
      throw new BadRequestException(
        `O horário ${slot.hora_inicio} — ${slot.hora_fim} foi selecionado em duplicidade.`,
      );
    }
    seenSlots.add(slotKey);
  }
}

export function validateAdvanceNotice(
  reservationDateIso: string,
  slots: TimeSlotInput[],
  isRecurring = false,
): void {
  const datePart = reservationDateIso.split('T')[0];

  const earliestStart = slots.map((s) => s.hora_inicio).sort()[0];

  const reservationStart = new Date(`${datePart}T${earliestStart}:00`);
  if (isNaN(reservationStart.getTime())) {
    throw new BadRequestException(
      'A data informada para a reserva é inválida.',
    );
  }

  const now = new Date();

  if (reservationStart.getTime() < now.getTime()) {
    throw new BadRequestException(
      'Não é possível realizar reservas para datas ou horários que já passaram.',
    );
  }

  if (isRecurring) return;

  const diffInHours =
    (reservationStart.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (diffInHours < MIN_ADVANCE_HOURS) {
    throw new BadRequestException(
      'Solicitações esporádicas exigem no mínimo 24h de antecedência',
    );
  }
}

export function hasTimeOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string,
): boolean {
  return startA < endB && startB < endA;
}

export function normalizeDateRange(dateString: string): {
  startOfDay: Date;
  endOfDay: Date;
  dayOfWeek: number;
} {
  const datePart = dateString.split('T')[0];
  const startOfDay = new Date(`${datePart}T00:00:00.000Z`);
  const endOfDay = new Date(`${datePart}T23:59:59.999Z`);

  if (isNaN(startOfDay.getTime())) {
    throw new BadRequestException(
      'Formato de data inválido. Utilize o padrão YYYY-MM-DD.',
    );
  }

  return {
    startOfDay,
    endOfDay,
    dayOfWeek: startOfDay.getUTCDay(),
  };
}
