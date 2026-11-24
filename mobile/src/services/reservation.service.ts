import { ReservationObjective, TimeSlot } from '../utils/constants';
import { api } from './api';

export type ReservationStatus =
  'PENDENTE' | 'AVISO_SIMPLES' | 'APROVADA' | 'REJEITADA' | 'CANCELADA' | 'CONCLUIDA_COM_ATA';

export type DamageType = 'QUEBRA' | 'DEFEITO' | 'FALTA' | 'OUTRO';

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
  professor_responsavel?: string | null;
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
  ataUso?: UsageLog | null;
}

export interface CreateReservationPayload {
  local: string;
  data_reserva: string;
  objetivo: ReservationObjective;
  titulo: string;
  professor_responsavel?: string;
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
  professor_responsavel?: string | null;
  quantidade_alunos: number;
  quantidade_grupos: number;
  professor_nome: string;
}

export interface DamageLogPayload {
  insumo_id: string;
  descricao?: string;
  quantidade?: number;
  tipo_ocorrencia?: DamageType;
}

export interface UsageLog {
  id: string;
  reservaId: string;
  nomePratica: string;
  professorResponsavel: string;
  numeroAlunos: number;
  criadoEm: string;
  atualizadoEm: string;
  reserva?: {
    id: string;
    local: string;
    data_reserva: string;
    titulo: string;
    status: ReservationStatus;
    horarios: ReservationTimeSlot[];
    professor?: {
      id: string;
      nome: string;
      email: string;
    };
  };
}

export interface CreateUsageLogPayload {
  nomePratica: string;
  professorResponsavel: string;
  numeroAlunos: number;
  avarias?: DamageLogPayload[];
}

export interface UpdateUsageLogPayload {
  nomePratica?: string;
  professorResponsavel?: string;
  numeroAlunos?: number;
}

export const getOccupiedTimeSlots = async (
  local: string,
  date: string,
  isRecurring?: boolean,
  objetivo?: ReservationObjective,
) => {
  return api.get<TimeSlot[]>('/reservations/occupied-slots', {
    params: {
      local,
      date,
      isRecurring,
      ...(objetivo ? { objetivo } : {}),
    },
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

export const rejectReservation = async (id: string, payload: RejectReservationPayload) => {
  return api.patch<ReservationItem>(`/reservations/${id}/reject`, payload);
};

export const registerReservationAbsence = async (id: string) => {
  return api.patch<ReservationItem>(`/reservations/${id}/absence`, {});
};

export interface ReservationHistoryItem {
  id: string;
  local: string;
  titulo: string;
  objetivo: string;
  data_reserva: string;
  created_at: string;
  analisada_em?: string | null;
  status: 'APROVADA' | 'REJEITADA' | 'CANCELADA';
  motivo_rejeicao?: string | null;
  professor: {
    id: string;
    nome: string;
    email: string;
  };
  horarios: Array<{
    id: string;
    hora_inicio: string;
    hora_fim: string;
  }>;
}

export const getReservationHistory = async (params?: {
  startDate?: string;
  endDate?: string;
  status?: 'TODAS' | 'ACEITAS' | 'RECUSADAS';
  search?: string;
}) => {
  return api.get<ReservationHistoryItem[]>('/reservations/history', { params });
};

export const createUsageLog = async (reservationId: string, payload: CreateUsageLogPayload) => {
  return await api.post<UsageLog>(`/reservations/${reservationId}/usage-log`, payload);
};

export const getUsageLog = async (reservationId: string) => {
  const { data } = await api.get<UsageLog>(`/reservations/${reservationId}/usage-log`);
  return data;
};

export const listUsageLogs = async () => {
  return await api.get<UsageLog[]>('/reservations/usage-logs');
};

export const updateUsageLog = async (reservationId: string, payload: UpdateUsageLogPayload) => {
  return await api.patch<UsageLog>(`/reservations/${reservationId}/usage-log`, payload);
};

export const deleteUsageLog = async (reservationId: string) => {
  return await api.delete<{ message: string }>(`/reservations/${reservationId}/usage-log`);
};
