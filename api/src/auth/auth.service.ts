import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { Role } from '../authz/roles.js';
import { TransparenciaService } from '../users/pt/pt.service.js';
import { hasRightRoleAndEmail } from '../users/user.utils.js';
import { UsersService } from '../users/users.service.js';
import { compare, emailDomainsConfiguration, hash } from './auth.utils.js';
import { AuthLoginDto } from './dtos/auth.login.dto.js';
import { AuthRegisterDto } from './dtos/auth.register.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly transparenciaService: TransparenciaService,
    private readonly configService: ConfigService,
  ) {}

  async validateGoogleUser(googleUser: {
    email: string;
    firstName: string;
    lastName: string;
  }) {
    let user = await this.usersService.findByEmail(googleUser.email);

    if (!user) {
      /*
      ! remover
      ? use: Giselle Raulino para PROFESSOR
      ? use: Alisson Handel para TECNICO
      - ambos dados públicos de servidores e futuros usuários do sistema
      * autorizado conforme necessidade de testes do sistema
      */
      const fullName =
        this.configService.get('NODE_ENV') !== 'production'
          ? 'Giselle Raulino'
          : `${googleUser.firstName} ${googleUser.lastName}`.trim();

      const profile = await this.resolveRoleFromGoogleAccount(
        googleUser.email,
        fullName,
      );

      const password = await hash(randomUUID());

      user = await this.usersService.createFromGoogle({
        email: googleUser.email,
        name: fullName,
        password,
        profile,
      });
    }

    const payload = { sub: user.id, email: user.email, role: user.perfil };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        profile: user.perfil,
      },
    };
  }

  async register(createUserDto: AuthRegisterDto) {
    const verification = hasRightRoleAndEmail(
      createUserDto.profile,
      createUserDto.email,
      this.configService,
    );

    if (!verification)
      throw new BadRequestException('Tipo de email e perfil não conferem');

    const alreadyExists = await this.usersService.findByEmail(
      createUserDto.email,
    );

    if (alreadyExists)
      throw new BadRequestException('Já existe um usuário com este email');

    const { name } = createUserDto;

    if (name.trim().split(/\s+/).length < 2) {
      throw new BadRequestException('O campo deve conter nome e sobrenome');
    }

    const hashedPassword = await hash(createUserDto.password);

    const newUser = {
      ...createUserDto,
      password: hashedPassword,
    };

    return this.usersService.create(newUser);
  }

  async validateUser(email: string, pass: string, profile: Role) {
    const validationCommonError = new BadRequestException(
      'Email, senha ou perfil incorreto(s)',
    );

    const user = await this.usersService.findByEmail(email);

    if (!user) throw validationCommonError;

    const isProfileCorrect = user.perfil === profile;

    if (!isProfileCorrect) throw validationCommonError;

    const hashComparison = await compare(pass, user.senha);

    if (!hashComparison) {
      throw validationCommonError;
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

    if (!user) throw new NotFoundException('Email ou senha inválidos');

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

  private async resolveRoleFromGoogleAccount(
    email: string,
    fullName: string,
  ): Promise<Role> {
    const { studentDomain, teacherAndTechDomain } = emailDomainsConfiguration(
      this.configService,
    );

    if (email.endsWith(studentDomain)) {
      return 'ALUNO' as Role;
    }

    if (email.endsWith(teacherAndTechDomain)) {
      const validacao =
        await this.transparenciaService.validateQuixadaPublicServant(fullName);

      if (!validacao.pertenceAoCampusQuixada) {
        throw new UnauthorizedException(
          'Acesso negado: Servidor não localizado no Campus Quixadá pelo Portal da Transparência.',
        );
      }

      return (validacao.isDocente ? 'PROFESSOR' : 'TECNICO') as Role;
    }

    throw new UnauthorizedException(
      'Utilize uma conta institucional do IFCE para acessar o sistema.',
    );
  }
}
