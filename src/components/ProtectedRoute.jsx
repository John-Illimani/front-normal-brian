import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export const ProtectedRoute = ({ allowedRoles }) => {
  // Obtener el token y los datos del usuario desde localStorage
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // 1. Si no existe token de autenticación, redirigir al Login
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // 2. Si se especifican roles permitidos y el rol del usuario no coincide
  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    // Redirigir según el rol que tenga el usuario para evitar acceso no autorizado
    if (user.rol === "atleta") {
      return <Navigate to="/atleta/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  // 3. Si pasa la autenticación y los permisos, renderiza las rutas hijas
  return <Outlet />;
};