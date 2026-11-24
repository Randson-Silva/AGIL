import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../authz/current-user.decorator.js';
import { Roles } from '../authz/roles.decorator.js';
import { RolesGuard } from '../authz/roles.guard.js';
import { Perfil } from '../generated/prisma/enums.js';
import { CreateReservationDto } from './dtos/create-reservation.dto.js';
import { CreateUsageLogDto } from './dtos/create-usage-log.dto.js';
import { RejectReservationDto } from './dtos/reject-reservation.dto.js';
import { UpdateUsageLogDto } from './dtos/update-usage-log.dto.js';
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
    @Query('isRecurring') isRecurring?: string,
  ) {
    return this.reservationsService.getOccupiedSlots(
      local,
      date,
      isRecurring === 'true',
    );
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
    @CurrentUser()
    user: {
      id: string;
      sub?: string;
      role?: string;
      perfil?: string;
      profile?: string;
    },
  ) {
    const userId = user.id || user.sub!;
    const profile = (
      user.role ||
      user.perfil ||
      user.profile ||
      'PROFESSOR'
    ).toUpperCase();
    return this.reservationsService.listReservations(userId, profile);
  }

  @Patch(':id/approve')
  @Roles('TECNICO')
  async approveReservation(@Param('id') id: string) {
    return this.reservationsService.approveReservation(id);
  }

  @Patch(':id/reject')
  @Roles('TECNICO')
  async rejectReservation(
    @Param('id') id: string,
    @Body() dto: RejectReservationDto,
  ) {
    return this.reservationsService.rejectReservation(id, dto.motivo_rejeicao);
  }

  @Patch(':id/absence')
  @Roles('TECNICO')
  async registerAbsence(@Param('id') id: string) {
    return this.reservationsService.registerAbsence(id);
  }

  @Get('history')
  @Roles('TECNICO')
  async listReservationHistory(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.reservationsService.listReservationHistory({
      startDate,
      endDate,
      status,
      search,
    });
  }

  @Post(':id/usage-log')
  @Roles('PROFESSOR')
  async createUsageLog(
    @Param('id') reservaId: string,
    @CurrentUser() user: { id: string; role: Perfil },
    @Body() dto: CreateUsageLogDto,
  ) {
    return await this.reservationsService.createUsageLog(
      reservaId,
      user.id,
      dto,
    );
  }

  @Get(':id/usage-log')
  @Roles('PROFESSOR', 'TECNICO')
  async getUsageLog(
    @Param('id') reservaId: string,
    @CurrentUser() user: { id: string; role: Perfil },
  ) {
    return await this.reservationsService.getUsageLog(reservaId, user);
  }

  @Get('usage-logs')
  @Roles('PROFESSOR', 'TECNICO')
  listUsageLogs(@CurrentUser() user: { id: string; role: Perfil }) {
    return this.reservationsService.listUsageLogs(user);
  }

  @Patch(':id/usage-log')
  @Roles('PROFESSOR', 'TECNICO')
  updateUsageLog(
    @Param('id') reservaId: string,
    @CurrentUser() user: { id: string; role: Perfil },
    @Body() dto: UpdateUsageLogDto,
  ) {
    return this.reservationsService.updateUsageLog(reservaId, user, dto);
  }

  @Patch(':id/usage-log/assume')
  @Roles('TECNICO')
  assumeUsageLog(
    @Param('id') reservaId: string,
    @CurrentUser() user: { id: string },
  ) {
    const tecnicoId = user.id;
    return this.reservationsService.assumeUsageLog(reservaId, tecnicoId);
  }

  @Patch(':id/usage-log/resolve')
  @Roles('TECNICO')
  resolveUsageLog(
    @Param('id') reservaId: string,
    @CurrentUser() user: { id: string },
  ) {
    const tecnicoId = user.id;
    return this.reservationsService.resolveUsageLog(reservaId, tecnicoId);
  }

  @Delete(':id/usage-log')
  @Roles('TECNICO')
  deleteUsageLog(@Param('id') reservaId: string) {
    return this.reservationsService.deleteUsageLog(reservaId);
  }
}
