import { Body, Controller, Get, Post } from '@nestjs/common';
import { InventoryService } from './inventory.service.js';
import {
  CreateReagentDto,
  CreateSolutionDto,
  CreateEquipmentDto,
  CreateGlasswareDto,
} from './dtos/base-input.dto.js';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('inputs')
  async listInputs() {
    return this.inventoryService.listInputs();
  }

  @Post('reagent')
  async createReagent(@Body() data: CreateReagentDto) {
    return this.inventoryService.createReagent(data);
  }

  @Post('solution')
  async createSolution(@Body() data: CreateSolutionDto) {
    return this.inventoryService.createSolution(data);
  }

  @Post('equipment')
  async createEquipment(@Body() data: CreateEquipmentDto) {
    return this.inventoryService.createEquipment(data);
  }

  @Post('glassware')
  async createGlassware(@Body() data: CreateGlasswareDto) {
    return this.inventoryService.createGlassware(data);
  }
}
