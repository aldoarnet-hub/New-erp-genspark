import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import {
  TipoConta,
  NaturezaConta,
  ClasseConta,
} from '../enums/contabil.enums';

// ============================================================
// PLANO DE CONTAS
// ============================================================
@Entity('plano_contas')
@Index(['tenantId', 'codigo'], { unique: true })
@Index(['tenantId', 'tipoConta'])
@Index(['tenantId', 'contaPaiCodigo'])
@Index(['tenantId', 'ativo'])
export class PlanoContas {
  @ApiProperty({ description: 'ID unico' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'ID do tenant' })
  @Column({ name: 'tenant_id' })
  tenantId: string;

  @ApiProperty({ description: 'Codigo da conta (ex: 1.1.01.001)' })
  @Column({ name: 'codigo', length: 20 })
  codigo: string;

  @ApiProperty({ description: 'Descricao da conta' })
  @Column({ name: 'descricao', length: 200 })
  descricao: string;

  @ApiProperty({ description: 'Tipo da conta', enum: TipoConta })
  @Column({ name: 'tipo_conta', type: 'varchar', length: 30 })
  tipoConta: TipoConta;

  @ApiProperty({ description: 'Natureza da conta', enum: NaturezaConta })
  @Column({ name: 'natureza', type: 'varchar', length: 20 })
  natureza: NaturezaConta;

  @ApiProperty({ description: 'Classe: sintetica ou analitica', enum: ClasseConta })
  @Column({ name: 'classe', type: 'varchar', length: 20 })
  classe: ClasseConta;

  @ApiProperty({ description: 'Codigo da conta pai (null se raiz)', required: false })
  @Column({ name: 'conta_pai_codigo', length: 20, nullable: true })
  contaPaiCodigo: string | null;

  @ApiProperty({ description: 'Nivel hierarquico (1 a 5)' })
  @Column({ name: 'nivel', type: 'int', default: 1 })
  nivel: number;

  @ApiProperty({ description: 'Aceita lancamentos (so analitica)' })
  @Column({ name: 'aceita_lancamento', default: false })
  aceitaLancamento: boolean;

  @ApiProperty({ description: 'Codigo referencia SPED', required: false })
  @Column({ name: 'codigo_sped', length: 20, nullable: true })
  codigoSped: string | null;

  @ApiProperty({ description: 'Codigo referencia DRE', required: false })
  @Column({ name: 'codigo_dre', length: 20, nullable: true })
  codigoDre: string | null;

  @ApiProperty({ description: 'Conta ativa' })
  @Column({ name: 'ativo', default: true })
  ativo: boolean;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;
}

// ============================================================
// CONTA BANCARIA
// ============================================================
@Entity('contas_bancarias')
@Index(['tenantId'])
@Index(['tenantId', 'ativo'])
export class ContaBancaria {
  @ApiProperty({ description: 'ID unico' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'ID do tenant' })
  @Column({ name: 'tenant_id' })
  tenantId: string;

  @ApiProperty({ description: 'Nome/apelido da conta' })
  @Column({ name: 'nome', length: 100 })
  nome: string;

  @ApiProperty({ description: 'Banco (codigo FEBRABAN)', required: false })
  @Column({ name: 'banco_codigo', length: 10, nullable: true })
  bancoCodigo: string | null;

  @ApiProperty({ description: 'Nome do banco' })
  @Column({ name: 'banco_nome', length: 100 })
  bancoNome: string;

  @ApiProperty({ description: 'Agencia' })
  @Column({ name: 'agencia', length: 10 })
  agencia: string;

  @ApiProperty({ description: 'Numero da conta' })
  @Column({ name: 'numero_conta', length: 20 })
  numeroConta: string;

  @ApiProperty({ description: 'Digito da conta', required: false })
  @Column({ name: 'digito_conta', length: 2, nullable: true })
  digitoConta: string | null;

  @ApiProperty({ description: 'Tipo da conta bancaria' })
  @Column({ name: 'tipo_conta', length: 30, default: 'CONTA_CORRENTE' })
  tipoConta: string;

  @ApiProperty({ description: 'Codigo da conta contabil vinculada (1.1.02.XXX)' })
  @Column({ name: 'conta_contabil_codigo', length: 20 })
  contaContabilCodigo: string;

  @ApiProperty({ description: 'Saldo atual' })
  @Column({ name: 'saldo_atual', type: 'decimal', precision: 15, scale: 2, default: 0 })
  saldoAtual: number;

  @ApiProperty({ description: 'Aceita PIX' })
  @Column({ name: 'aceita_pix', default: false })
  aceitaPix: boolean;

  @ApiProperty({ description: 'Chave PIX', required: false })
  @Column({ name: 'chave_pix', length: 100, nullable: true })
  chavePix: string | null;

  @ApiProperty({ description: 'Conta principal' })
  @Column({ name: 'principal', default: false })
  principal: boolean;

  @ApiProperty({ description: 'Ativa' })
  @Column({ name: 'ativo', default: true })
  ativo: boolean;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;
}

// ============================================================
// LANCAMENTO CONTABIL
// ============================================================
@Entity('lancamentos_contabeis')
@Index(['tenantId', 'dataLancamento'])
@Index(['tenantId', 'contaDebitoCodigo'])
@Index(['tenantId', 'contaCreditoCodigo'])
@Index(['tenantId', 'tipoOperacao'])
@Index(['tenantId', 'status'])
@Index(['tenantId', 'documentoOrigem', 'documentoOrigemId'])
export class LancamentoContabil {
  @ApiProperty({ description: 'ID unico' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'ID do tenant' })
  @Column({ name: 'tenant_id' })
  tenantId: string;

  @ApiProperty({ description: 'Numero sequencial do lancamento' })
  @Column({ name: 'numero', type: 'int' })
  numero: number;

  @ApiProperty({ description: 'Data do lancamento' })
  @Column({ name: 'data_lancamento', type: 'date' })
  dataLancamento: Date;

  @ApiProperty({ description: 'Tipo da operacao que gerou o lancamento' })
  @Column({ name: 'tipo_operacao', length: 60 })
  tipoOperacao: string;

  @ApiProperty({ description: 'Codigo da conta debitada' })
  @Column({ name: 'conta_debito_codigo', length: 20 })
  contaDebitoCodigo: string;

  @ApiProperty({ description: 'Descricao da conta debitada' })
  @Column({ name: 'conta_debito_descricao', length: 200 })
  contaDebitoDescricao: string;

  @ApiProperty({ description: 'Codigo da conta creditada' })
  @Column({ name: 'conta_credito_codigo', length: 20 })
  contaCreditoCodigo: string;

  @ApiProperty({ description: 'Descricao da conta creditada' })
  @Column({ name: 'conta_credito_descricao', length: 200 })
  contaCreditoDescricao: string;

  @ApiProperty({ description: 'Valor do lancamento' })
  @Column({ name: 'valor', type: 'decimal', precision: 15, scale: 2 })
  valor: number;

  @ApiProperty({ description: 'Historico / descricao do lancamento' })
  @Column({ name: 'historico', length: 500 })
  historico: string;

  @ApiProperty({ description: 'Documento de origem (ex: VENDA, NF-E, BOLETO)' })
  @Column({ name: 'documento_origem', length: 50, nullable: true })
  documentoOrigem: string | null;

  @ApiProperty({ description: 'ID do documento de origem' })
  @Column({ name: 'documento_origem_id', nullable: true })
  documentoOrigemId: string | null;

  @ApiProperty({ description: 'Numero do documento externo (NF, boleto, etc)' })
  @Column({ name: 'numero_documento_externo', length: 50, nullable: true })
  numeroDocumentoExterno: string | null;

  @ApiProperty({ description: 'Status do lancamento' })
  @Column({ name: 'status', length: 20, default: 'CONFIRMADO' })
  status: string;

  @ApiProperty({ description: 'Origem do lancamento (MANUAL, AUTOMATICO)' })
  @Column({ name: 'origem', length: 20, default: 'AUTOMATICO' })
  origem: string;

  @ApiProperty({ description: 'ID do lancamento de estorno (se estornado)' })
  @Column({ name: 'estorno_lancamento_id', nullable: true })
  estornoLancamentoId: string | null;

  @ApiProperty({ description: 'ID do centro de custo', required: false })
  @Column({ name: 'centro_custo_id', nullable: true })
  centroCustoId: string | null;

  @ApiProperty({ description: 'Competencia ano' })
  @Column({ name: 'competencia_ano', type: 'int', nullable: true })
  competenciaAno: number | null;

  @ApiProperty({ description: 'Competencia mes' })
  @Column({ name: 'competencia_mes', type: 'int', nullable: true })
  competenciaMes: number | null;

  @ApiProperty({ description: 'Usuario que criou' })
  @Column({ name: 'usuario_criacao', nullable: true })
  usuarioCriacao: string | null;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;
}

// ============================================================
// MAPEAMENTO OPERACAO → CONTAS CONTABEIS
// ============================================================
@Entity('mapeamento_operacao_contabil')
@Index(['tenantId', 'tipoOperacao'], { unique: true })
@Index(['tenantId', 'ativo'])
export class MapeamentoOperacaoContabil {
  @ApiProperty({ description: 'ID unico' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'ID do tenant' })
  @Column({ name: 'tenant_id' })
  tenantId: string;

  @ApiProperty({ description: 'Tipo da operacao do sistema' })
  @Column({ name: 'tipo_operacao', length: 60 })
  tipoOperacao: string;

  @ApiProperty({ description: 'Descricao da operacao' })
  @Column({ name: 'descricao_operacao', length: 200 })
  descricaoOperacao: string;

  @ApiProperty({ description: 'Codigo da conta DEBITO' })
  @Column({ name: 'conta_debito_codigo', length: 20 })
  contaDebitoCodigo: string;

  @ApiProperty({ description: 'Descricao da conta DEBITO' })
  @Column({ name: 'conta_debito_descricao', length: 200 })
  contaDebitoDescricao: string;

  @ApiProperty({ description: 'Codigo da conta CREDITO' })
  @Column({ name: 'conta_credito_codigo', length: 20 })
  contaCreditoCodigo: string;

  @ApiProperty({ description: 'Descricao da conta CREDITO' })
  @Column({ name: 'conta_credito_descricao', length: 200 })
  contaCreditoDescricao: string;

  @ApiProperty({ description: 'Template do historico. Vars: {valor}, {documento}, {data}' })
  @Column({ name: 'historico_template', length: 500 })
  historicoTemplate: string;

  @ApiProperty({ description: 'Grupo da operacao (VENDAS, FINANCEIRO, COMPRAS, etc)' })
  @Column({ name: 'grupo', length: 50 })
  grupo: string;

  @ApiProperty({ description: 'Mapeamento ativo' })
  @Column({ name: 'ativo', default: true })
  ativo: boolean;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;
}

// ============================================================
// BALANCETE (view materializada para consultas)
// ============================================================
@Entity('saldos_contabeis')
@Index(['tenantId', 'contaCodigo', 'competenciaAno', 'competenciaMes'], { unique: true })
export class SaldoContabil {
  @ApiProperty({ description: 'ID unico' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'ID do tenant' })
  @Column({ name: 'tenant_id' })
  tenantId: string;

  @ApiProperty({ description: 'Codigo da conta' })
  @Column({ name: 'conta_codigo', length: 20 })
  contaCodigo: string;

  @ApiProperty({ description: 'Descricao da conta' })
  @Column({ name: 'conta_descricao', length: 200 })
  contaDescricao: string;

  @ApiProperty({ description: 'Tipo da conta' })
  @Column({ name: 'tipo_conta', length: 30 })
  tipoConta: string;

  @ApiProperty({ description: 'Natureza da conta' })
  @Column({ name: 'natureza', length: 20 })
  natureza: string;

  @ApiProperty({ description: 'Ano da competencia' })
  @Column({ name: 'competencia_ano', type: 'int' })
  competenciaAno: number;

  @ApiProperty({ description: 'Mes da competencia' })
  @Column({ name: 'competencia_mes', type: 'int' })
  competenciaMes: number;

  @ApiProperty({ description: 'Saldo anterior' })
  @Column({ name: 'saldo_anterior', type: 'decimal', precision: 15, scale: 2, default: 0 })
  saldoAnterior: number;

  @ApiProperty({ description: 'Total de debitos no periodo' })
  @Column({ name: 'total_debitos', type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalDebitos: number;

  @ApiProperty({ description: 'Total de creditos no periodo' })
  @Column({ name: 'total_creditos', type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalCreditos: number;

  @ApiProperty({ description: 'Saldo atual' })
  @Column({ name: 'saldo_atual', type: 'decimal', precision: 15, scale: 2, default: 0 })
  saldoAtual: number;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;
}
