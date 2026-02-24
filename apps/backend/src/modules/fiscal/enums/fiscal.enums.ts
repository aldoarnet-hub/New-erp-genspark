// ============================================================
// ENUMS DO MÓDULO FISCAL - ERP SaaS Multi-Tenant
// ============================================================

/** Regime Tributário da Empresa */
export enum RegimeTributario {
  SIMPLES_NACIONAL = '1',
  SIMPLES_EXCESSO = '2',
  NORMAL = '3', // Lucro Presumido ou Real
}

/** Tipo de Operação Fiscal */
export enum TipoOperacao {
  ENTRADA = 'E',
  SAIDA = 'S',
}

/** Ambiente NF-e */
export enum AmbienteNFe {
  PRODUCAO = '1',
  HOMOLOGACAO = '2',
}

/** Tipo de Certificado Digital */
export enum TipoCertificado {
  A1 = 'A1',
  A3 = 'A3',
}

/** Tipo de Estabelecimento */
export enum TipoEstabelecimento {
  MATRIZ = '01',
  FILIAL = '02',
  DEPOSITO = '03',
  CENTRO_DISTRIBUICAO = '04',
}

/** Modalidade BC ICMS */
export enum ModalidadeBCICMS {
  MARGEM_VALOR_AGREGADO = '0',
  PAUTA = '1',
  PRECO_MAXIMO = '2',
  LISTA_NEGATIVA = '3',
  LISTA_POSITIVA = '4',
  LISTA_NEUTRA = '5',
}

/** Tipo CST - classificação do tipo de CST */
export enum TipoCSTICMS {
  TRIBUTADO = 'tributado',
  ISENTO = 'isento',
  NAO_TRIBUTADO = 'nao_tributado',
  SUSPENSAO = 'suspensao',
  DIFERIMENTO = 'diferimento',
  OUTROS = 'outros',
}

/** Tipo CST IPI */
export enum TipoCSTIPI {
  ENTRADA_CREDITO = 'entrada_credito',
  ENTRADA_ZERO = 'entrada_zero',
  ENTRADA_ISENTA = 'entrada_isenta',
  ENTRADA_NAO_TRIB = 'entrada_nao_trib',
  ENTRADA_IMUNE = 'entrada_imune',
  ENTRADA_SUSPENSAO = 'entrada_suspensao',
  ENTRADA_OUTRAS = 'entrada_outras',
  SAIDA_TRIBUTADA = 'saida_tributada',
  SAIDA_ZERO = 'saida_zero',
  SAIDA_ISENTA = 'saida_isenta',
  SAIDA_NAO_TRIB = 'saida_nao_trib',
  SAIDA_IMUNE = 'saida_imune',
  SAIDA_SUSPENSAO = 'saida_suspensao',
  SAIDA_OUTRAS = 'saida_outras',
}

/** Tipo de operação PIS/COFINS */
export enum TipoOperacaoPISCOFINS {
  ENTRADA = 'entrada',
  SAIDA = 'saida',
}

/** Status da NF-e */
export enum StatusNFe {
  EM_DIGITACAO = 'em_digitacao',
  VALIDADA = 'validada',
  ASSINADA = 'assinada',
  ENVIADA = 'enviada',
  AUTORIZADA = 'autorizada',
  REJEITADA = 'rejeitada',
  CANCELADA = 'cancelada',
  DENEGADA = 'denegada',
  INUTILIZADA = 'inutilizada',
  CONTINGENCIA = 'contingencia',
}

/** Modelo da Nota Fiscal */
export enum ModeloNF {
  NFE = '55',
  NFCE = '65',
}

/** Finalidade da Emissão */
export enum FinalidadeEmissao {
  NORMAL = '1',
  COMPLEMENTAR = '2',
  AJUSTE = '3',
  DEVOLUCAO = '4',
}

/** Indicador de Presença */
export enum IndicadorPresenca {
  NAO_APLICA = '0',
  PRESENCIAL = '1',
  INTERNET = '2',
  TELEATENDIMENTO = '3',
  ENTREGA_DOMICILIO = '4',
  PRESENCIAL_FORA = '5',
  OUTROS = '9',
}

/** Perfil SPED */
export enum PerfilSPED {
  A = 'A',
  B = 'B',
  C = 'C',
}

/** Método de Avaliação de Estoque */
export enum MetodoAvaliacaoEstoque {
  PEPS = '1', // FIFO
  UEPS = '2', // LIFO
  MEDIA = '3', // Média ponderada
}

/** Severidade de Alerta Fiscal */
export enum SeveridadeAlerta {
  INFO = 'info',
  ALERTA = 'alerta',
  ERRO = 'erro',
  CRITICO = 'critico',
}

/** Anexo Simples Nacional */
export enum AnexoSimplesNacional {
  I = 'I',   // Comércio
  II = 'II',  // Indústria
  III = 'III', // Serviços e mistos
  IV = 'IV',  // Serviços com ISS próprio
  V = 'V',   // Serviços
}

/** Método de apuração Lucro Real */
export enum MetodoApuracaoLR {
  TRIMESTRAL = '1',
  ANUAL = '2',
}

export default {
  RegimeTributario,
  TipoOperacao,
  AmbienteNFe,
  TipoCertificado,
  TipoEstabelecimento,
  ModalidadeBCICMS,
  TipoCSTICMS,
  TipoCSTIPI,
  TipoOperacaoPISCOFINS,
  StatusNFe,
  ModeloNF,
  FinalidadeEmissao,
  IndicadorPresenca,
  PerfilSPED,
  MetodoAvaliacaoEstoque,
  SeveridadeAlerta,
  AnexoSimplesNacional,
  MetodoApuracaoLR,
};
