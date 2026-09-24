import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../db/prisma/prisma.service.js';
import { CreateInsumoDto } from './dtos/create-insumo.dto.js';


@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async listarInsumos() {
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

  async criarInsumo(data: CreateInsumoDto) {
    const dadosBase = {
      nome: data.nome,
      categoria: data.categoria,
      quantidade_saldo: data.quantidade_saldo,
      localizacao: data.localizacao,
      quantidade_minima: data.quantidade_minima,
      status: 'Disponível',
      tipo_medida: data.tipo_medida,
      data_validade: data.data_validade, // <--- CAMPO ADICIONADO AQUI
    };

    switch (data.categoria) {
      case 'REAGENTE':
        return this.prisma.insumo.create({
          data: { ...dadosBase, reagenteInfo: { create: { formula: data.formula, cas: data.cas, marca: data.marca, observacao: data.observacao } } },
          include: { reagenteInfo: true },
        });
      case 'SOLUCAO':
        return this.prisma.insumo.create({
          data: { ...dadosBase, solucaoInfo: { create: { formula: data.formula, cas: data.cas, observacao: data.observacao } } },
          include: { solucaoInfo: true },
        });
      case 'EQUIPAMENTO':
        return this.prisma.insumo.create({
          data: { ...dadosBase, equipamentoInfo: { create: { marca: data.marca, modelo: data.modelo, voltagem: data.voltagem } } },
          include: { equipamentoInfo: true },
        });
      case 'VIDRARIA':
        return this.prisma.insumo.create({
          data: { ...dadosBase, vidrariaInfo: { create: { marca: data.marca, capacidade: data.capacidade } } },
          include: { vidrariaInfo: true },
        });
      default:
        throw new BadRequestException('Categoria inválida');
    }
  }


  async darBaixaEstoque(itens: { insumo_id: string; quantidade: number }[], tecnicoId: string, solicitacaoId: string) {
    return this.prisma.$transaction(async (tx) => {
      for (const item of itens) {
        const insumo = await tx.insumo.findUnique({
          where: { id: item.insumo_id },
        });

        if (!insumo) {
          throw new BadRequestException(`Insumo ID ${item.insumo_id} não encontrado.`);
        }

        const saldoAnterior = Number(insumo.quantidade_saldo);
        const qtdSolicitada = Number(item.quantidade);

        if (saldoAnterior < qtdSolicitada) {
          throw new BadRequestException(
            `Estoque insuficiente para o item '${insumo.nome}'. Disponível: ${saldoAnterior}, Solicitado: ${qtdSolicitada}.`
          );
        }

        const saldoPosterior = saldoAnterior - qtdSolicitada;

        // 1. Atualiza o saldo do insumo
        await tx.insumo.update({
          where: { id: item.insumo_id },
          data: { quantidade_saldo: saldoPosterior },
        });

        // 2. Registra o histórico de movimentação
        await tx.historicoMovimentacao.create({
          data: {
            solicitacao_id: solicitacaoId,
            insumo_id: item.insumo_id,
            acao: 'SAIDA', // TipoMovimentacao Enum
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
}
