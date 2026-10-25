import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateRequestDto } from './dto/create-request-module.dto.js';
import { UpdateRequestDto } from './dto/update-request-module.dto.js';
import { ListRequestDto } from './dto/list-request-module.dto.js';
import { PrismaService } from '../db/prisma/prisma.service.js';
import { InventoryService } from '../inventory/inventory.service.js';

@Injectable()
export class RequestModuleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly inventoryService: InventoryService,
  ) {}

  private async validateRestrictedItems(
    itens?: { insumo_id: string }[],
  ): Promise<void> {
    if (!itens || itens.length === 0) return;

    const insumoIds = itens.map((item) => item.insumo_id);

    const insumos = await this.prisma.insumo.findMany({
      where: { id: { in: insumoIds } },
      include: { equipamentoInfo: true },
    });

    for (const item of itens) {
      const insumo = insumos.find((i) => i.id === item.insumo_id);

      if (!insumo) {
        throw new NotFoundException(`Insumo não encontrado.`);
      }

      if (insumo.equipamentoInfo?.uso_restrito) {
        throw new BadRequestException(
          'Este equipamento não pode ser retirado do laboratório',
        );
      }
    }
  }

  async create(solicitanteId: string, dto: CreateRequestDto) {
    await this.validateRestrictedItems(dto.itens);

    return this.prisma.solicitacaoMaterial.create({
      data: {
        solicitante_id: solicitanteId,
        finalidade: dto.finalidade,
        descricao: dto.descricao,
        status: 'PENDENTE',
        itens: {
          create:
            dto.itens?.map((item) => ({
              insumo_id: item.insumo_id,
              quantidade: item.quantidade,
            })) || [],
        },
      },
      include: { itens: true },
    });
  }

  async findAll(solicitanteId: string, role: string, filtros: ListRequestDto) {
    const where: any = {};

    if (role !== 'TECNICO') {
      where.solicitante_id = solicitanteId;
    }

    if (filtros.status) {
      where.status = filtros.status;
    }

    return await this.prisma.solicitacaoMaterial.findMany({
      where,
      orderBy: { criada_em: filtros.ordem ?? 'desc' },
      include: { itens: true },
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
      throw new BadRequestException(
        'Apenas solicitações pendentes podem ser alteradas.',
      );
    }

    if (dto.itens) {
      await this.validateRestrictedItems(dto.itens);
    }

    return this.prisma.solicitacaoMaterial.update({
      where: { id },
      data: {
        finalidade: dto.finalidade,
        descricao: dto.descricao,
        ...(dto.itens
          ? {
              itens: {
                deleteMany: {},
                create: dto.itens.map((item) => ({
                  insumo_id: item.insumo_id,
                  quantidade: item.quantidade,
                })),
              },
            }
          : {}),
      },
      include: { itens: true },
    });
  }

  async approve(id: string, tecnicoId: string) {
    const solicitacao = await this.findOne(id);

    if (solicitacao.status !== 'PENDENTE') {
      throw new BadRequestException('Esta solicitação não está pendente.');
    }

    if (solicitacao.itens && solicitacao.itens.length > 0) {
      const itensFormatados = solicitacao.itens.map((item) => ({
        insumo_id: item.insumo_id,
        quantidade: Number(item.quantidade),
      }));

      await this.inventoryService.updateStock(itensFormatados, tecnicoId, id);
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

  async aceptRequest() {}

  async listResquets() {
    return this.prisma.solicitacaoMaterial.findMany();
  }
}
