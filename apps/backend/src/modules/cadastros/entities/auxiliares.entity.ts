import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

// ============================================================
// Categorias de Produto
// ============================================================
@Entity('categorias')
@Index(['tenantId', 'codigo'], { unique: true })
export class Categoria {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() tenantId: string;
  @Column({ length: 20 }) codigo: string;
  @Column({ length: 100 }) descricao: string;
  @Column({ nullable: true }) categoriaPaiId: string;
  @Column({ type: 'int', default: 1 }) nivel: number;
  @Column({ default: true }) ativo: boolean;
}

// ============================================================
// Marcas
// ============================================================
@Entity('marcas')
@Index(['tenantId', 'nome'], { unique: true })
export class Marca {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() tenantId: string;
  @Column({ length: 100 }) nome: string;
  @Column({ nullable: true, length: 500 }) logoUrl: string;
  @Column({ default: true }) ativo: boolean;
}

// ============================================================
// Fabricantes
// ============================================================
@Entity('fabricantes')
@Index(['tenantId', 'nome'], { unique: true })
export class Fabricante {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() tenantId: string;
  @Column({ length: 100 }) nome: string;
  @Column({ nullable: true, length: 18 }) cnpj: string;
  @Column({ default: true }) ativo: boolean;
}

// ============================================================
// Tabelas de Preco
// ============================================================
@Entity('tabelas_preco')
@Index(['tenantId', 'codigo'], { unique: true })
export class TabelaPreco {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() tenantId: string;
  @Column({ length: 10 }) codigo: string;
  @Column({ length: 50 }) descricao: string;
  @Column({ length: 20, default: 'VAREJO' }) tipo: string; // VAREJO, ATACADO, PROMOCIONAL, OBRA
  @Column({ length: 20, default: 'CUSTO' }) baseCalculo: string; // CUSTO, ULTIMA_COMPRA, SUGERIDO
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 }) percentualAcrescimo: number;
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 }) percentualDesconto: number;
  @Column({ type: 'date', nullable: true }) dataInicio: Date;
  @Column({ type: 'date', nullable: true }) dataFim: Date;
  @Column({ default: false }) tabelaPadrao: boolean;
  @Column({ length: 15, default: 'ATIVO' }) status: string;
}

// ============================================================
// Formas de Pagamento
// ============================================================
@Entity('formas_pagamento')
@Index(['tenantId', 'codigo'], { unique: true })
export class FormaPagamento {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() tenantId: string;
  @Column({ length: 10 }) codigo: string;
  @Column({ length: 50 }) descricao: string;
  @Column({ length: 20 }) tipo: string; // DINHEIRO, CHEQUE, CARTAO, BOLETO, PIX, TRANSFERENCIA
  @Column({ default: true }) geraTitulo: boolean;
  @Column({ default: false }) baixaAutomatica: boolean;
  @Column({ default: false }) permiteParcelamento: boolean;
  @Column({ type: 'int', default: 1 }) maximoParcelas: number;
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 }) taxaOperadora: number;
  @Column({ nullable: true, length: 20 }) codigoNfe: string; // Codigo na NF-e
  @Column({ length: 15, default: 'ATIVO' }) status: string;
}

// ============================================================
// Condicoes de Pagamento
// ============================================================
@Entity('condicoes_pagamento')
@Index(['tenantId', 'codigo'], { unique: true })
export class CondicaoPagamento {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() tenantId: string;
  @Column({ length: 20 }) codigo: string;
  @Column({ length: 50 }) descricao: string;
  @Column({ type: 'int', default: 1 }) numeroParcelas: number;
  @Column({ default: false }) exigeEntrada: boolean;
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 }) percentualEntrada: number;
  @Column({ type: 'int', default: 30 }) intervaloDias: number;
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 }) percentualDesconto: number;
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 }) percentualAcrescimo: number;
  @Column({ length: 15, default: 'ATIVO' }) status: string;
}

// ============================================================
// Parcelas da Condicao de Pagamento
// ============================================================
@Entity('condicoes_pagamento_parcelas')
@Index(['tenantId', 'condicaoPagamentoId'])
export class CondicaoPagamentoParcela {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() tenantId: string;
  @Column() condicaoPagamentoId: string;
  @Column({ type: 'int' }) numeroParcela: number;
  @Column({ type: 'int' }) diasVencimento: number;
  @Column({ type: 'decimal', precision: 5, scale: 2 }) percentualParcela: number;
}

// ============================================================
// Bancos
// ============================================================
@Entity('bancos')
@Index(['tenantId', 'codigoFebraban'], { unique: true })
export class Banco {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() tenantId: string;
  @Column({ length: 3 }) codigoFebraban: string;
  @Column({ length: 100 }) nome: string;
  @Column({ nullable: true, length: 30 }) nomeReduzido: string;
}

// ============================================================
// Contas Bancarias
// ============================================================
@Entity('contas_bancarias')
@Index(['tenantId', 'bancoId'])
export class ContaBancaria {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() tenantId: string;
  @Column() bancoId: string;
  @Column({ nullable: true }) empresaId: string;
  @Column({ length: 50 }) descricao: string;
  @Column({ length: 10 }) agencia: string;
  @Column({ nullable: true, length: 2 }) agenciaDigito: string;
  @Column({ length: 20 }) conta: string;
  @Column({ nullable: true, length: 2 }) contaDigito: string;
  @Column({ length: 20, default: 'CORRENTE' }) tipoConta: string; // CORRENTE, POUPANCA, APLICACAO
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 }) saldoAtual: number;
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 }) saldoDisponivel: number;
  @Column({ nullable: true, length: 30 }) chavePix: string;
  @Column({ nullable: true, length: 10 }) tipoChavePix: string; // CPF, CNPJ, EMAIL, TELEFONE, ALEATORIA
  @Column({ default: false }) contaPrincipal: boolean;
  @Column({ length: 15, default: 'ATIVO' }) status: string;
}

// ============================================================
// Centros de Custo
// ============================================================
@Entity('centros_custo')
@Index(['tenantId', 'codigo'], { unique: true })
export class CentroCusto {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() tenantId: string;
  @Column({ length: 20 }) codigo: string;
  @Column({ length: 100 }) descricao: string;
  @Column({ nullable: true }) centroPaiId: string;
  @Column({ type: 'int', default: 1 }) nivel: number;
  @Column({ nullable: true }) responsavelId: string;
  @Column({ length: 15, default: 'ATIVO' }) status: string;
}

// ============================================================
// Plano de Contas
// ============================================================
@Entity('plano_contas')
@Index(['tenantId', 'codigo'], { unique: true })
export class PlanoConta {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() tenantId: string;
  @Column({ length: 20 }) codigo: string;
  @Column({ length: 150 }) descricao: string;
  @Column({ length: 20 }) tipo: string; // RECEITA, DESPESA, ATIVO, PASSIVO, PATRIMONIO
  @Column({ length: 20 }) natureza: string; // DEVEDORA, CREDORA
  @Column({ nullable: true }) contaPaiId: string;
  @Column({ type: 'int', default: 1 }) nivel: number;
  @Column({ default: false }) contaSintetica: boolean; // true = agrupadora, false = analitica
  @Column({ default: true }) ativo: boolean;
}

// ============================================================
// Auditoria
// ============================================================
@Entity('auditoria')
@Index(['tenantId', 'tabela', 'registroId'])
@Index(['tenantId', 'dataOperacao'])
@Index(['usuarioId'])
export class Auditoria {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() tenantId: string;
  @Column({ length: 50 }) tabela: string;
  @Column() registroId: string;
  @Column({ length: 10 }) operacao: string; // INSERT, UPDATE, DELETE
  @Column({ type: 'jsonb', nullable: true }) dadosAnteriores: any;
  @Column({ type: 'jsonb', nullable: true }) dadosNovos: any;
  @Column({ type: 'jsonb', nullable: true }) camposAlterados: string[];
  @Column({ nullable: true }) usuarioId: string;
  @Column({ nullable: true, length: 150 }) usuarioNome: string;
  @Column({ nullable: true, length: 45 }) ipAddress: string;
  @CreateDateColumn() dataOperacao: Date;
}
