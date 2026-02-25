import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsBoolean, IsUUID, IsInt, Min, Max, IsDateString, IsArray, MinLength } from 'class-validator';

// ============================================================
// DTOs para NF-e
// ============================================================

export class EmitirNfeDto {
  @ApiProperty({ description: 'ID da empresa fiscal' })
  @IsUUID()
  empresaId: string;

  @ApiProperty({ description: 'Tipo de operacao: E=Entrada, S=Saida' })
  @IsString()
  tipoOperacao: string;

  @ApiPropertyOptional({ description: 'Natureza da operacao' })
  @IsOptional()
  @IsString()
  naturezaOperacao?: string;

  @ApiPropertyOptional({ description: 'Finalidade: 1=Normal, 2=Complementar, 3=Ajuste, 4=Devolucao' })
  @IsOptional()
  @IsString()
  finalidadeEmissao?: string;

  @ApiProperty({ description: 'Dados do destinatario' })
  destinatario: {
    cnpjCpf: string;
    nome: string;
    ie?: string;
    uf: string;
    endereco?: {
      logradouro: string;
      numero: string;
      bairro: string;
      cep: string;
      codigoMunicipio: string;
      municipio?: string;
    };
  };

  @ApiProperty({ description: 'Itens da nota fiscal', type: 'array' })
  @IsArray()
  itens: Array<{
    codigo: string;
    descricao: string;
    ncm: string;
    cest?: string;
    cfop: string;
    unidade: string;
    quantidade: number;
    valorUnitario: number;
    valorTotal: number;
    icmsCst?: string;
    icmsBaseCalculo?: number;
    icmsAliquota?: number;
    icmsValor?: number;
    pisCst?: string;
    pisAliquota?: number;
    pisValor?: number;
    cofinsCst?: string;
    cofinsAliquota?: number;
    cofinsValor?: number;
  }>;

  @ApiPropertyOptional({ description: 'Pagamentos' })
  @IsOptional()
  @IsArray()
  pagamentos?: Array<{
    tPag: string; // 01=Dinheiro, 02=Cheque, 03=Cartao Credito, etc.
    vPag: number;
  }>;

  @ApiPropertyOptional({ description: 'Dados de transporte' })
  @IsOptional()
  transporte?: {
    modFrete: string;
    transportadora?: {
      cnpj?: string;
      nome?: string;
    };
  };

  @ApiPropertyOptional({ description: 'Informacoes adicionais' })
  @IsOptional()
  infAdic?: {
    infCpl?: string;
    infAdFisco?: string;
  };
}

export class CancelarNfeDto {
  @ApiProperty({ description: 'Justificativa do cancelamento (min 15 caracteres)' })
  @IsString()
  @MinLength(15)
  justificativa: string;
}

export class CartaCorrecaoDto {
  @ApiProperty({ description: 'Texto da correcao (max 1000 caracteres)' })
  @IsString()
  @MinLength(15)
  correcao: string;
}

export class InutilizarNumeracaoDto {
  @ApiProperty() @IsUUID() empresaId: string;
  @ApiProperty() @IsInt() serie: number;
  @ApiProperty() @IsInt() numeroInicial: number;
  @ApiProperty() @IsInt() numeroFinal: number;
  @ApiProperty() @IsString() @MinLength(15) justificativa: string;
}

export class FiltroNfeDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() empresaId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() status?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() modelo?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() dataInicio?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() dataFim?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) page?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) @Max(100) limit?: number;
}

// ============================================================
// DTOs para SPED
// ============================================================

export class GerarSpedDto {
  @ApiProperty({ description: 'ID da empresa fiscal' })
  @IsUUID()
  empresaId: string;

  @ApiProperty({ description: 'Ano do periodo' })
  @IsInt()
  @Min(2020)
  ano: number;

  @ApiProperty({ description: 'Mes do periodo' })
  @IsInt()
  @Min(1)
  @Max(12)
  mes: number;
}

export class FiltroSpedDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() empresaId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() tipoSped?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() periodoAno?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() periodoMes?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) page?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) @Max(100) limit?: number;
}

// ============================================================
// DTOs para Obrigacoes Fiscais
// ============================================================

export class GerarObrigacoesMesDto {
  @ApiProperty() @IsUUID() empresaId: string;
  @ApiProperty() @IsInt() @Min(2020) ano: number;
  @ApiProperty() @IsInt() @Min(1) @Max(12) mes: number;
}

export class AtualizarStatusObrigacaoDto {
  @ApiProperty({ description: 'Status: pendente, aprovado, entregue, pago, atrasado, cancelado' })
  @IsString()
  status: string;

  @ApiPropertyOptional() @IsOptional() @IsNumber() valorPago?: number;
  @ApiPropertyOptional() @IsOptional() dataPagamento?: Date;
}

export class FiltroObrigacoesDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() empresaId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() status?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() imposto?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() competenciaAno?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() competenciaMes?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) page?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) @Max(100) limit?: number;
}

// ============================================================
// DTOs para Guias de Pagamento
// ============================================================

export class GerarDASDto {
  @ApiProperty() @IsUUID() empresaId: string;
  @ApiProperty({ description: 'Periodo MM/YYYY' }) @IsString() periodoApuracao: string;
  @ApiProperty() @IsNumber() valorTotal: number;
  @ApiPropertyOptional() @IsOptional() reparticao?: Record<string, number>;
}

export class GerarDARFDto {
  @ApiProperty() @IsUUID() empresaId: string;
  @ApiProperty() @IsString() codigoReceita: string;
  @ApiProperty({ description: 'Periodo MM/YYYY' }) @IsString() periodoApuracao: string;
  @ApiProperty() @IsNumber() valorPrincipal: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() valorMulta?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() valorJuros?: number;
}

export class GerarGNREDto {
  @ApiProperty() @IsUUID() empresaId: string;
  @ApiProperty({ description: 'UF favorecida (2 letras)' }) @IsString() ufFavorecida: string;
  @ApiProperty() @IsNumber() valorIcms: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() valorFcp?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() chaveNfe?: string;
  @ApiPropertyOptional() @IsOptional() dataVencimento?: Date;
}

// ============================================================
// DTOs para Auditoria
// ============================================================

export class FiltroAuditoriaDto {
  @ApiPropertyOptional() @IsOptional() @IsString() tipoDocumento?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() severidade?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() status?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) page?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) @Max(100) limit?: number;
}

// ============================================================
// DTOs para Manifestacao do Destinatario
// ============================================================

export class ManifestacaoDto {
  @ApiProperty({ description: 'Tipo: 210200, 210210, 210220, 210240' })
  @IsString()
  tipoManifestacao: string;

  @ApiPropertyOptional({ description: 'Justificativa (obrigatoria para 210240)' })
  @IsOptional()
  @IsString()
  justificativa?: string;
}

export class ConsultarDestinatarioDto {
  @ApiProperty() @IsString() cnpj: string;
  @ApiPropertyOptional() @IsOptional() @IsString() ultimoNsu?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() uf?: string;
}

// ============================================================
// DTOs para DIFAL
// ============================================================

export class CalcularDifalDto {
  @ApiProperty() @IsNumber() valorBase: number;
  @ApiProperty() @IsString() ufOrigem: string;
  @ApiProperty() @IsString() ufDestino: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() aliquotaInternaDestino?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() aliquotaInterestadual?: number;
  @ApiProperty() @IsBoolean() consumidorFinal: boolean;
  @ApiProperty() @IsBoolean() contribuinteIcms: boolean;
}

export class CalcularDifalContribuinteDto {
  @ApiProperty() @IsNumber() valorBase: number;
  @ApiProperty() @IsString() ufOrigem: string;
  @ApiProperty() @IsString() ufDestino: string;
}

// ============================================================
// DTOs para Integracoes (Receita Federal, SINTEGRA)
// ============================================================

export class ConsultarIEDto {
  @ApiProperty({ description: 'UF (2 letras)' }) @IsString() uf: string;
  @ApiProperty({ description: 'Inscricao Estadual' }) @IsString() ie: string;
}

// ============================================================
// DTOs para Simulador Tributario
// ============================================================

export class SimularOperacaoDto {
  @ApiProperty({ description: 'Itens para simulacao', type: 'array' })
  @IsArray()
  itens: any[];

  @ApiProperty({ description: 'Contexto base para calculo' })
  contextoBase: any;

  @ApiProperty({ description: 'Variacoes de contexto para comparacao', type: 'array' })
  @IsArray()
  variacoes: any[];
}
