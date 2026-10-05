import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  MinLength,
} from 'class-validator';

export class ResetPasswordDto {
  @IsEmail({}, { message: 'Forneça um e-mail válido' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @Length(5, 5, { message: 'O código deve ter exatamente 5 dígitos' })
  code: string;

  @IsString()
  @MinLength(6, { message: 'A nova senha deve ter no mínimo 6 caracteres' })
  newPassword: string;
}
