import {
  Entity, PrimaryGeneratedColumn, Column, Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Alíquotas ICMS por UF (origem x destino)
 */
@Entity('icms_aliquotas_uf')
@Index('idx_icms_uf_origem_destino', ['ufOrigem', 'ufDestino'])
export class IcmsAliquotasUf {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ length: 2 })
  ufOrigem: string;

  @ApiProperty()
  @Column({ length: 2 })
  ufDestino: string;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 5, scale: 2 })
  aliqInterna: number;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 5, scale: 2 })
  aliqInterestadual: number;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  aliqFcp: number;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 100 })
  partilhaUfDestino: number;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  partilhaUfOrigem: number;

  @ApiProperty()
  @Column({ type: 'date' })
  dataInicioVigencia: Date;

  @ApiProperty()
  @Column({ type: 'date', nullable: true })
  dataFimVigencia: Date;

  @ApiProperty()
  @Column({ default: true })
  ativo: boolean;
}

/**
 * Tabela ICMS-ST MVA por NCM/CEST e UF
 */
@Entity('icms_st_mva')
@Index('idx_icms_st_ncm', ['ncmCodigo'])
@Index('idx_icms_st_cest', ['cestCodigo'])
@Index('idx_icms_st_uf', ['ufOrigem', 'ufDestino'])
export class IcmsStMva {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ length: 8, nullable: true })
  ncmCodigo: string;

  @ApiProperty()
  @Column({ length: 7, nullable: true })
  cestCodigo: string;

  @ApiProperty()
  @Column({ length: 2 })
  ufOrigem: string;

  @ApiProperty()
  @Column({ length: 2 })
  ufDestino: string;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 7, scale: 4 })
  mvaOriginal: number;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 7, scale: 4, nullable: true })
  mvaAjustada: number;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  reducaoBcIcms: number;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  reducaoBcSt: number;

  @ApiProperty()
  @Column({ length: 20, nullable: true })
  convenioIcms: string;

  @ApiProperty()
  @Column({ length: 20, nullable: true })
  protocoloIcms: string;

  @ApiProperty()
  @Column({ type: 'date' })
  dataInicioVigencia: Date;

  @ApiProperty()
  @Column({ type: 'date', nullable: true })
  dataFimVigencia: Date;

  @ApiProperty()
  @Column({ default: true })
  ativo: boolean;
}
