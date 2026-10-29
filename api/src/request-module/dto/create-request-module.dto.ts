import {
  IsNotEmpty,
  IsString,
  IsArray,
  ValidateNested,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ItemSolicitacaoDto } from './item-solicitacao.dto.js';

export class CreateRequestDto {
  @IsNotEmpty({
    message:
      'A finalidade da solicitação é obrigatória (ex: nome da disciplina)',
  })
  @IsString()
  finalidade: string;

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

  @IsNotEmpty({ message: 'A lista de itens é obrigatória' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemSolicitacaoDto)
  itens: ItemSolicitacaoDto[];
}
