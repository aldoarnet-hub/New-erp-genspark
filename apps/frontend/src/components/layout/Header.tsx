import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Sun, Moon, LogOut, Bell, Menu } from 'lucide-react';

export function Header() {
  const { user, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar, theme, toggleTheme } = useUIStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header
      className={cn(
        'fixed top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-6 transition-all duration-300',
        sidebarOpen ? 'left-64' : 'left-16',
        'right-0'
      )}
    >
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-2 hover:bg-muted lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-lg font-semibold">
            {user?.nome ? `Ola, ${user.nome.split(' ')[0]}` : 'ERP Construcao'}
          </h2>
          <p className="text-xs text-muted-foreground">
            {new Date().toLocaleDateString('pt-BR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Notificacoes */}
        <button className="relative rounded-lg p-2 hover:bg-muted">
          <Bell className="h-5 w-5" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-white">
            3
          </span>
        </button>

        {/* Tema */}
        <button onClick={toggleTheme} className="rounded-lg p-2 hover:bg-muted">
          {theme === 'light' ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sair</span>
        </button>
      </div>
    </header>
  );
}
