import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyCodeDto {
  @IsEmail({}, { message: 'Forneça um e-mail válido' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @Length(5, 5, { message: 'O código deve ter exatamente 5 dígitos' })
  code: string;
}
