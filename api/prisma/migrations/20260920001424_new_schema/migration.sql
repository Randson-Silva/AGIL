/*
  Warnings:

  - You are about to drop the `InsumoVidraria` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "CategoriaInsumo" AS ENUM ('EQUIPAMENTO', 'VIDRARIA', 'SOLUCAO', 'REAGENTE');

-- DropForeignKey
ALTER TABLE "AvariaReportada" DROP CONSTRAINT "AvariaReportada_insumo_id_fkey";

-- DropForeignKey
ALTER TABLE "SolicitacaoMaterial" DROP CONSTRAINT "SolicitacaoMaterial_insumo_id_fkey";

-- DropTable
DROP TABLE "InsumoVidraria";

-- CreateTable
CREATE TABLE "Insumo" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "categoria" "CategoriaInsumo" NOT NULL,
    "quantidade_saldo" INTEGER NOT NULL,
    "localizacao" TEXT,
    "quantidade_minima" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'Disponível',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Insumo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reagente" (
    "id" TEXT NOT NULL,
    "insumo_id" TEXT NOT NULL,
    "formula" TEXT,
    "cas" TEXT,
    "marca" TEXT,
    "observacao" TEXT,

    CONSTRAINT "Reagente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Solucao" (
    "id" TEXT NOT NULL,
    "insumo_id" TEXT NOT NULL,
    "formula" TEXT,
    "cas" TEXT,
    "observacao" TEXT,

    CONSTRAINT "Solucao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Equipamento" (
    "id" TEXT NOT NULL,
    "insumo_id" TEXT NOT NULL,
    "marca" TEXT,
    "modelo" TEXT,
    "voltagem" TEXT,

    CONSTRAINT "Equipamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vidraria" (
    "id" TEXT NOT NULL,
    "insumo_id" TEXT NOT NULL,
    "marca" TEXT,
    "capacidade" TEXT,

    CONSTRAINT "Vidraria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Reagente_insumo_id_key" ON "Reagente"("insumo_id");

-- CreateIndex
CREATE UNIQUE INDEX "Solucao_insumo_id_key" ON "Solucao"("insumo_id");

-- CreateIndex
CREATE UNIQUE INDEX "Equipamento_insumo_id_key" ON "Equipamento"("insumo_id");

-- CreateIndex
CREATE UNIQUE INDEX "Vidraria_insumo_id_key" ON "Vidraria"("insumo_id");

-- AddForeignKey
ALTER TABLE "Reagente" ADD CONSTRAINT "Reagente_insumo_id_fkey" FOREIGN KEY ("insumo_id") REFERENCES "Insumo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Solucao" ADD CONSTRAINT "Solucao_insumo_id_fkey" FOREIGN KEY ("insumo_id") REFERENCES "Insumo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipamento" ADD CONSTRAINT "Equipamento_insumo_id_fkey" FOREIGN KEY ("insumo_id") REFERENCES "Insumo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vidraria" ADD CONSTRAINT "Vidraria_insumo_id_fkey" FOREIGN KEY ("insumo_id") REFERENCES "Insumo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitacaoMaterial" ADD CONSTRAINT "SolicitacaoMaterial_insumo_id_fkey" FOREIGN KEY ("insumo_id") REFERENCES "Insumo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvariaReportada" ADD CONSTRAINT "AvariaReportada_insumo_id_fkey" FOREIGN KEY ("insumo_id") REFERENCES "Insumo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
