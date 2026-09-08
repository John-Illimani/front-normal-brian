import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, UserCheck, Activity, Search, Plus, 
  TrendingUp, CreditCard, ShieldCheck, ArrowRight
} from 'lucide-react';
import { getUsersRequest } from '../../services/user.service';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Cargar lista dinámica de usuarios desde la base de datos
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await getUsersRequest();
      setUsers(data);
    } catch (err) {
      console.error("Error al cargar datos del dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Métricas dinámicas en tiempo real
  const totalUsuarios = users.length;
  const totalAtletas = users.filter(u => u.rol === 'atleta' && u.activo).length;
  const totalAdmins = users.filter(u => u.rol === 'admin' && u.activo).length;

  // Filtrado de la tabla de registros recientes
  const filteredUsers = users.filter(u => {
    const term = searchTerm.toLowerCase();
    const fullName = `${u.nombre || ''} ${u.apellido || ''}`.toLowerCase();
    const username = u.username ? u.username.toLowerCase() : '';
    const ci = u.ci ? u.ci.toLowerCase() : '';

    return fullName.includes(term) || username.includes(term) || ci.includes(term);
  });

  return (
    <div className="space-y-8 font-sans">
      
      {/* Encabezado Principal */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/20 text-indigo-300 text-xs font-semibold px-3 py-1 rounded-full mb-2 backdrop-blur-md">
            <Activity className="w-3.5 h-3.5" />
            <span>Resumen del Sistema</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Panel Principal</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Monitoreo en tiempo real de cuentas registradas, atletas y accesos al sistema.
          </p>
        </div>

        <button 
          onClick={() => navigate('/admin/usuarios')}
          className="relative z-10 inline-flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-3 px-5 rounded-2xl shadow-lg shadow-indigo-600/30 transition-all active:scale-95 group"
        >
          <Plus className="w-4 h-4 transition-transform group-hover:scale-110" />
          <span>Gestionar Usuarios</span>
        </button>
      </header>

      {/* Tarjetas de Métricas Dinámicas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Tarjeta 1: Total Usuarios */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total Usuarios
              </p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-2">
                {loading ? '...' : totalUsuarios}
              </h3>
            </div>
            <div className="p-3.5 rounded-2xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-indigo-600">
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            <span>Sincronizado con PostgreSQL</span>
          </div>
        </div>

        {/* Tarjeta 2: Atletas Activos */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Atletas Activos
              </p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-2">
                {loading ? '...' : totalAtletas}
              </h3>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-emerald-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
            <span>Cuentas habilitadas</span>
          </div>
        </div>

        {/* Tarjeta 3: Administradores */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Administradores
              </p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-2">
                {loading ? '...' : totalAdmins}
              </h3>
            </div>
            <div className="p-3.5 rounded-2xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-purple-600">
            <span>Acceso de gestión</span>
          </div>
        </div>

      </div>

      {/* Tabla de Registros Recientes */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        
        {/* Cabecera de la tabla */}
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Usuarios Registrados Recientemente</h2>
            <p className="text-xs text-slate-500 mt-0.5">Listado de los últimos accesos y credenciales generadas.</p>
          </div>

          {/* Buscador Rápido */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Buscar por usuario o carnet..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-full sm:w-56 transition-all"
            />
          </div>
        </div>

        {/* Tabla Dinámica */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-slate-500 text-sm flex flex-col items-center space-y-2">
              <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <span>Cargando datos recientes...</span>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-4 px-6">Usuario / Persona</th>
                  <th className="py-4 px-6">CI (Carnet)</th>
                  <th className="py-4 px-6">Rol</th>
                  <th className="py-4 px-6">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-slate-400">
                      No se encontraron registros en el sistema.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.slice(0, 5).map((u) => {
                    const fullName = u.nombre || u.apellido ? `${u.nombre || ''} ${u.apellido || ''}`.trim() : u.username;
                    const initial = fullName.charAt(0).toUpperCase();

                    return (
                      <tr key={u.id} className="hover:bg-indigo-50/30 transition-colors group">
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                              {initial}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-sm">{fullName}</p>
                              <p className="text-[11px] text-indigo-600 font-medium">@{u.username}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6 font-mono font-bold text-slate-700">
                          {u.ci ? (
                            <span className="inline-flex items-center space-x-1 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                              <CreditCard className="w-3 h-3 text-slate-400" />
                              <span>{u.ci}</span>
                            </span>
                          ) : (
                            <span className="text-slate-300 font-sans italic">Sin CI</span>
                          )}
                        </td>

                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider ${
                            u.rol === 'admin' 
                              ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {u.rol}
                          </span>
                        </td>

                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-semibold ${
                            u.activo 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80' 
                              : 'bg-rose-50 text-rose-700 border border-rose-200/80'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${u.activo ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            <span>{u.activo ? 'Activo' : 'Inactivo'}</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer de la tabla */}
        <div className="p-4 bg-slate-50/60 border-t border-slate-100 flex justify-end">
          <button 
            onClick={() => navigate('/admin/usuarios')}
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <span>Ver todos los usuarios</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

    </div>
  );
};