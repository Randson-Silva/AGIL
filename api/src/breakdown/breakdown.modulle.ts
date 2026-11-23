import { Module } from '@nestjs/common';
import { PrismaModule } from '../db/prisma/prisma.module.js';
import { MailModule } from '../mail/mail.module.js';
import { BreakdownController } from './breakdown.controller.js';
import { BreakdownService } from './breakdown.service.js';

@Module({
  imports: [PrismaModule, MailModule],
  controllers: [BreakdownController],
  providers: [BreakdownService],
  exports: [BreakdownService],
})
export class BreakdownModule {}
