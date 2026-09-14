import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './db/prisma/prisma.service.js';

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('test-db')
  async testConnection() {
    try {
      const usersCount = await this.prisma.usuario.count();

      return {
        status: 'Success',
        message: 'The API is connected on PostgreSQL!',
        usuariosNoBanco: usersCount,
      };
    } catch (error: any) {
      return {
        status: 'Error',
        message: 'The connection has failed trying to fetch database.',
        detalhe: error.message,
      };
    }
  }
}
