import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsBoolean, IsUUID, IsInt, Min, Max } from 'class-validator';

// ============================================================
// DTOs para cálculo tributário
// ============================================================

export class CalcularImpostoDto {
  @ApiProperty({ description: 'ID do produto' })
  @IsUUID()
  produtoId: string;

  @ApiProperty({ description: 'Código NCM (8 dígitos)' })
  @IsString()
  ncm: string;

  @ApiPropertyOptional({ description: 'Código CEST (7 dígitos)' })
  @IsOptional()
  @IsString()
  cest?: string;

  @ApiProperty({ description: 'Código CFOP (4 dígitos)' })
  @IsString()
  cfop: string;

  @ApiProperty({ description: 'Quantidade' })
  @IsNumber()
  quantidade: number;

  @ApiProperty({ description: 'Valor unitário' })
  @IsNumber()
  valorUnitario: number;

  @ApiProperty({ description: 'Valor total' })
  @IsNumber()
  valorTotal: number;

  @ApiProperty({ description: 'UF de origem' })
  @IsString()
  ufOrigem: string;

  @ApiProperty({ description: 'UF de destino' })
  @IsString()
  ufDestino: string;

  @ApiProperty({ description: 'Tipo de operação: E=Entrada, S=Saída' })
  @IsString()
  tipoOperacao: string;

  @ApiProperty({ description: 'Regime tributário: 1=Simples, 2=Simples Excesso, 3=Normal' })
  @IsString()
  regimeEmpresa: string;

  @ApiPropertyOptional({ description: 'É consumidor final?' })
  @IsOptional()
  @IsBoolean()
  consumidorFinal?: boolean;

  @ApiPropertyOptional({ description: 'Destinatário é contribuinte do ICMS?' })
  @IsOptional()
  @IsBoolean()
  contribuinteIcms?: boolean;

  @ApiPropertyOptional({ description: 'Finalidade: 1=Normal, 2=Complementar, 3=Ajuste, 4=Devolução' })
  @IsOptional()
  @IsString()
  finalidadeEmissao?: string;

  @ApiPropertyOptional({ description: 'PIS/COFINS cumulativo?' })
  @IsOptional()
  @IsBoolean()
  pisCofinsCumulativo?: boolean;
}

// ============================================================
// DTOs para Simples Nacional
// ============================================================

export class CalcularDASDto {
  @ApiProperty({ description: 'Receita bruta dos últimos 12 meses' })
  @IsNumber()
  receitaBruta12Meses: number;

  @ApiProperty({ description: 'Receita bruta do mês atual' })
  @IsNumber()
  receitaMes: number;

  @ApiProperty({ description: 'Anexo do Simples (I, II, III, IV, V)' })
  @IsString()
  anexo: string;

  @ApiPropertyOptional({ description: 'Fator R (folha/receita) para Anexo III/V' })
  @IsOptional()
  @IsNumber()
  fatorR?: number;
}

export class CompararRegimesDto {
  @ApiProperty({ description: 'Faturamento anual estimado' })
  @IsNumber()
  faturamentoAnual: number;

  @ApiProperty({ description: 'UF da empresa' })
  @IsString()
  uf: string;
}

// ============================================================
// DTOs para Matriz Tributária
// ============================================================

export class CriarRegraMatrizDto {
  @ApiProperty()
  @IsString()
  codigo: string;

  @ApiProperty()
  @IsString()
  descricao: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(999)
  prioridade?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ncmCodigo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cestCodigo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cfopCodigo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tipoOperacao?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ufOrigem?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ufDestino?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  regimeTributarioEmp?: string;

  // ICMS
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  icmsCst?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  icmsAliq?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  icmsReducaoBc?: number;

  // ICMS-ST
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  icmsStMva?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  icmsStAliq?: number;

  // IPI
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ipiCst?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  ipiAliq?: number;

  // PIS/COFINS
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pisCst?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  pisAliq?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cofinsCst?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  cofinsAliq?: number;

  // Simples Nacional
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  snCsosn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  snAliquota?: number;
}

// ============================================================
// DTOs para Empresa Fiscal
// ============================================================

export class EmpresaFiscalDto {
  @ApiProperty()
  @IsUUID()
  empresaId: string;

  @ApiProperty()
  @IsString()
  cnpj: string;

  @ApiProperty()
  @IsString()
  razaoSocial: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nomeFantasia?: string;

  @ApiProperty({ description: '1=Simples, 2=Simples Excesso, 3=Normal' })
  @IsString()
  regimeTributario: string;

  @ApiProperty()
  @IsString()
  cnaePrincipal: string;

  @ApiProperty()
  @IsString()
  enderecoLogradouro: string;

  @ApiProperty()
  @IsString()
  enderecoNumero: string;

  @ApiProperty()
  @IsString()
  enderecoBairro: string;

  @ApiProperty()
  @IsString()
  enderecoCep: string;

  @ApiProperty()
  @IsString()
  enderecoCodigoMunicipio: string;

  @ApiProperty()
  @IsString()
  enderecoUf: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nfeAmbiente?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  certificadoTipo?: string;
}

// ============================================================
// DTO de filtro genérico
// ============================================================

export class FiltroTabelaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  codigo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tipo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number;
}
