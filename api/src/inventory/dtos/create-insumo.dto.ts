import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

import { CategoriaInsumo } from '../../generated/prisma/enums.js';

export class CreateInsumoDto {
  @IsNotEmpty({ message: 'O nome do item é obrigatório' })
  @IsString()
  nome: string;

  @IsNotEmpty({ message: 'A categoria é obrigatória' })
  @IsEnum(CategoriaInsumo, { message: 'Categoria inválida' })
  categoria: CategoriaInsumo;

  @IsNotEmpty({ message: 'A quantidade é obrigatória' })
  @IsNumber()
  @Min(1, { message: 'A quantidade deve ser maior que zero' })
  quantidade_saldo: number;

  @IsOptional()
  @IsString()
  localizacao?: string;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'A quantidade mínima não pode ser negativa' })
  quantidade_minima?: number;

  // Reagente e Solução
  @IsOptional()
  @IsString()
  formula?: string;

  @IsOptional()
  @IsString()
  cas?: string;

  @IsOptional()
  @IsString()
  marca?: string;

  @IsOptional()
  @IsString()
  observacao?: string;

  // Equipamento
  @IsOptional()
  @IsString()
  modelo?: string;

  @IsOptional()
  @IsString()
  voltagem?: string;

  // Vidraria
  @IsOptional()
  @IsString()
  capacidade?: string;
}