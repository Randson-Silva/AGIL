/*
  Warnings:

  - Made the column `data_validade` on table `Insumo` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Insumo" ALTER COLUMN "data_validade" SET NOT NULL;
