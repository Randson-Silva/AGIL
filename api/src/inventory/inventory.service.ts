import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../db/prisma/prisma.service.js';
import {
  CreateEquipmentDto,
  CreateGlasswareDto,
  CreateReagentDto,
  CreateSolutionDto,
} from './dtos/base-input.dto.js';
import {
  UpdateEquipmentDto,
  UpdateGlasswareDto,
  UpdateReagentDto,
  UpdateSolutionDto,
} from './dtos/update.input.dto.js';
import { ListAlertsDto } from './dtos/filter.dto.js';
import {
  hasValidUpdates,
  validateMeasurementUnit,
} from '../utils/inventory.utils.js';
import { MailService } from '../mail/mail.service.js';
import { Prisma, StatusInsumo } from '../generated/prisma/client.js';
import { error } from 'console';

@Injectable()
export class InventoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async listInputs() {
    const inputs = await this.prisma.insumo.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        reagenteInfo: true,
        solucaoInfo: true,
        equipamentoInfo: true,
        vidrariaInfo: true,
      },
    });

    return inputs || [];
  }

  async createReagent(data: CreateReagentDto) {
    validateMeasurementUnit(data.tipo_medida, data.quantidade_saldo);
    if (data.quantidade_minima) {
      validateMeasurementUnit(data.tipo_medida, data.quantidade_minima);
    }

    return this.prisma.insumo.create({
      data: {
        nome: data.nome,
        categoria: data.categoria,
        quantidade_saldo: data.quantidade_saldo,
        localizacao: data.localizacao,
        quantidade_minima: data.quantidade_minima,
        tipo_medida: data.tipo_medida,
        data_validade: data.data_validade,
        natureza_patrimonial: 'CONSUMO',
        reagenteInfo: {
          create: {
            formula: data.formula,
            cas: data.cas,
            marca: data.marca,
            observacao: data.observacao,
          },
        },
      },
      include: { reagenteInfo: true },
    });
  }

  async createSolution(data: CreateSolutionDto) {
    validateMeasurementUnit(data.tipo_medida, data.quantidade_saldo);
    if (data.quantidade_minima) {
      validateMeasurementUnit(data.tipo_medida, data.quantidade_minima);
    }

    return this.prisma.insumo.create({
      data: {
        nome: data.nome,
        categoria: data.categoria,
        quantidade_saldo: data.quantidade_saldo,
        localizacao: data.localizacao,
        quantidade_minima: data.quantidade_minima,
        tipo_medida: data.tipo_medida,
        data_validade: data.data_validade,
        natureza_patrimonial: 'CONSUMO',
        solucaoInfo: {
          create: {
            formula: data.formula,
            cas: data.cas,
            observacao: data.observacao,
          },
        },
      },
      include: { solucaoInfo: true },
    });
  }

  async createEquipment(data: CreateEquipmentDto) {
    validateMeasurementUnit(data.tipo_medida, data.quantidade_saldo);
    if (data.quantidade_minima) {
      validateMeasurementUnit(data.tipo_medida, data.quantidade_minima);
    }

    return this.prisma.insumo.create({
      data: {
        nome: data.nome,
        categoria: data.categoria,
        quantidade_saldo: data.quantidade_saldo,
        localizacao: data.localizacao,
        quantidade_minima: data.quantidade_minima,
        tipo_medida: data.tipo_medida,
        data_validade: data.data_validade,
        natureza_patrimonial: 'TOMBADO',
        equipamentoInfo: {
          create: {
            numero_patrimonio: data.numero_patrimonio,
            marca: data.marca,
            modelo: data.modelo,
            voltagem: data.voltagem,
          },
        },
      },
      include: { equipamentoInfo: true },
    });
  }

  async createGlassware(data: CreateGlasswareDto) {
    validateMeasurementUnit(data.tipo_medida, data.quantidade_saldo);
    if (data.quantidade_minima) {
      validateMeasurementUnit(data.tipo_medida, data.quantidade_minima);
    }

    return this.prisma.insumo.create({
      data: {
        nome: data.nome,
        categoria: data.categoria,
        quantidade_saldo: data.quantidade_saldo,
        localizacao: data.localizacao,
        quantidade_minima: data.quantidade_minima,
        tipo_medida: data.tipo_medida,
        data_validade: data.data_validade,
        vidrariaInfo: {
          create: {
            marca: data.marca,
            capacidade: data.capacidade,
          },
        },
      },
      include: { vidrariaInfo: true },
    });
  }

  async deleteInput(id: string) {
    return this.prisma.insumo.delete({
      where: { id },
    });
  }

  async updateReagent(id: string, data: UpdateReagentDto) {
    if (data.quantidade_minima !== undefined) {
      let unit = data.tipo_medida;
      if (!unit) {
        const item = await this.prisma.insumo.findUnique({ where: { id } });
        if (!item)
          throw new BadRequestException(
            'O insumo solicitado não foi encontrado no sistema.',
          );
        unit = item.tipo_medida;
      }
      validateMeasurementUnit(unit, data.quantidade_minima);
    }

    const { formula, cas, marca, observacao, ...baseData } = data;
    const childData = { formula, cas, marca, observacao };

    return this.prisma.insumo.update({
      where: { id },
      data: {
        ...baseData,
        ...(hasValidUpdates(childData) && {
          reagenteInfo: { update: childData },
        }),
      },
      include: { reagenteInfo: true },
    });
  }

  async updateSolution(id: string, data: UpdateSolutionDto) {
    if (data.quantidade_minima !== undefined) {
      let unit = data.tipo_medida;
      if (!unit) {
        const item = await this.prisma.insumo.findUnique({ where: { id } });
        if (!item)
          throw new BadRequestException(
            'O insumo solicitado não foi encontrado no sistema.',
          );
        unit = item.tipo_medida;
      }
      validateMeasurementUnit(unit, data.quantidade_minima);
    }

    const { formula, cas, observacao, ...baseData } = data;
    const childData = { formula, cas, observacao };

    return this.prisma.insumo.update({
      where: { id },
      data: {
        ...baseData,
        ...(hasValidUpdates(childData) && {
          solucaoInfo: { update: childData },
        }),
      },
      include: { solucaoInfo: true },
    });
  }

  async updateEquipment(id: string, data: UpdateEquipmentDto) {
    if (data.quantidade_minima !== undefined) {
      let unit = data.tipo_medida;
      if (!unit) {
        const item = await this.prisma.insumo.findUnique({ where: { id } });
        if (!item)
          throw new BadRequestException(
            'O insumo solicitado não foi encontrado no sistema.',
          );
        unit = item.tipo_medida;
      }
      validateMeasurementUnit(unit, data.quantidade_minima);
    }

    const { marca, modelo, voltagem, ...baseData } = data;
    const childData = { marca, modelo, voltagem };

    return this.prisma.insumo.update({
      where: { id },
      data: {
        ...baseData,
        ...(hasValidUpdates(childData) && {
          equipamentoInfo: { update: childData },
        }),
      },
      include: { equipamentoInfo: true },
    });
  }

  async updateGlassware(id: string, data: UpdateGlasswareDto) {
    if (data.quantidade_minima !== undefined) {
      let unit = data.tipo_medida;
      if (!unit) {
        const item = await this.prisma.insumo.findUnique({ where: { id } });
        if (!item)
          throw new BadRequestException(
            'O insumo solicitado não foi encontrado no sistema.',
          );
        unit = item.tipo_medida;
      }
      validateMeasurementUnit(unit, data.quantidade_minima);
    }

    const { marca, capacidade, ...baseData } = data;
    const childData = { marca, capacidade };

    return this.prisma.insumo.update({
      where: { id },
      data: {
        ...baseData,
        ...(hasValidUpdates(childData) && {
          vidrariaInfo: { update: childData },
        }),
      },
      include: { vidrariaInfo: true },
    });
  }

  async updateStock(
    itens: { insumo_id: string; quantidade: number }[],
    tecnicoId: string,
    solicitacaoId: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      for (const item of itens) {
        const insumo = await this.validateAndGetInsumo(
          tx,
          item.insumo_id,
          item.quantidade,
        );

        const saldoAnterior = insumo.quantidade_saldo.toNumber();
        const qtdSolicitada = item.quantidade;
        const saldoPosterior = saldoAnterior - qtdSolicitada;
        // USA O HELPER AQUI
        await this.updateStockBalanceAndAlerts(
          tx,
          insumo.id,
          insumo.nome,
          insumo.statusInsumo,
          saldoPosterior,
          insumo.quantidade_minima.toNumber(),
        );

        await this.registerMovementHistory(
          tx,
          item.insumo_id,
          solicitacaoId,
          tecnicoId,
          qtdSolicitada,
          saldoAnterior,
          saldoPosterior,
        );
      }
    });
  }

  async incrementStock(id: string, amount: number) {
    return this.prisma.$transaction(async (tx) => {
      const insumo = await tx.insumo.findUnique({ where: { id } });
      if (!insumo)
        throw new BadRequestException(
          'O item solicitado não foi encontrado no sistema.',
        );

      const numericAmount = Number(amount);

      validateMeasurementUnit(insumo.tipo_medida, amount);
      const saldoPosterior = insumo.quantidade_saldo.toNumber() + numericAmount;

      return this.updateStockBalanceAndAlerts(
        tx,
        insumo.id,
        insumo.nome,
        insumo.statusInsumo,
        saldoPosterior,
        insumo.quantidade_minima.toNumber(),
      );
    });
  }

  async decrementStock(id: string, amount: number) {
    return this.prisma.$transaction(async (tx) => {
      const insumo = await tx.insumo.findUnique({ where: { id } });
      if (!insumo)
        throw new BadRequestException(
          'O item solicitado não foi encontrado no sistema.',
        );

      validateMeasurementUnit(insumo.tipo_medida, amount);

      const saldoAtual = insumo.quantidade_saldo.toNumber();
      if (saldoAtual < amount) {
        throw new BadRequestException(
          `A saída solicitada (${amount}) é maior que o saldo disponível (${saldoAtual}).`,
        );
      }

      const saldoPosterior = saldoAtual - amount;

      return this.updateStockBalanceAndAlerts(
        tx,
        insumo.id,
        insumo.nome,
        insumo.statusInsumo,
        saldoPosterior,
        insumo.quantidade_minima.toNumber(),
      );
    });
  }

  async listAlerts() {
    return this.prisma.alertaEstoque.findMany({
      where: {
        status: 'PENDENTE',
      },
      select: {
        id: true,
        data_alerta: true,
        quantidade_momento: true,
        insumo: {
          select: {
            id: true,
            nome: true,
            tipo_medida: true,
          },
        },
      },
      orderBy: {
        data_alerta: 'desc',
      },
    });
  }

  async listStoryAlerts(filters: ListAlertsDto) {
    const { page = 1, limit = 10, status, nomeInsumo } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.AlertaEstoqueWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (nomeInsumo) {
      where.insumo = {
        nome: { contains: nomeInsumo, mode: 'insensitive' },
      };
    }

    const [alertas, total] = await this.prisma.$transaction([
      this.prisma.alertaEstoque.findMany({
        skip,
        take: limit,
        where,
        orderBy: { data_alerta: 'desc' },
        select: {
          id: true,
          data_alerta: true,
          status: true,
          quantidade_momento: true,
          quantidade_resolucao: true,
          insumo: {
            select: {
              id: true,
              nome: true,
              tipo_medida: true,
            },
          },
        },
      }),
      this.prisma.alertaEstoque.count({
        where,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: alertas,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  private async validateAndGetInsumo(
    tx: Prisma.TransactionClient,
    insumoId: string,
    quantidadeSolicitada: number,
  ) {
    const insumo = await tx.insumo.findUnique({
      where: { id: insumoId },
    });

    if (!insumo) {
      throw new BadRequestException(
        `O insumo solicitado não foi encontrado no sistema.`,
      );
    }

    validateMeasurementUnit(insumo.tipo_medida, quantidadeSolicitada);

    if (insumo.quantidade_saldo.toNumber() < quantidadeSolicitada) {
      throw new BadRequestException(
        `A saída solicitada (${quantidadeSolicitada}) para o item '${insumo.nome}' é maior que o saldo disponível (${insumo.quantidade_saldo.toNumber()}).`,
      );
    }

    return insumo;
  }

  private async syncStockAlerts(
    tx: Prisma.TransactionClient,
    insumoId: string,
    insumoNome: string,
    novoStatus: StatusInsumo,
    saldoPosterior: number,
    quantidadeMinima: number,
  ) {
    if (novoStatus === StatusInsumo.CRITICO) {
      await tx.alertaEstoque.create({
        data: {
          insumo_id: insumoId,
          quantidade_momento: saldoPosterior,
        },
      });
      tx.usuario
        .findMany({
          where: {
            perfil: 'TECNICO',
          },
          select: {
            email: true,
          },
        })
        .then((usuarios) => {
          const emails = usuarios.map((usuario) => usuario.email);
          this.mailService
            .sendLowStockAlertEmail(
              emails,
              insumoNome,
              saldoPosterior,
              quantidadeMinima,
            )
            .catch(console.error);
        });
    } else if (novoStatus === StatusInsumo.ESTAVEL) {
      await tx.alertaEstoque.updateMany({
        where: {
          insumo_id: insumoId,
          status: 'PENDENTE',
        },
        data: {
          status: 'RESOLVIDO',
          data_resolucao: new Date(),
          quantidade_resolucao: saldoPosterior,
        },
      });
    }
  }

  private async registerMovementHistory(
    tx: Prisma.TransactionClient,
    insumoId: string,
    solicitacaoId: string,
    tecnicoId: string,
    quantidade: number,
    saldoAnterior: number,
    saldoPosterior: number,
  ) {
    await tx.historicoMovimentacao.create({
      data: {
        solicitacao_id: solicitacaoId,
        insumo_id: insumoId,
        acao: 'SAIDA',
        quantidade: quantidade,
        saldo_anterior: saldoAnterior,
        saldo_posterior: saldoPosterior,
        usuarioId: tecnicoId,
        observacao: 'Baixa gerada por aprovação de solicitação',
      },
    });
  }

  private async updateStockBalanceAndAlerts(
    tx: Prisma.TransactionClient,
    insumoId: string,
    insumoNome: string,
    statusAtual: StatusInsumo,
    saldoPosterior: number,
    quantidadeMinima: number,
  ) {
    const novoStatus =
      saldoPosterior <= quantidadeMinima
        ? StatusInsumo.CRITICO
        : StatusInsumo.ESTAVEL;

    if (novoStatus !== statusAtual) {
      await this.syncStockAlerts(tx, insumoId, insumoNome, novoStatus, saldoPosterior, quantidadeMinima);
    }

    return tx.insumo.update({
      where: { id: insumoId },
      data: {
        quantidade_saldo: saldoPosterior,
        statusInsumo: novoStatus,
      },
    });
  }
}
