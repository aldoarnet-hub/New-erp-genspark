import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Configuração fiscal completa por empresa (empresas_fiscais)
 * Contém dados tributários, certificado digital, configuração NF-e/NFC-e, SPED
 */
@Entity('empresas_fiscais')
@Index('idx_empresas_fiscais_tenant', ['tenantId'])
@Index('idx_empresas_fiscais_cnpj', ['cnpj'])
@Index('idx_empresas_fiscais_uf', ['enderecoUf'])
@Index('idx_empresas_fiscais_regime', ['regimeTributario'])
export class EmpresaFiscal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ type: 'uuid' })
  tenantId: string;

  @ApiProperty()
  @Column({ type: 'uuid' })
  empresaId: string;

  // Dados Cadastrais
  @ApiProperty()
  @Column({ length: 14 })
  cnpj: string;

  @ApiProperty()
  @Column({ length: 150 })
  razaoSocial: string;

  @ApiProperty()
  @Column({ length: 60, nullable: true })
  nomeFantasia: string;

  @ApiProperty()
  @Column({ length: 14, nullable: true })
  inscricaoEstadual: string;

  @ApiProperty()
  @Column({ length: 15, nullable: true })
  inscricaoMunicipal: string;

  @ApiProperty()
  @Column({ length: 9, nullable: true })
  inscricaoSuframa: string;

  // Regime Tributário: 1=Simples, 2=Simples Excesso, 3=Normal
  @ApiProperty()
  @Column({ length: 2 })
  regimeTributario: string;

  @ApiProperty()
  @Column({ length: 7 })
  cnaePrincipal: string;

  @ApiProperty()
  @Column({ type: 'text', array: true, nullable: true })
  cnaeSecundarios: string[];

  // Simples Nacional
  @ApiProperty()
  @Column({ length: 5, nullable: true })
  snAnexo: string;

  @ApiProperty()
  @Column({ length: 2, nullable: true })
  snTabela: string;

  @ApiProperty()
  @Column({ type: 'int', nullable: true })
  snFaixa: number;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 5, scale: 4, nullable: true })
  snFatorR: number;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  snPercCredito: number;

  // Lucro Presumido
  @ApiProperty()
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 8.0 })
  lpPercPresumidoComercio: number;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 32.0 })
  lpPercPresumidoServicos: number;

  // Lucro Real
  @ApiProperty()
  @Column({ length: 1, default: '1' })
  lrMetodoApuracao: string;

  // Endereço Fiscal
  @ApiProperty()
  @Column({ length: 60 })
  enderecoLogradouro: string;

  @ApiProperty()
  @Column({ length: 10 })
  enderecoNumero: string;

  @ApiProperty()
  @Column({ length: 60, nullable: true })
  enderecoComplemento: string;

  @ApiProperty()
  @Column({ length: 60 })
  enderecoBairro: string;

  @ApiProperty()
  @Column({ length: 8 })
  enderecoCep: string;

  @ApiProperty()
  @Column({ length: 7 })
  enderecoCodigoMunicipio: string;

  @ApiProperty()
  @Column({ length: 2 })
  enderecoUf: string;

  @ApiProperty()
  @Column({ length: 4, default: '1058' })
  enderecoCodigoPais: string;

  // Telefones
  @ApiProperty()
  @Column({ length: 3, nullable: true })
  telefoneDdd: string;

  @ApiProperty()
  @Column({ length: 10, nullable: true })
  telefoneNumero: string;

  @ApiProperty()
  @Column({ length: 60, nullable: true })
  email: string;

  // NF-e
  @ApiProperty()
  @Column({ length: 1, default: '2' })
  nfeAmbiente: string;

  @ApiProperty()
  @Column({ type: 'int', default: 1 })
  nfeSerie: number;

  @ApiProperty()
  @Column({ type: 'bigint', default: 0 })
  nfeNumeroAtual: number;

  @ApiProperty()
  @Column({ type: 'int', nullable: true })
  nfeSerieContingencia: number;

  @ApiProperty()
  @Column({ type: 'bigint', default: 0 })
  nfeNumeroContingencia: number;

  // NFC-e
  @ApiProperty()
  @Column({ length: 1, default: '2' })
  nfceAmbiente: string;

  @ApiProperty()
  @Column({ type: 'int', default: 1 })
  nfceSerie: number;

  @ApiProperty()
  @Column({ type: 'bigint', default: 0 })
  nfceNumeroAtual: number;

  @ApiProperty()
  @Column({ length: 6, nullable: true })
  nfceCscId: string;

  @ApiProperty()
  @Column({ length: 36, nullable: true })
  nfceCscToken: string;

  // Certificado Digital
  @ApiProperty()
  @Column({ length: 10, default: 'A1' })
  certificadoTipo: string;

  @ApiProperty()
  @Column({ length: 100, nullable: true })
  certificadoSerial: string;

  @ApiProperty()
  @Column({ type: 'timestamp', nullable: true })
  certificadoValidadeInicio: Date;

  @ApiProperty()
  @Column({ type: 'timestamp', nullable: true })
  certificadoValidadeFim: Date;

  @ApiProperty()
  @Column({ length: 500, nullable: true })
  certificadoCaminho: string;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  certificadoSenhaCriptografada: string;

  @ApiProperty()
  @Column({ type: 'int', default: 30 })
  certificadoDiasAlerta: number;

  // Configuração de Impostos
  @ApiProperty()
  @Column({ default: true })
  icmsContribuinte: boolean;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  icmsAliqInterna: number;

  @ApiProperty()
  @Column({ default: false })
  ipiContribuinte: boolean;

  @ApiProperty()
  @Column({ default: true })
  pisCofinsCumulativo: boolean;

  @ApiProperty()
  @Column({ default: false })
  issRetidoPadrao: boolean;

  @ApiProperty()
  @Column({ default: false })
  issIncentivoFiscal: boolean;

  // Estoque
  @ApiProperty()
  @Column({ default: true })
  estoqueControleFiscal: boolean;

  @ApiProperty()
  @Column({ length: 2, default: '1' })
  estoqueMetodoAvaliacao: string;

  // SPED
  @ApiProperty()
  @Column({ length: 1, nullable: true })
  spedCodigoPerfil: string;

  @ApiProperty()
  @Column({ length: 1, nullable: true })
  spedIndAtividade: string;

  @ApiProperty()
  @Column({ length: 2, nullable: true })
  spedIndNaturezaPj: string;

  // Flags
  @ApiProperty()
  @Column({ default: true })
  ativo: boolean;

  @ApiProperty()
  @Column({ default: false })
  principal: boolean;

  @CreateDateColumn()
  criadoEm: Date;

  @UpdateDateColumn()
  atualizadoEm: Date;
}
