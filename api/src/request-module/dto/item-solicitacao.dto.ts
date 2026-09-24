import { IsNotEmpty, IsNumber, IsString, IsUUID, Min } from 'class-validator';

export class ItemSolicitacaoDto {
  @IsNotEmpty({ message: 'O ID do insumo é obrigatório' })
  @IsUUID('4', { message: 'O ID do insumo deve ser um UUID válido' })
  @IsString()
  insumo_id: string;

  @IsNotEmpty({ message: 'A quantidade é obrigatória' })
  @IsNumber({}, { message: 'A quantidade deve ser um número' })
  @Min(0.001, { message: 'A quantidade deve ser maior que zero' })
  quantidade: number;
}
