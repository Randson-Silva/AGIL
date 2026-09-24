/*
  Warnings:

  - Added the required column `tipo_medida` to the `Insumo` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MedidasEntidades" AS ENUM ('MG', 'G', 'KG', 'ML', 'L', 'UN');

-- AlterTable
ALTER TABLE "Insumo" ADD COLUMN     "data_validade" TIMESTAMP(3),
ADD COLUMN     "tipo_medida" "MedidasEntidades" NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
