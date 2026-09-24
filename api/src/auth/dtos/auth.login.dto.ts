import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AuthLoginDto {
  @IsNotEmpty({ message: 'O email é obrigatório' })
  @IsEmail({ allow_underscores: true })
  email: string;

  @IsNotEmpty({ message: 'A senha é obrigatória' })
  @IsString()
  password: string;
}
