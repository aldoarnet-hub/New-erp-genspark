import { useAuthStore } from '@/store/auth.store';
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

const stats = [
  {
    title: 'Vendas Hoje',
    value: 'R$ 45.231,00',
    change: '+12.5%',
    trend: 'up' as const,
    icon: ShoppingCart,
    color: 'text-blue-600 bg-blue-100',
  },
  {
    title: 'Receita Mensal',
    value: 'R$ 892.450,00',
    change: '+8.2%',
    trend: 'up' as const,
    icon: DollarSign,
    color: 'text-green-600 bg-green-100',
  },
  {
    title: 'Produtos em Estoque',
    value: '12.453',
    change: '-2.1%',
    trend: 'down' as const,
    icon: Package,
    color: 'text-orange-600 bg-orange-100',
  },
  {
    title: 'Clientes Ativos',
    value: '3.842',
    change: '+5.7%',
    trend: 'up' as const,
    icon: Users,
    color: 'text-purple-600 bg-purple-100',
  },
];

const recentSales = [
  { id: 'VND-001', cliente: 'Construtora ABC LTDA', valor: 'R$ 15.890,00', status: 'Faturado' },
  { id: 'VND-002', cliente: 'Joao Silva MEI', valor: 'R$ 2.340,50', status: 'Pendente' },
  { id: 'VND-003', cliente: 'Obra Certa Engenharia', valor: 'R$ 45.600,00', status: 'Faturado' },
  { id: 'VND-004', cliente: 'Maria Santos', valor: 'R$ 890,00', status: 'Cancelado' },
  { id: 'VND-005', cliente: 'Deposito Construir LTDA', valor: 'R$ 8.750,00', status: 'Faturado' },
];

const statusColors: Record<string, string> = {
  Faturado: 'bg-green-100 text-green-700',
  Pendente: 'bg-yellow-100 text-yellow-700',
  Cancelado: 'bg-red-100 text-red-700',
};

export function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Visao geral do seu negocio - {user?.perfil}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="rounded-xl border bg-card p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className={`rounded-lg p-2 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <span
                className={`flex items-center gap-1 text-xs font-medium ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {stat.trend === 'up' ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {stat.change}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Vendas Recentes */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">Vendas Recentes</h3>
            <button className="text-sm text-primary hover:underline">
              Ver todas
            </button>
          </div>
          <div className="space-y-3">
            {recentSales.map((sale) => (
              <div
                key={sale.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="text-sm font-medium">{sale.cliente}</p>
                  <p className="text-xs text-muted-foreground">{sale.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{sale.valor}</p>
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[sale.status]}`}
                  >
                    {sale.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resumo Rapido */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="mb-4 font-semibold">Resumo do Dia</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Contas a Receber</p>
                  <p className="text-xs text-muted-foreground">Hoje</p>
                </div>
              </div>
              <p className="font-semibold text-green-600">R$ 23.450,00</p>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
              <div className="flex items-center gap-3">
                <TrendingDown className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm font-medium">Contas a Pagar</p>
                  <p className="text-xs text-muted-foreground">Hoje</p>
                </div>
              </div>
              <p className="font-semibold text-red-600">R$ 12.890,00</p>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium">Produtos Estoque Baixo</p>
                  <p className="text-xs text-muted-foreground">Necessitam reposicao</p>
                </div>
              </div>
              <p className="font-semibold text-orange-600">47</p>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
              <div className="flex items-center gap-3">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Pedidos Pendentes</p>
                  <p className="text-xs text-muted-foreground">Aguardando faturamento</p>
                </div>
              </div>
              <p className="font-semibold text-blue-600">12</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
