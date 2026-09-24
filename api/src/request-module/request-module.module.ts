import { Module } from '@nestjs/common';
import { RequestModuleService } from './request-module.service.js';
import { RequestModuleController } from './request-module.controller.js';
import { InventoryModule } from '../inventory/inventory.module.js';
import { PrismaModule } from '../db/prisma/prisma.module.js'; 
@Module({
  imports: [InventoryModule, PrismaModule],
  controllers: [RequestModuleController],
  providers: [RequestModuleService],
})
export class RequestModuleModule {}
