import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migracao Fase 2 - Modulo Fiscal completo
 * Novas tabelas: filiais_fiscais, nf_e, nf_item, eventos_nfe,
 * sped_registros, obrigacoes_fiscais, calendario_fiscal,
 * documentos_fiscais_arquivados, auditoria_fiscal, ncm_cest_relacionamento
 */
export class FiscalPhase21740000000000 implements MigrationInterface {
  name = 'FiscalPhase21740000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ============================
    // FILIAIS FISCAIS
    // ============================

    await queryRunner.query(`
      CREATE TABLE "filiais_fiscais" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "empresaMatrizId" uuid NOT NULL,
        "cnpj" varchar(14) NOT NULL,
        "inscricaoEstadual" varchar(14),
        "inscricaoMunicipal" varchar(15),
        "nomeFantasia" varchar(60),
        "tipoEstabelecimento" varchar(2) NOT NULL,
        "enderecoCodigoMunicipio" varchar(7) NOT NULL,
        "enderecoUf" varchar(2) NOT NULL,
        "nfeSerie" int NOT NULL DEFAULT 1,
        "nfceSerie" int NOT NULL DEFAULT 1,
        "icmsAliqInterna" decimal(5,2),
        "herdaConfiguracoes" boolean NOT NULL DEFAULT true,
        "ativo" boolean NOT NULL DEFAULT true,
        "criadoEm" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_filiais_fiscais" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_filiais_fiscais_tenant" ON "filiais_fiscais" ("tenantId")
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "idx_filiais_fiscais_cnpj" ON "filiais_fiscais" ("tenantId", "cnpj")
    `);

    // ============================
    // NF-e (Nota Fiscal Eletronica)
    // ============================

    await queryRunner.query(`
      CREATE TABLE "nf_e" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "empresaId" uuid NOT NULL,
        "chaveAcesso" varchar(44) NOT NULL,
        "numero" bigint NOT NULL,
        "serie" int NOT NULL DEFAULT 1,
        "modelo" varchar(2) NOT NULL DEFAULT '55',
        "dataEmissao" date NOT NULL,
        "dataSaidaEntrada" date,
        "horaSaidaEntrada" time,
        "tipoOperacao" varchar(1) NOT NULL,
        "finalidadeEmissao" varchar(1) NOT NULL DEFAULT '1',
        "naturezaOperacao" varchar(60),
        "emitenteCnpj" varchar(14),
        "emitenteNome" varchar(60),
        "emitenteIe" varchar(14),
        "emitenteUf" varchar(2),
        "destinatarioCnpjCpf" varchar(14),
        "destinatarioNome" varchar(60),
        "destinatarioIe" varchar(14),
        "destinatarioUf" varchar(2),
        "valorBaseCalculoIcms" decimal(15,2) NOT NULL DEFAULT 0,
        "valorIcms" decimal(15,2) NOT NULL DEFAULT 0,
        "valorBaseCalculoIcmsSt" decimal(15,2) NOT NULL DEFAULT 0,
        "valorIcmsSt" decimal(15,2) NOT NULL DEFAULT 0,
        "valorProdutos" decimal(15,2) NOT NULL DEFAULT 0,
        "valorFrete" decimal(15,2) NOT NULL DEFAULT 0,
        "valorSeguro" decimal(15,2) NOT NULL DEFAULT 0,
        "valorDesconto" decimal(15,2) NOT NULL DEFAULT 0,
        "valorIpi" decimal(15,2) NOT NULL DEFAULT 0,
        "valorPis" decimal(15,2) NOT NULL DEFAULT 0,
        "valorCofins" decimal(15,2) NOT NULL DEFAULT 0,
        "valorOutrasDespesas" decimal(15,2) NOT NULL DEFAULT 0,
        "valorTotal" decimal(15,2) NOT NULL DEFAULT 0,
        "valorAproximadoTributos" decimal(15,2) NOT NULL DEFAULT 0,
        "xmlAssinado" text,
        "xmlProtocolo" text,
        "xmlCancelamento" text,
        "xmlCce" text,
        "protocoloAutorizacao" varchar(15),
        "dataAutorizacao" timestamp,
        "protocoloCancelamento" varchar(15),
        "dataCancelamento" timestamp,
        "status" varchar(20) NOT NULL DEFAULT 'pendente',
        "situacao" varchar(2) NOT NULL DEFAULT '00',
        "motivoStatus" text,
        "idIntegracao" varchar(50),
        "origem" varchar(20) NOT NULL DEFAULT 'manual',
        "ativo" boolean NOT NULL DEFAULT true,
        "criadoEm" timestamp NOT NULL DEFAULT now(),
        "atualizadoEm" timestamp NOT NULL DEFAULT now(),
        "usuarioCadastro" uuid,
        "usuarioAtualizacao" uuid,
        CONSTRAINT "PK_nf_e" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_nfe_tenant" ON "nf_e" ("tenantId")`);
    await queryRunner.query(`CREATE INDEX "idx_nfe_empresa" ON "nf_e" ("empresaId")`);
    await queryRunner.query(`CREATE INDEX "idx_nfe_chave" ON "nf_e" ("chaveAcesso")`);
    await queryRunner.query(`CREATE INDEX "idx_nfe_numero" ON "nf_e" ("numero")`);
    await queryRunner.query(`CREATE INDEX "idx_nfe_emissao" ON "nf_e" ("dataEmissao")`);
    await queryRunner.query(`CREATE INDEX "idx_nfe_status" ON "nf_e" ("status")`);

    // ============================
    // NF-e ITENS
    // ============================

    await queryRunner.query(`
      CREATE TABLE "nf_item" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "nfeId" uuid NOT NULL,
        "numeroItem" int NOT NULL,
        "produtoId" uuid,
        "codigoProduto" varchar(60) NOT NULL,
        "descricaoProduto" varchar(120) NOT NULL,
        "ncm" varchar(8),
        "cest" varchar(7),
        "cfop" varchar(4),
        "unidadeComercial" varchar(6) NOT NULL,
        "quantidadeComercial" decimal(15,4) NOT NULL,
        "valorUnitarioComercial" decimal(15,10) NOT NULL,
        "unidadeTributavel" varchar(6),
        "quantidadeTributavel" decimal(15,4),
        "valorUnitarioTributavel" decimal(15,10),
        "valorTotal" decimal(15,2) NOT NULL,
        "valorDesconto" decimal(15,2) NOT NULL DEFAULT 0,
        "valorFrete" decimal(15,2) NOT NULL DEFAULT 0,
        "valorSeguro" decimal(15,2) NOT NULL DEFAULT 0,
        "valorOutrasDespesas" decimal(15,2) NOT NULL DEFAULT 0,
        "icmsOrigem" varchar(1) NOT NULL DEFAULT '0',
        "icmsCst" varchar(3),
        "icmsModalidadeBc" varchar(1) NOT NULL DEFAULT '3',
        "icmsReducaoBc" decimal(5,2) NOT NULL DEFAULT 0,
        "icmsBaseCalculo" decimal(15,2) NOT NULL DEFAULT 0,
        "icmsAliquota" decimal(5,2) NOT NULL DEFAULT 0,
        "icmsValor" decimal(15,2) NOT NULL DEFAULT 0,
        "icmsStModalidadeBc" varchar(1),
        "icmsStMva" decimal(7,4) NOT NULL DEFAULT 0,
        "icmsStReducaoBc" decimal(5,2) NOT NULL DEFAULT 0,
        "icmsStBaseCalculo" decimal(15,2) NOT NULL DEFAULT 0,
        "icmsStAliquota" decimal(5,2) NOT NULL DEFAULT 0,
        "icmsStValor" decimal(15,2) NOT NULL DEFAULT 0,
        "ipiCst" varchar(2),
        "ipiCodigoEnquadramento" varchar(3),
        "ipiBaseCalculo" decimal(15,2) NOT NULL DEFAULT 0,
        "ipiAliquota" decimal(5,2) NOT NULL DEFAULT 0,
        "ipiValor" decimal(15,2) NOT NULL DEFAULT 0,
        "pisCst" varchar(2),
        "pisBaseCalculo" decimal(15,2) NOT NULL DEFAULT 0,
        "pisAliquota" decimal(5,2) NOT NULL DEFAULT 0,
        "pisValor" decimal(15,2) NOT NULL DEFAULT 0,
        "cofinsCst" varchar(2),
        "cofinsBaseCalculo" decimal(15,2) NOT NULL DEFAULT 0,
        "cofinsAliquota" decimal(5,2) NOT NULL DEFAULT 0,
        "cofinsValor" decimal(15,2) NOT NULL DEFAULT 0,
        "icmsCsosn" varchar(3),
        "icmsCreditoSn" decimal(5,2) NOT NULL DEFAULT 0,
        "icmsValorCreditoSn" decimal(15,2) NOT NULL DEFAULT 0,
        "informacaoAdicional" text,
        "numeroPedidoCompra" varchar(15),
        "itemPedidoCompra" int,
        CONSTRAINT "PK_nf_item" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_nf_item_nfe" ON "nf_item" ("nfeId")`);
    await queryRunner.query(`CREATE INDEX "idx_nf_item_produto" ON "nf_item" ("produtoId")`);
    await queryRunner.query(`CREATE INDEX "idx_nf_item_ncm" ON "nf_item" ("ncm")`);

    // ============================
    // EVENTOS NF-e
    // ============================

    await queryRunner.query(`
      CREATE TABLE "eventos_nfe" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "nfeId" uuid NOT NULL,
        "tipoEvento" varchar(6) NOT NULL,
        "sequencial" int NOT NULL,
        "descricaoEvento" varchar(60),
        "protocolo" varchar(15),
        "dataEvento" timestamp,
        "xmlEvento" text,
        "correcao" text,
        "justificativa" text,
        "status" varchar(20) NOT NULL DEFAULT 'pendente',
        "criadoEm" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_eventos_nfe" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_eventos_nfe_nfe" ON "eventos_nfe" ("nfeId")`);
    await queryRunner.query(`CREATE INDEX "idx_eventos_nfe_tipo" ON "eventos_nfe" ("tipoEvento")`);

    // ============================
    // SPED REGISTROS
    // ============================

    await queryRunner.query(`
      CREATE TABLE "sped_registros" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "empresaId" uuid NOT NULL,
        "tipoSped" varchar(20) NOT NULL,
        "periodoAno" int NOT NULL,
        "periodoMes" int,
        "nomeArquivo" varchar(100),
        "conteudoArquivo" text,
        "hashArquivo" varchar(64),
        "status" varchar(20) NOT NULL DEFAULT 'gerado',
        "dataTransmissao" timestamp,
        "recibo" varchar(50),
        "numeroControle" varchar(50),
        "errosValidacao" text,
        "criadoEm" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_sped_registros" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_sped_empresa" ON "sped_registros" ("empresaId")`);
    await queryRunner.query(`CREATE INDEX "idx_sped_tipo" ON "sped_registros" ("tipoSped")`);
    await queryRunner.query(`CREATE INDEX "idx_sped_periodo" ON "sped_registros" ("periodoAno", "periodoMes")`);

    // ============================
    // OBRIGACOES FISCAIS
    // ============================

    await queryRunner.query(`
      CREATE TABLE "obrigacoes_fiscais" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "empresaId" uuid NOT NULL,
        "codigo" varchar(10) NOT NULL,
        "descricao" varchar(100) NOT NULL,
        "tipoObrigacao" varchar(20) NOT NULL,
        "periodicidade" varchar(10) NOT NULL,
        "diaVencimento" int NOT NULL,
        "mesVencimento" int,
        "imposto" varchar(10),
        "codigoReceita" varchar(4),
        "competenciaAno" int NOT NULL,
        "competenciaMes" int,
        "dataVencimento" date NOT NULL,
        "dataApuracao" date,
        "dataEntrega" date,
        "dataPagamento" date,
        "valorDevido" decimal(15,2) NOT NULL DEFAULT 0,
        "valorPago" decimal(15,2) NOT NULL DEFAULT 0,
        "valorMulta" decimal(15,2) NOT NULL DEFAULT 0,
        "valorJuros" decimal(15,2) NOT NULL DEFAULT 0,
        "status" varchar(20) NOT NULL DEFAULT 'pendente',
        "arquivoGerado" text,
        "arquivoRetorno" text,
        "numeroDocumento" varchar(50),
        "observacoes" text,
        "ativo" boolean NOT NULL DEFAULT true,
        "criadoEm" timestamp NOT NULL DEFAULT now(),
        "atualizadoEm" timestamp NOT NULL DEFAULT now(),
        "usuarioCadastro" uuid,
        "usuarioAtualizacao" uuid,
        CONSTRAINT "PK_obrigacoes_fiscais" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_obrigacoes_tenant" ON "obrigacoes_fiscais" ("tenantId")`);
    await queryRunner.query(`CREATE INDEX "idx_obrigacoes_empresa" ON "obrigacoes_fiscais" ("empresaId")`);
    await queryRunner.query(`CREATE INDEX "idx_obrigacoes_vencimento" ON "obrigacoes_fiscais" ("dataVencimento")`);
    await queryRunner.query(`CREATE INDEX "idx_obrigacoes_status" ON "obrigacoes_fiscais" ("status")`);
    await queryRunner.query(`CREATE INDEX "idx_obrigacoes_competencia" ON "obrigacoes_fiscais" ("competenciaAno", "competenciaMes")`);

    // ============================
    // CALENDARIO FISCAL
    // ============================

    await queryRunner.query(`
      CREATE TABLE "calendario_fiscal" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "codigo" varchar(10) NOT NULL,
        "descricao" varchar(100) NOT NULL,
        "tipoObrigacao" varchar(20) NOT NULL,
        "periodicidade" varchar(10) NOT NULL,
        "diaVencimento" int NOT NULL,
        "mesVencimento" int,
        "antecipaFeriado" boolean NOT NULL DEFAULT true,
        "antecipaFds" boolean NOT NULL DEFAULT true,
        "regimeTributario" text[],
        "ufAplicavel" text[],
        "imposto" varchar(10),
        "codigoReceita" varchar(4),
        "diasAlerta" int NOT NULL DEFAULT 5,
        "ativo" boolean NOT NULL DEFAULT true,
        CONSTRAINT "PK_calendario_fiscal" PRIMARY KEY ("id")
      )
    `);

    // ============================
    // DOCUMENTOS FISCAIS ARQUIVADOS
    // ============================

    await queryRunner.query(`
      CREATE TABLE "documentos_fiscais_arquivados" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "empresaId" uuid NOT NULL,
        "tipoDocumento" varchar(20) NOT NULL,
        "numeroDocumento" varchar(50),
        "chaveAcesso" varchar(44),
        "serie" varchar(3),
        "numero" bigint,
        "dataEmissao" date,
        "competenciaAno" int,
        "competenciaMes" int,
        "nomeArquivo" varchar(255),
        "caminhoArquivo" text NOT NULL,
        "tamanhoArquivo" bigint,
        "hashArquivo" varchar(64),
        "mimeType" varchar(50),
        "xmlConteudo" text,
        "jsonMetadados" jsonb,
        "dataArquivamento" timestamp NOT NULL DEFAULT now(),
        "dataExpiracao" date,
        "statusRetencao" varchar(20) NOT NULL DEFAULT 'ativo',
        "usuarioArquivamento" uuid,
        "acessos" int NOT NULL DEFAULT 0,
        "ultimoAcesso" timestamp,
        CONSTRAINT "PK_documentos_fiscais_arquivados" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_doc_arq_tenant" ON "documentos_fiscais_arquivados" ("tenantId")`);
    await queryRunner.query(`CREATE INDEX "idx_doc_arq_empresa" ON "documentos_fiscais_arquivados" ("empresaId")`);
    await queryRunner.query(`CREATE INDEX "idx_doc_arq_tipo" ON "documentos_fiscais_arquivados" ("tipoDocumento")`);
    await queryRunner.query(`CREATE INDEX "idx_doc_arq_chave" ON "documentos_fiscais_arquivados" ("chaveAcesso")`);
    await queryRunner.query(`CREATE INDEX "idx_doc_arq_competencia" ON "documentos_fiscais_arquivados" ("competenciaAno", "competenciaMes")`);
    await queryRunner.query(`CREATE INDEX "idx_doc_arq_expiracao" ON "documentos_fiscais_arquivados" ("dataExpiracao")`);

    // ============================
    // AUDITORIA FISCAL
    // ============================

    await queryRunner.query(`
      CREATE TABLE "auditoria_fiscal" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "tipoDocumento" varchar(20) NOT NULL,
        "documentoId" uuid NOT NULL,
        "tipoAlerta" varchar(30) NOT NULL,
        "severidade" varchar(10) NOT NULL,
        "mensagem" text NOT NULL,
        "detalhes" jsonb,
        "status" varchar(20) NOT NULL DEFAULT 'aberto',
        "usuarioAnalise" uuid,
        "dataAnalise" timestamp,
        "justificativa" text,
        "criadoEm" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_auditoria_fiscal" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_auditoria_tenant" ON "auditoria_fiscal" ("tenantId")`);
    await queryRunner.query(`CREATE INDEX "idx_auditoria_doc" ON "auditoria_fiscal" ("tipoDocumento", "documentoId")`);
    await queryRunner.query(`CREATE INDEX "idx_auditoria_severidade" ON "auditoria_fiscal" ("severidade")`);
    await queryRunner.query(`CREATE INDEX "idx_auditoria_status" ON "auditoria_fiscal" ("status")`);

    // ============================
    // NCM x CEST RELACIONAMENTO
    // ============================

    await queryRunner.query(`
      CREATE TABLE "ncm_cest_relacionamento" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "ncmCodigo" varchar(8) NOT NULL,
        "cestCodigo" varchar(7) NOT NULL,
        "uf" varchar(2),
        "ativo" boolean NOT NULL DEFAULT true,
        CONSTRAINT "PK_ncm_cest_relacionamento" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_ncm_cest_ncm" ON "ncm_cest_relacionamento" ("ncmCodigo")`);

    // ============================
    // FOREIGN KEYS
    // ============================

    await queryRunner.query(`
      ALTER TABLE "filiais_fiscais"
        ADD CONSTRAINT "FK_filiais_fiscais_empresa" FOREIGN KEY ("empresaMatrizId") REFERENCES "empresa_fiscal"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "nf_e"
        ADD CONSTRAINT "FK_nfe_empresa" FOREIGN KEY ("empresaId") REFERENCES "empresa_fiscal"("empresaId") ON DELETE RESTRICT
    `);

    await queryRunner.query(`
      ALTER TABLE "nf_item"
        ADD CONSTRAINT "FK_nf_item_nfe" FOREIGN KEY ("nfeId") REFERENCES "nf_e"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "eventos_nfe"
        ADD CONSTRAINT "FK_eventos_nfe_nfe" FOREIGN KEY ("nfeId") REFERENCES "nf_e"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "sped_registros"
        ADD CONSTRAINT "FK_sped_empresa" FOREIGN KEY ("empresaId") REFERENCES "empresa_fiscal"("empresaId") ON DELETE RESTRICT
    `);

    await queryRunner.query(`
      ALTER TABLE "obrigacoes_fiscais"
        ADD CONSTRAINT "FK_obrigacoes_empresa" FOREIGN KEY ("empresaId") REFERENCES "empresa_fiscal"("empresaId") ON DELETE RESTRICT
    `);

    await queryRunner.query(`
      ALTER TABLE "documentos_fiscais_arquivados"
        ADD CONSTRAINT "FK_doc_arq_empresa" FOREIGN KEY ("empresaId") REFERENCES "empresa_fiscal"("empresaId") ON DELETE RESTRICT
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys first
    await queryRunner.query(`ALTER TABLE "documentos_fiscais_arquivados" DROP CONSTRAINT IF EXISTS "FK_doc_arq_empresa"`);
    await queryRunner.query(`ALTER TABLE "obrigacoes_fiscais" DROP CONSTRAINT IF EXISTS "FK_obrigacoes_empresa"`);
    await queryRunner.query(`ALTER TABLE "sped_registros" DROP CONSTRAINT IF EXISTS "FK_sped_empresa"`);
    await queryRunner.query(`ALTER TABLE "eventos_nfe" DROP CONSTRAINT IF EXISTS "FK_eventos_nfe_nfe"`);
    await queryRunner.query(`ALTER TABLE "nf_item" DROP CONSTRAINT IF EXISTS "FK_nf_item_nfe"`);
    await queryRunner.query(`ALTER TABLE "nf_e" DROP CONSTRAINT IF EXISTS "FK_nfe_empresa"`);
    await queryRunner.query(`ALTER TABLE "filiais_fiscais" DROP CONSTRAINT IF EXISTS "FK_filiais_fiscais_empresa"`);

    // Drop tables in reverse order
    await queryRunner.query(`DROP TABLE IF EXISTS "ncm_cest_relacionamento"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "auditoria_fiscal"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "documentos_fiscais_arquivados"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "calendario_fiscal"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "obrigacoes_fiscais"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "sped_registros"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "eventos_nfe"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "nf_item"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "nf_e"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "filiais_fiscais"`);
  }
}
