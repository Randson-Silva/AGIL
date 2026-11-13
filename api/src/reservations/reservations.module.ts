import { Module } from '@nestjs/common';
import { PrismaModule } from '../db/prisma/prisma.module.js';
import { MailModule } from '../mail/mail.module.js';
import { ReservationsController } from './reservations.controller.js';
import { ReservationsService } from './reservations.service.js';

@Module({
  imports: [PrismaModule, MailModule],
  controllers: [ReservationsController],
  providers: [ReservationsService],
  exports: [ReservationsService],
})
export class ReservationsModule {}
