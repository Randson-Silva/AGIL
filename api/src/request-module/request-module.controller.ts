import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RequestModuleService } from './request-module.service.js';
import { CreateRequestDto } from './dto/create-request-module.dto.js';
import { UpdateRequestDto } from './dto/update-request-module.dto.js';
import { ListRequestDto } from './dto/list-request-module.dto.js';
import { DeleteRequestDto } from './dto/delete-request-module.dto.js';
import { RolesGuard } from '../authz/roles.guard.js';
import { Roles } from '../authz/roles.decorator.js';
import { AuthGuard } from '@nestjs/passport';

@Controller('request')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('PROFESSOR', 'TECNICO')
export class RequestModuleController {
  constructor(private readonly requestModuleService: RequestModuleService) {}

  @Post()
  @Roles('PROFESSOR', 'ALUNO')
  create(@Body() createRequestDto: CreateRequestDto, @Req() req: any) {
    const solicitanteId = req.user.id;
    return this.requestModuleService.create(solicitanteId, createRequestDto);
  }

  @Get()
  @Roles('PROFESSOR', 'ALUNO', 'TECNICO')
  findAll(@Query() filtros: ListRequestDto, @Req() req: any) {
    const solicitanteId = req.user.id;
    const role = req.user.roles?.[0];
    return this.requestModuleService.findAll(solicitanteId, role, filtros);
  }

  @Get('/:id')
  @Roles('PROFESSOR', 'ALUNO', 'TECNICO')
  findOne(@Param('id') id: string) {
    return this.requestModuleService.findOne(id);
  }

  @Patch('/tech/:id')
  @Roles('PROFESSOR', 'ALUNO')
  update(@Param('id') id: string, @Body() updateRequestDto: UpdateRequestDto) {
    return this.requestModuleService.update(id, updateRequestDto);
  }

  @Patch('/technician/approve/:id')
  @Roles('TECNICO')
  approve(@Param('id') id: string, @Req() req: any) {
    const tecnicoId = req.user.id;
    return this.requestModuleService.approve(id, tecnicoId);
  }

  @Patch('/:id/reject')
  @Roles('TECNICO')
  reject(
    @Param('id') id: string,
    @Body() dto: DeleteRequestDto,
    @Req() req: any,
  ) {
    const tecnicoId = req.user.id;
    return this.requestModuleService.reject(id, tecnicoId, dto.motivo_rejeicao);
  }
}
