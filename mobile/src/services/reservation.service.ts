import { api } from './api';
import { ReservationObjective, TimeSlot } from '../utils/constants';

export type ReservationStatus =
  | 'PENDENTE'
  | 'AVISO_SIMPLES'
  | 'APROVADA'
  | 'REJEITADA'
  | 'CANCELADA';

export interface ReservationUser {
  id: string;
  nome: string;
  email: string;
  perfil?: 'PROFESSOR' | 'ALUNO' | 'TECNICO';
}

export interface ReservationTimeSlot extends TimeSlot {
  id?: string;
  reserva_id?: string;
}

export interface ReservationItem {
  id: string;
  professor_id: string;
  professor: ReservationUser;
  local: string;
  data_reserva: string;
  dia_semana: number;
  objetivo: ReservationObjective;
  titulo: string;
  quantidade_alunos: number;
  quantidade_grupos: number;
  observacoes?: string | null;
  pratica_recorrente: boolean;
  status: ReservationStatus;
  motivo_rejeicao?: string | null;
  horarios: ReservationTimeSlot[];
  created_at: string;
  prioridade_maxima?: boolean;
  alerta_conflito_remanejamento?: boolean;
}

export interface CreateReservationPayload {
  local: string;
  data_reserva: string;
  objetivo: ReservationObjective;
  titulo: string;
  quantidade_alunos?: number;
  quantidade_grupos?: number;
  observacoes?: string;
  pratica_recorrente: boolean;
  horarios: TimeSlot[];
}

export interface RejectReservationPayload {
  motivo_rejeicao: string;
}

export interface OccupiedSlotDetail {
  local: string;
  hora_inicio: string;
  hora_fim: string;
  status: ReservationStatus;
  objetivo: ReservationObjective;
  titulo: string;
  quantidade_alunos: number;
  quantidade_grupos: number;
  professor_nome: string;
}

export const getOccupiedTimeSlots = async (
  local: string,
  date: string,
  isRecurring?: boolean,
) => {
  return api.get<TimeSlot[]>('/reservations/occupied-slots', {
    params: { local, date, isRecurring },
  });
};

export const getDailyAvailability = async (date: string, local?: string) => {
  return api.get<OccupiedSlotDetail[]>('/reservations/availability', {
    params: { date, local },
  });
};

export const createReservation = async (payload: CreateReservationPayload) => {
  return api.post<ReservationItem>('/reservations', payload);
};

export const getReservations = async () => {
  return api.get<ReservationItem[]>('/reservations');
};

export const approveReservation = async (id: string) => {
  return api.patch<ReservationItem>(`/reservations/${id}/approve`, {});
};

export const rejectReservation = async (
  id: string,
  payload: RejectReservationPayload,
) => {
  return api.patch<ReservationItem>(`/reservations/${id}/reject`, payload);
};

export const registerReservationAbsence = async (id: string) => {
  return api.patch<ReservationItem>(`/reservations/${id}/absence`, {});
};
