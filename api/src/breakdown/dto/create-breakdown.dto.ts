import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { TipoAvaria } from '../../generated/prisma/enums.js';

export class CreateBreakdownDto {
  @IsNotEmpty({ message: 'O material avariado deve ser informado.' })
  @IsUUID('all', { message: 'ID do insumo inválido.' })
  insumo_id: string;

  @IsNotEmpty({ message: 'A quantidade avariada é obrigatória.' })
  @IsNumber({}, { message: 'A quantidade deve ser um número.' })
  @Min(0.001, { message: 'A quantidade avariada deve ser maior que zero.' })
  quantidade: number;

  @IsNotEmpty({ message: 'O tipo de ocorrência é obrigatório.' })
  @IsEnum(TipoAvaria, { message: 'Tipo de ocorrência inválido.' })
  tipo_ocorrencia: TipoAvaria;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsUUID('all', { message: 'O ID da ata de uso é inválido.' })
  ata_uso_id?: string;
}
