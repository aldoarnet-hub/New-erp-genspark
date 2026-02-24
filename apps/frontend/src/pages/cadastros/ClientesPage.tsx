import { useState, useEffect } from 'react';
import { clientesService, cadastrosService } from '@/services/cadastros.service';
import { Users, Plus, Search, Edit2, Trash2, X, MapPin, Phone, CreditCard } from 'lucide-react';

export default function ClientesPage() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingCliente, setEditingCliente] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterTipo, setFilterTipo] = useState('');

  const [form, setForm] = useState({
    codigoInterno: '', tipoPessoa: 'PJ', cpfCnpj: '', razaoSocial: '', nomeFantasia: '',
    nomeCompleto: '', email: '', telefone: '', celular: '', cep: '', endereco: '', numero: '',
    bairro: '', cidade: '', uf: '', tipoCliente: '', segmento: '', limiteCredito: '',
    observacoes: '',
  });

  useEffect(() => { loadStats(); }, []);
  useEffect(() => { loadClientes(); }, [page, search, filterStatus, filterTipo]);

  const loadStats = async () => {
    try { setStats(await clientesService.estatisticas()); } catch (e) { console.error(e); }
  };

  const loadClientes = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 15 };
      if (search) params.search = search;
      if (filterStatus) params.status = filterStatus;
      if (filterTipo) params.tipoPessoa = filterTipo;
      const res = await clientesService.listar(params);
      setClientes(res.data);
      setTotal(res.total);
      setPages(res.pages);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleCepBlur = async () => {
    if (form.cep && form.cep.length >= 8) {
      try {
        const end = await cadastrosService.consultarCEP(form.cep.replace(/\D/g, ''));
        setForm(f => ({ ...f, endereco: end.endereco || '', bairro: end.bairro || '', cidade: end.cidade || '', uf: end.uf || '' }));
      } catch (e) { /* ignore */ }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data: any = { ...form };
      if (data.limiteCredito) data.limiteCredito = parseFloat(data.limiteCredito);
      Object.keys(data).forEach(k => { if (data[k] === '') delete data[k]; });

      if (editingCliente) {
        delete data.codigoInterno; delete data.cpfCnpj; delete data.tipoPessoa;
        await clientesService.atualizar(editingCliente.id, data);
      } else {
        await clientesService.criar(data);
      }
      setShowForm(false); setEditingCliente(null); resetForm();
      loadClientes(); loadStats();
    } catch (e: any) { alert(e.response?.data?.message || 'Erro ao salvar cliente'); }
  };

  const handleEdit = (c: any) => {
    setForm({
      codigoInterno: c.codigoInterno || '', tipoPessoa: c.tipoPessoa || 'PJ', cpfCnpj: c.cpfCnpj || '',
      razaoSocial: c.razaoSocial || '', nomeFantasia: c.nomeFantasia || '', nomeCompleto: c.nomeCompleto || '',
      email: c.email || '', telefone: c.telefone || '', celular: c.celular || '', cep: c.cep || '',
      endereco: c.endereco || '', numero: c.numero || '', bairro: c.bairro || '', cidade: c.cidade || '',
      uf: c.uf || '', tipoCliente: c.tipoCliente || '', segmento: c.segmento || '',
      limiteCredito: c.limiteCredito?.toString() || '', observacoes: c.observacoes || '',
    });
    setEditingCliente(c);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja inativar este cliente?')) return;
    try { await clientesService.inativar(id); loadClientes(); loadStats(); } catch (e: any) { alert('Erro'); }
  };

  const resetForm = () => {
    setForm({ codigoInterno: '', tipoPessoa: 'PJ', cpfCnpj: '', razaoSocial: '', nomeFantasia: '',
      nomeCompleto: '', email: '', telefone: '', celular: '', cep: '', endereco: '', numero: '',
      bairro: '', cidade: '', uf: '', tipoCliente: '', segmento: '', limiteCredito: '', observacoes: '' });
  };

  const getDisplayName = (c: any) => c.nomeFantasia || c.razaoSocial || c.nomeCompleto || c.codigoInterno;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Users className="h-7 w-7" /> Clientes</h1>
          <p className="text-muted-foreground">CRM com enderecos, contatos e analise de credito</p>
        </div>
        <button onClick={() => { resetForm(); setEditingCliente(null); setShowForm(true); }}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Novo Cliente
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
          {[
            { label: 'Total', value: stats.total, color: 'bg-blue-500' },
            { label: 'Ativos', value: stats.ativos, color: 'bg-green-500' },
            { label: 'Inativos', value: stats.inativos, color: 'bg-gray-500' },
            { label: 'Bloqueados', value: stats.bloqueados, color: 'bg-red-500' },
            { label: 'Pessoa Fisica', value: stats.pf, color: 'bg-cyan-500' },
            { label: 'Pessoa Juridica', value: stats.pj, color: 'bg-violet-500' },
            { label: 'Lim. Total', value: `R$ ${(stats.totalLimiteCredito/1000).toFixed(0)}k`, color: 'bg-amber-500' },
            { label: 'Lim. Usado', value: `R$ ${(stats.totalLimiteUtilizado/1000).toFixed(0)}k`, color: 'bg-orange-500' },
          ].map(s => (
            <div key={s.label} className="rounded-lg border bg-card p-3">
              <div className="flex items-center gap-2"><div className={`h-2 w-2 rounded-full ${s.color}`} /><span className="text-xs text-muted-foreground">{s.label}</span></div>
              <p className="mt-1 text-xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Buscar nome, CPF/CNPJ, codigo..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-lg border bg-background pl-10 pr-4 py-2 text-sm" />
        </div>
        <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
          className="rounded-lg border bg-background px-3 py-2 text-sm">
          <option value="">Todos Status</option><option value="ATIVO">Ativo</option><option value="INATIVO">Inativo</option>
        </select>
        <select value={filterTipo} onChange={e => { setFilterTipo(e.target.value); setPage(1); }}
          className="rounded-lg border bg-background px-3 py-2 text-sm">
          <option value="">Todos Tipos</option><option value="PF">Pessoa Fisica</option><option value="PJ">Pessoa Juridica</option>
        </select>
      </div>

      <div className="rounded-lg border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">Codigo</th>
              <th className="px-4 py-3 text-left font-medium">Nome/Razao</th>
              <th className="px-4 py-3 text-left font-medium">CPF/CNPJ</th>
              <th className="px-4 py-3 text-left font-medium">Tipo</th>
              <th className="px-4 py-3 text-left font-medium">Cidade/UF</th>
              <th className="px-4 py-3 text-right font-medium">Limite</th>
              <th className="px-4 py-3 text-center font-medium">Status</th>
              <th className="px-4 py-3 text-center font-medium">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">Carregando...</td></tr>
            ) : clientes.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">Nenhum cliente encontrado</td></tr>
            ) : clientes.map(c => (
              <tr key={c.id} className="border-b hover:bg-muted/30">
                <td className="px-4 py-3 font-mono text-xs">{c.codigoInterno}</td>
                <td className="px-4 py-3">{getDisplayName(c)}</td>
                <td className="px-4 py-3 font-mono text-xs">{c.cpfCnpj}</td>
                <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs ${c.tipoPessoa === 'PJ' ? 'bg-violet-100 text-violet-700' : 'bg-cyan-100 text-cyan-700'}`}>{c.tipoPessoa}</span></td>
                <td className="px-4 py-3 text-xs">{c.cidade ? `${c.cidade}/${c.uf}` : '-'}</td>
                <td className="px-4 py-3 text-right font-mono">R$ {parseFloat(c.limiteCredito || 0).toFixed(0)}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${c.status === 'ATIVO' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{c.status}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => handleEdit(c)} className="rounded p-1 hover:bg-muted" title="Editar"><Edit2 className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(c.id)} className="rounded p-1 hover:bg-destructive/10 text-destructive" title="Inativar"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {pages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <span className="text-sm text-muted-foreground">{total} registros</span>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(pages, 10) }, (_, i) => (
                <button key={i} onClick={() => setPage(i + 1)}
                  className={`rounded px-3 py-1 text-sm ${page === i + 1 ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>{i + 1}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg bg-card p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">{editingCliente ? 'Editar Cliente' : 'Novo Cliente'}</h2>
              <button onClick={() => setShowForm(false)} className="rounded p-1 hover:bg-muted"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div><label className="text-xs font-medium">Codigo *</label>
                  <input required value={form.codigoInterno} onChange={e => setForm({...form, codigoInterno: e.target.value})}
                    disabled={!!editingCliente} className="mt-1 w-full rounded border bg-background px-3 py-2 text-sm" /></div>
                <div><label className="text-xs font-medium">Tipo Pessoa *</label>
                  <select value={form.tipoPessoa} onChange={e => setForm({...form, tipoPessoa: e.target.value})}
                    disabled={!!editingCliente} className="mt-1 w-full rounded border bg-background px-3 py-2 text-sm">
                    <option value="PJ">Pessoa Juridica</option><option value="PF">Pessoa Fisica</option></select></div>
                <div><label className="text-xs font-medium">CPF/CNPJ *</label>
                  <input required value={form.cpfCnpj} onChange={e => setForm({...form, cpfCnpj: e.target.value})}
                    disabled={!!editingCliente} className="mt-1 w-full rounded border bg-background px-3 py-2 text-sm" /></div>
              </div>
              {form.tipoPessoa === 'PJ' ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div><label className="text-xs font-medium">Razao Social</label>
                    <input value={form.razaoSocial} onChange={e => setForm({...form, razaoSocial: e.target.value})}
                      className="mt-1 w-full rounded border bg-background px-3 py-2 text-sm" /></div>
                  <div><label className="text-xs font-medium">Nome Fantasia</label>
                    <input value={form.nomeFantasia} onChange={e => setForm({...form, nomeFantasia: e.target.value})}
                      className="mt-1 w-full rounded border bg-background px-3 py-2 text-sm" /></div>
                </div>
              ) : (
                <div><label className="text-xs font-medium">Nome Completo</label>
                  <input value={form.nomeCompleto} onChange={e => setForm({...form, nomeCompleto: e.target.value})}
                    className="mt-1 w-full rounded border bg-background px-3 py-2 text-sm" /></div>
              )}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div><label className="text-xs font-medium">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                    className="mt-1 w-full rounded border bg-background px-3 py-2 text-sm" /></div>
                <div><label className="text-xs font-medium">Telefone</label>
                  <input value={form.telefone} onChange={e => setForm({...form, telefone: e.target.value})}
                    className="mt-1 w-full rounded border bg-background px-3 py-2 text-sm" /></div>
                <div><label className="text-xs font-medium">Celular</label>
                  <input value={form.celular} onChange={e => setForm({...form, celular: e.target.value})}
                    className="mt-1 w-full rounded border bg-background px-3 py-2 text-sm" /></div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <div><label className="text-xs font-medium">CEP</label>
                  <input value={form.cep} onChange={e => setForm({...form, cep: e.target.value})} onBlur={handleCepBlur}
                    className="mt-1 w-full rounded border bg-background px-3 py-2 text-sm" placeholder="00000-000" /></div>
                <div className="sm:col-span-2"><label className="text-xs font-medium">Endereco</label>
                  <input value={form.endereco} onChange={e => setForm({...form, endereco: e.target.value})}
                    className="mt-1 w-full rounded border bg-background px-3 py-2 text-sm" /></div>
                <div><label className="text-xs font-medium">Numero</label>
                  <input value={form.numero} onChange={e => setForm({...form, numero: e.target.value})}
                    className="mt-1 w-full rounded border bg-background px-3 py-2 text-sm" /></div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div><label className="text-xs font-medium">Bairro</label>
                  <input value={form.bairro} onChange={e => setForm({...form, bairro: e.target.value})}
                    className="mt-1 w-full rounded border bg-background px-3 py-2 text-sm" /></div>
                <div><label className="text-xs font-medium">Cidade</label>
                  <input value={form.cidade} onChange={e => setForm({...form, cidade: e.target.value})}
                    className="mt-1 w-full rounded border bg-background px-3 py-2 text-sm" /></div>
                <div><label className="text-xs font-medium">UF</label>
                  <input value={form.uf} maxLength={2} onChange={e => setForm({...form, uf: e.target.value.toUpperCase()})}
                    className="mt-1 w-full rounded border bg-background px-3 py-2 text-sm" /></div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div><label className="text-xs font-medium">Tipo Cliente</label>
                  <select value={form.tipoCliente} onChange={e => setForm({...form, tipoCliente: e.target.value})}
                    className="mt-1 w-full rounded border bg-background px-3 py-2 text-sm">
                    <option value="">Selecione</option><option value="CONSUMIDOR">Consumidor</option>
                    <option value="CONSTRUTORA">Construtora</option><option value="REVENDEDOR">Revendedor</option>
                    <option value="ENGENHARIA">Engenharia</option><option value="GOVERNO">Governo</option></select></div>
                <div><label className="text-xs font-medium">Segmento</label>
                  <input value={form.segmento} onChange={e => setForm({...form, segmento: e.target.value})}
                    className="mt-1 w-full rounded border bg-background px-3 py-2 text-sm" /></div>
                <div><label className="text-xs font-medium">Limite Credito (R$)</label>
                  <input type="number" step="0.01" value={form.limiteCredito} onChange={e => setForm({...form, limiteCredito: e.target.value})}
                    className="mt-1 w-full rounded border bg-background px-3 py-2 text-sm" /></div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">Cancelar</button>
                <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                  {editingCliente ? 'Salvar' : 'Criar Cliente'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
