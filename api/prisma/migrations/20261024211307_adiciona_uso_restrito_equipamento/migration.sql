/*
  Warnings:

  - You are about to drop the column `numero_patrimonio` on the `Equipamento` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Equipamento" DROP COLUMN "numero_patrimonio",
ADD COLUMN     "patrimonio" TEXT,
ADD COLUMN     "uso_restrito" BOOLEAN NOT NULL DEFAULT false;
