import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RequestWithUser } from '@/shared/types';
import { ProdutosService } from '../services/produtos.service';
import {
  CriarProdutoDto, AtualizarProdutoDto, ProdutoPrecoDto,
  ProdutoComposicaoDto, ProdutoSimilarDto, ProdutoAplicacaoDto,
  ProdutoMidiaDto, FiltroListagemDto,
} from '../dto/cadastros.dto';

@ApiTags('Produtos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('produtos')
export class ProdutosController {
  constructor(private readonly service: ProdutosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar produtos com filtros e paginacao' })
  async listar(@Req() req: RequestWithUser, @Query() filtro: FiltroListagemDto) {
    return this.service.listar(req.user.tenantId, filtro);
  }

  @Get('estatisticas')
  @ApiOperation({ summary: 'Estatisticas de produtos' })
  async estatisticas(@Req() req: RequestWithUser) {
    return this.service.getEstatisticas(req.user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar produto por ID' })
  async buscar(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.service.buscarPorId(req.user.tenantId, id);
  }

  @Get(':id/completo')
  @ApiOperation({ summary: 'Buscar produto com precos, estoque, composicao, similares, aplicacoes e midias' })
  async buscarCompleto(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.service.buscarCompleto(req.user.tenantId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar produto' })
  async criar(@Req() req: RequestWithUser, @Body() dto: CriarProdutoDto) {
    return this.service.criar(req.user.tenantId, dto, req.user.sub);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar produto' })
  async atualizar(@Req() req: RequestWithUser, @Param('id') id: string, @Body() dto: AtualizarProdutoDto) {
    return this.service.atualizar(req.user.tenantId, id, dto, req.user.sub);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Inativar produto' })
  async inativar(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.service.inativar(req.user.tenantId, id, req.user.sub);
  }

  // ======================== Precos ========================
  @Get(':id/precos')
  @ApiOperation({ summary: 'Listar precos do produto' })
  async listarPrecos(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.service.listarPrecos(req.user.tenantId, id);
  }

  @Post(':id/precos')
  @ApiOperation({ summary: 'Criar/Atualizar preco do produto' })
  async atualizarPreco(@Req() req: RequestWithUser, @Param('id') id: string, @Body() dto: ProdutoPrecoDto) {
    return this.service.atualizarPreco(req.user.tenantId, id, dto);
  }

  @Delete(':id/precos/:precoId')
  @ApiOperation({ summary: 'Remover preco do produto' })
  async removerPreco(@Req() req: RequestWithUser, @Param('id') id: string, @Param('precoId') precoId: string) {
    return this.service.removerPreco(req.user.tenantId, id, precoId);
  }

  // ======================== Estoque ========================
  @Get(':id/estoque')
  @ApiOperation({ summary: 'Buscar estoque do produto por filial' })
  async estoque(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.service.buscarEstoque(req.user.tenantId, id);
  }

  // ======================== Composicao ========================
  @Get(':id/composicao')
  @ApiOperation({ summary: 'Listar composicao (kit)' })
  async composicao(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.service.listarComposicao(req.user.tenantId, id);
  }

  @Post(':id/composicao')
  @ApiOperation({ summary: 'Adicionar componente ao kit' })
  async addComponente(@Req() req: RequestWithUser, @Param('id') id: string, @Body() dto: ProdutoComposicaoDto) {
    return this.service.adicionarComponente(req.user.tenantId, id, dto);
  }

  @Delete(':id/composicao/:componenteId')
  @ApiOperation({ summary: 'Remover componente do kit' })
  async removeComponente(@Req() req: RequestWithUser, @Param('id') id: string, @Param('componenteId') cId: string) {
    return this.service.removerComponente(req.user.tenantId, id, cId);
  }

  // ======================== Similares ========================
  @Get(':id/similares')
  @ApiOperation({ summary: 'Listar similares' })
  async similares(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.service.listarSimilares(req.user.tenantId, id);
  }

  @Post(':id/similares')
  @ApiOperation({ summary: 'Adicionar similar' })
  async addSimilar(@Req() req: RequestWithUser, @Param('id') id: string, @Body() dto: ProdutoSimilarDto) {
    return this.service.adicionarSimilar(req.user.tenantId, id, dto);
  }

  @Delete(':id/similares/:similarId')
  @ApiOperation({ summary: 'Remover similar' })
  async removeSimilar(@Req() req: RequestWithUser, @Param('id') id: string, @Param('similarId') sId: string) {
    return this.service.removerSimilar(req.user.tenantId, id, sId);
  }

  // ======================== Aplicacoes ========================
  @Get(':id/aplicacoes')
  @ApiOperation({ summary: 'Listar aplicacoes do produto' })
  async aplicacoes(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.service.listarAplicacoes(req.user.tenantId, id);
  }

  @Post(':id/aplicacoes')
  @ApiOperation({ summary: 'Adicionar aplicacao' })
  async addAplicacao(@Req() req: RequestWithUser, @Param('id') id: string, @Body() dto: ProdutoAplicacaoDto) {
    return this.service.adicionarAplicacao(req.user.tenantId, id, dto);
  }

  @Delete(':id/aplicacoes/:aplicacaoId')
  @ApiOperation({ summary: 'Remover aplicacao' })
  async removeAplicacao(@Req() req: RequestWithUser, @Param('id') id: string, @Param('aplicacaoId') aId: string) {
    return this.service.removerAplicacao(req.user.tenantId, id, aId);
  }

  // ======================== Midia ========================
  @Get(':id/midias')
  @ApiOperation({ summary: 'Listar midias do produto' })
  async midias(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.service.listarMidias(req.user.tenantId, id);
  }

  @Post(':id/midias')
  @ApiOperation({ summary: 'Adicionar midia' })
  async addMidia(@Req() req: RequestWithUser, @Param('id') id: string, @Body() dto: ProdutoMidiaDto) {
    return this.service.adicionarMidia(req.user.tenantId, id, dto);
  }

  @Delete(':id/midias/:midiaId')
  @ApiOperation({ summary: 'Remover midia' })
  async removeMidia(@Req() req: RequestWithUser, @Param('id') id: string, @Param('midiaId') mId: string) {
    return this.service.removerMidia(req.user.tenantId, id, mId);
  }
}
