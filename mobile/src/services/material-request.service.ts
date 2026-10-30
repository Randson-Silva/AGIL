import { AxiosResponse } from 'axios';
import { api } from './api';

export type MaterialRequestStatus =
  | 'PENDENTE'
  | 'APROVADA'
  | 'REJEITADA'
  | 'CANCELADA'
  | 'DEVOLVIDA';

export interface ItemSolicitacao {
  insumo_id: string;
  quantidade: number;
}

export interface MaterialRequestInsumo {
  id: string;
  nome: string;
  tipo_medida: 'MG' | 'G' | 'KG' | 'ML' | 'L' | 'UN';
  categoria: 'EQUIPAMENTO' | 'VIDRARIA' | 'SOLUCAO' | 'REAGENTE';
}

export interface MaterialRequestItemDetail {
  id: string;
  solicitacao_id: string;
  insumo_id: string;
  quantidade: number | string;
  insumo?: MaterialRequestInsumo;
}

export interface MaterialRequestSolicitante {
  id: string;
  nome: string;
  email: string;
  perfil: 'PROFESSOR' | 'ALUNO' | 'TECNICO';
}

export interface MaterialRequestResponse {
  id: string;
  solicitante_id: string;
  solicitante?: MaterialRequestSolicitante;
  finalidade: string;
  descricao?: string | null;
  status: MaterialRequestStatus;
  tecnico_id?: string | null;
  criada_em: string;
  aprovada_em?: string | null;
  data_retirada?: string | null;
  data_devolucao?: string | null;
  devolvida_em?: string | null;
  motivo_rejeicao?: string | null;
  itens: MaterialRequestItemDetail[];
}

export interface CreateMaterialRequestPayload {
  finalidade: string;
  descricao?: string;
  data_retirada?: string;
  data_devolucao?: string;
  itens: ItemSolicitacao[];
}

export interface UpdateMaterialRequestPayload {
  finalidade?: string;
  descricao?: string;
  data_retirada?: string;
  data_devolucao?: string;
  itens?: ItemSolicitacao[];
}

export interface ListMaterialRequestFilters {
  status?: MaterialRequestStatus;
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
): Promise<AxiosResponse<MaterialRequestResponse>> => {
  return api.post<MaterialRequestResponse>('/request', payload);
};

/** Lista solicitações do usuário autenticado (com filtros opcionais). */
export const listMaterialRequests = async (
  filters: ListMaterialRequestFilters = {},
): Promise<AxiosResponse<MaterialRequestResponse[]>> => {
  return api.get<MaterialRequestResponse[]>('/request', {
    params: filters,
  });
};

/** Busca uma solicitação específica pelo ID. */
export const getMaterialRequestById = async (
  id: string,
): Promise<AxiosResponse<MaterialRequestResponse>> => {
  return api.get<MaterialRequestResponse>(`/request/${id}`);
};

/** Atualiza uma solicitação pendente (apenas solicitante). */
export const updateMaterialRequest = async (
  id: string,
  payload: UpdateMaterialRequestPayload,
): Promise<AxiosResponse<MaterialRequestResponse>> => {
  return api.patch<MaterialRequestResponse>(`/request/tech/${id}`, payload);
};

/** Aprova uma solicitação pendente (apenas técnico). */
export const approveMaterialRequest = async (
  id: string,
): Promise<AxiosResponse<MaterialRequestResponse>> => {
  return api.patch<MaterialRequestResponse>(
    `/request/technician/approve/${id}`,
    {},
  );
};

/** Rejeita uma solicitação pendente (apenas técnico). */
export const rejectMaterialRequest = async (
  id: string,
  payload: RejectMaterialRequestPayload,
): Promise<AxiosResponse<MaterialRequestResponse>> => {
  return api.patch<MaterialRequestResponse>(`/request/${id}/reject`, payload);
};

/** Confirma a devolução de materiais de uma solicitação aprovada (apenas técnico). */
export const confirmMaterialReturn = async (
  id: string,
): Promise<AxiosResponse<MaterialRequestResponse>> => {
  return api.patch<MaterialRequestResponse>(
    `/request/technician/return/${id}`,
    {},
  );
};
