import api from './api';

// ======================== Produtos ========================
export const produtosService = {
  listar: (params?: any) => api.get('/produtos', { params }).then(r => r.data),
  buscar: (id: string) => api.get(`/produtos/${id}`).then(r => r.data),
  buscarCompleto: (id: string) => api.get(`/produtos/${id}/completo`).then(r => r.data),
  criar: (data: any) => api.post('/produtos', data).then(r => r.data),
  atualizar: (id: string, data: any) => api.put(`/produtos/${id}`, data).then(r => r.data),
  inativar: (id: string) => api.delete(`/produtos/${id}`).then(r => r.data),
  estatisticas: () => api.get('/produtos/estatisticas').then(r => r.data),
  // Precos
  listarPrecos: (id: string) => api.get(`/produtos/${id}/precos`).then(r => r.data),
  atualizarPreco: (id: string, data: any) => api.post(`/produtos/${id}/precos`, data).then(r => r.data),
  removerPreco: (id: string, precoId: string) => api.delete(`/produtos/${id}/precos/${precoId}`).then(r => r.data),
  // Estoque
  buscarEstoque: (id: string) => api.get(`/produtos/${id}/estoque`).then(r => r.data),
  // Composicao
  listarComposicao: (id: string) => api.get(`/produtos/${id}/composicao`).then(r => r.data),
  addComponente: (id: string, data: any) => api.post(`/produtos/${id}/composicao`, data).then(r => r.data),
  removerComponente: (id: string, cId: string) => api.delete(`/produtos/${id}/composicao/${cId}`).then(r => r.data),
  // Similares
  listarSimilares: (id: string) => api.get(`/produtos/${id}/similares`).then(r => r.data),
  addSimilar: (id: string, data: any) => api.post(`/produtos/${id}/similares`, data).then(r => r.data),
  removerSimilar: (id: string, sId: string) => api.delete(`/produtos/${id}/similares/${sId}`).then(r => r.data),
  // Aplicacoes
  listarAplicacoes: (id: string) => api.get(`/produtos/${id}/aplicacoes`).then(r => r.data),
  addAplicacao: (id: string, data: any) => api.post(`/produtos/${id}/aplicacoes`, data).then(r => r.data),
  removerAplicacao: (id: string, aId: string) => api.delete(`/produtos/${id}/aplicacoes/${aId}`).then(r => r.data),
  // Midias
  listarMidias: (id: string) => api.get(`/produtos/${id}/midias`).then(r => r.data),
  addMidia: (id: string, data: any) => api.post(`/produtos/${id}/midias`, data).then(r => r.data),
  removerMidia: (id: string, mId: string) => api.delete(`/produtos/${id}/midias/${mId}`).then(r => r.data),
};

// ======================== Clientes ========================
export const clientesService = {
  listar: (params?: any) => api.get('/clientes', { params }).then(r => r.data),
  buscar: (id: string) => api.get(`/clientes/${id}`).then(r => r.data),
  buscarCompleto: (id: string) => api.get(`/clientes/${id}/completo`).then(r => r.data),
  criar: (data: any) => api.post('/clientes', data).then(r => r.data),
  atualizar: (id: string, data: any) => api.put(`/clientes/${id}`, data).then(r => r.data),
  inativar: (id: string) => api.delete(`/clientes/${id}`).then(r => r.data),
  estatisticas: () => api.get('/clientes/estatisticas').then(r => r.data),
  // Enderecos
  listarEnderecos: (id: string) => api.get(`/clientes/${id}/enderecos`).then(r => r.data),
  addEndereco: (id: string, data: any) => api.post(`/clientes/${id}/enderecos`, data).then(r => r.data),
  atualizarEndereco: (id: string, eId: string, data: any) => api.put(`/clientes/${id}/enderecos/${eId}`, data).then(r => r.data),
  removerEndereco: (id: string, eId: string) => api.delete(`/clientes/${id}/enderecos/${eId}`).then(r => r.data),
  // Contatos
  listarContatos: (id: string) => api.get(`/clientes/${id}/contatos`).then(r => r.data),
  addContato: (id: string, data: any) => api.post(`/clientes/${id}/contatos`, data).then(r => r.data),
  atualizarContato: (id: string, cId: string, data: any) => api.put(`/clientes/${id}/contatos/${cId}`, data).then(r => r.data),
  removerContato: (id: string, cId: string) => api.delete(`/clientes/${id}/contatos/${cId}`).then(r => r.data),
  // Limites
  listarLimites: (id: string) => api.get(`/clientes/${id}/limites`).then(r => r.data),
  addLimite: (id: string, data: any) => api.post(`/clientes/${id}/limites`, data).then(r => r.data),
};

// ======================== Fornecedores ========================
export const fornecedoresService = {
  listar: (params?: any) => api.get('/fornecedores', { params }).then(r => r.data),
  buscar: (id: string) => api.get(`/fornecedores/${id}`).then(r => r.data),
  buscarCompleto: (id: string) => api.get(`/fornecedores/${id}/completo`).then(r => r.data),
  criar: (data: any) => api.post('/fornecedores', data).then(r => r.data),
  atualizar: (id: string, data: any) => api.put(`/fornecedores/${id}`, data).then(r => r.data),
  inativar: (id: string) => api.delete(`/fornecedores/${id}`).then(r => r.data),
  estatisticas: () => api.get('/fornecedores/estatisticas').then(r => r.data),
  listarAvaliacoes: (id: string) => api.get(`/fornecedores/${id}/avaliacoes`).then(r => r.data),
  avaliar: (id: string, data: any) => api.post(`/fornecedores/${id}/avaliacoes`, data).then(r => r.data),
};

// ======================== Transportadoras ========================
export const transportadorasService = {
  listar: (params?: any) => api.get('/transportadoras', { params }).then(r => r.data),
  buscar: (id: string) => api.get(`/transportadoras/${id}`).then(r => r.data),
  criar: (data: any) => api.post('/transportadoras', data).then(r => r.data),
  atualizar: (id: string, data: any) => api.put(`/transportadoras/${id}`, data).then(r => r.data),
  inativar: (id: string) => api.delete(`/transportadoras/${id}`).then(r => r.data),
};

// ======================== Vendedores ========================
export const vendedoresService = {
  listar: (params?: any) => api.get('/vendedores', { params }).then(r => r.data),
  buscar: (id: string) => api.get(`/vendedores/${id}`).then(r => r.data),
  criar: (data: any) => api.post('/vendedores', data).then(r => r.data),
  atualizar: (id: string, data: any) => api.put(`/vendedores/${id}`, data).then(r => r.data),
  inativar: (id: string) => api.delete(`/vendedores/${id}`).then(r => r.data),
  listarCarteira: (id: string) => api.get(`/vendedores/${id}/carteira`).then(r => r.data),
  addClienteCarteira: (id: string, data: any) => api.post(`/vendedores/${id}/carteira`, data).then(r => r.data),
  removerClienteCarteira: (id: string, cId: string) => api.delete(`/vendedores/${id}/carteira/${cId}`).then(r => r.data),
};

// ======================== Cadastros Auxiliares ========================
export const cadastrosService = {
  // Unidades
  listarUnidades: () => api.get('/cadastros/unidades').then(r => r.data),
  criarUnidade: (data: any) => api.post('/cadastros/unidades', data).then(r => r.data),
  // Categorias
  listarCategorias: () => api.get('/cadastros/categorias').then(r => r.data),
  criarCategoria: (data: any) => api.post('/cadastros/categorias', data).then(r => r.data),
  // Marcas
  listarMarcas: () => api.get('/cadastros/marcas').then(r => r.data),
  criarMarca: (data: any) => api.post('/cadastros/marcas', data).then(r => r.data),
  // Fabricantes
  listarFabricantes: () => api.get('/cadastros/fabricantes').then(r => r.data),
  criarFabricante: (data: any) => api.post('/cadastros/fabricantes', data).then(r => r.data),
  // Tabelas Preco
  listarTabelasPreco: () => api.get('/cadastros/tabelas-preco').then(r => r.data),
  criarTabelaPreco: (data: any) => api.post('/cadastros/tabelas-preco', data).then(r => r.data),
  // Formas Pagamento
  listarFormasPagamento: () => api.get('/cadastros/formas-pagamento').then(r => r.data),
  criarFormaPagamento: (data: any) => api.post('/cadastros/formas-pagamento', data).then(r => r.data),
  // Condicoes Pagamento
  listarCondicoesPagamento: () => api.get('/cadastros/condicoes-pagamento').then(r => r.data),
  criarCondicaoPagamento: (data: any) => api.post('/cadastros/condicoes-pagamento', data).then(r => r.data),
  // Bancos
  listarBancos: () => api.get('/cadastros/bancos').then(r => r.data),
  criarBanco: (data: any) => api.post('/cadastros/bancos', data).then(r => r.data),
  // Contas Bancarias
  listarContasBancarias: () => api.get('/cadastros/contas-bancarias').then(r => r.data),
  criarContaBancaria: (data: any) => api.post('/cadastros/contas-bancarias', data).then(r => r.data),
  // Centros de Custo
  listarCentrosCusto: () => api.get('/cadastros/centros-custo').then(r => r.data),
  criarCentroCusto: (data: any) => api.post('/cadastros/centros-custo', data).then(r => r.data),
  // Plano de Contas
  listarPlanoContas: () => api.get('/cadastros/plano-contas').then(r => r.data),
  criarPlanoConta: (data: any) => api.post('/cadastros/plano-contas', data).then(r => r.data),
  // CEP
  consultarCEP: (cep: string) => api.get(`/cadastros/cep/${cep}`).then(r => r.data),
  // Estatisticas
  estatisticas: () => api.get('/cadastros/estatisticas').then(r => r.data),
  // Auditoria
  auditoriaRecente: () => api.get('/cadastros/auditoria').then(r => r.data),
  auditoriaEstatisticas: () => api.get('/cadastros/auditoria/estatisticas').then(r => r.data),
  auditoriaPorRegistro: (tabela: string, id: string) => api.get(`/cadastros/auditoria/${tabela}/${id}`).then(r => r.data),
};
