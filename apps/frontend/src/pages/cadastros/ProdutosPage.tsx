import { useState, useEffect } from 'react';
import { produtosService, cadastrosService } from '@/services/cadastros.service';
import { Package, Plus, Search, Filter, BarChart3, Edit2, Trash2, Eye, X } from 'lucide-react';

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [marcas, setMarcas] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('');

  const [form, setForm] = useState({
    codigoInterno: '', descricao: '', codigoBarras: '', categoriaId: '', marcaId: '',
    tipoProduto: 'SIMPLES', ncm: '', custoMedio: '', markupPadrao: '', estoqueMinimo: '',
    pesoLiquidoKg: '', pesoBrutoKg: '', alturaCm: '', larguraCm: '', profundidadeCm: '',
    material: '', cor: '',
  });

  useEffect(() => {
    loadData();
    loadAux();
  }, []);

  useEffect(() => { loadProdutos(); }, [page, search, filterStatus, filterCategoria]);

  const loadData = async () => {
    try {
      const s = await produtosService.estatisticas();
      setStats(s);
    } catch (e) { console.error(e); }
  };

  const loadAux = async () => {
    try {
      const [cats, mrcs] = await Promise.all([
        cadastrosService.listarCategorias(),
        cadastrosService.listarMarcas(),
      ]);
      setCategorias(cats);
      setMarcas(mrcs);
    } catch (e) { console.error(e); }
  };

  const loadProdutos = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 15 };
      if (search) params.search = search;
      if (filterStatus) params.status = filterStatus;
      if (filterCategoria) params.categoriaId = filterCategoria;
      const res = await produtosService.listar(params);
      setProdutos(res.data);
      setTotal(res.total);
      setPages(res.pages);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data: any = { ...form };
      if (data.custoMedio) data.custoMedio = parseFloat(data.custoMedio);
      if (data.markupPadrao) data.markupPadrao = parseFloat(data.markupPadrao);
      if (data.estoqueMinimo) data.estoqueMinimo = parseFloat(data.estoqueMinimo);
      if (data.pesoLiquidoKg) data.pesoLiquidoKg = parseFloat(data.pesoLiquidoKg);
      if (data.pesoBrutoKg) data.pesoBrutoKg = parseFloat(data.pesoBrutoKg);
      if (data.alturaCm) data.alturaCm = parseFloat(data.alturaCm);
      if (data.larguraCm) data.larguraCm = parseFloat(data.larguraCm);
      if (data.profundidadeCm) data.profundidadeCm = parseFloat(data.profundidadeCm);
      // Clean empty strings
      Object.keys(data).forEach(k => { if (data[k] === '') delete data[k]; });

      if (editingProduct) {
        await produtosService.atualizar(editingProduct.id, data);
      } else {
        await produtosService.criar(data);
      }
      setShowForm(false);
      setEditingProduct(null);
      resetForm();
      loadProdutos();
      loadData();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Erro ao salvar produto');
    }
  };

  const handleEdit = (p: any) => {
    setForm({
      codigoInterno: p.codigoInterno || '', descricao: p.descricao || '',
      codigoBarras: p.codigoBarras || '', categoriaId: p.categoriaId || '',
      marcaId: p.marcaId || '', tipoProduto: p.tipoProduto || 'SIMPLES',
      ncm: p.ncm || '', custoMedio: p.custoMedio?.toString() || '',
      markupPadrao: p.markupPadrao?.toString() || '', estoqueMinimo: p.estoqueMinimo?.toString() || '',
      pesoLiquidoKg: p.pesoLiquidoKg?.toString() || '', pesoBrutoKg: p.pesoBrutoKg?.toString() || '',
      alturaCm: p.alturaCm?.toString() || '', larguraCm: p.larguraCm?.toString() || '',
      profundidadeCm: p.profundidadeCm?.toString() || '', material: p.material || '', cor: p.cor || '',
    });
    setEditingProduct(p);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja inativar este produto?')) return;
    try {
      await produtosService.inativar(id);
      loadProdutos();
      loadData();
    } catch (e: any) { alert(e.response?.data?.message || 'Erro'); }
  };

  const resetForm = () => {
    setForm({ codigoInterno: '', descricao: '', codigoBarras: '', categoriaId: '', marcaId: '',
      tipoProduto: 'SIMPLES', ncm: '', custoMedio: '', markupPadrao: '', estoqueMinimo: '',
      pesoLiquidoKg: '', pesoBrutoKg: '', alturaCm: '', larguraCm: '', profundidadeCm: '',
      material: '', cor: '' });
  };

  const getCatName = (id: string) => categorias.find(c => c.id === id)?.descricao || '-';
  const getMarcaName = (id: string) => marcas.find(m => m.id === id)?.nome || '-';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Package className="h-7 w-7" /> Produtos</h1>
          <p className="text-muted-foreground">Gestao completa de produtos, precos, estoque e composicao</p>
        </div>
        <button onClick={() => { resetForm(); setEditingProduct(null); setShowForm(true); }}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Novo Produto
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: 'Total', value: stats.total, color: 'bg-blue-500' },
            { label: 'Ativos', value: stats.ativos, color: 'bg-green-500' },
            { label: 'Inativos', value: stats.inativos, color: 'bg-gray-500' },
            { label: 'Kits', value: stats.kits, color: 'bg-purple-500' },
            { label: 'Bloq. Venda', value: stats.bloqueadosVenda, color: 'bg-red-500' },
            { label: 'c/ Est. Min.', value: stats.comEstoqueMinimo, color: 'bg-orange-500' },
          ].map(s => (
            <div key={s.label} className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${s.color}`} />
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
              <p className="mt-1 text-2xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Buscar por descricao, codigo, NCM..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-lg border bg-background pl-10 pr-4 py-2 text-sm" />
        </div>
        <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
          className="rounded-lg border bg-background px-3 py-2 text-sm">
          <option value="">Todos Status</option>
          <option value="ATIVO">Ativo</option>
          <option value="INATIVO">Inativo</option>
        </select>
        <select value={filterCategoria} onChange={e => { setFilterCategoria(e.target.value); setPage(1); }}
          className="rounded-lg border bg-background px-3 py-2 text-sm">
          <option value="">Todas Categorias</option>
          {categorias.map(c => <option key={c.id} value={c.id}>{c.descricao}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">Codigo</th>
              <th className="px-4 py-3 text-left font-medium">Descricao</th>
              <th className="px-4 py-3 text-left font-medium">Categoria</th>
              <th className="px-4 py-3 text-left font-medium">Marca</th>
              <th className="px-4 py-3 text-left font-medium">NCM</th>
              <th className="px-4 py-3 text-right font-medium">Custo</th>
              <th className="px-4 py-3 text-center font-medium">Status</th>
              <th className="px-4 py-3 text-center font-medium">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">Carregando...</td></tr>
            ) : produtos.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">Nenhum produto encontrado</td></tr>
            ) : produtos.map(p => (
              <tr key={p.id} className="border-b hover:bg-muted/30">
                <td className="px-4 py-3 font-mono text-xs">{p.codigoInterno}</td>
                <td className="px-4 py-3">{p.descricao}</td>
                <td className="px-4 py-3 text-xs">{getCatName(p.categoriaId)}</td>
                <td className="px-4 py-3 text-xs">{getMarcaName(p.marcaId)}</td>
                <td className="px-4 py-3 font-mono text-xs">{p.ncm || '-'}</td>
                <td className="px-4 py-3 text-right font-mono">R$ {parseFloat(p.custoMedio || 0).toFixed(2)}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${p.status === 'ATIVO' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => handleEdit(p)} className="rounded p-1 hover:bg-muted" title="Editar"><Edit2 className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(p.id)} className="rounded p-1 hover:bg-destructive/10 text-destructive" title="Inativar"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <span className="text-sm text-muted-foreground">{total} registros</span>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(pages, 10) }, (_, i) => (
                <button key={i} onClick={() => setPage(i + 1)}
                  className={`rounded px-3 py-1 text-sm ${page === i + 1 ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg bg-card p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">{editingProduct ? 'Editar Produto' : 'Novo Produto'}</h2>
              <button onClick={() => setShowForm(false)} className="rounded p-1 hover:bg-muted"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="text-xs font-medium">Codigo Interno *</label>
                  <input required value={form.codigoInterno} onChange={e => setForm({...form, codigoInterno: e.target.value})}
                    disabled={!!editingProduct} className="mt-1 w-full rounded border bg-background px-3 py-2 text-sm" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium">Descricao *</label>
                  <input required value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})}
                    className="mt-1 w-full rounded border bg-background px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="text-xs font-medium">Codigo Barras</label>
                  <input value={form.codigoBarras} onChange={e => setForm({...form, codigoBarras: e.target.value})}
                    className="mt-1 w-full rounded border bg-background px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium">Categoria</label>
                  <select value={form.categoriaId} onChange={e => setForm({...form, categoriaId: e.target.value})}
                    className="mt-1 w-full rounded border bg-background px-3 py-2 text-sm">
                    <option value="">Selecione</option>
                    {categorias.map(c => <option key={c.id} value={c.id}>{c.descricao}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium">Marca</label>
                  <select value={form.marcaId} onChange={e => setForm({...form, marcaId: e.target.value})}
                    className="mt-1 w-full rounded border bg-background px-3 py-2 text-sm">
                    <option value="">Selecione</option>
                    {marcas.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <div>
                  <label className="text-xs font-medium">Tipo Produto</label>
                  <select value={form.tipoProduto} onChange={e => setForm({...form, tipoProduto: e.target.value})}
                    className="mt-1 w-full rounded border bg-background px-3 py-2 text-sm">
                    <option value="SIMPLES">Simples</option>
                    <option value="KIT">Kit</option>
                    <option value="SERVICO">Servico</option>
                    <option value="MATERIA_PRIMA">Mat. Prima</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium">NCM</label>
                  <input value={form.ncm} onChange={e => setForm({...form, ncm: e.target.value})} placeholder="00000000"
                    className="mt-1 w-full rounded border bg-background px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium">Custo Medio (R$)</label>
                  <input type="number" step="0.01" value={form.custoMedio} onChange={e => setForm({...form, custoMedio: e.target.value})}
                    className="mt-1 w-full rounded border bg-background px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium">Markup (%)</label>
                  <input type="number" step="0.01" value={form.markupPadrao} onChange={e => setForm({...form, markupPadrao: e.target.value})}
                    className="mt-1 w-full rounded border bg-background px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <div>
                  <label className="text-xs font-medium">Est. Minimo</label>
                  <input type="number" value={form.estoqueMinimo} onChange={e => setForm({...form, estoqueMinimo: e.target.value})}
                    className="mt-1 w-full rounded border bg-background px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium">Peso Liq. (kg)</label>
                  <input type="number" step="0.001" value={form.pesoLiquidoKg} onChange={e => setForm({...form, pesoLiquidoKg: e.target.value})}
                    className="mt-1 w-full rounded border bg-background px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium">Material</label>
                  <input value={form.material} onChange={e => setForm({...form, material: e.target.value})}
                    className="mt-1 w-full rounded border bg-background px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium">Cor</label>
                  <input value={form.cor} onChange={e => setForm({...form, cor: e.target.value})}
                    className="mt-1 w-full rounded border bg-background px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">Cancelar</button>
                <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                  {editingProduct ? 'Salvar Alteracoes' : 'Criar Produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
