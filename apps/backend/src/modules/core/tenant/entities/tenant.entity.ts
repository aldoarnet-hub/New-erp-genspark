import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Empresa } from '../../empresa/entities/empresa.entity';

export enum TenantStatus {
  ATIVO = 'ativo',
  INATIVO = 'inativo',
  SUSPENSO = 'suspenso',
  TRIAL = 'trial',
}

export enum TenantPlano {
  TRIAL = 'trial',
  BASICO = 'basico',
  PROFISSIONAL = 'profissional',
  ENTERPRISE = 'enterprise',
}

@Entity('tenants', { schema: 'public' })
export class Tenant {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ length: 100 })
  nome: string;

  @ApiProperty()
  @Column({ length: 100, unique: true })
  slug: string;

  @ApiProperty()
  @Column({ length: 20, unique: true })
  cnpj: string;

  @ApiProperty()
  @Column({ length: 150 })
  email: string;

  @ApiProperty()
  @Column({ length: 20, nullable: true })
  telefone: string;

  @ApiProperty({ enum: TenantPlano })
  @Column({ type: 'enum', enum: TenantPlano, default: TenantPlano.TRIAL })
  plano: TenantPlano;

  @ApiProperty({ enum: TenantStatus })
  @Column({ type: 'enum', enum: TenantStatus, default: TenantStatus.TRIAL })
  status: TenantStatus;

  @ApiProperty()
  @Column({ length: 100 })
  schemaName: string;

  @ApiProperty()
  @Column({ type: 'int', default: 5 })
  maxUsuarios: number;

  @ApiProperty()
  @Column({ type: 'int', default: 1 })
  maxEmpresas: number;

  @ApiProperty()
  @Column({ type: 'int', default: 3 })
  maxFiliais: number;

  @ApiProperty()
  @Column({ type: 'date', nullable: true })
  dataExpiracao: Date;

  @ApiProperty()
  @Column({ type: 'jsonb', nullable: true })
  configuracoes: Record<string, any>;

  @OneToMany(() => Empresa, (empresa) => empresa.tenant)
  empresas: Empresa[];

  @ApiProperty()
  @CreateDateColumn()
  criadoEm: Date;

  @ApiProperty()
  @UpdateDateColumn()
  atualizadoEm: Date;
}
