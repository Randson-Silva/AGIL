import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../db/prisma/prisma.service.js';
import { MailService } from '../mail/mail.service.js';
import { CreateBreakdownDto } from './dto/create-breakdown.dto.js';
import { Perfil, StatusInsumo } from '../generated/prisma/enums.js';

@Injectable()
export class BreakdownService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async listBreakdowns() {
    return this.prisma.avariaReportada.findMany({
      orderBy: { data_reporte: 'desc' },
      include: {
        insumo: {
          select: {
            id: true,
            nome: true,
            categoria: true,
            tipo_medida: true,
            localizacao: true,
          },
        },
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });
  }

  async reportBreakdown(userId: string, dto: CreateBreakdownDto) {
    const insumo = await this.prisma.insumo.findUnique({
      where: { id: dto.insumo_id },
    });

    if (!insumo) {
      throw new NotFoundException('Material não encontrado no inventário.');
    }

    const currentBalance = Number(insumo.quantidade_saldo);
    const minQuantity = Number(insumo.quantidade_minima);
    const breakdownQuantity = dto.quantidade;

    if (breakdownQuantity > currentBalance) {
      throw new BadRequestException(
        `A quantidade avariada (${breakdownQuantity}) excede o total disponível no estoque (${currentBalance}).`,
      );
    }

    const newBalance = currentBalance - breakdownQuantity;
    const newStatus =
      newBalance <= minQuantity ? StatusInsumo.CRITICO : StatusInsumo.ESTAVEL;

    const { newBreakdown, updatedInsumo } = await this.prisma.$transaction(
      async (tx) => {
        const createdBreakdown = await tx.avariaReportada.create({
          data: {
            usuario_id: userId,
            insumo_id: dto.insumo_id,
            quantidade: breakdownQuantity,
            tipo_ocorrencia: dto.tipo_ocorrencia,
            descricao: dto.descricao,
          },
          include: {
            usuario: {
              select: {
                id: true,
                nome: true,
                email: true,
              },
            },
          },
        });

        const updatedItem = await tx.insumo.update({
          where: { id: dto.insumo_id },
          data: {
            quantidade_saldo: newBalance,
            statusInsumo: newStatus,
          },
        });

        if (
          newStatus === StatusInsumo.CRITICO &&
          insumo.statusInsumo !== StatusInsumo.CRITICO
        ) {
          await tx.alertaEstoque.create({
            data: {
              insumo_id: insumo.id,
              quantidade_momento: newBalance,
            },
          });
        }

        return { newBreakdown: createdBreakdown, updatedInsumo: updatedItem };
      },
    );

    const technicians = await this.prisma.usuario.findMany({
      where: { perfil: Perfil.TECNICO },
      select: { email: true },
    });

    const technicianEmails = technicians
      .map((t) => t.email)
      .filter((email): email is string => Boolean(email));

    await this.mailService.sendBreakdownAlertEmail({
      to: technicianEmails,
      materialNome: updatedInsumo.nome,
      tipoOcorrencia: newBreakdown.tipo_ocorrencia,
      quantidade: Number(newBreakdown.quantidade),
      unidadeMedida: updatedInsumo.tipo_medida,
      descricao: newBreakdown.descricao,
      professorNome: newBreakdown.usuario.nome,
      dataReporte: newBreakdown.data_reporte,
    });

    return newBreakdown;
  }
}
