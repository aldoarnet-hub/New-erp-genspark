import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Matriz Tributária Inteligente
 * Regras de tributação com prioridade e filtros múltiplos
 */
@Entity('matriz_tributaria')
@Index('idx_matriz_tenant', ['tenantId'])
@Index('idx_matriz_prioridade', ['prioridade'])
@Index('idx_matriz_empresa', ['empresaId'])
@Index('idx_matriz_ncm', ['ncmCodigo'])
@Index('idx_matriz_cfop', ['cfopCodigo'])
@Index('idx_matriz_uf', ['ufOrigem', 'ufDestino'])
@Index('idx_matriz_regime', ['regimeTributarioEmp'])
@Index('idx_matriz_busca', [
  'tenantId', 'ativo', 'prioridade',
  'regimeTributarioEmp', 'ufOrigem', 'ufDestino',
  'ncmCodigo', 'cfopCodigo',
])
export class MatrizTributaria {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ type: 'uuid' })
  tenantId: string;

  // Identificação
  @ApiProperty()
  @Column({ length: 20 })
  codigo: string;

  @ApiProperty()
  @Column({ length: 100 })
  descricao: string;

  // Prioridade (menor = maior prioridade)
  @ApiProperty()
  @Column({ type: 'int', default: 999 })
  prioridade: number;

  // Filtros
  @ApiProperty()
  @Column({ type: 'uuid', nullable: true })
  empresaId: string;

  @ApiProperty()
  @Column({ type: 'uuid', nullable: true })
  filialId: string;

  @ApiProperty()
  @Column({ type: 'uuid', nullable: true })
  produtoId: string;

  @ApiProperty()
  @Column({ length: 8, nullable: true })
  ncmCodigo: string;

  @ApiProperty()
  @Column({ length: 7, nullable: true })
  cestCodigo: string;

  @ApiProperty()
  @Column({ type: 'uuid', nullable: true })
  grupoProdutoId: string;

  @ApiProperty()
  @Column({ length: 4, nullable: true })
  cfopCodigo: string;

  @ApiProperty()
  @Column({ length: 1, nullable: true })
  tipoOperacao: string;

  @ApiProperty()
  @Column({ type: 'uuid', nullable: true })
  parceiroId: string;

  @ApiProperty()
  @Column({ length: 2, nullable: true })
  ufOrigem: string;

  @ApiProperty()
  @Column({ length: 2, nullable: true })
  ufDestino: string;

  @ApiProperty()
  @Column({ length: 2, nullable: true })
  regimeTributarioDest: string;

  @ApiProperty()
  @Column({ length: 2, nullable: true })
  regimeTributarioEmp: string;

  // Período
  @ApiProperty()
  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  dataInicio: Date;

  @ApiProperty()
  @Column({ type: 'date', nullable: true })
  dataFim: Date;

  // ICMS
  @ApiProperty()
  @Column({ length: 3, nullable: true })
  icmsCst: string;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  icmsAliq: number;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  icmsReducaoBc: number;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  icmsDiferimento: number;

  @ApiProperty()
  @Column({ default: false })
  icmsDesonerado: boolean;

  @ApiProperty()
  @Column({ length: 2, nullable: true })
  icmsMotivoDesoneracao: string;

  // ICMS-ST
  @ApiProperty()
  @Column({ length: 3, nullable: true })
  icmsStCst: string;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 7, scale: 4, nullable: true })
  icmsStMva: number;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  icmsStAliq: number;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  icmsStReducaoBc: number;

  @ApiProperty()
  @Column({ length: 1, default: '4' })
  icmsStModalidadeBc: string;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 15, scale: 4, nullable: true })
  icmsStPauta: number;

  // IPI
  @ApiProperty()
  @Column({ length: 2, nullable: true })
  ipiCst: string;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  ipiAliq: number;

  @ApiProperty()
  @Column({ length: 6, nullable: true })
  ipiUnidadeMedida: string;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 15, scale: 4, nullable: true })
  ipiValorUnidade: number;

  @ApiProperty()
  @Column({ length: 3, nullable: true })
  ipiEnquadramento: string;

  // PIS
  @ApiProperty()
  @Column({ length: 2, nullable: true })
  pisCst: string;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  pisAliq: number;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 15, scale: 4, nullable: true })
  pisValorUnidade: number;

  // COFINS
  @ApiProperty()
  @Column({ length: 2, nullable: true })
  cofinsCst: string;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  cofinsAliq: number;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 15, scale: 4, nullable: true })
  cofinsValorUnidade: number;

  // ISS
  @ApiProperty()
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  issAliq: number;

  @ApiProperty()
  @Column({ default: false })
  issRetido: boolean;

  @ApiProperty()
  @Column({ default: false })
  issIncentivo: boolean;

  // Simples Nacional
  @ApiProperty()
  @Column({ length: 3, nullable: true })
  snCsosn: string;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  snAliquota: number;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  snCreditoSn: number;

  // Observações
  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  observacaoFiscal: string;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  informacaoComplementar: string;

  // Controle
  @ApiProperty()
  @Column({ default: true })
  ativo: boolean;

  @CreateDateColumn()
  criadoEm: Date;

  @UpdateDateColumn()
  atualizadoEm: Date;

  @ApiProperty()
  @Column({ type: 'uuid', nullable: true })
  usuarioCadastro: string;

  @ApiProperty()
  @Column({ type: 'uuid', nullable: true })
  usuarioAtualizacao: string;
}
