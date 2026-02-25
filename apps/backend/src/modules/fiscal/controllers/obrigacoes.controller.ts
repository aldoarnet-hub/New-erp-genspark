import {
  Controller, Get, Post, Put, Body, Param, Query,
  UseGuards, HttpCode, HttpStatus, Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RequestWithUser } from '@/shared/types';
import { ObrigacaoFiscalService } from '../services/obrigacoes-auditoria.service';
import { GuiaPagamentoService } from '../services/guia-pagamento.service';

@ApiTags('Obrigacoes Fiscais')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('fiscal/obrigacoes')
export class ObrigacoesController {
  constructor(
    private readonly obrigacoesService: ObrigacaoFiscalService,
    private readonly guiaService: GuiaPagamentoService,
  ) {}

  // ============================================================
  // Obrigacoes Fiscais
  // ============================================================

  @Post('gerar-mes')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Gerar obrigacoes do mes a partir do calendario fiscal' })
  @ApiResponse({ status: 201, description: 'Obrigacoes geradas' })
  async gerarObrigacoesMes(
    @Req() req: RequestWithUser,
    @Body() body: { empresaId: string; ano: number; mes: number },
  ) {
    const tenantId = (req as any).user.tenantId;
    return this.obrigacoesService.gerarObrigacoesMes(tenantId, body.empresaId, body.ano, body.mes);
  }

  @Get()
  @ApiOperation({ summary: 'Listar obrigacoes fiscais com filtros' })
  async listarObrigacoes(
    @Req() req: RequestWithUser,
    @Query('empresaId') empresaId?: string,
    @Query('status') status?: string,
    @Query('imposto') imposto?: string,
    @Query('competenciaAno') competenciaAno?: number,
    @Query('competenciaMes') competenciaMes?: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const tenantId = (req as any).user.tenantId;
    return this.obrigacoesService.listar(tenantId, {
      empresaId, status, imposto, competenciaAno, competenciaMes, page, limit,
    });
  }

  @Put(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Atualizar status de uma obrigacao fiscal' })
  async atualizarStatus(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() body: { status: string; valorPago?: number; dataPagamento?: Date },
  ) {
    const tenantId = (req as any).user.tenantId;
    return this.obrigacoesService.atualizarStatus(id, tenantId, body.status, {
      valorPago: body.valorPago,
      dataPagamento: body.dataPagamento,
    });
  }

  @Get('vencidas')
  @ApiOperation({ summary: 'Buscar obrigacoes vencidas (nao pagas)' })
  async buscarVencidas(@Req() req: RequestWithUser) {
    const tenantId = (req as any).user.tenantId;
    return this.obrigacoesService.buscarVencidas(tenantId);
  }

  @Get('proximas-vencer')
  @ApiOperation({ summary: 'Buscar proximas obrigacoes a vencer' })
  async proximasVencer(
    @Req() req: RequestWithUser,
    @Query('dias') dias?: number,
  ) {
    const tenantId = (req as any).user.tenantId;
    return this.obrigacoesService.buscarProximasVencer(tenantId, dias || 30);
  }

  // ============================================================
  // Guias de Pagamento
  // ============================================================

  @Post('guias/das')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Gerar guia DAS (Simples Nacional)' })
  async gerarDAS(
    @Req() req: RequestWithUser,
    @Body() body: {
      empresaId: string; periodoApuracao: string; valorTotal: number;
      reparticao?: Record<string, number>;
    },
  ) {
    const tenantId = (req as any).user.tenantId;
    return this.guiaService.gerarDAS({
      tenantId, empresaId: body.empresaId,
      periodoApuracao: body.periodoApuracao,
      valorTotal: body.valorTotal,
      reparticao: body.reparticao,
    });
  }

  @Post('guias/darf')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Gerar guia DARF (Tributos Federais)' })
  async gerarDARF(
    @Req() req: RequestWithUser,
    @Body() body: {
      empresaId: string; codigoReceita: string; periodoApuracao: string;
      valorPrincipal: number; valorMulta?: number; valorJuros?: number;
    },
  ) {
    const tenantId = (req as any).user.tenantId;
    return this.guiaService.gerarDARF({
      tenantId, empresaId: body.empresaId,
      codigoReceita: body.codigoReceita,
      periodoApuracao: body.periodoApuracao,
      valorPrincipal: body.valorPrincipal,
      valorMulta: body.valorMulta,
      valorJuros: body.valorJuros,
    });
  }

  @Post('guias/gnre')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Gerar guia GNRE (ICMS Interestadual)' })
  async gerarGNRE(
    @Req() req: RequestWithUser,
    @Body() body: {
      empresaId: string; ufFavorecida: string; valorIcms: number;
      valorFcp?: number; chaveNfe?: string; dataVencimento?: Date;
    },
  ) {
    const tenantId = (req as any).user.tenantId;
    return this.guiaService.gerarGNRE({
      tenantId, empresaId: body.empresaId,
      ufFavorecida: body.ufFavorecida,
      valorIcms: body.valorIcms,
      valorFcp: body.valorFcp,
      chaveNfe: body.chaveNfe,
      dataVencimento: body.dataVencimento,
    });
  }

  @Get('guias/pendentes/:empresaId')
  @ApiOperation({ summary: 'Listar guias de pagamento pendentes' })
  async listarGuiasPendentes(
    @Req() req: RequestWithUser,
    @Param('empresaId') empresaId: string,
  ) {
    const tenantId = (req as any).user.tenantId;
    return this.guiaService.listarGuiasPendentes(tenantId, empresaId);
  }
}
