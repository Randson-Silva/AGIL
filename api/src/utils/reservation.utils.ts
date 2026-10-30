import { BadRequestException } from '@nestjs/common';

export interface TimeSlotInput {
  hora_inicio: string;
  hora_fim: string;
}


const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const VALID_LABORATORIES = [
  'Lab. de Química Geral',
  'Lab. de Química Orgânica',
] as const;

export const LAB_CAPACITIES: Record<string, number> = {
  'Lab. de Química Geral': 30,
  'Lab. de Química Orgânica': 24,
};

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

export function getCurrentDateTimeInBrazil(): {
  currentDateIso: string;
  currentTime: string;
} {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Fortaleza',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const getPart = (type: string) =>
    parts.find((p) => p.type === type)?.value || '';

  const year = getPart('year');
  const month = getPart('month');
  const day = getPart('day');
  const hour = getPart('hour') === '24' ? '00' : getPart('hour');
  const minute = getPart('minute');

  return {
    currentDateIso: `${year}-${month}-${day}`,
    currentTime: `${hour}:${minute}`,
  };
}

export function validateNotPastReservation(
  reservationDateIso: string,
  slots: TimeSlotInput[],
): void {
  const datePart = reservationDateIso.split('T')[0];
  const { currentDateIso, currentTime } = getCurrentDateTimeInBrazil();

  if (datePart < currentDateIso) {
    throw new BadRequestException(
      'Não é possível realizar reservas para datas que já passaram.',
    );
  }

  if (datePart === currentDateIso) {
    for (const slot of slots) {
      if (slot.hora_inicio <= currentTime) {
        throw new BadRequestException(
          `O horário ${slot.hora_inicio} — ${slot.hora_fim} já passou e não pode ser alocado.`,
        );
      }
    }
  }
}

export function validateLabCapacity(
  local: string,
  quantidadeAlunos?: number,
): void {
  if (!quantidadeAlunos) return;

  const maxCapacity = LAB_CAPACITIES[local];
  if (maxCapacity && quantidadeAlunos > maxCapacity) {
    throw new BadRequestException(
      `A quantidade de alunos (${quantidadeAlunos}) excede a capacidade máxima do ${local} (${maxCapacity} lugares).`,
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
  const [year, month, day] = datePart.split('-').map(Number);

  if (!year || !month || !day) {
    throw new BadRequestException(
      'Formato de data inválido. Utilize o padrão YYYY-MM-DD.',
    );
  }

  const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

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
