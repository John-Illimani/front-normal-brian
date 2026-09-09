import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { loginRequest } from '../../services/auth.service';

export const Login = ({ setAuthToken }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans relative overflow-hidden select-none">
      
      {/* CSS Inyectado para animación de borde y para hacer el autocompletado 100% transparente */}
      <style>{`
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-border-spin {
          animation: spin-slow 6s linear infinite;
        }

        /* Anula el fondo del autocompletado del navegador */
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active {
          -webkit-text-fill-color: #ffffff !important;
          transition: background-color 999999s ease-in-out 0s !important;
          background-color: transparent !important;
        }
      `}</style>

      {/* 1. LUCES VIVAS Y BRILLANTES DE FONDO */}
      <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-cyan-500/30 rounded-full blur-[130px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-blue-600/40 rounded-full blur-[130px] pointer-events-none animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-[40%] right-[30%] w-[35vw] h-[35vw] max-w-[400px] max-h-[400px] bg-sky-400/25 rounded-full blur-[110px] pointer-events-none"></div>

      {/* 2. CONTENEDOR PRINCIPAL RESPONSIVO CON BORDE NEÓN GIRATORIO */}
      <div className="relative w-full max-w-[380px] sm:max-w-[420px] rounded-[2.5rem] p-[2px] overflow-hidden shadow-[0_0_50px_rgba(14,165,233,0.3)] transition-all">
        
        {/* Capa de Borde Gradiente que Gira */}
        <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,#00f6ff,#0066ff,#38bdf8,#00f6ff)] animate-border-spin"></div>

        {/* Capa Interior Neón Traslúcida */}
        <div className="relative w-full h-full bg-slate-950/70 backdrop-blur-3xl rounded-[2.4rem] p-7 sm:p-10 flex flex-col items-center z-10 border border-sky-300/20 shadow-inner">
          
          {/* Logo Cyan Neón en Círculo Cristalino */}
          <div className="relative group mb-5">
            <div className="absolute inset-0 bg-cyan-400 rounded-full blur-xl opacity-60 group-hover:opacity-90 transition-all duration-300"></div>
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-sky-950/40 border-2 border-cyan-400/60 flex items-center justify-center p-5 backdrop-blur-md shadow-[0_0_25px_rgba(6,182,212,0.5)]">
              <img 
                src="/gym.svg" 
                alt="Logo Gimnasia" 
                className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]"
              />
            </div>
          </div>

          {/* Títulos en Azul Neón Vibrante */}
          <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-white tracking-tight mb-1 text-center drop-shadow-[0_0_10px_rgba(6,182,212,0.4)]">
            PORTAL FBG
          </h2>
          <p className="text-xs font-semibold text-cyan-200/80 text-center tracking-wide mb-6">
            Federación Boliviana de Gimnasia
          </p>

          {error && (
            <div className="w-full bg-rose-500/20 border border-rose-400/50 rounded-2xl p-3 mb-5 text-center backdrop-blur-md shadow-[0_0_15px_rgba(244,63,94,0.3)]">
              <p className="text-rose-200 text-xs font-bold">{error}</p>
            </div>
          )}

          {/* FORMULARIO */}
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            
            {/* Campo Usuario */}
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-cyan-300 tracking-wider uppercase ml-2">Usuario / Correo</label>
              <div className="relative flex items-center bg-slate-900/60 border border-cyan-500/30 rounded-2xl px-4 py-3 sm:py-3.5 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/30 focus-within:bg-slate-900/90 transition-all duration-300 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                <User className="w-4 h-4 text-cyan-400 mr-3 shrink-0" />
                <input
                  type="text"
                  placeholder="Ingrese usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-cyan-200/40 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-cyan-300 tracking-wider uppercase ml-2">Contraseña</label>
              <div className="relative flex items-center bg-slate-900/60 border border-cyan-500/30 rounded-2xl px-4 py-3 sm:py-3.5 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/30 focus-within:bg-slate-900/90 transition-all duration-300 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                <Lock className="w-4 h-4 text-cyan-400 mr-3 shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-cyan-200/40 focus:outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-cyan-300/70 hover:text-cyan-200 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Botón de Inicio Sesión */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 sm:py-4 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center space-x-2 shadow-[0_0_25px_rgba(6,182,212,0.5)] hover:shadow-[0_0_35px_rgba(6,182,212,0.8)] transition-all duration-300 active:scale-[0.97] cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'ACCEDIENDO...' : 'INGRESAR'}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Pie de página */}
          <div className="mt-8 text-center border-t border-cyan-500/20 pt-4 w-full">
            <p className="text-[10px] font-bold text-cyan-200/60 uppercase tracking-widest">
              © {new Date().getFullYear()} — FBG Bolivia
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};