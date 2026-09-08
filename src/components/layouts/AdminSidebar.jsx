import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, UserCheck, Settings } from 'lucide-react';
import { Sidebar } from './Sidebar';

export const AdminSidebar = ({ setAuthToken }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (setAuthToken) setAuthToken(null);
    navigate('/login', { replace: true });
  };

  // Solo pasa los datos y las opciones de navegación
  const adminMenuItems = [
    {
      id: '/admin/dashboard',
      label: 'Panel Principal',
      icon: LayoutDashboard,
      onClick: () => navigate('/admin/dashboard')
    },
    {
      id: '/admin/cuenta',
      label: 'Mi Cuenta',
      icon: Users,
      onClick: () => navigate('/admin/cuenta')
    },
    {
      id: '/admin/usuarios',
      label: 'Gestión Usuarios',
      icon: Users,
      onClick: () => navigate('/admin/usuarios')
    },
    {
      id: '/admin/reportes',
      label: 'Resportes',
      icon: UserCheck,
      onClick: () => navigate('/admin/reportes')
    }
  ];

  return (
    <Sidebar
      title="Admin Panel"
      user={user}
      menuItems={adminMenuItems}
      onLogout={handleLogout}
      activeItem={location.pathname}
    />
  );
};