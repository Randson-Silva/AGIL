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
  @IsNotEmpty({ message: 'Name is required' })
  @IsString()
  nome: string;

  @IsNotEmpty({ message: 'Category is required' })
  @IsEnum(CategoriaInsumo, { message: 'Invalid category' })
  categoria: CategoriaInsumo;

  @IsNotEmpty({ message: 'Measurement unit is required' })
  @IsEnum(MedidasEntidades, { message: 'Invalid measurement unit' })
  tipo_medida: MedidasEntidades;

  @IsNotEmpty({ message: 'Quantity is required' })
  @IsNumber()
  @Min(1, { message: 'Quantity must be greater than zero' })
  quantidade_saldo: number;

  @IsNotEmpty({ message: 'Expiration date is required' })
  @Type(() => Date)
  @IsDate({ message: 'Must be a valid date' })
  data_validade: Date;

  @IsOptional()
  @IsString()
  localizacao?: string;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Min quantity cannot be negative' })
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
