import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ReporteDiarioResponse } from "@/types/reporte";

// Paleta institucional OLAMSA + PractiQR
const OLAMSA_GREEN = [14, 122, 76] as const;
const OLAMSA_GREEN_LIGHT = [230, 246, 239] as const;
const SLATE_900 = [15, 23, 42] as const;
const SLATE_500 = [100, 116, 139] as const;
const SLATE_200 = [226, 232, 240] as const;
const SLATE_50 = [248, 250, 252] as const;

function formatHora(hora?: string | null) {
  if (!hora) return "—";
  return hora.substring(0, 5);
}
function formatHoras(num?: number | null) {
  if (num == null) return "—";
  const h = Math.floor(num);
  const m = Math.round((num - h) * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
function formatFechaLarga(fechaStr: string) {
  try {
    const d = new Date(fechaStr + "T00:00:00");
    return d.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  } catch {
    return fechaStr;
  }
}

async function loadImageAsBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`[PDF] Logo no encontrado: ${url} (status ${res.status})`);
      return null;
    }
    const blob = await res.blob();
    if (!blob.type.startsWith("image/")) {
      console.warn(`[PDF] ${url} no es una imagen válida (${blob.type})`);
      return null;
    }
    const dataUrl: string = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error(`FileReader error para ${url}`));
      reader.readAsDataURL(blob);
    });
    if (!dataUrl.startsWith("data:image/")) return null;
    return dataUrl;
  } catch (e) {
    console.warn(`[PDF] Error cargando logo ${url}:`, e instanceof Error ? e.message : e);
    return null;
  }
}

async function cargarLogoOlamsa(): Promise<string | null> {
  const candidatos = ["/images/LOGO-C1.png", "/images/LOGO_OLAMSA.png", "/images/logo-olamsa.png"];
  for (const ruta of candidatos) {
    const logo = await loadImageAsBase64(ruta);
    if (logo) return logo;
  }
  console.warn("[PDF] Ningún logo OLAMSA pudo cargarse. Verifica las rutas en /public/images.");
  return null;
}

export async function generarPdfDiario(reporte: ReporteDiarioResponse): Promise<jsPDF> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  let y = 14;

  // ============================================================
  // CABECERA — logo grande a la izquierda + texto alineado a su lado
  // ============================================================
  const HEADER_H = 36;
  const HEADER_PAD = 3;
  const LOGO_MAX_W = 40; // 👈 logo protagonista, sin pasarse
  const LOGO_MAX_H = HEADER_H - HEADER_PAD * 2;

  // Fondo suave verde
  doc.setFillColor(OLAMSA_GREEN_LIGHT[0], OLAMSA_GREEN_LIGHT[1], OLAMSA_GREEN_LIGHT[2]);
  doc.rect(0, 0, pageWidth, HEADER_H, "F");

  // Eje vertical único: TODO se alinea respecto a este Y
  const centerY = y + HEADER_H / 6;

  const logo = await cargarLogoOlamsa();
  let logoW = 0;
  let logoDrawn = false;

  if (logo) {
    try {
      const props = (doc as any).getImageProperties(logo);
      let w = LOGO_MAX_W;
      let h = (props.height / props.width) * w;
      if (h > LOGO_MAX_H) {
        h = LOGO_MAX_H;
        w = (props.width / props.height) * h;
      }
      const logoY = centerY - h / 2; // 👈 logo perfectamente centrado en vertical
      doc.addImage(logo, "PNG", margin, logoY, w, h);
      logoW = w;
      logoDrawn = true;
    } catch (e) {
      console.warn("[PDF] Error al dibujar logo:", e instanceof Error ? e.message : e);
    }
  }

  if (!logoDrawn) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(OLAMSA_GREEN[0], OLAMSA_GREEN[1], OLAMSA_GREEN[2]);
    const fallbackY = centerY + 8; // baseline aproximada para centrar el texto
    doc.text("OLAMSA", margin, fallbackY);
    logoW = doc.getTextWidth("OLAMSA");
  }

  // 👇 Texto alineado a la IZQUIERDA, justo después del logo.
  //    Nada de centrar en un hueco asimétrico: eso era lo que se veía raro.
  const SEPARACION_LOGO_TEXTO = 8; // aire entre logo y texto
  const textoX = margin + logoW + SEPARACION_LOGO_TEXTO;

  // Título principal
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(SLATE_900[0], SLATE_900[1], SLATE_900[2]);
  doc.text("REPORTE DIARIO DE ASISTENCIA", textoX, centerY - 1);

  // Subtítulo
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(SLATE_500[0], SLATE_500[1], SLATE_500[2]);
  doc.text("Sistema PractiQR", textoX, centerY + 6);

  // Fecha de generación abajo a la derecha del header
  const fechaGen = reporte.fechaGeneracion
    ? new Date(reporte.fechaGeneracion).toLocaleString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : new Date().toLocaleString("es-ES");
  doc.setFontSize(6.5);
  doc.setTextColor(SLATE_500[0], SLATE_500[1], SLATE_500[2]);
  doc.text(`Generado: ${fechaGen} (America/Lima)`, pageWidth - margin, y + HEADER_H - 4, { align: "right" });

  y += HEADER_H;

  // Banda institucional verde: cierre visual de la cabecera
  doc.setFillColor(OLAMSA_GREEN[0], OLAMSA_GREEN[1], OLAMSA_GREEN[2]);
  doc.rect(margin, y, pageWidth - 2 * margin, 1.4, "F");
  y += 5;
  doc.setDrawColor(SLATE_200[0], SLATE_200[1], SLATE_200[2]);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  const p = reporte.practicante;

  // ============================================================
  // DATOS DEL PRACTICANTE
  // ============================================================
  doc.setFillColor(SLATE_50[0], SLATE_50[1], SLATE_50[2]);
  doc.rect(margin, y, pageWidth - 2 * margin, 6, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(SLATE_500[0], SLATE_500[1], SLATE_500[2]);
  doc.text("DATOS DEL PRACTICANTE", margin + 2, y + 4);
  y += 8;

  const colW = (pageWidth - 2 * margin) / 2;
  const tableStyles = {
    styles: {
      font: "helvetica",
      fontSize: 7,
      cellPadding: 2,
      lineColor: SLATE_200 as unknown as string,
      textColor: [15, 23, 42] as [number, number, number],
    },
    headStyles: {
      fillColor: SLATE_50 as unknown as string,
      textColor: SLATE_500 as unknown as string,
      fontStyle: "bold" as const,
      fontSize: 6,
    },
    bodyStyles: { fontSize: 8 },
    columnStyles: { 0: { cellWidth: colW }, 1: { cellWidth: colW } },
    margin: { left: margin, right: margin },
    theme: "grid" as const,
  };

  autoTable(doc, { ...tableStyles, startY: y, head: [["Practicante", "DNI"]], body: [[p.nombreCompleto || "—", p.documento || "—"]] });
  y = (doc as any).lastAutoTable.finalY + 0.5;

  autoTable(doc, { ...tableStyles, startY: y, head: [["Área", "Cargo"]], body: [[p.nombreArea || (p as any).area || "—", p.cargo || "—"]] });
  y = (doc as any).lastAutoTable.finalY + 0.5;

  autoTable(doc, { ...tableStyles, startY: y, head: [["Sede", "Instituto"]], body: [[p.sede || "—", (p as any).tipoInstituto || "—"]] });
  y = (doc as any).lastAutoTable.finalY + 0.5;

  autoTable(doc, {
    ...tableStyles,
    startY: y,
    head: [["Estado", "Periodo prácticas"]],
    body: [[p.situacion || "—", `${p.fechaInicioPracticas || "—"} ${p.fechaFinPracticas ? "— " + p.fechaFinPracticas : ""}`]],
  });
  y = (doc as any).lastAutoTable.finalY + 4;

  // ============================================================
  // PERIODO DEL REPORTE
  // ============================================================
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(SLATE_500[0], SLATE_500[1], SLATE_500[2]);
  doc.text("PERIODO DEL REPORTE", margin, y);
  y += 4;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(SLATE_900[0], SLATE_900[1], SLATE_900[2]);
  doc.text(`Fecha: ${formatFechaLarga(reporte.fecha)}`, margin, y);
  doc.text(`Tipo: Diario`, margin + 80, y);
  doc.text(`Día: ${reporte.diaSemana}`, margin + 120, y);
  y += 6;

  // ============================================================
  // HORARIO PROGRAMADO
  // ============================================================
  doc.setFillColor(SLATE_50[0], SLATE_50[1], SLATE_50[2]);
  doc.rect(margin, y, pageWidth - 2 * margin, 6, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(SLATE_500[0], SLATE_500[1], SLATE_500[2]);
  doc.text("HORARIO PROGRAMADO", margin + 2, y + 4);
  y += 8;

  if (reporte.esDescanso) {
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      theme: "grid",
      styles: { halign: "center", fontSize: 8, cellPadding: 3, lineColor: SLATE_200 as unknown as string },
      head: [["DESCANSO - Día no laborable"]],
      headStyles: { fillColor: [241, 245, 249] as unknown as string, textColor: [71, 85, 105] as unknown as string },
      body: [["No hay horario programado para este día"]],
    });
    y = (doc as any).lastAutoTable.finalY + 4;
  } else {
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      theme: "grid",
      styles: { halign: "center", fontSize: 8, cellPadding: 3, lineColor: SLATE_200 as unknown as string },
      head: [["Entrada esperada", "Salida esperada", "Horas esperadas", "Día"]],
      headStyles: { fillColor: SLATE_50 as unknown as string, textColor: [71, 85, 105] as unknown as string, fontSize: 7 },
      body: [[formatHora(reporte.horaInicio), formatHora(reporte.horaFin), formatHoras(reporte.horasEsperadas), reporte.diaSemana]],
    });
    y = (doc as any).lastAutoTable.finalY + 4;
  }

  // ============================================================
  // RESUMEN DE ASISTENCIA
  // ============================================================
  doc.setFillColor(SLATE_50[0], SLATE_50[1], SLATE_50[2]);
  doc.rect(margin, y, pageWidth - 2 * margin, 6, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(SLATE_500[0], SLATE_500[1], SLATE_500[2]);
  doc.text("RESUMEN DE ASISTENCIA", margin + 2, y + 4);
  y += 8;

  const a = reporte.asistencia;
  const estadoColor: Record<string, number[]> = {
    PRESENTE: [240, 253, 244],
    TARDANZA: [255, 251, 235],
    AUSENTE: [254, 242, 242],
    DESCANSO: [241, 245, 249],
    JUSTIFICADO: [239, 246, 255],
    SIN_MARCAR: [248, 250, 252],
  };
  const estado = (a?.estadoDia || "—").toUpperCase();
  const bg = estadoColor[estado] || [248, 250, 252];

    autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: "grid",
    head: [["ESTADO", "ENTRADA", "SALIDA", "TRABAJADAS", "TARDANZA", "EXTRA"]],
    headStyles: { fillColor: [15, 23, 42] as unknown as string, textColor: [255, 255, 255] as unknown as string, fontSize: 7, halign: "center" },
    body: [[
      estado,
      formatHora(a?.entradaReal),
      formatHora(a?.salidaReal),
      formatHoras(a?.horasTrabajadas),
      a?.minutosTardanza ? `${a.minutosTardanza} min` : "—",
      formatHoras(reporte.horasExtra),
    ]],
    styles: { halign: "center", fontSize: 8, cellPadding: 3, lineColor: SLATE_200 as unknown as string },
    bodyStyles: { textColor: [15, 23, 42] },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 0) {
        data.cell.styles.fillColor = bg as any;
        data.cell.styles.fontStyle = "bold";
      }
      // 👇 Columna TARDANZA (índice 4): texto rojo si hay minutos de tardanza
      if (data.section === "body" && data.column.index === 4) {
        const hayTardanza = a?.minutosTardanza && a.minutosTardanza > 0;
        if (hayTardanza) {
          data.cell.styles.textColor = [220, 38, 38]; // FFDC2626 en RGB
          data.cell.styles.fontStyle = "bold";
        }
      }
    },
  });
  y = (doc as any).lastAutoTable.finalY + 4;

  // ============================================================
  // SITUACIÓN / JUSTIFICACIÓN
  // ============================================================
  doc.setFillColor(SLATE_50[0], SLATE_50[1], SLATE_50[2]);
  doc.rect(margin, y, pageWidth - 2 * margin, 6, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(SLATE_500[0], SLATE_500[1], SLATE_500[2]);
  doc.text("SITUACIÓN / JUSTIFICACIÓN", margin + 2, y + 4);
  y += 8;

  const hasSituacion = a && (a.justificado || (a.situacion && a.situacion !== "NINGUNA") || (a.situacionesDetalle && a.situacionesDetalle.length > 0));
  if (!hasSituacion) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text("Sin justificación registrada.", margin, y);
    y += 4;
  } else {
    const situacion = a.situacion || "—";
    const tipo = a.justificacionTipo || "—";
    const motivo = a.justificacionMotivo || "—";
    const obs = a.justificacionObservacion || "—";
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      theme: "grid",
      styles: { fontSize: 7, cellPadding: 2, lineColor: SLATE_200 as unknown as string },
      columnStyles: { 0: { cellWidth: 30 }, 1: { cellWidth: pageWidth - 2 * margin - 30 } },
      body: [
        ["Situación", situacion],
        ["Tipo", tipo],
        ["Motivo", motivo],
        ["Observación", obs],
      ],
    });
    y = (doc as any).lastAutoTable.finalY + 4;
  }

  // ============================================================
  // OBSERVACIONES
  // ============================================================
  if (a?.observaciones && a.observaciones.trim()) {
    doc.setFillColor(SLATE_50[0], SLATE_50[1], SLATE_50[2]);
    doc.rect(margin, y, pageWidth - 2 * margin, 6, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(SLATE_500[0], SLATE_500[1], SLATE_500[2]);
    doc.text("OBSERVACIONES", margin + 2, y + 4);
    y += 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(51, 65, 85);
    const split = doc.splitTextToSize(a.observaciones, pageWidth - 2 * margin - 4);
    doc.rect(margin, y - 2, pageWidth - 2 * margin, split.length * 4 + 6);
    doc.text(split, margin + 2, y + 2);
    y += split.length * 4 + 8;
  }

  // ============================================================
  // FOOTER
  // ============================================================
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.setTextColor(148, 163, 184);
    doc.text("PractiQR • Sistema de Control de Asistencia • OLAMSA", margin, pageHeight - 8);
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: "right" });
  }

  return doc;
}

export async function descargarPdfDiario(reporte: ReporteDiarioResponse) {
  const doc = await generarPdfDiario(reporte);
  const dni = reporte.practicante.documento || "sindni";
  const fecha = reporte.fecha;
  doc.save(`ReporteDiario_${dni}_${fecha}.pdf`);
  return doc;
}