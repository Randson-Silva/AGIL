// api/src/breakdown/breakdown.controller.ts
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../authz/current-user.decorator.js';
import { Roles } from '../authz/roles.decorator.js';
import { RolesGuard } from '../authz/roles.guard.js';
import { BreakdownService } from './breakdown.service.js';
import { CreateBreakdownDto } from './dto/create-breakdown.dto.js';

@Controller('breakdowns')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class BreakdownController {
  constructor(private readonly breakdownService: BreakdownService) {}

  @Get()
  @Roles('TECNICO')
  async listBreakdowns() {
    return this.breakdownService.listBreakdowns();
  }

  @Post()
  @Roles('PROFESSOR', 'TECNICO')
  async createBreakdown(
    @CurrentUser() user: { id: string; sub?: string },
    @Body() data: CreateBreakdownDto,
  ) {
    const userId = user.id || user.sub!;
    return this.breakdownService.reportBreakdown(userId, data);
  }
}
