import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { type Role } from '../../authz/roles.js';

export class AuthRegisterDto {
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'O email é obrigatório' })
  @IsEmail({
    allow_underscores: true,
  })
  email: string;

  @IsNotEmpty({ message: 'A senha é obrigatória' })
  @IsStrongPassword()
  password: string;

  // @IsNotEmpty()
  // @IsString()
  // profile: Role;
}
