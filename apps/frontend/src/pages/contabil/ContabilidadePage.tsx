import { useState } from 'react';
import {
  BookOpen,
  ArrowRightLeft,
  Map,
  BarChart3,
  FileText,
  ChevronRight,
  Search,
  Plus,
  RefreshCw,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Building2,
  CreditCard,
  Receipt,
  Landmark,
  Users,
  Wallet,
  ShoppingCart,
  BanknoteIcon,
} from 'lucide-react';

// ============================================================
// TIPOS
// ============================================================
type TabId = 'plano-contas' | 'mapeamentos' | 'lancamentos' | 'balancete';

interface PlanoContasNode {
  codigo: string;
  descricao: string;
  tipoConta: string;
  natureza: string;
  classe: string;
  nivel: number;
  aceitaLancamento: boolean;
}

interface MapeamentoItem {
  tipoOperacao: string;
  descricaoOperacao: string;
  contaDebitoCodigo: string;
  contaDebitoDescricao: string;
  contaCreditoCodigo: string;
  contaCreditoDescricao: string;
  grupo: string;
}

// ============================================================
// DADOS LOCAIS (mock completo do mapeamento)
// ============================================================
const MAPEAMENTOS_MOCK: MapeamentoItem[] = [
  // VENDAS
  { tipoOperacao: 'VENDA_DINHEIRO', descricaoOperacao: 'Venda a Vista (Dinheiro)', contaDebitoCodigo: '1.1.01.001', contaDebitoDescricao: 'Caixa Geral', contaCreditoCodigo: '3.1.01.001', contaCreditoDescricao: 'Vendas a Vista (Dinheiro)', grupo: 'VENDAS' },
  { tipoOperacao: 'VENDA_PIX', descricaoOperacao: 'Venda PIX', contaDebitoCodigo: '1.1.02.XXX', contaDebitoDescricao: 'Banco (PIX)', contaCreditoCodigo: '3.1.01.005', contaCreditoDescricao: 'Vendas PIX', grupo: 'VENDAS' },
  { tipoOperacao: 'VENDA_CARTAO_CREDITO', descricaoOperacao: 'Venda Cartao Credito', contaDebitoCodigo: '1.1.09.001', contaDebitoDescricao: 'Aguard. Compensacao Credito', contaCreditoCodigo: '3.1.01.003', contaCreditoDescricao: 'Vendas Cartao Credito', grupo: 'VENDAS' },
  { tipoOperacao: 'VENDA_CARTAO_DEBITO', descricaoOperacao: 'Venda Cartao Debito', contaDebitoCodigo: '1.1.09.002', contaDebitoDescricao: 'Aguard. Compensacao Debito', contaCreditoCodigo: '3.1.01.004', contaCreditoDescricao: 'Vendas Cartao Debito', grupo: 'VENDAS' },
  { tipoOperacao: 'VENDA_BOLETO', descricaoOperacao: 'Venda Boleto', contaDebitoCodigo: '1.1.04.002', contaDebitoDescricao: 'Boletos a Receber', contaCreditoCodigo: '3.1.01.006', contaCreditoDescricao: 'Vendas Boleto', grupo: 'VENDAS' },
  { tipoOperacao: 'VENDA_CREDIARIO', descricaoOperacao: 'Venda Crediario', contaDebitoCodigo: '1.1.04.007', contaDebitoDescricao: 'Crediario a Receber', contaCreditoCodigo: '3.1.01.008', contaCreditoDescricao: 'Vendas Crediario', grupo: 'VENDAS' },
  { tipoOperacao: 'VENDA_VALE', descricaoOperacao: 'Venda com Vale', contaDebitoCodigo: '2.1.06.002', contaDebitoDescricao: 'Vales a Utilizar', contaCreditoCodigo: '3.1.01.009', contaCreditoDescricao: 'Vendas Vale', grupo: 'VENDAS' },
  // FINANCEIRO
  { tipoOperacao: 'COMPENSACAO_CARTAO', descricaoOperacao: 'Compensacao Cartao (float)', contaDebitoCodigo: '1.1.02.XXX', contaDebitoDescricao: 'Banco', contaCreditoCodigo: '1.1.09.001', contaCreditoDescricao: 'Aguard. Compensacao', grupo: 'FINANCEIRO' },
  { tipoOperacao: 'TAXA_OPERADORA_CARTAO', descricaoOperacao: 'Taxa Operadora Cartao', contaDebitoCodigo: '5.3.02.001', contaDebitoDescricao: 'Taxa Cartao Credito', contaCreditoCodigo: '1.1.02.XXX', contaCreditoDescricao: 'Banco', grupo: 'FINANCEIRO' },
  { tipoOperacao: 'RECEBIMENTO_BOLETO', descricaoOperacao: 'Recebimento de Boleto', contaDebitoCodigo: '1.1.02.XXX', contaDebitoDescricao: 'Banco', contaCreditoCodigo: '1.1.04.002', contaCreditoDescricao: 'Boletos a Receber', grupo: 'FINANCEIRO' },
  { tipoOperacao: 'TARIFA_BOLETO', descricaoOperacao: 'Tarifa Boleto', contaDebitoCodigo: '5.3.01.003', contaDebitoDescricao: 'Tarifa Boleto', contaCreditoCodigo: '1.1.02.XXX', contaCreditoDescricao: 'Banco', grupo: 'FINANCEIRO' },
  { tipoOperacao: 'ANTECIPACAO_CARTAO', descricaoOperacao: 'Antecipacao de Cartao', contaDebitoCodigo: '1.1.02.XXX', contaDebitoDescricao: 'Banco', contaCreditoCodigo: '1.1.09.001', contaCreditoDescricao: 'Aguard. Compensacao', grupo: 'FINANCEIRO' },
  { tipoOperacao: 'CUSTO_ANTECIPACAO_CARTAO', descricaoOperacao: 'Custo Antecip. Cartao', contaDebitoCodigo: '5.3.04.001', contaDebitoDescricao: 'Custo Antec. Cartao', contaCreditoCodigo: '1.1.02.XXX', contaCreditoDescricao: 'Banco', grupo: 'FINANCEIRO' },
  { tipoOperacao: 'ANTECIPACAO_BOLETO', descricaoOperacao: 'Antecipacao de Boleto', contaDebitoCodigo: '1.1.02.XXX', contaDebitoDescricao: 'Banco', contaCreditoCodigo: '1.1.04.010', contaCreditoDescricao: 'Antecip. Boleto', grupo: 'FINANCEIRO' },
  { tipoOperacao: 'CUSTO_ANTECIPACAO_BOLETO', descricaoOperacao: 'Custo Antecip. Boleto', contaDebitoCodigo: '5.3.04.002', contaDebitoDescricao: 'Custo Antec. Boleto', contaCreditoCodigo: '1.1.02.XXX', contaCreditoDescricao: 'Banco', grupo: 'FINANCEIRO' },
  { tipoOperacao: 'DESCONTO_BOLETO', descricaoOperacao: 'Desconto de Boleto', contaDebitoCodigo: '1.1.02.XXX', contaDebitoDescricao: 'Banco', contaCreditoCodigo: '1.1.04.012', contaCreditoDescricao: 'Bol. Desc. Carteira', grupo: 'FINANCEIRO' },
  { tipoOperacao: 'CUSTO_DESCONTO_BOLETO', descricaoOperacao: 'Custo Desc. Boleto', contaDebitoCodigo: '5.3.04.004', contaDebitoDescricao: 'Custo Desc. Boleto', contaCreditoCodigo: '1.1.02.XXX', contaCreditoDescricao: 'Banco', grupo: 'FINANCEIRO' },
  { tipoOperacao: 'BOLETO_DEVOLVIDO', descricaoOperacao: 'Boleto Devolvido', contaDebitoCodigo: '2.1.07.001', contaDebitoDescricao: 'Bol. Devolvidos', contaCreditoCodigo: '1.1.02.XXX', contaCreditoDescricao: 'Banco', grupo: 'FINANCEIRO' },
  { tipoOperacao: 'RECUPERACAO_BOLETO_DEVOLVIDO', descricaoOperacao: 'Recuperacao Bol. Devolvido', contaDebitoCodigo: '1.1.02.XXX', contaDebitoDescricao: 'Banco', contaCreditoCodigo: '3.4.02.005', contaCreditoDescricao: 'Cobr. Recuperadas', grupo: 'FINANCEIRO' },
  { tipoOperacao: 'PREJUIZO_BOLETO_DEVOLVIDO', descricaoOperacao: 'Prejuizo Bol. Devolvido', contaDebitoCodigo: '5.2.03.004', contaDebitoDescricao: 'Perdas Cobrancas', contaCreditoCodigo: '2.1.07.001', contaCreditoDescricao: 'Bol. Devolvidos', grupo: 'FINANCEIRO' },
  { tipoOperacao: 'EMPRESTIMO_LIBERACAO', descricaoOperacao: 'Emprestimo - Liberacao', contaDebitoCodigo: '1.1.02.XXX', contaDebitoDescricao: 'Banco', contaCreditoCodigo: '2.1.02.001', contaCreditoDescricao: 'Emprest. Bancario', grupo: 'FINANCEIRO' },
  { tipoOperacao: 'EMPRESTIMO_PAGAMENTO_PARCELA', descricaoOperacao: 'Emprestimo - Parcela', contaDebitoCodigo: '2.1.02.001', contaDebitoDescricao: 'Emprest. Bancario', contaCreditoCodigo: '1.1.02.XXX', contaCreditoDescricao: 'Banco', grupo: 'FINANCEIRO' },
  { tipoOperacao: 'EMPRESTIMO_JUROS', descricaoOperacao: 'Emprestimo - Juros', contaDebitoCodigo: '5.3.03.001', contaDebitoDescricao: 'Juros Emprestimos', contaCreditoCodigo: '1.1.02.XXX', contaCreditoDescricao: 'Banco', grupo: 'FINANCEIRO' },
  { tipoOperacao: 'IOF_EMPRESTIMO', descricaoOperacao: 'IOF sobre Emprestimo', contaDebitoCodigo: '5.3.04.006', contaDebitoDescricao: 'IOF Emprestimos', contaCreditoCodigo: '1.1.02.XXX', contaCreditoDescricao: 'Banco', grupo: 'FINANCEIRO' },
  { tipoOperacao: 'TAXA_BANCARIA_MANUTENCAO', descricaoOperacao: 'Taxa Bancaria Manutencao', contaDebitoCodigo: '5.3.01.001', contaDebitoDescricao: 'Tarifa Manut.', contaCreditoCodigo: '1.1.02.XXX', contaCreditoDescricao: 'Banco', grupo: 'FINANCEIRO' },
  { tipoOperacao: 'CHEQUE_ESPECIAL_JUROS', descricaoOperacao: 'Cheque Especial Juros', contaDebitoCodigo: '5.3.03.003', contaDebitoDescricao: 'Juros Ch. Especial', contaCreditoCodigo: '1.1.02.XXX', contaCreditoDescricao: 'Banco', grupo: 'FINANCEIRO' },
  // VALES
  { tipoOperacao: 'EMISSAO_VALE', descricaoOperacao: 'Emissao de Vale/Credito', contaDebitoCodigo: '5.2.03.002', contaDebitoDescricao: 'Descontos Conced.', contaCreditoCodigo: '2.1.06.002', contaCreditoDescricao: 'Vales a Utilizar', grupo: 'VENDAS' },
  { tipoOperacao: 'UTILIZACAO_VALE', descricaoOperacao: 'Utilizacao de Vale', contaDebitoCodigo: '2.1.06.002', contaDebitoDescricao: 'Vales a Utilizar', contaCreditoCodigo: '3.1.01.009', contaCreditoDescricao: 'Vendas Vale', grupo: 'VENDAS' },
  // COMPRAS
  { tipoOperacao: 'COMPRA_MERCADORIA', descricaoOperacao: 'Compra de Mercadoria', contaDebitoCodigo: '1.1.06.001', contaDebitoDescricao: 'Estoque Mercad.', contaCreditoCodigo: '2.1.01.001', contaCreditoDescricao: 'Fornecedores', grupo: 'COMPRAS' },
  { tipoOperacao: 'PAGAMENTO_FORNECEDOR', descricaoOperacao: 'Pagamento Fornecedor', contaDebitoCodigo: '2.1.01.001', contaDebitoDescricao: 'Fornecedores', contaCreditoCodigo: '1.1.02.XXX', contaCreditoDescricao: 'Banco', grupo: 'COMPRAS' },
  // FOLHA
  { tipoOperacao: 'FOLHA_PAGAMENTO', descricaoOperacao: 'Folha de Pagamento', contaDebitoCodigo: '5.1.01.001', contaDebitoDescricao: 'Salarios', contaCreditoCodigo: '2.1.03.001', contaCreditoDescricao: 'Salarios a Pagar', grupo: 'FOLHA' },
  { tipoOperacao: 'PAGAMENTO_SALARIOS', descricaoOperacao: 'Pagamento de Salarios', contaDebitoCodigo: '2.1.03.001', contaDebitoDescricao: 'Salarios a Pagar', contaCreditoCodigo: '1.1.02.XXX', contaCreditoDescricao: 'Banco', grupo: 'FOLHA' },
];

const PLANO_CONTAS_RESUMO: PlanoContasNode[] = [
  { codigo: '1', descricao: 'ATIVO', tipoConta: 'ATIVO', natureza: 'DEVEDORA', classe: 'SINTETICA', nivel: 1, aceitaLancamento: false },
  { codigo: '1.1', descricao: 'ATIVO CIRCULANTE', tipoConta: 'ATIVO', natureza: 'DEVEDORA', classe: 'SINTETICA', nivel: 2, aceitaLancamento: false },
  { codigo: '1.1.01', descricao: 'CAIXA E EQUIVALENTES', tipoConta: 'ATIVO', natureza: 'DEVEDORA', classe: 'SINTETICA', nivel: 3, aceitaLancamento: false },
  { codigo: '1.1.01.001', descricao: 'Caixa Geral', tipoConta: 'ATIVO', natureza: 'DEVEDORA', classe: 'ANALITICA', nivel: 4, aceitaLancamento: true },
  { codigo: '1.1.02', descricao: 'BANCOS CONTA MOVIMENTO', tipoConta: 'ATIVO', natureza: 'DEVEDORA', classe: 'SINTETICA', nivel: 3, aceitaLancamento: false },
  { codigo: '1.1.02.001', descricao: 'Banco Conta Corrente - Principal', tipoConta: 'ATIVO', natureza: 'DEVEDORA', classe: 'ANALITICA', nivel: 4, aceitaLancamento: true },
  { codigo: '1.1.04', descricao: 'CONTAS A RECEBER', tipoConta: 'ATIVO', natureza: 'DEVEDORA', classe: 'SINTETICA', nivel: 3, aceitaLancamento: false },
  { codigo: '1.1.04.002', descricao: 'Boletos a Receber', tipoConta: 'ATIVO', natureza: 'DEVEDORA', classe: 'ANALITICA', nivel: 4, aceitaLancamento: true },
  { codigo: '1.1.04.007', descricao: 'Crediario a Receber', tipoConta: 'ATIVO', natureza: 'DEVEDORA', classe: 'ANALITICA', nivel: 4, aceitaLancamento: true },
  { codigo: '1.1.06', descricao: 'ESTOQUES', tipoConta: 'ATIVO', natureza: 'DEVEDORA', classe: 'SINTETICA', nivel: 3, aceitaLancamento: false },
  { codigo: '1.1.06.001', descricao: 'Estoque de Mercadorias', tipoConta: 'ATIVO', natureza: 'DEVEDORA', classe: 'ANALITICA', nivel: 4, aceitaLancamento: true },
  { codigo: '1.1.09', descricao: 'VALORES EM TRANSITO / COMPENSACAO', tipoConta: 'ATIVO', natureza: 'DEVEDORA', classe: 'SINTETICA', nivel: 3, aceitaLancamento: false },
  { codigo: '1.1.09.001', descricao: 'Aguard. Compensacao - Cartao Credito', tipoConta: 'ATIVO', natureza: 'DEVEDORA', classe: 'ANALITICA', nivel: 4, aceitaLancamento: true },
  { codigo: '2', descricao: 'PASSIVO', tipoConta: 'PASSIVO', natureza: 'CREDORA', classe: 'SINTETICA', nivel: 1, aceitaLancamento: false },
  { codigo: '2.1', descricao: 'PASSIVO CIRCULANTE', tipoConta: 'PASSIVO', natureza: 'CREDORA', classe: 'SINTETICA', nivel: 2, aceitaLancamento: false },
  { codigo: '2.1.01.001', descricao: 'Fornecedores Nacionais', tipoConta: 'PASSIVO', natureza: 'CREDORA', classe: 'ANALITICA', nivel: 4, aceitaLancamento: true },
  { codigo: '2.1.03.001', descricao: 'Salarios a Pagar', tipoConta: 'PASSIVO', natureza: 'CREDORA', classe: 'ANALITICA', nivel: 4, aceitaLancamento: true },
  { codigo: '2.1.06.002', descricao: 'Vales a Utilizar', tipoConta: 'PASSIVO', natureza: 'CREDORA', classe: 'ANALITICA', nivel: 4, aceitaLancamento: true },
  { codigo: '3', descricao: 'RECEITAS', tipoConta: 'RECEITA', natureza: 'CREDORA', classe: 'SINTETICA', nivel: 1, aceitaLancamento: false },
  { codigo: '3.1.01', descricao: 'RECEITA BRUTA DE VENDAS', tipoConta: 'RECEITA', natureza: 'CREDORA', classe: 'SINTETICA', nivel: 3, aceitaLancamento: false },
  { codigo: '3.1.01.001', descricao: 'Vendas a Vista (Dinheiro)', tipoConta: 'RECEITA', natureza: 'CREDORA', classe: 'ANALITICA', nivel: 4, aceitaLancamento: true },
  { codigo: '3.1.01.003', descricao: 'Vendas Cartao de Credito', tipoConta: 'RECEITA', natureza: 'CREDORA', classe: 'ANALITICA', nivel: 4, aceitaLancamento: true },
  { codigo: '3.1.01.005', descricao: 'Vendas PIX', tipoConta: 'RECEITA', natureza: 'CREDORA', classe: 'ANALITICA', nivel: 4, aceitaLancamento: true },
  { codigo: '5', descricao: 'DESPESAS', tipoConta: 'DESPESA', natureza: 'DEVEDORA', classe: 'SINTETICA', nivel: 1, aceitaLancamento: false },
  { codigo: '5.1.01.001', descricao: 'Salarios e Ordenados', tipoConta: 'DESPESA', natureza: 'DEVEDORA', classe: 'ANALITICA', nivel: 4, aceitaLancamento: true },
  { codigo: '5.3.02.001', descricao: 'Taxa Operadora Cartao de Credito', tipoConta: 'DESPESA', natureza: 'DEVEDORA', classe: 'ANALITICA', nivel: 4, aceitaLancamento: true },
];

const grupoIcons: Record<string, any> = {
  VENDAS: ShoppingCart,
  FINANCEIRO: Landmark,
  COMPRAS: Receipt,
  FOLHA: Users,
};

const grupoColors: Record<string, string> = {
  VENDAS: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  FINANCEIRO: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  COMPRAS: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  FOLHA: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

const tipoContaColors: Record<string, string> = {
  ATIVO: 'text-blue-400',
  PASSIVO: 'text-red-400',
  RECEITA: 'text-emerald-400',
  DESPESA: 'text-orange-400',
  PATRIMONIO_LIQUIDO: 'text-purple-400',
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function ContabilidadePage() {
  const [activeTab, setActiveTab] = useState<TabId>('mapeamentos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrupo, setSelectedGrupo] = useState<string | null>(null);

  const tabs = [
    { id: 'plano-contas' as TabId, label: 'Plano de Contas', icon: BookOpen },
    { id: 'mapeamentos' as TabId, label: 'Mapeamento Operacoes', icon: Map },
    { id: 'lancamentos' as TabId, label: 'Lancamentos', icon: ArrowRightLeft },
    { id: 'balancete' as TabId, label: 'Balancete / DRE', icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-primary" />
            Contabilidade
          </h1>
          <p className="text-muted-foreground mt-1">
            Plano de contas, mapeamento de operacoes e lancamentos contabeis
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4" />
            Novo Lancamento
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Contas Cadastradas" value="160+" icon={BookOpen} color="blue" />
        <KpiCard title="Operacoes Mapeadas" value="33" icon={Map} color="emerald" />
        <KpiCard title="Lancamentos (mes)" value="0" icon={ArrowRightLeft} color="purple" />
        <KpiCard title="Saldo Caixa" value="R$ 0,00" icon={DollarSign} color="orange" />
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'plano-contas' && (
        <PlanoContasTab searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      )}
      {activeTab === 'mapeamentos' && (
        <MapeamentosTab
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedGrupo={selectedGrupo}
          setSelectedGrupo={setSelectedGrupo}
        />
      )}
      {activeTab === 'lancamentos' && <LancamentosTab />}
      {activeTab === 'balancete' && <BalanceteTab />}
    </div>
  );
}

// ============================================================
// KPI CARD
// ============================================================
function KpiCard({ title, value, icon: Icon, color }: { title: string; value: string; icon: any; color: string }) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500/10 text-blue-400',
    emerald: 'bg-emerald-500/10 text-emerald-400',
    purple: 'bg-purple-500/10 text-purple-400',
    orange: 'bg-orange-500/10 text-orange-400',
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-1 text-2xl font-bold">{value}</p>
        </div>
        <div className={`rounded-lg p-3 ${colorClasses[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PLANO DE CONTAS TAB
// ============================================================
function PlanoContasTab({ searchTerm, setSearchTerm }: { searchTerm: string; setSearchTerm: (v: string) => void }) {
  const filtered = PLANO_CONTAS_RESUMO.filter(
    (c) =>
      c.codigo.includes(searchTerm) ||
      c.descricao.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por codigo ou descricao..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-sm"
          />
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm hover:bg-muted">
          <Plus className="h-4 w-4" />
          Nova Conta
        </button>
        <button className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm hover:bg-muted">
          <RefreshCw className="h-4 w-4" />
          Inicializar Padrao
        </button>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">Codigo</th>
              <th className="px-4 py-3 text-left font-medium">Descricao</th>
              <th className="px-4 py-3 text-left font-medium">Tipo</th>
              <th className="px-4 py-3 text-left font-medium">Natureza</th>
              <th className="px-4 py-3 text-center font-medium">Classe</th>
              <th className="px-4 py-3 text-center font-medium">Lancamento</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((conta) => (
              <tr
                key={conta.codigo}
                className="border-b border-border/50 hover:bg-muted/30 transition-colors"
              >
                <td className="px-4 py-2.5">
                  <code
                    className="text-xs font-mono"
                    style={{ paddingLeft: `${(conta.nivel - 1) * 16}px` }}
                  >
                    {conta.codigo}
                  </code>
                </td>
                <td className={`px-4 py-2.5 ${conta.classe === 'SINTETICA' ? 'font-semibold' : ''}`}>
                  {conta.descricao}
                </td>
                <td className={`px-4 py-2.5 text-xs ${tipoContaColors[conta.tipoConta] || ''}`}>
                  {conta.tipoConta}
                </td>
                <td className="px-4 py-2.5 text-xs">{conta.natureza}</td>
                <td className="px-4 py-2.5 text-center">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs ${
                      conta.classe === 'ANALITICA'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {conta.classe}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-center">
                  {conta.aceitaLancamento ? (
                    <span className="text-emerald-400">&#10003;</span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">
        Exibindo resumo. O plano completo possui 160+ contas incluindo todos os niveis.
        Use a API POST /contabil/plano-contas/inicializar para popular o plano completo.
      </p>
    </div>
  );
}

// ============================================================
// MAPEAMENTOS TAB
// ============================================================
function MapeamentosTab({
  searchTerm,
  setSearchTerm,
  selectedGrupo,
  setSelectedGrupo,
}: {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  selectedGrupo: string | null;
  setSelectedGrupo: (v: string | null) => void;
}) {
  const grupos = [...new Set(MAPEAMENTOS_MOCK.map((m) => m.grupo))];

  const filtered = MAPEAMENTOS_MOCK.filter((m) => {
    const matchGrupo = !selectedGrupo || m.grupo === selectedGrupo;
    const matchSearch =
      !searchTerm ||
      m.descricaoOperacao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.tipoOperacao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.contaDebitoCodigo.includes(searchTerm) ||
      m.contaCreditoCodigo.includes(searchTerm);
    return matchGrupo && matchSearch;
  });

  return (
    <div className="space-y-4">
      {/* Filtros de grupo */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedGrupo(null)}
          className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors ${
            !selectedGrupo
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border hover:bg-muted'
          }`}
        >
          Todos ({MAPEAMENTOS_MOCK.length})
        </button>
        {grupos.map((grupo) => {
          const Icon = grupoIcons[grupo] || FileText;
          const count = MAPEAMENTOS_MOCK.filter((m) => m.grupo === grupo).length;
          return (
            <button
              key={grupo}
              onClick={() => setSelectedGrupo(selectedGrupo === grupo ? null : grupo)}
              className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors ${
                selectedGrupo === grupo
                  ? `${grupoColors[grupo]} border`
                  : 'border-border hover:bg-muted'
              }`}
            >
              <Icon className="h-4 w-4" />
              {grupo} ({count})
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar operacao, conta..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-sm"
        />
      </div>

      {/* Tabela de mapeamentos */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">Operacao</th>
              <th className="px-4 py-3 text-center font-medium w-24">
                <span className="flex items-center justify-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5 text-red-400" />
                  Debito
                </span>
              </th>
              <th className="px-4 py-3 text-center font-medium w-8"></th>
              <th className="px-4 py-3 text-center font-medium w-24">
                <span className="flex items-center justify-center gap-1">
                  <TrendingDown className="h-3.5 w-3.5 text-emerald-400" />
                  Credito
                </span>
              </th>
              <th className="px-4 py-3 text-center font-medium w-24">Grupo</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr
                key={m.tipoOperacao}
                className="border-b border-border/50 hover:bg-muted/30 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="font-medium">{m.descricaoOperacao}</div>
                  <div className="text-xs text-muted-foreground font-mono">{m.tipoOperacao}</div>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="inline-flex flex-col items-center rounded-lg bg-red-500/5 border border-red-500/10 px-3 py-1.5">
                    <code className="text-xs font-bold text-red-400">{m.contaDebitoCodigo}</code>
                    <span className="text-[10px] text-muted-foreground mt-0.5">{m.contaDebitoDescricao}</span>
                  </div>
                </td>
                <td className="px-1 py-3 text-center">
                  <ChevronRight className="h-4 w-4 text-muted-foreground mx-auto" />
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="inline-flex flex-col items-center rounded-lg bg-emerald-500/5 border border-emerald-500/10 px-3 py-1.5">
                    <code className="text-xs font-bold text-emerald-400">{m.contaCreditoCodigo}</code>
                    <span className="text-[10px] text-muted-foreground mt-0.5">{m.contaCreditoDescricao}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs ${grupoColors[m.grupo]}`}>
                    {m.grupo}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-4 text-sm">
        <Wallet className="h-5 w-5 text-primary shrink-0" />
        <div>
          <strong>1.1.02.XXX</strong> = Conta bancaria dinamica. O sistema substitui automaticamente
          pela conta contabil vinculada ao banco selecionado na operacao.
        </div>
      </div>
    </div>
  );
}

// ============================================================
// LANCAMENTOS TAB
// ============================================================
function LancamentosTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar lancamentos..."
            className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-sm"
          />
        </div>
        <select className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm">
          <option value="">Todos os tipos</option>
          <option value="AUTOMATICO">Automaticos</option>
          <option value="MANUAL">Manuais</option>
          <option value="ESTORNO">Estornos</option>
        </select>
      </div>

      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <ArrowRightLeft className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold">Nenhum lancamento contabil</h3>
        <p className="text-muted-foreground mt-2 max-w-md mx-auto">
          Os lancamentos sao gerados automaticamente quando operacoes ocorrem no sistema
          (vendas, pagamentos, etc) ou podem ser criados manualmente.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            <Plus className="h-4 w-4" />
            Lancamento Manual
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted">
            <RefreshCw className="h-4 w-4" />
            Simular Lancamento
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <h4 className="font-medium mb-2">API Endpoints disponiveis:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono text-muted-foreground">
          <div><span className="text-emerald-400">POST</span> /contabil/lancamentos/automatico</div>
          <div><span className="text-blue-400">POST</span> /contabil/lancamentos/manual</div>
          <div><span className="text-orange-400">POST</span> /contabil/lancamentos/:id/estornar</div>
          <div><span className="text-purple-400">GET</span> /contabil/lancamentos</div>
          <div><span className="text-purple-400">GET</span> /contabil/extrato/:contaCodigo</div>
          <div><span className="text-purple-400">GET</span> /contabil/lancamentos/estatisticas</div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// BALANCETE TAB
// ============================================================
function BalanceteTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <select className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm">
          <option>Fevereiro 2026</option>
          <option>Janeiro 2026</option>
        </select>
        <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          <BarChart3 className="h-4 w-4" />
          Gerar Balancete
        </button>
        <button className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted">
          <FileText className="h-4 w-4" />
          Gerar DRE
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-blue-400" />
            Balancete de Verificacao
          </h3>
          <p className="text-sm text-muted-foreground">
            Demonstra os saldos de todas as contas em um periodo. Gere lancamentos
            para ver o balancete preenchido.
          </p>
          <div className="mt-4 text-xs font-mono text-muted-foreground">
            GET /contabil/balancete?ano=2026&mes=2
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-emerald-400" />
            DRE - Demonstracao do Resultado
          </h3>
          <p className="text-sm text-muted-foreground">
            Receita Bruta, Deducoes, Receita Liquida, CMV, Lucro Bruto, Despesas
            Operacionais, Financeiras, Tributarias e Resultado.
          </p>
          <div className="mt-4 text-xs font-mono text-muted-foreground">
            GET /contabil/dre?ano=2026&mesInicio=1&mesFim=12
          </div>
        </div>
      </div>
    </div>
  );
}
