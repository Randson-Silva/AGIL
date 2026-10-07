/*
  Warnings:

  - You are about to drop the column `status` on the `Insumo` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "StatusAlerta" AS ENUM ('PENDENTE', 'REPOSICAO_SOLICITADA', 'RESOLVIDO');

-- CreateEnum
CREATE TYPE "StatusInsumo" AS ENUM ('CRITICO', 'ESTAVEL', 'NAO_APLICAVEL');

-- CreateEnum
CREATE TYPE "NaturezaPatrimonial" AS ENUM ('TOMBADO', 'CONSUMO');

-- AlterTable
ALTER TABLE "Equipamento" ADD COLUMN     "numero_patrimonio" TEXT;

-- AlterTable
ALTER TABLE "Insumo" DROP COLUMN "status",
ADD COLUMN     "natureza_patrimonial" "NaturezaPatrimonial" NOT NULL DEFAULT 'CONSUMO',
ADD COLUMN     "statusInsumo" "StatusInsumo" NOT NULL DEFAULT 'NAO_APLICAVEL';

-- CreateTable
CREATE TABLE "AlertaEstoque" (
    "id" TEXT NOT NULL,
    "insumo_id" TEXT NOT NULL,
    "quantidade_momento" DECIMAL(10,3) NOT NULL,
    "data_alerta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "StatusAlerta" NOT NULL DEFAULT 'PENDENTE',
    "data_resolucao" TIMESTAMP(3),
    "quantidade_resolucao" DECIMAL(10,3),

    CONSTRAINT "AlertaEstoque_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AlertaEstoque" ADD CONSTRAINT "AlertaEstoque_insumo_id_fkey" FOREIGN KEY ("insumo_id") REFERENCES "Insumo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
