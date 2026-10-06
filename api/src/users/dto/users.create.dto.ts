import { IsDefined, IsString } from 'class-validator';
import { AuthRegisterDto } from '../../auth/dtos/auth.register.dto.js';
import { type Role } from '../../authz/roles.js';

export class UsersCreateDto extends AuthRegisterDto {
  @IsString()
  @IsDefined()
  profile: Role;
}
