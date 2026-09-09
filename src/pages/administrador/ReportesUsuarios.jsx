import React, { useEffect, useState, useMemo } from "react";
import {
  BarChart3,
  Users,
  FileSpreadsheet,
  Search,
  ArrowUpDown,
  Eye,
  X,
  FileText,
  Camera,
  FileCheck,
  FileDown,
  Loader2,
  ShieldCheck,
  Filter,
} from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import {
  getCurriculumByUserIdRequest,
  getAtletasRequest,
} from "../../services/api.jsx";
import { getUsersRequest } from "../../services/user.service.js";
import { generarFichaPDF } from "../normal.js";

export const ReportesUsuarios = () => {
  const [users, setUsers] = useState([]);
  const [atletasList, setAtletasList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Filtros de la Vista Principal
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategoria, setFilterCategoria] = useState("todas");
  const [filterDisciplina, setFilterDisciplina] = useState("todas");
  const [filterDatos, setFilterDatos] = useState("todos"); // 'todos' | 'con_datos' | 'sin_datos'
  const [sortOrder, setSortOrder] = useState("asc"); // 'asc' | 'desc'

  // Único Modal de Reportes / Filtros unificado
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportFilters, setExportFilters] = useState({
    categoria: "todas",
    fichaStatus: "todos",
    search: "",
  });

  // Modal de Detalle de Atleta
  const [selectedAtleta, setSelectedAtleta] = useState(null);
  const [atletaCurriculum, setAtletaCurriculum] = useState(null);

  // Modal de Vista Previa PDF
  const [previewPdfModal, setPreviewPdfModal] = useState({
    open: false,
    url: "",
    title: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersRes, atletasRes] = await Promise.allSettled([
        getUsersRequest(),
        getAtletasRequest(),
      ]);

      const rawUsers =
        usersRes.status === "fulfilled"
          ? usersRes.value.data || usersRes.value
          : [];
      const rawAtletas =
        atletasRes.status === "fulfilled"
          ? atletasRes.value.data?.data || atletasRes.value.data || []
          : [];

      setUsers(Array.isArray(rawUsers) ? rawUsers : []);
      setAtletasList(Array.isArray(rawAtletas) ? rawAtletas : []);
    } catch (err) {
      console.error("Error al cargar lista de usuarios/atletas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const fetchFichaEstudiante = async (user) => {
    try {
      const res = await getCurriculumByUserIdRequest(user.id);
      if (res.data && res.data.perfil) {
        return res.data;
      }
    } catch (err) {
      console.warn("Ficha no encontrada para el usuario ID:", user.id);
    }

    return {
      perfil: {
        id: user.id,
        nombre_completo:
          `${user.nombre || ""} ${user.apellido || ""}`.trim() ||
          user.username ||
          "Atleta Sin Registro",
        categoria: user.categoria || "Junior",
        club: "Sin Club Registrado",
        asociacion_departamental: user.departamento || "La Paz",
        entrenador_actual: "Por Asignar",
        disciplina: "Gimnasia Artística",
        fecha_nacimiento: user.fecha_nacimiento || "",
        lugar_nacimiento_departamento: user.departamento || "La Paz",
        estatura_cm: "",
        peso_kg: "",
        foto_en_competencia_url: "",
        foto_en_podio_premiacion_url: "",
        foto_representando_a_bolivia_url: "",
        pdf_1_base64: "",
        pdf_1_nombre: "Pasaporte.pdf",
        pdf_2_base64: "",
        pdf_2_nombre: "Certificacion_WADA.pdf",
        pdf_3_base64: "",
        pdf_3_nombre: "Carnet_de_Identidad.pdf",
        resena_perfil_deportivo: "",
      },
      representacion_nacional: [],
      resultados_internacionales: [],
      resultados_nacionales: [],
      principales_logros_deportivos: [],
      participaciones_internacionales: [],
      evolucion_deportiva: [],
      marcas_personales: [],
      reconocimientos: [],
    };
  };

  const handleOpenDetailModal = async (user) => {
    setActionLoadingId(user.id);
    setSelectedAtleta(user);
    const fichaData = await fetchFichaEstudiante(user);
    setAtletaCurriculum(fichaData);
    setActionLoadingId(null);
  };

  const handleGenerateIndividualPDF = async (user) => {
    setActionLoadingId(user.id);
    const fichaData = await fetchFichaEstudiante(user);
    generarFichaPDF(fichaData);
    setActionLoadingId(null);
  };

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
        setPreviewPdfModal({
          open: true,
          url: pdfUrlOrBase64,
          title: titleName,
        });
      }
    } catch (err) {
      alert("No se pudo previsualizar el documento PDF.");
    }
  };

  // Métricas globales
  const totalUsuarios = users.length;
  const totalAdmins = users.filter((u) => u.rol === "admin").length;
  const totalAtletas = users.filter((u) => u.rol === "atleta" || !u.rol).length;

  const mapaAtletas = useMemo(() => {
    const map = new Map();
    atletasList.forEach((a) => map.set(Number(a.usuario_id), a));
    return map;
  }, [atletasList]);

  const processedUsers = useMemo(() => {
    return users
      .filter((u) => {
        const datosAtleta = mapaAtletas.get(Number(u.id));
        const tieneFicha = Boolean(datosAtleta);

        const cat = datosAtleta?.categoria || u.categoria || "Junior";
        if (filterCategoria !== "todas" && cat !== filterCategoria)
          return false;

        // Filtrado por disciplina
        const disc =
          datosAtleta?.disciplina || u.disciplina || "Gimnasia Artística"; // <-- NUEVO
        if (filterDisciplina !== "todas" && disc !== filterDisciplina)
          return false; // <-- NUEVO

        if (filterDatos === "con_datos" && !tieneFicha) return false;
        if (filterDatos === "sin_datos" && tieneFicha) return false;

        const fullName =
          `${datosAtleta?.nombre_completo || u.nombre || ""} ${u.apellido || ""}`.toLowerCase();
        const ci = (u.ci || "").toLowerCase();
        const username = (u.username || "").toLowerCase();
        const search = searchTerm.toLowerCase();

        return (
          fullName.includes(search) ||
          ci.includes(search) ||
          username.includes(search)
        );
      })
      .map((u) => ({
        ...u,
        datosAtleta: mapaAtletas.get(Number(u.id)) || null,
      }))
      .sort((a, b) => {
        const nameA =
          (
            a.datosAtleta?.nombre_completo ||
            `${a.nombre || ""} ${a.apellido || ""}`
          ).trim() ||
          a.username ||
          "";
        const nameB =
          (
            b.datosAtleta?.nombre_completo ||
            `${b.nombre || ""} ${b.apellido || ""}`
          ).trim() ||
          b.username ||
          "";

        return sortOrder === "asc"
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      });
  }, [
    users,
    mapaAtletas,
    filterCategoria,
    filterDisciplina,
    filterDatos,
    searchTerm,
    sortOrder,
  ]);

  const getFilteredExportList = (filters) => {
    const filtrados = users.filter((u) => {
      const datosAtleta = mapaAtletas.get(Number(u.id));
      const tieneFicha = Boolean(datosAtleta);

      const cat = datosAtleta?.categoria || u.categoria || "Junior";
      if (filters.categoria !== "todas" && cat !== filters.categoria)
        return false;

      // Filtro por disciplina para exportar
      const disc =
        datosAtleta?.disciplina || u.disciplina || "Gimnasia Artística"; // <-- NUEVO
      if (filters.disciplina !== "todas" && disc !== filters.disciplina)
        return false; // <-- NUEVO

      if (filters.fichaStatus === "con_datos" && !tieneFicha) return false;
      if (filters.fichaStatus === "sin_datos" && tieneFicha) return false;

      const fullName =
        `${datosAtleta?.nombre_completo || u.nombre || ""} ${u.apellido || ""}`.toLowerCase();
      const ci = (u.ci || "").toLowerCase();
      const search = (filters.search || "").toLowerCase();

      return fullName.includes(search) || ci.includes(search);
    });

    return filtrados.map((u, idx) => {
      return {
        correlativo: idx + 1,
        nombre_completo:
          u.datosAtleta?.nombre_completo ||
          `${u.nombre || ""} ${u.apellido || ""}`.trim() ||
          u.username,
        ci: u.ci || "Sin CI",
        categoria: u.datosAtleta?.categoria || u.categoria || "Junior",
        disciplina:
          u.datosAtleta?.disciplina || u.disciplina || "Gimnasia Artística", // <-- NUEVO
      };
    });
  };
  // Generación directa de PDF nativa usando jsPDF sin depender de plugins externos ni autotable
  const generarReportePDFDirecto = (listado, tituloReporte) => {
    const doc = new jsPDF();

    // Banda institucional superior
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 25, "F");
    doc.setFillColor(197, 168, 111); // dorado institucional
    doc.rect(0, 25, 210, 3, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("FEDERACIÓN BOLIVIANA DE GIMNASIA", 14, 16);

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(9);
    doc.text(
      `NÓMINA OFICIAL DE ATLETAS — ${tituloReporte} | EMISIÓN: ${new Date().toLocaleDateString()}`,
      14,
      35,
    );

    // Cabecera de la tabla dibujada manualmente con jsPDF puro
    let startY = 44;
    doc.setFillColor(15, 23, 42);
    doc.rect(14, startY, 182, 8, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("N°", 18, startY + 5.5);
    doc.text("Nombre Completo", 32, startY + 5.5);
    doc.text("Carnet (CI)", 125, startY + 5.5);
    doc.text("Categoría", 160, startY + 5.5);

    startY += 8;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 41, 59);

    listado.forEach((item, index) => {
      // Salto de página automático si se acerca al final de la hoja
      if (startY > 275) {
        doc.addPage();
        startY = 20;
      }

      // Fila alterna con color de fondo suave
      if (index % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, startY, 182, 7, "F");
      }

      // Bordes de la celda
      doc.setDrawColor(203, 213, 225);
      doc.rect(14, startY, 182, 7);

      doc.text(String(item.correlativo), 18, startY + 5, { align: "left" });
      doc.text(String(item.nombre_completo || ""), 32, startY + 5);
      doc.text(String(item.ci || ""), 125, startY + 5);
      doc.text(String(item.categoria || ""), 160, startY + 5);

      startY += 7;
    });

    doc.save(`${tituloReporte.replace(/\s+/g, "_")}.pdf`);
  };

  const handleExportPDFFromModal = () => {
    const listado = getFilteredExportList(exportFilters);
    if (listado.length === 0) {
      alert("No hay registros coincidentes para exportar.");
      return;
    }
    generarReportePDFDirecto(
      listado,
      `Reporte_Atletas_${exportFilters.categoria}`,
    );
    setExportModalOpen(false);
  };

  const handleExportExcelFromModal = () => {
    const listado = getFilteredExportList(exportFilters);
    if (listado.length === 0) {
      alert("No hay registros coincidentes para exportar.");
      return;
    }

    const reportData = listado.map((item) => ({
      "N°": item.correlativo,
      "Nombre Completo": item.nombre_completo,
      "Carnet (CI)": item.ci,
      Categoría: item.categoria,
    }));

    const ws = XLSX.utils.json_to_sheet(reportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reporte_Atletas");
    XLSX.writeFile(
      wb,
      `Reporte_Atletas_${exportFilters.categoria.toUpperCase()}.xlsx`,
    );
    setExportModalOpen(false);
  };

  return (
    <div className="space-y-6 font-sans print:p-0">
      {/* Encabezado con un único botón de reportes y filtros unificado */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden print:hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/20 text-indigo-300 text-xs font-semibold px-3 py-1 rounded-full mb-2 backdrop-blur-md">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Módulo de Analítica y Reportes FBG</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Reportes de Atletas y Fichas Técnicas
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Acceso centralizado para supervisar registros, previsualizar
            documentos adjuntos y generar reportes oficiales.
          </p>
        </div>

        <div className="flex items-center space-x-2 relative z-10">
          <button
            onClick={() => {
              setExportFilters({
                categoria: filterCategoria,
                disciplina: filterDisciplina,
                fichaStatus: filterDatos,
                search: searchTerm,
              });
              setExportModalOpen(true);
            }}
            className="inline-flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 px-6 rounded-2xl shadow-lg shadow-emerald-600/30 transition-all active:scale-95 cursor-pointer"
          >
            <Filter className="w-4 h-4" />
            <span>Generar Reportes y Filtros</span>
          </button>
        </div>
      </header>

      {/* Indicadores Clave (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400">
              Total Registrados
            </p>
            <p className="text-2xl font-black text-slate-900 mt-1">
              {totalUsuarios}
            </p>
            <span className="text-[10px] text-slate-400 font-medium">
              Usuarios en Sistema
            </span>
          </div>
          <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filtros de Tabla */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3 print:hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-center">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Buscar por Nombre, CI o Usuario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <select
              value={filterDisciplina}
              onChange={(e) => setFilterDisciplina(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="todas">Todas las Disciplinas</option>
              <option value="WAG">WAG</option>
              <option value="MAG">MAG</option>
              <option value="GR">GR</option>
              <option value="TRA">TRA</option>
              <option value="AER">AER</option>
            </select>
          </div>

          <div>
            <select
              value={filterCategoria}
              onChange={(e) => setFilterCategoria(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="todas">Todas las Categorías</option>
              <option value="Age Group">Age Group</option>
              <option value="Junior">Junior</option>
              <option value="Senior">Senior</option>
            </select>
          </div>

          <div>
            <select
              value={filterDatos}
              onChange={(e) => setFilterDatos(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="todos">Todos los Registros</option>
              <option value="con_datos">Con Ficha Llenada</option>
              <option value="sin_datos">Sin Ficha Llenada</option>
            </select>
          </div>

          <div>
            <button
              onClick={() =>
                setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
              }
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Orden: {sortOrder === "asc" ? "A - Z" : "Z - A"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabla Desglosada */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            Cargando nómina de atletas...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-6">N°</th>
                  <th className="py-3.5 px-6">Atleta / Usuario</th>
                  <th className="py-3.5 px-6">Carnet (CI)</th>
                  <th className="py-3.5 px-6">Categoría</th>
                  <th className="py-3.5 px-6">Disciplina</th>
                  <th className="py-3.5 px-6">Estado Ficha</th>
                  <th className="py-3.5 px-6 text-center print:hidden">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {processedUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-400">
                      No se encontraron registros coincidentes.
                    </td>
                  </tr>
                ) : (
                  processedUsers.map((u, index) => {
                    const nombreCompleto =
                      u.datosAtleta?.nombre_completo ||
                      `${u.nombre || ""} ${u.apellido || ""}`.trim() ||
                      u.username;
                    const tieneFicha = Boolean(u.datosAtleta);
                    const isRowLoading = actionLoadingId === u.id;

                    return (
                      <tr key={u.id || index} className="hover:bg-slate-50">
                        <td className="py-3.5 px-6 font-bold text-slate-400">
                          {index + 1}
                        </td>
                        <td className="py-3.5 px-6">
                          <p className="font-bold text-slate-900">
                            {nombreCompleto}
                          </p>
                          <p className="text-[11px] text-indigo-600">
                            @{u.username}
                          </p>
                        </td>
                        <td className="py-3.5 px-6 font-mono font-bold text-slate-700">
                          {u.ci || "Sin CI"}
                        </td>
                        <td className="py-3.5 px-6 font-semibold text-slate-800">
                          <span className="bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                            {u.datosAtleta?.categoria ||
                              u.categoria ||
                              "Junior"}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 font-semibold text-slate-800">
                          <span className="bg-slate-100  px-2 py-1 rounded-md border border-slate-200">
                            {u.datosAtleta?.disciplina ||
                              u.disciplina ||
                              "Gimnasia Artística"}
                          </span>
                        </td>
                        <td className="py-3.5 px-6">
                          {tieneFicha ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                              <FileCheck className="w-3 h-3" /> Ficha Llenada
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                              Sin Registros
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-6 text-center print:hidden flex items-center justify-center gap-2">
                          <button
                            disabled={!tieneFicha || isRowLoading}
                            onClick={() => handleOpenDetailModal(u)}
                            className="inline-flex items-center space-x-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            title={
                              tieneFicha
                                ? "Ver Ficha"
                                : "Sin datos de ficha técnica registrados"
                            }
                          >
                            {isRowLoading ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                            <span>Ver Ficha</span>
                          </button>

                          <button
                            disabled={!tieneFicha || isRowLoading}
                            onClick={() => handleGenerateIndividualPDF(u)}
                            className="inline-flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            title={
                              tieneFicha
                                ? "Generar PDF Individual"
                                : "Sin datos de ficha técnica registrados"
                            }
                          >
                            {isRowLoading ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <FileDown className="w-3.5 h-3.5" />
                            )}
                            <span>PDF</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ÚNICO MODAL UNIFICADO DE REPORTES Y FILTROS */}
      {exportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border-4 border-[#c5a86f] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b-2 border-[#c5a86f]">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold tracking-wide">
                  Generar Reporte y Filtros
                </h3>
              </div>
              <button
                onClick={() => setExportModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-700 ">
              <div>
                <label className="font-bold text-slate-600 block mb-1">
                  Filtrar por Búsqueda (Nombre o CI):
                </label>
                <input
                  type="text"
                  placeholder="Ej. Juan Pérez o CI..."
                  value={exportFilters.search}
                  onChange={(e) =>
                    setExportFilters({
                      ...exportFilters,
                      search: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">
                  Seleccionar Disciplina:
                </label>
                <select
                  value={exportFilters.disciplina}
                  onChange={(e) =>
                    setExportFilters({
                      ...exportFilters,
                      disciplina: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="todas">Todas las Disciplinas</option>
                  <option value="WAG">WAG</option>
                  <option value="MAG">MAG</option>
                  <option value="GR">GR</option>
                  <option value="TRA">TRA</option>
                  <option value="AER">AER</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">
                  Seleccionar Categoría:
                </label>
                <select
                  value={exportFilters.categoria}
                  onChange={(e) =>
                    setExportFilters({
                      ...exportFilters,
                      categoria: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="todas">Todas las Categorías</option>
                  <option value="Age Group">Age Group</option>
                  <option value="Junior">Junior</option>
                  <option value="Senior">Senior</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">
                  Estado de Ficha:
                </label>
                <select
                  value={exportFilters.fichaStatus}
                  onChange={(e) =>
                    setExportFilters({
                      ...exportFilters,
                      fichaStatus: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="todos">Todos los Registros</option>
                  <option value="con_datos">Solo Con Ficha Llenada</option>
                  <option value="sin_datos">Solo Sin Ficha Llenada</option>
                </select>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border text-[11px] text-slate-500">
                Total de registros listos para exportar:{" "}
                <strong className="text-emerald-800">
                  {getFilteredExportList(exportFilters).length}
                </strong>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleExportPDFFromModal}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Descargar PDF</span>
                </button>

                <button
                  onClick={handleExportExcelFromModal}
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Descargar Excel</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLE DE FICHA TÉCNICA DEL ATLETA */}
      {selectedAtleta && atletaCurriculum && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-lg">
                  {(
                    atletaCurriculum.perfil?.nombre_completo ||
                    selectedAtleta.username ||
                    "A"
                  ).charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold">
                    {atletaCurriculum.perfil?.nombre_completo ||
                      selectedAtleta.username}
                  </h3>
                  <p className="text-xs text-indigo-300">
                    CI: {selectedAtleta.ci || "Sin CI"} | @
                    {selectedAtleta.username}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleGenerateIndividualPDF(selectedAtleta)}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Descargar PDF</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedAtleta(null);
                    setAtletaCurriculum(null);
                  }}
                  className="p-1.5 text-slate-400 hover:text-white bg-white/10 rounded-xl cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
              <div className="space-y-2">
                <h4 className="text-xs font-black text-indigo-950 uppercase flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-indigo-600" />
                  <span>Fotografías Oficiales del Atleta</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-50 p-2.5 border rounded-2xl text-center space-y-1.5">
                    <span className="font-bold text-[11px] text-slate-600 block">
                      EN COMPETENCIA
                    </span>
                    <div className="w-full h-36 bg-slate-200 rounded-xl overflow-hidden flex items-center justify-center">
                      {atletaCurriculum.perfil?.foto_en_competencia_url ? (
                        <img
                          src={atletaCurriculum.perfil.foto_en_competencia_url}
                          alt="Competencia"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-slate-400">Sin foto</span>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-2.5 border rounded-2xl text-center space-y-1.5">
                    <span className="font-bold text-[11px] text-slate-600 block">
                      EN PODIO / PREMIACIÓN
                    </span>
                    <div className="w-full h-36 bg-slate-200 rounded-xl overflow-hidden flex items-center justify-center">
                      {atletaCurriculum.perfil?.foto_en_podio_premiacion_url ? (
                        <img
                          src={
                            atletaCurriculum.perfil.foto_en_podio_premiacion_url
                          }
                          alt="Podio"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-slate-400">Sin foto</span>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-2.5 border rounded-2xl text-center space-y-1.5">
                    <span className="font-bold text-[11px] text-slate-600 block">
                      REPRESENTANDO A BOLIVIA
                    </span>
                    <div className="w-full h-36 bg-slate-200 rounded-xl overflow-hidden flex items-center justify-center">
                      {atletaCurriculum.perfil
                        ?.foto_representando_a_bolivia_url ? (
                        <img
                          src={
                            atletaCurriculum.perfil
                              .foto_representando_a_bolivia_url
                          }
                          alt="Bolivia"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-slate-400">Sin foto</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 border rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-slate-400 font-bold block text-[10px]">
                    CATEGORÍA
                  </span>
                  <span className="font-black text-indigo-950 text-sm">
                    {atletaCurriculum.perfil?.categoria || "Junior"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px]">
                    CLUB
                  </span>
                  <span className="font-black text-slate-800">
                    {atletaCurriculum.perfil?.club || "Sin Club"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px]">
                    ASOCIACIÓN
                  </span>
                  <span className="font-black text-slate-800">
                    {atletaCurriculum.perfil?.asociacion_departamental || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px]">
                    ENTRENADOR
                  </span>
                  <span className="font-black text-slate-800">
                    {atletaCurriculum.perfil?.entrenador_actual || "N/A"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-black text-indigo-950 uppercase flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>Documentos Oficiales PDF Adjuntos</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      num: 1,
                      label: "Documento #1: Pasaporte",
                      base64: atletaCurriculum.perfil?.pdf_1_url,
                      name: atletaCurriculum.perfil?.pdf_1_nombre,
                    },
                    {
                      num: 2,
                      label: "Documento #2: Certificación WADA",
                      base64: atletaCurriculum.perfil?.pdf_2_url,
                      name: atletaCurriculum.perfil?.pdf_2_nombre,
                    },
                    {
                      num: 3,
                      label: "Documento #3: Carnet de Identidad",
                      base64: atletaCurriculum.perfil?.pdf_3_url,
                      name: atletaCurriculum.perfil?.pdf_3_nombre,
                    },
                  ].map((doc) => (
                    <div
                      key={doc.num}
                      className="bg-white p-3 border rounded-xl flex flex-col justify-between text-center space-y-2"
                    >
                      <span className="font-bold text-slate-700">
                        {doc.label}
                      </span>
                      <div className="p-2 bg-slate-50 border border-dashed rounded-lg min-h-[50px] flex items-center justify-center">
                        {doc.base64 ? (
                          <span className="font-bold text-indigo-900 truncate max-w-[150px]">
                            {doc.name || "Documento PDF"}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">
                            Sin adjunto
                          </span>
                        )}
                      </div>
                      {doc.base64 && (
                        <button
                          onClick={() =>
                            handlePreviewPdf(doc.base64, doc.label)
                          }
                          className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver PDF</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL VISTA PREVIA PDF */}
      {previewPdfModal.open && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 w-full max-w-4xl h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  {previewPdfModal.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() =>
                  setPreviewPdfModal({ open: false, url: "", title: "" })
                }
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
    </div>
  );
};
