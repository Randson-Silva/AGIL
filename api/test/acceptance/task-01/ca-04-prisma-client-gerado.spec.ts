import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  ObjetivoReserva,
  Prisma,
} from '../../../src/generated/prisma/client.js';

describe('Task 01 - CA-04: Prisma Client gerado expõe os novos models e campos', () => {
  it('expõe o model Laboratorio e seus campos escalares no Prisma namespace', () => {
    expect(Prisma.ModelName.Laboratorio).toBe('Laboratorio');
    expect(Prisma.LaboratorioScalarFieldEnum).toEqual({
      id: 'id',
      nome: 'nome',
      localizacao: 'localizacao',
      capacidade: 'capacidade',
      ativo: 'ativo',
      created_at: 'created_at',
    });
  });

  it('expõe reserva_id, objetivo, devolucao_informada_em e quantidade_devolvida nos enums escalares', () => {
    expect(Prisma.SolicitacaoMaterialScalarFieldEnum.reserva_id).toBe('reserva_id');
    expect(Prisma.SolicitacaoMaterialScalarFieldEnum.objetivo).toBe('objetivo');
    expect(Prisma.SolicitacaoMaterialScalarFieldEnum.devolucao_informada_em).toBe(
      'devolucao_informada_em',
    );
    expect(Prisma.ItemSolicitacaoMaterialScalarFieldEnum.quantidade_devolvida).toBe(
      'quantidade_devolvida',
    );
  });

  it('expõe tipagens TypeScript da relação 1:1 opcional e dos novos campos nullable', () => {
    expectTypeOf<Prisma.ReservaEspacoInclude>().toHaveProperty('solicitacaoMaterial');
    expectTypeOf<Prisma.SolicitacaoMaterialInclude>().toHaveProperty('reserva');

    const labInput: Prisma.LaboratorioCreateInput = {
      nome: 'Lab. de Química Geral',
      localizacao: 'Bloco B · Sala 12',
      capacidade: 30,
      ativo: true,
    };
    expect(labInput.capacidade).toBe(30);

    const solicitacaoData: Prisma.SolicitacaoMaterialUncheckedCreateInput = {
      solicitante_id: 'user-1',
      finalidade: 'Aula prática',
      reserva_id: null,
      objetivo: ObjetivoReserva.AULA_PRATICA,
      devolucao_informada_em: null,
    };
    expect(solicitacaoData.objetivo).toBe(ObjetivoReserva.AULA_PRATICA);

    const itemData: Prisma.ItemSolicitacaoMaterialUncheckedCreateInput = {
      solicitacao_id: 'sol-1',
      insumo_id: 'ins-1',
      quantidade: 2,
      quantidade_devolvida: null,
    };
    expect(itemData.quantidade_devolvida).toBeNull();
  });
});
