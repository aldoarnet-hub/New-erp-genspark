import { useState, useEffect } from 'react';
import { fornecedoresService } from '@/services/cadastros.service';
import { Truck, Plus, Search, Edit2, Trash2, X, Star } from 'lucide-react';

export default function FornecedoresPage() {
  const [fornecedores, setFornecedores] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const [form, setForm] = useState({
    codigoInterno: '', tipoPessoa: 'PJ', cpfCnpj: '', razaoSocial: '', nomeFantasia: '',
    email: '', telefone: '', cidade: '', uf: '', prazoEntregaDias: '', tipoFrete: '',
    certificadoIso: false,
  });

  useEffect(() => { loadStats(); }, []);
  useEffect(() => { loadData(); }, [page, search]);

  const loadStats = async () => {
    try { setStats(await fornecedoresService.estatisticas()); } catch (e) { console.error(e); }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 15 };
      if (search) params.search = search;
      const res = await fornecedoresService.listar(params);
      setFornecedores(res.data); setTotal(res.total); setPages(res.pages);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data: any = { ...form };
      if (data.prazoEntregaDias) data.prazoEntregaDias = parseInt(data.prazoEntregaDias);
      Object.keys(data).forEach(k => { if (data[k] === '' || data[k] === undefined) delete data[k]; });
      if (editing) {
        delete data.codigoInterno; delete data.cpfCnpj; delete data.tipoPessoa;
        await fornecedoresService.atualizar(editing.id, data);
      } else {
        await fornecedoresService.criar(data);
      }
      setShowForm(false); setEditing(null); resetForm(); loadData(); loadStats();
    } catch (e: any) { alert(e.response?.data?.message || 'Erro'); }
  };

  const handleEdit = (f: any) => {
    setForm({ codigoInterno: f.codigoInterno, tipoPessoa: f.tipoPessoa, cpfCnpj: f.cpfCnpj,
      razaoSocial: f.razaoSocial || '', nomeFantasia: f.nomeFantasia || '', email: f.email || '',
      telefone: f.telefone || '', cidade: f.cidade || '', uf: f.uf || '',
      prazoEntregaDias: f.prazoEntregaDias?.toString() || '', tipoFrete: f.tipoFrete || '',
      certificadoIso: f.certificadoIso || false });
    setEditing(f); setShowForm(true);
  };

  const resetForm = () => { setForm({ codigoInterno: '', tipoPessoa: 'PJ', cpfCnpj: '', razaoSocial: '', nomeFantasia: '', email: '', telefone: '', cidade: '', uf: '', prazoEntregaDias: '', tipoFrete: '', certificadoIso: false }); };

  const renderStars = (rating: number) => {
    if (!rating) return '-';
    return <span className="flex items-center gap-0.5">{[1,2,3,4,5].map(i => <Star key={i} className={`h-3 w-3 ${i <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />)}<span className="ml-1 text-xs">{rating.toFixed(1)}</span></span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Truck className="h-7 w-7" /> Fornecedores</h1>
          <p className="text-muted-foreground">Supply chain com avaliacoes e certificacoes</p>
        </div>
        <button onClick={() => { resetForm(); setEditing(null); setShowForm(true); }}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Novo Fornecedor
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Total', value: stats.total, color: 'bg-blue-500' },
            { label: 'Ativos', value: stats.ativos, color: 'bg-green-500' },
            { label: 'Aprovados', value: stats.aprovados, color: 'bg-emerald-500' },
            { label: 'Com ISO', value: stats.comCertificadoIso, color: 'bg-purple-500' },
          ].map(s => (
            <div key={s.label} className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-2"><div className={`h-3 w-3 rounded-full ${s.color}`} /><span className="text-xs text-muted-foreground">{s.label}</span></div>
              <p className="mt-1 text-2xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Buscar..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-lg border bg-background pl-10 pr-4 py-2 text-sm" />
        </div>
      </div>

      <div className="rounded-lg border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b bg-muted/50">
            <th className="px-4 py-3 text-left font-medium">Codigo</th>
            <th className="px-4 py-3 text-left font-medium">Razao Social</th>
            <th className="px-4 py-3 text-left font-medium">CNPJ</th>
            <th className="px-4 py-3 text-left font-medium">Cidade/UF</th>
            <th className="px-4 py-3 text-center font-medium">Prazo</th>
            <th className="px-4 py-3 text-center font-medium">Rating</th>
            <th className="px-4 py-3 text-center font-medium">Aprovado</th>
            <th className="px-4 py-3 text-center font-medium">Acoes</th>
          </tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">Carregando...</td></tr>
            ) : fornecedores.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">Nenhum fornecedor encontrado</td></tr>
            ) : fornecedores.map(f => (
              <tr key={f.id} className="border-b hover:bg-muted/30">
                <td className="px-4 py-3 font-mono text-xs">{f.codigoInterno}</td>
                <td className="px-4 py-3">{f.nomeFantasia || f.razaoSocial}</td>
                <td className="px-4 py-3 font-mono text-xs">{f.cpfCnpj}</td>
                <td className="px-4 py-3 text-xs">{f.cidade ? `${f.cidade}/${f.uf}` : '-'}</td>
                <td className="px-4 py-3 text-center text-xs">{f.prazoEntregaDias ? `${f.prazoEntregaDias}d` : '-'}</td>
                <td className="px-4 py-3 text-center">{renderStars(f.rating)}</td>
                <td className="px-4 py-3 text-center">{f.fornecedorAprovado ? <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">Sim</span> : <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">Nao</span>}</td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => handleEdit(f)} className="rounded p-1 hover:bg-muted"><Edit2 className="h-4 w-4" /></button>
                    <button onClick={async () => { if(confirm('Inativar?')) { await fornecedoresService.inativar(f.id); loadData(); loadStats(); }}} className="rounded p-1 hover:bg-destructive/10 text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-card p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">{editing ? 'Editar Fornecedor' : 'Novo Fornecedor'}</h2>
              <button onClick={() => setShowForm(false)}><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div><label className="text-xs font-medium">Codigo *</label>
                  <input required value={form.codigoInterno} onChange={e => setForm({...form, codigoInterno: e.target.value})} disabled={!!editing} className="mt-1 w-full rounded border bg-background px-3 py-2 text-sm" /></div>
                <div><label className="text-xs font-medium">CNPJ *</label>
                  <input required value={form.cpfCnpj} onChange={e => setForm({...form, cpfCnpj: e.target.value})} disabled={!!editing} className="mt-1 w-full rounded border bg-background px-3 py-2 text-sm" /></div>
                <div><label className="text-xs font-medium">Razao Social</label>
                  <input value={form.razaoSocial} onChange={e => setForm({...form, razaoSocial: e.target.value})} className="mt-1 w-full rounded border bg-background px-3 py-2 text-sm" /></div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div><label className="text-xs font-medium">Nome Fantasia</label><input value={form.nomeFantasia} onChange={e => setForm({...form, nomeFantasia: e.target.value})} className="mt-1 w-full rounded border bg-background px-3 py-2 text-sm" /></div>
                <div><label className="text-xs font-medium">Email</label><input value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="mt-1 w-full rounded border bg-background px-3 py-2 text-sm" /></div>
                <div><label className="text-xs font-medium">Telefone</label><input value={form.telefone} onChange={e => setForm({...form, telefone: e.target.value})} className="mt-1 w-full rounded border bg-background px-3 py-2 text-sm" /></div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <div><label className="text-xs font-medium">Cidade</label><input value={form.cidade} onChange={e => setForm({...form, cidade: e.target.value})} className="mt-1 w-full rounded border bg-background px-3 py-2 text-sm" /></div>
                <div><label className="text-xs font-medium">UF</label><input maxLength={2} value={form.uf} onChange={e => setForm({...form, uf: e.target.value.toUpperCase()})} className="mt-1 w-full rounded border bg-background px-3 py-2 text-sm" /></div>
                <div><label className="text-xs font-medium">Prazo Entrega (dias)</label><input type="number" value={form.prazoEntregaDias} onChange={e => setForm({...form, prazoEntregaDias: e.target.value})} className="mt-1 w-full rounded border bg-background px-3 py-2 text-sm" /></div>
                <div><label className="text-xs font-medium">Tipo Frete</label>
                  <select value={form.tipoFrete} onChange={e => setForm({...form, tipoFrete: e.target.value})} className="mt-1 w-full rounded border bg-background px-3 py-2 text-sm">
                    <option value="">Selecione</option><option value="CIF">CIF</option><option value="FOB">FOB</option></select></div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={form.certificadoIso} onChange={e => setForm({...form, certificadoIso: e.target.checked})} id="iso" />
                <label htmlFor="iso" className="text-sm">Possui certificado ISO</label>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">Cancelar</button>
                <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">{editing ? 'Salvar' : 'Criar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
