import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ItemSolicitacaoDto } from './item-solicitacao.dto.js';

export enum StatusSolicitacaoEnum {
  PENDENTE = 'PENDENTE',
  APROVADA = 'APROVADA',
  REJEITADA = 'REJEITADA',
  CANCELADA = 'CANCELADA',
  DEVOLVIDA = 'DEVOLVIDA',
}

export class UpdateRequestDto {
  @IsOptional()
  @IsString()
  finalidade?: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'A data de retirada deve ser uma data válida.' },
  )
  data_retirada?: string;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'A data de devolução deve ser uma data válida.' },
  )
  data_devolucao?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemSolicitacaoDto)
  itens?: ItemSolicitacaoDto[];
}
