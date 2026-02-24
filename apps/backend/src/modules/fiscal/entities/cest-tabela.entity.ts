import {
  Entity, PrimaryGeneratedColumn, Column, Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Tabela CEST - Código Especificador da Substituição Tributária
 */
@Entity('cest_tabela')
@Index('idx_cest_codigo', ['cestCodigo'])
@Index('idx_cest_segmento', ['segmento'])
export class CestTabela {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ length: 7 })
  cestCodigo: string;

  @ApiProperty()
  @Column({ length: 2 })
  segmento: string;

  @ApiProperty()
  @Column({ length: 100, nullable: true })
  descricaoSegmento: string;

  @ApiProperty()
  @Column({ type: 'text' })
  descricao: string;

  @ApiProperty()
  @Column({ type: 'text', array: true, nullable: true })
  ncmsVinculados: string[];

  @ApiProperty()
  @Column({ type: 'decimal', precision: 7, scale: 4, nullable: true })
  icmsStMvaPadrao: number;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  icmsStReducaoBc: number;

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
  @Column({ length: 10, nullable: true })
  convenioIcms: string;
}
