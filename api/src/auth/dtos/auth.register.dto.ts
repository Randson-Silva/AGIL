import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class AuthRegisterDto {
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'O email é obrigatório' })
  @IsEmail({
    allow_underscores: true,
    host_whitelist: ['ifce.edu.br', 'aluno.ifce.edu.br'],
  })
  email: string;

  @IsNotEmpty({ message: 'A senha é obrigatória' })
  @IsStrongPassword()
  password: string;

  @IsNotEmpty()
  @IsString()
  profile: 'ALUNO' | 'TECNICO' | 'PROFESSOR';
}
