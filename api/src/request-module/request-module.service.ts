import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateRequestDto } from './dto/create-request-module.dto.js';
import { UpdateRequestDto } from './dto/update-request-module.dto.js';
import { ListRequestDto } from './dto/list-request-module.dto.js';
import { PrismaService } from '../db/prisma/prisma.service.js';
import { InventoryService } from '../inventory/inventory.service.js';

@Injectable()
export class RequestModuleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly inventoryService: InventoryService
  ) {}

  async create(solicitanteId: string, dto: CreateRequestDto) {
    return this.prisma.solicitacaoMaterial.create({
      data: {
        solicitante_id: solicitanteId,
        finalidade: dto.finalidade,
        descricao: dto.descricao,
        status: 'PENDENTE',
        itens: {
          create: dto.itens?.map(item => ({
            insumo_id: item.insumo_id,
            quantidade: item.quantidade,
          })) || []
        }
      },
      include: { itens: true }
    });
  }

  async findAll(solicitanteId: string, filtros: ListRequestDto) {
    return this.prisma.solicitacaoMaterial.findMany({
      where: {
        solicitante_id: solicitanteId,
        status: filtros.status,
      },
      orderBy: { criada_em: 'desc' },
      include: { itens: true }
    });
  }

  async findOne(id: string) {
    const solicitacao = await this.prisma.solicitacaoMaterial.findUnique({
      where: { id },
      include: { itens: true },
    });

    if (!solicitacao) {
      throw new NotFoundException('Solicitação não encontrada.');
    }

    return solicitacao;
  }

  async update(id: string, dto: UpdateRequestDto) {
    const solicitacao = await this.findOne(id);

    if (solicitacao.status !== 'PENDENTE') {
      throw new BadRequestException('Apenas solicitações pendentes podem ser alteradas.');
    }

    return this.prisma.solicitacaoMaterial.update({
      where: { id },
      data: {
        finalidade: dto.finalidade,
        descricao: dto.descricao,
        ...(dto.itens ? {
          itens: {
            deleteMany: {},
            create: dto.itens.map(item => ({
              insumo_id: item.insumo_id,
              quantidade: item.quantidade
            }))
          }
        } : {})
      },
      include: { itens: true }
    });
  }

  async approve(id: string, tecnicoId: string) {
    const solicitacao = await this.findOne(id);

    if (solicitacao.status !== 'PENDENTE') {
      throw new BadRequestException('Esta solicitação não está pendente.');
    }

    if (solicitacao.itens && solicitacao.itens.length > 0) {
      const itensFormatados = solicitacao.itens.map(item => ({
        insumo_id: item.insumo_id,
        quantidade: Number(item.quantidade)
      }));

      await this.inventoryService.darBaixaEstoque(itensFormatados, tecnicoId, id);
    }

    return this.prisma.solicitacaoMaterial.update({
      where: { id },
      data: {
        status: 'APROVADA',
        tecnico_id: tecnicoId,
        aprovada_em: new Date(),
      },
    });
  }

  async reject(id: string, tecnicoId: string, motivo: string) {
    const solicitacao = await this.findOne(id);

    if (solicitacao.status !== 'PENDENTE') {
      throw new BadRequestException('Esta solicitação não está pendente.');
    }

    return this.prisma.solicitacaoMaterial.update({
      where: { id },
      data: {
        status: 'REJEITADA',
        tecnico_id: tecnicoId,
        motivo_rejeicao: motivo,
      },
    });
  }
}
