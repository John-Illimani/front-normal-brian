import React, { useState, useEffect } from "react";
import { 
  User, Key, CreditCard, Mail, ShieldCheck, 
  Save, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, X, Sparkles
} from "lucide-react";
import { updateUserRequest } from "../../services/user.service";

export const MiCuentaAtleta = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState(null);

  // Obtener datos del usuario autenticado desde el localStorage (igual a MiFichaDeportiva)
  const userLogged = JSON.parse(localStorage.getItem("user") || "{}");

  // Estado del formulario con datos del usuario en sesión
  const [formData, setFormData] = useState({
    id: userLogged.id || "",
    nombre: userLogged.nombre || "",
    apellido: userLogged.apellido || "",
    ci: userLogged.ci || "",
    username: userLogged.username || "",
    email: userLogged.email || "",
    password: "", // Vacío por defecto
    rol: userLogged.rol || "atleta",
  });

  const showNotification = (type, title, message) => {
    setNotification({ type, title, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.email) {
      showNotification("error", "Campos Requeridos", "El nombre de usuario y el correo son obligatorios.");
      return;
    }

    setLoading(true);

    try {
      // Construir payload
      const payload = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        ci: formData.ci,
        username: formData.username,
        email: formData.email,
        rol: formData.rol,
      };

      // Si el atleta ingresó una nueva contraseña, la incluimos
      if (formData.password && formData.password.trim() !== "") {
        payload.password = formData.password;
      }

      // Llamada al endpoint de actualización
      const res = await updateUserRequest(formData.id, payload);

      // Actualizar los datos locales del usuario en el localStorage
      const updatedUser = {
        ...userLogged,
        nombre: formData.nombre,
        apellido: formData.apellido,
        ci: formData.ci,
        username: formData.username,
        email: formData.email,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // Limpiar el campo de contraseña
      setFormData((prev) => ({ ...prev, password: "" }));

      showNotification("success", "¡Perfil Actualizado!", "Tus datos de acceso y perfil han sido guardados correctamente.");
    } catch (err) {
      console.error("Error al actualizar cuenta:", err);
      showNotification("error", "Error al Actualizar", err.response?.data?.message || "No se pudieron actualizar tus datos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl border backdrop-blur-md ${
            notification.type === "success" 
              ? "bg-white/95 border-emerald-300 text-emerald-900 shadow-emerald-900/10" 
              : "bg-white/95 border-rose-300 text-rose-900 shadow-rose-900/10"
          }`}>
            {notification.type === "success" ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-rose-600" />}
            <div>
              <p className="text-sm font-bold leading-none">{notification.title}</p>
              <p className="text-xs text-slate-600 mt-1">{notification.message}</p>
            </div>
            <button onClick={() => setNotification(null)} className="ml-2 text-slate-400 hover:text-slate-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-bold text-xl flex items-center justify-center shadow-md">
            <User className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center space-x-2 bg-indigo-500/20 text-indigo-300 text-xs font-semibold px-3 py-1 rounded-full mb-1 backdrop-blur-md">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Ajustes de Cuenta Atleta</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">Mi Perfil y Credenciales</h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Actualiza tu información personal, nombre de usuario y contraseña de acceso.
            </p>
          </div>
        </div>
      </header>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        
        {/* Sección: Información Personal */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Datos Personales</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nombre(s) *</label>
              <input 
                type="text" 
                name="nombre"
                required 
                placeholder="Ej. Brian"
                value={formData.nombre} 
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Apellido(s) *</label>
              <input 
                type="text" 
                name="apellido"
                required 
                placeholder="Ej. Mamani"
                value={formData.apellido} 
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" 
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Carnet de Identidad (CI)</label>
              <div className="relative">
                <input 
                  type="text" 
                  name="ci"
                  placeholder="Ej. 1234567"
                  value={formData.ci} 
                  onChange={handleChange}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" 
                />
                <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>
        </div>

        {/* Sección: Credenciales de Acceso */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
            <Key className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Credenciales de Inicio de Sesión</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nombre de Usuario (Username) *</label>
              <div className="relative">
                <input 
                  type="text" 
                  name="username"
                  required 
                  placeholder="Ej. brian123"
                  value={formData.username} 
                  onChange={handleChange}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-indigo-50/50 border border-indigo-200 rounded-xl text-xs font-mono font-bold text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" 
                />
                <User className="w-4 h-4 text-indigo-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Correo Electrónico *</label>
              <div className="relative">
                <input 
                  type="email" 
                  name="email"
                  required 
                  placeholder="atleta@deporte.gob.bo"
                  value={formData.email} 
                  onChange={handleChange}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" 
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nueva Contraseña <span className="font-normal text-slate-400">(Dejar en blanco si no deseas cambiarla)</span>
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password"
                  placeholder="••••••••••••"
                  value={formData.password} 
                  onChange={handleChange}
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" 
                />
                <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Botón Guardar */}
        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center space-x-2 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Guardar Cambios de Mi Cuenta</span>
          </button>
        </div>

      </form>

    </div>
  );
};