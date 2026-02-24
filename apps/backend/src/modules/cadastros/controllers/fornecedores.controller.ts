import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RequestWithUser } from '@/shared/types';
import { FornecedoresService } from '../services/fornecedores.service';
import {
  CriarFornecedorDto, AtualizarFornecedorDto, FornecedorAvaliacaoDto,
  CriarTransportadoraDto, AtualizarTransportadoraDto,
  CriarVendedorDto, AtualizarVendedorDto, VendedorCarteiraDto,
  FiltroListagemDto,
} from '../dto/cadastros.dto';

// ============================================================
// Fornecedores
// ============================================================
@ApiTags('Fornecedores')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('fornecedores')
export class FornecedoresController {
  constructor(private readonly service: FornecedoresService) {}

  @Get()
  @ApiOperation({ summary: 'Listar fornecedores' })
  async listar(@Req() req: RequestWithUser, @Query() filtro: FiltroListagemDto) {
    return this.service.listarFornecedores(req.user.tenantId, filtro);
  }

  @Get('estatisticas')
  @ApiOperation({ summary: 'Estatisticas de fornecedores' })
  async estatisticas(@Req() req: RequestWithUser) {
    return this.service.getEstatisticasFornecedores(req.user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar fornecedor' })
  async buscar(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.service.buscarFornecedor(req.user.tenantId, id);
  }

  @Get(':id/completo')
  @ApiOperation({ summary: 'Buscar fornecedor com avaliacoes' })
  async buscarCompleto(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.service.buscarFornecedorCompleto(req.user.tenantId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar fornecedor' })
  async criar(@Req() req: RequestWithUser, @Body() dto: CriarFornecedorDto) {
    return this.service.criarFornecedor(req.user.tenantId, dto, req.user.sub);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar fornecedor' })
  async atualizar(@Req() req: RequestWithUser, @Param('id') id: string, @Body() dto: AtualizarFornecedorDto) {
    return this.service.atualizarFornecedor(req.user.tenantId, id, dto, req.user.sub);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Inativar fornecedor' })
  async inativar(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.service.inativarFornecedor(req.user.tenantId, id, req.user.sub);
  }

  @Get(':id/avaliacoes')
  @ApiOperation({ summary: 'Listar avaliacoes do fornecedor' })
  async avaliacoes(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.service.listarAvaliacoes(req.user.tenantId, id);
  }

  @Post(':id/avaliacoes')
  @ApiOperation({ summary: 'Criar avaliacao do fornecedor' })
  async avaliar(@Req() req: RequestWithUser, @Param('id') id: string, @Body() dto: FornecedorAvaliacaoDto) {
    return this.service.criarAvaliacao(req.user.tenantId, id, dto, req.user.sub);
  }
}

// ============================================================
// Transportadoras
// ============================================================
@ApiTags('Transportadoras')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('transportadoras')
export class TransportadorasController {
  constructor(private readonly service: FornecedoresService) {}

  @Get()
  @ApiOperation({ summary: 'Listar transportadoras' })
  async listar(@Req() req: RequestWithUser, @Query() filtro: FiltroListagemDto) {
    return this.service.listarTransportadoras(req.user.tenantId, filtro);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar transportadora' })
  async buscar(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.service.buscarTransportadora(req.user.tenantId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar transportadora' })
  async criar(@Req() req: RequestWithUser, @Body() dto: CriarTransportadoraDto) {
    return this.service.criarTransportadora(req.user.tenantId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar transportadora' })
  async atualizar(@Req() req: RequestWithUser, @Param('id') id: string, @Body() dto: AtualizarTransportadoraDto) {
    return this.service.atualizarTransportadora(req.user.tenantId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Inativar transportadora' })
  async inativar(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.service.inativarTransportadora(req.user.tenantId, id);
  }
}

// ============================================================
// Vendedores
// ============================================================
@ApiTags('Vendedores')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('vendedores')
export class VendedoresController {
  constructor(private readonly service: FornecedoresService) {}

  @Get()
  @ApiOperation({ summary: 'Listar vendedores' })
  async listar(@Req() req: RequestWithUser, @Query() filtro: FiltroListagemDto) {
    return this.service.listarVendedores(req.user.tenantId, filtro);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar vendedor' })
  async buscar(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.service.buscarVendedor(req.user.tenantId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar vendedor' })
  async criar(@Req() req: RequestWithUser, @Body() dto: CriarVendedorDto) {
    return this.service.criarVendedor(req.user.tenantId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar vendedor' })
  async atualizar(@Req() req: RequestWithUser, @Param('id') id: string, @Body() dto: AtualizarVendedorDto) {
    return this.service.atualizarVendedor(req.user.tenantId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Inativar vendedor' })
  async inativar(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.service.inativarVendedor(req.user.tenantId, id);
  }

  @Get(':id/carteira')
  @ApiOperation({ summary: 'Listar carteira de clientes do vendedor' })
  async carteira(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.service.listarCarteira(req.user.tenantId, id);
  }

  @Post(':id/carteira')
  @ApiOperation({ summary: 'Adicionar cliente a carteira do vendedor' })
  async addCliente(@Req() req: RequestWithUser, @Param('id') id: string, @Body() dto: VendedorCarteiraDto) {
    return this.service.adicionarClienteCarteira(req.user.tenantId, id, dto);
  }

  @Delete(':id/carteira/:clienteId')
  @ApiOperation({ summary: 'Remover cliente da carteira do vendedor' })
  async removeCliente(@Req() req: RequestWithUser, @Param('id') id: string, @Param('clienteId') cId: string) {
    return this.service.removerClienteCarteira(req.user.tenantId, id, cId);
  }
}
