import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Role } from '../authz/roles.js';
import { UsersService } from '../users/users.service.js';
import { AuthLoginDto } from './dtos/auth.login.dto.js';
import { AuthRegisterDto } from './dtos/auth.register.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(createUserDto: AuthRegisterDto) {
    const alreadyExists = await this.usersService.findByEmail(
      createUserDto.email,
    );

    if (!!alreadyExists)
      throw new HttpException(
        'Já existe um usuário com este email',
        HttpStatus.BAD_REQUEST,
      );

    const { name } = createUserDto;

    if (name.trim().split(/\s+/).length < 2) {
      return new HttpException('O campo deve conter nome e sobrenome', 400);
    }

    const salt = 10;
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    const newUser = {
      ...createUserDto,
      password: hashedPassword,
    };

    return this.usersService.create(newUser);
  }

  async validateUser(email: string, pass: string, profile: Role) {
    const user = await this.usersService.findByEmail(email);

    if (!user) return null;

    const isProfileCorrect = user.perfil === profile;

    if (!isProfileCorrect) return null;

    const hashComparison = await bcrypt.compare(pass, user.senha);

    if (!hashComparison) {
      return null;
    }

    const { senha, ...result } = user;
    return result;
  }

  async login(loginDto: AuthLoginDto) {
    const user = await this.validateUser(
      loginDto.email,
      loginDto.password,
      loginDto.profile,
    );

    if (!user) return null;

    const payload = { email: user.email, sub: user.id, role: user.perfil };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        profile: user.perfil,
      },
    };
  }
}
