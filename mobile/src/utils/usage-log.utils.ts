import { ReservationItem } from '../services/reservation.service';

export function canFillUsageLog(reservation: ReservationItem): boolean {
  const allowedStatuses = ['APROVADA', 'AVISO_SIMPLES'];
  if (!allowedStatuses.includes(reservation.status) || reservation.ataUso) {
    return false;
  }

  const ultimoHorario = reservation.horarios
    ?.map((h) => h.hora_fim)
    .sort()
    .pop();

  const dataFim = new Date(reservation.data_reserva);

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
    const d = new Date(dataReserva);
    if (isNaN(d.getTime())) return dataReserva;

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    let timeString = '';
    if (horarios && horarios.length > 0) {
      const start = horarios[0].hora_inicio;
      const end = horarios[horarios.length - 1].hora_fim;
      timeString = ` · ${start} — ${end}`;
    }

    return `${day}/${month}/${year}${timeString}`;
  } catch {
    return dataReserva;
  }
}
