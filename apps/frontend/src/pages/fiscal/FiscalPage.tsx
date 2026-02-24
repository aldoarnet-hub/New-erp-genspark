import { useState, useEffect, useCallback } from 'react';
import fiscalService from '@/services/fiscal.service';

// ============================================================
// Pagina: Modulo Fiscal - Dashboard, Simulador e Tabelas
// ============================================================

const regimesLabel: Record<string, string> = {
  '1': 'Simples Nacional',
  '2': 'Simples Excesso',
  '3': 'Lucro Presumido / Real',
};

const ufs = [
  'AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT',
  'PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO',
];

type TabKey = 'simulador' | 'simples' | 'comparar' | 'tabelas' | 'estatisticas';

export default function FiscalPage() {
  // Simulador de Impostos
  const [simForm, setSimForm] = useState({
    ncm: '25232900', cfop: '5102', valorTotal: 350,
    ufOrigem: 'SP', ufDestino: 'SP',
    regimeEmpresa: '3', contribuinteIcms: true,
    consumidorFinal: false,
    pisCofinsCumulativo: true,
  });
  const [resultado, setResultado] = useState<any>(null);
  const [alertas, setAlertas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Simples Nacional
  const [snForm, setSnForm] = useState({
    receitaBruta12Meses: 500000, receitaMes: 45000, anexo: 'I',
  });
  const [snResultado, setSnResultado] = useState<any>(null);
  const [snLoading, setSnLoading] = useState(false);

  // Comparar Regimes
  const [compForm, setCompForm] = useState({ faturamentoAnual: 1000000, uf: 'SP' });
  const [compResultado, setCompResultado] = useState<any>(null);
  const [compLoading, setCompLoading] = useState(false);

  // Tabelas
  const [tabelaAtiva, setTabelaAtiva] = useState<'cst-icms' | 'cst-ipi' | 'cst-pis-cofins' | 'cfop' | 'ncm' | 'icms-aliquotas'>('cst-icms');
  const [tabelaDados, setTabelaDados] = useState<any[]>([]);
  const [tabelaLoading, setTabelaLoading] = useState(false);

  // Estatisticas
  const [stats, setStats] = useState<any>(null);

  const [activeTab, setActiveTab] = useState<TabKey>('simulador');

  // ================================================================
  // Simulador - via API Backend
  // ================================================================
  const simularImposto = async () => {
    setLoading(true);
    setError('');
    setResultado(null);
    setAlertas([]);
    try {
      const { data } = await fiscalService.calcularImpostos({
        produtoId: '550e8400-e29b-41d4-a716-446655440001',
        ncm: simForm.ncm,
        cfop: simForm.cfop,
        quantidade: 1,
        valorUnitario: simForm.valorTotal,
        valorTotal: simForm.valorTotal,
        ufOrigem: simForm.ufOrigem,
        ufDestino: simForm.ufDestino,
        tipoOperacao: 'S',
        regimeEmpresa: simForm.regimeEmpresa,
        consumidorFinal: simForm.consumidorFinal,
        contribuinteIcms: simForm.contribuinteIcms,
        pisCofinsCumulativo: simForm.pisCofinsCumulativo,
      });
      setResultado(data.resultado);
      setAlertas(data.alertas || []);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Erro ao calcular impostos');
    }
    setLoading(false);
  };

  // ================================================================
  // Simples Nacional - via API Backend
  // ================================================================
  const calcularSN = async () => {
    setSnLoading(true);
    try {
      const { data } = await fiscalService.calcularDAS({
        receitaBruta12Meses: snForm.receitaBruta12Meses,
        receitaMes: snForm.receitaMes,
        anexo: snForm.anexo,
      });
      setSnResultado(data);
    } catch (err: any) {
      console.error('Erro DAS:', err);
    }
    setSnLoading(false);
  };

  // ================================================================
  // Comparar Regimes - via API Backend
  // ================================================================
  const compararRegimesFn = async () => {
    setCompLoading(true);
    try {
      const { data } = await fiscalService.compararRegimes({
        faturamentoAnual: compForm.faturamentoAnual,
        uf: compForm.uf,
      });
      setCompResultado(data);
    } catch (err: any) {
      console.error('Erro comparar:', err);
    }
    setCompLoading(false);
  };

  // ================================================================
  // Tabelas Tributarias - via API Backend
  // ================================================================
  const carregarTabela = useCallback(async (tipo: string) => {
    setTabelaLoading(true);
    try {
      let resp;
      switch (tipo) {
        case 'cst-icms': resp = await fiscalService.listarCSTICMS(); break;
        case 'cst-ipi': resp = await fiscalService.listarCSTIPI(); break;
        case 'cst-pis-cofins': resp = await fiscalService.listarCSTPISCOFINS(); break;
        case 'cfop': resp = await fiscalService.listarCFOP({ limit: 100 }); break;
        case 'ncm': resp = await fiscalService.listarNCM({ limit: 100 }); break;
        case 'icms-aliquotas': resp = await fiscalService.listarAliquotasICMS(); break;
        default: resp = { data: [] };
      }
      const items = resp.data?.data || resp.data || [];
      setTabelaDados(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error('Erro tabela:', err);
      setTabelaDados([]);
    }
    setTabelaLoading(false);
  }, []);

  // ================================================================
  // Estatisticas - via API Backend
  // ================================================================
  const carregarStats = useCallback(async () => {
    try {
      const { data } = await fiscalService.getEstatisticas();
      setStats(data);
    } catch (err) {
      console.error('Erro stats:', err);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'tabelas') carregarTabela(tabelaAtiva);
    if (activeTab === 'estatisticas') carregarStats();
  }, [activeTab, tabelaAtiva, carregarTabela, carregarStats]);

  const fmt = (v: number) => v?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'R$ 0,00';
  const pct = (v: number) => `${v?.toFixed(2) || '0.00'}%`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Modulo Fiscal e Tributario</h1>
        <p className="text-gray-600 dark:text-gray-400">Compliance total com a legislacao brasileira</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {([
          { key: 'simulador', label: 'Simulador de Impostos' },
          { key: 'simples', label: 'Simples Nacional' },
          { key: 'comparar', label: 'Comparar Regimes' },
          { key: 'tabelas', label: 'Tabelas Tributarias' },
          { key: 'estatisticas', label: 'Estatisticas' },
        ] as { key: TabKey; label: string }[]).map((tab) => (
          <button key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >{tab.label}</button>
        ))}
      </div>

      {/* ================================================================ */}
      {/* TAB: Simulador de Impostos (API) */}
      {/* ================================================================ */}
      {activeTab === 'simulador' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold mb-4">Simulador de Calculo Tributario (Motor Tributario)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">NCM</label>
              <input type="text" value={simForm.ncm}
                onChange={e => setSimForm({ ...simForm, ncm: e.target.value })}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700"
                placeholder="Ex: 25232900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CFOP</label>
              <input type="text" value={simForm.cfop}
                onChange={e => setSimForm({ ...simForm, cfop: e.target.value })}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700"
                placeholder="Ex: 5102"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor (R$)</label>
              <input type="number" value={simForm.valorTotal}
                onChange={e => setSimForm({ ...simForm, valorTotal: +e.target.value })}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">UF Origem</label>
              <select value={simForm.ufOrigem}
                onChange={e => setSimForm({ ...simForm, ufOrigem: e.target.value })}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700">
                {ufs.map(uf => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">UF Destino</label>
              <select value={simForm.ufDestino}
                onChange={e => setSimForm({ ...simForm, ufDestino: e.target.value })}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700">
                {ufs.map(uf => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Regime</label>
              <select value={simForm.regimeEmpresa}
                onChange={e => setSimForm({ ...simForm, regimeEmpresa: e.target.value })}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700">
                {Object.entries(regimesLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-6 mb-4">
            <label className="flex items-center space-x-2">
              <input type="checkbox" checked={simForm.contribuinteIcms}
                onChange={e => setSimForm({ ...simForm, contribuinteIcms: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Contribuinte ICMS</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" checked={simForm.consumidorFinal}
                onChange={e => setSimForm({ ...simForm, consumidorFinal: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Consumidor Final</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" checked={simForm.pisCofinsCumulativo}
                onChange={e => setSimForm({ ...simForm, pisCofinsCumulativo: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">PIS/COFINS Cumulativo</span>
            </label>
          </div>
          <button onClick={simularImposto} disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50">
            {loading ? 'Calculando...' : 'Calcular Impostos'}
          </button>

          {error && (
            <div className="mt-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {resultado && (
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">ICMS (CST {resultado.icmsCst})</div>
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{fmt(resultado.icmsValor)}</div>
                  <div className="text-xs text-gray-500">Aliq: {pct(resultado.icmsAliquota)} | BC: {fmt(resultado.icmsBaseCalculo)}</div>
                  {resultado.icmsReducaoBc > 0 && <div className="text-xs text-orange-500">Reducao BC: {pct(resultado.icmsReducaoBc)}</div>}
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <div className="text-sm text-green-600 dark:text-green-400 font-medium">PIS (CST {resultado.pisCst})</div>
                  <div className="text-2xl font-bold text-green-700 dark:text-green-300">{fmt(resultado.pisValor)}</div>
                  <div className="text-xs text-gray-500">Aliq: {pct(resultado.pisAliquota)} | BC: {fmt(resultado.pisBaseCalculo)}</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">COFINS (CST {resultado.cofinsCst})</div>
                  <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{fmt(resultado.cofinsValor)}</div>
                  <div className="text-xs text-gray-500">Aliq: {pct(resultado.cofinsAliquota)} | BC: {fmt(resultado.cofinsBaseCalculo)}</div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                  <div className="text-sm text-red-600 dark:text-red-400 font-medium">Total Nota</div>
                  <div className="text-2xl font-bold text-red-700 dark:text-red-300">{fmt(resultado.valorTotalNota)}</div>
                  <div className="text-xs text-gray-500">
                    Impostos: {fmt(resultado.valorTotalImpostos)} ({resultado.valorTotalProdutos > 0 ? (resultado.valorTotalImpostos / resultado.valorTotalProdutos * 100).toFixed(1) : '0.0'}%)
                  </div>
                </div>
              </div>

              {/* Extra tax details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {resultado.ipiValor > 0 && (
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
                    <div className="text-sm text-orange-600 font-medium">IPI (CST {resultado.ipiCst})</div>
                    <div className="text-lg font-bold text-orange-700">{fmt(resultado.ipiValor)}</div>
                    <div className="text-xs text-gray-500">Aliq: {pct(resultado.ipiAliquota)}</div>
                  </div>
                )}
                {resultado.icmsStValor > 0 && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3">
                    <div className="text-sm text-amber-600 font-medium">ICMS-ST</div>
                    <div className="text-lg font-bold text-amber-700">{fmt(resultado.icmsStValor)}</div>
                    <div className="text-xs text-gray-500">MVA: {pct(resultado.icmsStMva)} | BC: {fmt(resultado.icmsStBaseCalculo)}</div>
                  </div>
                )}
                {resultado.issValor > 0 && (
                  <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-3">
                    <div className="text-sm text-teal-600 font-medium">ISS {resultado.issRetido ? '(Retido)' : ''}</div>
                    <div className="text-lg font-bold text-teal-700">{fmt(resultado.issValor)}</div>
                    <div className="text-xs text-gray-500">Aliq: {pct(resultado.issAliquota)}</div>
                  </div>
                )}
              </div>

              {resultado.difalAplica && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 text-sm text-yellow-700 dark:text-yellow-300">
                  DIFAL aplicavel (EC 87/2015): Valor: {fmt(resultado.difalValor)} | FCP: {fmt(resultado.fcpValor)} | Aliq Interna: {pct(resultado.difalAliqInterna)} | Aliq Inter: {pct(resultado.difalAliqInter)}
                </div>
              )}

              {resultado.snCsosn && (
                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-3 text-sm text-indigo-700 dark:text-indigo-300">
                  Simples Nacional - CSOSN: {resultado.snCsosn} | Aliquota: {pct(resultado.snAliquota || 0)} | Credito: {fmt(resultado.snCredito || 0)}
                </div>
              )}

              {alertas.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Alertas de Validacao:</h3>
                  {alertas.map((a: any, i: number) => (
                    <div key={i} className={`p-2 rounded text-sm ${
                      a.severidade === 'erro' ? 'bg-red-50 text-red-700' :
                      a.severidade === 'alerta' ? 'bg-yellow-50 text-yellow-700' :
                      'bg-blue-50 text-blue-700'
                    }`}>
                      [{a.severidade?.toUpperCase()}] {a.campo}: {a.mensagem}
                    </div>
                  ))}
                </div>
              )}

              {resultado.observacoes?.length > 0 && (
                <div className="text-sm text-gray-500 italic">
                  Obs: {resultado.observacoes.join(' | ')}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ================================================================ */}
      {/* TAB: Simples Nacional (API) */}
      {/* ================================================================ */}
      {activeTab === 'simples' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold mb-4">Calculo DAS - Simples Nacional (LC 123/2006)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Receita Bruta 12m (R$)</label>
              <input type="number" value={snForm.receitaBruta12Meses}
                onChange={e => setSnForm({ ...snForm, receitaBruta12Meses: +e.target.value })}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Receita do Mes (R$)</label>
              <input type="number" value={snForm.receitaMes}
                onChange={e => setSnForm({ ...snForm, receitaMes: +e.target.value })}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Anexo</label>
              <select value={snForm.anexo}
                onChange={e => setSnForm({ ...snForm, anexo: e.target.value })}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700">
                <option value="I">Anexo I - Comercio</option>
                <option value="II">Anexo II - Industria</option>
                <option value="III">Anexo III - Servicos</option>
                <option value="IV">Anexo IV - Servicos (ISS)</option>
                <option value="V">Anexo V - Servicos</option>
              </select>
            </div>
          </div>
          <button onClick={calcularSN} disabled={snLoading}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50">
            {snLoading ? 'Calculando...' : 'Calcular DAS'}
          </button>

          {snResultado && (
            <div className="mt-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-sm text-gray-500">Faixa</div>
                  <div className="text-2xl font-bold">{snResultado.faixa}a</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-sm text-gray-500">Aliq. Tabela</div>
                  <div className="text-2xl font-bold">{snResultado.aliquotaTabela}%</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-sm text-gray-500">Desconto</div>
                  <div className="text-2xl font-bold">{fmt(snResultado.desconto)}</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                  <div className="text-sm text-blue-600">Aliq. Efetiva</div>
                  <div className="text-2xl font-bold text-blue-700">{snResultado.aliquotaEfetiva}%</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                  <div className="text-sm text-green-600">Valor DAS</div>
                  <div className="text-2xl font-bold text-green-700">{fmt(snResultado.valorDas)}</div>
                </div>
              </div>

              {snResultado.reparticao && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Reparticao do DAS:</h3>
                  <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
                    {Object.entries(snResultado.reparticao).map(([k, v]) => (
                      <div key={k} className="text-center">
                        <div className="text-xs text-gray-500 uppercase">{k}</div>
                        <div className="text-sm font-bold">{fmt(v as number)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ================================================================ */}
      {/* TAB: Comparar Regimes (API) */}
      {/* ================================================================ */}
      {activeTab === 'comparar' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold mb-4">Comparativo de Regimes Tributarios</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Faturamento Anual (R$)</label>
              <input type="number" value={compForm.faturamentoAnual}
                onChange={e => setCompForm({ ...compForm, faturamentoAnual: +e.target.value })}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">UF</label>
              <select value={compForm.uf}
                onChange={e => setCompForm({ ...compForm, uf: e.target.value })}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700">
                {ufs.map(uf => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            </div>
          </div>
          <button onClick={compararRegimesFn} disabled={compLoading}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50">
            {compLoading ? 'Comparando...' : 'Comparar Regimes'}
          </button>

          {compResultado && (
            <div className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {[
                  { key: 'simples', label: 'Simples Nacional', valor: compResultado.comparacao?.simples?.totalAnual, cor: 'blue' },
                  { key: 'presumido', label: 'Lucro Presumido', valor: compResultado.comparacao?.presumido?.totalAnual, cor: 'green' },
                  { key: 'real', label: 'Lucro Real', valor: compResultado.comparacao?.real?.totalAnual, cor: 'purple' },
                ].map(r => (
                  <div key={r.key} className={`rounded-lg p-4 border-2 ${
                    compResultado.recomendacao === r.key ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/10' : 'border-gray-200 dark:border-gray-600'
                  }`}>
                    <div className="text-sm font-medium text-gray-500">{r.label}</div>
                    <div className="text-2xl font-bold mt-1">{fmt(r.valor)}</div>
                    <div className="text-xs text-gray-500 mt-1">{compForm.faturamentoAnual > 0 ? (r.valor / compForm.faturamentoAnual * 100).toFixed(1) : '0'}% do faturamento</div>
                    {compResultado.recomendacao === r.key && (
                      <span className="inline-block mt-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded">
                        RECOMENDADO
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                <span className="text-green-700 dark:text-green-300 font-medium">
                  Economia potencial: {fmt(compResultado.economiaPotencial)}/ano
                  escolhendo {compResultado.recomendacao}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================================================================ */}
      {/* TAB: Tabelas Tributarias (API) */}
      {/* ================================================================ */}
      {activeTab === 'tabelas' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold mb-4">Tabelas Tributarias de Referencia</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {([
              { key: 'cst-icms', label: 'CST ICMS' },
              { key: 'cst-ipi', label: 'CST IPI' },
              { key: 'cst-pis-cofins', label: 'CST PIS/COFINS' },
              { key: 'cfop', label: 'CFOP' },
              { key: 'ncm', label: 'NCM' },
              { key: 'icms-aliquotas', label: 'Aliquotas ICMS' },
            ] as { key: typeof tabelaAtiva; label: string }[]).map((t) => (
              <button key={t.key} onClick={() => setTabelaAtiva(t.key)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                  tabelaAtiva === t.key ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}>{t.label}</button>
            ))}
          </div>

          {tabelaLoading ? (
            <div className="text-center py-10 text-gray-500">Carregando...</div>
          ) : tabelaDados.length === 0 ? (
            <div className="text-center py-10 text-gray-500">Nenhum dado encontrado</div>
          ) : (
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700 sticky top-0">
                  <tr>
                    {tabelaAtiva === 'cst-icms' && <><th className="px-3 py-2">Codigo</th><th className="px-3 py-2">Descricao</th><th className="px-3 py-2">Tipo</th><th className="px-3 py-2">Tributado</th><th className="px-3 py-2">ST</th></>}
                    {tabelaAtiva === 'cst-ipi' && <><th className="px-3 py-2">Codigo</th><th className="px-3 py-2">Descricao</th><th className="px-3 py-2">Tipo</th><th className="px-3 py-2">Tributado</th></>}
                    {tabelaAtiva === 'cst-pis-cofins' && <><th className="px-3 py-2">Codigo</th><th className="px-3 py-2">Descricao</th><th className="px-3 py-2">Operacao</th><th className="px-3 py-2">Tributado</th></>}
                    {tabelaAtiva === 'cfop' && <><th className="px-3 py-2">CFOP</th><th className="px-3 py-2">Descricao</th><th className="px-3 py-2">Tipo</th><th className="px-3 py-2">Venda</th><th className="px-3 py-2">Interno</th></>}
                    {tabelaAtiva === 'ncm' && <><th className="px-3 py-2">NCM</th><th className="px-3 py-2">Descricao</th><th className="px-3 py-2">Cap.</th><th className="px-3 py-2">IPI Saida</th></>}
                    {tabelaAtiva === 'icms-aliquotas' && <><th className="px-3 py-2">Origem</th><th className="px-3 py-2">Destino</th><th className="px-3 py-2">Interna</th><th className="px-3 py-2">Inter</th><th className="px-3 py-2">FCP</th></>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {tabelaDados.map((item: any, i: number) => (
                    <tr key={item.id || i} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                      {tabelaAtiva === 'cst-icms' && <><td className="px-3 py-2 font-mono font-bold">{item.cstCodigo}</td><td className="px-3 py-2">{item.descricao}</td><td className="px-3 py-2">{item.tipo}</td><td className="px-3 py-2">{item.tributado ? 'Sim' : 'Nao'}</td><td className="px-3 py-2">{item.st ? 'Sim' : '-'}</td></>}
                      {tabelaAtiva === 'cst-ipi' && <><td className="px-3 py-2 font-mono font-bold">{item.cstCodigo}</td><td className="px-3 py-2">{item.descricao}</td><td className="px-3 py-2">{item.tipo}</td><td className="px-3 py-2">{item.tributado ? 'Sim' : 'Nao'}</td></>}
                      {tabelaAtiva === 'cst-pis-cofins' && <><td className="px-3 py-2 font-mono font-bold">{item.cstCodigo}</td><td className="px-3 py-2">{item.descricao}</td><td className="px-3 py-2">{item.tipoOperacao}</td><td className="px-3 py-2">{item.tributado ? 'Sim' : 'Nao'}</td></>}
                      {tabelaAtiva === 'cfop' && <><td className="px-3 py-2 font-mono font-bold">{item.cfopCodigo}</td><td className="px-3 py-2 max-w-xs truncate">{item.descricaoResumida || item.descricao}</td><td className="px-3 py-2">{item.tipoOperacao === 'S' ? 'Saida' : 'Entrada'}</td><td className="px-3 py-2">{item.venda ? 'Sim' : '-'}</td><td className="px-3 py-2">{item.interno ? 'Sim' : '-'}</td></>}
                      {tabelaAtiva === 'ncm' && <><td className="px-3 py-2 font-mono font-bold">{item.ncmCodigo}</td><td className="px-3 py-2 max-w-xs truncate">{item.descricao}</td><td className="px-3 py-2">{item.capitulo}</td><td className="px-3 py-2">{item.ipiAliqSaida}%</td></>}
                      {tabelaAtiva === 'icms-aliquotas' && <><td className="px-3 py-2 font-mono font-bold">{item.ufOrigem}</td><td className="px-3 py-2 font-mono font-bold">{item.ufDestino}</td><td className="px-3 py-2">{item.aliqInterna}%</td><td className="px-3 py-2">{item.aliqInterestadual}%</td><td className="px-3 py-2">{item.aliqFcp}%</td></>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="mt-2 text-xs text-gray-500">{tabelaDados.length} registros carregados</div>
        </div>
      )}

      {/* ================================================================ */}
      {/* TAB: Estatisticas (API) */}
      {/* ================================================================ */}
      {activeTab === 'estatisticas' && (
        <div className="space-y-4">
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(stats.tabelasCarregadas || {}).map(([k, v]) => (
                <div key={k} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 text-center">
                  <div className="text-3xl font-bold text-blue-600">{v as number}</div>
                  <div className="text-sm text-gray-500 mt-1">{k.replace(/([A-Z])/g, ' $1').toUpperCase()}</div>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="font-medium text-gray-900 dark:text-white">Impostos Suportados</h3>
              <ul className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>ICMS (proprio + DIFAL + FCP)</li>
                <li>ICMS-ST (MVA + Pauta)</li>
                <li>IPI</li>
                <li>PIS (Cumulativo / Nao-Cumulativo)</li>
                <li>COFINS (Cumulativo / Nao-Cumulativo)</li>
                <li>ISS</li>
                <li>Simples Nacional (Anexos I-V)</li>
              </ul>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="font-medium text-gray-900 dark:text-white">Funcionalidades</h3>
              <ul className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>Motor Tributario com Matriz de Prioridades</li>
                <li>Calculo DAS com Reparticao por Tributo</li>
                <li>Comparativo de Regimes (SN x LP x LR)</li>
                <li>Validador de Consistencia Fiscal</li>
                <li>Tabelas de Referencia (NCM, CFOP, CST, CEST)</li>
                <li>ICMS Interestadual + DIFAL + FCP</li>
                <li>Suporte a ICMS-ST com MVA</li>
              </ul>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="font-medium text-gray-900 dark:text-white">Legislacao Referencia</h3>
              <ul className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>CF art. 155-159</li>
                <li>CTN (Lei 5.172/1966)</li>
                <li>LC 87/1996 (ICMS)</li>
                <li>LC 123/2006 (Simples)</li>
                <li>Lei 10.833/2003 (PIS/COFINS)</li>
                <li>EC 87/2015 (DIFAL)</li>
                <li>Decreto 7.212/2010 (IPI)</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
