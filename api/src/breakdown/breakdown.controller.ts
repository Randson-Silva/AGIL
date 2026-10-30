import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../authz/roles.decorator.js';
import { RolesGuard } from '../authz/roles.guard.js';
import { BreakdownService } from './breakdown.service.js';
import { CreateBreakdownDto } from './dto/create-breakdown.dto.js';

@Controller('breakdowns')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class BreakdownController {
  constructor(private readonly breakdownService: BreakdownService) {}

  @Roles('PROFESSOR', 'TECNICO')
  @Post()
  async createBreakdown(@Req() req: any, @Body() data: CreateBreakdownDto) {
    const userId = req.user.id;
    return this.breakdownService.reportBreakdown(userId, data);
  }
}