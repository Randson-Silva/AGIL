import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../db/prisma/prisma.service.js';
import { CreateBreakdownDto } from './dto/create-breakdown.dto.js';

@Injectable()
export class BreakdownService {
  constructor(private readonly prisma: PrismaService) {}

  async reportBreakdown(userId: string, dto: CreateBreakdownDto) {
    const insumo = await this.prisma.insumo.findUnique({
      where: { id: dto.insumo_id },
    });

    if (!insumo) {
      throw new NotFoundException('Material não encontrado no inventário.');
    }

    const currentBalance = Number(insumo.quantidade_saldo);
    const breakdownQuantity = dto.quantidade;

    if (breakdownQuantity > currentBalance) {
      throw new BadRequestException(
        `A quantidade avariada (${breakdownQuantity}) excede o total disponível no estoque (${currentBalance}).`,
      );
    }

    const [newBreakdown, updatedInsumo] = await this.prisma.$transaction([
      this.prisma.avariaReportada.create({
        data: {
          usuario_id: userId,
          insumo_id: dto.insumo_id,
          quantidade: breakdownQuantity,
          tipo_ocorrencia: dto.tipo_ocorrencia,
          descricao: dto.descricao,
        },
      }),

      this.prisma.insumo.update({
        where: { id: dto.insumo_id },
        data: {
          quantidade_saldo: {
            decrement: breakdownQuantity,
          },
        },
      }),
    ]);

    // TODO: Call NotificationService to alert technicians
    /*
    await this.notificationService.notifyTechnicians({
      title: 'Nova Avaria Reportada',
      message: `O professor reportou problema no item ${updatedInsumo.nome}.`,
      breakdownId: newBreakdown.id,
    });
    */

    return newBreakdown;
  }
}