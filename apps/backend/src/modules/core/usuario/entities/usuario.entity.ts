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
import { Exclude } from 'class-transformer';
import { Empresa } from '../../empresa/entities/empresa.entity';
import { Filial } from '../../filial/entities/filial.entity';

@Entity('usuarios')
export class Usuario {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  tenantId: string;

  @ApiProperty()
  @Column()
  empresaId: string;

  @ManyToOne(() => Empresa)
  @JoinColumn({ name: 'empresaId' })
  empresa: Empresa;

  @ApiProperty()
  @Column({ nullable: true })
  filialId: string;

  @ManyToOne(() => Filial)
  @JoinColumn({ name: 'filialId' })
  filial: Filial;

  @ApiProperty()
  @Column({ length: 150 })
  nome: string;

  @ApiProperty()
  @Column({ length: 150, unique: true })
  email: string;

  @Exclude()
  @Column()
  senha: string;

  @ApiProperty()
  @Column({ length: 50 })
  perfil: string;

  @ApiProperty()
  @Column('simple-array')
  roles: string[];

  @ApiProperty()
  @Column('simple-json', { nullable: true })
  permissoes: string[];

  @ApiProperty()
  @Column({ length: 20, nullable: true })
  telefone: string;

  @ApiProperty()
  @Column({ nullable: true })
  avatar: string;

  @ApiProperty()
  @Column({ default: true })
  ativo: boolean;

  @ApiProperty()
  @Column({ default: false })
  emailVerificado: boolean;

  @ApiProperty()
  @Column({ type: 'timestamp', nullable: true })
  ultimoLogin: Date;

  @ApiProperty()
  @Column({ type: 'int', default: 0 })
  tentativasLogin: number;

  @ApiProperty()
  @Column({ type: 'timestamp', nullable: true })
  bloqueadoAte: Date;

  @ApiProperty()
  @CreateDateColumn()
  criadoEm: Date;

  @ApiProperty()
  @UpdateDateColumn()
  atualizadoEm: Date;
}
