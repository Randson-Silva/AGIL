import { IsOptional, IsEnum, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { StatusAlerta, StatusInsumo, CategoriaInsumo, NaturezaPatrimonial } from '../../generated/prisma/client.js';

export class ListAlertsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsEnum(StatusAlerta)
  status?: StatusAlerta;

  @IsOptional()
  @IsString()
  nomeInsumo?: string;
}

export class ListInsumosDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  nome?: string;

  @IsOptional()
  @IsEnum(CategoriaInsumo)
  categoria?: CategoriaInsumo;

  @IsOptional()
  @IsEnum(StatusInsumo)
  statusInsumo?: StatusInsumo;

  @IsOptional()
  @IsEnum(NaturezaPatrimonial)
  natureza_patrimonial?: NaturezaPatrimonial;

  @IsOptional()
  @IsString()
  formula?: string;
}
