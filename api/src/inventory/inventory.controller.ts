import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../authz/roles.decorator.js';
import { RolesGuard } from '../authz/roles.guard.js';
import {
  CreateEquipmentDto,
  CreateGlasswareDto,
  CreateReagentDto,
  CreateSolutionDto,
} from './dtos/base-input.dto.js';
import {
  UpdateEquipmentDto,
  UpdateGlasswareDto,
  UpdateReagentDto,
  UpdateSolutionDto,
} from './dtos/update.input.dto.js';
import { InventoryService } from './inventory.service.js';

@Controller('inventory')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Roles('TECNICO')
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

  @Patch('stock/:id/increment')
  async incrementStock(
    @Param('id') id: string,
    @Body('amount') amount: number,
  ) {
    return this.inventoryService.incrementStock(id, amount);
  }

  @Patch('stock/:id/decrement')
  async decrementStock(
    @Param('id') id: string,
    @Body('amount') amount: number,
  ) {
    return this.inventoryService.decrementStock(id, amount);
  }

  @Delete(':id')
  async deleteInput(@Param('id') id: string) {
    return this.inventoryService.deleteInput(id);
  }
}
