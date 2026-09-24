/*
  Warnings:

  - You are about to alter the column `quantidade_saldo` on the `Insumo` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(10,3)`.
  - You are about to alter the column `quantidade_minima` on the `Insumo` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(10,3)`.
  - You are about to drop the column `data_limite` on the `SolicitacaoMaterial` table. All the data in the column will be lost.
  - You are about to drop the column `insumo_id` on the `SolicitacaoMaterial` table. All the data in the column will be lost.
  - You are about to drop the column `quantidade` on the `SolicitacaoMaterial` table. All the data in the column will be lost.
  - The `status` column on the `SolicitacaoMaterial` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `insumo_id` to the `HistoricoMovimentacao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantidade` to the `HistoricoMovimentacao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `saldo_anterior` to the `HistoricoMovimentacao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `saldo_posterior` to the `HistoricoMovimentacao` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `acao` on the `HistoricoMovimentacao` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `quantidade_minima` on table `Insumo` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `finalidade` to the `SolicitacaoMaterial` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sennha` to the `Usuario` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "StatusSolicitacao" AS ENUM ('PENDENTE', 'APROVADA', 'REJEITADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "TipoMovimentacao" AS ENUM ('SOLICITACAO', 'SAIDA', 'ENTRADA', 'DEVOLUCAO', 'AVARIA');

-- DropForeignKey
ALTER TABLE "SolicitacaoMaterial" DROP CONSTRAINT "SolicitacaoMaterial_insumo_id_fkey";

-- AlterTable
ALTER TABLE "HistoricoMovimentacao" ADD COLUMN     "insumo_id" TEXT NOT NULL,
ADD COLUMN     "quantidade" DECIMAL(10,3) NOT NULL,
ADD COLUMN     "saldo_anterior" DECIMAL(10,3) NOT NULL,
ADD COLUMN     "saldo_posterior" DECIMAL(10,3) NOT NULL,
ADD COLUMN     "usuarioId" TEXT,
DROP COLUMN "acao",
ADD COLUMN     "acao" "TipoMovimentacao" NOT NULL;

-- AlterTable
ALTER TABLE "Insumo" ALTER COLUMN "quantidade_saldo" SET DEFAULT 0,
ALTER COLUMN "quantidade_saldo" SET DATA TYPE DECIMAL(10,3),
ALTER COLUMN "quantidade_minima" SET NOT NULL,
ALTER COLUMN "quantidade_minima" SET DEFAULT 0,
ALTER COLUMN "quantidade_minima" SET DATA TYPE DECIMAL(10,3);

-- AlterTable
ALTER TABLE "SolicitacaoMaterial" DROP COLUMN "data_limite",
DROP COLUMN "insumo_id",
DROP COLUMN "quantidade",
ADD COLUMN     "aprovada_em" TIMESTAMP(3),
ADD COLUMN     "criada_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "descricao" TEXT,
ADD COLUMN     "finalidade" TEXT NOT NULL,
ADD COLUMN     "motivo_rejeicao" TEXT,
ADD COLUMN     "tecnico_id" TEXT,
ALTER COLUMN "data_retirada" DROP NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "StatusSolicitacao" NOT NULL DEFAULT 'PENDENTE';

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "sennha" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "ItemSolicitacaoMaterial" (
    "id" TEXT NOT NULL,
    "solicitacao_id" TEXT NOT NULL,
    "insumo_id" TEXT NOT NULL,
    "quantidade" DECIMAL(10,3) NOT NULL,

    CONSTRAINT "ItemSolicitacaoMaterial_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SolicitacaoMaterial" ADD CONSTRAINT "SolicitacaoMaterial_tecnico_id_fkey" FOREIGN KEY ("tecnico_id") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemSolicitacaoMaterial" ADD CONSTRAINT "ItemSolicitacaoMaterial_solicitacao_id_fkey" FOREIGN KEY ("solicitacao_id") REFERENCES "SolicitacaoMaterial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemSolicitacaoMaterial" ADD CONSTRAINT "ItemSolicitacaoMaterial_insumo_id_fkey" FOREIGN KEY ("insumo_id") REFERENCES "Insumo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoricoMovimentacao" ADD CONSTRAINT "HistoricoMovimentacao_insumo_id_fkey" FOREIGN KEY ("insumo_id") REFERENCES "Insumo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoricoMovimentacao" ADD CONSTRAINT "HistoricoMovimentacao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
