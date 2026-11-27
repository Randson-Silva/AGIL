-- AlterTable
ALTER TABLE "SolicitacaoMaterial" ADD COLUMN     "professor_id" TEXT;

-- AddForeignKey
ALTER TABLE "SolicitacaoMaterial" ADD CONSTRAINT "SolicitacaoMaterial_professor_id_fkey" FOREIGN KEY ("professor_id") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
