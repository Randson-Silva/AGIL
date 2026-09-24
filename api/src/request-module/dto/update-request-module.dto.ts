import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ItemSolicitacaoDto } from './item-solicitacao.dto.js';

// Como o enum pode não estar exportado no generated se o prisma generate estiver desatualizado,
// usamos um union type temporário que reflete o banco, ou podemos importar se atualizado.
export enum StatusSolicitacaoEnum {
  PENDENTE = 'PENDENTE',
  APROVADA = 'APROVADA',
  REJEITADA = 'REJEITADA',
  CANCELADA = 'CANCELADA'
}

export class UpdateRequestDto {
  @IsOptional()
  @IsString()
  finalidade?: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemSolicitacaoDto)
  itens?: ItemSolicitacaoDto[];
}
