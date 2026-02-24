import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from './tenant/entities/tenant.entity';
import { TenantService } from './tenant/tenant.service';
import { TenantController } from './tenant/tenant.controller';
import { Empresa } from './empresa/entities/empresa.entity';
import { EmpresaService } from './empresa/empresa.service';
import { EmpresaController } from './empresa/empresa.controller';
import { Filial } from './filial/entities/filial.entity';
import { FilialService } from './filial/filial.service';
import { FilialController } from './filial/filial.controller';
import { Usuario } from './usuario/entities/usuario.entity';
import { UsuarioService } from './usuario/usuario.service';
import { UsuarioController } from './usuario/usuario.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tenant, Empresa, Filial, Usuario]),
  ],
  controllers: [
    TenantController,
    EmpresaController,
    FilialController,
    UsuarioController,
  ],
  providers: [
    TenantService,
    EmpresaService,
    FilialService,
    UsuarioService,
  ],
  exports: [
    TenantService,
    EmpresaService,
    FilialService,
    UsuarioService,
  ],
})
export class CoreModule {}
