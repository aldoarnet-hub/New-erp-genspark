import {
  Controller, Get, Post, Body, Param, Query,
  UseGuards, HttpCode, HttpStatus, Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RequestWithUser } from '@/shared/types';
import { SpedService } from '../services/sped.service';

@ApiTags('SPED')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('fiscal/sped')
export class SpedController {
  constructor(private readonly spedService: SpedService) {}

  @Post('fiscal/gerar')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Gerar arquivo SPED Fiscal (EFD ICMS/IPI)' })
  @ApiResponse({ status: 201, description: 'SPED Fiscal gerado' })
  async gerarSpedFiscal(
    @Req() req: RequestWithUser,
    @Body() body: { empresaId: string; ano: number; mes: number },
  ) {
    const tenantId = (req as any).user.tenantId;
    return this.spedService.gerarSpedFiscal(tenantId, body.empresaId, body.ano, body.mes);
  }

  @Post('contribuicoes/gerar')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Gerar arquivo SPED Contribuicoes (EFD PIS/COFINS)' })
  @ApiResponse({ status: 201, description: 'SPED Contribuicoes gerado' })
  async gerarSpedContribuicoes(
    @Req() req: RequestWithUser,
    @Body() body: { empresaId: string; ano: number; mes: number },
  ) {
    const tenantId = (req as any).user.tenantId;
    return this.spedService.gerarSpedContribuicoes(tenantId, body.empresaId, body.ano, body.mes);
  }

  @Get()
  @ApiOperation({ summary: 'Listar registros SPED gerados' })
  async listarSped(
    @Req() req: RequestWithUser,
    @Query('empresaId') empresaId?: string,
    @Query('tipoSped') tipoSped?: string,
    @Query('periodoAno') periodoAno?: number,
    @Query('periodoMes') periodoMes?: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const tenantId = (req as any).user.tenantId;
    return this.spedService.listarSped(tenantId, {
      empresaId, tipoSped, periodoAno, periodoMes, page, limit,
    });
  }

  @Post(':id/validar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validar arquivo SPED' })
  async validarSped(@Param('id') id: string) {
    return this.spedService.validarSped(id);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download conteudo do arquivo SPED' })
  async downloadSped(@Param('id') id: string) {
    const resultado = await this.spedService.listarSped('', {});
    const registro = resultado.data.find(s => s.id === id);
    if (!registro) {
      return { erro: 'Registro SPED nao encontrado' };
    }
    return {
      nomeArquivo: registro.nomeArquivo,
      conteudo: registro.conteudoArquivo,
      hash: registro.hashArquivo,
      tipoSped: registro.tipoSped,
    };
  }
}
