import { IsEnum, IsOptional, IsString } from 'class-validator';
import { StatusSolicitacaoEnum } from './update-request-module.dto.js';

export class ListRequestDto {
  @IsOptional()
  @IsEnum(StatusSolicitacaoEnum, { message: 'Status de filtro inválido' })
  status?: StatusSolicitacaoEnum;

  // Filtros adicionais úteis para o usuário
  @IsOptional()
  @IsString()
  data_inicio?: string;

  @IsOptional()
  @IsString()
  data_fim?: string;
}
