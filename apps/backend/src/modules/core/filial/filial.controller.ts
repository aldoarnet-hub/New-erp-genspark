import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FilialService } from './filial.service';
import { Filial } from './entities/filial.entity';
import { CurrentUser } from '@/shared/decorators';

@ApiTags('Filiais')
@ApiBearerAuth('JWT-auth')
@Controller('filiais')
export class FilialController {
  constructor(private readonly filialService: FilialService) {}

  @Get()
  @ApiOperation({ summary: 'Listar filiais do tenant' })
  findAll(
    @CurrentUser('tenantId') tenantId: string,
    @Query('empresaId') empresaId?: string,
  ): Promise<Filial[]> {
    return this.filialService.findAll(tenantId, empresaId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar filial por ID' })
  findById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('tenantId') tenantId: string,
  ): Promise<Filial> {
    return this.filialService.findById(id, tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Criar filial' })
  create(
    @Body() data: Partial<Filial>,
    @CurrentUser('tenantId') tenantId: string,
  ): Promise<Filial> {
    return this.filialService.create({ ...data, tenantId });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar filial' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: Partial<Filial>,
    @CurrentUser('tenantId') tenantId: string,
  ): Promise<Filial> {
    return this.filialService.update(id, tenantId, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover filial' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('tenantId') tenantId: string,
  ): Promise<void> {
    return this.filialService.remove(id, tenantId);
  }
}
