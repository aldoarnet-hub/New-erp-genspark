import {
  Controller, Get, Post, Put, Body, Param, Query,
  UseGuards, HttpCode, HttpStatus, Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RequestWithUser } from '@/shared/types';
import { NfeService } from '../services/nfe.service';

@ApiTags('NF-e')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('fiscal/nfe')
export class NfeController {
  constructor(private readonly nfeService: NfeService) {}

  @Post('emitir')
  @ApiOperation({ summary: 'Emitir NF-e (gerar XML, assinar, enviar SEFAZ)' })
  @ApiResponse({ status: 201, description: 'NF-e emitida' })
  async emitir(@Req() req: RequestWithUser, @Body() body: any) {
    const tenantId = (req as any).user.tenantId;
    const empresaId = (req as any).user.empresaId;
    return this.nfeService.emitirNfe(tenantId, empresaId, body);
  }

  @Post(':id/cancelar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancelar NF-e autorizada' })
  async cancelar(@Req() req: RequestWithUser, @Param('id') id: string, @Body() body: { justificativa: string }) {
    const tenantId = (req as any).user.tenantId;
    return this.nfeService.cancelarNfe(tenantId, id, body.justificativa);
  }

  @Post(':id/carta-correcao')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enviar Carta de Correcao (CC-e)' })
  async cartaCorrecao(@Req() req: RequestWithUser, @Param('id') id: string, @Body() body: { correcao: string }) {
    const tenantId = (req as any).user.tenantId;
    return this.nfeService.cartaCorrecao(tenantId, id, body.correcao);
  }

  @Post('inutilizar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Inutilizar faixa de numeracao' })
  async inutilizar(@Req() req: RequestWithUser, @Body() body: {
    empresaId: string; serie: number; numeroInicial: number; numeroFinal: number; justificativa: string;
  }) {
    const tenantId = (req as any).user.tenantId;
    return this.nfeService.inutilizarNumeracao(
      tenantId, body.empresaId, body.serie, body.numeroInicial, body.numeroFinal, body.justificativa,
    );
  }

  @Get(':id/consultar')
  @ApiOperation({ summary: 'Consultar NF-e na SEFAZ' })
  async consultar(@Req() req: RequestWithUser, @Param('id') id: string) {
    const tenantId = (req as any).user.tenantId;
    return this.nfeService.consultarNfe(tenantId, id);
  }

  @Get()
  @ApiOperation({ summary: 'Listar NF-e' })
  async listar(@Req() req: RequestWithUser, @Query() filtros: any) {
    const tenantId = (req as any).user.tenantId;
    return this.nfeService.listarNfe(tenantId, filtros);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar NF-e por ID' })
  async buscar(@Req() req: RequestWithUser, @Param('id') id: string) {
    const tenantId = (req as any).user.tenantId;
    const nfe = await this.nfeService.listarNfe(tenantId, {});
    return nfe.data.find(n => n.id === id);
  }

  @Get(':id/itens')
  @ApiOperation({ summary: 'Buscar itens da NF-e' })
  async buscarItens(@Req() req: RequestWithUser, @Param('id') id: string) {
    const tenantId = (req as any).user.tenantId;
    return this.nfeService.buscarItensNfe(tenantId, id);
  }

  @Get(':id/eventos')
  @ApiOperation({ summary: 'Buscar eventos da NF-e (cancelamento, CC-e, etc.)' })
  async buscarEventos(@Req() req: RequestWithUser, @Param('id') id: string) {
    const tenantId = (req as any).user.tenantId;
    return this.nfeService.buscarEventosNfe(tenantId, id);
  }
}
