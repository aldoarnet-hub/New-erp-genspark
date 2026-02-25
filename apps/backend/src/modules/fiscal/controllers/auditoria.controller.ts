import {
  Controller, Get, Post, Put, Body, Param, Query,
  UseGuards, HttpCode, HttpStatus, Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RequestWithUser } from '@/shared/types';
import { AuditoriaFiscalService } from '../services/obrigacoes-auditoria.service';
import { ManifestacaoDestinatarioService } from '../services/manifestacao-destinatario.service';
import { ReceitaFederalService } from '../services/receita-federal.service';
import { SintegraService } from '../services/sintegra.service';
import { CalculoDifalService } from '../services/calculo-difal.service';
import { SimuladorTributarioService } from '../services/obrigacoes-auditoria.service';

@ApiTags('Auditoria e Integracoes Fiscais')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('fiscal/auditoria')
export class AuditoriaController {
  constructor(
    private readonly auditoriaService: AuditoriaFiscalService,
    private readonly manifestacao: ManifestacaoDestinatarioService,
    private readonly receitaFederal: ReceitaFederalService,
    private readonly sintegra: SintegraService,
    private readonly difalService: CalculoDifalService,
    private readonly simulador: SimuladorTributarioService,
  ) {}

  // ============================================================
  // Auditoria Fiscal
  // ============================================================

  @Post('nfe/:nfeId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Auditar uma NF-e (validar chave, valores, impostos, duplicidade)' })
  @ApiResponse({ status: 200, description: 'Resultado da auditoria' })
  async auditarNfe(@Req() req: RequestWithUser, @Param('nfeId') nfeId: string) {
    const tenantId = (req as any).user.tenantId;
    return this.auditoriaService.auditarNfe(tenantId, nfeId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar alertas de auditoria fiscal' })
  async listarAuditorias(
    @Req() req: RequestWithUser,
    @Query('tipoDocumento') tipoDocumento?: string,
    @Query('severidade') severidade?: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const tenantId = (req as any).user.tenantId;
    return this.auditoriaService.listarAuditorias(tenantId, {
      tipoDocumento, severidade, status, page, limit,
    });
  }

  // ============================================================
  // Manifestacao do Destinatario
  // ============================================================

  @Post('manifestacao/:nfeId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Registrar manifestacao do destinatario' })
  async manifestar(
    @Req() req: RequestWithUser,
    @Param('nfeId') nfeId: string,
    @Body() body: { tipoManifestacao: string; justificativa?: string },
  ) {
    const tenantId = (req as any).user.tenantId;
    return this.manifestacao.manifestar(
      tenantId, nfeId, body.tipoManifestacao, body.justificativa,
    );
  }

  @Get('manifestacoes')
  @ApiOperation({ summary: 'Listar manifestacoes do destinatario' })
  async listarManifestacoes(
    @Req() req: RequestWithUser,
    @Query('nfeId') nfeId?: string,
    @Query('tipoManifestacao') tipoManifestacao?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const tenantId = (req as any).user.tenantId;
    return this.manifestacao.listarManifestacoes(tenantId, {
      nfeId, tipoManifestacao, page, limit,
    });
  }

  @Post('manifestacao/consultar-destinadas')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Consultar NF-e destinadas (emitidas contra a empresa)' })
  async consultarDestinatario(
    @Req() req: RequestWithUser,
    @Body() body: { cnpj: string; ultimoNsu?: string; uf?: string },
  ) {
    const tenantId = (req as any).user.tenantId;
    return this.manifestacao.consultarNfeDestinatario(
      tenantId, body.cnpj, body.ultimoNsu, body.uf,
    );
  }

  // ============================================================
  // Integracoes Externas
  // ============================================================

  @Get('receita-federal/cnpj/:cnpj')
  @ApiOperation({ summary: 'Consultar CNPJ na Receita Federal' })
  async consultarCnpj(@Param('cnpj') cnpj: string) {
    return this.receitaFederal.consultarCnpj(cnpj);
  }

  @Get('receita-federal/validar-cpf/:cpf')
  @ApiOperation({ summary: 'Validar CPF' })
  async validarCpf(@Param('cpf') cpf: string) {
    return { cpf, valido: this.receitaFederal.validarCpf(cpf) };
  }

  @Get('receita-federal/validar-cnpj/:cnpj')
  @ApiOperation({ summary: 'Validar CNPJ' })
  async validarCnpj(@Param('cnpj') cnpj: string) {
    return { cnpj, valido: this.receitaFederal.validarCnpj(cnpj) };
  }

  @Get('sintegra/validar-ie')
  @ApiOperation({ summary: 'Validar Inscricao Estadual' })
  async validarIE(@Query('uf') uf: string, @Query('ie') ie: string) {
    return this.sintegra.validarIE(uf, ie);
  }

  @Get('sintegra/consultar-ie')
  @ApiOperation({ summary: 'Consultar Inscricao Estadual no SINTEGRA' })
  async consultarIE(@Query('uf') uf: string, @Query('ie') ie: string) {
    return this.sintegra.consultarIE(uf, ie);
  }

  // ============================================================
  // DIFAL
  // ============================================================

  @Post('difal/calcular')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Calcular DIFAL e FCP para operacao interestadual' })
  async calcularDifal(
    @Body() body: {
      valorBase: number; ufOrigem: string; ufDestino: string;
      aliquotaInternaDestino?: number; aliquotaInterestadual?: number;
      consumidorFinal: boolean; contribuinteIcms: boolean;
    },
  ) {
    return this.difalService.calcularDifal(body);
  }

  @Post('difal/calcular-contribuinte')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Calcular DIFAL para contribuinte (antecipacao)' })
  async calcularDifalContribuinte(
    @Body() body: { valorBase: number; ufOrigem: string; ufDestino: string },
  ) {
    return this.difalService.calcularDifalContribuinte(body);
  }

  // ============================================================
  // Simulador Tributario
  // ============================================================

  @Post('simulador/simular')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Simular tributacao para multiplos cenarios' })
  async simularOperacao(
    @Body() body: {
      itens: any[];
      contextoBase: any;
      variacoes: any[];
    },
  ) {
    return this.simulador.simularOperacao(body.itens, body.contextoBase, body.variacoes);
  }
}
