import api from './api';

// ============================================================
// Serviço de API Fiscal
// ============================================================

export interface CalcularImpostoPayload {
  produtoId: string;
  ncm: string;
  cest?: string;
  cfop: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  ufOrigem: string;
  ufDestino: string;
  tipoOperacao: string;
  regimeEmpresa: string;
  consumidorFinal?: boolean;
  contribuinteIcms?: boolean;
  pisCofinsCumulativo?: boolean;
}

export interface CalcularDASPayload {
  receitaBruta12Meses: number;
  receitaMes: number;
  anexo: string;
  fatorR?: number;
}

export const fiscalService = {
  // Cálculo de impostos
  calcularImpostos: (data: CalcularImpostoPayload) =>
    api.post('/fiscal/calcular-impostos', data),

  // Simples Nacional
  calcularDAS: (data: CalcularDASPayload) =>
    api.post('/fiscal/simples-nacional/calcular-das', data),

  compararRegimes: (data: { faturamentoAnual: number; uf: string }) =>
    api.post('/fiscal/simples-nacional/comparar-regimes', data),

  // Tabelas
  listarNCM: (params?: any) => api.get('/fiscal/tabelas/ncm', { params }),
  buscarNCM: (codigo: string) => api.get(`/fiscal/tabelas/ncm/${codigo}`),
  listarCFOP: (params?: any) => api.get('/fiscal/tabelas/cfop', { params }),
  buscarCFOP: (codigo: string) => api.get(`/fiscal/tabelas/cfop/${codigo}`),
  listarCSTICMS: () => api.get('/fiscal/tabelas/cst-icms'),
  listarCSTIPI: () => api.get('/fiscal/tabelas/cst-ipi'),
  listarCSTPISCOFINS: (tipoOperacao?: string) =>
    api.get('/fiscal/tabelas/cst-pis-cofins', { params: { tipoOperacao } }),
  listarAliquotasICMS: (ufOrigem?: string, ufDestino?: string) =>
    api.get('/fiscal/tabelas/icms-aliquotas', { params: { ufOrigem, ufDestino } }),

  // Matriz Tributária
  listarMatriz: (params?: any) => api.get('/fiscal/matriz', { params }),
  criarRegraMatriz: (data: any) => api.post('/fiscal/matriz', data),
  atualizarRegraMatriz: (id: string, data: any) => api.put(`/fiscal/matriz/${id}`, data),
  excluirRegraMatriz: (id: string) => api.delete(`/fiscal/matriz/${id}`),

  // Empresa Fiscal
  buscarEmpresaFiscal: (empresaId: string) =>
    api.get(`/fiscal/empresa-fiscal/${empresaId}`),
  configurarEmpresaFiscal: (data: any) => api.post('/fiscal/empresa-fiscal', data),

  // Estatísticas
  getEstatisticas: () => api.get('/fiscal/estatisticas'),
};

export default fiscalService;
