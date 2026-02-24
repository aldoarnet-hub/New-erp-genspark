import {
  Entity, PrimaryGeneratedColumn, Column, Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Tabela CST ICMS - Código de Situação Tributária
 */
@Entity('cst_icms')
export class CstIcms {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ length: 3, unique: true })
  cstCodigo: string;

  @ApiProperty()
  @Column({ type: 'text' })
  descricao: string;

  @ApiProperty()
  @Column({ length: 100, nullable: true })
  descricaoResumida: string;

  @ApiProperty()
  @Column({ length: 20 })
  tipo: string;

  @Column({ default: false })
  tributado: boolean;

  @Column({ default: false })
  isento: boolean;

  @Column({ default: false })
  naoTributado: boolean;

  @Column({ default: false })
  st: boolean;

  @Column({ default: false })
  diferimento: boolean;

  @Column({ default: false })
  antecipacao: boolean;

  @Column({ default: false })
  exigeAliquota: boolean;

  @Column({ default: false })
  exigeReducaoBc: boolean;

  @Column({ default: false })
  exigeDiferimento: boolean;

  @Column({ default: false })
  exigeSt: boolean;

  @Column({ default: true })
  ativo: boolean;
}

/**
 * Tabela CST IPI
 */
@Entity('cst_ipi')
export class CstIpi {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ length: 2, unique: true })
  cstCodigo: string;

  @ApiProperty()
  @Column({ type: 'text' })
  descricao: string;

  @ApiProperty()
  @Column({ length: 20 })
  tipo: string;

  @Column({ default: false })
  tributado: boolean;

  @Column({ default: false })
  isento: boolean;

  @Column({ default: false })
  naoTributado: boolean;

  @Column({ default: false })
  suspensao: boolean;

  @Column({ default: true })
  ativo: boolean;
}

/**
 * Tabela CST PIS/COFINS
 */
@Entity('cst_pis_cofins')
export class CstPisCofins {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ length: 2 })
  cstCodigo: string;

  @ApiProperty()
  @Column({ type: 'text' })
  descricao: string;

  @ApiProperty()
  @Column({ length: 10 })
  tipoOperacao: string; // 'entrada' ou 'saida'

  @Column({ default: false })
  tributado: boolean;

  @Column({ default: false })
  isento: boolean;

  @Column({ default: false })
  naoTributado: boolean;

  @Column({ default: false })
  monofasico: boolean;

  @Column({ default: false })
  substituicaoTributaria: boolean;

  @Column({ default: false })
  aliquotaZero: boolean;

  @Column({ default: true })
  ativo: boolean;
}
