import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const migrationsDir = resolve(process.cwd(), 'prisma', 'migrations');

describe('Task 01 - CA-02: migration preserva registros legados com colunas nullable', () => {
  const migrationFolder = readdirSync(migrationsDir).find((name) =>
    name.endsWith('_link_reserva_solicitacao_e_laboratorios'),
  );

  it('possui a pasta de migration link_reserva_solicitacao_e_laboratorios com migration.sql', () => {
    expect(migrationFolder).toBeDefined();
    const sqlPath = resolve(migrationsDir, migrationFolder!, 'migration.sql');
    expect(existsSync(sqlPath)).toBe(true);
  });

  it('adiciona reserva_id, objetivo, devolucao_informada_em e quantidade_devolvida aceitando NULL', () => {
    const sql = readFileSync(
      resolve(migrationsDir, migrationFolder!, 'migration.sql'),
      'utf-8',
    );

    const alterSolicitacao =
      sql.match(/ALTER TABLE "SolicitacaoMaterial"[\s\S]*?;/)?.[0] ?? '';
    expect(alterSolicitacao).toContain('"devolucao_informada_em" TIMESTAMP(3)');
    expect(alterSolicitacao).toContain('"objetivo" "ObjetivoReserva"');
    expect(alterSolicitacao).toContain('"reserva_id" TEXT');
    expect(alterSolicitacao).not.toContain('NOT NULL');

    const alterItem =
      sql.match(/ALTER TABLE "ItemSolicitacaoMaterial"[\s\S]*?;/)?.[0] ?? '';
    expect(alterItem).toContain('"quantidade_devolvida" DECIMAL(10,3)');
    expect(alterItem).not.toContain('NOT NULL');
  });

  it('cria tabela Laboratorio, índice único de reserva_id e FK com ON DELETE SET NULL', () => {
    const sql = readFileSync(
      resolve(migrationsDir, migrationFolder!, 'migration.sql'),
      'utf-8',
    );

    expect(sql).toContain('CREATE TABLE "Laboratorio"');
    expect(sql).toContain('CREATE UNIQUE INDEX "Laboratorio_nome_key" ON "Laboratorio"("nome")');
    expect(sql).toContain(
      'CREATE UNIQUE INDEX "SolicitacaoMaterial_reserva_id_key" ON "SolicitacaoMaterial"("reserva_id")',
    );
    expect(sql).toContain(
      'FOREIGN KEY ("reserva_id") REFERENCES "ReservaEspaco"("id") ON DELETE SET NULL ON UPDATE CASCADE',
    );
  });
});
