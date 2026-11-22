import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { TipoAvaria } from '../../generated/prisma/enums.js';

export class DamageLogDto {
  @IsUUID('4', { message: 'O material avariado selecionado é inválido.' })
  insumo_id: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsNumber({}, { message: 'A quantidade deve ser um número válido.' })
  @Min(0.001, { message: 'A quantidade deve ser maior que zero.' })
  quantidade?: number;

  @IsOptional()
  @IsEnum(TipoAvaria, { message: 'Tipo de avaria inválido.' })
  tipo_ocorrencia?: TipoAvaria;
}

export class CreateUsageLogDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome da prática é obrigatório.' })
  nomePratica: string;

  @IsString()
  @IsNotEmpty({ message: 'O nome do professor responsável é obrigatório.' })
  professorResponsavel: string;

  @IsInt({ message: 'O número de alunos deve ser um número inteiro.' })
  @Min(0, { message: 'O número de alunos não pode ser negativo.' })
  numeroAlunos: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DamageLogDto)
  avarias?: DamageLogDto[];
}
