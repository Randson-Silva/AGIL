/*
  Warnings:

  - You are about to drop the column `data_fim` on the `ReservaEspaco` table. All the data in the column will be lost.
  - You are about to drop the column `data_inicio` on the `ReservaEspaco` table. All the data in the column will be lost.
  - You are about to drop the column `prioridade` on the `ReservaEspaco` table. All the data in the column will be lost.
  - The `status` column on the `ReservaEspaco` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `data_reserva` to the `ReservaEspaco` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dia_semana` to the `ReservaEspaco` table without a default value. This is not possible if the table is not empty.
  - Added the required column `local` to the `ReservaEspaco` table without a default value. This is not possible if the table is not empty.
  - Added the required column `objetivo` to the `ReservaEspaco` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantidade_alunos` to the `ReservaEspaco` table without a default value. This is not possible if the table is not empty.
  - Added the required column `titulo` to the `ReservaEspaco` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ObjetivoReserva" AS ENUM ('AULA_PRATICA', 'PROJETO_EXTENSAO', 'TCC', 'PESQUISA');

-- CreateEnum
CREATE TYPE "StatusReserva" AS ENUM ('PENDENTE', 'AVISO_SIMPLES', 'APROVADA', 'REJEITADA', 'CANCELADA');

-- AlterTable
ALTER TABLE "ReservaEspaco" DROP COLUMN "data_fim",
DROP COLUMN "data_inicio",
DROP COLUMN "prioridade",
ADD COLUMN     "data_reserva" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "dia_semana" INTEGER NOT NULL,
ADD COLUMN     "local" TEXT NOT NULL,
ADD COLUMN     "objetivo" "ObjetivoReserva" NOT NULL,
ADD COLUMN     "observacoes" TEXT,
ADD COLUMN     "pratica_recorrente" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "quantidade_alunos" INTEGER NOT NULL,
ADD COLUMN     "titulo" TEXT NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "StatusReserva" NOT NULL DEFAULT 'PENDENTE';

-- CreateTable
CREATE TABLE "HorarioReserva" (
    "id" TEXT NOT NULL,
    "reserva_id" TEXT NOT NULL,
    "hora_inicio" TEXT NOT NULL,
    "hora_fim" TEXT NOT NULL,

    CONSTRAINT "HorarioReserva_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "HorarioReserva" ADD CONSTRAINT "HorarioReserva_reserva_id_fkey" FOREIGN KEY ("reserva_id") REFERENCES "ReservaEspaco"("id") ON DELETE CASCADE ON UPDATE CASCADE;
