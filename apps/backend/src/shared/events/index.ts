/**
 * Eventos do sistema ERP SaaS
 * Usados para comunicacao assicrona entre modulos via RabbitMQ
 */

// Base event
export interface BaseEvent {
  tenantId: string;
  timestamp: string;
  userId?: string;
  correlationId?: string;
}

// Cadastros events
export interface ProdutoCriadoEvent extends BaseEvent {
  type: 'produto.criado';
  payload: {
    produtoId: string;
    codigoInterno: string;
    descricao: string;
  };
}

export interface ProdutoAtualizadoEvent extends BaseEvent {
  type: 'produto.atualizado';
  payload: {
    produtoId: string;
    camposAlterados: string[];
  };
}

export interface ClienteCriadoEvent extends BaseEvent {
  type: 'cliente.criado';
  payload: {
    clienteId: string;
    nome: string;
    cpfCnpj: string;
  };
}

export interface FornecedorCriadoEvent extends BaseEvent {
  type: 'fornecedor.criado';
  payload: {
    fornecedorId: string;
    razaoSocial: string;
    cpfCnpj: string;
  };
}

// Estoque events (futuro)
export interface EstoqueMovimentadoEvent extends BaseEvent {
  type: 'estoque.movimentado';
  payload: {
    produtoId: string;
    filialId: string;
    tipoMovimento: 'ENTRADA' | 'SAIDA' | 'TRANSFERENCIA' | 'AJUSTE';
    quantidade: number;
    estoqueAnterior: number;
    estoqueAtual: number;
  };
}

// Vendas events (futuro)
export interface VendaCriadaEvent extends BaseEvent {
  type: 'venda.criada';
  payload: {
    vendaId: string;
    clienteId: string;
    valorTotal: number;
  };
}

// NFe events (futuro)
export interface NfeEmitidaEvent extends BaseEvent {
  type: 'nfe.emitida';
  payload: {
    nfeId: string;
    chaveAcesso: string;
    numero: number;
    serie: number;
    valorTotal: number;
  };
}

// Union type
export type ErpEvent =
  | ProdutoCriadoEvent
  | ProdutoAtualizadoEvent
  | ClienteCriadoEvent
  | FornecedorCriadoEvent
  | EstoqueMovimentadoEvent
  | VendaCriadaEvent
  | NfeEmitidaEvent;

// Event names constants
export const ERP_EVENTS = {
  PRODUTO_CRIADO: 'produto.criado',
  PRODUTO_ATUALIZADO: 'produto.atualizado',
  CLIENTE_CRIADO: 'cliente.criado',
  FORNECEDOR_CRIADO: 'fornecedor.criado',
  ESTOQUE_MOVIMENTADO: 'estoque.movimentado',
  VENDA_CRIADA: 'venda.criada',
  NFE_EMITIDA: 'nfe.emitida',
} as const;
