import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/ui.store';
import { useAuthStore } from '@/store/auth.store';
import {
  LayoutDashboard,
  Package,
  Users,
  Truck,
  Settings2,
  ShoppingCart,
  Warehouse,
  DollarSign,
  FileText,
  BarChart3,
  Settings,
  ChevronLeft,
  Building2,
} from 'lucide-react';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/cadastros/produtos', label: 'Produtos', icon: Package },
  { path: '/cadastros/clientes', label: 'Clientes', icon: Users },
  { path: '/cadastros/fornecedores', label: 'Fornecedores', icon: Truck },
  { path: '/cadastros/auxiliares', label: 'Cadastros Aux.', icon: Settings2 },
  { path: '/vendas', label: 'Vendas', icon: ShoppingCart },
  { path: '/estoque', label: 'Estoque', icon: Warehouse },
  { path: '/financeiro', label: 'Financeiro', icon: DollarSign },
  { path: '/fiscal', label: 'Fiscal', icon: FileText },
  { path: '/relatorios', label: 'Relatorios', icon: BarChart3 },
  { path: '/configuracoes', label: 'Configuracoes', icon: Settings },
];

export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { user } = useAuthStore();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-sidebar text-sidebar-foreground transition-all duration-300',
        sidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
        {sidebarOpen && (
          <div className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-sm font-bold">ERP Construcao</h1>
              <p className="text-xs text-muted-foreground">v3.0.0 - Cadastros</p>
            </div>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-1.5 hover:bg-white/10"
        >
          <ChevronLeft
            className={cn('h-5 w-5 transition-transform', !sidebarOpen && 'rotate-180')}
          />
        </button>
      </div>

      {/* Menu */}
      <nav className="mt-4 flex flex-col gap-1 px-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-white/10 hover:text-white'
              )
            }
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {sidebarOpen && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User info no bottom */}
      {sidebarOpen && user && (
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              {user.nome.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="truncate text-sm font-medium">{user.nome}</p>
              <p className="truncate text-xs text-muted-foreground">{user.perfil}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
