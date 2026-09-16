import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ReporteSemanalResponse } from "@/types/reporte";

// Paleta institucional OLAMSA + PractiQR — idéntica a diarioPdf.ts
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
function getSituacionLabel(s?: string | null) {
  if (!s || s === "NINGUNA") return "—";
  if (s === "TARDANZA_JUSTIFICADA") return "Tard. justificada";
  if (s === "SALIDA_ANTICIPADA_JUSTIFICADA") return "Salida anticipada";
  if (s === "INASISTENCIA_JUSTIFICADA") return "Inasist. justificada";
  return s;
}

async function loadImageAsBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    if (!blob.type.startsWith("image/")) return null;
    const dataUrl: string = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error(`FileReader error para ${url}`));
      reader.readAsDataURL(blob);
    });
    if (!dataUrl.startsWith("data:image/")) return null;
    return dataUrl;
  } catch {
    return null;
  }
}

async function cargarLogoOlamsa(): Promise<string | null> {
  const candidatos = ["/images/LOGO-C1.png", "/images/LOGO_OLAMSA.png", "/images/logo-olamsa.png"];
  for (const ruta of candidatos) {
    const logo = await loadImageAsBase64(ruta);
    if (logo) return logo;
  }
  return null;
}

export async function generarPdfSemanal(reporte: ReporteSemanalResponse): Promise<jsPDF> {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let y = 14;

  const HEADER_H = 36;
  const HEADER_PAD = 3;
  const LOGO_MAX_W = 40;
  const LOGO_MAX_H = HEADER_H - HEADER_PAD * 2;

  doc.setFillColor(OLAMSA_GREEN_LIGHT[0], OLAMSA_GREEN_LIGHT[1], OLAMSA_GREEN_LIGHT[2]);
  doc.rect(0, 0, pageWidth, HEADER_H, "F");
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
      const logoY = centerY - h / 2;
      doc.addImage(logo, "PNG", margin, logoY, w, h);
      logoW = w;
      logoDrawn = true;
    } catch {}
  }
  if (!logoDrawn) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(OLAMSA_GREEN[0], OLAMSA_GREEN[1], OLAMSA_GREEN[2]);
    doc.text("OLAMSA", margin, centerY + 8);
    logoW = doc.getTextWidth("OLAMSA");
  }
  const textoX = margin + logoW + 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(SLATE_900[0], SLATE_900[1], SLATE_900[2]);
  doc.text("REPORTE SEMANAL DE ASISTENCIA", textoX, centerY - 1);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(SLATE_500[0], SLATE_500[1], SLATE_500[2]);
  doc.text("Sistema PractiQR", textoX, centerY + 6);
  const fechaGen = reporte.fechaGeneracion
    ? new Date(reporte.fechaGeneracion).toLocaleString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : new Date().toLocaleString("es-ES");
  doc.setFontSize(6.5);
  doc.setTextColor(SLATE_500[0], SLATE_500[1], SLATE_500[2]);
  doc.text(`Generado: ${fechaGen} (America/Lima)`, pageWidth - margin, y + HEADER_H - 4, { align: "right" });
  y += HEADER_H;
  doc.setFillColor(OLAMSA_GREEN[0], OLAMSA_GREEN[1], OLAMSA_GREEN[2]);
  doc.rect(margin, y, pageWidth - 2 * margin, 1.4, "F");
  y += 5;
  doc.setDrawColor(SLATE_200[0], SLATE_200[1], SLATE_200[2]);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  const p = reporte.practicante;
  const r = reporte.resumen;

  // ========= DATOS DEL PRACTICANTE =========
  doc.setFillColor(SLATE_50[0], SLATE_50[1], SLATE_50[2]);
  doc.rect(margin, y, pageWidth - 2 * margin, 6, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(SLATE_500[0], SLATE_500[1], SLATE_500[2]);
  doc.text("DATOS DEL PRACTICANTE", margin + 2, y + 4);
  y += 8;

  const colW = (pageWidth - 2 * margin) / 3;
  const tableStyles = {
    styles: { font: "helvetica", fontSize: 7, cellPadding: 2, lineColor: SLATE_200 as unknown as string, textColor: [15, 23, 42] as [number, number, number] },
    headStyles: { fillColor: SLATE_50 as unknown as string, textColor: SLATE_500 as unknown as string, fontStyle: "bold" as const, fontSize: 6 },
    bodyStyles: { fontSize: 7 },
    columnStyles: { 0: { cellWidth: colW }, 1: { cellWidth: colW }, 2: { cellWidth: colW } },
    margin: { left: margin, right: margin },
    theme: "grid" as const,
  };
  autoTable(doc, { ...tableStyles, startY: y, head: [["Practicante", "DNI", "Sede"]], body: [[p.nombreCompleto || "—", p.documento || "—", p.sede || "—"]] });
  y = (doc as any).lastAutoTable.finalY + 0.5;
  autoTable(doc, { ...tableStyles, startY: y, head: [["Área", "Cargo", "Instituto"]], body: [[p.nombreArea || (p as any).area || "—", p.cargo || "—", (p as any).tipoInstituto || "—"]] });
  y = (doc as any).lastAutoTable.finalY + 0.5;
  autoTable(doc, { ...tableStyles, startY: y, head: [["Estado", "Periodo prácticas", ""]], body: [[p.situacion || "—", `${p.fechaInicioPracticas || "—"} ${p.fechaFinPracticas ? "— " + p.fechaFinPracticas : ""}`, ""]] });
  y = (doc as any).lastAutoTable.finalY + 4;

  // ========= PERIODO =========
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(SLATE_500[0], SLATE_500[1], SLATE_500[2]);
  doc.text("PERIODO DEL REPORTE", margin, y);
  y += 4;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(SLATE_900[0], SLATE_900[1], SLATE_900[2]);
  doc.text(`${reporte.semanaLabel}  •  Tipo: Semanal  •  Lunes-Sábado`, margin, y);
  y += 4;
  doc.setFontSize(6.5);
  doc.setTextColor(SLATE_500[0], SLATE_500[1], SLATE_500[2]);
  doc.text(`${formatFechaLarga(reporte.semanaInicio)} → ${formatFechaLarga(reporte.semanaFin)}`, margin, y);
  y += 6;

  // ========= RESUMEN SEMANAL =========
  doc.setFillColor(SLATE_50[0], SLATE_50[1], SLATE_50[2]);
  doc.rect(margin, y, pageWidth - 2 * margin, 6, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(SLATE_500[0], SLATE_500[1], SLATE_500[2]);
  doc.text("RESUMEN SEMANAL", margin + 2, y + 4);
  y += 8;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: "grid",
    styles: { halign: "center", fontSize: 7, cellPadding: 2.5, lineColor: SLATE_200 as unknown as string },
    head: [["Prog.", "Trabaj.", "Presentes", "Tardanzas", "Ausencias", "Justif.", "Descansos", "Cumplimiento"]],
    headStyles: { fillColor: SLATE_50 as unknown as string, textColor: [71, 85, 105] as unknown as string, fontSize: 6 },
    body: [[
      String(r.diasProgramados),
      String(r.diasTrabajados),
      String(r.diasPresentes),
      String(r.tardanzas),
      String(r.ausencias),
      String(r.justificaciones),
      String(r.descansos),
      `${Number(r.porcentajeCumplimiento).toFixed(1)}%`,
    ]],
  });
  y = (doc as any).lastAutoTable.finalY + 4;

  // ========= BALANCE DE HORAS =========
  doc.setFillColor(SLATE_50[0], SLATE_50[1], SLATE_50[2]);
  doc.rect(margin, y, pageWidth - 2 * margin, 6, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(SLATE_500[0], SLATE_500[1], SLATE_500[2]);
  doc.text("BALANCE DE HORAS", margin + 2, y + 4);
  y += 8;

  const balanceVal = r.estadoBalance === "FALTANTES" ? `Faltantes ${formatHoras(r.horasFaltantes)}` : r.estadoBalance === "ADICIONALES" ? `Adicionales ${formatHoras(r.horasAdicionales)}` : "Jornada cumplida";
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: "grid",
    styles: { halign: "center", fontSize: 8, cellPadding: 2.5, lineColor: SLATE_200 as unknown as string },
    head: [["Horas programadas", "Horas trabajadas", "Balance", "Cumplimiento"]],
    headStyles: { fillColor: [15, 23, 42] as unknown as string, textColor: [255, 255, 255] as unknown as string, fontSize: 7 },
    body: [[formatHoras(r.horasProgramadas), formatHoras(r.horasTrabajadas), balanceVal, `${Number(r.porcentajeCumplimiento).toFixed(1)}%`]],
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 2) {
        if (r.estadoBalance === "FALTANTES") data.cell.styles.textColor = [220, 38, 38];
        else if (r.estadoBalance === "ADICIONALES") data.cell.styles.textColor = [22, 163, 74];
        data.cell.styles.fontStyle = "bold";
      }
    },
  });
  y = (doc as any).lastAutoTable.finalY + 4;

  // ========= DETALLE DIARIO =========
  doc.setFillColor(SLATE_50[0], SLATE_50[1], SLATE_50[2]);
  doc.rect(margin, y, pageWidth - 2 * margin, 6, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(SLATE_500[0], SLATE_500[1], SLATE_500[2]);
  doc.text("DETALLE DIARIO (LUNES-SÁBADO)", margin + 2, y + 4);
  y += 8;

  const estadoColor: Record<string, number[]> = {
    PRESENTE: [240, 253, 244],
    TARDANZA: [255, 251, 235],
    AUSENTE: [254, 242, 242],
    DESCANSO: [241, 245, 249],
    JUSTIFICADO: [239, 246, 255],
    SIN_MARCAR: [248, 250, 252],
  };

  const detalleBody = reporte.detalleDiario.map((d) => [
    d.diaSemana,
    d.fecha,
    d.esDescanso ? "—" : formatHora(d.horaInicio),
    d.esDescanso ? "—" : formatHora(d.asistencia?.entradaReal),
    d.esDescanso ? "—" : formatHora(d.horaFin),
    d.esDescanso ? "—" : formatHora(d.asistencia?.salidaReal),
    d.estado,
    getSituacionLabel(d.situacion),
    d.esDescanso ? "—" : formatHoras(d.horasTrabajadas),
  ]);

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: "grid",
    head: [["Día", "Fecha", "Entrada prog.", "Entrada real", "Salida prog.", "Salida real", "Estado", "Situación", "Horas"]],
    headStyles: { fillColor: [15, 23, 42] as unknown as string, textColor: [255, 255, 255] as unknown as string, fontSize: 6, halign: "center" },
    body: detalleBody,
    styles: { halign: "center", fontSize: 7, cellPadding: 2, lineColor: SLATE_200 as unknown as string },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 6) {
        const est = String(data.cell.raw).toUpperCase();
        const bg = estadoColor[est] || [248, 250, 252];
        data.cell.styles.fillColor = bg as any;
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.fontSize = 6;
      }
    },
  });
  y = (doc as any).lastAutoTable.finalY + 4;

  // ========= INCIDENCIAS =========
  doc.setFillColor(SLATE_50[0], SLATE_50[1], SLATE_50[2]);
  doc.rect(margin, y, pageWidth - 2 * margin, 6, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(SLATE_500[0], SLATE_500[1], SLATE_500[2]);
  doc.text("INCIDENCIAS SEMANALES", margin + 2, y + 4);
  y += 8;

  if (!reporte.incidencias || reporte.incidencias.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text("Sin incidencias relevantes.", margin, y);
    y += 4;
  } else {
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      theme: "grid",
      styles: { fontSize: 7, cellPadding: 2, lineColor: SLATE_200 as unknown as string },
      head: [["Incidencia"]],
      headStyles: { fillColor: [255, 251, 235] as unknown as string, textColor: [120, 53, 15] as unknown as string },
      body: reporte.incidencias.map((inc) => [inc]),
    });
    y = (doc as any).lastAutoTable.finalY + 4;
  }

  // ========= FOOTER =========
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

export async function descargarPdfSemanal(reporte: ReporteSemanalResponse) {
  const doc = await generarPdfSemanal(reporte);
  const dni = reporte.practicante.documento || "sindni";
  const fecha = reporte.semanaInicio;
  doc.save(`ReporteSemanal_${dni}_${fecha}.pdf`);
  return doc;
}
