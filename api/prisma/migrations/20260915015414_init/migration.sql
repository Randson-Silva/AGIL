-- CreateEnum
CREATE TYPE "Perfil" AS ENUM ('TECNICO', 'PROFESSOR', 'ALUNO');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "perfil" "Perfil" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReservaEspaco" (
    "id" TEXT NOT NULL,
    "professor_id" TEXT NOT NULL,
    "data_inicio" TIMESTAMP(3) NOT NULL,
    "data_fim" TIMESTAMP(3) NOT NULL,
    "prioridade" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReservaEspaco_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsumoVidraria" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "quantidade_saldo" INTEGER NOT NULL,
    "quantidade_minima" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InsumoVidraria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SolicitacaoMaterial" (
    "id" TEXT NOT NULL,
    "solicitante_id" TEXT NOT NULL,
    "insumo_id" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "data_retirada" TIMESTAMP(3) NOT NULL,
    "data_limite" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "SolicitacaoMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvariaReportada" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "insumo_id" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "data_reporte" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AvariaReportada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoricoMovimentacao" (
    "id" TEXT NOT NULL,
    "solicitacao_id" TEXT NOT NULL,
    "acao" TEXT NOT NULL,
    "data_evento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observacao" TEXT,

    CONSTRAINT "HistoricoMovimentacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- AddForeignKey
ALTER TABLE "ReservaEspaco" ADD CONSTRAINT "ReservaEspaco_professor_id_fkey" FOREIGN KEY ("professor_id") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitacaoMaterial" ADD CONSTRAINT "SolicitacaoMaterial_solicitante_id_fkey" FOREIGN KEY ("solicitante_id") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitacaoMaterial" ADD CONSTRAINT "SolicitacaoMaterial_insumo_id_fkey" FOREIGN KEY ("insumo_id") REFERENCES "InsumoVidraria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvariaReportada" ADD CONSTRAINT "AvariaReportada_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvariaReportada" ADD CONSTRAINT "AvariaReportada_insumo_id_fkey" FOREIGN KEY ("insumo_id") REFERENCES "InsumoVidraria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoricoMovimentacao" ADD CONSTRAINT "HistoricoMovimentacao_solicitacao_id_fkey" FOREIGN KEY ("solicitacao_id") REFERENCES "SolicitacaoMaterial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
