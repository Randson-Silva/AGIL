import { extractIsoDatePart, formatIsoDateToBr } from './date-utils';
import { ReservationItem, UsageLog } from '../services/reservation.service';

export function canFillUsageLog(reservation: ReservationItem): boolean {
  const allowedStatuses = ['APROVADA', 'AVISO_SIMPLES'];
  if (!allowedStatuses.includes(reservation.status) || reservation.ataUso) {
    return false;
  }

  const ultimoHorario = reservation.horarios
    ?.map((h) => h.hora_fim)
    .sort()
    .pop();

  const datePart = extractIsoDatePart(reservation.data_reserva);
  const dataFim = datePart
    ? (() => {
        const [year, month, day] = datePart.split('-').map(Number);
        return new Date(year, month - 1, day);
      })()
    : new Date(reservation.data_reserva);

  if (!ultimoHorario) {
    dataFim.setHours(23, 59, 59, 999);
  } else {
    const [horas, minutos] = ultimoHorario.split(':').map(Number);
    dataFim.setHours(horas, minutos, 0, 0);
  }

  return new Date() >= dataFim;
}

export function formatReservationDateTime(
  dataReserva: string,
  horarios?: { hora_inicio: string; hora_fim: string }[],
) {
  try {
    const formattedDate = formatIsoDateToBr(dataReserva);
    if (!formattedDate) return dataReserva;

    let timeString = '';
    if (horarios && horarios.length > 0) {
      const sorted = [...horarios].sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));
      const start = sorted[0].hora_inicio;
      const end = sorted[sorted.length - 1].hora_fim;
      timeString = ` · ${start} — ${end}`;
    }

    return `${formattedDate}${timeString}`;
  } catch {
    return dataReserva;
  }
}

export function formatAtaCode(log: UsageLog) {
  if (typeof log.codigo === 'number') {
    return `A-${String(log.codigo).padStart(3, '0')}`;
  }
  const clean = String(log.id).replace(/[^a-zA-Z0-9]/g, '');
  const suffix = clean.slice(-3).toUpperCase().padStart(3, '0');
  return `A-${suffix}`;
}
