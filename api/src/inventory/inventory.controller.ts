import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
} from '@nestjs/common';
import { InventoryService } from './inventory.service.js';
import {
  CreateReagentDto,
  CreateSolutionDto,
  CreateEquipmentDto,
  CreateGlasswareDto,
} from './dtos/base-input.dto.js';
import {
  UpdateReagentDto,
  UpdateSolutionDto,
  UpdateEquipmentDto,
  UpdateGlasswareDto,
} from './dtos/update.input.dto.js';

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
  @Patch('reagent/:id')
  async updateReagent(@Param('id') id: string, @Body() data: UpdateReagentDto) {
    return this.inventoryService.updateReagent(id, data);
  }

  @Patch('solution/:id')
  async updateSolution(
    @Param('id') id: string,
    @Body() data: UpdateSolutionDto,
  ) {
    return this.inventoryService.updateSolution(id, data);
  }

  @Patch('equipment/:id')
  async updateEquipment(
    @Param('id') id: string,
    @Body() data: UpdateEquipmentDto,
  ) {
    return this.inventoryService.updateEquipment(id, data);
  }

  @Patch('glassware/:id')
  async updateGlassware(
    @Param('id') id: string,
    @Body() data: UpdateGlasswareDto,
  ) {
    return this.inventoryService.updateGlassware(id, data);
  }

  @Delete(':id')
  async deleteInput(@Param('id') id: string) {
    return this.inventoryService.deleteInput(id);
  }
}
