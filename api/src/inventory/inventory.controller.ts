import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service.js';
import { CreateInsumoDto } from './dtos/create-insumo.dto.js';
import { Roles } from '../authz/roles.decorator.js';
import { RolesGuard } from '../authz/roles.guard.js';
import { AuthGuard } from '@nestjs/passport';

@Controller('inventory')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Roles('TECNICO')
  @Post('insumos')
  async criarInsumo(@Body() data: CreateInsumoDto) {
    return this.inventoryService.criarInsumo(data);
  }

  @Get('insumos')
  async listarInsumos() {
    return this.inventoryService.listarInsumos();
  }
}
