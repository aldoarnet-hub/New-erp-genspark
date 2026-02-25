import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Registros SPED (sped_registros)
 * SPED Fiscal, Contribuicoes, Contabil, ECF, EFD-Reinf
 */
@Entity('sped_registros')
@Index('idx_sped_empresa', ['empresaId'])
@Index('idx_sped_tipo', ['tipoSped'])
@Index('idx_sped_periodo', ['periodoAno', 'periodoMes'])
export class SpedRegistro {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'uuid' })
  empresaId: string;

  // Identificacao
  @Column({ length: 20 })
  tipoSped: string; // 'fiscal', 'contribuicoes', 'contabil', 'ecf', 'reinf'

  @Column({ type: 'int' })
  periodoAno: number;

  @Column({ type: 'int', nullable: true })
  periodoMes: number;

  // Arquivo
  @Column({ length: 100, nullable: true })
  nomeArquivo: string;

  @Column({ type: 'text', nullable: true })
  conteudoArquivo: string;

  @Column({ length: 64, nullable: true })
  hashArquivo: string;

  // Status: gerado, validado, transmitido, aceito, rejeitado
  @Column({ length: 20, default: 'gerado' })
  status: string;

  // Transmissao
  @Column({ type: 'timestamp', nullable: true })
  dataTransmissao: Date;

  @Column({ length: 50, nullable: true })
  recibo: string;

  @Column({ length: 50, nullable: true })
  numeroControle: string;

  // Erros
  @Column({ type: 'text', nullable: true })
  errosValidacao?: string;

  @CreateDateColumn()
  criadoEm: Date;
}

/**
 * Obrigacoes Fiscais (obrigacoes_fiscais)
 * Pagamentos, declaracoes e apuracoes pendentes
 */
@Entity('obrigacoes_fiscais')
@Index('idx_obrigacoes_tenant', ['tenantId'])
@Index('idx_obrigacoes_empresa', ['empresaId'])
@Index('idx_obrigacoes_vencimento', ['dataVencimento'])
@Index('idx_obrigacoes_status', ['status'])
@Index('idx_obrigacoes_competencia', ['competenciaAno', 'competenciaMes'])
export class ObrigacaoFiscal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'uuid' })
  empresaId: string;

  // Identificacao
  @Column({ length: 10 })
  codigo: string;

  @Column({ length: 100 })
  descricao: string;

  @Column({ length: 20 })
  tipoObrigacao: string; // 'apuracao', 'declaracao', 'pagamento'

  // Periodicidade
  @Column({ length: 10 })
  periodicidade: string; // 'mensal', 'trimestral', 'anual', 'decendio', 'quinzenal'

  @Column({ type: 'int' })
  diaVencimento: number;

  @Column({ type: 'int', nullable: true })
  mesVencimento: number;

  // Imposto
  @Column({ length: 10, nullable: true })
  imposto: string; // 'ICMS', 'IPI', 'PIS', 'COFINS', 'ISS', 'IRPJ', 'CSLL', 'SIMPLES'

  @Column({ length: 4, nullable: true })
  codigoReceita: string;

  // Competencia
  @Column({ type: 'int' })
  competenciaAno: number;

  @Column({ type: 'int', nullable: true })
  competenciaMes: number;

  // Datas
  @Column({ type: 'date' })
  dataVencimento: Date;

  @Column({ type: 'date', nullable: true })
  dataApuracao: Date;

  @Column({ type: 'date', nullable: true })
  dataEntrega: Date;

  @Column({ type: 'date', nullable: true })
  dataPagamento: Date;

  // Valores
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  valorDevido: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  valorPago: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  valorMulta: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  valorJuros: number;

  // Status: pendente, aprovado, entregue, pago, atrasado, cancelado
  @Column({ length: 20, default: 'pendente' })
  status: string;

  // Documentos
  @Column({ type: 'text', nullable: true })
  arquivoGerado: string;

  @Column({ type: 'text', nullable: true })
  arquivoRetorno: string;

  @Column({ length: 50, nullable: true })
  numeroDocumento: string;

  // Observacoes
  @Column({ type: 'text', nullable: true })
  observacoes: string;

  // Controle
  @Column({ default: true })
  ativo: boolean;

  @CreateDateColumn()
  criadoEm: Date;

  @UpdateDateColumn()
  atualizadoEm: Date;

  @Column({ type: 'uuid', nullable: true })
  usuarioCadastro: string;

  @Column({ type: 'uuid', nullable: true })
  usuarioAtualizacao: string;
}

/**
 * Calendario Fiscal (calendario_fiscal)
 * Template de obrigacoes por regime e UF
 */
@Entity('calendario_fiscal')
export class CalendarioFiscal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  // Configuracao da obrigacao
  @Column({ length: 10 })
  codigo: string;

  @Column({ length: 100 })
  descricao: string;

  @Column({ length: 20 })
  tipoObrigacao: string;

  @Column({ length: 10 })
  periodicidade: string;

  @Column({ type: 'int' })
  diaVencimento: number;

  @Column({ type: 'int', nullable: true })
  mesVencimento: number;

  // Regras de feriado
  @Column({ default: true })
  antecipaFeriado: boolean;

  @Column({ default: true })
  antecipaFds: boolean;

  // Aplicabilidade
  @Column({ type: 'text', array: true, nullable: true })
  regimeTributario: string[]; // Array de regimes onde aplica

  @Column({ type: 'text', array: true, nullable: true })
  ufAplicavel: string[]; // Array de UFs

  // Imposto
  @Column({ length: 10, nullable: true })
  imposto: string;

  @Column({ length: 4, nullable: true })
  codigoReceita: string;

  // Alertas
  @Column({ type: 'int', default: 5 })
  diasAlerta: number;

  @Column({ default: true })
  ativo: boolean;
}

/**
 * Documentos Fiscais Arquivados (documentos_fiscais_arquivados)
 * Retencao obrigatoria de 5 anos
 */
@Entity('documentos_fiscais_arquivados')
@Index('idx_doc_arq_tenant', ['tenantId'])
@Index('idx_doc_arq_empresa', ['empresaId'])
@Index('idx_doc_arq_tipo', ['tipoDocumento'])
@Index('idx_doc_arq_chave', ['chaveAcesso'])
@Index('idx_doc_arq_competencia', ['competenciaAno', 'competenciaMes'])
@Index('idx_doc_arq_expiracao', ['dataExpiracao'])
export class DocumentoFiscalArquivado {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'uuid' })
  empresaId: string;

  // Documento
  @Column({ length: 20 })
  tipoDocumento: string; // 'NF-e', 'NFC-e', 'SPED', 'GUIA', 'DECLARACAO'

  @Column({ length: 50, nullable: true })
  numeroDocumento: string;

  @Column({ length: 44, nullable: true })
  chaveAcesso: string;

  @Column({ length: 3, nullable: true })
  serie: string;

  @Column({ type: 'bigint', nullable: true })
  numero: number;

  // Competencia
  @Column({ type: 'date', nullable: true })
  dataEmissao: Date;

  @Column({ type: 'int', nullable: true })
  competenciaAno: number;

  @Column({ type: 'int', nullable: true })
  competenciaMes: number;

  // Arquivo
  @Column({ length: 255, nullable: true })
  nomeArquivo: string;

  @Column({ type: 'text' })
  caminhoArquivo: string;

  @Column({ type: 'bigint', nullable: true })
  tamanhoArquivo: number;

  @Column({ length: 64, nullable: true })
  hashArquivo: string; // SHA-256

  @Column({ length: 50, nullable: true })
  mimeType: string;

  // Conteudo XML
  @Column({ type: 'text', nullable: true })
  xmlConteudo: string;

  @Column({ type: 'jsonb', nullable: true })
  jsonMetadados: Record<string, any>;

  // Retencao
  @CreateDateColumn()
  dataArquivamento: Date;

  @Column({ type: 'date', nullable: true })
  dataExpiracao: Date; // 5 anos apos arquivamento

  @Column({ length: 20, default: 'ativo' })
  statusRetencao: string; // 'ativo', 'expirado', 'eliminado'

  // Auditoria
  @Column({ type: 'uuid', nullable: true })
  usuarioArquivamento: string;

  // Controle de acesso
  @Column({ type: 'int', default: 0 })
  acessos: number;

  @Column({ type: 'timestamp', nullable: true })
  ultimoAcesso: Date;
}

/**
 * Auditoria Fiscal (auditoria_fiscal)
 * Log imutavel de auditorias fiscais
 */
@Entity('auditoria_fiscal')
@Index('idx_auditoria_tenant', ['tenantId'])
@Index('idx_auditoria_doc', ['tipoDocumento', 'documentoId'])
@Index('idx_auditoria_severidade', ['severidade'])
@Index('idx_auditoria_status', ['status'])
export class AuditoriaFiscal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  // Documento auditado
  @Column({ length: 20 })
  tipoDocumento: string; // 'NF-e', 'SPED', 'GUIA', etc.

  @Column({ type: 'uuid' })
  documentoId: string;

  // Auditoria
  @Column({ length: 30 })
  tipoAlerta: string;

  @Column({ length: 10 })
  severidade: string; // 'BAIXA', 'MEDIA', 'ALTA', 'CRITICA'

  @Column({ type: 'text' })
  mensagem: string;

  @Column({ type: 'jsonb', nullable: true })
  detalhes: Record<string, any>;

  // Status: aberto, analisando, resolvido, ignorado
  @Column({ length: 20, default: 'aberto' })
  status: string;

  @Column({ type: 'uuid', nullable: true })
  usuarioAnalise: string;

  @Column({ type: 'timestamp', nullable: true })
  dataAnalise: Date;

  @Column({ type: 'text', nullable: true })
  justificativa: string;

  @CreateDateColumn()
  criadoEm: Date;
}

/**
 * NCM x CEST Relacionamento (ncm_cest_relacionamento)
 */
@Entity('ncm_cest_relacionamento')
@Index('idx_ncm_cest_ncm', ['ncmCodigo'])
export class NcmCestRelacionamento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 8 })
  ncmCodigo: string;

  @Column({ length: 7 })
  cestCodigo: string;

  @Column({ length: 2, nullable: true })
  uf: string;

  @Column({ default: true })
  ativo: boolean;
}
