-- DropForeignKey
ALTER TABLE "HistoricoMovimentacao" DROP CONSTRAINT "HistoricoMovimentacao_solicitacao_id_fkey";

-- AlterTable
ALTER TABLE "HistoricoMovimentacao" ALTER COLUMN "solicitacao_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "HistoricoMovimentacao" ADD CONSTRAINT "HistoricoMovimentacao_solicitacao_id_fkey" FOREIGN KEY ("solicitacao_id") REFERENCES "SolicitacaoMaterial"("id") ON DELETE SET NULL ON UPDATE CASCADE;
