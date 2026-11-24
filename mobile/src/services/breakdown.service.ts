import { api } from './api';

export type BreakdownOccurrenceType = 'QUEBRA' | 'DEFEITO' | 'CONTAMINACAO' | 'EXTRAVIO' | 'OUTRO';

export interface CreateBreakdownPayload {
  insumo_id: string;
  ata_uso_id?: string;
  quantidade: number;
  tipo_ocorrencia: BreakdownOccurrenceType;
  descricao?: string;
}

export const createBreakdown = async (payload: CreateBreakdownPayload) => {
  return api.post('/breakdowns', payload);
};

export const getBreakdowns = async () => {
  return api.get('/breakdowns');
};

export const getEligibleBreakdownMaterials = async () => {
  return api.get('/breakdowns/eligible-materials');
};

export interface MyBreakdownHistoryItem {
  id: string;
  usuario_id: string;
  insumo_id: string;
  ata_uso_id?: string | null;
  quantidade: number | string;
  tipo_ocorrencia: BreakdownOccurrenceType;
  descricao?: string | null;
  foto_url?: string | null;
  data_reporte: string;
  insumo: {
    id: string;
    nome: string;
    categoria: string;
    tipo_medida: string;
    localizacao?: string | null;
  };
  usuario: {
    id: string;
    nome: string;
    email: string;
  };
}

export interface MyBreakdownHistoryResponse {
  hasAnyHistory: boolean;
  items: MyBreakdownHistoryItem[];
}

export const getMyBreakdownHistory = async (params?: {
  startDate?: string;
  endDate?: string;
  search?: string;
}) => {
  return api.get<MyBreakdownHistoryResponse>('/breakdowns/my-history', {
    params,
  });
};
