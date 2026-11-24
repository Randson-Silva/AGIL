import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../db/prisma/prisma.service.js';
import {
  Perfil,
  StatusInsumo,
  StatusSolicitacao,
} from '../generated/prisma/enums.js';
import { MailService } from '../mail/mail.service.js';
import { CreateBreakdownDto } from './dto/create-breakdown.dto.js';

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

  async listEligibleMaterials(userId: string) {
    const requestedItems = await this.prisma.itemSolicitacaoMaterial.findMany({
      where: {
        solicitacao: {
          solicitante_id: userId,
          status: {
            in: [StatusSolicitacao.APROVADA, StatusSolicitacao.DEVOLVIDA],
          },
        },
      },
      select: {
        insumo_id: true,
      },
      distinct: ['insumo_id'],
    });

    const eligibleIds = requestedItems.map((item) => item.insumo_id);

    if (eligibleIds.length === 0) {
      return [];
    }

    return this.prisma.insumo.findMany({
      where: {
        id: { in: eligibleIds },
      },
      orderBy: { nome: 'asc' },
      include: {
        reagenteInfo: true,
        solucaoInfo: true,
        equipamentoInfo: true,
        vidrariaInfo: true,
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

    const previousRequest = await this.prisma.itemSolicitacaoMaterial.findFirst(
      {
        where: {
          insumo_id: dto.insumo_id,
          solicitacao: {
            solicitante_id: userId,
            status: {
              in: [StatusSolicitacao.APROVADA, StatusSolicitacao.DEVOLVIDA],
            },
          },
        },
      },
    );

    if (!previousRequest) {
      throw new BadRequestException(
        'Você só pode reportar avarias em materiais que foram solicitados por você anteriormente.',
      );
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
            ata_uso_id: dto.ata_uso_id ?? null,
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

  async listMyBreakdowns(
    userId: string,
    filters: {
      startDate?: string;
      endDate?: string;
      search?: string;
    },
  ) {
    const { startDate, endDate, search } = filters;

    const totalCount = await this.prisma.avariaReportada.count({
      where: { usuario_id: userId },
    });

    const dateFilter: { gte?: Date; lte?: Date } = {};
    if (startDate) {
      dateFilter.gte = new Date(`${startDate}T00:00:00.000-03:00`);
    }
    if (endDate) {
      dateFilter.lte = new Date(`${endDate}T23:59:59.999-03:00`);
    }

    const breakdowns = await this.prisma.avariaReportada.findMany({
      where: {
        usuario_id: userId,
        ...(startDate || endDate ? { data_reporte: dateFilter } : {}),
      },
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

    let items = breakdowns;

    if (search && search.trim()) {
      const term = search.trim().toLowerCase();
      items = items.filter(
        (b) =>
          b.insumo.nome.toLowerCase().includes(term) ||
          b.tipo_ocorrencia.toLowerCase().includes(term) ||
          (b.descricao && b.descricao.toLowerCase().includes(term)) ||
          (b.insumo.localizacao &&
            b.insumo.localizacao.toLowerCase().includes(term)),
      );
    }

    return {
      hasAnyHistory: totalCount > 0,
      items,
    };
  }
}
