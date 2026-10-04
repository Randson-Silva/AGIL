import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { PrismaModule } from '../db/prisma/prisma.module.js';
import { TransparenciaService } from './pt/pt.service.js';
import { UsersService } from './users.service.js';

@Module({
  imports: [PrismaModule, HttpModule],
  providers: [UsersService, TransparenciaService],
  exports: [UsersService, TransparenciaService],
})
export class UsersModule {}
