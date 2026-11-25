import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const apiRoot = resolve(process.cwd());
const schemaPath = resolve(apiRoot, 'prisma', 'schema.prisma');

describe('Task 01 - CA-01: schema.prisma válido com novos models, campos e relação 1:1 opcional', () => {
  const schemaContent = readFileSync(schemaPath, 'utf-8');

  it('valida o arquivo schema.prisma sem erros de sintaxe via Prisma CLI', () => {
    const prismaCli = resolve(apiRoot, 'node_modules', 'prisma', 'build', 'index.js');
    const output = execFileSync(
      process.execPath,
      [prismaCli, 'validate', '--config=prisma7.config.ts'],
      { cwd: apiRoot, encoding: 'utf-8' },
    );

    expect(output).toContain('is valid');
  });

  it('define o model Laboratorio com nome único, localizacao opcional, capacidade e ativo com defaults', () => {
    const labBlock = schemaContent.match(/model Laboratorio \{[\s\S]*?\n\}/)?.[0] ?? '';

    expect(labBlock).toContain('id          String   @id @default(uuid())');
    expect(labBlock).toContain('nome        String   @unique');
    expect(labBlock).toContain('localizacao String?');
    expect(labBlock).toContain('capacidade  Int      @default(0)');
    expect(labBlock).toContain('ativo       Boolean  @default(true)');
    expect(labBlock).toContain('created_at  DateTime @default(now())');
  });

  it('define relação 1:1 opcional ReservaEspaco <-> SolicitacaoMaterial e os novos campos', () => {
    const reservaBlock = schemaContent.match(/model ReservaEspaco \{[\s\S]*?\n\}/)?.[0] ?? '';
    const solicitacaoBlock =
      schemaContent.match(/model SolicitacaoMaterial \{[\s\S]*?\n\}/)?.[0] ?? '';
    const itemBlock =
      schemaContent.match(/model ItemSolicitacaoMaterial \{[\s\S]*?\n\}/)?.[0] ?? '';

    expect(reservaBlock).toMatch(/solicitacaoMaterial\s+SolicitacaoMaterial\?/);

    expect(solicitacaoBlock).toMatch(/reserva_id\s+String\?\s+@unique/);
    expect(solicitacaoBlock).toMatch(
      /reserva\s+ReservaEspaco\?\s+@relation\(fields:\s*\[reserva_id\],\s*references:\s*\[id\],\s*onDelete:\s*SetNull\)/,
    );
    expect(solicitacaoBlock).toMatch(/objetivo\s+ObjetivoReserva\?/);
    expect(solicitacaoBlock).toMatch(/devolucao_informada_em\s+DateTime\?/);

    expect(itemBlock).toMatch(/quantidade_devolvida\s+Decimal\?\s+@db\.Decimal\(10,\s*3\)/);
  });
});
