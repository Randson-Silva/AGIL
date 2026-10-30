import { api } from './api';

export interface CreateBreakdownPayload {
  insumo_id: string;
  quantidade: number;
  tipo_ocorrencia: 'QUEBRA' | 'DEFEITO' | 'CONTAMINACAO' | 'EXTRAVIO' | 'OUTRO';
  descricao?: string;
}

export const createBreakdown = async (payload: CreateBreakdownPayload) => {
  return api.post('/breakdowns', payload);
};
