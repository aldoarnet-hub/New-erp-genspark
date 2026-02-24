import { DataSource } from 'typeorm';
import { Tenant } from '../modules/core/tenant/entities/tenant.entity';
import { Empresa } from '../modules/core/empresa/entities/empresa.entity';
import { Filial } from '../modules/core/filial/entities/filial.entity';
import { Usuario } from '../modules/core/usuario/entities/usuario.entity';

export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'erp_dev',
  entities: [Tenant, Empresa, Filial, Usuario],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  logging: true,
});
