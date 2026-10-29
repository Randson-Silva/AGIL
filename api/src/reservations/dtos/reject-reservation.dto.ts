import { IsNotEmpty, IsString } from 'class-validator';

export class RejectReservationDto {
  @IsNotEmpty({ message: 'O motivo da rejeição é obrigatório.' })
  @IsString()
  motivo_rejeicao: string;
}
