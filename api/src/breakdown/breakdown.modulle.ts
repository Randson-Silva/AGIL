import { Module } from '@nestjs/common';
import { BreakdownService } from './breakdown.service.js';
import { BreakdownController } from './breakdown.controller.js';
import { PrismaModule } from '../db/prisma/prisma.module.js';
import { MailModule } from '../mail/mail.module.js';

@Module({
  imports: [PrismaModule, MailModule],
  controllers: [BreakdownController],
  providers: [BreakdownService],
})
export class BreakdownModule {}
