import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../authz/current-user.decorator.js';
import { Roles } from '../authz/roles.decorator.js';
import { RolesGuard } from '../authz/roles.guard.js';
import { CreateReservationDto } from './dtos/create-reservation.dto.js';
import { ReservationsService } from './reservations.service.js';

@Controller('reservations')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get('occupied-slots')
  @Roles('PROFESSOR', 'TECNICO')
  async getOccupiedSlots(
    @Query('local') local: string,
    @Query('date') date: string,
    @Query('objetivo') objetivo?: string,
  ) {
    return this.reservationsService.getOccupiedSlots(local, date, objetivo);
  }

  @Get('availability')
  @Roles('PROFESSOR', 'TECNICO', 'ALUNO')
  async getDailyAvailability(
    @Query('date') date: string,
    @Query('local') local?: string,
  ) {
    return this.reservationsService.getDailyAvailability(date, local);
  }

  @Post()
  @Roles('PROFESSOR')
  async createReservation(
    @CurrentUser() user: { id: string; sub?: string },
    @Body() data: CreateReservationDto,
  ) {
    const professorId = user.id || user.sub!;
    return this.reservationsService.createReservation(professorId, data);
  }

  @Get()
  @Roles('PROFESSOR', 'TECNICO')
  async listReservations(
    @CurrentUser() user: { id: string; sub?: string; perfil?: string; profile?: string },
  ) {
    const userId = user.id || user.sub!;
    const profile = user.perfil || user.profile || 'PROFESSOR';
    return this.reservationsService.listReservations(userId, profile);
  }
}