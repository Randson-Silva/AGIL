import { Module } from '@nestjs/common';
import { BreakdownService } from './breakdown.service.js';
import { BreakdownController } from './breakdown.controller.js';
import { PrismaService } from '../db/prisma/prisma.service.js';

@Module({
  controllers: [BreakdownController],
  providers: [BreakdownService, PrismaService],
})
export class BreakdownModule {}
