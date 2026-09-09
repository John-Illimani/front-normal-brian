import React, { useState, useEffect, useMemo } from "react";
import {
  getMiCurriculumRequest,
  saveMiCurriculumRequest,
  deleteMiCurriculumRequest,
} from "../../services/api.jsx";
import { generarFichaPDF } from "../normal.js";
import {
  FileDown, Loader2, CheckCircle2, AlertCircle, 
  Camera, Award, ShieldCheck, Trophy, ImagePlus, 
  User, Save, Trash2, X, FileText, Activity, Medal, Globe, ExternalLink, Eye, RefreshCw
} from "lucide-react";

export const MiFichaDeportiva = () => {
  const [loading, setLoading] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState("perfil");
  const [notification, setNotification] = useState(null);
  const [miAtletaId, setMiAtletaId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Estado para el modal de vista previa del PDF
  const [previewPdfModal, setPreviewPdfModal] = useState({ open: false, url: "", title: "" });

  // Obtener datos del usuario autenticado
  const userLogged = JSON.parse(localStorage.getItem("user") || "{}");

  const initialPerfilState = {
    disciplina_encabezado: "Gimnasia Artística Femenina",
    categoria_encabezado: "Junior",
    gestion: "2026",
    nombre_completo: userLogged.nombre || userLogged.apellido 
      ? `${userLogged.nombre || ''} ${userLogged.apellido || ''}`.trim() 
      : userLogged.username || "",
    fecha_nacimiento: "",
    lugar_nacimiento_departamento: "La Paz",
    club: "",
    asociacion_departamental: "",
    disciplina: "Gimnasia Artística",
    categoria: "Junior", // Age Group, Junior, Senior
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
    pdf_1_base64: "", pdf_1_nombre: "", pdf_1_url: "",
    pdf_2_base64: "", pdf_2_nombre: "", pdf_2_url: "",
    pdf_3_base64: "", pdf_3_nombre: "", pdf_3_url: "",
    medallas_personales_detalle: [],
    ultima_actualizacion: new Date().toISOString().split("T")[0]
  };

  const [perfil, setPerfil] = useState(initialPerfilState);
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

  // Cargar mi ficha propia al montar el componente
  const loadMiFicha = async () => {
    setLoading(true);
    try {
      const res = await getMiCurriculumRequest();
      if (res.data && res.data.perfil) {
        const data = res.data;
        setMiAtletaId(data.perfil.id);
        setPerfil({
          ...data.perfil,
          categoria: data.perfil.categoria || "Junior",
          fecha_nacimiento: data.perfil.fecha_nacimiento?.split("T")[0] || "",
          ultima_actualizacion: data.perfil.ultima_actualizacion?.split("T")[0] || new Date().toISOString().split("T")[0],
          medallas_personales_detalle: Array.isArray(data.perfil.medallas_personales_detalle)
            ? data.perfil.medallas_personales_detalle
            : []
        });
        setRepNacional(data.representacion_nacional || []);
        setResInternacionales(data.resultados_internacionales || []);
        setResNacionales(data.resultados_nacionales || []);
        setLogros(data.principales_logros_deportivos || []);
        setParticipaciones(data.participaciones_internacionales || []);
        setEvolucion(data.evolucion_deportiva || []);
        setMarcas(data.marcas_personales || []);
        setReconocimientos(data.reconocimientos || []);
      }
    } catch {
      setMiAtletaId(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMiFicha();
  }, []);

  // Compresión y conversión de imágenes a Base64
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

  // Cargar archivos PDF
  const handlePdfUpload = (e, keyBase64, keyNombre, keyUrl) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      showNotification("error", "Formato Inválido", "Solo se permiten documentos en formato PDF.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Result = event.target.result;
      setPerfil((prev) => ({
        ...prev,
        [keyBase64]: base64Result,
        [keyNombre]: file.name,
        [keyUrl]: base64Result
      }));
      showNotification("success", "Documento Cargado", `El archivo ${file.name} ha sido adjuntado.`);
    };
    reader.readAsDataURL(file);
  };

  // Eliminar PDF específico
  const handleRemovePdf = (keyBase64, keyNombre, keyUrl) => {
    setPerfil((prev) => ({
      ...prev,
      [keyBase64]: "",
      [keyNombre]: "",
      [keyUrl]: ""
    }));
    showNotification("success", "Documento Removido", "Se eliminó el archivo adjunto.");
  };

  // Abrir vista previa del PDF en modal o pestaña
  const handlePreviewPdf = (pdfUrlOrBase64, titleName) => {
    if (!pdfUrlOrBase64) return;
    
    try {
      if (pdfUrlOrBase64.startsWith("data:application/pdf;base64,")) {
        const base64Data = pdfUrlOrBase64.split(",")[1];
        const binaryString = window.atob(base64Data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: "application/pdf" });
        const blobUrl = URL.createObjectURL(blob);
        setPreviewPdfModal({ open: true, url: blobUrl, title: titleName });
      } else {
        setPreviewPdfModal({ open: true, url: pdfUrlOrBase64, title: titleName });
      }
    } catch (err) {
      showNotification("error", "Error", "No se pudo generar la vista previa del documento.");
    }
  };

  // Resumen en tiempo real
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
    };
  }, [perfil, participaciones, repNacional]);

  // Guardado global
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
      const res = await saveMiCurriculumRequest(payload);
      if (res.data?.id) setMiAtletaId(res.data.id);
      showNotification(
        "success", 
        miAtletaId ? "Ficha Actualizada" : "Ficha Creada", 
        "Tus datos e información deportiva han sido guardados con éxito."
      );
      loadMiFicha();
    } catch (err) {
      showNotification("error", "Error al Guardar", err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Eliminar Ficha
  const handleConfirmDelete = async () => {
    setLoading(true);
    try {
      await deleteMiCurriculumRequest();
      setMiAtletaId(null);
      setPerfil(initialPerfilState);
      setRepNacional([]);
      setResInternacionales([]);
      setResNacionales([]);
      setLogros([]);
      setParticipaciones([]);
      setEvolucion([]);
      setMarcas([]);
      setReconocimientos([]);
      setShowDeleteModal(false);
      showNotification("success", "Ficha Eliminada", "Tu registro deportivo ha sido removido completamente.");
    } catch (err) {
      showNotification("error", "Error al Eliminar", err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Descargar PDF
  const handleDownloadPDF = async () => {
    if (!miAtletaId) {
      showNotification("error", "Sin Ficha Registrada", "Debes guardar tu información antes de generar el PDF.");
      return;
    }
    try {
      const res = await getMiCurriculumRequest();
      generarFichaPDF(res.data);
    } catch {
      showNotification("error", "Error", "No se pudo generar el reporte en PDF.");
    }
  };

  const pdfConfig = [
    { num: 1, label: "Documento #1: Pasaporte", base64Key: "pdf_1_base64", nameKey: "pdf_1_nombre", urlKey: "pdf_1_url" },
    { num: 2, label: "Documento #2: Certificación WADA", base64Key: "pdf_2_base64", nameKey: "pdf_2_nombre", urlKey: "pdf_2_url" },
    { num: 3, label: "Documento #3: Carnet de Identidad", base64Key: "pdf_3_base64", nameKey: "pdf_3_nombre", urlKey: "pdf_3_url" },
  ];

  return (
    <div className="space-y-6 font-sans">
      
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

      {/* Encabezado Principal */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-bold text-xl flex items-center justify-center shadow-md">
            <User className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center space-x-2 bg-indigo-500/20 text-indigo-300 text-xs font-semibold px-3 py-1 rounded-full mb-1 backdrop-blur-md">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{miAtletaId ? "Registro Activo" : "Nueva Ficha Deportiva"}</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">Mi Ficha Deportiva FBG</h1>
            <p className="text-xs text-slate-300 mt-0.5">
              {miAtletaId ? "Modifica y actualiza tu trayectoria deportiva personal." : "Ingresa tus datos para registrar tu primer currículum oficial."}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 relative z-10">
          {miAtletaId && (
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center space-x-2 bg-rose-600/80 hover:bg-rose-600 text-white font-bold text-xs py-2.5 px-3.5 rounded-xl transition-all active:scale-95 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Eliminar Ficha</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleDownloadPDF}
            className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-lg shadow-emerald-600/30 transition-all active:scale-95 cursor-pointer"
          >
            <FileDown className="w-4 h-4" />
            <span>Descargar PDF</span>
          </button>
        </div>
      </header>

      {/* Navegación por Secciones */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-2xl gap-2 pt-2.5 overflow-x-auto shadow-sm">
        {[
          { id: "perfil", label: "1. Mi Perfil & Datos" },
          { id: "tablas_competitivas", label: "2. Convocatorias, Resultados & Participaciones" },
          { id: "logros_evolucion", label: "3. Logros, Marcas & Reconocimientos" },
          { id: "proyeccion_equipo", label: "4. Proyección & Equipo" },
          { id: "galeria", label: "5. Fotos Oficiales" },
          { id: "resumen_documentos", label: "6. Documentos PDF" }
        ].map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveFormTab(t.id)}
            className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
              activeFormTab === t.id 
                ? "border-indigo-600 text-indigo-600 bg-indigo-50/50 rounded-t-xl" 
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Formulario Principal */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        
        {/* TAB 1: PERFIL & DATOS PERSONALES */}
        {activeFormTab === "perfil" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Disciplina Encabezado</label>
                <input type="text" value={perfil.disciplina_encabezado} onChange={e => setPerfil({...perfil, disciplina_encabezado: e.target.value})} className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs" />
              </div>

              <div>
                <label className="block text-xs font-bold text-indigo-900 uppercase mb-1">Categoría Oficial *</label>
                <select
                  value={perfil.categoria}
                  onChange={e => setPerfil({ ...perfil, categoria: e.target.value, categoria_encabezado: e.target.value })}
                  className="w-full px-3.5 py-2 bg-indigo-50/60 border border-indigo-200 rounded-xl text-xs font-bold text-indigo-950"
                  required
                >
                  <option value="Age Group">Age Group</option>
                  <option value="Junior">Junior</option>
                  <option value="Senior">Senior</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Gestión del Currículum</label>
                <input type="text" value={perfil.gestion} onChange={e => setPerfil({...perfil, gestion: e.target.value})} className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold" placeholder="Ej. 2026" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Nombre Completo *</label>
                <input type="text" required value={perfil.nombre_completo} onChange={e => setPerfil({...perfil, nombre_completo: e.target.value})} className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Fecha de Nacimiento *</label>
                <input type="date" required value={perfil.fecha_nacimiento} onChange={e => setPerfil({...perfil, fecha_nacimiento: e.target.value})} className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Lugar Nacimiento / Depto</label>
                <input type="text" value={perfil.lugar_nacimiento_departamento} onChange={e => setPerfil({...perfil, lugar_nacimiento_departamento: e.target.value})} className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Club Representado</label>
                <input type="text" value={perfil.club} onChange={e => setPerfil({...perfil, club: e.target.value, equipo_club: e.target.value})} className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Asociación Departamental</label>
                <input type="text" value={perfil.asociacion_departamental} onChange={e => setPerfil({...perfil, asociacion_departamental: e.target.value, equipo_asociacion: e.target.value})} className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold text-indigo-900 uppercase mb-1">Año de Inicio en la Gimnasia</label>
                <input type="number" placeholder="Ej. 2016" value={perfil.anio_inicio_gimnasia} onChange={e => setPerfil({...perfil, anio_inicio_gimnasia: e.target.value})} className="w-full px-3.5 py-2 bg-indigo-50/40 border border-indigo-200 rounded-xl text-xs font-bold" />
              </div>
              <div>
                <label className="block text-xs font-bold text-indigo-900 uppercase mb-1">Entrenador/a Actual</label>
                <input type="text" placeholder="Nombre de tu entrenador" value={perfil.entrenador_actual} onChange={e => setPerfil({...perfil, entrenador_actual: e.target.value, equipo_entrenador_principal: e.target.value})} className="w-full px-3.5 py-2 bg-indigo-50/40 border border-indigo-200 rounded-xl text-xs font-bold" />
              </div>
              <div>
                <label className="block text-xs font-bold text-indigo-900 uppercase mb-1">Aparato / Especialidad Destacada</label>
                <input type="text" placeholder="Ej. Salto / Viga / Suelo" value={perfil.aparato_especialidad_destacada} onChange={e => setPerfil({...perfil, aparato_especialidad_destacada: e.target.value})} className="w-full px-3.5 py-2 bg-indigo-50/40 border border-indigo-200 rounded-xl text-xs font-bold" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-3 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Estatura (cm)</label>
                <input type="number" step="0.1" value={perfil.estatura_cm} onChange={e => setPerfil({...perfil, estatura_cm: e.target.value})} className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Peso (kg)</label>
                <input type="number" step="0.1" value={perfil.peso_kg} onChange={e => setPerfil({...perfil, peso_kg: e.target.value})} className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Horas Entreno / Sem</label>
                <input type="number" value={perfil.horas_entrenamiento_semanal} onChange={e => setPerfil({...perfil, horas_entrenamiento_semanal: e.target.value})} className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Años Experiencia</label>
                <input type="number" value={perfil.anios_experiencia_competitiva} onChange={e => setPerfil({...perfil, anios_experiencia_competitiva: e.target.value})} className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs" />
              </div>
              <div className="sm:col-span-4">
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Reseña de mi Trayectoria Deportiva</label>
                <textarea rows="3" value={perfil.resena_perfil_deportivo} onChange={e => setPerfil({...perfil, resena_perfil_deportivo: e.target.value})} placeholder="Escribe un resumen de tu trayectoria..." className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"></textarea>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CONVOCATORIAS, RESULTADOS Y PARTICIPACIONES INTERNACIONALES */}
        {activeFormTab === "tablas_competitivas" && (
          <div className="space-y-6">
            
            {/* Representación Nacional */}
            <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-indigo-900 uppercase">Representación Nacional (Convocatorias)</span>
                <button type="button" onClick={() => setRepNacional([...repNacional, { anio: new Date().getFullYear(), categoria: perfil.categoria || "Junior", disciplina: perfil.disciplina || "", evento_convocatoria: "", sede: "" }])} className="text-xs font-bold text-indigo-600 bg-indigo-100 px-3 py-1.5 rounded-xl cursor-pointer">
                  + Agregar Convocatoria
                </button>
              </div>
              {repNacional.map((r, i) => (
                <div key={i} className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Año</label>
                      <input type="number" placeholder="Año" value={r.anio} onChange={e => { const n = [...repNacional]; n[i].anio = e.target.value; setRepNacional(n); }} className="w-full px-2 py-1.5 bg-slate-50 border rounded-lg text-xs" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Categoría</label>
                      <select value={r.categoria} onChange={e => { const n = [...repNacional]; n[i].categoria = e.target.value; setRepNacional(n); }} className="w-full px-2 py-1.5 bg-slate-50 border rounded-lg text-xs">
                        <option value="Age Group">Age Group</option>
                        <option value="Junior">Junior</option>
                        <option value="Senior">Senior</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Evento / Convocatoria</label>
                      <input type="text" placeholder="Ej. Sudamericano" value={r.evento_convocatoria} onChange={e => { const n = [...repNacional]; n[i].evento_convocatoria = e.target.value; setRepNacional(n); }} className="w-full px-2 py-1.5 bg-slate-50 border rounded-lg text-xs" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Sede</label>
                      <input type="text" placeholder="Ej. Lima, Perú" value={r.sede} onChange={e => { const n = [...repNacional]; n[i].sede = e.target.value; setRepNacional(n); }} className="w-full px-2 py-1.5 bg-slate-50 border rounded-lg text-xs" />
                    </div>
                    <div className="flex items-end justify-end">
                      <button type="button" onClick={() => setRepNacional(repNacional.filter((_, idx) => idx !== i))} className="text-rose-600 text-xs font-bold cursor-pointer py-1.5">Eliminar</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* PARTICIPACIONES INTERNACIONALES (HISTÓRICO) */}
            <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-indigo-900 uppercase flex items-center gap-1">
                  <Globe className="w-4 h-4 text-indigo-600" />
                  <span>Participaciones Internacionales (Histórico)</span>
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setParticipaciones([
                      ...participaciones,
                      { competencia: "", anio: new Date().getFullYear(), pais: "", representacion: "Bolivia", resultado_destacado: "" }
                    ])
                  }
                  className="text-xs font-bold text-indigo-600 bg-indigo-100 px-3 py-1.5 rounded-xl cursor-pointer"
                >
                  + Agregar Participación Int.
                </button>
              </div>
              {participaciones.map((p, i) => (
                <div key={i} className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-6 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Competencia</label>
                      <input
                        type="text"
                        placeholder="Ej. Panamericano"
                        value={p.competencia}
                        onChange={(e) => {
                          const n = [...participaciones];
                          n[i].competencia = e.target.value;
                          setParticipaciones(n);
                        }}
                        className="w-full px-2 py-1.5 bg-slate-50 border rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Año</label>
                      <input
                        type="number"
                        placeholder="Año"
                        value={p.anio}
                        onChange={(e) => {
                          const n = [...participaciones];
                          n[i].anio = e.target.value;
                          setParticipaciones(n);
                        }}
                        className="w-full px-2 py-1.5 bg-slate-50 border rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">País</label>
                      <input
                        type="text"
                        placeholder="Ej. Colombia"
                        value={p.pais}
                        onChange={(e) => {
                          const n = [...participaciones];
                          n[i].pais = e.target.value;
                          setParticipaciones(n);
                        }}
                        className="w-full px-2 py-1.5 bg-slate-50 border rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Representación</label>
                      <input
                        type="text"
                        placeholder="Ej. Selección Bolivia"
                        value={p.representacion}
                        onChange={(e) => {
                          const n = [...participaciones];
                          n[i].representacion = e.target.value;
                          setParticipaciones(n);
                        }}
                        className="w-full px-2 py-1.5 bg-slate-50 border rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Resultado Destacado</label>
                      <input
                        type="text"
                        placeholder="Ej. Finalista All-Around"
                        value={p.resultado_destacado}
                        onChange={(e) => {
                          const n = [...participaciones];
                          n[i].resultado_destacado = e.target.value;
                          setParticipaciones(n);
                        }}
                        className="w-full px-2 py-1.5 bg-slate-50 border rounded-lg text-xs"
                      />
                    </div>
                    <div className="flex items-end justify-end">
                      <button
                        type="button"
                        onClick={() => setParticipaciones(participaciones.filter((_, idx) => idx !== i))}
                        className="text-rose-600 text-xs font-bold cursor-pointer py-1.5"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Resultados Internacionales */}
            <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-indigo-900 uppercase">Resultados Internacionales (Medallero y Puntajes)</span>
                <button type="button" onClick={() => setResInternacionales([...resInternacionales, { anio: new Date().getFullYear(), competencia: "", pais_ciudad: "", categoria: perfil.categoria || "Junior", aparato_prueba: "", posicion: "", puntaje: "" }])} className="text-xs font-bold text-indigo-600 bg-indigo-100 px-3 py-1.5 rounded-xl cursor-pointer">
                  + Agregar Resultado Int.
                </button>
              </div>
              {resInternacionales.map((r, i) => (
                <div key={i} className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-7 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Año</label>
                      <input type="number" placeholder="Año" value={r.anio} onChange={e => { const n = [...resInternacionales]; n[i].anio = e.target.value; setResInternacionales(n); }} className="w-full px-2 py-1.5 bg-slate-50 border rounded-lg text-xs" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Competencia</label>
                      <input type="text" placeholder="Nombre competencia" value={r.competencia} onChange={e => { const n = [...resInternacionales]; n[i].competencia = e.target.value; setResInternacionales(n); }} className="w-full px-2 py-1.5 bg-slate-50 border rounded-lg text-xs" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">País / Ciudad</label>
                      <input type="text" placeholder="País / Ciudad" value={r.pais_ciudad} onChange={e => { const n = [...resInternacionales]; n[i].pais_ciudad = e.target.value; setResInternacionales(n); }} className="w-full px-2 py-1.5 bg-slate-50 border rounded-lg text-xs" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Aparato / Prueba</label>
                      <input type="text" placeholder="Ej. Suelo" value={r.aparato_prueba} onChange={e => { const n = [...resInternacionales]; n[i].aparato_prueba = e.target.value; setResInternacionales(n); }} className="w-full px-2 py-1.5 bg-slate-50 border rounded-lg text-xs" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Posición</label>
                      <input type="text" placeholder="Ej. 1er Lugar" value={r.posicion} onChange={e => { const n = [...resInternacionales]; n[i].posicion = e.target.value; setResInternacionales(n); }} className="w-full px-2 py-1.5 bg-slate-50 border rounded-lg text-xs" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Puntaje</label>
                      <input type="number" step="0.001" placeholder="Ej. 12.450" value={r.puntaje} onChange={e => { const n = [...resInternacionales]; n[i].puntaje = e.target.value; setResInternacionales(n); }} className="w-full px-2 py-1.5 bg-slate-50 border rounded-lg text-xs" />
                    </div>
                    <div className="flex items-end justify-end">
                      <button type="button" onClick={() => setResInternacionales(resInternacionales.filter((_, idx) => idx !== i))} className="text-rose-600 text-xs font-bold cursor-pointer py-1.5">Eliminar</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Resultados Nacionales */}
            <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-indigo-900 uppercase">Resultados Nacionales</span>
                <button type="button" onClick={() => setResNacionales([...resNacionales, { anio: new Date().getFullYear(), campeonato: "", ciudad: "", categoria: perfil.categoria || "Junior", aparato_prueba: "", posicion: "", puntaje: "" }])} className="text-xs font-bold text-indigo-600 bg-indigo-100 px-3 py-1.5 rounded-xl cursor-pointer">
                  + Agregar Resultado Nac.
                </button>
              </div>
              {resNacionales.map((r, i) => (
                <div key={i} className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-7 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Año</label>
                      <input type="number" placeholder="Año" value={r.anio} onChange={e => { const n = [...resNacionales]; n[i].anio = e.target.value; setResNacionales(n); }} className="w-full px-2 py-1.5 bg-slate-50 border rounded-lg text-xs" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Campeonato</label>
                      <input type="text" placeholder="Ej. Nacional Clausura" value={r.campeonato} onChange={e => { const n = [...resNacionales]; n[i].campeonato = e.target.value; setResNacionales(n); }} className="w-full px-2 py-1.5 bg-slate-50 border rounded-lg text-xs" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Ciudad</label>
                      <input type="text" placeholder="Ej. Cochabamba" value={r.ciudad} onChange={e => { const n = [...resNacionales]; n[i].ciudad = e.target.value; setResNacionales(n); }} className="w-full px-2 py-1.5 bg-slate-50 border rounded-lg text-xs" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Aparato / Prueba</label>
                      <input type="text" placeholder="Ej. Salto" value={r.aparato_prueba} onChange={e => { const n = [...resNacionales]; n[i].aparato_prueba = e.target.value; setResNacionales(n); }} className="w-full px-2 py-1.5 bg-slate-50 border rounded-lg text-xs" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Posición</label>
                      <input type="text" placeholder="Ej. 2do Lugar" value={r.posicion} onChange={e => { const n = [...resNacionales]; n[i].posicion = e.target.value; setResNacionales(n); }} className="w-full px-2 py-1.5 bg-slate-50 border rounded-lg text-xs" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Puntaje</label>
                      <input type="number" step="0.001" placeholder="Ej. 11.800" value={r.puntaje} onChange={e => { const n = [...resNacionales]; n[i].puntaje = e.target.value; setResNacionales(n); }} className="w-full px-2 py-1.5 bg-slate-50 border rounded-lg text-xs" />
                    </div>
                    <div className="flex items-end justify-end">
                      <button type="button" onClick={() => setResNacionales(resNacionales.filter((_, idx) => idx !== i))} className="text-rose-600 text-xs font-bold cursor-pointer py-1.5">Eliminar</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* TAB 3: LOGROS, MARCAS Y RECONOCIMIENTOS */}
        {activeFormTab === "logros_evolucion" && (
          <div className="space-y-6">
            
            {/* Principales Logros */}
            <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-indigo-900 uppercase">Principales Logros Deportivos</span>
                <button type="button" onClick={() => setLogros([...logros, { anio: new Date().getFullYear(), descripcion_logro: "" }])} className="text-xs font-bold text-indigo-600 bg-indigo-100 px-3 py-1.5 rounded-xl cursor-pointer">
                  + Agregar Logro
                </button>
              </div>
              {logros.map((l, i) => (
                <div key={i} className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex gap-2 items-end">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Año</label>
                      <input type="number" placeholder="Año" value={l.anio} onChange={e => { const n = [...logros]; n[i].anio = e.target.value; setLogros(n); }} className="w-28 px-2 py-1.5 bg-slate-50 border rounded-lg text-xs" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Descripción del Logro Destacado</label>
                      <input type="text" placeholder="Ej. Medalla de Oro en All-Around..." value={l.descripcion_logro} onChange={e => { const n = [...logros]; n[i].descripcion_logro = e.target.value; setLogros(n); }} className="w-full px-2 py-1.5 bg-slate-50 border rounded-lg text-xs" />
                    </div>
                    <button type="button" onClick={() => setLogros(logros.filter((_, idx) => idx !== i))} className="text-rose-600 text-xs font-bold cursor-pointer py-1.5">Eliminar</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Marcas Personales */}
            <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-indigo-900 uppercase flex items-center gap-1">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <span>Marcas Personales (Mejores Puntajes)</span>
                </span>
                <button type="button" onClick={() => setMarcas([...marcas, { aparato_prueba: "", mejor_puntaje: "", competencia: "", anio: new Date().getFullYear() }])} className="text-xs font-bold text-indigo-600 bg-indigo-100 px-3 py-1.5 rounded-xl cursor-pointer">
                  + Agregar Marca
                </button>
              </div>
              {marcas.map((m, i) => (
                <div key={i} className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Aparato / Prueba</label>
                      <input type="text" placeholder="Ej. Viga" value={m.aparato_prueba} onChange={e => { const n = [...marcas]; n[i].aparato_prueba = e.target.value; setMarcas(n); }} className="w-full px-2 py-1.5 bg-slate-50 border rounded-lg text-xs" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Mejor Puntaje</label>
                      <input type="number" step="0.001" placeholder="Ej. 13.100" value={m.mejor_puntaje} onChange={e => { const n = [...marcas]; n[i].mejor_puntaje = e.target.value; setMarcas(n); }} className="w-full px-2 py-1.5 bg-slate-50 border rounded-lg text-xs font-bold text-emerald-800" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Competencia</label>
                      <input type="text" placeholder="Ej. Sudamericano" value={m.competencia} onChange={e => { const n = [...marcas]; n[i].competencia = e.target.value; setMarcas(n); }} className="w-full px-2 py-1.5 bg-slate-50 border rounded-lg text-xs" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Año</label>
                      <input type="number" placeholder="Año" value={m.anio} onChange={e => { const n = [...marcas]; n[i].anio = e.target.value; setMarcas(n); }} className="w-full px-2 py-1.5 bg-slate-50 border rounded-lg text-xs" />
                    </div>
                    <div className="flex items-end justify-end">
                      <button type="button" onClick={() => setMarcas(marcas.filter((_, idx) => idx !== i))} className="text-rose-600 text-xs font-bold cursor-pointer py-1.5">Eliminar</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Reconocimientos */}
            <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-indigo-900 uppercase flex items-center gap-1">
                  <Medal className="w-4 h-4 text-amber-600" />
                  <span>Reconocimientos y Distinciones</span>
                </span>
                <button type="button" onClick={() => setReconocimientos([...reconocimientos, { anio: new Date().getFullYear(), reconocimiento_distincion: "", institucion: "" }])} className="text-xs font-bold text-indigo-600 bg-indigo-100 px-3 py-1.5 rounded-xl cursor-pointer">
                  + Agregar Distinción
                </button>
              </div>
              {reconocimientos.map((r, i) => (
                <div key={i} className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Año</label>
                      <input type="number" placeholder="Año" value={r.anio} onChange={e => { const n = [...reconocimientos]; n[i].anio = e.target.value; setReconocimientos(n); }} className="w-full px-2 py-1.5 bg-slate-50 border rounded-lg text-xs" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Reconocimiento / Distinción</label>
                      <input type="text" placeholder="Ej. Atleta del Año" value={r.reconocimiento_distincion} onChange={e => { const n = [...reconocimientos]; n[i].reconocimiento_distincion = e.target.value; setReconocimientos(n); }} className="w-full px-2 py-1.5 bg-slate-50 border rounded-lg text-xs" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Institución Otorgante</label>
                      <input type="text" placeholder="Ej. Gobernación de La Paz" value={r.institucion} onChange={e => { const n = [...reconocimientos]; n[i].institucion = e.target.value; setReconocimientos(n); }} className="w-full px-2 py-1.5 bg-slate-50 border rounded-lg text-xs" />
                    </div>
                    <div className="flex items-end justify-end">
                      <button type="button" onClick={() => setReconocimientos(reconocimientos.filter((_, idx) => idx !== i))} className="text-rose-600 text-xs font-bold cursor-pointer py-1.5">Eliminar</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Evolución Deportiva */}
            <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-indigo-900 uppercase">Evolución Deportiva</span>
                <button type="button" onClick={() => setEvolucion([...evolucion, { gestion: new Date().getFullYear(), categoria_nivel: "", mejor_resultado: "", principal_avance: "" }])} className="text-xs font-bold text-indigo-600 bg-indigo-100 px-3 py-1.5 rounded-xl cursor-pointer">
                  + Agregar Gestión
                </button>
              </div>
              {evolucion.map((ev, i) => (
                <div key={i} className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Gestión</label>
                      <input type="number" placeholder="Año" value={ev.gestion} onChange={e => { const n = [...evolucion]; n[i].gestion = e.target.value; setEvolucion(n); }} className="w-full px-2 py-1.5 bg-slate-50 border rounded-lg text-xs" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Categoría / Nivel</label>
                      <input type="text" placeholder="Ej. Junior FIG" value={ev.categoria_nivel} onChange={e => { const n = [...evolucion]; n[i].categoria_nivel = e.target.value; setEvolucion(n); }} className="w-full px-2 py-1.5 bg-slate-50 border rounded-lg text-xs" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Mejor Resultado</label>
                      <input type="text" placeholder="Ej. Campeona Nacional" value={ev.mejor_resultado} onChange={e => { const n = [...evolucion]; n[i].mejor_resultado = e.target.value; setEvolucion(n); }} className="w-full px-2 py-1.5 bg-slate-50 border rounded-lg text-xs" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Avance Técnico Principal</label>
                      <input type="text" placeholder="Ej. Dificultad C en Viga" value={ev.principal_avance} onChange={e => { const n = [...evolucion]; n[i].principal_avance = e.target.value; setEvolucion(n); }} className="w-full px-2 py-1.5 bg-slate-50 border rounded-lg text-xs" />
                    </div>
                    <div className="flex items-end justify-end">
                      <button type="button" onClick={() => setEvolucion(evolucion.filter((_, idx) => idx !== i))} className="text-rose-600 text-xs font-bold cursor-pointer py-1.5">Eliminar</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Detalle Dinámico de Medallas Personales */}
            <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-indigo-900 uppercase flex items-center space-x-1">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span>Desglose de Medallas Personales</span>
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setPerfil({
                      ...perfil,
                      medallas_personales_detalle: [
                        ...perfil.medallas_personales_detalle,
                        { anio: new Date().getFullYear(), torneo: "", medalla: "Oro", prueba: "" }
                      ]
                    })
                  }
                  className="text-xs font-bold text-indigo-600 bg-indigo-100 px-3 py-1.5 rounded-xl cursor-pointer"
                >
                  + Agregar Medalla
                </button>
              </div>
              {perfil.medallas_personales_detalle.map((m, i) => (
                <div key={i} className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Año</label>
                      <input
                        type="number"
                        placeholder="Año"
                        value={m.anio}
                        onChange={(e) => {
                          const med = [...perfil.medallas_personales_detalle];
                          med[i].anio = e.target.value;
                          setPerfil({ ...perfil, medallas_personales_detalle: med });
                        }}
                        className="w-full px-2 py-1.5 bg-slate-50 border rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Torneo / Evento</label>
                      <input
                        type="text"
                        placeholder="Nombre torneo"
                        value={m.torneo}
                        onChange={(e) => {
                          const med = [...perfil.medallas_personales_detalle];
                          med[i].torneo = e.target.value;
                          setPerfil({ ...perfil, medallas_personales_detalle: med });
                        }}
                        className="w-full px-2 py-1.5 bg-slate-50 border rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Medalla</label>
                      <select
                        value={m.medalla}
                        onChange={(e) => {
                          const med = [...perfil.medallas_personales_detalle];
                          med[i].medalla = e.target.value;
                          setPerfil({ ...perfil, medallas_personales_detalle: med });
                        }}
                        className="w-full px-2 py-1.5 bg-slate-50 border rounded-lg text-xs font-bold"
                      >
                        <option value="Oro">🥇 Oro</option>
                        <option value="Plata">🥈 Plata</option>
                        <option value="Bronce">🥉 Bronce</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Prueba / Aparato</label>
                      <input
                        type="text"
                        placeholder="Ej. Barra de Equilibrio"
                        value={m.prueba}
                        onChange={(e) => {
                          const med = [...perfil.medallas_personales_detalle];
                          med[i].prueba = e.target.value;
                          setPerfil({ ...perfil, medallas_personales_detalle: med });
                        }}
                        className="w-full px-2 py-1.5 bg-slate-50 border rounded-lg text-xs"
                      />
                    </div>
                    <div className="flex items-end justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          const med = perfil.medallas_personales_detalle.filter((_, idx) => idx !== i);
                          setPerfil({ ...perfil, medallas_personales_detalle: med });
                        }}
                        className="text-rose-600 text-xs font-bold cursor-pointer py-1.5"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* TAB 4: PROYECCIÓN, OBJETIVOS Y EQUIPO TÉCNICO */}
        {activeFormTab === "proyeccion_equipo" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Ranking Nacional Actual</label>
                <input type="number" placeholder="Ej. 1" value={perfil.ranking_nacional_actual} onChange={e => setPerfil({...perfil, ranking_nacional_actual: e.target.value})} className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Mejor Clasificación Internacional</label>
                <input type="text" placeholder="Ej. 5to Lugar Sudamericano" value={perfil.mejor_clasificacion_internacional} onChange={e => setPerfil({...perfil, mejor_clasificacion_internacional: e.target.value})} className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs" />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Objetivo Corto Plazo (12 Meses)</label>
                <input type="text" value={perfil.objetivo_corto_plazo} onChange={e => setPerfil({...perfil, objetivo_corto_plazo: e.target.value})} className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs" />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-indigo-900 uppercase mb-1">Objetivo Mediano Plazo (2 a 3 Años)</label>
                <input type="text" placeholder="Ej. Clasificar a Juegos Panamericanos" value={perfil.objetivo_mediano_plazo} onChange={e => setPerfil({...perfil, objetivo_mediano_plazo: e.target.value})} className="w-full px-3.5 py-2 bg-indigo-50/40 border border-indigo-200 rounded-xl text-xs font-bold" />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Objetivo Deportivo Principal</label>
                <input type="text" value={perfil.objetivo_deportivo_principal} onChange={e => setPerfil({...perfil, objetivo_deportivo_principal: e.target.value})} className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Próxima Competencia Objetivo</label>
                <input type="text" value={perfil.proxima_competencia_objetivo} onChange={e => setPerfil({...perfil, proxima_competencia_objetivo: e.target.value})} className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Fecha / Sede Proyectada</label>
                <input type="text" value={perfil.proyeccion_fecha_sede} onChange={e => setPerfil({...perfil, proyeccion_fecha_sede: e.target.value})} className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs" />
              </div>
              <div>
                <label className="block text-xs font-bold text-indigo-900 uppercase mb-1">Meta Deportiva Proyectada</label>
                <input type="text" placeholder="Ej. Medalla de Oro en All-Around" value={perfil.proyeccion_meta_deportiva} onChange={e => setPerfil({...perfil, proyeccion_meta_deportiva: e.target.value})} className="w-full px-3.5 py-2 bg-indigo-50/40 border border-indigo-200 rounded-xl text-xs font-bold" />
              </div>
              <div>
                <label className="block text-xs font-bold text-indigo-900 uppercase mb-1">Clasificación Requerida</label>
                <input type="text" placeholder="Ej. Puntaje mínimo de 48.500" value={perfil.proyeccion_clasificacion_requerida} onChange={e => setPerfil({...perfil, proyeccion_clasificacion_requerida: e.target.value})} className="w-full px-3.5 py-2 bg-indigo-50/40 border border-indigo-200 rounded-xl text-xs font-bold" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Entrenador Principal</label>
                <input type="text" value={perfil.equipo_entrenador_principal} onChange={e => setPerfil({...perfil, equipo_entrenador_principal: e.target.value})} className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Entrenador Asistente</label>
                <input type="text" value={perfil.equipo_entrenador_asistente} onChange={e => setPerfil({...perfil, equipo_entrenador_asistente: e.target.value})} className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs" />
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: GALERÍA DE FOTOS OFICIALES */}
        {activeFormTab === "galeria" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl text-center space-y-3">
              <span className="text-xs font-bold text-slate-700 block uppercase">Foto en Competencia</span>
              <div className="w-full h-40 bg-white border-2 border-dashed rounded-xl flex items-center justify-center overflow-hidden">
                {perfil.foto_en_competencia_url ? (
                  <img src={perfil.foto_en_competencia_url} alt="Competencia" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-8 h-8 text-slate-400" />
                )}
              </div>
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-xl">
                <ImagePlus className="w-3.5 h-3.5" /> Cargar Imagen
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "foto_en_competencia_url")} />
              </label>
            </div>

            <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl text-center space-y-3">
              <span className="text-xs font-bold text-slate-700 block uppercase">Foto en Podio / Premiación</span>
              <div className="w-full h-40 bg-white border-2 border-dashed rounded-xl flex items-center justify-center overflow-hidden">
                {perfil.foto_en_podio_premiacion_url ? (
                  <img src={perfil.foto_en_podio_premiacion_url} alt="Podio" className="w-full h-full object-cover" />
                ) : (
                  <Award className="w-8 h-8 text-slate-400" />
                )}
              </div>
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-xl">
                <ImagePlus className="w-3.5 h-3.5" /> Cargar Imagen
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "foto_en_podio_premiacion_url")} />
              </label>
            </div>

            <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl text-center space-y-3">
              <span className="text-xs font-bold text-slate-700 block uppercase">Foto Representando a Bolivia</span>
              <div className="w-full h-40 bg-white border-2 border-dashed rounded-xl flex items-center justify-center overflow-hidden">
                {perfil.foto_representando_a_bolivia_url ? (
                  <img src={perfil.foto_representando_a_bolivia_url} alt="Bolivia" className="w-full h-full object-cover" />
                ) : (
                  <Trophy className="w-8 h-8 text-slate-400" />
                )}
              </div>
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-xl">
                <ImagePlus className="w-3.5 h-3.5" /> Cargar Imagen
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "foto_representando_a_bolivia_url")} />
              </label>
            </div>
          </div>
        )}

        {/* TAB 6: RESUMEN Y DOCUMENTOS ADJUNTOS (PDFs) */}
        {activeFormTab === "resumen_documentos" && (
          <div className="space-y-6">
            
            

            {/* Carga y Edición de Documentos PDF */}
            <div className="bg-slate-50 p-5 border border-slate-200 rounded-2xl space-y-4">
              <h3 className="text-xs font-black text-indigo-950 uppercase flex items-center space-x-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Gestión de Documentos Oficiales Adjuntos</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {pdfConfig.map((item) => {
                  const pdfName = perfil[item.nameKey];
                  const pdfTarget = perfil[item.urlKey] || perfil[item.base64Key];
                  const hasPdf = Boolean(pdfName || pdfTarget);

                  return (
                    <div key={item.num} className="bg-white p-4 border border-slate-200 rounded-2xl space-y-3 text-center flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                      <span className="text-xs font-black text-indigo-950 block uppercase tracking-wide">{item.label}</span>
                      
                      <div className="p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl min-h-[70px] flex flex-col items-center justify-center space-y-1">
                        {hasPdf ? (
                          <div className="space-y-1 w-full px-1">
                            <p className="text-xs font-bold text-slate-800 truncate max-w-[190px] mx-auto" title={pdfName || "Documento PDF"}>
                              📄 {pdfName || `Documento #${item.num}`}
                            </p>
                            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
                              Archivo listo
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">Ningún archivo adjunto</span>
                        )}
                      </div>

                      {/* Botones de acción dinámicos */}
                      <div className="flex flex-col gap-2 pt-1">
                        {hasPdf ? (
                          <div className="grid grid-cols-2 gap-1.5">
                            <button
                              type="button"
                              onClick={() => handlePreviewPdf(pdfTarget, item.label)}
                              className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Ver PDF</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleRemovePdf(item.base64Key, item.nameKey, item.urlKey)}
                              className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Eliminar</span>
                            </button>

                            <label className="col-span-2 cursor-pointer inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95">
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>Reemplazar Archivo</span>
                              <input
                                type="file"
                                accept="application/pdf"
                                className="hidden"
                                onChange={(e) => handlePdfUpload(e, item.base64Key, item.nameKey, item.urlKey)}
                              />
                            </label>
                          </div>
                        ) : (
                          <label className="cursor-pointer inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95">
                            <FileText className="w-3.5 h-3.5" />
                            <span>Cargar PDF</span>
                            <input
                              type="file"
                              accept="application/pdf"
                              className="hidden"
                              onChange={(e) => handlePdfUpload(e, item.base64Key, item.nameKey, item.urlKey)}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* Botón Acción Principal de Guardado */}
        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center space-x-2 transition-all active:scale-95 cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{miAtletaId ? "Actualizar Mi Ficha Deportiva" : "Guardar Mi Ficha Deportiva"}</span>
          </button>
        </div>

      </form>

      {/* Modal Vista Previa PDF Integrado */}
      {previewPdfModal.open && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 w-full max-w-4xl h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">{previewPdfModal.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewPdfModal({ open: false, url: "", title: "" })}
                className="p-1.5 text-slate-400 hover:text-slate-700 bg-white border border-slate-200 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 bg-slate-100 p-2">
              <iframe
                src={previewPdfModal.url}
                title="Vista previa PDF"
                className="w-full h-full rounded-2xl border border-slate-300"
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmación de Eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-3xl p-6 shadow-2xl text-center">
            <div className="w-12 h-12 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">¿Eliminar Ficha Deportiva?</h3>
            <p className="text-xs text-slate-500 mt-2">
              Se eliminarán de forma definitiva tu perfil de atleta, historial de resultados, marcas y fotografías guardadas.
            </p>
            <div className="flex items-center justify-center gap-3 mt-6">
              <button 
                type="button" 
                onClick={() => setShowDeleteModal(false)} 
                className="px-5 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                type="button" 
                onClick={handleConfirmDelete} 
                className="px-5 py-2.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md cursor-pointer"
              >
                Sí, Eliminar Todo
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};