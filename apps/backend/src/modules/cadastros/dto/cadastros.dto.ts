import {
  IsString, IsOptional, IsNumber, IsBoolean, IsUUID, MaxLength,
  Min, Max, IsEnum, IsInt, IsEmail, IsDateString, MinLength,
  IsArray, ValidateNested, IsNotEmpty, Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

// ============================================================
// Enums
// ============================================================
export enum TipoPessoa { PF = 'PF', PJ = 'PJ' }
export enum StatusRegistro { ATIVO = 'ATIVO', INATIVO = 'INATIVO', BLOQUEADO = 'BLOQUEADO' }
export enum TipoProduto { SIMPLES = 'SIMPLES', KIT = 'KIT', SERVICO = 'SERVICO', MATERIA_PRIMA = 'MATERIA_PRIMA' }
export enum TipoSimilaridade { SIMILAR = 'SIMILAR', SUBSTITUTO = 'SUBSTITUTO', COMPLEMENTAR = 'COMPLEMENTAR' }
export enum TipoMidia { IMAGEM = 'IMAGEM', FICHA_TECNICA = 'FICHA_TECNICA', VIDEO = 'VIDEO', MANUAL = 'MANUAL' }
export enum TipoCliente { CONSUMIDOR = 'CONSUMIDOR', CONSTRUTORA = 'CONSTRUTORA', REVENDEDOR = 'REVENDEDOR', ENGENHARIA = 'ENGENHARIA', GOVERNO = 'GOVERNO' }
export enum TipoEndereco { ENTREGA = 'ENTREGA', COBRANCA = 'COBRANCA', CORRESPONDENCIA = 'CORRESPONDENCIA', OBRA = 'OBRA' }
export enum TipoFrete { CIF = 'CIF', FOB = 'FOB' }
export enum TipoComissao { PERCENTUAL = 'PERCENTUAL', VALOR_FIXO = 'VALOR_FIXO' }
export enum Risco { BAIXO = 'BAIXO', MEDIO = 'MEDIO', ALTO = 'ALTO', CRITICO = 'CRITICO' }

// ============================================================
// Filtro Listagem
// ============================================================
export class FiltroListagemDto {
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() categoriaId?: string;
  @IsOptional() @IsString() marcaId?: string;
  @IsOptional() @IsString() tipoProduto?: string;
  @IsOptional() @IsString() tipoPessoa?: string;
  @IsOptional() @IsString() tipoCliente?: string;
  @IsOptional() @IsString() uf?: string;
  @IsOptional() @IsString() cidade?: string;
  @IsOptional() @IsString() vendedorId?: string;
  @IsOptional() @IsString() fornecedorAprovado?: string;
  @IsOptional() @IsString() orderBy?: string;
  @IsOptional() @IsString() orderDir?: string;
  @IsOptional() @IsInt() @Min(1) page?: number;
  @IsOptional() @IsInt() @Min(1) limit?: number;
}

// ============================================================
// Produto DTOs
// ============================================================
export class CriarProdutoDto {
  @IsString() @MinLength(1) @MaxLength(20) codigoInterno: string;
  @IsString() @MinLength(3) @MaxLength(120) descricao: string;
  @IsOptional() @IsString() @MaxLength(14) codigoBarras?: string;
  @IsOptional() @IsString() @MaxLength(14) codigoBarrasAlt?: string;
  @IsOptional() @IsString() @MaxLength(30) descricaoReduzida?: string;
  @IsOptional() @IsString() descricaoComplementar?: string;
  @IsOptional() @IsUUID() categoriaId?: string;
  @IsOptional() @IsUUID() marcaId?: string;
  @IsOptional() @IsUUID() fabricanteId?: string;
  @IsOptional() @IsString() @MaxLength(20) tipoProduto?: string;
  @IsOptional() @IsBoolean() controlaSerie?: boolean;
  @IsOptional() @IsBoolean() controlaLote?: boolean;
  @IsOptional() @IsUUID() unidadeCompraId?: string;
  @IsOptional() @IsUUID() unidadeVendaId?: string;
  @IsOptional() @IsUUID() unidadeEstoqueId?: string;
  @IsOptional() @IsNumber() @Min(0.0001) fatorConversao?: number;
  // Dimensoes
  @IsOptional() @IsNumber() @Min(0) alturaCm?: number;
  @IsOptional() @IsNumber() @Min(0) larguraCm?: number;
  @IsOptional() @IsNumber() @Min(0) profundidadeCm?: number;
  @IsOptional() @IsNumber() @Min(0) pesoLiquidoKg?: number;
  @IsOptional() @IsNumber() @Min(0) pesoBrutoKg?: number;
  // Caracteristicas
  @IsOptional() @IsString() @MaxLength(50) material?: string;
  @IsOptional() @IsString() @MaxLength(30) cor?: string;
  @IsOptional() @IsString() @MaxLength(30) acabamento?: string;
  @IsOptional() @IsString() @MaxLength(10) voltagem?: string;
  // Embalagem
  @IsOptional() @IsInt() @Min(1) unidadesPorCaixa?: number;
  @IsOptional() @IsInt() @Min(1) caixasPorPallet?: number;
  // Fiscal
  @IsOptional() @IsString() @Matches(/^\d{4,8}$/, { message: 'NCM deve ter 4 a 8 digitos' }) ncm?: string;
  @IsOptional() @IsString() @MaxLength(7) cest?: string;
  @IsOptional() @IsString() @MaxLength(4) cfopPadrao?: string;
  @IsOptional() @IsString() @MaxLength(3) cstIcms?: string;
  @IsOptional() @IsString() @MaxLength(2) cstPis?: string;
  @IsOptional() @IsString() @MaxLength(2) cstCofins?: string;
  @IsOptional() @IsString() @MaxLength(2) cstIpi?: string;
  @IsOptional() @IsNumber() @Min(0) @Max(100) aliquotaIcms?: number;
  @IsOptional() @IsNumber() @Min(0) @Max(100) aliquotaIpi?: number;
  @IsOptional() @IsNumber() @Min(0) @Max(100) aliquotaPis?: number;
  @IsOptional() @IsNumber() @Min(0) @Max(100) aliquotaCofins?: number;
  @IsOptional() @IsBoolean() substituicaoTributaria?: boolean;
  @IsOptional() @IsString() @MaxLength(6) origemMercadoria?: string;
  // Estoque
  @IsOptional() @IsNumber() @Min(0) estoqueMinimo?: number;
  @IsOptional() @IsNumber() @Min(0) estoqueMaximo?: number;
  @IsOptional() @IsNumber() @Min(0) pontoPedido?: number;
  @IsOptional() @IsString() @MaxLength(20) localizacaoPadrao?: string;
  // Custos
  @IsOptional() @IsNumber() @Min(0) custoUltimaCompra?: number;
  @IsOptional() @IsNumber() @Min(0) custoMedio?: number;
  @IsOptional() @IsNumber() @Min(0) markupPadrao?: number;
  @IsOptional() @IsNumber() @Min(0) margemMinima?: number;
  // Codigos extra
  @IsOptional() @IsString() @MaxLength(30) codigoFornecedor?: string;
  @IsOptional() @IsString() @MaxLength(30) codigoFabricante?: string;
  // Observacoes
  @IsOptional() @IsString() observacoes?: string;
}

export class AtualizarProdutoDto {
  @IsOptional() @IsString() @MaxLength(120) descricao?: string;
  @IsOptional() @IsString() @MaxLength(14) codigoBarras?: string;
  @IsOptional() @IsString() @MaxLength(14) codigoBarrasAlt?: string;
  @IsOptional() @IsString() @MaxLength(30) descricaoReduzida?: string;
  @IsOptional() @IsString() descricaoComplementar?: string;
  @IsOptional() @IsUUID() categoriaId?: string;
  @IsOptional() @IsUUID() marcaId?: string;
  @IsOptional() @IsUUID() fabricanteId?: string;
  @IsOptional() @IsString() @MaxLength(20) tipoProduto?: string;
  @IsOptional() @IsBoolean() controlaSerie?: boolean;
  @IsOptional() @IsBoolean() controlaLote?: boolean;
  @IsOptional() @IsUUID() unidadeCompraId?: string;
  @IsOptional() @IsUUID() unidadeVendaId?: string;
  @IsOptional() @IsUUID() unidadeEstoqueId?: string;
  @IsOptional() @IsNumber() @Min(0.0001) fatorConversao?: number;
  @IsOptional() @IsNumber() @Min(0) alturaCm?: number;
  @IsOptional() @IsNumber() @Min(0) larguraCm?: number;
  @IsOptional() @IsNumber() @Min(0) profundidadeCm?: number;
  @IsOptional() @IsNumber() @Min(0) pesoLiquidoKg?: number;
  @IsOptional() @IsNumber() @Min(0) pesoBrutoKg?: number;
  @IsOptional() @IsString() @MaxLength(50) material?: string;
  @IsOptional() @IsString() @MaxLength(30) cor?: string;
  @IsOptional() @IsString() @MaxLength(30) acabamento?: string;
  @IsOptional() @IsString() @MaxLength(10) voltagem?: string;
  @IsOptional() @IsString() @MaxLength(8) ncm?: string;
  @IsOptional() @IsString() @MaxLength(7) cest?: string;
  @IsOptional() @IsString() @MaxLength(4) cfopPadrao?: string;
  @IsOptional() @IsString() @MaxLength(3) cstIcms?: string;
  @IsOptional() @IsNumber() @Min(0) @Max(100) aliquotaIcms?: number;
  @IsOptional() @IsNumber() @Min(0) @Max(100) aliquotaIpi?: number;
  @IsOptional() @IsNumber() @Min(0) @Max(100) aliquotaPis?: number;
  @IsOptional() @IsNumber() @Min(0) @Max(100) aliquotaCofins?: number;
  @IsOptional() @IsNumber() @Min(0) estoqueMinimo?: number;
  @IsOptional() @IsNumber() @Min(0) estoqueMaximo?: number;
  @IsOptional() @IsNumber() @Min(0) pontoPedido?: number;
  @IsOptional() @IsNumber() @Min(0) custoMedio?: number;
  @IsOptional() @IsNumber() @Min(0) markupPadrao?: number;
  @IsOptional() @IsNumber() @Min(0) margemMinima?: number;
  @IsOptional() @IsString() @MaxLength(15) status?: string;
  @IsOptional() @IsBoolean() bloqueadoVenda?: boolean;
  @IsOptional() @IsBoolean() bloqueadoCompra?: boolean;
  @IsOptional() @IsString() observacoes?: string;
}

export class ProdutoPrecoDto {
  @IsUUID() filialId: string;
  @IsUUID() tabelaPrecoId: string;
  @IsNumber() @Min(0) precoCusto: number;
  @IsNumber() @Min(0) precoVenda: number;
  @IsOptional() @IsNumber() @Min(0) precoPromocional?: number;
  @IsOptional() @IsNumber() margemLucro?: number;
  @IsOptional() @IsDateString() dataInicioPromocao?: string;
  @IsOptional() @IsDateString() dataFimPromocao?: string;
}

export class ProdutoComposicaoDto {
  @IsUUID() produtoFilhoId: string;
  @IsNumber() @Min(0.001) quantidade: number;
  @IsOptional() @IsUUID() unidadeMedidaId?: string;
  @IsOptional() @IsNumber() @Min(0) custoUnitario?: number;
  @IsOptional() @IsInt() @Min(0) ordem?: number;
  @IsOptional() @IsBoolean() obrigatorio?: boolean;
}

export class ProdutoSimilarDto {
  @IsUUID() produtoSimilarId: string;
  @IsString() @MaxLength(20) tipoSimilaridade: string;
  @IsOptional() @IsInt() @Min(1) prioridade?: number;
  @IsOptional() @IsString() observacao?: string;
}

export class ProdutoAplicacaoDto {
  @IsString() @MinLength(3) @MaxLength(100) descricao: string;
  @IsOptional() @IsString() detalhes?: string;
  @IsOptional() @IsInt() @Min(0) ordem?: number;
}

export class ProdutoMidiaDto {
  @IsString() @MaxLength(500) url: string;
  @IsOptional() @IsString() @MaxLength(20) tipo?: string;
  @IsOptional() @IsString() @MaxLength(100) mimeType?: string;
  @IsOptional() @IsNumber() @Min(0) tamanhoBytes?: number;
  @IsOptional() @IsString() @MaxLength(200) nomeOriginal?: string;
  @IsOptional() @IsBoolean() principal?: boolean;
  @IsOptional() @IsInt() @Min(0) ordem?: number;
}

// ============================================================
// Cliente DTOs
// ============================================================
export class CriarClienteDto {
  @IsString() @MinLength(1) @MaxLength(20) codigoInterno: string;
  @IsString() @MaxLength(2) tipoPessoa: string;
  @IsString() @MinLength(11) @MaxLength(18) cpfCnpj: string;
  @IsOptional() @IsString() @MaxLength(20) rgIe?: string;
  @IsOptional() @IsString() @MaxLength(20) im?: string;
  @IsOptional() @IsString() @MaxLength(150) razaoSocial?: string;
  @IsOptional() @IsString() @MaxLength(100) nomeFantasia?: string;
  @IsOptional() @IsString() @MaxLength(150) nomeCompleto?: string;
  @IsOptional() @IsString() @MaxLength(50) apelido?: string;
  // PF
  @IsOptional() @IsDateString() dataNascimento?: string;
  @IsOptional() @IsString() @MaxLength(1) sexo?: string;
  @IsOptional() @IsString() @MaxLength(15) estadoCivil?: string;
  @IsOptional() @IsString() @MaxLength(50) profissao?: string;
  // PJ
  @IsOptional() @IsDateString() dataFundacao?: string;
  @IsOptional() @IsString() @MaxLength(10) cnae?: string;
  @IsOptional() @IsString() @MaxLength(20) regimeTributario?: string;
  // Contato
  @IsOptional() @IsString() @MaxLength(150) email?: string;
  @IsOptional() @IsString() @MaxLength(20) telefone?: string;
  @IsOptional() @IsString() @MaxLength(20) celular?: string;
  @IsOptional() @IsString() @MaxLength(200) site?: string;
  // Endereco
  @IsOptional() @IsString() @MaxLength(9) cep?: string;
  @IsOptional() @IsString() @MaxLength(150) endereco?: string;
  @IsOptional() @IsString() @MaxLength(20) numero?: string;
  @IsOptional() @IsString() @MaxLength(50) complemento?: string;
  @IsOptional() @IsString() @MaxLength(50) bairro?: string;
  @IsOptional() @IsString() @MaxLength(50) cidade?: string;
  @IsOptional() @IsString() @MaxLength(2) uf?: string;
  @IsOptional() @IsString() @MaxLength(7) codigoIbge?: string;
  // Comercial
  @IsOptional() @IsString() @MaxLength(30) tipoCliente?: string;
  @IsOptional() @IsString() @MaxLength(30) segmento?: string;
  @IsOptional() @IsString() @MaxLength(15) porte?: string;
  @IsOptional() @IsNumber() @Min(0) limiteCredito?: number;
  @IsOptional() @IsNumber() @Min(0) @Max(100) descontoMaximo?: number;
  @IsOptional() @IsUUID() tabelaPrecoId?: string;
  @IsOptional() @IsUUID() formaPagamentoId?: string;
  @IsOptional() @IsUUID() condicaoPagamentoId?: string;
  @IsOptional() @IsUUID() vendedorId?: string;
  @IsOptional() @IsString() observacoes?: string;
}

export class AtualizarClienteDto {
  @IsOptional() @IsString() @MaxLength(150) razaoSocial?: string;
  @IsOptional() @IsString() @MaxLength(100) nomeFantasia?: string;
  @IsOptional() @IsString() @MaxLength(150) nomeCompleto?: string;
  @IsOptional() @IsString() @MaxLength(50) apelido?: string;
  @IsOptional() @IsString() @MaxLength(150) email?: string;
  @IsOptional() @IsString() @MaxLength(20) telefone?: string;
  @IsOptional() @IsString() @MaxLength(20) celular?: string;
  @IsOptional() @IsString() @MaxLength(200) site?: string;
  @IsOptional() @IsString() @MaxLength(9) cep?: string;
  @IsOptional() @IsString() @MaxLength(150) endereco?: string;
  @IsOptional() @IsString() @MaxLength(20) numero?: string;
  @IsOptional() @IsString() @MaxLength(50) complemento?: string;
  @IsOptional() @IsString() @MaxLength(50) bairro?: string;
  @IsOptional() @IsString() @MaxLength(50) cidade?: string;
  @IsOptional() @IsString() @MaxLength(2) uf?: string;
  @IsOptional() @IsString() @MaxLength(30) tipoCliente?: string;
  @IsOptional() @IsString() @MaxLength(30) segmento?: string;
  @IsOptional() @IsString() @MaxLength(15) porte?: string;
  @IsOptional() @IsNumber() @Min(0) limiteCredito?: number;
  @IsOptional() @IsNumber() @Min(0) @Max(100) descontoMaximo?: number;
  @IsOptional() @IsUUID() tabelaPrecoId?: string;
  @IsOptional() @IsUUID() formaPagamentoId?: string;
  @IsOptional() @IsUUID() condicaoPagamentoId?: string;
  @IsOptional() @IsUUID() vendedorId?: string;
  @IsOptional() @IsString() @MaxLength(15) status?: string;
  @IsOptional() @IsBoolean() bloqueado?: boolean;
  @IsOptional() @IsString() motivoBloqueio?: string;
  @IsOptional() @IsString() observacoes?: string;
  @IsOptional() @IsString() observacoesInternas?: string;
}

export class ClienteEnderecoDto {
  @IsString() @MaxLength(20) tipoEndereco: string;
  @IsOptional() @IsBoolean() enderecoPrincipal?: boolean;
  @IsString() @Matches(/^\d{5}-?\d{3}$/, { message: 'CEP invalido (formato 00000-000)' }) cep: string;
  @IsString() @MinLength(3) @MaxLength(150) endereco: string;
  @IsString() @MaxLength(20) numero: string;
  @IsOptional() @IsString() @MaxLength(50) complemento?: string;
  @IsString() @MaxLength(50) bairro: string;
  @IsString() @MaxLength(50) cidade: string;
  @IsString() @MaxLength(2) uf: string;
  @IsOptional() @IsString() @MaxLength(7) codigoIbge?: string;
  @IsOptional() @IsString() @MaxLength(100) pontoReferencia?: string;
  @IsOptional() @IsString() @MaxLength(100) nomeContato?: string;
  @IsOptional() @IsString() @MaxLength(20) telefone?: string;
}

export class ClienteContatoDto {
  @IsString() @MinLength(2) @MaxLength(100) nome: string;
  @IsOptional() @IsString() @MaxLength(50) cargo?: string;
  @IsOptional() @IsString() @MaxLength(50) departamento?: string;
  @IsOptional() @IsString() @MaxLength(150) email?: string;
  @IsOptional() @IsString() @MaxLength(20) telefone?: string;
  @IsOptional() @IsString() @MaxLength(20) celular?: string;
  @IsOptional() @IsBoolean() contatoPrincipal?: boolean;
  @IsOptional() @IsBoolean() recebeNfe?: boolean;
  @IsOptional() @IsBoolean() recebeCobranca?: boolean;
}

export class ClienteLimiteDto {
  @IsString() @MaxLength(30) tipoAnalise: string;
  @IsNumber() @Min(0) limiteAnterior: number;
  @IsNumber() @Min(0) limiteAprovado: number;
  @IsOptional() @IsInt() scoreSpc?: number;
  @IsOptional() @IsInt() scoreSerasa?: number;
  @IsOptional() @IsString() @MaxLength(10) statusSpc?: string;
  @IsOptional() @IsString() @MaxLength(10) statusSerasa?: string;
  @IsOptional() @IsString() parecer?: string;
  @IsOptional() @IsDateString() validadeAnalise?: string;
}

// ============================================================
// Fornecedor DTOs
// ============================================================
export class CriarFornecedorDto {
  @IsString() @MinLength(1) @MaxLength(20) codigoInterno: string;
  @IsString() @MaxLength(2) tipoPessoa: string;
  @IsString() @MinLength(11) @MaxLength(18) cpfCnpj: string;
  @IsOptional() @IsString() @MaxLength(20) rgIe?: string;
  @IsOptional() @IsString() @MaxLength(20) im?: string;
  @IsOptional() @IsString() @MaxLength(150) razaoSocial?: string;
  @IsOptional() @IsString() @MaxLength(100) nomeFantasia?: string;
  @IsOptional() @IsString() @MaxLength(150) email?: string;
  @IsOptional() @IsString() @MaxLength(20) telefone?: string;
  @IsOptional() @IsString() @MaxLength(20) celular?: string;
  @IsOptional() @IsString() @MaxLength(200) site?: string;
  @IsOptional() @IsString() @MaxLength(100) contatoPrincipal?: string;
  @IsOptional() @IsString() @MaxLength(9) cep?: string;
  @IsOptional() @IsString() @MaxLength(150) endereco?: string;
  @IsOptional() @IsString() @MaxLength(20) numero?: string;
  @IsOptional() @IsString() @MaxLength(50) complemento?: string;
  @IsOptional() @IsString() @MaxLength(50) bairro?: string;
  @IsOptional() @IsString() @MaxLength(50) cidade?: string;
  @IsOptional() @IsString() @MaxLength(2) uf?: string;
  @IsOptional() @IsBoolean() certificadoIso?: boolean;
  @IsOptional() @IsString() @MaxLength(20) certificadoIsoTipo?: string;
  @IsOptional() @IsInt() @Min(0) prazoEntregaDias?: number;
  @IsOptional() @IsString() @MaxLength(10) tipoFrete?: string;
  @IsOptional() @IsNumber() @Min(0) valorMinimoCompra?: number;
  @IsOptional() @IsNumber() @Min(0) @Max(100) descontoNegociado?: number;
  @IsOptional() @IsString() observacoes?: string;
}

export class AtualizarFornecedorDto {
  @IsOptional() @IsString() @MaxLength(150) razaoSocial?: string;
  @IsOptional() @IsString() @MaxLength(100) nomeFantasia?: string;
  @IsOptional() @IsString() @MaxLength(150) email?: string;
  @IsOptional() @IsString() @MaxLength(20) telefone?: string;
  @IsOptional() @IsString() @MaxLength(20) celular?: string;
  @IsOptional() @IsString() @MaxLength(200) site?: string;
  @IsOptional() @IsString() @MaxLength(100) contatoPrincipal?: string;
  @IsOptional() @IsString() @MaxLength(9) cep?: string;
  @IsOptional() @IsString() @MaxLength(150) endereco?: string;
  @IsOptional() @IsString() @MaxLength(20) numero?: string;
  @IsOptional() @IsString() @MaxLength(50) bairro?: string;
  @IsOptional() @IsString() @MaxLength(50) cidade?: string;
  @IsOptional() @IsString() @MaxLength(2) uf?: string;
  @IsOptional() @IsBoolean() certificadoIso?: boolean;
  @IsOptional() @IsString() @MaxLength(20) certificadoIsoTipo?: string;
  @IsOptional() @IsInt() @Min(0) prazoEntregaDias?: number;
  @IsOptional() @IsString() @MaxLength(10) tipoFrete?: string;
  @IsOptional() @IsNumber() @Min(0) valorMinimoCompra?: number;
  @IsOptional() @IsNumber() @Min(0) @Max(100) descontoNegociado?: number;
  @IsOptional() @IsString() @MaxLength(15) status?: string;
  @IsOptional() @IsBoolean() fornecedorAprovado?: boolean;
  @IsOptional() @IsString() observacoes?: string;
}

export class FornecedorAvaliacaoDto {
  @IsNumber() @Min(0) @Max(5) qualidadeNota: number;
  @IsNumber() @Min(0) @Max(5) prazoNota: number;
  @IsNumber() @Min(0) @Max(5) precoNota: number;
  @IsNumber() @Min(0) @Max(5) atendimentoNota: number;
  @IsOptional() @IsDateString() periodoInicio?: string;
  @IsOptional() @IsDateString() periodoFim?: string;
  @IsOptional() @IsString() observacoes?: string;
}

// ============================================================
// Transportadora DTOs
// ============================================================
export class CriarTransportadoraDto {
  @IsString() @MinLength(1) @MaxLength(20) codigoInterno: string;
  @IsString() @MinLength(3) @MaxLength(150) razaoSocial: string;
  @IsOptional() @IsString() @MaxLength(100) nomeFantasia?: string;
  @IsString() @MinLength(14) @MaxLength(18) cnpj: string;
  @IsOptional() @IsString() @MaxLength(20) ie?: string;
  @IsOptional() @IsString() @MaxLength(100) rntrc?: string;
  @IsOptional() @IsString() @MaxLength(150) email?: string;
  @IsOptional() @IsString() @MaxLength(20) telefone?: string;
  @IsOptional() @IsString() @MaxLength(9) cep?: string;
  @IsOptional() @IsString() @MaxLength(150) endereco?: string;
  @IsOptional() @IsString() @MaxLength(50) cidade?: string;
  @IsOptional() @IsString() @MaxLength(2) uf?: string;
  @IsOptional() @IsString() @MaxLength(10) tipoFrete?: string;
  @IsOptional() @IsString() @MaxLength(15) modal?: string;
}

export class AtualizarTransportadoraDto {
  @IsOptional() @IsString() @MaxLength(150) razaoSocial?: string;
  @IsOptional() @IsString() @MaxLength(100) nomeFantasia?: string;
  @IsOptional() @IsString() @MaxLength(20) ie?: string;
  @IsOptional() @IsString() @MaxLength(100) rntrc?: string;
  @IsOptional() @IsString() @MaxLength(150) email?: string;
  @IsOptional() @IsString() @MaxLength(20) telefone?: string;
  @IsOptional() @IsString() @MaxLength(9) cep?: string;
  @IsOptional() @IsString() @MaxLength(150) endereco?: string;
  @IsOptional() @IsString() @MaxLength(50) cidade?: string;
  @IsOptional() @IsString() @MaxLength(2) uf?: string;
  @IsOptional() @IsString() @MaxLength(10) tipoFrete?: string;
  @IsOptional() @IsString() @MaxLength(15) modal?: string;
  @IsOptional() @IsString() @MaxLength(15) status?: string;
}

// ============================================================
// Vendedor DTOs
// ============================================================
export class CriarVendedorDto {
  @IsString() @MinLength(1) @MaxLength(20) codigoInterno: string;
  @IsString() @MinLength(3) @MaxLength(150) nomeCompleto: string;
  @IsOptional() @IsString() @MaxLength(14) cpf?: string;
  @IsOptional() @IsString() @MaxLength(150) email?: string;
  @IsOptional() @IsString() @MaxLength(20) telefone?: string;
  @IsOptional() @IsString() @MaxLength(20) celular?: string;
  @IsOptional() @IsString() @MaxLength(10) tipoComissao?: string;
  @IsOptional() @IsNumber() @Min(0) @Max(100) percentualComissao?: number;
  @IsOptional() @IsNumber() @Min(0) metaMensal?: number;
  @IsOptional() @IsUUID() filialId?: string;
  @IsOptional() @IsUUID() supervisorId?: string;
  @IsOptional() @IsUUID() usuarioId?: string;
}

export class AtualizarVendedorDto {
  @IsOptional() @IsString() @MaxLength(150) nomeCompleto?: string;
  @IsOptional() @IsString() @MaxLength(14) cpf?: string;
  @IsOptional() @IsString() @MaxLength(150) email?: string;
  @IsOptional() @IsString() @MaxLength(20) telefone?: string;
  @IsOptional() @IsString() @MaxLength(20) celular?: string;
  @IsOptional() @IsString() @MaxLength(10) tipoComissao?: string;
  @IsOptional() @IsNumber() @Min(0) @Max(100) percentualComissao?: number;
  @IsOptional() @IsNumber() @Min(0) metaMensal?: number;
  @IsOptional() @IsUUID() filialId?: string;
  @IsOptional() @IsUUID() supervisorId?: string;
  @IsOptional() @IsString() @MaxLength(15) status?: string;
}

export class VendedorCarteiraDto {
  @IsUUID() clienteId: string;
}

// ============================================================
// Auxiliares DTOs
// ============================================================
export class CriarCategoriaDto {
  @IsString() @MinLength(1) @MaxLength(20) codigo: string;
  @IsString() @MinLength(2) @MaxLength(100) descricao: string;
  @IsOptional() @IsUUID() categoriaPaiId?: string;
  @IsOptional() @IsInt() @Min(1) nivel?: number;
}

export class CriarMarcaDto {
  @IsString() @MinLength(1) @MaxLength(100) nome: string;
  @IsOptional() @IsString() @MaxLength(500) logoUrl?: string;
}

export class CriarFabricanteDto {
  @IsString() @MinLength(1) @MaxLength(100) nome: string;
  @IsOptional() @IsString() @MaxLength(18) cnpj?: string;
}

export class CriarUnidadeDto {
  @IsString() @MinLength(1) @MaxLength(6) codigo: string;
  @IsString() @MinLength(2) @MaxLength(50) descricao: string;
  @IsOptional() @IsString() @MaxLength(3) sigla?: string;
}

export class CriarTabelaPrecoDto {
  @IsString() @MinLength(1) @MaxLength(10) codigo: string;
  @IsString() @MinLength(2) @MaxLength(50) descricao: string;
  @IsOptional() @IsString() @MaxLength(20) tipo?: string;
  @IsOptional() @IsString() @MaxLength(20) baseCalculo?: string;
  @IsOptional() @IsNumber() @Min(0) @Max(100) percentualAcrescimo?: number;
  @IsOptional() @IsNumber() @Min(0) @Max(100) percentualDesconto?: number;
  @IsOptional() @IsDateString() dataInicio?: string;
  @IsOptional() @IsDateString() dataFim?: string;
  @IsOptional() @IsBoolean() tabelaPadrao?: boolean;
}

export class CriarFormaPagamentoDto {
  @IsString() @MinLength(1) @MaxLength(10) codigo: string;
  @IsString() @MinLength(2) @MaxLength(50) descricao: string;
  @IsString() @MaxLength(20) tipo: string;
  @IsOptional() @IsBoolean() geraTitulo?: boolean;
  @IsOptional() @IsBoolean() baixaAutomatica?: boolean;
  @IsOptional() @IsBoolean() permiteParcelamento?: boolean;
  @IsOptional() @IsInt() @Min(1) maximoParcelas?: number;
  @IsOptional() @IsNumber() @Min(0) taxaOperadora?: number;
  @IsOptional() @IsString() @MaxLength(20) codigoNfe?: string;
}

export class CriarCondicaoPagamentoDto {
  @IsString() @MinLength(1) @MaxLength(10) codigo: string;
  @IsString() @MinLength(2) @MaxLength(50) descricao: string;
  @IsOptional() @IsInt() @Min(1) numeroParcelas?: number;
  @IsOptional() @IsBoolean() exigeEntrada?: boolean;
  @IsOptional() @IsNumber() @Min(0) @Max(100) percentualEntrada?: number;
  @IsOptional() @IsInt() @Min(0) intervaloDias?: number;
  @IsOptional() @IsNumber() @Min(0) @Max(100) percentualDesconto?: number;
  @IsOptional() @IsNumber() @Min(0) @Max(100) percentualAcrescimo?: number;
}

export class CriarBancoDto {
  @IsString() @MinLength(3) @MaxLength(3) codigoFebraban: string;
  @IsString() @MinLength(2) @MaxLength(100) nome: string;
  @IsOptional() @IsString() @MaxLength(30) nomeReduzido?: string;
}

export class CriarContaBancariaDto {
  @IsUUID() bancoId: string;
  @IsOptional() @IsUUID() empresaId?: string;
  @IsString() @MinLength(2) @MaxLength(50) descricao: string;
  @IsString() @MaxLength(10) agencia: string;
  @IsOptional() @IsString() @MaxLength(2) agenciaDigito?: string;
  @IsString() @MaxLength(20) conta: string;
  @IsOptional() @IsString() @MaxLength(2) contaDigito?: string;
  @IsOptional() @IsString() @MaxLength(20) tipoConta?: string;
  @IsOptional() @IsString() @MaxLength(30) chavePix?: string;
  @IsOptional() @IsString() @MaxLength(10) tipoChavePix?: string;
  @IsOptional() @IsBoolean() contaPrincipal?: boolean;
}

export class CriarCentroCustoDto {
  @IsString() @MinLength(1) @MaxLength(20) codigo: string;
  @IsString() @MinLength(2) @MaxLength(100) descricao: string;
  @IsOptional() @IsUUID() centroPaiId?: string;
  @IsOptional() @IsInt() @Min(1) nivel?: number;
  @IsOptional() @IsUUID() responsavelId?: string;
}

export class CriarPlanoContaDto {
  @IsString() @MinLength(1) @MaxLength(20) codigo: string;
  @IsString() @MinLength(2) @MaxLength(150) descricao: string;
  @IsString() @MaxLength(20) tipo: string;
  @IsString() @MaxLength(20) natureza: string;
  @IsOptional() @IsUUID() contaPaiId?: string;
  @IsOptional() @IsInt() @Min(1) nivel?: number;
  @IsOptional() @IsBoolean() contaSintetica?: boolean;
}
