import ExcelJS from "exceljs";
import { ReporteSemanalResponse } from "@/types/reporte";

// Paleta OLAMSA — idéntica a diarioExcel.ts
const OLAMSA_GREEN = "FF0E7A4C";
const OLAMSA_GREEN_LIGHT = "FFE6F6EF";
const SLATE_900 = "FF0F172A";
const SLATE_500 = "FF64748B";
const SLATE_200 = "FFE2E8F0";
const SLATE_100 = "FFF1F5F9";
const SLATE_50 = "FFF8FAFC";

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

async function loadImageBase64ForExcel(url: string): Promise<{ base64: string; extension: "png" | "jpeg"; width: number; height: number } | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`No se pudo cargar el logo: ${url} status ${res.status}`);
    const blob = await res.blob();
    const dataUrl: string = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error(`FileReader error ${url}`));
      reader.readAsDataURL(blob);
    });
    const match = dataUrl.match(/^data:image\/(png|jpeg|jpg);base64,(.*)$/);
    if (!match) return null;
    const ext = match[1] === "jpg" ? "jpeg" : (match[1] as "png" | "jpeg");
    const base64 = match[2];
    const dims = await new Promise<{ w: number; h: number }>((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
      img.onerror = () => resolve({ w: 200, h: 80 });
      img.src = dataUrl;
    });
    return { base64, extension: ext, width: dims.w, height: dims.h };
  } catch (e) {
    console.warn(`[Excel] Error cargando logo ${url}:`, e instanceof Error ? e.message : e);
    return null;
  }
}

const BORDER_THIN = {
  top: { style: "thin" as const, color: { argb: SLATE_200 } },
  left: { style: "thin" as const, color: { argb: SLATE_200 } },
  bottom: { style: "thin" as const, color: { argb: SLATE_200 } },
  right: { style: "thin" as const, color: { argb: SLATE_200 } },
};

export async function generarExcelSemanal(reporte: ReporteSemanalResponse): Promise<Blob> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "PractiQR";
  wb.created = new Date();

  const ws = wb.addWorksheet("Reporte Semanal", {
    pageSetup: { paperSize: 9, orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0, margins: { left: 0.3, right: 0.3, top: 0.4, bottom: 0.4, header: 0.3, footer: 0.3 } },
    properties: { tabColor: { argb: OLAMSA_GREEN } },
    headerFooter: { oddFooter: "PractiQR • OLAMSA — Página &P de &N" },
  });

  // 9 columnas para detalle: A Día, B Fecha, C Entrada prog, D Entrada real, E Salida prog, F Salida real, G Estado, H Situación, I Horas
  ws.columns = [
    { width: 13 }, // A Día
    { width: 13 }, // B Fecha
    { width: 14 }, // C Ent prog
    { width: 14 }, // D Ent real
    { width: 14 }, // E Sal prog
    { width: 14 }, // F Sal real
    { width: 13 }, // G Estado
    { width: 20 }, // H Situación
    { width: 10 }, // I Horas
  ];

  const COLS = 9 as const;
  const cols = (n: number) => String.fromCharCode(64 + n);

  const HEADER_ROWS = 5;
  for (let row = 1; row <= HEADER_ROWS; row++) {
    for (let col = 1; col <= COLS; col++) {
      ws.getCell(row, col).fill = { type: "pattern", pattern: "solid", fgColor: { argb: OLAMSA_GREEN_LIGHT } };
    }
  }
  ws.getRow(1).height = 22;
  ws.getRow(2).height = 24;
  ws.getRow(3).height = 16;
  ws.getRow(4).height = 14;
  ws.getRow(5).height = 6;

  try {
    let img = await loadImageBase64ForExcel("/images/LOGO-C1.png");
    if (!img) img = await loadImageBase64ForExcel("/images/LOGO_OLAMSA.png");
    if (!img) img = await loadImageBase64ForExcel("/images/logo-olamsa.png");
    if (img) {
      const imageId = wb.addImage({ base64: img.base64, extension: img.extension });
      const MAX_W = 280;
      const MAX_H = 90;
      let w = img.width;
      let h = img.height;
      const ratio = w / h;
      if (w > MAX_W) { w = MAX_W; h = w / ratio; }
      if (h > MAX_H) { h = MAX_H; w = h * ratio; }
      ws.addImage(imageId, { tl: { col: 0.4, row: 0.6 }, ext: { width: w, height: h }, editAs: "oneCell" });
    }
  } catch (e) {
    console.warn("[Excel] Error al agregar logo:", e);
  }

  ws.mergeCells(`A2:${cols(COLS)}2`);
  const titleCell = ws.getCell("A2");
  titleCell.value = "REPORTE SEMANAL DE ASISTENCIA";
  titleCell.font = { size: 16, bold: true, color: { argb: SLATE_900 } };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  ws.mergeCells(`A3:${cols(COLS)}3`);
  const subCell = ws.getCell("A3");
  subCell.value = "Sistema PractiQR";
  subCell.font = { size: 10, color: { argb: SLATE_500 } };
  subCell.alignment = { horizontal: "center", vertical: "middle" };
  ws.mergeCells(`A4:${cols(COLS)}4`);
  const fechaCell = ws.getCell("A4");
  fechaCell.value = `Generado: ${new Date().toLocaleString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })} (America/Lima)`;
  fechaCell.font = { size: 8, color: { argb: SLATE_500 } };
  fechaCell.alignment = { horizontal: "right", vertical: "middle" };

  let r = HEADER_ROWS + 1;
  for (let col = 1; col <= COLS; col++) {
    ws.getCell(r, col).fill = { type: "pattern", pattern: "solid", fgColor: { argb: OLAMSA_GREEN } };
  }
  ws.getRow(r).height = 3;
  r++;
  ws.getRow(r).height = 4;
  r++;

  const sectionHeader = (label: string) => {
    ws.mergeCells(`A${r}:${cols(COLS)}${r}`);
    const c = ws.getCell(`A${r}`);
    c.value = label;
    c.font = { size: 9, bold: true, color: { argb: SLATE_500 } };
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: SLATE_100 } };
    c.alignment = { horizontal: "left", vertical: "middle", indent: 1 };
    for (let col = 1; col <= COLS; col++) {
      ws.getCell(r, col).border = { top: { style: "thin", color: { argb: SLATE_200 } }, bottom: { style: "thin", color: { argb: SLATE_200 } } };
    }
    ws.getRow(r).height = 18;
    r++;
  };

  // DATOS DEL PRACTICANTE — reutiliza layout A/B/C/D con merges B-C? adaptamos a 9 cols: A label1 B value1 C label2 D value2 E label3 F value3 ...
  sectionHeader("DATOS DEL PRACTICANTE");
  const p = reporte.practicante;
  const addFieldRow9 = (label1: string, val1: string, label2: string, val2: string, label3: string, val3: string) => {
    const pairs: [string, string][] = [[label1, val1], [label2, val2], [label3, val3]];
    let col = 1;
    for (const [lab, val] of pairs) {
      ws.getCell(r, col).value = lab;
      ws.getCell(r, col).font = { size: 8, bold: true, color: { argb: SLATE_500 } };
      ws.getCell(r, col).fill = { type: "pattern", pattern: "solid", fgColor: { argb: SLATE_50 } };
      ws.getCell(r, col).alignment = { vertical: "middle", indent: 1 };
      ws.getCell(r, col).border = BORDER_THIN;
      col++;
      ws.getCell(r, col).value = val;
      ws.getCell(r, col).font = { size: 9, color: { argb: SLATE_900 } };
      ws.getCell(r, col).alignment = { vertical: "middle", indent: 1 };
      ws.getCell(r, col).border = BORDER_THIN;
      col++;
      ws.getCell(r, col).value = "";
      ws.getCell(r, col).border = BORDER_THIN;
      col++;
    }
    ws.getRow(r).height = 18;
    r++;
  };
  addFieldRow9("Practicante", p.nombreCompleto || "—", "DNI", p.documento || "—", "Sede", p.sede || "—");
  addFieldRow9("Oficina", p.nombreOficina || (p as any).oficina || "—", "Cargo", p.cargo || "—", "Instituto", (p as any).tipoInstituto || "—");
  addFieldRow9("Estado", p.situacion || "—", "Periodo prácticas", `${p.fechaInicioPracticas || "—"}${p.fechaFinPracticas ? " — " + p.fechaFinPracticas : ""}`, "", "");
  ws.getRow(r).height = 6; r++;

  // PERIODO
  sectionHeader("PERIODO DEL REPORTE");
  ws.mergeCells(`A${r}:${cols(COLS)}${r}`);
  ws.getCell(`A${r}`).value = `${reporte.semanaLabel}    •    Tipo: Semanal    •    Lunes-Sábado`;
  ws.getCell(`A${r}`).font = { size: 9, color: { argb: SLATE_900 } };
  ws.getCell(`A${r}`).alignment = { horizontal: "left", vertical: "middle", indent: 1 };
  for (let col = 1; col <= COLS; col++) ws.getCell(r, col).border = BORDER_THIN;
  ws.getRow(r).height = 18; r++;
  ws.mergeCells(`A${r}:${cols(COLS)}${r}`);
  ws.getCell(`A${r}`).value = `${formatFechaLarga(reporte.semanaInicio)}  →  ${formatFechaLarga(reporte.semanaFin)}`;
  ws.getCell(`A${r}`).font = { size: 8, color: { argb: SLATE_500 } };
  ws.getCell(`A${r}`).alignment = { horizontal: "left", vertical: "middle", indent: 1 };
  for (let col = 1; col <= COLS; col++) ws.getCell(r, col).border = BORDER_THIN;
  ws.getRow(r).height = 16; r++;
  ws.getRow(r).height = 6; r++;

  // RESUMEN SEMANAL
  sectionHeader("RESUMEN SEMANAL");
  const rSum = reporte.resumen;
  const headResumen = ["Prog.", "Trabaj.", "Presentes", "Tardanzas", "Ausencias", "Justif.", "Descansos", "Cumplimiento"];
  // usar 8 cols centradas, col 9 mergeada vacía
  headResumen.forEach((h, i) => {
    const c = ws.getCell(r, i + 1);
    c.value = h;
    c.font = { size: 8, bold: true, color: { argb: SLATE_500 } };
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: SLATE_50 } };
    c.alignment = { horizontal: "center", vertical: "middle" };
    c.border = BORDER_THIN;
  });
  ws.getCell(r, 9).border = BORDER_THIN;
  ws.getRow(r).height = 16; r++;
  const valsResumen = [String(rSum.diasProgramados), String(rSum.diasTrabajados), String(rSum.diasPresentes), String(rSum.tardanzas), String(rSum.ausencias), String(rSum.justificaciones), String(rSum.descansos), `${Number(rSum.porcentajeCumplimiento).toFixed(1)}%`];
  valsResumen.forEach((v, i) => {
    const c = ws.getCell(r, i + 1);
    c.value = v;
    c.font = { size: 10, bold: true, color: { argb: SLATE_900 } };
    c.alignment = { horizontal: "center", vertical: "middle" };
    c.border = BORDER_THIN;
  });
  ws.getCell(r, 9).border = BORDER_THIN;
  ws.getRow(r).height = 20; r++;
  ws.getRow(r).height = 6; r++;

  // BALANCE DE HORAS
  sectionHeader("BALANCE DE HORAS");
  const headBal = ["Horas programadas", "Horas trabajadas", "Balance", "Cumplimiento"];
  headBal.forEach((h, i) => {
    // distribuir en 9 cols: cada header ocupa ~2 cols mergeadas? simplificamos: col1-2,3-4,5-6,7-9
    // Para mantener simple, usamos A,B,C,D con merges hack no needed — usaremos 9 con repeats
  });
  // Balance row: usar 4 celdas mergeadas: A:C, D:F, G:H, I
  ws.mergeCells(`A${r}:C${r}`);
  ws.getCell(`A${r}`).value = "Horas programadas";
  ws.getCell(`A${r}`).font = { size: 8, bold: true, color: { argb: "FFFFFFFF" } };
  ws.getCell(`A${r}`).fill = { type: "pattern", pattern: "solid", fgColor: { argb: SLATE_900 } };
  ws.getCell(`A${r}`).alignment = { horizontal: "center", vertical: "middle" };
  ws.getCell(`A${r}`).border = BORDER_THIN;
  ws.mergeCells(`D${r}:F${r}`);
  ws.getCell(`D${r}`).value = "Horas trabajadas";
  ws.getCell(`D${r}`).font = { size: 8, bold: true, color: { argb: "FFFFFFFF" } };
  ws.getCell(`D${r}`).fill = { type: "pattern", pattern: "solid", fgColor: { argb: SLATE_900 } };
  ws.getCell(`D${r}`).alignment = { horizontal: "center", vertical: "middle" };
  ws.getCell(`D${r}`).border = BORDER_THIN;
  ws.mergeCells(`G${r}:H${r}`);
  ws.getCell(`G${r}`).value = "Balance";
  ws.getCell(`G${r}`).font = { size: 8, bold: true, color: { argb: "FFFFFFFF" } };
  ws.getCell(`G${r}`).fill = { type: "pattern", pattern: "solid", fgColor: { argb: SLATE_900 } };
  ws.getCell(`G${r}`).alignment = { horizontal: "center", vertical: "middle" };
  ws.getCell(`G${r}`).border = BORDER_THIN;
  ws.getCell(`I${r}`).value = "Cumplimiento";
  ws.getCell(`I${r}`).font = { size: 8, bold: true, color: { argb: "FFFFFFFF" } };
  ws.getCell(`I${r}`).fill = { type: "pattern", pattern: "solid", fgColor: { argb: SLATE_900 } };
  ws.getCell(`I${r}`).alignment = { horizontal: "center", vertical: "middle" };
  ws.getCell(`I${r}`).border = BORDER_THIN;
  for (let col = 1; col <= COLS; col++) if (!ws.getCell(r, col).border) ws.getCell(r, col).border = BORDER_THIN;
  ws.getRow(r).height = 18; r++;

  const balanceStr = rSum.estadoBalance === "FALTANTES" ? `Faltantes ${formatHoras(rSum.horasFaltantes)}` : rSum.estadoBalance === "ADICIONALES" ? `Adicionales ${formatHoras(rSum.horasAdicionales)}` : "Jornada cumplida";
  const balanceColor = rSum.estadoBalance === "FALTANTES" ? "FFDC2626" : rSum.estadoBalance === "ADICIONALES" ? "FF16A34A" : SLATE_900;
  ws.mergeCells(`A${r}:C${r}`);
  ws.getCell(`A${r}`).value = formatHoras(rSum.horasProgramadas);
  ws.getCell(`A${r}`).font = { size: 10, bold: true, color: { argb: SLATE_900 } };
  ws.getCell(`A${r}`).alignment = { horizontal: "center", vertical: "middle" };
  ws.getCell(`A${r}`).border = BORDER_THIN;
  ws.mergeCells(`D${r}:F${r}`);
  ws.getCell(`D${r}`).value = formatHoras(rSum.horasTrabajadas);
  ws.getCell(`D${r}`).font = { size: 10, bold: true, color: { argb: SLATE_900 } };
  ws.getCell(`D${r}`).alignment = { horizontal: "center", vertical: "middle" };
  ws.getCell(`D${r}`).border = BORDER_THIN;
  ws.mergeCells(`G${r}:H${r}`);
  ws.getCell(`G${r}`).value = balanceStr;
  ws.getCell(`G${r}`).font = { size: 10, bold: true, color: { argb: balanceColor } };
  ws.getCell(`G${r}`).alignment = { horizontal: "center", vertical: "middle" };
  ws.getCell(`G${r}`).border = BORDER_THIN;
  ws.getCell(`I${r}`).value = `${Number(rSum.porcentajeCumplimiento).toFixed(1)}%`;
  ws.getCell(`I${r}`).font = { size: 10, bold: true, color: { argb: SLATE_900 } };
  ws.getCell(`I${r}`).alignment = { horizontal: "center", vertical: "middle" };
  ws.getCell(`I${r}`).border = BORDER_THIN;
  ws.getRow(r).height = 20; r++;
  ws.getRow(r).height = 6; r++;

  // DETALLE DIARIO
  sectionHeader("DETALLE DIARIO (LUNES-SÁBADO)");
  const headDet = ["Día", "Fecha", "Entrada prog.", "Entrada real", "Salida prog.", "Salida real", "Estado", "Situación", "Horas"];
  headDet.forEach((h, i) => {
    const c = ws.getCell(r, i + 1);
    c.value = h;
    c.font = { size: 7, bold: true, color: { argb: "FFFFFFFF" } };
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: SLATE_900 } };
    c.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    c.border = BORDER_THIN;
  });
  ws.getRow(r).height = 20; r++;

  const estadoFill: Record<string, string> = {
    PRESENTE: "FFF0FDF4",
    TARDANZA: "FFFFFBEB",
    AUSENTE: "FFFEF2F2",
    DESCANSO: "FFF1F5F9",
    JUSTIFICADO: "FFEFF6FF",
    SIN_MARCAR: "FFF8FAFC",
  };

  for (const d of reporte.detalleDiario) {
    const isDesc = d.esDescanso;
    const vals = [
      d.diaSemana,
      d.fecha,
      isDesc ? "—" : formatHora(d.horaInicio),
      isDesc ? "—" : formatHora(d.asistencia?.entradaReal),
      isDesc ? "—" : formatHora(d.horaFin),
      isDesc ? "—" : formatHora(d.asistencia?.salidaReal),
      d.estado,
      getSituacionLabel(d.situacion),
      isDesc ? "—" : formatHoras(d.horasTrabajadas),
    ];
    vals.forEach((v, i) => {
      const c = ws.getCell(r, i + 1);
      c.value = v;
      c.font = { size: 8, bold: i === 6, color: { argb: SLATE_900 } };
      if (i === 6) c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: estadoFill[v?.toUpperCase() || ""] || SLATE_50 } };
      c.alignment = { horizontal: "center", vertical: "middle" };
      c.border = BORDER_THIN;
    });
    ws.getRow(r).height = 18; r++;
  }
  ws.getRow(r).height = 6; r++;

  // INCIDENCIAS
  sectionHeader("INCIDENCIAS SEMANALES");
  if (!reporte.incidencias || reporte.incidencias.length === 0) {
    ws.mergeCells(`A${r}:${cols(COLS)}${r}`);
    const c = ws.getCell(`A${r}`);
    c.value = "Sin incidencias relevantes.";
    c.font = { size: 9, italic: true, color: { argb: "FF94A3B8" } };
    c.alignment = { vertical: "middle", indent: 1 };
    for (let col = 1; col <= COLS; col++) ws.getCell(r, col).border = BORDER_THIN;
    ws.getRow(r).height = 18; r++;
  } else {
    for (const inc of reporte.incidencias) {
      ws.mergeCells(`A${r}:${cols(COLS)}${r}`);
      const c = ws.getCell(`A${r}`);
      c.value = `• ${inc}`;
      c.font = { size: 8, color: { argb: "FF334155" } };
      c.alignment = { vertical: "middle", wrapText: true, indent: 1 };
      for (let col = 1; col <= COLS; col++) ws.getCell(r, col).border = BORDER_THIN;
      ws.getRow(r).height = 18; r++;
    }
  }
  ws.getRow(r).height = 6; r++;

  // FOOTER
  r += 1;
  ws.mergeCells(`A${r}:${cols(COLS)}${r}`);
  const foot = ws.getCell(`A${r}`);
  foot.value = `PractiQR • Sistema de Control de Asistencia • OLAMSA    •    Página 1 de 1    •    Generado: ${new Date().toLocaleString("es-ES")}`;
  foot.font = { size: 8, color: { argb: "FF94A3B8" } };
  foot.alignment = { horizontal: "center", vertical: "middle" };

  ws.pageSetup.printArea = `A1:${cols(COLS)}${r}`;
  ws.views = [{ state: "frozen", ySplit: 6 }];

  const buffer = await wb.xlsx.writeBuffer();
  return new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}

export async function descargarExcelSemanal(reporte: ReporteSemanalResponse) {
  const blob = await generarExcelSemanal(reporte);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const dni = reporte.practicante.documento || "sindni";
  const fecha = reporte.semanaInicio;
  a.download = `ReporteSemanal_${dni}_${fecha}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
