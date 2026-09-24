import { Injectable } from '@nestjs/common';
import { PrismaService } from '../db/prisma/prisma.service.js';
import {
  CreateReagentDto,
  CreateSolutionDto,
  CreateEquipmentDto,
  CreateGlasswareDto,
} from './dtos/base-input.dto.js';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async listInputs() {
    return this.prisma.insumo.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        reagenteInfo: true,
        solucaoInfo: true,
        equipamentoInfo: true,
        vidrariaInfo: true,
      },
    });
  }

  async createReagent(data: CreateReagentDto) {
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
}
