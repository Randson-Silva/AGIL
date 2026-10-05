import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { ObjetivoReserva } from '../../generated/prisma/client.js';

export class TimeSlotDto {
  @IsString()
  @IsNotEmpty({ message: 'A hora de início é obrigatória.' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'A hora de início deve estar no formato HH:MM.',
  })
  hora_inicio: string;

  @IsString()
  @IsNotEmpty({ message: 'A hora de término é obrigatória.' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'A hora de término deve estar no formato HH:MM.',
  })
  hora_fim: string;
}

export class CreateReservationDto {
  @IsString()
  @IsNotEmpty({ message: 'O laboratório é obrigatório.' })
  local: string;

  @IsDateString({}, { message: 'Insira uma data válida para a reserva.' })
  data_reserva: string;

  @IsEnum(ObjetivoReserva, {
    message: 'Selecione um objetivo válido para a reserva.',
  })
  objetivo: ObjetivoReserva;

  @IsString()
  @IsNotEmpty({ message: 'O título da prática é obrigatório.' })
  titulo: string;

  @ValidateIf(
    (o: CreateReservationDto) => o.objetivo === ObjetivoReserva.AULA_PRATICA,
  )
  @IsInt({ message: 'A quantidade de alunos deve ser um número inteiro.' })
  @Min(1, {
    message: 'A reserva para aula prática deve ter pelo menos 1 aluno.',
  })
  quantidade_alunos?: number;

  @IsOptional()
  @IsString()
  observacoes?: string;

  @IsOptional()
  @IsBoolean()
  pratica_recorrente?: boolean;

  @IsArray({ message: 'Os horários devem ser enviados em formato de lista.' })
  @ArrayMinSize(1, {
    message: 'Selecione pelo menos um horário para a reserva.',
  })
  @ValidateNested({ each: true })
  @Type(() => TimeSlotDto)
  horarios: TimeSlotDto[];
}
