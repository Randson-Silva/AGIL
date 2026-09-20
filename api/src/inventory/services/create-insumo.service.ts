import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../db/prisma/prisma.service.js';
import { CreateInsumoDto } from '../dtos/create-insumo.dto.js';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async criarInsumo(data: CreateInsumoDto) {
    const dadosBase = {
      nome: data.nome,
      categoria: data.categoria,
      quantidade_saldo: data.quantidade_saldo,
      localizacao: data.localizacao,
      quantidade_minima: data.quantidade_minima,
      status: 'Disponível',
    };

    switch (data.categoria) {
      case 'REAGENTE':
        return this.prisma.insumo.create({
          data: {
            ...dadosBase,
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

      case 'SOLUCAO':
        return this.prisma.insumo.create({
          data: {
            ...dadosBase,
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

      case 'EQUIPAMENTO':
        return this.prisma.insumo.create({
          data: {
            ...dadosBase,
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

      case 'VIDRARIA':
        return this.prisma.insumo.create({
          data: {
            ...dadosBase,
            vidrariaInfo: {
              create: {
                marca: data.marca,
                capacidade: data.capacidade,
              },
            },
          },
          include: { vidrariaInfo: true },
        });

      default:
        throw new BadRequestException('Categoria inválida');
    }
  }
}
