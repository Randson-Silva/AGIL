/*
  Warnings:

  - Added the required column `quantidade` to the `AvariaReportada` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipo_ocorrencia` to the `AvariaReportada` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TipoAvaria" AS ENUM ('QUEBRA', 'DEFEITO', 'CONTAMINACAO', 'EXTRAVIO', 'OUTRO');

-- AlterTable
ALTER TABLE "AvariaReportada" ADD COLUMN     "foto_url" TEXT,
ADD COLUMN     "quantidade" DECIMAL(10,3) NOT NULL,
ADD COLUMN     "tipo_ocorrencia" "TipoAvaria" NOT NULL,
ALTER COLUMN "descricao" DROP NOT NULL;
