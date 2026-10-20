import { api } from './api';
import { ReservationObjective, TimeSlot } from '../utils/constants';

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

export interface OccupiedSlotDetail {
  local: string;
  hora_inicio: string;
  hora_fim: string;
  status: 'PENDENTE' | 'AVISO_SIMPLES' | 'APROVADA' | 'REJEITADA' | 'CANCELADA';
  objetivo: ReservationObjective;
  titulo: string;
  quantidade_alunos: number;
  quantidade_grupos: number;
  professor_nome: string;
}

export const getOccupiedTimeSlots = async (local: string, date: string, isRecurring?: boolean) => {
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
  return api.post('/reservations', payload);
};

export const getReservations = async () => {
  return api.get('/reservations');
};
