import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../authz/roles.decorator.js';
import { RolesGuard } from '../authz/roles.guard.js';
import { UsersService } from './users.service.js';

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('professors')
  @Roles('ALUNO', 'PROFESSOR', 'TECNICO')
  searchProfessors(@Query('search') search?: string) {
    return this.usersService.searchProfessors(search);
  }
}
