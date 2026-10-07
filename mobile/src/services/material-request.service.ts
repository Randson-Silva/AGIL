import { AxiosResponse } from 'axios';
import { api } from './api';

export interface ItemSolicitacao {
  insumo_id: string;
  quantidade: number;
}

export interface CreateMaterialRequestPayload {
  finalidade: string;
  descricao?: string;
  itens: ItemSolicitacao[];
}

export interface UpdateMaterialRequestPayload {
  finalidade?: string;
  descricao?: string;
  itens?: ItemSolicitacao[];
}

export interface ListMaterialRequestFilters {
  status?: 'PENDENTE' | 'APROVADA' | 'REJEITADA' | 'CANCELADA';
  data_inicio?: string;
  data_fim?: string;
  ordem?: 'asc' | 'desc';
}

export interface RejectMaterialRequestPayload {
  motivo_rejeicao: string;
}

/** Cria uma nova solicitação de materiais. */
export const createMaterialRequest = async (
  payload: CreateMaterialRequestPayload,
): Promise<AxiosResponse> => {
  return api.post('/request', payload);
};

/** Lista solicitações do usuário autenticado (com filtros opcionais). */
export const listMaterialRequests = async (
  filters: ListMaterialRequestFilters = {},
): Promise<AxiosResponse> => {
  return api.get('/request', {
    params: filters,
  });
};

/** Busca uma solicitação específica pelo ID. */
export const getMaterialRequestById = async (id: string): Promise<AxiosResponse> => {
  return api.get(`/request/${id}`);
};

/** Atualiza uma solicitação pendente (apenas solicitante). */
export const updateMaterialRequest = async (
  id: string,
  payload: UpdateMaterialRequestPayload,
): Promise<AxiosResponse> => {
  return api.patch(`/request/tech/${id}`, payload);
};

/** Aprova uma solicitação pendente (apenas técnico). */
export const approveMaterialRequest = async (id: string): Promise<AxiosResponse> => {
  return api.patch(`/request/technician/approve/${id}`, {});
};

/** Rejeita uma solicitação pendente (apenas técnico). */
export const rejectMaterialRequest = async (
  id: string,
  payload: RejectMaterialRequestPayload,
): Promise<AxiosResponse> => {
  return api.patch(`/request/${id}/reject`, payload);
};
