import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

import { CategoriaInsumo} from '../../generated/prisma/enums.js';
import { MedidasEntidades } from '../../generated/prisma/enums.js';
import { Type } from 'class-transformer';

export class CreateInsumoDto {
  @IsNotEmpty({ message: 'O nome do item é obrigatório' })
  @IsString()
  nome: string;

  @IsNotEmpty({ message: 'A categoria é obrigatória' })
  @IsEnum(CategoriaInsumo, { message: 'Categoria inválida' })
  categoria: CategoriaInsumo;

  @IsNotEmpty({ message: 'O tipo de medida é obrigatório' })
  @IsEnum(MedidasEntidades, { message: 'Tipo de medida inválido' })
  tipo_medida: MedidasEntidades;

  @IsNotEmpty({ message: 'A quantidade é obrigatória' })
  @IsNumber()
  @Min(1, { message: 'A quantidade deve ser maior que zero' })
  quantidade_saldo: number;

  @IsNotEmpty({ message: 'A validade é obrigatória' })
  @Type(() => Date)
  @IsDate({ message: 'A validade deve ser uma data válida' })
  data_validade: Date;

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