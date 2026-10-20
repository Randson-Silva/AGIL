-- AlterTable
ALTER TABLE "ReservaEspaco" ADD COLUMN     "quantidade_grupos" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "quantidade_alunos" SET DEFAULT 0;
