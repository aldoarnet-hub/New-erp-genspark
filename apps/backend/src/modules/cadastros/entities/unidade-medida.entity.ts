import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('unidades_medida')
@Index(['tenantId', 'codigo'], { unique: true })
export class UnidadeMedida {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column({ length: 6 })
  codigo: string;

  @Column({ length: 50 })
  descricao: string;

  @Column({ length: 3, nullable: true })
  sigla: string;

  @Column({ default: true })
  ativo: boolean;
}
