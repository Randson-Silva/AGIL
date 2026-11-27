import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../db/prisma/prisma.service.js';
import { InventoryService } from '../inventory/inventory.service.js';
import { CreateRequestDto } from './dto/create-request-module.dto.js';
import { ListRequestDto } from './dto/list-request-module.dto.js';
import { UpdateRequestDto } from './dto/update-request-module.dto.js';

const REQUEST_RELATIONS = {
  solicitante: {
    select: {
      id: true,
      nome: true,
      email: true,
      perfil: true,
    },
  },
  professor: {
    select: {
      id: true,
      nome: true,
      email: true,
      perfil: true,
    },
  },
  itens: {
    include: {
      insumo: {
        select: {
          id: true,
          nome: true,
          tipo_medida: true,
          categoria: true,
        },
      },
    },
  },
} as const;

@Injectable()
export class RequestModuleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly inventoryService: InventoryService,
  ) {}

  private async validateRequestItems(
    itens?: { insumo_id: string }[],
  ): Promise<void> {
    if (!itens || itens.length === 0) return;

    const insumoIds = itens.map((item) => item.insumo_id);

    const insumos = await this.prisma.insumo.findMany({
      where: { id: { in: insumoIds } },
      include: { equipamentoInfo: true },
    });

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    for (const item of itens) {
      const insumo = insumos.find((i) => i.id === item.insumo_id);

      if (!insumo) {
        throw new NotFoundException(`Insumo não encontrado.`);
      }

      if (insumo.equipamentoInfo?.uso_restrito) {
        throw new BadRequestException(
          `O equipamento '${insumo.nome}' não pode ser retirado do laboratório`,
        );
      }

      if (insumo.categoria === 'REAGENTE' && insumo.data_validade) {
        const dataValidade = new Date(insumo.data_validade);
        dataValidade.setHours(0, 0, 0, 0);

        if (dataValidade < hoje) {
          throw new BadRequestException(
            `O reagente '${insumo.nome}' está com a validade expirada e não pode ser solicitado.`,
          );
        }
      }
    }
  }

  private async validateProfessor(professorId: string): Promise<void> {
    const professor = await this.prisma.usuario.findFirst({
      where: {
        id: professorId,
        perfil: 'PROFESSOR',
      },
      select: { id: true },
    });

    if (!professor) {
      throw new BadRequestException(
        'Professor responsável não encontrado ou não possui perfil de professor.',
      );
    }
  }

  async create(solicitanteId: string, dto: CreateRequestDto, role: string) {
    await this.validateRequestItems(dto.itens);

    const isPesquisaOuTcc =
      dto.objetivo === 'PESQUISA' || dto.objetivo === 'TCC';
    const requiresProfessor = role === 'ALUNO' && isPesquisaOuTcc;

    if (requiresProfessor && !dto.professor_id) {
      throw new BadRequestException(
        'É obrigatório selecionar um professor responsável para solicitações de Pesquisa ou TCC.',
      );
    }

    if (dto.professor_id) {
      await this.validateProfessor(dto.professor_id);
    }

    return this.prisma.solicitacaoMaterial.create({
      data: {
        solicitante_id: solicitanteId,
        objetivo: dto.objetivo ?? null,
        professor_id: dto.professor_id ?? null,
        finalidade: dto.finalidade ?? null,
        descricao: dto.descricao,
        data_retirada: dto.data_retirada
          ? new Date(dto.data_retirada)
          : undefined,
        data_devolucao: dto.data_devolucao
          ? new Date(dto.data_devolucao)
          : undefined,
        status: 'PENDENTE',
        itens: {
          create:
            dto.itens?.map((item) => ({
              insumo_id: item.insumo_id,
              quantidade: item.quantidade,
            })) || [],
        },
      },
      include: REQUEST_RELATIONS,
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
      include: REQUEST_RELATIONS,
    });
  }

  async findOne(id: string) {
    const solicitacao = await this.prisma.solicitacaoMaterial.findUnique({
      where: { id },
      include: REQUEST_RELATIONS,
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
      await this.validateRequestItems(dto.itens);
    }

    const nextObjetivo =
      dto.objetivo !== undefined ? dto.objetivo : solicitacao.objetivo;
    const nextProfessorId =
      dto.professor_id !== undefined
        ? dto.professor_id
        : solicitacao.professor_id;

    const isPesquisaOuTcc =
      nextObjetivo === 'PESQUISA' || nextObjetivo === 'TCC';

    if (
      solicitacao.solicitante.perfil === 'ALUNO' &&
      isPesquisaOuTcc &&
      !nextProfessorId
    ) {
      throw new BadRequestException(
        'É obrigatório selecionar um professor responsável para solicitações de Pesquisa ou TCC.',
      );
    }

    if (dto.professor_id) {
      await this.validateProfessor(dto.professor_id);
    }

    return this.prisma.solicitacaoMaterial.update({
      where: { id },
      data: {
        ...(dto.objetivo !== undefined && { objetivo: dto.objetivo }),
        ...(dto.professor_id !== undefined && {
          professor_id: dto.professor_id || null,
        }),
        finalidade: dto.finalidade,
        descricao: dto.descricao,
        ...(dto.data_retirada !== undefined && {
          data_retirada: dto.data_retirada ? new Date(dto.data_retirada) : null,
        }),
        ...(dto.data_devolucao !== undefined && {
          data_devolucao: dto.data_devolucao
            ? new Date(dto.data_devolucao)
            : null,
        }),
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
      include: REQUEST_RELATIONS,
    });
  }

  async approve(id: string, tecnicoId: string) {
    const solicitacao = await this.findOne(id);

    if (solicitacao.status !== 'PENDENTE') {
      throw new BadRequestException('Esta solicitação não está pendente.');
    }

    if (solicitacao.solicitante.perfil === 'ALUNO') {
      const intensForValidate = solicitacao.itens.map((item) => ({
        insumo_id: item.insumo_id,
        quantidade: Number(item.quantidade),
      }));
      await this.validateRequestForStudent(intensForValidate);
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
      include: REQUEST_RELATIONS,
    });
  }

  private async validateRequestForStudent(
    itensRequestStudent: { insumo_id: string; quantidade: number }[],
  ) {
    const insumoIds = itensRequestStudent.map((i) => i.insumo_id);

    const insumos = await this.prisma.insumo.findMany({
      where: { id: { in: insumoIds } },
      select: { id: true, nome: true, quantidade_saldo: true },
    });

    const requestTeacher = await this.prisma.itemSolicitacaoMaterial.findMany({
      where: {
        insumo_id: { in: insumoIds },
        solicitacao: {
          status: 'PENDENTE',
          solicitante: {
            perfil: 'PROFESSOR',
          },
        },
      },
      select: {
        insumo_id: true,
        quantidade: true,
      },
    });

    const allRequestTeacher = new Map<string, number>();
    for (const item of requestTeacher) {
      const current = allRequestTeacher.get(item.insumo_id) || 0;
      allRequestTeacher.set(item.insumo_id, current + Number(item.quantidade));
    }

    for (const item of itensRequestStudent) {
      const insumo = insumos.find((i) => i.id === item.insumo_id);
      if (!insumo) continue;

      const currentBalance = Number(insumo.quantidade_saldo);
      const requestTeacher = allRequestTeacher.get(item.insumo_id) || 0;
      const availableBalance = currentBalance - requestTeacher;

      if (item.quantidade > availableBalance) {
        throw new BadRequestException(
          `Não é possível aprovar a solicitação do aluno. O item '${insumo.nome}' possui ` +
            `${currentBalance} em estoque, mas ${requestTeacher} já estão reservados para solicitações pendentes de professores. ` +
            `Saldo livre disponível para alunos: ${Math.max(0, availableBalance)}`,
        );
      }
    }
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
      include: REQUEST_RELATIONS,
    });
  }

  async confirmReturn(id: string, tecnicoId: string) {
    const solicitacao = await this.findOne(id);

    if (solicitacao.status !== 'APROVADA') {
      throw new BadRequestException(
        'Apenas solicitações aprovadas podem ter a devolução confirmada.',
      );
    }

    if (solicitacao.itens && solicitacao.itens.length > 0) {
      const itensFormatados = solicitacao.itens.map((item) => ({
        insumo_id: item.insumo_id,
        quantidade: Number(item.quantidade),
      }));

      await this.inventoryService.returnStock(itensFormatados, tecnicoId, id);
    }

    return this.prisma.solicitacaoMaterial.update({
      where: { id },
      data: {
        status: 'DEVOLVIDA',
        devolvida_em: new Date(),
      },
      include: REQUEST_RELATIONS,
    });
  }

  async aceptRequest() {}

  async listResquets() {
    return this.prisma.solicitacaoMaterial.findMany({
      include: REQUEST_RELATIONS,
    });
  }

  async alertDevolution() {
    const today = new Date();

    const treeDaysFromNow = new Date(today);
    treeDaysFromNow.setDate(today.getDate() + 3);

    return this.prisma.solicitacaoMaterial.findMany({
      where: {
        status: 'APROVADA',
        data_devolucao: {
          gte: today,
          lte: treeDaysFromNow,
        },
      },
    });
  }

  async listMyHistory(
    solicitanteId: string,
    filters: {
      startDate?: string;
      endDate?: string;
      status?: string;
      search?: string;
    },
  ) {
    const { startDate, endDate, status = 'TODOS', search } = filters;

    const allFinalStatuses: ('APROVADA' | 'DEVOLVIDA' | 'REJEITADA')[] = [
      'APROVADA',
      'DEVOLVIDA',
      'REJEITADA',
    ];

    const normalizedStatus = status.toUpperCase();
    const selectedStatuses: ('APROVADA' | 'DEVOLVIDA' | 'REJEITADA')[] =
      normalizedStatus === 'APROVADA' || normalizedStatus === 'APROVADOS'
        ? ['APROVADA']
        : normalizedStatus === 'DEVOLVIDA' || normalizedStatus === 'DEVOLVIDOS'
          ? ['DEVOLVIDA']
          : normalizedStatus === 'REJEITADA' ||
              normalizedStatus === 'REJEITADOS'
            ? ['REJEITADA']
            : allFinalStatuses;

    const totalHistoryCount = await this.prisma.solicitacaoMaterial.count({
      where: {
        solicitante_id: solicitanteId,
        status: { in: allFinalStatuses },
      },
    });

    const requests = await this.prisma.solicitacaoMaterial.findMany({
      where: {
        solicitante_id: solicitanteId,
        status: { in: selectedStatuses },
      },
      include: REQUEST_RELATIONS,
      orderBy: { criada_em: 'desc' },
    });

    const startBound = startDate
      ? new Date(`${startDate}T00:00:00.000-03:00`).getTime()
      : null;
    const endBound = endDate
      ? new Date(`${endDate}T23:59:59.999-03:00`).getTime()
      : null;

    let items = requests.flatMap((req) => {
      const eventDate = req.devolvida_em ?? req.aprovada_em ?? req.criada_em;

      return req.itens.map((item) => ({
        id: `${req.id}-${item.id}`,
        solicitacaoId: req.id,
        materialId: item.insumo.id,
        materialNome: item.insumo.nome,
        categoria: item.insumo.categoria,
        unidadeMedida: item.insumo.tipo_medida,
        quantidade: Number(item.quantidade),
        status: req.status as 'APROVADA' | 'DEVOLVIDA' | 'REJEITADA',
        motivoRejeicao: req.motivo_rejeicao,
        criadaEm: req.criada_em,
        aprovadaEm: req.aprovada_em,
        devolvidaEm: req.devolvida_em,
        dataEvento: eventDate,
      }));
    });

    if (startBound !== null || endBound !== null) {
      items = items.filter((item) => {
        const time = new Date(item.dataEvento).getTime();
        if (startBound !== null && time < startBound) return false;
        if (endBound !== null && time > endBound) return false;
        return true;
      });
    }

    if (search && search.trim()) {
      const term = search.trim().toLowerCase();
      items = items.filter((item) =>
        item.materialNome.toLowerCase().includes(term),
      );
    }

    items.sort(
      (a, b) =>
        new Date(b.dataEvento).getTime() - new Date(a.dataEvento).getTime(),
    );

    return {
      hasAnyHistory: totalHistoryCount > 0,
      items,
    };
  }
}
