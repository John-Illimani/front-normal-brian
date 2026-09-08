import React, { useEffect, useState } from 'react';
import { 
  Trophy, CreditCard, Mail, User, Sparkles, Activity,
  CheckCircle, XCircle, ShieldCheck
} from 'lucide-react';

export const AtletaDashboard = () => {
  const [user, setUser] = useState({});

  useEffect(() => {
    // Obtener todos los datos del usuario guardados en el Login
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    
    
    setUser(storedUser);
  }, []);



  
  

  const fullName = user.nombre || user.apellido 
    ? `${user.nombre || ''} ${user.apellido || ''}`.trim() 
    : user.username || 'Atleta';

  const initial = fullName.charAt(0).toUpperCase();
  const isActivo = user.activo !== undefined ? user.activo : true;

  return (
    <div className="space-y-8 font-sans">
      
      {/* Encabezado Vistoso con Nombre del Logueado */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-black text-2xl flex items-center justify-center shadow-lg border border-white/10">
            {initial}
          </div>
          <div>
            <div className="inline-flex items-center space-x-2 bg-indigo-500/20 text-indigo-300 text-xs font-semibold px-3 py-1 rounded-full mb-1 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Portal del Atleta</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">¡Bienvenido, {fullName}!</h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Consulta el estado de tu cuenta, carnet de identidad y credenciales institucionales.
            </p>
          </div>
        </div>

        {/* Badge Dinámico de Estado */}
        <div className="relative z-10">
          <span className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold border backdrop-blur-md ${
            isActivo 
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
              : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isActivo ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
            <span>{isActivo ? 'Cuenta Habilitada' : 'Cuenta Inhabilitada'}</span>
          </span>
        </div>
      </header>

      {/* Tarjetas de Resumen Rápido con Datos Reales */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* Tarjeta 1: Carnet de Identidad (CI) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Carnet de Identidad (CI)</p>
            <p className="text-2xl font-black text-slate-900 mt-1 font-mono">
              {user.ci || 'Sin CI registrado'}
            </p>
            <span className="text-[10px] text-slate-400">Documento Oficial</span>
          </div>
          <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        {/* Tarjeta 2: Usuario Registrado */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Nombre de Usuario</p>
            <p className="text-2xl font-black text-indigo-600 mt-1 font-mono">
              @{user.username || 'atleta'}
            </p>
            <span className="text-[10px] text-emerald-600 font-semibold">Identificador de Sesión</span>
          </div>
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Trophy className="w-6 h-6" />
          </div>
        </div>

        {/* Tarjeta 3: Rol del Usuario */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Rol Asignado</p>
            <p className="text-2xl font-black text-purple-600 mt-1 uppercase">
              {user.rol || 'atleta'}
            </p>
            <span className="text-[10px] text-slate-400">Nivel de Acceso</span>
          </div>
          <div className="p-3.5 bg-purple-50 text-purple-600 rounded-2xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Ficha Completa con la Información Desglosada */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
        
        <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <User className="w-5 h-5 text-indigo-600" />
              <span>Ficha Completa del Atleta Logueado</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Datos almacenados de la sesión activa.</p>
          </div>

          <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-lg">
            ID: #{user.id || 'N/A'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-1">
            <span className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">Nombre:</span>
            <p className="font-bold text-slate-900 text-sm">{user.nombre || 'N/A'}</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-1">
            <span className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">Apellido:</span>
            <p className="font-bold text-slate-900 text-sm">{user.apellido || 'N/A'}</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-1">
            <span className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">Carnet de Identidad (CI):</span>
            <p className="font-mono font-bold text-slate-800 text-sm flex items-center space-x-1.5">
              <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
              <span>{user.ci || 'Sin CI'}</span>
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-1">
            <span className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">Nombre de Usuario:</span>
            <p className="font-mono font-bold text-indigo-600 text-sm">@{user.username || 'N/A'}</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-1">
            <span className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">Correo Electrónico Institucional:</span>
            <p className="font-semibold text-slate-800 text-sm flex items-center space-x-1.5 truncate">
              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{user.email || `${user.username}@deporte.gob.bo`}</span>
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-1">
            <span className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">Estado de Habilitación:</span>
            <div>
              <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase ${
                isActivo 
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                  : 'bg-rose-100 text-rose-700 border border-rose-200'
              }`}>
                {isActivo ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                <span>{isActivo ? 'Habilitado' : 'Inhabilitado'}</span>
              </span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};