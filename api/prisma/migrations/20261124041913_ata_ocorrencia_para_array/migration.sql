/*
  Warnings:

  - You are about to drop the column `ocorrencia` on the `AtaUso` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AtaUso" DROP COLUMN "ocorrencia",
ADD COLUMN     "ocorrencias" "TipoOcorrenciaAta"[] DEFAULT ARRAY['SEM_INTERCORRENCIAS']::"TipoOcorrenciaAta"[];
