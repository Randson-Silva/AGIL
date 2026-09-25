import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  CategoriaInsumo,
  MedidasEntidades,
} from '../../generated/prisma/enums.js';

export class BaseInputDto {
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @IsString()
  nome: string;

  @IsNotEmpty({ message: 'Categoria é obrigatória' })
  @IsEnum(CategoriaInsumo, { message: 'Categoria inválida' })
  categoria: CategoriaInsumo;

  @IsNotEmpty({ message: 'Tipo de medida é obrigatório' })
  @IsEnum(MedidasEntidades, { message: 'Tipo de medida inválido' })
  tipo_medida: MedidasEntidades;

  @IsNotEmpty({ message: 'Quantidade em saldo é obrigatória' })
  @IsNumber()
  @Min(1, { message: 'Quantidade em saldo deve ser maior que zero' })
  quantidade_saldo: number;

  @IsNotEmpty({ message: 'Data de validade é obrigatória' })
  @Type(() => Date)
  @IsDate({ message: 'Deve ser uma data válida' })
  data_validade: Date;

  @IsOptional()
  @IsString()
  localizacao?: string;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Quantidade mínima não pode ser negativa' })
  quantidade_minima?: number;
}

export class CreateReagentDto extends BaseInputDto {
  @IsOptional() @IsString() formula?: string;
  @IsOptional() @IsString() cas?: string;
  @IsOptional() @IsString() marca?: string;
  @IsOptional() @IsString() observacao?: string;
}

export class CreateSolutionDto extends BaseInputDto {
  @IsOptional() @IsString() formula?: string;
  @IsOptional() @IsString() cas?: string;
  @IsOptional() @IsString() observacao?: string;
}

export class CreateEquipmentDto extends BaseInputDto {
  @IsOptional() @IsString() marca?: string;
  @IsOptional() @IsString() modelo?: string;
  @IsOptional() @IsString() voltagem?: string;
}

export class CreateGlasswareDto extends BaseInputDto {
  @IsOptional() @IsString() marca?: string;
  @IsOptional() @IsString() capacidade?: string;
}
