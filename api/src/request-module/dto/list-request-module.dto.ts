import { IsEnum, IsOptional, IsString } from 'class-validator';
import { StatusSolicitacaoEnum } from './update-request-module.dto.js';

export enum OrderEnum {
  ASC = 'asc',
  DESC = 'desc',
}

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

  @IsOptional()
  @IsEnum(OrderEnum, {
    message: 'A ordem deve ser asc ou desc',
  })
  ordem?: OrderEnum;
}
