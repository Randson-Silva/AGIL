export interface FichaCargoEfetivo {
  nome?: string;
  uorgLotacao?: string;
  uorgExercicio?: string;
  cargo?: string;
  situacaoServidor?: string;
  jornadaTrabalho?: string;
}

export interface PessoaTransparencia {
  id?: number;
  nome?: string;
  cpfFormatado?: string;
}

export interface ServidorInfo {
  id?: number;
  situacao?: string; // ex: "Ativo"
  tipoServidor?: string; // ex: "Civil"
  pessoa?: PessoaTransparencia;
}

export interface ServidorTransparencia {
  servidor?: ServidorInfo;
  fichasCargoEfetivo?: FichaCargoEfetivo[];
  fichasFuncao?: any[];
}

export interface ResultadoValidacaoServidor {
  encontrado: boolean;
  pertenceAoCampusQuixada: boolean;
  nome?: string;
  isDocente?: boolean;
  cargo?: string;
  uorgLotacao?: string;
}
