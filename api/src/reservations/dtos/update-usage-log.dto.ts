import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { TipoOcorrenciaAta } from '../../generated/prisma/enums.js';

export class UpdateUsageLogDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'O nome da prática não pode ser vazio.' })
  nomePratica?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({
    message: 'O nome do professor responsável não pode ser vazio.',
  })
  professorResponsavel?: string;

  @IsOptional()
  @IsInt({ message: 'O número de alunos deve ser um número inteiro.' })
  @Min(0, { message: 'O número de alunos não pode ser negativo.' })
  numeroAlunos?: number;

  @IsOptional()
  @IsEnum(TipoOcorrenciaAta, { message: 'Tipo de ocorrência inválido.' })
  ocorrencia?: TipoOcorrenciaAta;

  @IsOptional()
  @IsString()
  relatoAula?: string;

  @IsOptional()
  @IsString()
  pendenciasTecnico?: string;
}
