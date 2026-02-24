import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  UseGuards, HttpCode, HttpStatus, Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RequestWithUser } from '@/shared/types';
import { MotorTributarioService, ItemOperacao, ContextoTributario } from '../services/motor-tributario.service';
import { CalculoSimplesNacionalService } from '../services/calculo-simples-nacional.service';
import { ValidadorTributarioService } from '../services/validador-tributario.service';
import { TabelasTributariasService } from '../services/tabelas-tributarias.service';
import {
  CalcularImpostoDto, CalcularDASDto, CompararRegimesDto,
  CriarRegraMatrizDto, EmpresaFiscalDto, FiltroTabelaDto,
} from '../dto/fiscal.dto';

@ApiTags('Fiscal')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('fiscal')
export class FiscalController {
  constructor(
    private readonly motorTributario: MotorTributarioService,
    private readonly calculoSN: CalculoSimplesNacionalService,
    private readonly validador: ValidadorTributarioService,
    private readonly tabelas: TabelasTributariasService,
  ) {}

  // ============================================================
  // Motor Tributário / Cálculo de Impostos
  // ============================================================

  @Post('calcular-impostos')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Calcular impostos para um item de operação' })
  @ApiResponse({ status: 200, description: 'Resultado do cálculo tributário' })
  async calcularImpostos(@Req() req: RequestWithUser, @Body() dto: CalcularImpostoDto) {
    // Montar item e contexto a partir do DTO
    const item: ItemOperacao = {
      produtoId: dto.produtoId,
      ncm: dto.ncm,
      cest: dto.cest,
      cfop: dto.cfop,
      quantidade: dto.quantidade,
      valorUnitario: dto.valorUnitario,
      valorTotal: dto.valorTotal,
    };

    const contexto: ContextoTributario = {
      tenantId: (req as any).user.tenantId,
      empresaId: (req as any).user.empresaId,
      regimeEmpresa: dto.regimeEmpresa,
      ufOrigem: dto.ufOrigem,
      ufDestino: dto.ufDestino,
      tipoOperacao: dto.tipoOperacao,
      finalidadeEmissao: dto.finalidadeEmissao || '1',
      indicadorPresenca: '1',
      consumidorFinal: dto.consumidorFinal ?? false,
      contribuinteIcms: dto.contribuinteIcms ?? true,
      pisCofinsCumulativo: dto.pisCofinsCumulativo,
    };

    const resultado = await this.motorTributario.calcularTributacao(item, contexto);

    // Validar resultado
    const alertas = this.validador.validarOperacao(resultado, contexto);

    return { resultado, alertas };
  }

  // ============================================================
  // Simples Nacional
  // ============================================================

  @Post('simples-nacional/calcular-das')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Calcular DAS do Simples Nacional' })
  async calcularDAS(@Body() dto: CalcularDASDto) {
    return this.calculoSN.calcularDAS(
      dto.receitaBruta12Meses,
      dto.receitaMes,
      dto.anexo,
      dto.fatorR,
    );
  }

  @Post('simples-nacional/comparar-regimes')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Comparar regimes tributários (Simples x Presumido x Real)' })
  async compararRegimes(@Body() dto: CompararRegimesDto) {
    return this.calculoSN.compararRegimes(dto.faturamentoAnual, dto.uf);
  }

  // ============================================================
  // Tabelas Tributárias - NCM
  // ============================================================

  @Get('tabelas/ncm')
  @ApiOperation({ summary: 'Listar NCMs' })
  async listarNCM(@Query() filtro: FiltroTabelaDto) {
    return this.tabelas.listarNCM(filtro);
  }

  @Get('tabelas/ncm/:codigo')
  @ApiOperation({ summary: 'Buscar NCM por código' })
  async buscarNCM(@Param('codigo') codigo: string) {
    return this.tabelas.buscarNCMPorCodigo(codigo);
  }

  // ============================================================
  // Tabelas Tributárias - CEST
  // ============================================================

  @Get('tabelas/cest')
  @ApiOperation({ summary: 'Listar CESTs' })
  async listarCEST(@Query() filtro: FiltroTabelaDto) {
    return this.tabelas.listarCEST(filtro);
  }

  // ============================================================
  // Tabelas Tributárias - CFOP
  // ============================================================

  @Get('tabelas/cfop')
  @ApiOperation({ summary: 'Listar CFOPs' })
  async listarCFOP(@Query() filtro: FiltroTabelaDto) {
    return this.tabelas.listarCFOP(filtro);
  }

  @Get('tabelas/cfop/:codigo')
  @ApiOperation({ summary: 'Buscar CFOP por código' })
  async buscarCFOP(@Param('codigo') codigo: string) {
    return this.tabelas.buscarCFOPPorCodigo(codigo);
  }

  // ============================================================
  // Tabelas Tributárias - CST
  // ============================================================

  @Get('tabelas/cst-icms')
  @ApiOperation({ summary: 'Listar CSTs de ICMS' })
  async listarCSTICMS() {
    return this.tabelas.listarCSTICMS();
  }

  @Get('tabelas/cst-ipi')
  @ApiOperation({ summary: 'Listar CSTs de IPI' })
  async listarCSTIPI() {
    return this.tabelas.listarCSTIPI();
  }

  @Get('tabelas/cst-pis-cofins')
  @ApiOperation({ summary: 'Listar CSTs de PIS/COFINS' })
  async listarCSTPISCOFINS(@Query('tipoOperacao') tipoOperacao?: string) {
    return this.tabelas.listarCSTPISCOFINS(tipoOperacao);
  }

  // ============================================================
  // Tabelas Tributárias - ICMS
  // ============================================================

  @Get('tabelas/icms-aliquotas')
  @ApiOperation({ summary: 'Listar alíquotas ICMS por UF' })
  async listarAliquotasICMS(
    @Query('ufOrigem') ufOrigem?: string,
    @Query('ufDestino') ufDestino?: string,
  ) {
    return this.tabelas.listarAliquotasICMS(ufOrigem, ufDestino);
  }

  @Get('tabelas/icms-st-mva')
  @ApiOperation({ summary: 'Listar MVAs de ICMS-ST' })
  async listarMVA(
    @Query('ncm') ncm?: string,
    @Query('cest') cest?: string,
    @Query('ufOrigem') ufOrigem?: string,
    @Query('ufDestino') ufDestino?: string,
  ) {
    return this.tabelas.listarMVA({ ncm, cest, ufOrigem, ufDestino });
  }

  // ============================================================
  // Matriz Tributária
  // ============================================================

  @Get('matriz')
  @ApiOperation({ summary: 'Listar regras da matriz tributária' })
  async listarMatriz(@Req() req: RequestWithUser, @Query() filtro: FiltroTabelaDto) {
    const tenantId = (req as any).user.tenantId;
    return this.tabelas.listarMatrizTributaria(tenantId, filtro);
  }

  @Post('matriz')
  @ApiOperation({ summary: 'Criar regra na matriz tributária' })
  async criarRegraMatriz(@Req() req: RequestWithUser, @Body() dto: CriarRegraMatrizDto) {
    const tenantId = (req as any).user.tenantId;
    return this.tabelas.criarRegraMatriz(tenantId, dto);
  }

  @Put('matriz/:id')
  @ApiOperation({ summary: 'Atualizar regra da matriz tributária' })
  async atualizarRegraMatriz(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: CriarRegraMatrizDto,
  ) {
    const tenantId = (req as any).user.tenantId;
    return this.tabelas.atualizarRegraMatriz(id, tenantId, dto);
  }

  @Delete('matriz/:id')
  @ApiOperation({ summary: 'Desativar regra da matriz tributária' })
  async excluirRegraMatriz(@Req() req: RequestWithUser, @Param('id') id: string) {
    const tenantId = (req as any).user.tenantId;
    return this.tabelas.excluirRegraMatriz(id, tenantId);
  }

  // ============================================================
  // Empresa Fiscal
  // ============================================================

  @Get('empresa-fiscal/:empresaId')
  @ApiOperation({ summary: 'Buscar configuração fiscal da empresa' })
  async buscarEmpresaFiscal(@Req() req: RequestWithUser, @Param('empresaId') empresaId: string) {
    const tenantId = (req as any).user.tenantId;
    return this.tabelas.buscarEmpresaFiscal(tenantId, empresaId);
  }

  @Post('empresa-fiscal')
  @ApiOperation({ summary: 'Criar ou atualizar configuração fiscal da empresa' })
  async configurarEmpresaFiscal(@Req() req: RequestWithUser, @Body() dto: EmpresaFiscalDto) {
    const tenantId = (req as any).user.tenantId;
    return this.tabelas.criarOuAtualizarEmpresaFiscal(tenantId, dto);
  }

  // ============================================================
  // Estatísticas
  // ============================================================

  @Get('estatisticas')
  @ApiOperation({ summary: 'Obter estatísticas do módulo fiscal' })
  async getEstatisticas(@Req() req: RequestWithUser) {
    const tenantId = (req as any).user.tenantId;
    return this.tabelas.getEstatisticasFiscais(tenantId);
  }
}
