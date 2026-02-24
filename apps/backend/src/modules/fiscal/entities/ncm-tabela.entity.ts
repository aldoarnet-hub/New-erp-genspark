import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Tabela NCM - Nomenclatura Comum do Mercosul
 */
@Entity('ncm_tabela')
@Index('idx_ncm_codigo', ['ncmCodigo'])
@Index('idx_ncm_capitulo', ['capitulo'])
@Index('idx_ncm_posicao', ['posicao'])
export class NcmTabela {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ length: 8 })
  ncmCodigo: string;

  @ApiProperty()
  @Column({ length: 2, nullable: true })
  ncmExcecao: string;

  @ApiProperty()
  @Column({ type: 'text' })
  descricao: string;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  descricaoCompleta: string;

  @ApiProperty()
  @Column({ length: 2 })
  capitulo: string;

  @ApiProperty()
  @Column({ length: 4 })
  posicao: string;

  @ApiProperty()
  @Column({ length: 5, nullable: true })
  subposicao1: string;

  @ApiProperty()
  @Column({ length: 6, nullable: true })
  subposicao2: string;

  @ApiProperty()
  @Column({ length: 7, nullable: true })
  item: string;

  @ApiProperty()
  @Column({ length: 8, nullable: true })
  subitem: string;

  // IPI
  @ApiProperty()
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  ipiAliqEntrada: number;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  ipiAliqSaida: number;

  @ApiProperty()
  @Column({ length: 2, default: '50' })
  ipiCstEntradaPadrao: string;

  @ApiProperty()
  @Column({ length: 2, default: '50' })
  ipiCstSaidaPadrao: string;

  // PIS/COFINS
  @ApiProperty()
  @Column({ length: 3, nullable: true })
  pisCofinsNaturezaReceita: string;

  @ApiProperty()
  @Column({ length: 2, default: '50' })
  pisCofinsCstEntradaPadrao: string;

  @ApiProperty()
  @Column({ length: 2, default: '01' })
  pisCofinsCstSaidaPadrao: string;

  // ICMS
  @ApiProperty()
  @Column({ default: false })
  icmsStMvaAjustada: boolean;

  @ApiProperty()
  @Column({ default: false })
  icmsStCestVinculado: boolean;

  // Controle
  @ApiProperty()
  @Column({ default: true })
  ativo: boolean;

  @ApiProperty()
  @Column({ type: 'date' })
  dataInicioVigencia: Date;

  @ApiProperty()
  @Column({ type: 'date', nullable: true })
  dataFimVigencia: Date;

  @ApiProperty()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  ultimaAtualizacao: Date;

  @ApiProperty()
  @Column({ length: 50, default: 'Receita Federal' })
  fonteAtualizacao: string;
}
