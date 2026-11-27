import { ProfessorOption } from '@/components/student/ProfessorSelect';
import { api } from './api';

export async function getProfessors(search = ''): Promise<ProfessorOption[]> {
  const { data } = await api.get<ProfessorOption[]>('/users/professors', {
    params: search.trim() ? { search: search.trim() } : undefined,
  });
  return data;
}
