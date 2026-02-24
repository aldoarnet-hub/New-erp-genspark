import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TenantService } from './tenant.service';
import { Tenant } from './entities/tenant.entity';

@ApiTags('Tenants')
@ApiBearerAuth('JWT-auth')
@Controller('tenants')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os tenants' })
  findAll(): Promise<Tenant[]> {
    return this.tenantService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar tenant por ID' })
  findById(@Param('id', ParseUUIDPipe) id: string): Promise<Tenant> {
    return this.tenantService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar novo tenant' })
  create(@Body() data: Partial<Tenant>): Promise<Tenant> {
    return this.tenantService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar tenant' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: Partial<Tenant>,
  ): Promise<Tenant> {
    return this.tenantService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover tenant' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.tenantService.remove(id);
  }
}
