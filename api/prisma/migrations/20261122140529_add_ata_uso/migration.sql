-- AlterEnum
ALTER TYPE "StatusReserva" ADD VALUE 'CONCLUIDA_COM_ATA';

-- CreateTable
CREATE TABLE "AtaUso" (
    "id" TEXT NOT NULL,
    "reservaId" TEXT NOT NULL,
    "nomePratica" TEXT NOT NULL,
    "professorResponsavel" TEXT NOT NULL,
    "numeroAlunos" INTEGER NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AtaUso_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AtaUso_reservaId_key" ON "AtaUso"("reservaId");

-- AddForeignKey
ALTER TABLE "AtaUso" ADD CONSTRAINT "AtaUso_reservaId_fkey" FOREIGN KEY ("reservaId") REFERENCES "ReservaEspaco"("id") ON DELETE CASCADE ON UPDATE CASCADE;
