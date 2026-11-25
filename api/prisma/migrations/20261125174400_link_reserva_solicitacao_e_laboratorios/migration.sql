-- AlterTable
ALTER TABLE "SolicitacaoMaterial" ADD COLUMN     "devolucao_informada_em" TIMESTAMP(3),
ADD COLUMN     "objetivo" "ObjetivoReserva",
ADD COLUMN     "reserva_id" TEXT;

-- AlterTable
ALTER TABLE "ItemSolicitacaoMaterial" ADD COLUMN     "quantidade_devolvida" DECIMAL(10,3);

-- CreateTable
CREATE TABLE "Laboratorio" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "localizacao" TEXT,
    "capacidade" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Laboratorio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Laboratorio_nome_key" ON "Laboratorio"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "SolicitacaoMaterial_reserva_id_key" ON "SolicitacaoMaterial"("reserva_id");

-- AddForeignKey
ALTER TABLE "SolicitacaoMaterial" ADD CONSTRAINT "SolicitacaoMaterial_reserva_id_fkey" FOREIGN KEY ("reserva_id") REFERENCES "ReservaEspaco"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed initial laboratories
INSERT INTO "Laboratorio" ("id", "nome", "localizacao", "capacidade", "ativo", "created_at")
VALUES
    (gen_random_uuid()::text, 'Lab. de Química Geral', 'Bloco B · Sala 12', 30, true, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'Lab. de Química Orgânica', 'Bloco B · Sala 12', 24, true, CURRENT_TIMESTAMP)
ON CONFLICT ("nome") DO NOTHING;
