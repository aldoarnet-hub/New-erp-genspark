import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { authService } from '@/services/auth.service';
import { Building2, Eye, EyeOff, Loader2 } from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login({ email, senha });
      setAuth({
        user: response.user,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Erro ao fazer login';
      setError(typeof msg === 'string' ? msg : 'Credenciais invalidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left - Branding */}
      <div className="hidden w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 lg:flex lg:flex-col lg:items-center lg:justify-center">
        <div className="text-center text-white">
          <Building2 className="mx-auto mb-6 h-20 w-20" />
          <h1 className="mb-2 text-4xl font-bold">ERP Construcao</h1>
          <p className="mb-8 text-lg text-blue-200">
            Sistema de Gestao para Materiais de Construcao
          </p>
          <div className="mx-auto max-w-sm space-y-3 text-left text-sm text-blue-200">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs">1</span>
              Multi-Tenant SaaS
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs">2</span>
              Conformidade Fiscal Brasileira
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs">3</span>
              Controles Rigorosos e Auditoria
            </div>
          </div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex w-full items-center justify-center bg-background px-6 lg:w-1/2">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 text-center lg:hidden">
            <Building2 className="mx-auto mb-4 h-12 w-12 text-primary" />
            <h1 className="text-2xl font-bold">ERP Construcao</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold">Bem-vindo de volta</h2>
            <p className="mt-1 text-muted-foreground">
              Entre com suas credenciais para acessar o sistema
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@erp.com"
                className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Sua senha"
                  className="w-full rounded-lg border bg-background px-4 py-2.5 pr-10 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          {/* Credenciais de demo */}
          <div className="mt-6 rounded-lg border bg-muted/50 p-4">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Credenciais de demonstracao:</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p><strong>Admin:</strong> admin@erp.com / admin123</p>
              <p><strong>Gerente:</strong> gerente@erp.com / 123456</p>
              <p><strong>Vendedor:</strong> vendedor@erp.com / 123456</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
