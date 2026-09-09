import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// Paleta cromática oficial de la FBG
const INK = {
  navy: [15, 23, 42],      // Azul institucional oscuro
  navyLight: [30, 41, 59], // Encabezados de tabla
  gold: [197, 160, 89],    // Dorado institucional / filetes
  slate: [100, 116, 139],  // Subtítulos y metadatos
  ink: [30, 41, 59],       // Texto principal
  cream: [250, 248, 242],  // Fondo alterno de filas
  line: [226, 232, 240],   // Bordes de tabla
};

const cargarImagenBase64 = (url) => {
  return new Promise((resolve) => {
    if (!url) return resolve(null);
    if (typeof url === "string" && url.startsWith("data:image")) return resolve(url);

    const img = new Image();
    img.setAttribute("crossOrigin", "anonymous");
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/jpeg"));
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
};

const dibujarFondoBoletin = (doc, logoBase64) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // 1. Doble marco perimetral
  doc.setDrawColor(...INK.gold);
  doc.setLineWidth(0.6);
  doc.rect(margin - 4, margin - 4, pageWidth - (margin - 4) * 2, pageHeight - (margin - 4) * 2);

  doc.setDrawColor(...INK.line);
  doc.setLineWidth(0.2);
  doc.rect(margin - 2.5, margin - 2.5, pageWidth - (margin - 2.5) * 2, pageHeight - (margin - 2.5) * 2);

  // 2. Marca de agua centralizada
  doc.saveGraphicsState();
  doc.setGState(new doc.GState({ opacity: 0.04 }));
  doc.setFont("times", "bold");
  doc.setFontSize(42);
  doc.setTextColor(...INK.navy);
  doc.text("FEDERACIÓN BOLIVIANA DE GIMNASIA", pageWidth / 2, pageHeight / 2, {
    align: "center",
    angle: 35,
  });
  doc.restoreGraphicsState();

  // 3. Pie de página
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...INK.slate);
  doc.text(
    "Documento editable de trayectoria deportiva del atleta · Federación Boliviana de Gimnasia (FBG)",
    margin,
    pageHeight - 6
  );
};

export const generarFichaPDF = async (data) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "letter",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  const {
    perfil = {},
    resumen_ejecutivo = {},
    representacion_nacional = [],
    resultados_internacionales = [],
    resultados_nacionales = [],
    principales_logros_deportivos = [],
    participaciones_internacionales = [],
    evolucion_deportiva = [],
    marcas_personales = [],
    reconocimientos = [],
  } = data;

  const logoBase64 = await cargarImagenBase64("/normal.jpg");

  const renderSectionTitle = (title, y) => {
    let currentY = y;
    if (currentY > pageHeight - 35) {
      doc.addPage();
      dibujarFondoBoletin(doc, logoBase64);
      currentY = 22;
    }
    doc.setFont("times", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...INK.navy);
    doc.text(title, margin, currentY);
    return currentY + 2;
  };

  // =========================================================================
  // PÁGINA 1: ENCABEZADO E INSTITUCIONAL
  // =========================================================================
  dibujarFondoBoletin(doc, logoBase64);

  let currentY = 16;
  if (logoBase64) {
    const logoSize = 18;
    doc.setDrawColor(...INK.gold);
    doc.setLineWidth(0.4);
    doc.circle(pageWidth / 2, currentY + logoSize / 2, logoSize / 2 + 1.2);
    doc.addImage(logoBase64, "JPEG", (pageWidth - logoSize) / 2, currentY, logoSize, logoSize);
    currentY += logoSize + 4;
  }

  doc.setFont("times", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...INK.navy);
  doc.text("FEDERACIÓN BOLIVIANA DE GIMNASIA", pageWidth / 2, currentY, { align: "center" });

  currentY += 4.5;
  doc.setFont("times", "italic");
  doc.setFontSize(9.5);
  doc.setTextColor(...INK.gold);
  doc.text("CURRÍCULUM DEPORTIVO ATLETA FEDERACIÓN BOLIVIANA DE GIMNASIA", pageWidth / 2, currentY, { align: "center" });

  currentY += 4;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...INK.slate);
  doc.text(
    `Disciplina: ${(perfil.disciplina_encabezado || perfil.disciplina || "-").toUpperCase()}   |   Categoría: ${(perfil.categoria_encabezado || perfil.categoria || "-").toUpperCase()}   |   Gestión: ${perfil.gestion || new Date().getFullYear()}`,
    pageWidth / 2,
    currentY,
    { align: "center" }
  );

  // Filete dorado
  currentY += 3.5;
  const rt = currentY;
  doc.setDrawColor(...INK.gold);
  doc.setLineWidth(0.5);
  doc.line(margin, rt, pageWidth / 2 - 5, rt);
  doc.line(pageWidth / 2 + 5, rt, pageWidth - margin, rt);
  doc.setFillColor(...INK.gold);
  doc.triangle(pageWidth / 2 - 2, rt, pageWidth / 2 + 2, rt, pageWidth / 2, rt - 1.5, "F");
  doc.triangle(pageWidth / 2 - 2, rt, pageWidth / 2 + 2, rt, pageWidth / 2, rt + 1.5, "F");

  currentY += 6;

  // 1. PERFIL DEL ATLETA Y 2. DATOS DEPORTIVOS
  autoTable(doc, {
    startY: currentY,
    theme: "grid",
    head: [["1. PERFIL DEL ATLETA", "2. DATOS DEPORTIVOS"]],
    body: [
      [
        `Nombre: ${perfil.nombre_completo || "-"}\n` +
        `Fecha de nacimiento: ${perfil.fecha_nacimiento ? perfil.fecha_nacimiento.split("T")[0] : "-"}\n` +
        `Lugar de nacimiento / Departamento: ${perfil.lugar_nacimiento_departamento || perfil.departamento || "-"}\n` +
        `Club: ${perfil.club || perfil.equipo_club || "-"}\n` +
        `Asociación Departamental: ${perfil.asociacion_departamental || perfil.equipo_asociacion || "-"}\n` +
        `Disciplina / Categoría / Nivel: ${perfil.disciplina || "-"} / ${perfil.categoria || "-"} / ${perfil.nivel || "-"}`,

        `Número de Licencia FIG: ${perfil.anio_inicio_gimnasia || perfil.anio_inicio || "-"}\n` +
        `Entrenador/a actual: ${perfil.entrenador_actual || perfil.equipo_entrenador_principal || "-"}\n` +
        `Años de experiencia competitiva: ${perfil.anios_experiencia_competitiva || 0} años\n` +
        `Estatura / Peso: ${perfil.estatura_cm ? perfil.estatura_cm + " cm" : "-"} / ${perfil.peso_kg ? perfil.peso_kg + " kg" : "-"}\n` +
        `Aparato o especialidad destacada: ${perfil.aparato_especialidad_destacada || "-"}\n` +
        `Horas de entrenamiento semanal: ${perfil.horas_entrenamiento_semanal || "-"} hrs`,
      ],
    ],
    margin: { left: margin, right: margin },
    styles: { font: "helvetica", fontSize: 7.5, cellPadding: 2.5, textColor: INK.ink, lineColor: INK.line, lineWidth: 0.15 },
    headStyles: { fillColor: INK.navy, textColor: INK.cream, fontStyle: "bold", fontSize: 8 },
    alternateRowStyles: { fillColor: INK.cream },
  });

  // 3. PERFIL DEPORTIVO
  currentY = doc.lastAutoTable.finalY + 3;
  autoTable(doc, {
    startY: currentY,
    theme: "grid",
    head: [["3. PERFIL DEPORTIVO"]],
    body: [[`Breve reseña del atleta (trayectoria, fortalezas, experiencia, selección y proyección):\n${perfil.resena_perfil_deportivo || "Sin reseña registrada."}`]],
    margin: { left: margin, right: margin },
    styles: { font: "helvetica", fontSize: 7.5, cellPadding: 2.5, textColor: INK.ink, lineColor: INK.line, lineWidth: 0.15 },
    headStyles: { fillColor: INK.navyLight, textColor: INK.cream, fontStyle: "bold", fontSize: 7.5 },
  });

  // 4. REPRESENTACIÓN NACIONAL
  currentY = renderSectionTitle("4. REPRESENTACIÓN NACIONAL", doc.lastAutoTable.finalY + 4);
  const rowsRepNacional = representacion_nacional.map((r) => [
    r.anio,
    r.categoria || "-",
    r.disciplina || "-",
    r.evento_convocatoria || "-",
    r.sede || "-",
  ]);

  autoTable(doc, {
    startY: currentY,
    theme: "grid",
    head: [["Año", "Categoría", "Disciplina", "Evento / Convocatoria", "Sede"]],
    body: rowsRepNacional.length > 0 ? rowsRepNacional : [["-", "-", "-", "Sin registros de convocatorias", "-"]],
    margin: { left: margin, right: margin },
    styles: { font: "helvetica", fontSize: 7, cellPadding: 2, textColor: INK.ink, lineColor: INK.line, lineWidth: 0.15 },
    headStyles: { fillColor: INK.navyLight, textColor: INK.cream, fontStyle: "bold", fontSize: 7.5, halign: "center" },
    columnStyles: { 0: { halign: "center", cellWidth: 15 }, 1: { cellWidth: 28 }, 2: { cellWidth: 28 }, 4: { cellWidth: 32 } },
    alternateRowStyles: { fillColor: INK.cream },
  });

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 1.5,
    theme: "plain",
    body: [[
      `Número de convocatorias a Selección Boliviana: ${perfil.numero_convocatorias_seleccion || representacion_nacional.length}`
    ]],
    margin: { left: margin, right: margin },
    styles: { font: "helvetica", fontSize: 7, fontStyle: "bold", textColor: INK.navy, cellPadding: 1 },
  });

  // 5. RESULTADOS INTERNACIONALES
  currentY = renderSectionTitle("5. RESULTADOS INTERNACIONALES", doc.lastAutoTable.finalY + 4);
  const rowsResInt = resultados_internacionales.map((r) => [
    r.anio,
    r.competencia || "-",
    r.pais_ciudad || "-",
    r.categoria || "-",
    r.aparato_prueba || "-",
    r.posicion || "-",
    r.puntaje || "-",
  ]);

  autoTable(doc, {
    startY: currentY,
    theme: "grid",
    head: [["Año", "Competencia", "País / Ciudad", "Categoría", "Aparato / Prueba", "Posición", "Puntaje"]],
    body: rowsResInt.length > 0 ? rowsResInt : [["-", "Sin registros internacionales", "-", "-", "-", "-", "-"]],
    margin: { left: margin, right: margin },
    styles: { font: "helvetica", fontSize: 7, cellPadding: 2, textColor: INK.ink, lineColor: INK.line, lineWidth: 0.15 },
    headStyles: { fillColor: INK.navy, textColor: INK.cream, fontStyle: "bold", fontSize: 7.5, halign: "center" },
    columnStyles: { 0: { halign: "center", cellWidth: 14 }, 5: { halign: "center", cellWidth: 20 }, 6: { halign: "center", cellWidth: 18 } },
    alternateRowStyles: { fillColor: INK.cream },
  });

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 1.5,
    theme: "plain",
    body: [[
      `Medallero internacional: ORO: ${perfil.medallero_internacional_oro || 0}  |  PLATA: ${perfil.medallero_internacional_plata || 0}  |  BRONCE: ${perfil.medallero_internacional_bronce || 0}    Finales internacionales: ${perfil.finales_internacionales || 0}`
    ]],
    margin: { left: margin, right: margin },
    styles: { font: "helvetica", fontSize: 7, fontStyle: "bold", textColor: INK.navy, cellPadding: 1 },
  });

  // 6. RESULTADOS NACIONALES
  currentY = renderSectionTitle("6. RESULTADOS NACIONALES", doc.lastAutoTable.finalY + 4);
  const rowsResNac = resultados_nacionales.map((r) => [
    r.anio,
    r.campeonato || "-",
    r.ciudad || "-",
    r.categoria || "-",
    r.aparato_prueba || "-",
    r.posicion || "-",
    r.puntaje || "-",
  ]);

  autoTable(doc, {
    startY: currentY,
    theme: "grid",
    head: [["Año", "Campeonato", "Ciudad", "Categoría", "Aparato / Prueba", "Posición", "Puntaje"]],
    body: rowsResNac.length > 0 ? rowsResNac : [["-", "Sin registros nacionales", "-", "-", "-", "-", "-"]],
    margin: { left: margin, right: margin },
    styles: { font: "helvetica", fontSize: 7, cellPadding: 2, textColor: INK.ink, lineColor: INK.line, lineWidth: 0.15 },
    headStyles: { fillColor: INK.navy, textColor: INK.cream, fontStyle: "bold", fontSize: 7.5, halign: "center" },
    columnStyles: { 0: { halign: "center", cellWidth: 14 }, 5: { halign: "center", cellWidth: 20 }, 6: { halign: "center", cellWidth: 18 } },
    alternateRowStyles: { fillColor: INK.cream },
  });

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 1.5,
    theme: "plain",
    body: [[
      `Medallero nacional: ORO: ${perfil.medallero_nacional_oro || 0}  |  PLATA: ${perfil.medallero_nacional_plata || 0}  |  BRONCE: ${perfil.medallero_nacional_bronce || 0}`
    ]],
    margin: { left: margin, right: margin },
    styles: { font: "helvetica", fontSize: 7, fontStyle: "bold", textColor: INK.navy, cellPadding: 1 },
  });

  // 7. PRINCIPALES LOGROS DEPORTIVOS
  currentY = renderSectionTitle("7. PRINCIPALES LOGROS DEPORTIVOS", doc.lastAutoTable.finalY + 4);
  const rowsLogros = principales_logros_deportivos.map((l) => [l.anio, l.descripcion_logro]);

  autoTable(doc, {
    startY: currentY,
    theme: "grid",
    head: [["Año", "Descripción del Logro Deportivo"]],
    body: rowsLogros.length > 0 ? rowsLogros : [["-", "Sin logros específicos registrados"]],
    margin: { left: margin, right: margin },
    styles: { font: "helvetica", fontSize: 7, cellPadding: 2, textColor: INK.ink, lineColor: INK.line, lineWidth: 0.15 },
    headStyles: { fillColor: INK.navyLight, textColor: INK.cream, fontStyle: "bold", fontSize: 7.5 },
    columnStyles: { 0: { halign: "center", cellWidth: 18 } },
    alternateRowStyles: { fillColor: INK.cream },
  });

  // DETALLE DE MEDALLAS PERSONALES
  const medallasPersonales = Array.isArray(perfil.medallas_personales_detalle) ? perfil.medallas_personales_detalle : [];
  if (medallasPersonales.length > 0) {
    currentY = renderSectionTitle("DETALLE DE MEDALLAS PERSONALES OBTENIDAS", doc.lastAutoTable.finalY + 4);
    const rowsMedallas = medallasPersonales.map((m) => [m.anio || "-", m.torneo || "-", m.medalla || "-", m.prueba || "-"]);

    autoTable(doc, {
      startY: currentY,
      theme: "grid",
      head: [["Año", "Torneo / Evento", "Medalla", "Aparato / Prueba"]],
      body: rowsMedallas,
      margin: { left: margin, right: margin },
      styles: { font: "helvetica", fontSize: 7, cellPadding: 2, textColor: INK.ink, lineColor: INK.line, lineWidth: 0.15 },
      headStyles: { fillColor: INK.navy, textColor: INK.cream, fontStyle: "bold", fontSize: 7.5, halign: "center" },
      columnStyles: { 0: { halign: "center", cellWidth: 18 }, 2: { halign: "center", cellWidth: 25, fontStyle: "bold" } },
      alternateRowStyles: { fillColor: INK.cream },
    });
  }

  // 8. PARTICIPACIONES INTERNACIONALES
  currentY = renderSectionTitle("8. PARTICIPACIONES INTERNACIONALES", doc.lastAutoTable.finalY + 4);
  const rowsPart = participaciones_internacionales.map((p) => [
    p.competencia,
    p.anio,
    p.pais || "-",
    p.representacion || "-",
    p.resultado_destacado || "-",
  ]);

  autoTable(doc, {
    startY: currentY,
    theme: "grid",
    head: [["Competencia", "Año", "País", "Representación", "Resultado Destacado"]],
    body: rowsPart.length > 0 ? rowsPart : [["Sin participaciones registradas", "-", "-", "-", "-"]],
    margin: { left: margin, right: margin },
    styles: { font: "helvetica", fontSize: 7, cellPadding: 2, textColor: INK.ink, lineColor: INK.line, lineWidth: 0.15 },
    headStyles: { fillColor: INK.navy, textColor: INK.cream, fontStyle: "bold", fontSize: 7.5, halign: "center" },
    columnStyles: { 1: { halign: "center", cellWidth: 15 } },
    alternateRowStyles: { fillColor: INK.cream },
  });

  // 9. EVOLUCIÓN DEPORTIVA
  currentY = renderSectionTitle("9. EVOLUCIÓN DEPORTIVA", doc.lastAutoTable.finalY + 4);
  const rowsEv = evolucion_deportiva.map((e) => [e.gestion, e.categoria_nivel, e.mejor_resultado, e.principal_avance]);

  autoTable(doc, {
    startY: currentY,
    theme: "grid",
    head: [["Gestión", "Categoría / Nivel", "Mejor Resultado", "Principal Avance"]],
    body: rowsEv.length > 0 ? rowsEv : [["-", "-", "-", "Sin registros de evolución"]],
    margin: { left: margin, right: margin },
    styles: { font: "helvetica", fontSize: 7, cellPadding: 2, textColor: INK.ink, lineColor: INK.line, lineWidth: 0.15 },
    headStyles: { fillColor: INK.navyLight, textColor: INK.cream, fontStyle: "bold", fontSize: 7.5, halign: "center" },
    columnStyles: { 0: { halign: "center", cellWidth: 18 } },
    alternateRowStyles: { fillColor: INK.cream },
  });

  // 10. RANKING Y MARCAS PERSONALES
  currentY = renderSectionTitle("10. RANKING Y MARCAS PERSONALES", doc.lastAutoTable.finalY + 4);
  const rowsMarcas = marcas_personales.map((m) => [
    m.aparato_prueba || m.aparato || "-",
    m.mejor_puntaje || m.puntaje || "-",
    m.competencia || "-",
    m.anio || "-"
  ]);

  autoTable(doc, {
    startY: currentY,
    theme: "grid",
    head: [["Aparato / Prueba", "Mejor Puntaje", "Competencia", "Año"]],
    body: rowsMarcas.length > 0 ? rowsMarcas : [["General", "-", "Sin marcas registradas", "-"]],
    margin: { left: margin, right: margin },
    styles: { font: "helvetica", fontSize: 7, cellPadding: 2, textColor: INK.ink, lineColor: INK.line, lineWidth: 0.15 },
    headStyles: { fillColor: INK.navy, textColor: INK.cream, fontStyle: "bold", fontSize: 7.5, halign: "center" },
    columnStyles: { 1: { halign: "center", cellWidth: 26, fontStyle: "bold" }, 3: { halign: "center", cellWidth: 18 } },
    alternateRowStyles: { fillColor: INK.cream },
  });

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 1.5,
    theme: "plain",
    body: [[
      `Ranking nacional actual: #${perfil.ranking_nacional_actual || "-"}    |    Mejor clasificación internacional: ${perfil.mejor_clasificacion_internacional || "-"}`
    ]],
    margin: { left: margin, right: margin },
    styles: { font: "helvetica", fontSize: 7, fontStyle: "bold", textColor: INK.navy, cellPadding: 1 },
  });

  // 11. RECONOCIMIENTOS
  currentY = renderSectionTitle("11. RECONOCIMIENTOS", doc.lastAutoTable.finalY + 4);
  const rowsRec = reconocimientos.map((r) => [r.anio, r.reconocimiento_distincion, r.institucion]);

  autoTable(doc, {
    startY: currentY,
    theme: "grid",
    head: [["Año", "Reconocimiento / Distinción", "Institución"]],
    body: rowsRec.length > 0 ? rowsRec : [["-", "Sin distinciones registradas", "-"]],
    margin: { left: margin, right: margin },
    styles: { font: "helvetica", fontSize: 7, cellPadding: 2, textColor: INK.ink, lineColor: INK.line, lineWidth: 0.15 },
    headStyles: { fillColor: INK.navyLight, textColor: INK.cream, fontStyle: "bold", fontSize: 7.5 },
    columnStyles: { 0: { halign: "center", cellWidth: 18 } },
    alternateRowStyles: { fillColor: INK.cream },
  });

  // 12, 13 Y 14. OBJETIVOS, PROYECCIÓN Y EQUIPO TÉCNICO
  currentY = renderSectionTitle("12, 13 Y 14. OBJETIVOS, PROYECCIÓN Y EQUIPO TÉCNICO", doc.lastAutoTable.finalY + 4);
  autoTable(doc, {
    startY: currentY,
    theme: "grid",
    head: [["12. OBJETIVOS DEPORTIVOS", "13. PROYECCIÓN INTERNACIONAL", "14. EQUIPO TÉCNICO"]],
    body: [
      [
        `Corto plazo - 12 meses:\n${perfil.objetivo_corto_plazo || "-"}\n\n` +
        `Mediano plazo - 2 a 3 años:\n${perfil.objetivo_mediano_plazo || "-"}\n\n` +
        `Objetivo deportivo principal:\n${perfil.objetivo_deportivo_principal || "-"}`,

        `Próxima competencia objetivo:\n${perfil.proxima_competencia_objetivo || "-"}\n\n` +
        `Fecha / Sede:\n${perfil.proyeccion_fecha_sede || "-"}\n\n` +
        `Meta deportiva:\n${perfil.proyeccion_meta_deportiva || "-"}\n\n` +
        `Clasificación requerida:\n${perfil.proyeccion_clasificacion_requerida || "-"}`,

        `Entrenador/a principal:\n${perfil.equipo_entrenador_principal || perfil.entrenador_actual || "-"}\n\n` +
        `Entrenador/a asistente:\n${perfil.equipo_entrenador_asistente || "-"}\n\n` +
        `Club: ${perfil.equipo_club || perfil.club || "-"}\n` +
        `Asociación: ${perfil.equipo_asociacion || perfil.asociacion_departamental || "-"}\n` +
        `Federación: ${perfil.equipo_federacion || "Federación Boliviana de Gimnasia"}`,
      ],
    ],
    margin: { left: margin, right: margin },
    styles: { font: "helvetica", fontSize: 6.8, cellPadding: 2.2, textColor: INK.ink, lineColor: INK.line, lineWidth: 0.15 },
    headStyles: { fillColor: INK.navy, textColor: INK.cream, fontStyle: "bold", fontSize: 7.2 },
    alternateRowStyles: { fillColor: INK.cream },
  });

  // 15. GALERÍA DEPORTIVA
  let galeriaY = doc.lastAutoTable.finalY + 5;
  if (galeriaY > pageHeight - 55) {
    doc.addPage();
    dibujarFondoBoletin(doc, logoBase64);
    galeriaY = 22;
  }

  doc.setFont("times", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...INK.navy);
  doc.text("15. GALERÍA DEPORTIVA", margin, galeriaY);

  const fotos = [
    { label: "FOTO EN COMPETENCIA", base64: perfil.foto_en_competencia_url, x: margin },
    { label: "FOTO EN PODIO/PREMIACIÓN", base64: perfil.foto_en_podio_premiacion_url, x: margin + 64 },
    { label: "FOTO REPRESENTANDO A BOLIVIA", base64: perfil.foto_representando_a_bolivia_url, x: margin + 128 },
  ];

  fotos.forEach((f) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(...INK.slate);
    doc.text(f.label, f.x, galeriaY + 4);

    if (f.base64 && typeof f.base64 === "string" && f.base64.startsWith("data:image")) {
      try {
        doc.setDrawColor(...INK.gold);
        doc.setLineWidth(0.3);
        doc.rect(f.x - 0.5, galeriaY + 5.5, 59, 39);
        doc.addImage(f.base64, "JPEG", f.x, galeriaY + 6, 58, 38);
      } catch {
        doc.setDrawColor(...INK.line);
        doc.rect(f.x, galeriaY + 6, 58, 38);
        doc.text("Error en imagen", f.x + 16, galeriaY + 25);
      }
    } else {
      doc.setDrawColor(...INK.line);
      doc.setLineWidth(0.2);
      doc.rect(f.x, galeriaY + 6, 58, 38);
      doc.setFont("helvetica", "italic");
      doc.text("Sin Fotografía Oficial", f.x + 15, galeriaY + 25);
    }
  });

  // DOCUMENTOS PDF ADJUNTOS
  let pdfsY = galeriaY + 48;
  if (pdfsY > pageHeight - 35) {
    doc.addPage();
    dibujarFondoBoletin(doc, logoBase64);
    pdfsY = 22;
  }

  const pdf1 = perfil.pdf_1_nombre || (perfil.pdf_1_url ? "Documento PDF #1 Cargado" : "Sin adjunto");
  const pdf2 = perfil.pdf_2_nombre || (perfil.pdf_2_url ? "Documento PDF #2 Cargado" : "Sin adjunto");
  const pdf3 = perfil.pdf_3_nombre || (perfil.pdf_3_url ? "Documento PDF #3 Cargado" : "Sin adjunto");

  autoTable(doc, {
    startY: pdfsY,
    theme: "grid",
    head: [["DOCUMENTOS PDF ADJUNTOS EN REGISTRO DE BASE DE DATOS"]],
    body: [
      [`Documento PDF #1: ${pdf1}`],
      [`Documento PDF #2: ${pdf2}`],
      [`Documento PDF #3: ${pdf3}`],
    ],
    margin: { left: margin, right: margin },
    styles: { font: "helvetica", fontSize: 7, cellPadding: 2, textColor: INK.ink, lineColor: INK.line, lineWidth: 0.15 },
    headStyles: { fillColor: INK.navyLight, textColor: INK.cream, fontStyle: "bold", fontSize: 7.5 },
  });

  

  // Paginado
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...INK.slate);
    doc.text(`Página ${i} de ${pageCount}`, pageWidth - margin, pageHeight - 6, { align: "right" });
  }

  doc.save(`Curriculum_Oficial_FBG_${(perfil.nombre_completo || "atleta").replace(/\s+/g, "_")}.pdf`);
};

export const generarReporteMasivoPDF = async (atletasList, filtro = "General") => {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "letter" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  const logoBase64 = await cargarImagenBase64("/normal.jpg");

  doc.setDrawColor(...INK.gold);
  doc.setLineWidth(0.6);
  doc.rect(margin - 4, margin - 4, pageWidth - (margin - 4) * 2, pageHeight - (margin - 4) * 2);

  if (logoBase64) {
    doc.addImage(logoBase64, "JPEG", margin, 12, 16, 16);
  }

  doc.setFont("times", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...INK.navy);
  doc.text("FEDERACIÓN BOLIVIANA DE GIMNASIA", 34, 18);

  doc.setFont("times", "italic");
  doc.setFontSize(9);
  doc.setTextColor(...INK.gold);
  doc.text("NÓMINA OFICIAL CONSOLIDADA DE ATLETAS", 34, 23);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...INK.slate);
  doc.text(
    `FILTRO: ${filtro.toUpperCase()}   ·   TOTAL REGISTROS: ${atletasList.length}   ·   EMISIÓN: ${new Date().toLocaleDateString("es-BO")}`,
    34,
    27
  );

  autoTable(doc, {
    startY: 32,
    theme: "grid",
    head: [["ID", "Nombre Completo", "Disciplina", "Categoría", "Nivel", "Departamento", "Club", "Ranking"]],
    body: atletasList.map((a) => [
      `#${a.id}`,
      a.nombre_completo,
      a.disciplina || "-",
      a.categoria || "-",
      a.nivel || "-",
      a.lugar_nacimiento_departamento || a.departamento || "-",
      a.club || "-",
      a.ranking_nacional_actual ? `#${a.ranking_nacional_actual}` : "-",
    ]),
    margin: { left: margin, right: margin },
    styles: { font: "helvetica", fontSize: 8, cellPadding: 2.5, textColor: INK.ink, lineColor: INK.line, lineWidth: 0.15 },
    headStyles: { fillColor: INK.navy, textColor: INK.cream, fontStyle: "bold", fontSize: 8, halign: "center" },
    columnStyles: { 0: { halign: "center", cellWidth: 15 }, 7: { halign: "center", cellWidth: 20 } },
    alternateRowStyles: { fillColor: INK.cream },
  });

  doc.save(`Nomina_Oficial_Atletas_${filtro.replace(/\s+/g, "_")}.pdf`);
};