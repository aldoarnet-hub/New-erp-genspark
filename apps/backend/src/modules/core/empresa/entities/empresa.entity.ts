import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Tenant } from '../../tenant/entities/tenant.entity';
import { Filial } from '../../filial/entities/filial.entity';

export enum EmpresaTipo {
  MATRIZ = 'matriz',
  FILIAL = 'filial',
}

export enum RegimeTributario {
  SIMPLES_NACIONAL = 'simples_nacional',
  LUCRO_PRESUMIDO = 'lucro_presumido',
  LUCRO_REAL = 'lucro_real',
  MEI = 'mei',
}

@Entity('empresas')
export class Empresa {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  tenantId: string;

  @ManyToOne(() => Tenant, (tenant) => tenant.empresas)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @ApiProperty()
  @Column({ length: 200 })
  razaoSocial: string;

  @ApiProperty()
  @Column({ length: 200 })
  nomeFantasia: string;

  @ApiProperty()
  @Column({ length: 20, unique: true })
  cnpj: string;

  @ApiProperty()
  @Column({ length: 20, nullable: true })
  inscricaoEstadual: string;

  @ApiProperty()
  @Column({ length: 20, nullable: true })
  inscricaoMunicipal: string;

  @ApiProperty({ enum: EmpresaTipo })
  @Column({ type: 'enum', enum: EmpresaTipo, default: EmpresaTipo.MATRIZ })
  tipo: EmpresaTipo;

  @ApiProperty({ enum: RegimeTributario })
  @Column({
    type: 'enum',
    enum: RegimeTributario,
    default: RegimeTributario.SIMPLES_NACIONAL,
  })
  regimeTributario: RegimeTributario;

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
  configuracoesFiscais: Record<string, any>;

  @OneToMany(() => Filial, (filial) => filial.empresa)
  filiais: Filial[];

  @ApiProperty()
  @CreateDateColumn()
  criadoEm: Date;

  @ApiProperty()
  @UpdateDateColumn()
  atualizadoEm: Date;
}
