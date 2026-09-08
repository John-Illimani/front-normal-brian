import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { loginRequest } from '../../services/auth.service';

export const Login = ({ setAuthToken }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await loginRequest(username, password);

      if (data.token) {
        const { password: _pwd, ...userData } = data.user || {};

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(userData));

        if (setAuthToken) setAuthToken(data.token);

        const userRole = userData?.rol;

        if (userRole === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else if (userRole === 'atleta') {
          navigate('/atleta/dashboard', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      }
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Credenciales inválidas o error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      
      {/* Elementos decorativos de fondo profesionales */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-[420px] bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10 flex flex-col items-center">
        
        {/* Logotipo o Icono Institucional */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20">
          <ShieldCheck className="w-8 h-8 text-white" />
        </div>

        <h2 className="text-2xl font-black text-white tracking-tight mb-2">Panel de Acceso</h2>
        <p className="text-xs text-slate-400 text-center leading-relaxed mb-8">
          Federación Boliviana de Gimnasia<br />
        </p>

        {error && (
          <div className="w-full bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 mb-6 text-center">
            <p className="text-rose-400 text-xs font-semibold">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">Usuario o Correo</label>
            <div className="relative flex items-center bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
              <User className="w-4 h-4 text-slate-400 mr-3 shrink-0" />
              <input
                type="text"
                placeholder="Ingrese su usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none [&:-webkit-autofill]:[-webkit-text-fill-color:#ffffff] [&:-webkit-autofill]:[box-shadow:0_0_0px_1000px_#020617_inset]"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">Contraseña</label>
            <div className="relative flex items-center bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
              <Lock className="w-4 h-4 text-slate-400 mr-3 shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none [&:-webkit-autofill]:[-webkit-text-fill-color:#ffffff] [&:-webkit-autofill]:[box-shadow:0_0_0px_1000px_#020617_inset]"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            <span className="tracking-wide">{loading ? 'Verificando credenciales...' : 'Iniciar Sesión'}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-[11px] text-slate-500">
            Federación Boliviana de Gimnasia © {new Date().getFullYear()} — Todos los derechos reservados
          </p>
        </div>

      </div>
    </div>
  );
};