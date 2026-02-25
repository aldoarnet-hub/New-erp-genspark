import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  Index, OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Notas Fiscais Eletronicas (nf_e)
 * Modelo 55 (NF-e) e 65 (NFC-e)
 */
@Entity('nf_e')
@Index('idx_nfe_tenant', ['tenantId'])
@Index('idx_nfe_empresa', ['empresaId'])
@Index('idx_nfe_chave', ['chaveAcesso'])
@Index('idx_nfe_numero', ['numero'])
@Index('idx_nfe_emissao', ['dataEmissao'])
@Index('idx_nfe_status', ['status'])
export class NfE {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'uuid' })
  empresaId: string;

  // Identificacao
  @Column({ length: 44 })
  chaveAcesso: string;

  @Column({ type: 'bigint' })
  numero: number;

  @Column({ type: 'int', default: 1 })
  serie: number;

  @Column({ length: 2, default: '55' })
  modelo: string; // 55=NF-e, 65=NFC-e

  // Datas
  @Column({ type: 'date' })
  dataEmissao: Date;

  @Column({ type: 'date', nullable: true })
  dataSaidaEntrada: Date;

  @Column({ type: 'time', nullable: true })
  horaSaidaEntrada: string;

  // Operacao
  @Column({ length: 1 })
  tipoOperacao: string; // E=Entrada, S=Saida

  @Column({ length: 1, default: '1' })
  finalidadeEmissao: string; // 1=Normal, 2=Complementar, 3=Ajuste, 4=Devolucao

  @Column({ length: 60, nullable: true })
  naturezaOperacao: string;

  // Emitente
  @Column({ length: 14, nullable: true })
  emitenteCnpj: string;

  @Column({ length: 60, nullable: true })
  emitenteNome: string;

  @Column({ length: 14, nullable: true })
  emitenteIe: string;

  @Column({ length: 2, nullable: true })
  emitenteUf: string;

  // Destinatario
  @Column({ length: 14, nullable: true })
  destinatarioCnpjCpf: string;

  @Column({ length: 60, nullable: true })
  destinatarioNome: string;

  @Column({ length: 14, nullable: true })
  destinatarioIe: string;

  @Column({ length: 2, nullable: true })
  destinatarioUf: string;

  // Valores
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  valorBaseCalculoIcms: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  valorIcms: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  valorBaseCalculoIcmsSt: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  valorIcmsSt: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  valorProdutos: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  valorFrete: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  valorSeguro: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  valorDesconto: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  valorIpi: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  valorPis: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  valorCofins: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  valorOutrasDespesas: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  valorTotal: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  valorAproximadoTributos: number;

  // Transporte
  @Column({ length: 1, nullable: true })
  modalidadeFrete: string; // 0=Emitente, 1=Destinatario, 2=Terceiros, 9=SemFrete

  @Column({ length: 60, nullable: true })
  transportadoraNome: string;

  @Column({ length: 14, nullable: true })
  transportadoraCnpj: string;

  @Column({ length: 14, nullable: true })
  transportadoraIe: string;

  @Column({ length: 60, nullable: true })
  transportadoraEndereco: string;

  @Column({ length: 2, nullable: true })
  transportadoraUf: string;

  // Informacoes Complementares
  @Column({ type: 'text', nullable: true })
  informacoesComplementares: string;

  @Column({ type: 'text', nullable: true })
  informacoesFisco: string;

  // XML
  @Column({ type: 'text', nullable: true })
  xmlAssinado: string;

  @Column({ type: 'text', nullable: true })
  xmlProtocolo: string;

  @Column({ type: 'text', nullable: true })
  xmlCancelamento: string;

  @Column({ type: 'text', nullable: true })
  xmlCce: string;

  // Protocolo
  @Column({ length: 15, nullable: true })
  protocoloAutorizacao: string;

  @Column({ type: 'timestamp', nullable: true })
  dataAutorizacao: Date;

  @Column({ length: 15, nullable: true })
  protocoloCancelamento: string;

  @Column({ type: 'timestamp', nullable: true })
  dataCancelamento: Date;

  // Status
  @Column({ length: 20, default: 'pendente' })
  status: string; // pendente, autorizada, cancelada, denegada, rejeitada, inutilizada

  @Column({ length: 2, default: '00' })
  situacao: string;

  @Column({ type: 'text', nullable: true })
  motivoStatus: string;

  // Integracao
  @Column({ length: 50, nullable: true })
  idIntegracao: string;

  @Column({ length: 20, default: 'manual' })
  origem: string; // manual, importacao, integracao

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
 * Itens da Nota Fiscal (nf_item)
 */
@Entity('nf_item')
@Index('idx_nf_item_nfe', ['nfeId'])
@Index('idx_nf_item_produto', ['produtoId'])
@Index('idx_nf_item_ncm', ['ncm'])
export class NfItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'uuid' })
  nfeId: string;

  // Sequencial
  @Column({ type: 'int' })
  numeroItem: number;

  // Produto
  @Column({ type: 'uuid', nullable: true })
  produtoId: string;

  @Column({ length: 60 })
  codigoProduto: string;

  @Column({ length: 120 })
  descricaoProduto: string;

  @Column({ length: 8, nullable: true })
  ncm: string;

  @Column({ length: 7, nullable: true })
  cest: string;

  @Column({ length: 4, nullable: true })
  cfop: string;

  // Unidade
  @Column({ length: 6 })
  unidadeComercial: string;

  @Column({ type: 'decimal', precision: 15, scale: 4 })
  quantidadeComercial: number;

  @Column({ type: 'decimal', precision: 15, scale: 10 })
  valorUnitarioComercial: number;

  @Column({ length: 6, nullable: true })
  unidadeTributavel: string;

  @Column({ type: 'decimal', precision: 15, scale: 4, nullable: true })
  quantidadeTributavel: number;

  @Column({ type: 'decimal', precision: 15, scale: 10, nullable: true })
  valorUnitarioTributavel: number;

  // Valores
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  valorTotal: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  valorDesconto: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  valorFrete: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  valorSeguro: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  valorOutrasDespesas: number;

  // ICMS
  @Column({ length: 1, default: '0' })
  icmsOrigem: string;

  @Column({ length: 3, nullable: true })
  icmsCst: string;

  @Column({ length: 1, default: '3' })
  icmsModalidadeBc: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  icmsReducaoBc: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  icmsBaseCalculo: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  icmsAliquota: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  icmsValor: number;

  // ICMS-ST
  @Column({ length: 1, nullable: true })
  icmsStModalidadeBc: string;

  @Column({ type: 'decimal', precision: 7, scale: 4, default: 0 })
  icmsStMva: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  icmsStReducaoBc: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  icmsStBaseCalculo: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  icmsStAliquota: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  icmsStValor: number;

  // IPI
  @Column({ length: 2, nullable: true })
  ipiCst: string;

  @Column({ length: 3, nullable: true })
  ipiCodigoEnquadramento: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  ipiBaseCalculo: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  ipiAliquota: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  ipiValor: number;

  // PIS
  @Column({ length: 2, nullable: true })
  pisCst: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  pisBaseCalculo: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  pisAliquota: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  pisValor: number;

  // COFINS
  @Column({ length: 2, nullable: true })
  cofinsCst: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  cofinsBaseCalculo: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  cofinsAliquota: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  cofinsValor: number;

  // Simples Nacional
  @Column({ length: 3, nullable: true })
  icmsCsosn: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  icmsCreditoSn: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  icmsValorCreditoSn: number;

  // Controle
  @Column({ type: 'text', nullable: true })
  informacaoAdicional: string;

  @Column({ length: 15, nullable: true })
  numeroPedidoCompra: string;

  @Column({ type: 'int', nullable: true })
  itemPedidoCompra: number;
}

/**
 * Eventos da NF-e (eventos_nfe)
 * Cancelamento, CC-e, Manifestacao, etc.
 */
@Entity('eventos_nfe')
@Index('idx_eventos_nfe_nfe', ['nfeId'])
@Index('idx_eventos_nfe_tipo', ['tipoEvento'])
export class EventoNfe {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'uuid' })
  nfeId: string;

  // Evento
  @Column({ length: 6 })
  tipoEvento: string; // 110111=Cancelamento, 110110=CC-e, 210200=Confirmacao, etc.

  @Column({ type: 'int' })
  sequencial: number;

  @Column({ length: 60, nullable: true })
  descricaoEvento: string;

  // Protocolo
  @Column({ length: 15, nullable: true })
  protocolo: string;

  @Column({ type: 'timestamp', nullable: true })
  dataEvento: Date;

  // Conteudo
  @Column({ type: 'text', nullable: true })
  xmlEvento: string;

  @Column({ type: 'text', nullable: true })
  correcao: string; // Para CC-e

  @Column({ type: 'text', nullable: true })
  justificativa: string; // Para cancelamento

  // Status
  @Column({ length: 20, default: 'pendente' })
  status: string;

  @CreateDateColumn()
  criadoEm: Date;
}
