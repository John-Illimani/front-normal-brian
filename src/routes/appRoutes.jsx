import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

import { Login } from "../pages/auth/Login";
import { AdminDashboard } from "../pages/administrador/AdminDashboard";
import { AdminSidebar } from "../components/layouts/AdminSidebar";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { AdminUsuarios } from "../pages/administrador/AdminUsuarios";
import { ReportesUsuarios } from "../pages/administrador/ReportesUsuarios";
import { AtletaDashboard } from "../pages/atleta/AtletaDashboard";
import { AtletaSidebar } from "../components/layouts/AtletaSidebar";
import { MiFichaDeportiva } from "../pages/atleta/MiFichaDeportiva";
import { MiCuentaAtleta } from "../pages/atleta/MiCuentaAtleta";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        {/* Rutas protegidas para Administrador */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminSidebar />}>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="usuarios" element={<AdminUsuarios />} />
            <Route path="reportes" element={<ReportesUsuarios />} />
          </Route>
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["atleta"]} />}>
          <Route path="/atleta" element={<AtletaSidebar />}>
            <Route index element={<AtletaDashboard />} />
            <Route path="dashboard" element={<AtletaDashboard />} />
            <Route path="fichas" element={<MiFichaDeportiva />} />
            <Route path="reportes" element={<ReportesUsuarios />} />
            <Route path="cuenta" element={<MiCuentaAtleta />} />
          </Route>
        </Route>
    
        {/* Redirección para rutas no encontradas */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;