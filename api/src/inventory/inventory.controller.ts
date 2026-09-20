import { Body, Controller, Get, Post } from '@nestjs/common';
import { InventoryService } from './inventory.service.js';
import { CreateInsumoDto } from './dtos/create-insumo.dto.js';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('insumos')
  async criarInsumo(@Body() data: CreateInsumoDto) {
    return this.inventoryService.criarInsumo(data);
  }

  @Get('insumos')
  async listarInsumos() {
    return this.inventoryService.listarInsumos();
  }
}
