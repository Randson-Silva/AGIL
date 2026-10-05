import { Injectable } from '@nestjs/common';
import { PrismaService } from '../db/prisma/prisma.service.js';
import { Usuario } from '../generated/prisma/client.js';
import { UsersCreateDto } from './dto/users.create.dto.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: UsersCreateDto) {
    const { email, name, password, profile } = dto;

    await this.prisma.usuario.create({
      data: {
        email,
        nome: name,
        perfil: profile,
        senha: password,
      },
    });
  }

  async updateResetCodeAndPassword(
    userId: string,
    resetPasswordCode?: string | null,
    resetPasswordExpires?: Date | null,
    newPassword?: string,
  ) {
    const user = await this.findById(userId);

    if (!user) return null;

    await this.prisma.usuario.update({
      where: { id: userId },
      data: {
        codigoRedefinicao: resetPasswordCode,
        codigoExpiracao: resetPasswordExpires,
        senha: newPassword,
      },
    });
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    const user = await this.prisma.usuario.findUnique({
      where: { email },
    });

    if (!user) return null;

    return user;
  }

  async findById(id: string): Promise<Usuario | null> {
    const user = await this.prisma.usuario.findUnique({
      where: { id },
    });

    if (!user) return null;

    return user;
  }

  async createFromGoogle(dto: UsersCreateDto) {
    return this.prisma.usuario.create({
      data: {
        email: dto.email,
        nome: dto.name,
        senha: dto.password,
        perfil: dto.profile,
      },
    });
  }
}
