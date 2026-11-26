import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const migrationsDir = resolve(process.cwd(), 'prisma', 'migrations');

describe('Task 01 - CA-03: tabela Laboratorio inicia populada com os laboratórios padrão', () => {
  const migrationFolder = readdirSync(migrationsDir).find((name) =>
    name.endsWith('_link_reserva_solicitacao_e_laboratorios'),
  );

  it('insere Lab. de Química Geral (cap. 30) e Lab. de Química Orgânica (cap. 24) ativos e idempotentes', () => {
    expect(migrationFolder).toBeDefined();
    const sql = readFileSync(
      resolve(migrationsDir, migrationFolder!, 'migration.sql'),
      'utf-8',
    );

    expect(sql).toContain('INSERT INTO "Laboratorio"');
    expect(sql).toMatch(
      /'Lab\. de Química Geral',\s*'Bloco B · Sala 12',\s*30,\s*true/,
    );
    expect(sql).toMatch(
      /'Lab\. de Química Orgânica',\s*'Bloco B · Sala 12',\s*24,\s*true/,
    );
    expect(sql).toContain('ON CONFLICT ("nome") DO NOTHING');
  });
});
