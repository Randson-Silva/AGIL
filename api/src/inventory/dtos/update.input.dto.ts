import { PartialType } from '@nestjs/mapped-types';
import {
  CreateReagentDto,
  CreateSolutionDto,
  CreateEquipmentDto,
  CreateGlasswareDto,
} from './base-input.dto.js';

export class UpdateReagentDto extends PartialType(CreateReagentDto) {}
export class UpdateSolutionDto extends PartialType(CreateSolutionDto) {}
export class UpdateEquipmentDto extends PartialType(CreateEquipmentDto) {}
export class UpdateGlasswareDto extends PartialType(CreateGlasswareDto) {}
