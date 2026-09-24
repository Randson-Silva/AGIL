import { IsNotEmpty, IsString, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ItemSolicitacaoDto } from './item-solicitacao.dto.js';

export class CreateRequestDto {
  @IsNotEmpty({ message: 'A finalidade da solicitação é obrigatória (ex: nome da disciplina)' })
  @IsString()
  finalidade: string;

  @IsOptional()
  @IsString()
  descricao?: string; // Alterei para opcional, já que vamos usar os itens estruturados

  @IsNotEmpty({ message: 'A lista de itens é obrigatória' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemSolicitacaoDto)
  itens: ItemSolicitacaoDto[];
}
