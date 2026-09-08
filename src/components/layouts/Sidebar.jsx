import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';

export const Sidebar = ({ title, user, menuItems, onLogout, activeItem }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-800 font-sans relative">
      
      {/* Barra superior flotante para móviles */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 text-white z-30 px-4 flex items-center justify-between border-b border-slate-800 shadow-md">
        <div className="flex items-center space-x-3 truncate">
          <span className="font-bold text-sm tracking-tight truncate">{title}</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-slate-300 hover:text-white rounded-lg focus:outline-none bg-slate-800/80 cursor-pointer"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Backdrop oscuro para móvil cuando el menú está abierto */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="md:hidden fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        />
      )}

      {/* 1. Sidebar (Fijo en Desktop, Desplegable tipo Drawer en Móvil) */}
      <aside
        className={`w-64 h-screen bg-slate-900 text-slate-300 p-5 flex flex-col justify-between border-r border-slate-800 select-none fixed top-0 z-50 transition-transform duration-300 ease-in-out md:translate-x-0 md:sticky ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        
        {/* Encabezado e Información del Usuario */}
        <div>
          <div className="mb-6 pb-4 border-b border-slate-800 flex items-center justify-between">
            <div className="truncate">
              <h2 className="text-lg font-bold text-white tracking-tight truncate">{title}</h2>
              <p className="text-xs text-slate-400 mt-1 truncate">
                {user?.nombre || user?.username || 'Usuario'}
              </p>
            </div>
            {/* Botón de cierre para móvil dentro del drawer */}
            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Opciones del Menú */}
          <nav className="space-y-1">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeItem === item.id;

              return (
                <button
                  key={index}
                  onClick={() => {
                    item.onClick();
                    setMobileOpen(false); // Cierra el menú móvil al hacer clic
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Botón Cerrar Sesión */}
        <button
          onClick={() => {
            setMobileOpen(false);
            onLogout();
          }}
          className="w-full py-2.5 px-3 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 text-sm font-medium flex items-center justify-start space-x-3 transition-colors cursor-pointer"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span>Cerrar Sesión</span>
        </button>
      </aside>

      {/* 2. Contenedor Dinámico Principal (Outlet) */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto bg-slate-50 mt-16 md:mt-0 w-full">
        <Outlet />
      </main>

    </div>
  );
};