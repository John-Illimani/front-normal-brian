import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Award, Calendar, User } from 'lucide-react';
import { Sidebar } from './Sidebar';

export const AtletaSidebar = ({ setAuthToken }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (setAuthToken) setAuthToken(null);
    navigate('/login', { replace: true });
  };

  const atletaMenuItems = [

   
    {
      id: '/atleta/dashboard',
      label: 'Panel Principal',
      icon: LayoutDashboard,
      onClick: () => navigate('/atleta/dashboard')
    },
     {
      id: '/atleta/cuenta',
      label: 'Mi Cuenta',
      icon: Award,
      onClick: () => navigate('/atleta/cuenta')
    },
    
    {
      id: '/atleta/fichas',
      label: 'Fichas deportivas',
      icon: Award,
      onClick: () => navigate('/atleta/fichas')
    }
    
  
  ];

  return (
    <Sidebar
      title="Panel Atleta"
      user={user}
      menuItems={atletaMenuItems}
      onLogout={handleLogout}
      activeItem={location.pathname}
    />
  );
};