export const UNIT_LABELS: Record<string, string> = {
  MG: 'mg',
  G: 'g',
  KG: 'kg',
  ML: 'ml',
  L: 'L',
  UN: 'unidades',
};

export interface LabOption {
  id: string;
  name: string;
  location: string;
  capacity: number;
}

export const LABORATORIES: LabOption[] = [
  {
    id: 'lab-quimica-geral',
    name: 'Lab. de Química Geral',
    location: 'Bloco B · Sala 12',
    capacity: 30,
  },
  {
    id: 'lab-quimica-organica',
    name: 'Lab. de Química Orgânica',
    location: 'Bloco B · Sala 12',
    capacity: 24,
  },
];

export type ReservationObjective = 'AULA_PRATICA' | 'PROJETO_EXTENSAO' | 'TCC' | 'PESQUISA';

export interface ObjectiveOption {
  label: string;
  value: ReservationObjective;
}

export const RESERVATION_OBJECTIVES: ObjectiveOption[] = [
  { label: 'Aula Prática', value: 'AULA_PRATICA' },
  { label: 'Projeto de Extensão', value: 'PROJETO_EXTENSAO' },
  { label: 'TCC', value: 'TCC' },
  { label: 'Pesquisa', value: 'PESQUISA' },
];

export interface TimeSlot {
  hora_inicio: string;
  hora_fim: string;
}

export const TIME_SLOTS_BY_SHIFT: Record<'Manhã' | 'Tarde' | 'Noite', TimeSlot[]> = {
  Manhã: [
    { hora_inicio: '07:30', hora_fim: '08:30' },
    { hora_inicio: '08:30', hora_fim: '09:30' },
    { hora_inicio: '09:40', hora_fim: '10:40' },
    { hora_inicio: '10:40', hora_fim: '11:40' },
  ],
  Tarde: [
    { hora_inicio: '13:30', hora_fim: '14:30' },
    { hora_inicio: '14:30', hora_fim: '15:30' },
    { hora_inicio: '15:40', hora_fim: '16:40' },
    { hora_inicio: '16:40', hora_fim: '17:40' },
  ],
  Noite: [
    { hora_inicio: '18:30', hora_fim: '19:20' },
    { hora_inicio: '19:20', hora_fim: '20:10' },
    { hora_inicio: '20:20', hora_fim: '21:10' },
    { hora_inicio: '21:10', hora_fim: '22:00' },
  ],
};
