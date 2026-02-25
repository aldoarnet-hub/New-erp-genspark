import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PlanoContasService } from '../services/plano-contas.service';
import { MapeamentoContabilService } from '../services/mapeamento-contabil.service';
import { LancamentoContabilService } from '../services/lancamento-contabil.service';
import {
  CreateContaDto,
  UpdateContaDto,
  CreateLancamentoDto,
  LancamentoAutomaticoDto,
  EstornarLancamentoDto,
  FiltroLancamentoDto,
  UpdateMapeamentoDto,
  CreateContaBancariaDto,
  FiltroBalanceteDto,
  FiltroDreDto,
} from '../dto/contabil.dto';

interface RequestWithUser extends Request {
  user: { tenantId: string; sub: string; nome: string };
}

@ApiTags('Contabilidade')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('contabil')
export class ContabilController {
  constructor(
    private readonly planoContasService: PlanoContasService,
    private readonly mapeamentoService: MapeamentoContabilService,
    private readonly lancamentoService: LancamentoContabilService,
  ) {}

  // ============================================================
  // PLANO DE CONTAS
  // ============================================================

  @Post('plano-contas/inicializar')
  @ApiOperation({ summary: 'Inicializar plano de contas padrao (material construcao)' })
  async inicializarPlanoContas(@Req() req: RequestWithUser) {
    return this.planoContasService.inicializarPlanoContas(req.user.tenantId);
  }

  @Get('plano-contas')
  @ApiOperation({ summary: 'Listar plano de contas' })
  async listarContas(
    @Req() req: RequestWithUser,
    @Query('tipoConta') tipoConta?: string,
    @Query('classe') classe?: string,
    @Query('nivel') nivel?: string,
    @Query('ativo') ativo?: string,
  ) {
    return this.planoContasService.listarContas(req.user.tenantId, {
      tipoConta,
      classe,
      nivel: nivel ? parseInt(nivel) : undefined,
      ativo: ativo !== undefined ? ativo === 'true' : undefined,
    });
  }

  @Get('plano-contas/arvore')
  @ApiOperation({ summary: 'Obter plano de contas em formato arvore' })
  async arvoreContas(@Req() req: RequestWithUser) {
    return this.planoContasService.obterArvoreContas(req.user.tenantId);
  }

  @Get('plano-contas/estatisticas')
  @ApiOperation({ summary: 'Estatisticas do plano de contas' })
  async estatisticasContas(@Req() req: RequestWithUser) {
    return this.planoContasService.contarContas(req.user.tenantId);
  }

  @Get('plano-contas/:codigo')
  @ApiOperation({ summary: 'Buscar conta por codigo' })
  async buscarConta(@Req() req: RequestWithUser, @Param('codigo') codigo: string) {
    return this.planoContasService.buscarContaPorCodigo(req.user.tenantId, codigo);
  }

  @Post('plano-contas')
  @ApiOperation({ summary: 'Criar nova conta contabil' })
  async criarConta(@Req() req: RequestWithUser, @Body() dto: CreateContaDto) {
    return this.planoContasService.criarConta(req.user.tenantId, dto);
  }

  @Put('plano-contas/:codigo')
  @ApiOperation({ summary: 'Atualizar conta contabil' })
  async atualizarConta(
    @Req() req: RequestWithUser,
    @Param('codigo') codigo: string,
    @Body() dto: UpdateContaDto,
  ) {
    return this.planoContasService.atualizarConta(req.user.tenantId, codigo, dto);
  }

  // ============================================================
  // MAPEAMENTO OPERACAO → CONTAS
  // ============================================================

  @Post('mapeamentos/inicializar')
  @ApiOperation({ summary: 'Inicializar mapeamentos padrao (todas operacoes → contas)' })
  async inicializarMapeamentos(@Req() req: RequestWithUser) {
    return this.mapeamentoService.inicializarMapeamentos(req.user.tenantId);
  }

  @Get('mapeamentos')
  @ApiOperation({ summary: 'Listar todos os mapeamentos operacao → contas' })
  async listarMapeamentos(
    @Req() req: RequestWithUser,
    @Query('grupo') grupo?: string,
    @Query('ativo') ativo?: string,
  ) {
    return this.mapeamentoService.listarMapeamentos(req.user.tenantId, {
      grupo,
      ativo: ativo !== undefined ? ativo === 'true' : undefined,
    });
  }

  @Get('mapeamentos/por-grupo')
  @ApiOperation({ summary: 'Mapeamentos agrupados (VENDAS, FINANCEIRO, COMPRAS, FOLHA)' })
  async mapeamentosPorGrupo(@Req() req: RequestWithUser) {
    return this.mapeamentoService.obterMapeamentosPorGrupo(req.user.tenantId);
  }

  @Get('mapeamentos/operacoes-disponiveis')
  @ApiOperation({ summary: 'Listar todas as operacoes disponiveis para mapeamento' })
  async operacoesDisponiveis() {
    return this.mapeamentoService.getOperacoesDisponiveis();
  }

  @Get('mapeamentos/:tipoOperacao')
  @ApiOperation({ summary: 'Buscar mapeamento por tipo de operacao' })
  async buscarMapeamento(
    @Req() req: RequestWithUser,
    @Param('tipoOperacao') tipoOperacao: string,
  ) {
    return this.mapeamentoService.buscarMapeamento(req.user.tenantId, tipoOperacao);
  }

  @Put('mapeamentos/:tipoOperacao')
  @ApiOperation({ summary: 'Alterar mapeamento de operacao (customizar contas)' })
  async atualizarMapeamento(
    @Req() req: RequestWithUser,
    @Param('tipoOperacao') tipoOperacao: string,
    @Body() dto: UpdateMapeamentoDto,
  ) {
    return this.mapeamentoService.atualizarMapeamento(req.user.tenantId, tipoOperacao, dto);
  }

  // ============================================================
  // LANCAMENTOS CONTABEIS
  // ============================================================

  @Post('lancamentos/automatico')
  @ApiOperation({ summary: 'Gerar lancamento automatico (via mapeamento operacao)' })
  async lancamentoAutomatico(
    @Req() req: RequestWithUser,
    @Body() dto: LancamentoAutomaticoDto,
  ) {
    return this.lancamentoService.lancarAutomatico(req.user.tenantId, dto);
  }

  @Post('lancamentos/manual')
  @ApiOperation({ summary: 'Criar lancamento manual' })
  async lancamentoManual(
    @Req() req: RequestWithUser,
    @Body() dto: CreateLancamentoDto,
  ) {
    return this.lancamentoService.lancarManual(req.user.tenantId, dto, req.user.sub);
  }

  @Post('lancamentos/:id/estornar')
  @ApiOperation({ summary: 'Estornar lancamento contabil' })
  async estornarLancamento(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: EstornarLancamentoDto,
  ) {
    return this.lancamentoService.estornarLancamento(req.user.tenantId, id, dto);
  }

  @Get('lancamentos')
  @ApiOperation({ summary: 'Listar lancamentos contabeis com filtros' })
  async listarLancamentos(
    @Req() req: RequestWithUser,
    @Query() filtros: FiltroLancamentoDto,
  ) {
    return this.lancamentoService.listarLancamentos(req.user.tenantId, filtros);
  }

  @Get('lancamentos/estatisticas')
  @ApiOperation({ summary: 'Estatisticas dos lancamentos' })
  async estatisticasLancamentos(@Req() req: RequestWithUser) {
    return this.lancamentoService.obterEstatisticas(req.user.tenantId);
  }

  @Get('lancamentos/:id')
  @ApiOperation({ summary: 'Buscar lancamento por ID' })
  async buscarLancamento(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.lancamentoService.buscarLancamento(req.user.tenantId, id);
  }

  @Get('extrato/:contaCodigo')
  @ApiOperation({ summary: 'Extrato de uma conta contabil' })
  async extratoConta(
    @Req() req: RequestWithUser,
    @Param('contaCodigo') contaCodigo: string,
    @Query('dataInicio') dataInicio: string,
    @Query('dataFim') dataFim: string,
  ) {
    return this.lancamentoService.extratoConta(req.user.tenantId, contaCodigo, dataInicio, dataFim);
  }

  // ============================================================
  // RELATORIOS
  // ============================================================

  @Get('balancete')
  @ApiOperation({ summary: 'Gerar balancete mensal' })
  async balancete(
    @Req() req: RequestWithUser,
    @Query('ano') ano: string,
    @Query('mes') mes: string,
    @Query('tipoConta') tipoConta?: string,
  ) {
    return this.lancamentoService.gerarBalancete(req.user.tenantId, {
      ano: parseInt(ano),
      mes: parseInt(mes),
      tipoConta,
    });
  }

  @Get('dre')
  @ApiOperation({ summary: 'Gerar DRE (Demonstracao do Resultado do Exercicio)' })
  async dre(
    @Req() req: RequestWithUser,
    @Query('ano') ano: string,
    @Query('mesInicio') mesInicio: string,
    @Query('mesFim') mesFim: string,
  ) {
    return this.lancamentoService.gerarDre(req.user.tenantId, {
      ano: parseInt(ano),
      mesInicio: parseInt(mesInicio),
      mesFim: parseInt(mesFim),
    });
  }
}
