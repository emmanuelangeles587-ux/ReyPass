import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, User, Building2, ArrowRight, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';

interface AuthModalProps {
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onSuccess }) => {
  const { 
    signInWithGoogle, 
    signInWithPassword, 
    signUpWithPassword, 
    error: authHookError, 
    setError: setAuthHookError 
  } = useSupabaseAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [isForgot, setIsForgot] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [selectedRole, setSelectedRole] = useState<'OWNER' | 'ADMIN' | 'ACCOUNTANT' | 'SALES' | 'VIEWER'>('OWNER');
  
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const error = localError || authHookError;

  // Handle Google OAuth Sign In / Sign Up
  const handleGoogleAuth = async () => {
    setLoading(true);
    setLocalError(null);
    setSuccessMsg(null);
    try {
      const res = await signInWithGoogle();
      if (res && res.error) {
        setLocalError((res.error as any).message || 'Error al autenticar con Google');
      } else {
        onSuccess();
      }
    } catch (err: any) {
      setLocalError(err.message || 'Error en autenticación con Google');
    } finally {
      setLoading(false);
    }
  };

  // Handle Email & Password
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLocalError(null);
    setSuccessMsg(null);

    try {
      if (isForgot) {
        setSuccessMsg('Se ha enviado un enlace de recuperación seguro a tu correo electrónico.');
        setLoading(false);
        return;
      }

      if (isLogin) {
        const { error: signInErr } = await signInWithPassword(email, password);
        if (signInErr) {
          setLocalError(signInErr.message || 'Credenciales incorrectas');
        } else {
          onSuccess();
        }
      } else {
        const { error: signUpErr } = await signUpWithPassword(email, password, {
          name: name || email.split('@')[0],
          org_name: orgName || 'Rey Fintech S.A. de C.V.',
          role: selectedRole
        });
        if (signUpErr) {
          setLocalError(signUpErr.message || 'Error al registrar usuario');
        } else {
          setSuccessMsg('¡Cuenta empresarial creada con éxito! Iniciando sesión...');
          setTimeout(() => onSuccess(), 800);
        }
      }
    } catch (err: any) {
      setLocalError(err.message || 'Error en la autenticación con Supabase');
    } finally {
      setLoading(false);
    }
  };

  // Instant Quick Demo Access for Devs/Reviewers
  const handleDemoAccess = () => {
    localStorage.setItem('reywallet_session', JSON.stringify({
      id: 'usr_demo_owner',
      email: 'admin@reywallet.com',
      name: 'Alejandro Rey',
      role: 'OWNER',
      organization_name: 'Rey Fintech Corp S.A. de C.V.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
    }));
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl shadow-2xl p-8 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-lime-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-lime-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-lime-500/20 text-slate-950 font-black text-2xl mx-auto mb-3">
            R
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">REYWALLET</h2>
          <p className="text-xs text-lime-400 font-mono mt-0.5">
            {isLogin ? 'Acceso Seguro • Supabase Session' : 'Crear Cuenta Enterprise • Supabase Auth'}
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Google OAuth Button */}
        {!isForgot && (
          <div className="space-y-3 mb-5">
            <button
              type="button"
              disabled={loading}
              onClick={handleGoogleAuth}
              className="w-full bg-slate-950 hover:bg-slate-800/90 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-3 transition-all border border-slate-700 hover:border-slate-600 shadow-md cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isLogin ? 'Continuar con Google' : 'Registrarse con Google Seguro'}</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-800"></div>
              <span className="text-[10px] font-mono uppercase text-slate-500">O con credenciales</span>
              <div className="flex-1 h-px bg-slate-800"></div>
            </div>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {!isLogin && !isForgot && (
            <>
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Alejandro Rey"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-lime-500 outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Empresa / Razón Social</label>
                <input
                  type="text"
                  required
                  value={orgName}
                  onChange={e => setOrgName(e.target.value)}
                  placeholder="Rey Fintech S.A. de C.V."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-lime-500 outline-none"
                />
              </div>
            </>
          )}

          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">Correo Electrónico</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="soporte.reyplace@gmail.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-lime-500 outline-none"
            />
          </div>

          {!isForgot && (
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">Contraseña</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-lime-500 outline-none"
              />
            </div>
          )}

          {!isLogin && !isForgot && (
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">Rol RBAC Inicial</label>
              <select
                value={selectedRole}
                onChange={e => setSelectedRole(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-lime-500 outline-none"
              >
                <option value="OWNER">OWNER (Propietario / Acceso Total)</option>
                <option value="ADMIN">ADMIN (Administrador)</option>
                <option value="ACCOUNTANT">ACCOUNTANT (Contador / Finanzas)</option>
                <option value="SALES">SALES (Ventas / CRM)</option>
                <option value="VIEWER">VIEWER (Auditor / Solo Lectura)</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-lime-500 hover:bg-lime-400 text-slate-950 font-black py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-lime-500/20 cursor-pointer mt-2 disabled:opacity-50"
          >
            <span>
              {loading 
                ? 'Procesando en Supabase...' 
                : isForgot 
                ? 'Enviar Enlace de Recuperación' 
                : isLogin 
                ? 'Iniciar Sesión Segura' 
                : 'Crear Cuenta Enterprise'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Access Trigger */}
        <div className="mt-4 pt-3 border-t border-slate-800/60 text-center">
          <button
            type="button"
            onClick={handleDemoAccess}
            className="text-[11px] font-mono text-lime-400/90 hover:text-lime-300 hover:underline flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Acceso Inmediato Sandbox / Propietario</span>
          </button>
        </div>

        {/* Bottom Toggle Links */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col items-center gap-2 text-xs">
          {!isForgot && (
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setLocalError(null);
                setAuthHookError(null);
                setSuccessMsg(null);
              }}
              className="text-slate-400 hover:text-lime-400 transition-all font-semibold cursor-pointer"
            >
              {isLogin ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
          )}
          <button
            onClick={() => {
              setIsForgot(!isForgot);
              setLocalError(null);
              setAuthHookError(null);
              setSuccessMsg(null);
            }}
            className="text-slate-500 hover:text-slate-300 transition-all cursor-pointer"
          >
            {isForgot ? '← Volver al login' : '¿Olvidaste tu contraseña?'}
          </button>
        </div>
      </div>
    </div>
  );
};
