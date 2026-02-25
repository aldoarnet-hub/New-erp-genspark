import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migracao inicial - Cria todas as tabelas do ERP SaaS
 * Core: tenants, empresas, filiais, usuarios
 * Cadastros: unidades, categorias, marcas, fabricantes, produtos, clientes, fornecedores, etc.
 * Fiscal: ncm, cest, cfop, cst, icms, matriz tributaria
 * Auxiliares: formas pagamento, condicoes pagamento, bancos, contas, centros custo, plano contas
 * Auditoria: tabela de auditoria
 */
export class InitialSchema1708819200000 implements MigrationInterface {
  name = 'InitialSchema1708819200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ============================
    // CORE TABLES
    // ============================

    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    `);

    // Tenants
    await queryRunner.query(`
      CREATE TABLE "tenants" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "nome" varchar(200) NOT NULL,
        "slug" varchar(100) NOT NULL,
        "cnpj" varchar(18),
        "plano" varchar(50) NOT NULL DEFAULT 'basico',
        "status" varchar(20) NOT NULL DEFAULT 'ativo',
        "configuracoes" jsonb DEFAULT '{}',
        "limiteUsuarios" int NOT NULL DEFAULT 5,
        "limiteFiliais" int NOT NULL DEFAULT 1,
        "dataExpiracao" timestamp,
        "criadoEm" timestamp NOT NULL DEFAULT now(),
        "atualizadoEm" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tenants" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_tenants_slug" UNIQUE ("slug")
      )
    `);

    // Empresas
    await queryRunner.query(`
      CREATE TABLE "empresas" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "razaoSocial" varchar(300) NOT NULL,
        "nomeFantasia" varchar(300),
        "cnpj" varchar(18) NOT NULL,
        "inscricaoEstadual" varchar(20),
        "inscricaoMunicipal" varchar(20),
        "regimeTributario" varchar(50),
        "email" varchar(200),
        "telefone" varchar(20),
        "logradouro" varchar(300),
        "numero" varchar(20),
        "complemento" varchar(200),
        "bairro" varchar(200),
        "cidade" varchar(200),
        "uf" varchar(2),
        "cep" varchar(10),
        "codigoIbge" varchar(10),
        "logoUrl" varchar(500),
        "ativo" boolean NOT NULL DEFAULT true,
        "criadoEm" timestamp NOT NULL DEFAULT now(),
        "atualizadoEm" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_empresas" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_empresas_tenantId" ON "empresas" ("tenantId")
    `);

    // Filiais
    await queryRunner.query(`
      CREATE TABLE "filiais" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "empresaId" uuid NOT NULL,
        "nome" varchar(200) NOT NULL,
        "codigo" varchar(20),
        "cnpj" varchar(18),
        "inscricaoEstadual" varchar(20),
        "email" varchar(200),
        "telefone" varchar(20),
        "logradouro" varchar(300),
        "numero" varchar(20),
        "complemento" varchar(200),
        "bairro" varchar(200),
        "cidade" varchar(200),
        "uf" varchar(2),
        "cep" varchar(10),
        "codigoIbge" varchar(10),
        "filialMatriz" boolean NOT NULL DEFAULT false,
        "ativo" boolean NOT NULL DEFAULT true,
        "criadoEm" timestamp NOT NULL DEFAULT now(),
        "atualizadoEm" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_filiais" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_filiais_tenantId" ON "filiais" ("tenantId")
    `);

    // Usuarios
    await queryRunner.query(`
      CREATE TABLE "usuarios" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "empresaId" uuid,
        "filialId" uuid,
        "nome" varchar(200) NOT NULL,
        "email" varchar(200) NOT NULL,
        "senha" varchar(200) NOT NULL,
        "perfil" varchar(50) NOT NULL DEFAULT 'VENDEDOR',
        "roles" text[] DEFAULT '{}',
        "avatar" varchar(500),
        "telefone" varchar(20),
        "ativo" boolean NOT NULL DEFAULT true,
        "ultimoLogin" timestamp,
        "tentativasLogin" int NOT NULL DEFAULT 0,
        "bloqueadoAte" timestamp,
        "criadoEm" timestamp NOT NULL DEFAULT now(),
        "atualizadoEm" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_usuarios" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_usuarios_email" UNIQUE ("email")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_usuarios_tenantId" ON "usuarios" ("tenantId")
    `);

    // ============================
    // CADASTROS - AUXILIARES
    // ============================

    // Unidades de Medida
    await queryRunner.query(`
      CREATE TABLE "unidades_medida" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "sigla" varchar(10) NOT NULL,
        "descricao" varchar(100) NOT NULL,
        "ativo" boolean NOT NULL DEFAULT true,
        CONSTRAINT "PK_unidades_medida" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_unidades_medida_tenantId" ON "unidades_medida" ("tenantId")
    `);

    // Categorias
    await queryRunner.query(`
      CREATE TABLE "categorias" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "codigo" varchar(20) NOT NULL,
        "descricao" varchar(200) NOT NULL,
        "categoriaPaiId" uuid,
        "nivel" int NOT NULL DEFAULT 1,
        "ativo" boolean NOT NULL DEFAULT true,
        CONSTRAINT "PK_categorias" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_categorias_tenantId" ON "categorias" ("tenantId")
    `);

    // Marcas
    await queryRunner.query(`
      CREATE TABLE "marcas" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "nome" varchar(200) NOT NULL,
        "logoUrl" varchar(500),
        "ativo" boolean NOT NULL DEFAULT true,
        CONSTRAINT "PK_marcas" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_marcas_tenantId" ON "marcas" ("tenantId")
    `);

    // Fabricantes
    await queryRunner.query(`
      CREATE TABLE "fabricantes" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "nome" varchar(200) NOT NULL,
        "cnpj" varchar(18),
        "ativo" boolean NOT NULL DEFAULT true,
        CONSTRAINT "PK_fabricantes" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_fabricantes_tenantId" ON "fabricantes" ("tenantId")
    `);

    // Tabelas de Preco
    await queryRunner.query(`
      CREATE TABLE "tabelas_preco" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "codigo" varchar(20) NOT NULL,
        "descricao" varchar(200) NOT NULL,
        "tipo" varchar(50) NOT NULL DEFAULT 'VENDA',
        "baseCalculo" varchar(50) DEFAULT 'CUSTO_MEDIO',
        "percentualAcrescimo" decimal(10,4) DEFAULT 0,
        "percentualDesconto" decimal(10,4) DEFAULT 0,
        "dataInicio" date,
        "dataFim" date,
        "tabelaPadrao" boolean NOT NULL DEFAULT false,
        "status" varchar(20) NOT NULL DEFAULT 'ATIVA',
        CONSTRAINT "PK_tabelas_preco" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_tabelas_preco_tenantId" ON "tabelas_preco" ("tenantId")
    `);

    // Formas de Pagamento
    await queryRunner.query(`
      CREATE TABLE "formas_pagamento" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "codigo" varchar(20) NOT NULL,
        "descricao" varchar(200) NOT NULL,
        "tipo" varchar(50) NOT NULL,
        "geraTitulo" boolean NOT NULL DEFAULT true,
        "baixaAutomatica" boolean NOT NULL DEFAULT false,
        "permiteParcelamento" boolean NOT NULL DEFAULT false,
        "maximoParcelas" int DEFAULT 1,
        "taxaOperadora" decimal(10,4) DEFAULT 0,
        "codigoNfe" varchar(10),
        "status" varchar(20) NOT NULL DEFAULT 'ATIVA',
        CONSTRAINT "PK_formas_pagamento" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_formas_pagamento_tenantId" ON "formas_pagamento" ("tenantId")
    `);

    // Condicoes de Pagamento
    await queryRunner.query(`
      CREATE TABLE "condicoes_pagamento" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "codigo" varchar(20) NOT NULL,
        "descricao" varchar(200) NOT NULL,
        "numeroParcelas" int NOT NULL DEFAULT 1,
        "exigeEntrada" boolean NOT NULL DEFAULT false,
        "percentualEntrada" decimal(10,4) DEFAULT 0,
        "intervaloDias" int DEFAULT 30,
        "percentualDesconto" decimal(10,4) DEFAULT 0,
        "percentualAcrescimo" decimal(10,4) DEFAULT 0,
        "status" varchar(20) NOT NULL DEFAULT 'ATIVA',
        CONSTRAINT "PK_condicoes_pagamento" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_condicoes_pagamento_tenantId" ON "condicoes_pagamento" ("tenantId")
    `);

    // Parcelas da Condicao de Pagamento
    await queryRunner.query(`
      CREATE TABLE "condicoes_pagamento_parcelas" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "condicaoPagamentoId" uuid NOT NULL,
        "numeroParcela" int NOT NULL,
        "diasVencimento" int NOT NULL,
        "percentualParcela" decimal(10,4) NOT NULL,
        CONSTRAINT "PK_condicoes_pagamento_parcelas" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_condicoes_pagamento_parcelas_tenantId" ON "condicoes_pagamento_parcelas" ("tenantId")
    `);

    // Bancos
    await queryRunner.query(`
      CREATE TABLE "bancos" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "codigoFebraban" varchar(10) NOT NULL,
        "nome" varchar(200) NOT NULL,
        "nomeReduzido" varchar(50),
        CONSTRAINT "PK_bancos" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_bancos_tenantId" ON "bancos" ("tenantId")
    `);

    // Contas Bancarias
    await queryRunner.query(`
      CREATE TABLE "contas_bancarias" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "bancoId" uuid NOT NULL,
        "empresaId" uuid,
        "descricao" varchar(200) NOT NULL,
        "agencia" varchar(20) NOT NULL,
        "agenciaDigito" varchar(5),
        "conta" varchar(20) NOT NULL,
        "contaDigito" varchar(5),
        "tipoConta" varchar(30) NOT NULL DEFAULT 'CORRENTE',
        "saldoAtual" decimal(15,2) DEFAULT 0,
        "saldoDisponivel" decimal(15,2) DEFAULT 0,
        "chavePix" varchar(200),
        "tipoChavePix" varchar(30),
        "contaPrincipal" boolean NOT NULL DEFAULT false,
        "status" varchar(20) NOT NULL DEFAULT 'ATIVA',
        CONSTRAINT "PK_contas_bancarias" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_contas_bancarias_tenantId" ON "contas_bancarias" ("tenantId")
    `);

    // Centros de Custo
    await queryRunner.query(`
      CREATE TABLE "centros_custo" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "codigo" varchar(20) NOT NULL,
        "descricao" varchar(200) NOT NULL,
        "centroPaiId" uuid,
        "nivel" int NOT NULL DEFAULT 1,
        "responsavelId" uuid,
        "status" varchar(20) NOT NULL DEFAULT 'ATIVO',
        CONSTRAINT "PK_centros_custo" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_centros_custo_tenantId" ON "centros_custo" ("tenantId")
    `);

    // Plano de Contas
    await queryRunner.query(`
      CREATE TABLE "plano_contas" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "codigo" varchar(20) NOT NULL,
        "descricao" varchar(200) NOT NULL,
        "tipo" varchar(30) NOT NULL,
        "natureza" varchar(30) NOT NULL,
        "contaPaiId" uuid,
        "nivel" int NOT NULL DEFAULT 1,
        "contaSintetica" boolean NOT NULL DEFAULT false,
        "ativo" boolean NOT NULL DEFAULT true,
        CONSTRAINT "PK_plano_contas" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_plano_contas_tenantId" ON "plano_contas" ("tenantId")
    `);

    // Auditoria
    await queryRunner.query(`
      CREATE TABLE "auditoria" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "tabela" varchar(100) NOT NULL,
        "registroId" varchar(100) NOT NULL,
        "operacao" varchar(20) NOT NULL,
        "dadosAnteriores" jsonb,
        "dadosNovos" jsonb,
        "camposAlterados" text[],
        "usuarioId" uuid,
        "usuarioNome" varchar(200),
        "ipAddress" varchar(50),
        "dataOperacao" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_auditoria" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_auditoria_tenantId" ON "auditoria" ("tenantId")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_auditoria_tabela" ON "auditoria" ("tabela")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_auditoria_registroId" ON "auditoria" ("registroId")
    `);

    // ============================
    // PRODUTOS
    // ============================

    await queryRunner.query(`
      CREATE TABLE "produtos" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "codigoInterno" varchar(50) NOT NULL,
        "codigoBarras" varchar(50),
        "codigoFornecedor" varchar(50),
        "codigoFabricante" varchar(50),
        "descricao" varchar(300) NOT NULL,
        "descricaoReduzida" varchar(100),
        "descricaoComplementar" text,
        "categoriaId" uuid,
        "marcaId" uuid,
        "fabricanteId" uuid,
        "tipoProduto" varchar(30) NOT NULL DEFAULT 'SIMPLES',
        "controleSerie" boolean NOT NULL DEFAULT false,
        "controleLote" boolean NOT NULL DEFAULT false,
        "unidadeId" uuid,
        "unidadeCompraId" uuid,
        "fatorConversao" decimal(10,4) DEFAULT 1,
        "pesoLiquidoKg" decimal(12,4) DEFAULT 0,
        "pesoBrutoKg" decimal(12,4) DEFAULT 0,
        "alturaCm" decimal(10,2) DEFAULT 0,
        "larguraCm" decimal(10,2) DEFAULT 0,
        "profundidadeCm" decimal(10,2) DEFAULT 0,
        "cubagemM3" decimal(12,6) DEFAULT 0,
        "material" varchar(100),
        "cor" varchar(50),
        "acabamento" varchar(50),
        "voltagem" varchar(20),
        "embalagem" varchar(100),
        "ncm" varchar(10),
        "cest" varchar(10),
        "cfopVendaInterna" varchar(10),
        "cfopVendaInterestadual" varchar(10),
        "cstIcms" varchar(5),
        "cstIpi" varchar(5),
        "cstPisCofins" varchar(5),
        "aliquotaIcms" decimal(10,4) DEFAULT 0,
        "aliquotaIpi" decimal(10,4) DEFAULT 0,
        "aliquotaPis" decimal(10,4) DEFAULT 0,
        "aliquotaCofins" decimal(10,4) DEFAULT 0,
        "estoqueMinimo" decimal(12,4) DEFAULT 0,
        "estoqueMaximo" decimal(12,4) DEFAULT 0,
        "pontoReposicao" decimal(12,4) DEFAULT 0,
        "localizacao" varchar(100),
        "curvaAbc" varchar(1),
        "custoUltimaCompra" decimal(15,4) DEFAULT 0,
        "custoMedio" decimal(15,4) DEFAULT 0,
        "markupPadrao" decimal(10,4) DEFAULT 0,
        "margemMinimaVenda" decimal(10,4) DEFAULT 0,
        "ativo" boolean NOT NULL DEFAULT true,
        "bloqueadoVenda" boolean NOT NULL DEFAULT false,
        "bloqueadoCompra" boolean NOT NULL DEFAULT false,
        "observacoes" text,
        "criadoEm" timestamp NOT NULL DEFAULT now(),
        "atualizadoEm" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_produtos" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_produtos_tenant_codigo" ON "produtos" ("tenantId", "codigoInterno")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_produtos_tenantId" ON "produtos" ("tenantId")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_produtos_codigoBarras" ON "produtos" ("tenantId", "codigoBarras")
    `);

    // Produto Precos
    await queryRunner.query(`
      CREATE TABLE "produto_precos" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "produtoId" uuid NOT NULL,
        "filialId" uuid,
        "tabelaPrecoId" uuid,
        "custoProduto" decimal(15,4) DEFAULT 0,
        "precoVenda" decimal(15,4) NOT NULL,
        "precoPromocional" decimal(15,4),
        "margemLucro" decimal(10,4),
        "inicioPromocao" date,
        "fimPromocao" date,
        "criadoEm" timestamp NOT NULL DEFAULT now(),
        "atualizadoEm" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_produto_precos" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_produto_precos_tenantId" ON "produto_precos" ("tenantId")
    `);

    // Produto Filial (Estoque)
    await queryRunner.query(`
      CREATE TABLE "produto_filial" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "produtoId" uuid NOT NULL,
        "filialId" uuid NOT NULL,
        "estoqueAtual" decimal(12,4) NOT NULL DEFAULT 0,
        "estoqueReservado" decimal(12,4) NOT NULL DEFAULT 0,
        "estoqueDisponivel" decimal(12,4) NOT NULL DEFAULT 0,
        "estoqueBloqueado" decimal(12,4) NOT NULL DEFAULT 0,
        "custoMedio" decimal(15,4) DEFAULT 0,
        "custoUltimaCompra" decimal(15,4) DEFAULT 0,
        "dataUltimaCompra" date,
        "dataUltimaVenda" date,
        "criadoEm" timestamp NOT NULL DEFAULT now(),
        "atualizadoEm" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_produto_filial" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_produto_filial_tenantId" ON "produto_filial" ("tenantId")
    `);

    // Produto Composicao (Kit)
    await queryRunner.query(`
      CREATE TABLE "produto_composicao" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "produtoPaiId" uuid NOT NULL,
        "produtoFilhoId" uuid NOT NULL,
        "quantidade" decimal(12,4) NOT NULL,
        "unidade" varchar(10),
        "custoUnitario" decimal(15,4) DEFAULT 0,
        "ordem" int DEFAULT 0,
        "obrigatorio" boolean NOT NULL DEFAULT true,
        CONSTRAINT "PK_produto_composicao" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_produto_composicao_tenantId" ON "produto_composicao" ("tenantId")
    `);

    // Produto Similares
    await queryRunner.query(`
      CREATE TABLE "produto_similares" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "produtoId" uuid NOT NULL,
        "produtoSimilarId" uuid NOT NULL,
        "tipoSimilaridade" varchar(30) DEFAULT 'SIMILAR',
        "prioridade" int DEFAULT 1,
        CONSTRAINT "PK_produto_similares" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_produto_similares_tenantId" ON "produto_similares" ("tenantId")
    `);

    // Produto Aplicacoes
    await queryRunner.query(`
      CREATE TABLE "produto_aplicacoes" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "produtoId" uuid NOT NULL,
        "descricao" varchar(300) NOT NULL,
        "detalhes" text,
        CONSTRAINT "PK_produto_aplicacoes" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_produto_aplicacoes_tenantId" ON "produto_aplicacoes" ("tenantId")
    `);

    // Produto Midias
    await queryRunner.query(`
      CREATE TABLE "produto_midias" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "produtoId" uuid NOT NULL,
        "url" varchar(500) NOT NULL,
        "tipo" varchar(30) NOT NULL DEFAULT 'IMAGEM',
        "mimeType" varchar(100),
        "tamanhoBytes" bigint,
        "nomeOriginal" varchar(300),
        "principal" boolean NOT NULL DEFAULT false,
        "ordem" int DEFAULT 0,
        "criadoEm" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_produto_midias" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_produto_midias_tenantId" ON "produto_midias" ("tenantId")
    `);

    // ============================
    // CLIENTES
    // ============================

    await queryRunner.query(`
      CREATE TABLE "clientes" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "codigoInterno" varchar(50),
        "tipoPessoa" varchar(5) NOT NULL DEFAULT 'PF',
        "cpfCnpj" varchar(18) NOT NULL,
        "rgIe" varchar(30),
        "nome" varchar(300) NOT NULL,
        "nomeFantasia" varchar(300),
        "email" varchar(200),
        "telefone" varchar(20),
        "celular" varchar(20),
        "logradouro" varchar(300),
        "numero" varchar(20),
        "complemento" varchar(200),
        "bairro" varchar(200),
        "cidade" varchar(200),
        "uf" varchar(2),
        "cep" varchar(10),
        "codigoIbge" varchar(10),
        "classificacao" varchar(30) DEFAULT 'NORMAL',
        "limiteCredito" decimal(15,2) DEFAULT 0,
        "limiteUtilizado" decimal(15,2) DEFAULT 0,
        "saldoDevedor" decimal(15,2) DEFAULT 0,
        "scoreSpc" int,
        "scoreSerasa" int,
        "totalCompras" decimal(15,2) DEFAULT 0,
        "dataUltimaCompra" date,
        "dataPrimeiraCompra" date,
        "vendedorId" uuid,
        "ativo" boolean NOT NULL DEFAULT true,
        "bloqueado" boolean NOT NULL DEFAULT false,
        "motivoBloqueio" varchar(300),
        "observacoes" text,
        "criadoEm" timestamp NOT NULL DEFAULT now(),
        "atualizadoEm" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_clientes" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_clientes_tenantId" ON "clientes" ("tenantId")
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_clientes_tenant_cpfCnpj" ON "clientes" ("tenantId", "cpfCnpj")
    `);

    // Cliente Enderecos
    await queryRunner.query(`
      CREATE TABLE "cliente_enderecos" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "clienteId" uuid NOT NULL,
        "tipoEndereco" varchar(30) NOT NULL DEFAULT 'ENTREGA',
        "principal" boolean NOT NULL DEFAULT false,
        "logradouro" varchar(300) NOT NULL,
        "numero" varchar(20),
        "complemento" varchar(200),
        "bairro" varchar(200),
        "cidade" varchar(200) NOT NULL,
        "uf" varchar(2) NOT NULL,
        "cep" varchar(10) NOT NULL,
        "codigoIbge" varchar(10),
        "pontoReferencia" varchar(300),
        "contatoNome" varchar(200),
        "contatoTelefone" varchar(20),
        "ativo" boolean NOT NULL DEFAULT true,
        CONSTRAINT "PK_cliente_enderecos" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_cliente_enderecos_tenantId" ON "cliente_enderecos" ("tenantId")
    `);

    // Cliente Contatos
    await queryRunner.query(`
      CREATE TABLE "cliente_contatos" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "clienteId" uuid NOT NULL,
        "nome" varchar(200) NOT NULL,
        "cargo" varchar(100),
        "departamento" varchar(100),
        "email" varchar(200),
        "telefone" varchar(20),
        "celular" varchar(20),
        "contatoPrincipal" boolean NOT NULL DEFAULT false,
        "recebeNfe" boolean NOT NULL DEFAULT false,
        "recebeCobranca" boolean NOT NULL DEFAULT false,
        "ativo" boolean NOT NULL DEFAULT true,
        CONSTRAINT "PK_cliente_contatos" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_cliente_contatos_tenantId" ON "cliente_contatos" ("tenantId")
    `);

    // Cliente Limites (analise credito)
    await queryRunner.query(`
      CREATE TABLE "cliente_limites" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "clienteId" uuid NOT NULL,
        "dataAnalise" date NOT NULL,
        "tipoAnalise" varchar(50) NOT NULL,
        "limiteAnterior" decimal(15,2) DEFAULT 0,
        "limiteAprovado" decimal(15,2) NOT NULL,
        "scoreSpc" int,
        "scoreSerasa" int,
        "statusSpc" varchar(30),
        "statusSerasa" varchar(30),
        "parecerAnalista" text,
        "aprovadoPor" varchar(200),
        "validoAte" date,
        CONSTRAINT "PK_cliente_limites" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_cliente_limites_tenantId" ON "cliente_limites" ("tenantId")
    `);

    // ============================
    // FORNECEDORES
    // ============================

    await queryRunner.query(`
      CREATE TABLE "fornecedores" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "codigoInterno" varchar(50),
        "tipoPessoa" varchar(5) NOT NULL DEFAULT 'PJ',
        "cpfCnpj" varchar(18) NOT NULL,
        "rgIe" varchar(30),
        "razaoSocial" varchar(300) NOT NULL,
        "nomeFantasia" varchar(300),
        "email" varchar(200),
        "telefone" varchar(20),
        "celular" varchar(20),
        "website" varchar(300),
        "logradouro" varchar(300),
        "numero" varchar(20),
        "complemento" varchar(200),
        "bairro" varchar(200),
        "cidade" varchar(200),
        "uf" varchar(2),
        "cep" varchar(10),
        "codigoIbge" varchar(10),
        "contatoNome" varchar(200),
        "contatoEmail" varchar(200),
        "contatoTelefone" varchar(20),
        "certificacaoISO" boolean NOT NULL DEFAULT false,
        "certificacoes" text,
        "prazoEntregaDias" int DEFAULT 0,
        "condicaoPagamentoPadrao" varchar(100),
        "descontoComercial" decimal(10,4) DEFAULT 0,
        "avaliacaoMedia" decimal(5,2) DEFAULT 0,
        "totalCompras" decimal(15,2) DEFAULT 0,
        "dataUltimaCompra" date,
        "categoriasProdutos" text,
        "ativo" boolean NOT NULL DEFAULT true,
        "aprovado" boolean NOT NULL DEFAULT false,
        "observacoes" text,
        "criadoEm" timestamp NOT NULL DEFAULT now(),
        "atualizadoEm" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_fornecedores" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_fornecedores_tenantId" ON "fornecedores" ("tenantId")
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_fornecedores_tenant_cpfCnpj" ON "fornecedores" ("tenantId", "cpfCnpj")
    `);

    // Fornecedor Avaliacoes
    await queryRunner.query(`
      CREATE TABLE "fornecedor_avaliacoes" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "fornecedorId" uuid NOT NULL,
        "periodoInicio" date NOT NULL,
        "periodoFim" date NOT NULL,
        "notaQualidade" decimal(5,2) DEFAULT 0,
        "notaPontualidade" decimal(5,2) DEFAULT 0,
        "notaPreco" decimal(5,2) DEFAULT 0,
        "notaAtendimento" decimal(5,2) DEFAULT 0,
        "notaGeral" decimal(5,2) DEFAULT 0,
        "observacoes" text,
        "criadoEm" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_fornecedor_avaliacoes" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_fornecedor_avaliacoes_tenantId" ON "fornecedor_avaliacoes" ("tenantId")
    `);

    // Transportadoras
    await queryRunner.query(`
      CREATE TABLE "transportadoras" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "codigoInterno" varchar(50),
        "razaoSocial" varchar(300) NOT NULL,
        "nomeFantasia" varchar(300),
        "cnpj" varchar(18) NOT NULL,
        "inscricaoEstadual" varchar(20),
        "email" varchar(200),
        "telefone" varchar(20),
        "logradouro" varchar(300),
        "numero" varchar(20),
        "complemento" varchar(200),
        "bairro" varchar(200),
        "cidade" varchar(200),
        "uf" varchar(2),
        "cep" varchar(10),
        "tipoFrete" varchar(30) DEFAULT 'CIF',
        "modalTransporte" varchar(30) DEFAULT 'RODOVIARIO',
        "regioesAtendidas" text,
        "ativo" boolean NOT NULL DEFAULT true,
        "criadoEm" timestamp NOT NULL DEFAULT now(),
        "atualizadoEm" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_transportadoras" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transportadoras_tenantId" ON "transportadoras" ("tenantId")
    `);

    // Vendedores
    await queryRunner.query(`
      CREATE TABLE "vendedores" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "codigoInterno" varchar(50),
        "nome" varchar(200) NOT NULL,
        "cpf" varchar(14),
        "email" varchar(200),
        "telefone" varchar(20),
        "tipoComissao" varchar(30) DEFAULT 'PERCENTUAL',
        "percentualComissao" decimal(10,4) DEFAULT 0,
        "metaMensal" decimal(15,2) DEFAULT 0,
        "filialId" uuid,
        "supervisorId" uuid,
        "usuarioId" uuid,
        "ativo" boolean NOT NULL DEFAULT true,
        "criadoEm" timestamp NOT NULL DEFAULT now(),
        "atualizadoEm" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_vendedores" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_vendedores_tenantId" ON "vendedores" ("tenantId")
    `);

    // Vendedor Carteira
    await queryRunner.query(`
      CREATE TABLE "vendedor_carteira" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "vendedorId" uuid NOT NULL,
        "clienteId" uuid NOT NULL,
        "ativo" boolean NOT NULL DEFAULT true,
        "dataVinculo" date DEFAULT now(),
        CONSTRAINT "PK_vendedor_carteira" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_vendedor_carteira_tenantId" ON "vendedor_carteira" ("tenantId")
    `);

    // ============================
    // FISCAL TABLES
    // ============================

    await queryRunner.query(`
      CREATE TABLE "ncm_tabela" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "codigo" varchar(10) NOT NULL,
        "descricao" varchar(500) NOT NULL,
        "aliquotaIpi" decimal(10,4) DEFAULT 0,
        "unidadeTributavel" varchar(20),
        "ativo" boolean NOT NULL DEFAULT true,
        CONSTRAINT "PK_ncm_tabela" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_ncm_tabela_codigo" UNIQUE ("codigo")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "cest_tabela" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "codigo" varchar(10) NOT NULL,
        "ncm" varchar(10) NOT NULL,
        "descricao" varchar(500) NOT NULL,
        "ativo" boolean NOT NULL DEFAULT true,
        CONSTRAINT "PK_cest_tabela" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_cest_tabela_codigo" UNIQUE ("codigo")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "cfop_tabela" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "codigo" varchar(10) NOT NULL,
        "descricao" varchar(500) NOT NULL,
        "tipoOperacao" varchar(30),
        "movimentaEstoque" boolean NOT NULL DEFAULT true,
        "geraFinanceiro" boolean NOT NULL DEFAULT true,
        "ativo" boolean NOT NULL DEFAULT true,
        CONSTRAINT "PK_cfop_tabela" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_cfop_tabela_codigo" UNIQUE ("codigo")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "cst_icms" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "codigo" varchar(5) NOT NULL,
        "descricao" varchar(300) NOT NULL,
        "regimeTributario" varchar(30),
        CONSTRAINT "PK_cst_icms" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "cst_ipi" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "codigo" varchar(5) NOT NULL,
        "descricao" varchar(300) NOT NULL,
        "tipoOperacao" varchar(30),
        CONSTRAINT "PK_cst_ipi" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "cst_pis_cofins" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "codigo" varchar(5) NOT NULL,
        "descricao" varchar(300) NOT NULL,
        "tipoOperacao" varchar(30),
        CONSTRAINT "PK_cst_pis_cofins" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "icms_aliquotas_uf" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "ufOrigem" varchar(2) NOT NULL,
        "ufDestino" varchar(2) NOT NULL,
        "aliquotaInterna" decimal(10,4) NOT NULL,
        "aliquotaInterestadual" decimal(10,4) NOT NULL,
        "aliquotaFcp" decimal(10,4) DEFAULT 0,
        "vigenciaInicio" date,
        "vigenciaFim" date,
        CONSTRAINT "PK_icms_aliquotas_uf" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "icms_st_mva" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "ncm" varchar(10) NOT NULL,
        "cest" varchar(10),
        "ufOrigem" varchar(2) NOT NULL,
        "ufDestino" varchar(2) NOT NULL,
        "mvaOriginal" decimal(10,4) NOT NULL,
        "mvaAjustada" decimal(10,4),
        "vigenciaInicio" date,
        "vigenciaFim" date,
        CONSTRAINT "PK_icms_st_mva" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "matriz_tributaria" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "descricao" varchar(300) NOT NULL,
        "ncm" varchar(10),
        "cest" varchar(10),
        "cfopEntrada" varchar(10),
        "cfopSaida" varchar(10),
        "cstIcms" varchar(5),
        "cstIpi" varchar(5),
        "cstPisCofins" varchar(5),
        "aliquotaIcms" decimal(10,4) DEFAULT 0,
        "aliquotaIcmsSt" decimal(10,4) DEFAULT 0,
        "aliquotaIpi" decimal(10,4) DEFAULT 0,
        "aliquotaPis" decimal(10,4) DEFAULT 0,
        "aliquotaCofins" decimal(10,4) DEFAULT 0,
        "reducaoBaseIcms" decimal(10,4) DEFAULT 0,
        "mva" decimal(10,4) DEFAULT 0,
        "ufOrigem" varchar(2),
        "ufDestino" varchar(2),
        "regimeTributario" varchar(30),
        "ativo" boolean NOT NULL DEFAULT true,
        "criadoEm" timestamp NOT NULL DEFAULT now(),
        "atualizadoEm" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_matriz_tributaria" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_matriz_tributaria_tenantId" ON "matriz_tributaria" ("tenantId")
    `);

    // Empresa Fiscal
    await queryRunner.query(`
      CREATE TABLE "empresa_fiscal" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "empresaId" uuid NOT NULL,
        "regimeTributario" varchar(50) NOT NULL,
        "cnae" varchar(20),
        "inscricaoSuframa" varchar(20),
        "certificadoDigitalSenha" varchar(200),
        "certificadoDigitalValidade" date,
        "ambienteNfe" varchar(20) DEFAULT 'homologacao',
        "serieNfe" int DEFAULT 1,
        "proximoNumeroNfe" int DEFAULT 1,
        "serieNfce" int DEFAULT 1,
        "proximoNumeroNfce" int DEFAULT 1,
        "cscId" varchar(10),
        "cscToken" varchar(100),
        "ativo" boolean NOT NULL DEFAULT true,
        "criadoEm" timestamp NOT NULL DEFAULT now(),
        "atualizadoEm" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_empresa_fiscal" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_empresa_fiscal_tenantId" ON "empresa_fiscal" ("tenantId")
    `);

    // ============================
    // AUDIT TRIGGER FUNCTION
    // ============================

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION fn_audit_trigger()
      RETURNS TRIGGER AS $$
      BEGIN
        IF (TG_OP = 'UPDATE') THEN
          INSERT INTO "auditoria" ("tenantId", "tabela", "registroId", "operacao", "dadosAnteriores", "dadosNovos", "dataOperacao")
          VALUES (
            COALESCE(NEW."tenantId", OLD."tenantId"),
            TG_TABLE_NAME,
            COALESCE(NEW."id"::text, OLD."id"::text),
            'UPDATE',
            row_to_json(OLD),
            row_to_json(NEW),
            now()
          );
          RETURN NEW;
        ELSIF (TG_OP = 'DELETE') THEN
          INSERT INTO "auditoria" ("tenantId", "tabela", "registroId", "operacao", "dadosAnteriores", "dataOperacao")
          VALUES (
            OLD."tenantId",
            TG_TABLE_NAME,
            OLD."id"::text,
            'DELETE',
            row_to_json(OLD),
            now()
          );
          RETURN OLD;
        ELSIF (TG_OP = 'INSERT') THEN
          INSERT INTO "auditoria" ("tenantId", "tabela", "registroId", "operacao", "dadosNovos", "dataOperacao")
          VALUES (
            NEW."tenantId",
            TG_TABLE_NAME,
            NEW."id"::text,
            'INSERT',
            row_to_json(NEW),
            now()
          );
          RETURN NEW;
        END IF;
        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Aplica audit triggers nas tabelas principais
    const tabelasAuditadas = [
      'produtos', 'clientes', 'fornecedores', 'transportadoras', 'vendedores',
    ];

    for (const tabela of tabelasAuditadas) {
      await queryRunner.query(`
        CREATE TRIGGER trg_audit_${tabela}
        AFTER INSERT OR UPDATE OR DELETE ON "${tabela}"
        FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop triggers
    const tabelasAuditadas = [
      'produtos', 'clientes', 'fornecedores', 'transportadoras', 'vendedores',
    ];
    for (const tabela of tabelasAuditadas) {
      await queryRunner.query(`DROP TRIGGER IF EXISTS trg_audit_${tabela} ON "${tabela}"`);
    }
    await queryRunner.query(`DROP FUNCTION IF EXISTS fn_audit_trigger()`);

    // Drop fiscal
    await queryRunner.query(`DROP TABLE IF EXISTS "empresa_fiscal"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "matriz_tributaria"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "icms_st_mva"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "icms_aliquotas_uf"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "cst_pis_cofins"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "cst_ipi"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "cst_icms"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "cfop_tabela"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "cest_tabela"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "ncm_tabela"`);

    // Drop fornecedores
    await queryRunner.query(`DROP TABLE IF EXISTS "vendedor_carteira"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "vendedores"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "transportadoras"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "fornecedor_avaliacoes"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "fornecedores"`);

    // Drop clientes
    await queryRunner.query(`DROP TABLE IF EXISTS "cliente_limites"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "cliente_contatos"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "cliente_enderecos"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "clientes"`);

    // Drop produtos
    await queryRunner.query(`DROP TABLE IF EXISTS "produto_midias"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "produto_aplicacoes"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "produto_similares"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "produto_composicao"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "produto_filial"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "produto_precos"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "produtos"`);

    // Drop auxiliares
    await queryRunner.query(`DROP TABLE IF EXISTS "auditoria"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "plano_contas"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "centros_custo"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "contas_bancarias"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "bancos"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "condicoes_pagamento_parcelas"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "condicoes_pagamento"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "formas_pagamento"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tabelas_preco"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "fabricantes"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "marcas"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "categorias"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "unidades_medida"`);

    // Drop core
    await queryRunner.query(`DROP TABLE IF EXISTS "usuarios"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "filiais"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "empresas"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tenants"`);
  }
}
