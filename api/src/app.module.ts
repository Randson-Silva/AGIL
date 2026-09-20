import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AuthModule } from './auth/auth.module.js';
import { PrismaService } from './db/prisma/prisma.service.js';
import { InventoryModule } from './inventory/inventory.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';
import { ReservationsModule } from './reservations/reservations.module.js';
import { InventoryController } from './inventory/inventory.controller.js';
import { InventoryService } from './inventory/services/create-insumo.service.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    ReservationsModule,
    InventoryModule,
    NotificationsModule,
  ],
  controllers: [AppController, InventoryController],
  providers: [InventoryService, PrismaService],
})
export class AppModule {}
