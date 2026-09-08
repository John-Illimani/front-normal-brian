import React, { useState, useEffect, useDeferredValue, useMemo } from "react";
import {
  getAtletasRequest,
  getAtletaCurriculumRequest,
  createAtletaRequest,
  updateAtletaRequest,
  deleteAtletaRequest,
} from "../services/api.jsx";
import { generarFichaPDF, generarReporteMasivoPDF } from "./normal.js";
import {
  Search, Plus, Trash2, Edit3, FileDown, Loader2, X, RefreshCw,
  Users, CheckCircle2, AlertCircle, Camera, Award,
  DownloadCloud, ShieldCheck, Trophy, ImagePlus, PlusCircle, Calendar,
  Activity
} from "lucide-react";

export default function AtletasManager() {
  const [atletas, setAtletas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearch = useDeferredValue(searchTerm);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState("perfil");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [notification, setNotification] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  // 1. Estado Perfil Principal
  const initialPerfilState = {
    disciplina_encabezado: "Gimnasia Artística Femenina",
    categoria_encabezado: "Juvenil",
    gestion: "2026",
    nombre_completo: "",
    fecha_nacimiento: "",
    lugar_nacimiento_departamento: "La Paz",
    club: "",
    asociacion_departamental: "",
    disciplina: "Gimnasia Artística",
    categoria: "Juvenil",
    nivel: "Nivel FIG",
    anio_inicio_gimnasia: "",
    entrenador_actual: "",
    anios_experiencia_competitiva: "",
    estatura_cm: "",
    peso_kg: "",
    aparato_especialidad_destacada: "",
    horas_entrenamiento_semanal: "",
    resena_perfil_deportivo: "",
    numero_convocatorias_seleccion: 0,
    medallero_internacional_oro: 0,
    medallero_internacional_plata: 0,
    medallero_internacional_bronce: 0,
    finales_internacionales: 0,
    medallero_nacional_oro: 0,
    medallero_nacional_plata: 0,
    medallero_nacional_bronce: 0,
    ranking_nacional_actual: "",
    mejor_clasificacion_internacional: "",
    objetivo_corto_plazo: "",
    objetivo_mediano_plazo: "",
    objetivo_deportivo_principal: "",
    proxima_competencia_objetivo: "",
    proyeccion_fecha_sede: "",
    proyeccion_meta_deportiva: "",
    proyeccion_clasificacion_requerida: "",
    equipo_entrenador_principal: "",
    equipo_entrenador_asistente: "",
    equipo_club: "",
    equipo_asociacion: "",
    equipo_federacion: "Federación Boliviana de Gimnasia",
    resumen_principal_logro: "",
    foto_en_competencia_url: "",
    foto_en_podio_premiacion_url: "",
    foto_representando_a_bolivia_url: "",
    ultima_actualizacion: new Date().toISOString().split("T")[0]
  };

  const [perfil, setPerfil] = useState(initialPerfilState);

  // 2. Estados de Tablas Dinámicas con Filas Múltiples
  const [repNacional, setRepNacional] = useState([]);
  const [resInternacionales, setResInternacionales] = useState([]);
  const [resNacionales, setResNacionales] = useState([]);
  const [logros, setLogros] = useState([]);
  const [participaciones, setParticipaciones] = useState([]);
  const [evolucion, setEvolucion] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [reconocimientos, setReconocimientos] = useState([]);

  const showNotification = (type, title, message) => {
    setNotification({ type, title, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getAtletasRequest(1, 200);
      setAtletas(res.data.data || []);
    } catch {
      showNotification("error", "Error de conexión", "No se pudo sincronizar la lista de atletas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compresión y Conversión de Imagen en Canvas
  const handleImageUpload = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const MAX = 1000;

        if (width > height && width > MAX) {
          height = Math.round((height * MAX) / width);
          width = MAX;
        } else if (height > MAX) {
          width = Math.round((width * MAX) / height);
          height = MAX;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.75);
        setPerfil((prev) => ({ ...prev, [field]: compressedBase64 }));
      };
    };
    reader.readAsDataURL(file);
  };

  // Cálculo del Resumen Ejecutivo en Tiempo Real
  const resumenCalculado = useMemo(() => {
    const medallasNac = (Number(perfil.medallero_nacional_oro) || 0) + 
                        (Number(perfil.medallero_nacional_plata) || 0) + 
                        (Number(perfil.medallero_nacional_bronce) || 0);

    const medallasInt = (Number(perfil.medallero_internacional_oro) || 0) + 
                        (Number(perfil.medallero_internacional_plata) || 0) + 
                        (Number(perfil.medallero_internacional_bronce) || 0);

    return {
      trayectoria: perfil.anios_experiencia_competitiva || 0,
      participacionesInt: participaciones.length,
      convocatorias: repNacional.length || perfil.numero_convocatorias_seleccion || 0,
      medallasNac,
      medallasInt,
      principalLogro: perfil.resumen_principal_logro || "No especificado",
      ultimaActualizacion: perfil.ultima_actualizacion || new Date().toISOString().split("T")[0]
    };
  }, [perfil, participaciones, repNacional]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      perfil,
      representacion_nacional: repNacional,
      resultados_internacionales: resInternacionales,
      resultados_nacionales: resNacionales,
      principales_logros_deportivos: logros,
      participaciones_internacionales: participaciones,
      evolucion_deportiva: evolucion,
      marcas_personales: marcas,
      reconocimientos: reconocimientos
    };

    try {
      if (selectedId) {
        await updateAtletaRequest(selectedId, payload);
        showNotification("success", "Actualización Exitosa", "Currículum oficial modificado en el sistema.");
      } else {
        await createAtletaRequest(payload);
        showNotification("success", "Registro Exitoso", "Atleta inscrito en la nómina oficial de la FBG.");
      }
      setIsModalOpen(false);
      resetAllForms();
      loadData();
    } catch (err) {
      showNotification("error", "Error de Procesamiento", err.response?.data?.detalle || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (atleta) => {
    setSelectedId(atleta.id);
    setLoading(true);
    try {
      const res = await getAtletaCurriculumRequest(atleta.id);
      const data = res.data;
      setPerfil({
        ...data.perfil,
        fecha_nacimiento: data.perfil.fecha_nacimiento?.split("T")[0] || "",
        ultima_actualizacion: data.perfil.ultima_actualizacion?.split("T")[0] || new Date().toISOString().split("T")[0]
      });
      setRepNacional(data.representacion_nacional || []);
      setResInternacionales(data.resultados_internacionales || []);
      setResNacionales(data.resultados_nacionales || []);
      setLogros(data.principales_logros_deportivos || []);
      setParticipaciones(data.participaciones_internacionales || []);
      setEvolucion(data.evolucion_deportiva || []);
      setMarcas(data.marcas_personales || []);
      setReconocimientos(data.reconocimientos || []);
      setActiveFormTab("perfil");
      setIsModalOpen(true);
    } catch {
      showNotification("error", "Error", "No se pudo recuperar la ficha completa del atleta.");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await deleteAtletaRequest(deleteConfirmId);
      setAtletas((prev) => prev.filter((item) => item.id !== deleteConfirmId));
      showNotification("success", "Eliminación Completa", "El registro del atleta ha sido removido con éxito.");
    } catch {
      showNotification("error", "Error", "No se pudo eliminar el registro seleccionado.");
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const resetAllForms = () => {
    setSelectedId(null);
    setPerfil(initialPerfilState);
    setRepNacional([]);
    setResInternacionales([]);
    setResNacionales([]);
    setLogros([]);
    setParticipaciones([]);
    setEvolucion([]);
    setMarcas([]);
    setReconocimientos([]);
  };

  const filteredAtletas = atletas.filter((a) => {
    const term = deferredSearch.toLowerCase();
    return (
      a.id.toString().includes(term) ||
      a.nombre_completo.toLowerCase().includes(term) ||
      a.disciplina?.toLowerCase().includes(term) ||
      a.lugar_nacimiento_departamento?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans selection:bg-amber-500 selection:text-white">
      
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
            <button onClick={() => setNotification(null)} className="ml-2 text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      {/* NAVBAR: Azul Marino Profundo con Burbujas de Cristal e Identidad FBG */}
      <nav className="sticky top-0 z-40 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white shadow-xl border-b border-amber-500/30 overflow-hidden">
        {/* Efecto de burbujas flotantes en Navbar */}
        <div className="absolute inset-0 pointer-events-none opacity-25">
          <div className="absolute -top-6 left-12 w-24 h-24 bg-cyan-400 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-2 right-1/4 w-16 h-16 bg-amber-400 rounded-full blur-lg animate-pulse delay-700"></div>
          <div className="absolute -bottom-8 right-16 w-28 h-28 bg-indigo-500 rounded-full blur-2xl animate-pulse delay-1000"></div>
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:16px_16px]"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo y Membrete Institucional */}
          <div className="flex items-center gap-3.5 w-full md:w-auto">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-amber-200 rounded-full blur-sm opacity-70 group-hover:opacity-100 transition duration-300"></div>
              <img
                src="/normal.jpg"
                alt="Logo Normal"
                className="relative w-12 h-12 rounded-full object-cover border-2 border-amber-400/80 shadow-md bg-slate-900"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight bg-gradient-to-r from-amber-300 via-yellow-100 to-white bg-clip-text text-transparent">
                  ESFM WARISATA
                </span>
                <span className="px-2 py-0.5 text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-400/40 rounded-full uppercase tracking-wider">
                  FBG GESTIÓN
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium tracking-wide">
                Federación Boliviana de Gimnasia · Sistema de Fichas Oficiales
              </p>
            </div>
          </div>

          {/* Botonera de Acción Navbar */}
          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
            <button
              onClick={() => { resetAllForms(); setActiveFormTab("perfil"); setIsModalOpen(true); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" /> Inscribir Atleta FBG
            </button>
            <button
              onClick={() => generarReporteMasivoPDF(filteredAtletas, searchTerm || "General")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 shadow-sm active:scale-95 transition-all cursor-pointer"
              title="Descargar reporte en formato apaisado con los atletas filtrados"
            >
              <DownloadCloud className="w-4 h-4 text-cyan-300" /> Nómina Oficial ({filteredAtletas.length})
            </button>
          </div>
        </div>
      </nav>

      {/* CONTENIDO PRINCIPAL: Ambiente Luminoso y Profesional */}
      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        
        {/* Métricas Visuales Superior */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="p-3.5 bg-blue-50 border border-blue-100 rounded-2xl text-blue-800">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Atletas en Nómina</p>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">{atletas.length}</h3>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="p-3.5 bg-amber-50 border border-amber-100 rounded-2xl text-amber-700">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Categorías Activas</p>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">
                {[...new Set(atletas.map((a) => a.categoria || "General"))].length}
              </h3>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-800">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Registros Filtrados</p>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">{filteredAtletas.length}</h3>
            </div>
          </div>
        </div>

        {/* Barra de Búsqueda y Recarga */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por ID, nombre, club, disciplina o depto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900 transition-all shadow-inner"
            />
          </div>
          <button 
            onClick={loadData} 
            className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 transition-all shadow-sm self-end sm:self-auto cursor-pointer"
            title="Sincronizar base de datos"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-blue-900" : ""}`} />
          </button>
        </div>

        {/* TABLA PRINCIPAL DE ATLETAS */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Atleta</th>
                  <th className="px-6 py-4">Disciplina / Categoría</th>
                  <th className="px-6 py-4">Club / Asociación</th>
                  <th className="px-6 py-4 text-center">Fotografías</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && atletas.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-16 text-slate-400">
                      <Loader2 className="w-7 h-7 animate-spin mx-auto text-blue-900 mb-2" />
                      Cargando registros oficiales...
                    </td>
                  </tr>
                ) : filteredAtletas.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-16 text-slate-400 font-medium">
                      No se encontraron atletas que coincidan con la búsqueda.
                    </td>
                  </tr>
                ) : (
                  filteredAtletas.map((a) => (
                    <tr key={a.id} className="hover:bg-blue-50/40 transition-colors group">
                      <td className="px-6 py-4 font-mono font-bold text-blue-950">#{a.id}</td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 group-hover:text-blue-950 transition-colors">{a.nombre_completo}</div>
                        <div className="text-xs text-slate-500 font-medium">{a.lugar_nacimiento_departamento || a.departamento || "La Paz"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-900 border border-blue-200">
                          {a.disciplina}
                        </span>
                        <span className="block text-xs text-slate-500 font-medium mt-0.5">{a.categoria || "Juvenil"} · {a.nivel || "Nivel FIG"}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-800 font-semibold">{a.club || "Independiente"}</span>
                        <span className="block text-xs text-slate-500">{a.asociacion_departamental || "Asoc. Departamental"}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                          <Camera className="w-3.5 h-3.5 text-blue-800" /> Galería FBG
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-1">
                        <button
                          onClick={async () => {
                            const res = await getAtletaCurriculumRequest(a.id);
                            generarFichaPDF(res.data);
                          }}
                          className="p-2 text-slate-600 hover:text-blue-950 hover:bg-blue-50 rounded-xl transition-all inline-block cursor-pointer"
                          title="Descargar Ficha Deportiva Oficial (PDF)"
                        >
                          <FileDown className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEdit(a)} 
                          className="p-2 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-xl transition-all inline-block cursor-pointer" 
                          title="Editar Ficha"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setDeleteConfirmId(a.id)} 
                          className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all inline-block cursor-pointer" 
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* MODAL INTEGRAL CON 16 SECCIONES Y TABLAS DINÁMICAS */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white border border-slate-200 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
            
            {/* Header Modal */}
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-200 bg-gradient-to-r from-slate-900 to-blue-950 text-white">
              <div>
                <h2 className="text-base sm:text-lg font-bold flex items-center gap-2 text-white">
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                  {selectedId ? "Editar Currículum Oficial FBG" : "Inscripción Oficial de Atleta FBG"}
                </h2>
                <p className="text-xs text-slate-300 mt-0.5 font-medium">Federación Boliviana de Gimnasia · ESFM Warisata</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Pestañas del Formulario */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-2 pt-2.5 overflow-x-auto">
              {[
                { id: "perfil", label: "1. Perfil & Personal" },
                { id: "tablas_competitivas", label: "2. Convocatorias & Resultados" },
                { id: "logros_evolucion", label: "3. Logros & Evolución" },
                { id: "proyeccion_equipo", label: "4. Proyección & Equipo" },
                { id: "galeria", label: "5. Galería (Fotos)" },
                { id: "resumen", label: "6. Resumen Ejecutivo" }
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveFormTab(t.id)}
                  className={`px-4 py-2 text-xs font-bold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                    activeFormTab === t.id 
                      ? "border-blue-950 text-blue-950 bg-white rounded-t-xl shadow-xs" 
                      : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 bg-white text-slate-800">
              
              {/* TAB 1: PERFIL & DATOS DEPORTIVOS */}
              {activeFormTab === "perfil" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Disciplina Encabezado</label>
                      <input type="text" value={perfil.disciplina_encabezado} onChange={e => setPerfil({...perfil, disciplina_encabezado: e.target.value})} className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Categoría Encabezado</label>
                      <input type="text" value={perfil.categoria_encabezado} onChange={e => setPerfil({...perfil, categoria_encabezado: e.target.value})} className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Gestión</label>
                      <input type="text" value={perfil.gestion} onChange={e => setPerfil({...perfil, gestion: e.target.value})} className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Nombre Completo del Atleta *</label>
                      <input type="text" required value={perfil.nombre_completo} onChange={e => setPerfil({...perfil, nombre_completo: e.target.value})} className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Fecha de Nacimiento *</label>
                      <input type="date" required value={perfil.fecha_nacimiento} onChange={e => setPerfil({...perfil, fecha_nacimiento: e.target.value})} className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Lugar Nacimiento / Depto</label>
                      <input type="text" value={perfil.lugar_nacimiento_departamento} onChange={e => setPerfil({...perfil, lugar_nacimiento_departamento: e.target.value})} className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Club</label>
                      <input type="text" value={perfil.club} onChange={e => setPerfil({...perfil, club: e.target.value})} className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Asociación Departamental</label>
                      <input type="text" value={perfil.asociacion_departamental} onChange={e => setPerfil({...perfil, asociacion_departamental: e.target.value})} className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Disciplina *</label>
                      <input type="text" required value={perfil.disciplina} onChange={e => setPerfil({...perfil, disciplina: e.target.value})} className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Categoría / Nivel</label>
                      <input type="text" value={perfil.categoria} onChange={e => setPerfil({...perfil, categoria: e.target.value})} placeholder="Ej. Juvenil · Nivel FIG" className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-3 border-t border-slate-100">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Estatura (cm)</label>
                      <input type="number" step="0.1" value={perfil.estatura_cm} onChange={e => setPerfil({...perfil, estatura_cm: e.target.value})} className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Peso (kg)</label>
                      <input type="number" step="0.1" value={perfil.peso_kg} onChange={e => setPerfil({...perfil, peso_kg: e.target.value})} className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Horas Entreno / Sem</label>
                      <input type="number" value={perfil.horas_entrenamiento_semanal} onChange={e => setPerfil({...perfil, horas_entrenamiento_semanal: e.target.value})} className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Años Experiencia</label>
                      <input type="number" value={perfil.anios_experiencia_competitiva} onChange={e => setPerfil({...perfil, anios_experiencia_competitiva: e.target.value})} className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none" />
                    </div>
                    <div className="sm:col-span-4">
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">3. Breve Reseña del Perfil Deportivo</label>
                      <textarea rows="3" value={perfil.resena_perfil_deportivo} onChange={e => setPerfil({...perfil, resena_perfil_deportivo: e.target.value})} placeholder="Trayectoria, fortalezas, experiencia competitiva..." className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none"></textarea>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CONVOCATORIAS & RESULTADOS */}
              {activeFormTab === "tablas_competitivas" && (
                <div className="space-y-6">
                  
                  {/* Sección 4: Representación Nacional */}
                  <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-blue-950 uppercase">4. Representación Nacional (Convocatorias)</span>
                      <button
                        type="button"
                        onClick={() => setRepNacional([...repNacional, { anio: new Date().getFullYear(), categoria: "", disciplina: "", evento_convocatoria: "", sede: "" }])}
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-950 bg-blue-100 hover:bg-blue-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                      >
                        <PlusCircle className="w-3.5 h-3.5" /> Aumentar Convocatoria
                      </button>
                    </div>
                    {repNacional.map((r, i) => (
                      <div key={i} className="grid grid-cols-1 sm:grid-cols-6 gap-2 items-center bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                        <input type="number" placeholder="Año" value={r.anio} onChange={e => { const n = [...repNacional]; n[i].anio = e.target.value; setRepNacional(n); }} className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
                        <input type="text" placeholder="Categoría" value={r.categoria} onChange={e => { const n = [...repNacional]; n[i].categoria = e.target.value; setRepNacional(n); }} className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
                        <input type="text" placeholder="Disciplina" value={r.disciplina} onChange={e => { const n = [...repNacional]; n[i].disciplina = e.target.value; setRepNacional(n); }} className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
                        <input type="text" placeholder="Evento / Convocatoria" value={r.evento_convocatoria} onChange={e => { const n = [...repNacional]; n[i].evento_convocatoria = e.target.value; setRepNacional(n); }} className="sm:col-span-2 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
                        <div className="flex items-center gap-2">
                          <input type="text" placeholder="Sede" value={r.sede} onChange={e => { const n = [...repNacional]; n[i].sede = e.target.value; setRepNacional(n); }} className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
                          <button type="button" onClick={() => setRepNacional(repNacional.filter((_, idx) => idx !== i))} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Sección 5: Resultados Internacionales */}
                  <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-blue-950 uppercase">5. Resultados Internacionales</span>
                      <button
                        type="button"
                        onClick={() => setResInternacionales([...resInternacionales, { anio: new Date().getFullYear(), competencia: "", pais_ciudad: "", categoria: "", aparato_prueba: "", posicion: "", puntaje: "" }])}
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-950 bg-blue-100 hover:bg-blue-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                      >
                        <PlusCircle className="w-3.5 h-3.5" /> Aumentar Resultado Int.
                      </button>
                    </div>
                    {resInternacionales.map((r, i) => (
                      <div key={i} className="grid grid-cols-1 sm:grid-cols-7 gap-2 items-center bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                        <input type="number" placeholder="Año" value={r.anio} onChange={e => { const n = [...resInternacionales]; n[i].anio = e.target.value; setResInternacionales(n); }} className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
                        <input type="text" placeholder="Competencia" value={r.competencia} onChange={e => { const n = [...resInternacionales]; n[i].competencia = e.target.value; setResInternacionales(n); }} className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
                        <input type="text" placeholder="País/Ciudad" value={r.pais_ciudad} onChange={e => { const n = [...resInternacionales]; n[i].pais_ciudad = e.target.value; setResInternacionales(n); }} className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
                        <input type="text" placeholder="Prueba" value={r.aparato_prueba} onChange={e => { const n = [...resInternacionales]; n[i].aparato_prueba = e.target.value; setResInternacionales(n); }} className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
                        <input type="text" placeholder="Posición" value={r.posicion} onChange={e => { const n = [...resInternacionales]; n[i].posicion = e.target.value; setResInternacionales(n); }} className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
                        <input type="number" step="0.001" placeholder="Puntaje" value={r.puntaje} onChange={e => { const n = [...resInternacionales]; n[i].puntaje = e.target.value; setResInternacionales(n); }} className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
                        <button type="button" onClick={() => setResInternacionales(resInternacionales.filter((_, idx) => idx !== i))} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg justify-self-center cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>

                  {/* Sección 6: Resultados Nacionales */}
                  <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-blue-950 uppercase">6. Resultados Nacionales</span>
                      <button
                        type="button"
                        onClick={() => setResNacionales([...resNacionales, { anio: new Date().getFullYear(), campeonato: "", ciudad: "", categoria: "", aparato_prueba: "", posicion: "", puntaje: "" }])}
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-950 bg-blue-100 hover:bg-blue-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                      >
                        <PlusCircle className="w-3.5 h-3.5" /> Aumentar Resultado Nac.
                      </button>
                    </div>
                    {resNacionales.map((r, i) => (
                      <div key={i} className="grid grid-cols-1 sm:grid-cols-7 gap-2 items-center bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                        <input type="number" placeholder="Año" value={r.anio} onChange={e => { const n = [...resNacionales]; n[i].anio = e.target.value; setResNacionales(n); }} className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
                        <input type="text" placeholder="Campeonato" value={r.campeonato} onChange={e => { const n = [...resNacionales]; n[i].campeonato = e.target.value; setResNacionales(n); }} className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
                        <input type="text" placeholder="Ciudad" value={r.ciudad} onChange={e => { const n = [...resNacionales]; n[i].ciudad = e.target.value; setResNacionales(n); }} className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
                        <input type="text" placeholder="Prueba" value={r.aparato_prueba} onChange={e => { const n = [...resNacionales]; n[i].aparato_prueba = e.target.value; setResNacionales(n); }} className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
                        <input type="text" placeholder="Posición" value={r.posicion} onChange={e => { const n = [...resNacionales]; n[i].posicion = e.target.value; setResNacionales(n); }} className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
                        <input type="number" step="0.001" placeholder="Puntaje" value={r.puntaje} onChange={e => { const n = [...resNacionales]; n[i].puntaje = e.target.value; setResNacionales(n); }} className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
                        <button type="button" onClick={() => setResNacionales(resNacionales.filter((_, idx) => idx !== i))} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg justify-self-center cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>

                </div>
              )}

              {/* TAB 3: LOGROS & EVOLUCIÓN */}
              {activeFormTab === "logros_evolucion" && (
                <div className="space-y-6">
                  
                  {/* Sección 7: Logros */}
                  <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-blue-950 uppercase">7. Principales Logros Deportivos</span>
                      <button type="button" onClick={() => setLogros([...logros, { anio: new Date().getFullYear(), descripcion_logro: "" }])} className="inline-flex items-center gap-1 text-xs font-bold text-blue-950 bg-blue-100 hover:bg-blue-200 px-3 py-1.5 rounded-xl cursor-pointer">
                        <PlusCircle className="w-3.5 h-3.5" /> Aumentar Logro
                      </button>
                    </div>
                    {logros.map((l, i) => (
                      <div key={i} className="flex gap-2 items-center bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                        <input type="number" placeholder="Año" value={l.anio} onChange={e => { const n = [...logros]; n[i].anio = e.target.value; setLogros(n); }} className="w-28 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
                        <input type="text" placeholder="Descripción del logro destacado" value={l.descripcion_logro} onChange={e => { const n = [...logros]; n[i].descripcion_logro = e.target.value; setLogros(n); }} className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
                        <button type="button" onClick={() => setLogros(logros.filter((_, idx) => idx !== i))} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>

                  {/* Sección 9: Evolución */}
                  <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-blue-950 uppercase">9. Evolución Deportiva</span>
                      <button type="button" onClick={() => setEvolucion([...evolucion, { gestion: new Date().getFullYear(), categoria_nivel: "", mejor_resultado: "", principal_avance: "" }])} className="inline-flex items-center gap-1 text-xs font-bold text-blue-950 bg-blue-100 hover:bg-blue-200 px-3 py-1.5 rounded-xl cursor-pointer">
                        <PlusCircle className="w-3.5 h-3.5" /> Aumentar Gestión
                      </button>
                    </div>
                    {evolucion.map((ev, i) => (
                      <div key={i} className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                        <input type="number" placeholder="Gestión" value={ev.gestion} onChange={e => { const n = [...evolucion]; n[i].gestion = e.target.value; setEvolucion(n); }} className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
                        <input type="text" placeholder="Categoría / Nivel" value={ev.categoria_nivel} onChange={e => { const n = [...evolucion]; n[i].categoria_nivel = e.target.value; setEvolucion(n); }} className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
                        <input type="text" placeholder="Mejor Resultado" value={ev.mejor_resultado} onChange={e => { const n = [...evolucion]; n[i].mejor_resultado = e.target.value; setEvolucion(n); }} className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
                        <input type="text" placeholder="Principal Avance Técnico" value={ev.principal_avance} onChange={e => { const n = [...evolucion]; n[i].principal_avance = e.target.value; setEvolucion(n); }} className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
                        <button type="button" onClick={() => setEvolucion(evolucion.filter((_, idx) => idx !== i))} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg justify-self-center cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>

                  {/* Sección 10: Marcas Personales */}
                  <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-blue-950 uppercase">10. Marcas Personales</span>
                      <button type="button" onClick={() => setMarcas([...marcas, { aparato_prueba: "", mejor_puntaje: "", competencia: "", anio: new Date().getFullYear() }])} className="inline-flex items-center gap-1 text-xs font-bold text-blue-950 bg-blue-100 hover:bg-blue-200 px-3 py-1.5 rounded-xl cursor-pointer">
                        <PlusCircle className="w-3.5 h-3.5" /> Aumentar Marca
                      </button>
                    </div>
                    {marcas.map((m, i) => (
                      <div key={i} className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                        <input type="text" placeholder="Aparato / Prueba" value={m.aparato_prueba} onChange={e => { const n = [...marcas]; n[i].aparato_prueba = e.target.value; setMarcas(n); }} className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
                        <input type="number" step="0.001" placeholder="Mejor Puntaje" value={m.mejor_puntaje} onChange={e => { const n = [...marcas]; n[i].mejor_puntaje = e.target.value; setMarcas(n); }} className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
                        <input type="text" placeholder="Competencia" value={m.competencia} onChange={e => { const n = [...marcas]; n[i].competencia = e.target.value; setMarcas(n); }} className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
                        <input type="number" placeholder="Año" value={m.anio} onChange={e => { const n = [...marcas]; n[i].anio = e.target.value; setMarcas(n); }} className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
                        <button type="button" onClick={() => setMarcas(marcas.filter((_, idx) => idx !== i))} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg justify-self-center cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>

                  {/* Sección 11: Reconocimientos */}
                  <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-blue-950 uppercase">11. Reconocimientos & Distinciones</span>
                      <button type="button" onClick={() => setReconocimientos([...reconocimientos, { anio: new Date().getFullYear(), reconocimiento_distincion: "", institucion: "" }])} className="inline-flex items-center gap-1 text-xs font-bold text-blue-950 bg-blue-100 hover:bg-blue-200 px-3 py-1.5 rounded-xl cursor-pointer">
                        <PlusCircle className="w-3.5 h-3.5" /> Aumentar Reconocimiento
                      </button>
                    </div>
                    {reconocimientos.map((rec, i) => (
                      <div key={i} className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                        <input type="number" placeholder="Año" value={rec.anio} onChange={e => { const n = [...reconocimientos]; n[i].anio = e.target.value; setReconocimientos(n); }} className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
                        <input type="text" placeholder="Distinción" value={rec.reconocimiento_distincion} onChange={e => { const n = [...reconocimientos]; n[i].reconocimiento_distincion = e.target.value; setReconocimientos(n); }} className="sm:col-span-2 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
                        <div className="flex items-center gap-2">
                          <input type="text" placeholder="Institución" value={rec.institucion} onChange={e => { const n = [...reconocimientos]; n[i].institucion = e.target.value; setReconocimientos(n); }} className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
                          <button type="button" onClick={() => setReconocimientos(reconocimientos.filter((_, idx) => idx !== i))} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              )}

              {/* TAB 4: OBJETIVOS, PROYECCIÓN & EQUIPO */}
              {activeFormTab === "proyeccion_equipo" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Ranking Nacional Actual</label>
                      <input type="number" value={perfil.ranking_nacional_actual} onChange={e => setPerfil({...perfil, ranking_nacional_actual: e.target.value})} className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Mejor Clasificación Internacional</label>
                      <input type="text" value={perfil.mejor_clasificacion_internacional} onChange={e => setPerfil({...perfil, mejor_clasificacion_internacional: e.target.value})} className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none" />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Objetivo Corto Plazo (12 meses)</label>
                      <input type="text" value={perfil.objetivo_corto_plazo} onChange={e => setPerfil({...perfil, objetivo_corto_plazo: e.target.value})} className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none" />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Objetivo Deportivo Principal</label>
                      <input type="text" value={perfil.objetivo_deportivo_principal} onChange={e => setPerfil({...perfil, objetivo_deportivo_principal: e.target.value})} className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Próxima Competencia Objetivo</label>
                      <input type="text" value={perfil.proxima_competencia_objetivo} onChange={e => setPerfil({...perfil, proxima_competencia_objetivo: e.target.value})} className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Fecha / Sede</label>
                      <input type="text" value={perfil.proyeccion_fecha_sede} onChange={e => setPerfil({...perfil, proyeccion_fecha_sede: e.target.value})} className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Entrenador/a Principal</label>
                      <input type="text" value={perfil.equipo_entrenador_principal} onChange={e => setPerfil({...perfil, equipo_entrenador_principal: e.target.value})} className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Entrenador/a Asistente</label>
                      <input type="text" value={perfil.equipo_entrenador_asistente} onChange={e => setPerfil({...perfil, equipo_entrenador_asistente: e.target.value})} className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none" />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: GALERÍA DE FOTOS BASE64 */}
              {activeFormTab === "galeria" && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl text-center space-y-3 shadow-2xs">
                    <span className="text-xs font-bold text-slate-700 block uppercase">Foto en Competencia</span>
                    <div className="w-full h-40 bg-white border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center overflow-hidden">
                      {perfil.foto_en_competencia_url ? (
                        <img src={perfil.foto_en_competencia_url} alt="Competencia" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-8 h-8 text-slate-400" />
                      )}
                    </div>
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-950 hover:bg-blue-900 text-white text-xs font-bold rounded-xl shadow-xs transition-all">
                      <ImagePlus className="w-3.5 h-3.5" /> Cargar Fotografía
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "foto_en_competencia_url")} />
                    </label>
                  </div>

                  <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl text-center space-y-3 shadow-2xs">
                    <span className="text-xs font-bold text-slate-700 block uppercase">Foto en Podio / Premiación</span>
                    <div className="w-full h-40 bg-white border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center overflow-hidden">
                      {perfil.foto_en_podio_premiacion_url ? (
                        <img src={perfil.foto_en_podio_premiacion_url} alt="Podio" className="w-full h-full object-cover" />
                      ) : (
                        <Award className="w-8 h-8 text-slate-400" />
                      )}
                    </div>
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-950 hover:bg-blue-900 text-white text-xs font-bold rounded-xl shadow-xs transition-all">
                      <ImagePlus className="w-3.5 h-3.5" /> Cargar Fotografía
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "foto_en_podio_premiacion_url")} />
                    </label>
                  </div>

                  <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl text-center space-y-3 shadow-2xs">
                    <span className="text-xs font-bold text-slate-700 block uppercase">Foto Rep. a Bolivia</span>
                    <div className="w-full h-40 bg-white border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center overflow-hidden">
                      {perfil.foto_representando_a_bolivia_url ? (
                        <img src={perfil.foto_representando_a_bolivia_url} alt="Bolivia" className="w-full h-full object-cover" />
                      ) : (
                        <Trophy className="w-8 h-8 text-slate-400" />
                      )}
                    </div>
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-950 hover:bg-blue-900 text-white text-xs font-bold rounded-xl shadow-xs transition-all">
                      <ImagePlus className="w-3.5 h-3.5" /> Cargar Fotografía
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "foto_representando_a_bolivia_url")} />
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 6: RESUMEN EJECUTIVO DINÁMICO */}
              {activeFormTab === "resumen" && (
                <div className="space-y-6">
                  
                  {/* Tarjetas de Indicadores */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl text-center shadow-2xs">
                      <Activity className="w-5 h-5 text-blue-950 mx-auto mb-1" />
                      <span className="text-[11px] text-slate-500 block font-bold">Trayectoria</span>
                      <span className="text-base font-black text-slate-900">{resumenCalculado.trayectoria} Años</span>
                    </div>
                    <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl text-center shadow-2xs">
                      <Trophy className="w-5 h-5 text-cyan-600 mx-auto mb-1" />
                      <span className="text-[11px] text-slate-500 block font-bold">Part. Internacionales</span>
                      <span className="text-base font-black text-slate-900">{resumenCalculado.participacionesInt}</span>
                    </div>
                    <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl text-center shadow-2xs">
                      <Users className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
                      <span className="text-[11px] text-slate-500 block font-bold">Convocatorias</span>
                      <span className="text-base font-black text-slate-900">{resumenCalculado.convocatorias}</span>
                    </div>
                    <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl text-center shadow-2xs">
                      <Award className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                      <span className="text-[11px] text-slate-500 block font-bold">Medallas Nac.</span>
                      <span className="text-base font-black text-slate-900">{resumenCalculado.medallasNac}</span>
                    </div>
                    <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl text-center shadow-2xs">
                      <Award className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                      <span className="text-[11px] text-slate-500 block font-bold">Medallas Int.</span>
                      <span className="text-base font-black text-slate-900">{resumenCalculado.medallasInt}</span>
                    </div>
                  </div>

                  {/* Campos Editables del Resumen */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-5 border border-slate-200 rounded-2xl">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Principal Logro del Atleta</label>
                      <input
                        type="text"
                        value={perfil.resumen_principal_logro}
                        onChange={e => setPerfil({...perfil, resumen_principal_logro: e.target.value})}
                        placeholder="Ej. Medalla de Plata en el Campeonato Sudamericano de Gimnasia"
                        className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900 shadow-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-blue-950" /> Última Actualización Oficial
                      </label>
                      <input
                        type="date"
                        value={perfil.ultima_actualizacion}
                        onChange={e => setPerfil({...perfil, ultima_actualizacion: e.target.value})}
                        className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none text-slate-800 shadow-xs"
                      />
                    </div>
                  </div>

                </div>
              )}

              {/* Botonera Inferior Modal */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 text-xs font-bold bg-gradient-to-r from-blue-950 to-slate-900 hover:from-blue-900 hover:to-slate-800 text-white rounded-xl shadow-md shadow-blue-950/20 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {selectedId ? "Guardar Modificaciones FBG" : "Registrar Ficha Oficial FBG"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Modal de Eliminación */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-3xl p-6 shadow-2xl text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xs">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">¿Eliminar Ficha de Atleta?</h3>
            <p className="text-xs text-slate-500 mt-2">
              Esta acción borrará de manera definitiva la ficha deportiva, fotografías y registros asociados en cascada.
            </p>
            <div className="flex items-center justify-center gap-3 mt-6">
              <button onClick={() => setDeleteConfirmId(null)} className="px-5 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer">
                Cancelar
              </button>
              <button onClick={confirmDelete} className="px-5 py-2.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md shadow-rose-600/20 transition-all active:scale-95 cursor-pointer">
                Eliminar Registro
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}