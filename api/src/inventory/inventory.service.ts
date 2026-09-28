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

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  private validateUnitType(tipo_medida: string, amount: number) {
    if (tipo_medida === 'UN' && amount % 1 !== 0) {
      throw new BadRequestException(
        'Itens medidos em Unidades (UN) não podem ter valores decimais.',
      );
    }
  }

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
    this.validateUnitType(data.tipo_medida, data.quantidade_saldo);
    if (data.quantidade_minima)
      this.validateUnitType(data.tipo_medida, data.quantidade_minima);

    return this.prisma.insumo.create({
      data: {
        nome: data.nome,
        categoria: data.categoria,
        quantidade_saldo: data.quantidade_saldo,
        localizacao: data.localizacao,
        quantidade_minima: data.quantidade_minima,
        tipo_medida: data.tipo_medida,
        data_validade: data.data_validade,
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
    this.validateUnitType(data.tipo_medida, data.quantidade_saldo);
    if (data.quantidade_minima)
      this.validateUnitType(data.tipo_medida, data.quantidade_minima);

    return this.prisma.insumo.create({
      data: {
        nome: data.nome,
        categoria: data.categoria,
        quantidade_saldo: data.quantidade_saldo,
        localizacao: data.localizacao,
        quantidade_minima: data.quantidade_minima,
        tipo_medida: data.tipo_medida,
        data_validade: data.data_validade,
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
    this.validateUnitType(data.tipo_medida, data.quantidade_saldo);
    if (data.quantidade_minima)
      this.validateUnitType(data.tipo_medida, data.quantidade_minima);

    return this.prisma.insumo.create({
      data: {
        nome: data.nome,
        categoria: data.categoria,
        quantidade_saldo: data.quantidade_saldo,
        localizacao: data.localizacao,
        quantidade_minima: data.quantidade_minima,
        tipo_medida: data.tipo_medida,
        data_validade: data.data_validade,
        equipamentoInfo: {
          create: {
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
    this.validateUnitType(data.tipo_medida, data.quantidade_saldo);
    if (data.quantidade_minima)
      this.validateUnitType(data.tipo_medida, data.quantidade_minima);

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
    if (data.tipo_medida && data.quantidade_minima !== undefined) {
      this.validateUnitType(data.tipo_medida, data.quantidade_minima);
    }

    const { formula, cas, marca, observacao, ...baseData } = data;
    const childData = { formula, cas, marca, observacao };
    const hasChildUpdate = Object.values(childData).some(
      (val) => val !== undefined,
    );

    return this.prisma.insumo.update({
      where: { id },
      data: {
        ...baseData,
        ...(hasChildUpdate && { reagenteInfo: { update: childData } }),
      },
      include: { reagenteInfo: true },
    });
  }

  async updateSolution(id: string, data: UpdateSolutionDto) {
    if (data.tipo_medida && data.quantidade_minima !== undefined) {
      this.validateUnitType(data.tipo_medida, data.quantidade_minima);
    }

    const { formula, cas, observacao, ...baseData } = data;
    const childData = { formula, cas, observacao };
    const hasChildUpdate = Object.values(childData).some(
      (val) => val !== undefined,
    );

    return this.prisma.insumo.update({
      where: { id },
      data: {
        ...baseData,
        ...(hasChildUpdate && { solucaoInfo: { update: childData } }),
      },
      include: { solucaoInfo: true },
    });
  }

  async updateEquipment(id: string, data: UpdateEquipmentDto) {
    if (data.tipo_medida && data.quantidade_minima !== undefined) {
      this.validateUnitType(data.tipo_medida, data.quantidade_minima);
    }

    const { marca, modelo, voltagem, ...baseData } = data;
    const childData = { marca, modelo, voltagem };
    const hasChildUpdate = Object.values(childData).some(
      (val) => val !== undefined,
    );

    return this.prisma.insumo.update({
      where: { id },
      data: {
        ...baseData,
        ...(hasChildUpdate && { equipamentoInfo: { update: childData } }),
      },
      include: { equipamentoInfo: true },
    });
  }

  async updateGlassware(id: string, data: UpdateGlasswareDto) {
    if (data.tipo_medida && data.quantidade_minima !== undefined) {
      this.validateUnitType(data.tipo_medida, data.quantidade_minima);
    }

    const { marca, capacidade, ...baseData } = data;
    const childData = { marca, capacidade };
    const hasChildUpdate = Object.values(childData).some(
      (val) => val !== undefined,
    );

    return this.prisma.insumo.update({
      where: { id },
      data: {
        ...baseData,
        ...(hasChildUpdate && { vidrariaInfo: { update: childData } }),
      },
      include: { vidrariaInfo: true },
    });
  }

  async darBaixaEstoque(
    itens: { insumo_id: string; quantidade: number }[],
    tecnicoId: string,
    solicitacaoId: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      for (const item of itens) {
        const insumo = await tx.insumo.findUnique({
          where: { id: item.insumo_id },
        });

        if (!insumo) {
          throw new BadRequestException(
            `Insumo ID ${item.insumo_id} não encontrado.`,
          );
        }

        this.validateUnitType(insumo.tipo_medida, item.quantidade);

        const saldoAnterior = Number(insumo.quantidade_saldo);
        const qtdSolicitada = Number(item.quantidade);

        if (saldoAnterior < qtdSolicitada) {
          throw new BadRequestException(
            `Estoque insuficiente para o item '${insumo.nome}'. Disponível: ${saldoAnterior}, Solicitado: ${qtdSolicitada}.`,
          );
        }

        const saldoPosterior = saldoAnterior - qtdSolicitada;

        await tx.insumo.update({
          where: { id: item.insumo_id },
          data: { quantidade_saldo: saldoPosterior },
        });

        await tx.historicoMovimentacao.create({
          data: {
            solicitacao_id: solicitacaoId,
            insumo_id: item.insumo_id,
            acao: 'SAIDA',
            quantidade: qtdSolicitada,
            saldo_anterior: saldoAnterior,
            saldo_posterior: saldoPosterior,
            usuarioId: tecnicoId,
            observacao: 'Baixa gerada por aprovação de solicitação',
          },
        });
      }
    });
  }

  async incrementStock(id: string, amount: number) {
    const item = await this.prisma.insumo.findUnique({ where: { id } });
    if (!item) throw new BadRequestException('Item não encontrado');

    this.validateUnitType(item.tipo_medida, amount);

    return this.prisma.insumo.update({
      where: { id },
      data: {
        quantidade_saldo: {
          increment: amount,
        },
      },
    });
  }

  async decrementStock(id: string, amount: number) {
    const item = await this.prisma.insumo.findUnique({ where: { id } });
    if (!item) throw new BadRequestException('Item não encontrado');

    this.validateUnitType(item.tipo_medida, amount);

    if (item.quantidade_saldo.lessThan(amount)) {
      throw new BadRequestException(
        `Estoque insuficiente. Tem apenas ${item.quantidade_saldo} unidades.`,
      );
    }

    return this.prisma.insumo.update({
      where: { id },
      data: {
        quantidade_saldo: {
          decrement: amount,
        },
      },
    });
  }
}
