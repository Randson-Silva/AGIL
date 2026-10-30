-- AlterEnum
ALTER TYPE "StatusSolicitacao" ADD VALUE 'DEVOLVIDA';

-- AlterTable
ALTER TABLE "ReservaEspaco" ADD COLUMN     "motivo_rejeicao" TEXT;

-- AlterTable
ALTER TABLE "SolicitacaoMaterial" ADD COLUMN     "data_devolucao" TIMESTAMP(3),
ADD COLUMN     "devolvida_em" TIMESTAMP(3);
