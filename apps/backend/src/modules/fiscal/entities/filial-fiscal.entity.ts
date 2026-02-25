import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  Index, ManyToOne, JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Filiais e Estabelecimentos fiscais (filiais_fiscais)
 * Vinculadas a uma empresa matriz (empresas_fiscais)
 */
@Entity('filiais_fiscais')
@Index('idx_filiais_fiscais_tenant', ['tenantId'])
@Index('idx_filiais_fiscais_cnpj', ['tenantId', 'cnpj'], { unique: true })
export class FilialFiscal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'uuid' })
  empresaMatrizId: string;

  // Dados da Filial
  @Column({ length: 14 })
  cnpj: string;

  @Column({ length: 14, nullable: true })
  inscricaoEstadual: string;

  @Column({ length: 15, nullable: true })
  inscricaoMunicipal: string;

  @Column({ length: 60, nullable: true })
  nomeFantasia: string;

  // Tipo de Estabelecimento: 01=Matriz, 02=Filial, etc.
  @Column({ length: 2 })
  tipoEstabelecimento: string;

  // Endereco
  @Column({ length: 7 })
  enderecoCodigoMunicipio: string;

  @Column({ length: 2 })
  enderecoUf: string;

  // Configuracoes especificas da filial
  @Column({ type: 'int', default: 1 })
  nfeSerie: number;

  @Column({ type: 'int', default: 1 })
  nfceSerie: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  icmsAliqInterna: number;

  // Vinculacao com matriz
  @Column({ default: true })
  herdaConfiguracoes: boolean;

  @Column({ default: true })
  ativo: boolean;

  @CreateDateColumn()
  criadoEm: Date;
}
