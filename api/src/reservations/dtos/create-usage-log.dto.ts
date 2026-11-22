import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateUsageLogDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome da prática é obrigatório.' })
  nomePratica: string;

  @IsString()
  @IsNotEmpty({ message: 'O nome do professor responsável é obrigatório.' })
  professorResponsavel: string;

  @IsInt({ message: 'O número de alunos deve ser um número inteiro.' })
  @Min(0, { message: 'O número de alunos não pode ser negativo.' })
  numeroAlunos: number;
}
