import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { ObjetivoReserva } from '../../generated/prisma/enums.js';
import { ItemSolicitacaoDto } from './item-solicitacao.dto.js';

export class CreateRequestDto {
  @IsOptional()
  @IsEnum(ObjetivoReserva, { message: 'Objetivo inválido.' })
  objetivo?: ObjetivoReserva;

  @IsOptional()
  @IsString()
  finalidade?: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsDateString({}, { message: 'A data de retirada deve ser uma data válida.' })
  data_retirada?: string;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'A data de devolução deve ser uma data válida.' },
  )
  data_devolucao?: string;

  @IsNotEmpty({ message: 'A lista de itens é obrigatória' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemSolicitacaoDto)
  itens: ItemSolicitacaoDto[];

  @IsOptional()
  @IsUUID('all', { message: 'Professor responsável inválido.' })
  professor_id?: string | null;
}
