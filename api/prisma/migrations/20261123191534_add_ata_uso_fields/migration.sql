/*
  Warnings:

  - A unique constraint covering the columns `[codigo]` on the table `AtaUso` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "StatusAta" AS ENUM ('PENDENTE', 'EM_ANALISE', 'RESOLVIDA');

-- CreateEnum
CREATE TYPE "TipoOcorrenciaAta" AS ENUM ('SEM_INTERCORRENCIAS', 'AVARIA_MATERIAL', 'FALTA_REAGENTE', 'INCIDENTE_SEGURANCA');

-- AlterTable
ALTER TABLE "AtaUso" ADD COLUMN     "analisadaEm" TIMESTAMP(3),
ADD COLUMN     "codigo" SERIAL NOT NULL,
ADD COLUMN     "ocorrencia" "TipoOcorrenciaAta" NOT NULL DEFAULT 'SEM_INTERCORRENCIAS',
ADD COLUMN     "pendenciasTecnico" TEXT,
ADD COLUMN     "relatoAula" TEXT,
ADD COLUMN     "resolvidaEm" TIMESTAMP(3),
ADD COLUMN     "status" "StatusAta" NOT NULL DEFAULT 'PENDENTE',
ADD COLUMN     "tecnicoId" TEXT;

-- AlterTable
ALTER TABLE "AvariaReportada" ADD COLUMN     "ata_uso_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "AtaUso_codigo_key" ON "AtaUso"("codigo");

-- AddForeignKey
ALTER TABLE "AvariaReportada" ADD CONSTRAINT "AvariaReportada_ata_uso_id_fkey" FOREIGN KEY ("ata_uso_id") REFERENCES "AtaUso"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AtaUso" ADD CONSTRAINT "AtaUso_tecnicoId_fkey" FOREIGN KEY ("tecnicoId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
