import { api } from './api';
import { ReservationObjective, TimeSlot } from '../utils/constants';

export interface CreateReservationPayload {
  local: string;
  data_reserva: string;
  objetivo: ReservationObjective;
  titulo: string;
  quantidade_alunos: number;
  observacoes?: string;
  pratica_recorrente: boolean;
  horarios: TimeSlot[];
}

export const getOccupiedTimeSlots = async (local: string, date: string) => {
  return api.get<TimeSlot[]>('/reservations/occupied-slots', {
    params: { local, date },
  });
};

export const createReservation = async (payload: CreateReservationPayload) => {
  return api.post('/reservations', payload);
};

export const getReservations = async () => {
  return api.get('/reservations');
};
