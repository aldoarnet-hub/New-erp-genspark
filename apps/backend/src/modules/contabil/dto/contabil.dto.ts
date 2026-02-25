import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ============================================================
// PLANO DE CONTAS DTOs
// ============================================================
export class CreateContaDto {
  @ApiProperty({ example: '1.1.01.001' })
  codigo: string;

  @ApiProperty({ example: 'Caixa Geral' })
  descricao: string;

  @ApiProperty({ example: 'ATIVO' })
  tipoConta: string;

  @ApiProperty({ example: 'DEVEDORA' })
  natureza: string;

  @ApiProperty({ example: 'ANALITICA' })
  classe: string;

  @ApiPropertyOptional({ example: '1.1.01' })
  contaPaiCodigo?: string;

  @ApiPropertyOptional({ example: 4 })
  nivel?: number;

  @ApiPropertyOptional()
  codigoSped?: string;

  @ApiPropertyOptional()
  codigoDre?: string;
}

export class UpdateContaDto {
  @ApiPropertyOptional()
  descricao?: string;

  @ApiPropertyOptional()
  codigoSped?: string;

  @ApiPropertyOptional()
  codigoDre?: string;

  @ApiPropertyOptional()
  ativo?: boolean;
}

// ============================================================
// LANCAMENTO CONTABIL DTOs
// ============================================================
export class CreateLancamentoDto {
  @ApiProperty({ example: '2026-02-25' })
  dataLancamento: string;

  @ApiProperty({ example: 'VENDA_DINHEIRO' })
  tipoOperacao: string;

  @ApiProperty({ example: '1.1.01.001' })
  contaDebitoCodigo: string;

  @ApiProperty({ example: '3.1.01.001' })
  contaCreditoCodigo: string;

  @ApiProperty({ example: 1500.00 })
  valor: number;

  @ApiProperty({ example: 'Venda a vista - NF 001234' })
  historico: string;

  @ApiPropertyOptional({ example: 'VENDA' })
  documentoOrigem?: string;

  @ApiPropertyOptional()
  documentoOrigemId?: string;

  @ApiPropertyOptional({ example: '001234' })
  numeroDocumentoExterno?: string;

  @ApiPropertyOptional()
  centroCustoId?: string;

  @ApiPropertyOptional({ example: 2026 })
  competenciaAno?: number;

  @ApiPropertyOptional({ example: 2 })
  competenciaMes?: number;
}

export class LancamentoAutomaticoDto {
  @ApiProperty({ example: 'VENDA_PIX' })
  tipoOperacao: string;

  @ApiProperty({ example: 2500.00 })
  valor: number;

  @ApiPropertyOptional({ example: 'VENDA' })
  documentoOrigem?: string;

  @ApiPropertyOptional()
  documentoOrigemId?: string;

  @ApiPropertyOptional({ example: 'NF-001234' })
  numeroDocumentoExterno?: string;

  @ApiPropertyOptional({ description: 'Codigo da conta bancaria (para operacoes com banco)' })
  contaBancariaId?: string;

  @ApiPropertyOptional({ description: 'Dados extras para o historico' })
  dadosHistorico?: Record<string, string>;
}

export class EstornarLancamentoDto {
  @ApiProperty({ example: 'Estorno por erro de lancamento' })
  motivo: string;
}

export class FiltroLancamentoDto {
  @ApiPropertyOptional()
  dataInicio?: string;

  @ApiPropertyOptional()
  dataFim?: string;

  @ApiPropertyOptional()
  contaCodigo?: string;

  @ApiPropertyOptional()
  tipoOperacao?: string;

  @ApiPropertyOptional()
  status?: string;

  @ApiPropertyOptional()
  documentoOrigem?: string;

  @ApiPropertyOptional({ default: 1 })
  page?: number;

  @ApiPropertyOptional({ default: 50 })
  limit?: number;
}

// ============================================================
// MAPEAMENTO DTOs
// ============================================================
export class UpdateMapeamentoDto {
  @ApiPropertyOptional()
  contaDebitoCodigo?: string;

  @ApiPropertyOptional()
  contaDebitoDescricao?: string;

  @ApiPropertyOptional()
  contaCreditoCodigo?: string;

  @ApiPropertyOptional()
  contaCreditoDescricao?: string;

  @ApiPropertyOptional()
  historicoTemplate?: string;

  @ApiPropertyOptional()
  ativo?: boolean;
}

// ============================================================
// CONTA BANCARIA DTOs
// ============================================================
export class CreateContaBancariaDto {
  @ApiProperty({ example: 'Itau Conta Principal' })
  nome: string;

  @ApiPropertyOptional({ example: '341' })
  bancoCodigo?: string;

  @ApiProperty({ example: 'Itau Unibanco' })
  bancoNome: string;

  @ApiProperty({ example: '1234' })
  agencia: string;

  @ApiProperty({ example: '56789' })
  numeroConta: string;

  @ApiPropertyOptional({ example: '0' })
  digitoConta?: string;

  @ApiPropertyOptional({ example: 'CONTA_CORRENTE' })
  tipoConta?: string;

  @ApiProperty({ example: '1.1.02.001' })
  contaContabilCodigo: string;

  @ApiPropertyOptional({ example: true })
  aceitaPix?: boolean;

  @ApiPropertyOptional({ example: '11999999999' })
  chavePix?: string;

  @ApiPropertyOptional({ example: false })
  principal?: boolean;
}

// ============================================================
// BALANCETE / RELATORIOS DTOs
// ============================================================
export class FiltroBalanceteDto {
  @ApiProperty({ example: 2026 })
  ano: number;

  @ApiProperty({ example: 2 })
  mes: number;

  @ApiPropertyOptional({ description: 'Nivel maximo de exibicao (1 a 5)' })
  nivelMaximo?: number;

  @ApiPropertyOptional({ description: 'Tipo de conta filtro' })
  tipoConta?: string;
}

export class FiltroDreDto {
  @ApiProperty({ example: 2026 })
  ano: number;

  @ApiProperty({ example: 1 })
  mesInicio: number;

  @ApiProperty({ example: 12 })
  mesFim: number;
}
