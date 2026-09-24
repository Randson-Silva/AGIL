import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteRequestDto {
  @IsNotEmpty({ message: 'O motivo da rejeição/cancelamento é obrigatório' })
  @IsString()
  motivo_rejeicao: string;
}
