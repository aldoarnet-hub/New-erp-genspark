import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Empresa } from '../../empresa/entities/empresa.entity';

@Entity('filiais')
export class Filial {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  empresaId: string;

  @ManyToOne(() => Empresa, (empresa) => empresa.filiais)
  @JoinColumn({ name: 'empresaId' })
  empresa: Empresa;

  @ApiProperty()
  @Column()
  tenantId: string;

  @ApiProperty()
  @Column({ length: 200 })
  nome: string;

  @ApiProperty()
  @Column({ length: 20, nullable: true })
  cnpj: string;

  @ApiProperty()
  @Column({ length: 20, nullable: true })
  inscricaoEstadual: string;

  @ApiProperty()
  @Column({ length: 10, nullable: true })
  cep: string;

  @ApiProperty()
  @Column({ length: 200, nullable: true })
  logradouro: string;

  @ApiProperty()
  @Column({ length: 20, nullable: true })
  numero: string;

  @ApiProperty()
  @Column({ length: 100, nullable: true })
  complemento: string;

  @ApiProperty()
  @Column({ length: 100, nullable: true })
  bairro: string;

  @ApiProperty()
  @Column({ length: 100, nullable: true })
  cidade: string;

  @ApiProperty()
  @Column({ length: 2, nullable: true })
  uf: string;

  @ApiProperty()
  @Column({ length: 10, nullable: true })
  codigoIbge: string;

  @ApiProperty()
  @Column({ length: 150, nullable: true })
  email: string;

  @ApiProperty()
  @Column({ length: 20, nullable: true })
  telefone: string;

  @ApiProperty()
  @Column({ default: true })
  ativo: boolean;

  @ApiProperty()
  @Column({ type: 'jsonb', nullable: true })
  configuracoes: Record<string, any>;

  @ApiProperty()
  @CreateDateColumn()
  criadoEm: Date;

  @ApiProperty()
  @UpdateDateColumn()
  atualizadoEm: Date;
}
