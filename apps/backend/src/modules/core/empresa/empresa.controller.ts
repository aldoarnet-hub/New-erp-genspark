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
import { EmpresaService } from './empresa.service';
import { Empresa } from './entities/empresa.entity';
import { CurrentUser } from '@/shared/decorators';

@ApiTags('Empresas')
@ApiBearerAuth('JWT-auth')
@Controller('empresas')
export class EmpresaController {
  constructor(private readonly empresaService: EmpresaService) {}

  @Get()
  @ApiOperation({ summary: 'Listar empresas do tenant' })
  findAll(@CurrentUser('tenantId') tenantId: string): Promise<Empresa[]> {
    return this.empresaService.findAll(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar empresa por ID' })
  findById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('tenantId') tenantId: string,
  ): Promise<Empresa> {
    return this.empresaService.findById(id, tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Criar empresa' })
  create(
    @Body() data: Partial<Empresa>,
    @CurrentUser('tenantId') tenantId: string,
  ): Promise<Empresa> {
    return this.empresaService.create({ ...data, tenantId });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar empresa' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: Partial<Empresa>,
    @CurrentUser('tenantId') tenantId: string,
  ): Promise<Empresa> {
    return this.empresaService.update(id, tenantId, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover empresa' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('tenantId') tenantId: string,
  ): Promise<void> {
    return this.empresaService.remove(id, tenantId);
  }
}
