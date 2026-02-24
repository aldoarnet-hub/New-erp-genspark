export enum Permissao {
  // Dashboard
  DASHBOARD_VISUALIZAR = 'dashboard:visualizar',

  // Produtos
  PRODUTO_VISUALIZAR = 'produto:visualizar',
  PRODUTO_CRIAR = 'produto:criar',
  PRODUTO_EDITAR = 'produto:editar',
  PRODUTO_EXCLUIR = 'produto:excluir',

  // Vendas
  VENDA_VISUALIZAR = 'venda:visualizar',
  VENDA_CRIAR = 'venda:criar',
  VENDA_EDITAR = 'venda:editar',
  VENDA_CANCELAR = 'venda:cancelar',
  VENDA_EXCLUIR = 'venda:excluir',

  // Clientes
  CLIENTE_VISUALIZAR = 'cliente:visualizar',
  CLIENTE_CRIAR = 'cliente:criar',
  CLIENTE_EDITAR = 'cliente:editar',
  CLIENTE_EXCLUIR = 'cliente:excluir',

  // Estoque
  ESTOQUE_VISUALIZAR = 'estoque:visualizar',
  ESTOQUE_MOVIMENTAR = 'estoque:movimentar',
  ESTOQUE_INVENTARIO = 'estoque:inventario',

  // Financeiro
  FINANCEIRO_VISUALIZAR = 'financeiro:visualizar',
  FINANCEIRO_LANCAMENTO = 'financeiro:lancamento',
  FINANCEIRO_BAIXA = 'financeiro:baixa',

  // Compras
  COMPRA_VISUALIZAR = 'compra:visualizar',
  COMPRA_CRIAR = 'compra:criar',
  COMPRA_EDITAR = 'compra:editar',
  COMPRA_APROVAR = 'compra:aprovar',

  // Fiscal
  FISCAL_VISUALIZAR = 'fiscal:visualizar',
  FISCAL_EMITIR = 'fiscal:emitir',
  FISCAL_CANCELAR = 'fiscal:cancelar',

  // Configuracoes
  CONFIG_VISUALIZAR = 'config:visualizar',
  CONFIG_USUARIOS = 'config:usuarios',
  CONFIG_PERMISSOES = 'config:permissoes',
  CONFIG_EMPRESA = 'config:empresa',
  CONFIG_TENANT = 'config:tenant',
}

export const PERFIS = {
  SUPER_ADMIN: Object.values(Permissao),

  ADMIN: [
    Permissao.DASHBOARD_VISUALIZAR,
    Permissao.PRODUTO_VISUALIZAR,
    Permissao.PRODUTO_CRIAR,
    Permissao.PRODUTO_EDITAR,
    Permissao.PRODUTO_EXCLUIR,
    Permissao.VENDA_VISUALIZAR,
    Permissao.VENDA_CRIAR,
    Permissao.VENDA_EDITAR,
    Permissao.VENDA_CANCELAR,
    Permissao.VENDA_EXCLUIR,
    Permissao.CLIENTE_VISUALIZAR,
    Permissao.CLIENTE_CRIAR,
    Permissao.CLIENTE_EDITAR,
    Permissao.CLIENTE_EXCLUIR,
    Permissao.ESTOQUE_VISUALIZAR,
    Permissao.ESTOQUE_MOVIMENTAR,
    Permissao.ESTOQUE_INVENTARIO,
    Permissao.FINANCEIRO_VISUALIZAR,
    Permissao.FINANCEIRO_LANCAMENTO,
    Permissao.FINANCEIRO_BAIXA,
    Permissao.COMPRA_VISUALIZAR,
    Permissao.COMPRA_CRIAR,
    Permissao.COMPRA_EDITAR,
    Permissao.COMPRA_APROVAR,
    Permissao.FISCAL_VISUALIZAR,
    Permissao.FISCAL_EMITIR,
    Permissao.FISCAL_CANCELAR,
    Permissao.CONFIG_VISUALIZAR,
    Permissao.CONFIG_USUARIOS,
    Permissao.CONFIG_PERMISSOES,
    Permissao.CONFIG_EMPRESA,
  ],

  GERENTE: [
    Permissao.DASHBOARD_VISUALIZAR,
    Permissao.PRODUTO_VISUALIZAR,
    Permissao.PRODUTO_CRIAR,
    Permissao.PRODUTO_EDITAR,
    Permissao.VENDA_VISUALIZAR,
    Permissao.VENDA_CRIAR,
    Permissao.VENDA_EDITAR,
    Permissao.VENDA_CANCELAR,
    Permissao.CLIENTE_VISUALIZAR,
    Permissao.CLIENTE_CRIAR,
    Permissao.CLIENTE_EDITAR,
    Permissao.ESTOQUE_VISUALIZAR,
    Permissao.ESTOQUE_MOVIMENTAR,
    Permissao.FINANCEIRO_VISUALIZAR,
    Permissao.FINANCEIRO_LANCAMENTO,
    Permissao.FINANCEIRO_BAIXA,
    Permissao.COMPRA_VISUALIZAR,
    Permissao.COMPRA_CRIAR,
    Permissao.COMPRA_EDITAR,
    Permissao.COMPRA_APROVAR,
    Permissao.FISCAL_VISUALIZAR,
    Permissao.FISCAL_EMITIR,
  ],

  VENDEDOR: [
    Permissao.DASHBOARD_VISUALIZAR,
    Permissao.PRODUTO_VISUALIZAR,
    Permissao.VENDA_VISUALIZAR,
    Permissao.VENDA_CRIAR,
    Permissao.VENDA_EDITAR,
    Permissao.CLIENTE_VISUALIZAR,
    Permissao.CLIENTE_CRIAR,
    Permissao.CLIENTE_EDITAR,
  ],

  ESTOQUISTA: [
    Permissao.PRODUTO_VISUALIZAR,
    Permissao.ESTOQUE_VISUALIZAR,
    Permissao.ESTOQUE_MOVIMENTAR,
    Permissao.ESTOQUE_INVENTARIO,
  ],

  FINANCEIRO: [
    Permissao.DASHBOARD_VISUALIZAR,
    Permissao.FINANCEIRO_VISUALIZAR,
    Permissao.FINANCEIRO_LANCAMENTO,
    Permissao.FINANCEIRO_BAIXA,
    Permissao.FISCAL_VISUALIZAR,
  ],

  COMPRADOR: [
    Permissao.DASHBOARD_VISUALIZAR,
    Permissao.PRODUTO_VISUALIZAR,
    Permissao.COMPRA_VISUALIZAR,
    Permissao.COMPRA_CRIAR,
    Permissao.COMPRA_EDITAR,
    Permissao.ESTOQUE_VISUALIZAR,
  ],
};

export type PerfilUsuario = keyof typeof PERFIS;
