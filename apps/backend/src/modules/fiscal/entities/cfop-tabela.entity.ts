import {
  Entity, PrimaryGeneratedColumn, Column, Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Tabela CFOP - Código Fiscal de Operações e Prestações
 */
@Entity('cfop_tabela')
@Index('idx_cfop_codigo', ['cfopCodigo'])
@Index('idx_cfop_tipo', ['tipoOperacao'])
@Index('idx_cfop_grupo', ['grupo'])
export class CfopTabela {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ length: 4, unique: true })
  cfopCodigo: string;

  @ApiProperty()
  @Column({ type: 'text' })
  descricao: string;

  @ApiProperty()
  @Column({ length: 60, nullable: true })
  descricaoResumida: string;

  @ApiProperty()
  @Column({ length: 1 })
  tipoOperacao: string; // E=Entrada, S=Saída

  @ApiProperty()
  @Column({ length: 2 })
  grupo: string;

  @ApiProperty()
  @Column({ length: 50, nullable: true })
  grupoDescricao: string;

  // Natureza da operação
  @ApiProperty()
  @Column({ default: false })
  aquisicao: boolean;

  @ApiProperty()
  @Column({ default: false })
  venda: boolean;

  @ApiProperty()
  @Column({ default: false })
  transferencia: boolean;

  @ApiProperty()
  @Column({ default: false })
  devolucao: boolean;

  @ApiProperty()
  @Column({ default: false })
  remessa: boolean;

  // Localização
  @ApiProperty()
  @Column({ default: false })
  interno: boolean;

  @ApiProperty()
  @Column({ default: false })
  interestadual: boolean;

  @ApiProperty()
  @Column({ default: false })
  exterior: boolean;

  // Contribuinte
  @ApiProperty()
  @Column({ default: true })
  contribuinteIcms: boolean;

  // Implicações fiscais
  @ApiProperty()
  @Column({ default: false })
  geraCreditoIcms: boolean;

  @ApiProperty()
  @Column({ default: false })
  geraCreditoPisCofins: boolean;

  @ApiProperty()
  @Column({ default: false })
  geraDebitoIcms: boolean;

  @ApiProperty()
  @Column({ default: false })
  geraDebitoPisCofins: boolean;

  // SPED
  @ApiProperty()
  @Column({ length: 3, nullable: true })
  spedCodigoAjuste: string;

  // Controle
  @ApiProperty()
  @Column({ default: true })
  ativo: boolean;

  @ApiProperty()
  @Column({ type: 'date', default: '2010-01-01' })
  dataInicioVigencia: Date;

  @ApiProperty()
  @Column({ type: 'date', nullable: true })
  dataFimVigencia: Date;
}
