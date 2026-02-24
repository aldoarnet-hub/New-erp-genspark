import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RequestWithUser } from '@/shared/types';
import { AuxiliaresService } from '../services/auxiliares.service';
import { AuditoriaService } from '../services/auditoria.service';
import {
  CriarCategoriaDto, CriarMarcaDto, CriarFabricanteDto, CriarUnidadeDto,
  CriarTabelaPrecoDto, CriarFormaPagamentoDto, CriarCondicaoPagamentoDto,
  CriarBancoDto, CriarContaBancariaDto, CriarCentroCustoDto, CriarPlanoContaDto,
} from '../dto/cadastros.dto';

@ApiTags('Cadastros Auxiliares')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cadastros')
export class AuxiliaresController {
  constructor(
    private readonly service: AuxiliaresService,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  // ======================== Unidades de Medida ========================
  @Get('unidades')
  @ApiOperation({ summary: 'Listar unidades de medida' })
  async unidades(@Req() req: RequestWithUser) { return this.service.listarUnidades(req.user.tenantId); }

  @Post('unidades')
  @ApiOperation({ summary: 'Criar unidade de medida' })
  async criarUnidade(@Req() req: RequestWithUser, @Body() dto: CriarUnidadeDto) {
    return this.service.criarUnidade(req.user.tenantId, dto);
  }

  @Put('unidades/:id')
  @ApiOperation({ summary: 'Atualizar unidade de medida' })
  async atualizarUnidade(@Req() req: RequestWithUser, @Param('id') id: string, @Body() dto: CriarUnidadeDto) {
    return this.service.atualizarUnidade(req.user.tenantId, id, dto);
  }

  // ======================== Categorias ========================
  @Get('categorias')
  @ApiOperation({ summary: 'Listar categorias' })
  async categorias(@Req() req: RequestWithUser) { return this.service.listarCategorias(req.user.tenantId); }

  @Post('categorias')
  @ApiOperation({ summary: 'Criar categoria' })
  async criarCategoria(@Req() req: RequestWithUser, @Body() dto: CriarCategoriaDto) {
    return this.service.criarCategoria(req.user.tenantId, dto);
  }

  @Put('categorias/:id')
  @ApiOperation({ summary: 'Atualizar categoria' })
  async atualizarCategoria(@Req() req: RequestWithUser, @Param('id') id: string, @Body() dto: CriarCategoriaDto) {
    return this.service.atualizarCategoria(req.user.tenantId, id, dto);
  }

  // ======================== Marcas ========================
  @Get('marcas')
  @ApiOperation({ summary: 'Listar marcas' })
  async marcas(@Req() req: RequestWithUser) { return this.service.listarMarcas(req.user.tenantId); }

  @Post('marcas')
  @ApiOperation({ summary: 'Criar marca' })
  async criarMarca(@Req() req: RequestWithUser, @Body() dto: CriarMarcaDto) {
    return this.service.criarMarca(req.user.tenantId, dto);
  }

  @Put('marcas/:id')
  @ApiOperation({ summary: 'Atualizar marca' })
  async atualizarMarca(@Req() req: RequestWithUser, @Param('id') id: string, @Body() dto: CriarMarcaDto) {
    return this.service.atualizarMarca(req.user.tenantId, id, dto);
  }

  // ======================== Fabricantes ========================
  @Get('fabricantes')
  @ApiOperation({ summary: 'Listar fabricantes' })
  async fabricantes(@Req() req: RequestWithUser) { return this.service.listarFabricantes(req.user.tenantId); }

  @Post('fabricantes')
  @ApiOperation({ summary: 'Criar fabricante' })
  async criarFabricante(@Req() req: RequestWithUser, @Body() dto: CriarFabricanteDto) {
    return this.service.criarFabricante(req.user.tenantId, dto);
  }

  // ======================== Tabelas de Preco ========================
  @Get('tabelas-preco')
  @ApiOperation({ summary: 'Listar tabelas de preco' })
  async tabelasPreco(@Req() req: RequestWithUser) { return this.service.listarTabelasPreco(req.user.tenantId); }

  @Post('tabelas-preco')
  @ApiOperation({ summary: 'Criar tabela de preco' })
  async criarTabelaPreco(@Req() req: RequestWithUser, @Body() dto: CriarTabelaPrecoDto) {
    return this.service.criarTabelaPreco(req.user.tenantId, dto);
  }

  @Put('tabelas-preco/:id')
  @ApiOperation({ summary: 'Atualizar tabela de preco' })
  async atualizarTabelaPreco(@Req() req: RequestWithUser, @Param('id') id: string, @Body() dto: CriarTabelaPrecoDto) {
    return this.service.atualizarTabelaPreco(req.user.tenantId, id, dto);
  }

  // ======================== Formas de Pagamento ========================
  @Get('formas-pagamento')
  @ApiOperation({ summary: 'Listar formas de pagamento' })
  async formasPgto(@Req() req: RequestWithUser) { return this.service.listarFormasPagamento(req.user.tenantId); }

  @Post('formas-pagamento')
  @ApiOperation({ summary: 'Criar forma de pagamento' })
  async criarFormaPgto(@Req() req: RequestWithUser, @Body() dto: CriarFormaPagamentoDto) {
    return this.service.criarFormaPagamento(req.user.tenantId, dto);
  }

  // ======================== Condicoes de Pagamento ========================
  @Get('condicoes-pagamento')
  @ApiOperation({ summary: 'Listar condicoes de pagamento' })
  async condicoesPgto(@Req() req: RequestWithUser) { return this.service.listarCondicoesPagamento(req.user.tenantId); }

  @Post('condicoes-pagamento')
  @ApiOperation({ summary: 'Criar condicao de pagamento' })
  async criarCondPgto(@Req() req: RequestWithUser, @Body() dto: CriarCondicaoPagamentoDto) {
    return this.service.criarCondicaoPagamento(req.user.tenantId, dto);
  }

  // ======================== Bancos ========================
  @Get('bancos')
  @ApiOperation({ summary: 'Listar bancos' })
  async bancos(@Req() req: RequestWithUser) { return this.service.listarBancos(req.user.tenantId); }

  @Post('bancos')
  @ApiOperation({ summary: 'Criar banco' })
  async criarBanco(@Req() req: RequestWithUser, @Body() dto: CriarBancoDto) {
    return this.service.criarBanco(req.user.tenantId, dto);
  }

  // ======================== Contas Bancarias ========================
  @Get('contas-bancarias')
  @ApiOperation({ summary: 'Listar contas bancarias' })
  async contasBancarias(@Req() req: RequestWithUser) { return this.service.listarContasBancarias(req.user.tenantId); }

  @Post('contas-bancarias')
  @ApiOperation({ summary: 'Criar conta bancaria' })
  async criarConta(@Req() req: RequestWithUser, @Body() dto: CriarContaBancariaDto) {
    return this.service.criarContaBancaria(req.user.tenantId, dto);
  }

  @Put('contas-bancarias/:id')
  @ApiOperation({ summary: 'Atualizar conta bancaria' })
  async atualizarConta(@Req() req: RequestWithUser, @Param('id') id: string, @Body() dto: CriarContaBancariaDto) {
    return this.service.atualizarContaBancaria(req.user.tenantId, id, dto);
  }

  // ======================== Centros de Custo ========================
  @Get('centros-custo')
  @ApiOperation({ summary: 'Listar centros de custo' })
  async centrosCusto(@Req() req: RequestWithUser) { return this.service.listarCentrosCusto(req.user.tenantId); }

  @Post('centros-custo')
  @ApiOperation({ summary: 'Criar centro de custo' })
  async criarCC(@Req() req: RequestWithUser, @Body() dto: CriarCentroCustoDto) {
    return this.service.criarCentroCusto(req.user.tenantId, dto);
  }

  // ======================== Plano de Contas ========================
  @Get('plano-contas')
  @ApiOperation({ summary: 'Listar plano de contas' })
  async planoContas(@Req() req: RequestWithUser) { return this.service.listarPlanoContas(req.user.tenantId); }

  @Post('plano-contas')
  @ApiOperation({ summary: 'Criar conta no plano de contas' })
  async criarPC(@Req() req: RequestWithUser, @Body() dto: CriarPlanoContaDto) {
    return this.service.criarPlanoConta(req.user.tenantId, dto);
  }

  // ======================== CEP ========================
  @Get('cep/:cep')
  @ApiOperation({ summary: 'Consultar CEP (ViaCEP)' })
  async consultarCEP(@Param('cep') cep: string) {
    return this.service.consultarCEP(cep);
  }

  // ======================== Estatisticas ========================
  @Get('estatisticas')
  @ApiOperation({ summary: 'Estatisticas gerais dos cadastros auxiliares' })
  async estatisticas(@Req() req: RequestWithUser) {
    return this.service.getEstatisticasGerais(req.user.tenantId);
  }

  // ======================== Auditoria ========================
  @Get('auditoria')
  @ApiOperation({ summary: 'Listar registros de auditoria recentes' })
  async auditoriaRecente(@Req() req: RequestWithUser) {
    return this.auditoriaService.listarRecentes(req.user.tenantId);
  }

  @Get('auditoria/estatisticas')
  @ApiOperation({ summary: 'Estatisticas de auditoria' })
  async auditoriaEstatisticas(@Req() req: RequestWithUser) {
    return this.auditoriaService.getEstatisticas(req.user.tenantId);
  }

  @Get('auditoria/:tabela/:registroId')
  @ApiOperation({ summary: 'Historico de auditoria de um registro' })
  async auditoriaPorRegistro(@Req() req: RequestWithUser, @Param('tabela') tabela: string, @Param('registroId') registroId: string) {
    return this.auditoriaService.listarPorRegistro(req.user.tenantId, tabela, registroId);
  }
}
