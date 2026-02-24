import { useState, useEffect } from 'react';
import { cadastrosService } from '@/services/cadastros.service';
import { Settings2, Plus, X, RefreshCw } from 'lucide-react';

type TabKey = 'unidades' | 'categorias' | 'marcas' | 'fabricantes' | 'tabelasPreco' | 'formasPgto' | 'condicoesPgto' | 'bancos' | 'centrosCusto' | 'planoContas';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'unidades', label: 'Unidades' },
  { key: 'categorias', label: 'Categorias' },
  { key: 'marcas', label: 'Marcas' },
  { key: 'fabricantes', label: 'Fabricantes' },
  { key: 'tabelasPreco', label: 'Tab. Preco' },
  { key: 'formasPgto', label: 'F. Pagamento' },
  { key: 'condicoesPgto', label: 'C. Pagamento' },
  { key: 'bancos', label: 'Bancos' },
  { key: 'centrosCusto', label: 'C. Custo' },
  { key: 'planoContas', label: 'Pl. Contas' },
];

export default function CadastrosAuxiliaresPage() {
  const [tab, setTab] = useState<TabKey>('unidades');
  const [data, setData] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formFields, setFormFields] = useState<Record<string, string>>({});

  useEffect(() => { loadStats(); }, []);
  useEffect(() => { loadTab(); }, [tab]);

  const loadStats = async () => { try { setStats(await cadastrosService.estatisticas()); } catch {} };

  const loadTab = async () => {
    setLoading(true);
    try {
      const loaders: Record<TabKey, () => Promise<any>> = {
        unidades: cadastrosService.listarUnidades,
        categorias: cadastrosService.listarCategorias,
        marcas: cadastrosService.listarMarcas,
        fabricantes: cadastrosService.listarFabricantes,
        tabelasPreco: cadastrosService.listarTabelasPreco,
        formasPgto: cadastrosService.listarFormasPagamento,
        condicoesPgto: cadastrosService.listarCondicoesPagamento,
        bancos: cadastrosService.listarBancos,
        centrosCusto: cadastrosService.listarCentrosCusto,
        planoContas: cadastrosService.listarPlanoContas,
      };
      setData(await loaders[tab]());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fieldDefs: Record<TabKey, { name: string; label: string; required?: boolean }[]> = {
    unidades: [{ name: 'codigo', label: 'Codigo', required: true }, { name: 'descricao', label: 'Descricao', required: true }, { name: 'sigla', label: 'Sigla' }],
    categorias: [{ name: 'codigo', label: 'Codigo', required: true }, { name: 'descricao', label: 'Descricao', required: true }],
    marcas: [{ name: 'nome', label: 'Nome', required: true }],
    fabricantes: [{ name: 'nome', label: 'Nome', required: true }, { name: 'cnpj', label: 'CNPJ' }],
    tabelasPreco: [{ name: 'codigo', label: 'Codigo', required: true }, { name: 'descricao', label: 'Descricao', required: true }, { name: 'tipo', label: 'Tipo' }],
    formasPgto: [{ name: 'codigo', label: 'Codigo', required: true }, { name: 'descricao', label: 'Descricao', required: true }, { name: 'tipo', label: 'Tipo', required: true }],
    condicoesPgto: [{ name: 'codigo', label: 'Codigo', required: true }, { name: 'descricao', label: 'Descricao', required: true }, { name: 'numeroParcelas', label: 'Parcelas' }, { name: 'intervaloDias', label: 'Intervalo (dias)' }],
    bancos: [{ name: 'codigoFebraban', label: 'Cod. FEBRABAN', required: true }, { name: 'nome', label: 'Nome', required: true }, { name: 'nomeReduzido', label: 'Abreviatura' }],
    centrosCusto: [{ name: 'codigo', label: 'Codigo', required: true }, { name: 'descricao', label: 'Descricao', required: true }],
    planoContas: [{ name: 'codigo', label: 'Codigo', required: true }, { name: 'descricao', label: 'Descricao', required: true }, { name: 'tipo', label: 'Tipo', required: true }, { name: 'natureza', label: 'Natureza', required: true }],
  };

  const colDefs: Record<TabKey, string[]> = {
    unidades: ['codigo', 'descricao', 'sigla'],
    categorias: ['codigo', 'descricao'],
    marcas: ['nome'],
    fabricantes: ['nome', 'cnpj'],
    tabelasPreco: ['codigo', 'descricao', 'tipo', 'status'],
    formasPgto: ['codigo', 'descricao', 'tipo'],
    condicoesPgto: ['codigo', 'descricao', 'numeroParcelas', 'intervaloDias'],
    bancos: ['codigoFebraban', 'nome', 'nomeReduzido'],
    centrosCusto: ['codigo', 'descricao', 'status'],
    planoContas: ['codigo', 'descricao', 'tipo', 'natureza'],
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const creators: Record<TabKey, (d: any) => Promise<any>> = {
        unidades: cadastrosService.criarUnidade,
        categorias: cadastrosService.criarCategoria,
        marcas: cadastrosService.criarMarca,
        fabricantes: cadastrosService.criarFabricante,
        tabelasPreco: cadastrosService.criarTabelaPreco,
        formasPgto: cadastrosService.criarFormaPagamento,
        condicoesPgto: cadastrosService.criarCondicaoPagamento,
        bancos: cadastrosService.criarBanco,
        centrosCusto: cadastrosService.criarCentroCusto,
        planoContas: cadastrosService.criarPlanoConta,
      };
      const cleaned = { ...formFields };
      if (cleaned.numeroParcelas) (cleaned as any).numeroParcelas = parseInt(cleaned.numeroParcelas);
      if (cleaned.intervaloDias) (cleaned as any).intervaloDias = parseInt(cleaned.intervaloDias);
      Object.keys(cleaned).forEach(k => { if (!cleaned[k]) delete cleaned[k]; });
      await creators[tab](cleaned);
      setShowForm(false); setFormFields({}); loadTab(); loadStats();
    } catch (e: any) { alert(e.response?.data?.message || 'Erro ao criar registro'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Settings2 className="h-7 w-7" /> Cadastros Auxiliares</h1>
          <p className="text-muted-foreground">Tabelas de apoio: categorias, marcas, unidades, pagamento, bancos, plano de contas</p>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6 lg:grid-cols-11">
          {Object.entries(stats).map(([k, v]) => (
            <div key={k} className="rounded-lg border bg-card p-3 text-center">
              <p className="text-xs text-muted-foreground capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}</p>
              <p className="text-lg font-bold">{v as number}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-1 border-b">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`rounded-t-lg px-4 py-2 text-sm font-medium transition-colors ${tab === t.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{TABS.find(t => t.key === tab)?.label} ({data.length})</h3>
        <div className="flex gap-2">
          <button onClick={loadTab} className="rounded-lg border px-3 py-2 text-sm hover:bg-muted"><RefreshCw className="h-4 w-4" /></button>
          <button onClick={() => { setFormFields({}); setShowForm(true); }}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4" /> Novo
          </button>
        </div>
      </div>

      <div className="rounded-lg border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b bg-muted/50">
            {colDefs[tab].map(col => <th key={col} className="px-4 py-3 text-left font-medium capitalize">{col.replace(/([A-Z])/g, ' $1')}</th>)}
          </tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={colDefs[tab].length} className="px-4 py-8 text-center text-muted-foreground">Carregando...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={colDefs[tab].length} className="px-4 py-8 text-center text-muted-foreground">Nenhum registro</td></tr>
            ) : data.map((item: any, i: number) => (
              <tr key={item.id || i} className="border-b hover:bg-muted/30">
                {colDefs[tab].map(col => <td key={col} className="px-4 py-3">{item[col] ?? '-'}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-lg bg-card p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Novo {TABS.find(t => t.key === tab)?.label}</h2>
              <button onClick={() => setShowForm(false)}><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              {fieldDefs[tab].map(f => (
                <div key={f.name}>
                  <label className="text-xs font-medium">{f.label} {f.required && '*'}</label>
                  <input required={f.required} value={formFields[f.name] || ''}
                    onChange={e => setFormFields({...formFields, [f.name]: e.target.value})}
                    className="mt-1 w-full rounded border bg-background px-3 py-2 text-sm" />
                </div>
              ))}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">Cancelar</button>
                <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Criar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
