import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout';
import { LoginPage } from '@/pages/auth/LoginPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('accessToken');
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

// Placeholder para paginas futuras
function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="rounded-full bg-muted p-6 mb-4">
        <svg className="h-12 w-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-muted-foreground">Este modulo sera implementado nas proximas fases.</p>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'cadastros/produtos', element: <ComingSoon title="Cadastro de Produtos" /> },
      { path: 'cadastros/clientes', element: <ComingSoon title="Cadastro de Clientes" /> },
      { path: 'vendas', element: <ComingSoon title="Modulo de Vendas" /> },
      { path: 'estoque', element: <ComingSoon title="Gestao de Estoque" /> },
      { path: 'financeiro', element: <ComingSoon title="Modulo Financeiro" /> },
      { path: 'fiscal', element: <ComingSoon title="Modulo Fiscal" /> },
      { path: 'relatorios', element: <ComingSoon title="Relatorios e BI" /> },
      { path: 'configuracoes', element: <ComingSoon title="Configuracoes do Sistema" /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);
