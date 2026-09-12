import ExcelJS from "exceljs";
import { ReporteDiarioResponse } from "@/types/reporte";

// Paleta OLAMSA
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

async function loadImageBase64ForExcel(
  url: string
): Promise<{ base64: string; extension: "png" | "jpeg"; width: number; height: number } | null> {
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

export async function generarExcelDiario(reporte: ReporteDiarioResponse): Promise<Blob> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "PractiQR";
  wb.created = new Date();

  const ws = wb.addWorksheet("Reporte Diario", {
    pageSetup: {
      paperSize: 9,
      orientation: "portrait",
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: { left: 0.4, right: 0.4, top: 0.5, bottom: 0.5, header: 0.3, footer: 0.3 },
    },
    properties: { tabColor: { argb: OLAMSA_GREEN } },
    headerFooter: { oddFooter: "PractiQR • OLAMSA — Página &P de &N" },
  });

  // 👇 Columnas: SIN colchón estrecho. Anchos parejos para que nada se corte.
  //    A=22 (labels/datos 1), B=22 (values 1), C=22 (labels 2), D=22 (values 2), E=22, F=22
  //    Pero necesitamos que el ancho total sea razonable. Usamos:
  //    A=18, B=20, C=18, D=20, E=18, F=18  → total 112 caracteres ≈ ancho A4
  ws.columns = [
    { width: 18 }, // A
    { width: 20 }, // B
    { width: 18 }, // C
    { width: 20 }, // D
    { width: 18 }, // E
    { width: 18 }, // F
  ];

  // ============================================================
  // 1) CABECERA — filas 1-5
  //    Fondo verde suave en A1:F5.
  //    Logo grande anclado en A1:B2.
  //    Título centrado en A1:F1 con padding superior (fila 2 vacía arriba del título).
  //    Subtítulo centrado en A2:F2 (debajo del título).
  //    Fecha generación alineada a la derecha en A4:F4.
  // ============================================================
  const HEADER_ROWS = 5;
  for (let row = 1; row <= HEADER_ROWS; row++) {
    for (let col = 1; col <= 6; col++) {
      ws.getCell(row, col).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: OLAMSA_GREEN_LIGHT },
      };
    }
  }

  // Alturas: fila 1 alta (respiración arriba + logo), fila 2 título, fila 3 subtítulo, fila 4 fecha, fila 5 respiro
  ws.getRow(1).height = 22;
  ws.getRow(2).height = 24;
  ws.getRow(3).height = 16;
  ws.getRow(4).height = 14;
  ws.getRow(5).height = 6;

  // Logo GRANDE: máx 180 px ancho, 60 px alto → se ve protagonista
  let logoAdded = false;
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

      // Anclado en A1 con un pequeño padding (0.15 de celda)
      ws.addImage(imageId, {
        tl: { col: 0.4, row: 0.6 },
        ext: { width: w, height: h },
        editAs: "oneCell",
      });
      logoAdded = true;
    }
  } catch (e) {
    console.warn("[Excel] Error al agregar logo:", e);
  }

  // 👇 TÍTULO centrado en TODO el ancho A:F (no solo C:F)
  //    Va en la fila 2, así no choca con el logo (que está en fila 1-2 a la izquierda).
  ws.mergeCells("A2:F2");
  const titleCell = ws.getCell("A2");
  titleCell.value = "REPORTE DIARIO DE ASISTENCIA";
  titleCell.font = { size: 16, bold: true, color: { argb: SLATE_900 } };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };

  // Subtítulo centrado A:F
  ws.mergeCells("A3:F3");
  const subCell = ws.getCell("A3");
  subCell.value = "Sistema PractiQR";
  subCell.font = { size: 10, color: { argb: SLATE_500 } };
  subCell.alignment = { horizontal: "center", vertical: "middle" };

  // Fecha generación alineada a la derecha A:F
  ws.mergeCells("A4:F4");
  const fechaCell = ws.getCell("A4");
  fechaCell.value = `Generado: ${new Date().toLocaleString("es-ES", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  })} (America/Lima)`;
  fechaCell.font = { size: 8, color: { argb: SLATE_500 } };
  fechaCell.alignment = { horizontal: "right", vertical: "middle" };

  let r = HEADER_ROWS + 1; // = 6

  // ============================================================
  // 2) BANDA VERDE institucional
  // ============================================================
  for (let col = 1; col <= 6; col++) {
    ws.getCell(r, col).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: OLAMSA_GREEN },
    };
    ws.getCell(r, col).value = "";
  }
  ws.getRow(r).height = 3;
  r++;

  // Respiro
  ws.getRow(r).height = 4;
  r++;

  // ============================================================
  // Helper: header de sección
  // ============================================================
  const sectionHeader = (label: string) => {
    ws.mergeCells(`A${r}:F${r}`);
    const c = ws.getCell(`A${r}`);
    c.value = label;
    c.font = { size: 9, bold: true, color: { argb: SLATE_500 } };
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: SLATE_100 } };
    c.alignment = { horizontal: "left", vertical: "middle", indent: 1 };
    for (let col = 1; col <= 6; col++) {
      ws.getCell(r, col).border = {
        top: { style: "thin", color: { argb: SLATE_200 } },
        bottom: { style: "thin", color: { argb: SLATE_200 } },
      };
    }
    ws.getRow(r).height = 18;
    r++;
  };

  // ============================================================
  // 3) DATOS DEL PRACTICANTE
  //    Layout: A=label1, B=value1, C=label2, D=value2, E:F vacío
  //    Sin mergear E:F en las filas de datos, así no hay colchón raro.
  // ============================================================
  sectionHeader("DATOS DEL PRACTICANTE");

  const p = reporte.practicante;

  const addFieldRow = (label1: string, val1: string, label2: string, val2: string) => {
    // A: label1
    ws.getCell(`A${r}`).value = label1;
    ws.getCell(`A${r}`).font = { size: 8, bold: true, color: { argb: SLATE_500 } };
    ws.getCell(`A${r}`).fill = { type: "pattern", pattern: "solid", fgColor: { argb: SLATE_50 } };
    ws.getCell(`A${r}`).alignment = { vertical: "middle", indent: 1 };
    ws.getCell(`A${r}`).border = BORDER_THIN;

    // B: value1
    ws.getCell(`B${r}`).value = val1;
    ws.getCell(`B${r}`).font = { size: 9, color: { argb: SLATE_900 } };
    ws.getCell(`B${r}`).alignment = { vertical: "middle", indent: 1 };
    ws.getCell(`B${r}`).border = BORDER_THIN;

    // C: label2
    ws.getCell(`C${r}`).value = label2;
    ws.getCell(`C${r}`).font = { size: 8, bold: true, color: { argb: SLATE_500 } };
    ws.getCell(`C${r}`).fill = { type: "pattern", pattern: "solid", fgColor: { argb: SLATE_50 } };
    ws.getCell(`C${r}`).alignment = { vertical: "middle", indent: 1 };
    ws.getCell(`C${r}`).border = BORDER_THIN;

    // D: value2
    ws.getCell(`D${r}`).value = val2;
    ws.getCell(`D${r}`).font = { size: 9, color: { argb: SLATE_900 } };
    ws.getCell(`D${r}`).alignment = { vertical: "middle", indent: 1 };
    ws.getCell(`D${r}`).border = BORDER_THIN;

    // E: value2 continuación (por si el valor es largo, ej. periodo)
    ws.getCell(`E${r}`).value = "";
    ws.getCell(`E${r}`).border = BORDER_THIN;

    // F: vacío
    ws.getCell(`F${r}`).value = "";
    ws.getCell(`F${r}`).border = BORDER_THIN;

    ws.getRow(r).height = 18;
    r++;
  };

  addFieldRow("Practicante", p.nombreCompleto || "—", "DNI", p.documento || "—");
  addFieldRow("Área", p.nombreArea || (p as any).area || "—", "Cargo", p.cargo || "—");
  addFieldRow("Sede", p.sede || "—", "Instituto", (p as any).tipoInstituto || "—");
  addFieldRow(
    "Estado",
    p.situacion || "—",
    "Periodo prácticas",
    `${p.fechaInicioPracticas || "—"}${p.fechaFinPracticas ? " — " + p.fechaFinPracticas : ""}`
  );

  ws.getRow(r).height = 6;
  r++;

  // ============================================================
  // 4) PERIODO DEL REPORTE
  // ============================================================
  sectionHeader("PERIODO DEL REPORTE");

  ws.mergeCells(`A${r}:F${r}`);
  ws.getCell(`A${r}`).value = `Fecha: ${formatFechaLarga(reporte.fecha)}      •      Tipo: Diario      •      Día: ${reporte.diaSemana}`;
  ws.getCell(`A${r}`).font = { size: 9, color: { argb: SLATE_900 } };
  ws.getCell(`A${r}`).alignment = { horizontal: "left", vertical: "middle", indent: 1 };
  for (let col = 1; col <= 6; col++) {
    ws.getCell(r, col).border = BORDER_THIN;
  }
  ws.getRow(r).height = 18;
  r++;
  ws.getRow(r).height = 6;
  r++;

  // ============================================================
  // 5) HORARIO PROGRAMADO
  //    Layout: A=label, B=value, C=label, D=value, E=label, F=value
  //    3 pares distribuidos equitativamente. Nada se corta.
  // ============================================================
  sectionHeader("HORARIO PROGRAMADO");

  if (reporte.esDescanso) {
    ws.mergeCells(`A${r}:F${r}`);
    const c = ws.getCell(`A${r}`);
    c.value = "DESCANSO — Día no laborable";
    c.font = { size: 10, bold: true, color: { argb: "FF475569" } };
    c.alignment = { horizontal: "center", vertical: "middle" };
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: SLATE_50 } };
    for (let col = 1; col <= 6; col++) {
      ws.getCell(r, col).border = BORDER_THIN;
    }
    ws.getRow(r).height = 20;
    r++;
  } else {
    // Headers: 3 columnas de label (A, C, E) + 3 de value (B, D, F)
    // Pero "Día" tiene header + value, entonces: A=Entrada, B=Salida, C=Horas, D=Día, E=?, F=?
    // Mejor: 4 campos en A,B,C,D y E,F vacíos con borde.
    const headHorario = ["Entrada esperada", "Salida esperada", "Horas esperadas", "Día"];
    headHorario.forEach((h, i) => {
      const col = String.fromCharCode(65 + i);
      const c = ws.getCell(`${col}${r}`);
      c.value = h;
      c.font = { size: 8, bold: true, color: { argb: SLATE_500 } };
      c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: SLATE_50 } };
      c.alignment = { horizontal: "center", vertical: "middle", indent: 1 };
      c.border = BORDER_THIN;
    });
    // E y F vacíos con borde para completar la fila
    ws.getCell(`E${r}`).value = "";
    ws.getCell(`E${r}`).border = BORDER_THIN;
    ws.getCell(`F${r}`).value = "";
    ws.getCell(`F${r}`).border = BORDER_THIN;
    ws.getRow(r).height = 16;
    r++;

    const valsHorario = [
      formatHora(reporte.horaInicio),
      formatHora(reporte.horaFin),
      formatHoras(reporte.horasEsperadas),
      reporte.diaSemana,
    ];
    valsHorario.forEach((v, i) => {
      const col = String.fromCharCode(65 + i);
      const c = ws.getCell(`${col}${r}`);
      c.value = v;
      c.font = { size: 10, bold: true, color: { argb: SLATE_900 } };
      c.alignment = { horizontal: "center", vertical: "middle" };
      c.border = BORDER_THIN;
    });
    ws.getCell(`E${r}`).value = "";
    ws.getCell(`E${r}`).border = BORDER_THIN;
    ws.getCell(`F${r}`).value = "";
    ws.getCell(`F${r}`).border = BORDER_THIN;
    ws.getRow(r).height = 20;
    r++;
  }
  ws.getRow(r).height = 6;
  r++;

  // ============================================================
  // 6) RESUMEN DE ASISTENCIA
  //    6 columnas A-F, cada una con su header y su valor.
  //    Ya no hay colchón estrecho, así "SALIDA" no se corta.
  // ============================================================
  sectionHeader("RESUMEN DE ASISTENCIA");

  const a = reporte.asistencia;
  const estado = (a?.estadoDia || "—").toUpperCase();
  const estadoFill: Record<string, string> = {
    PRESENTE: "FFF0FDF4",
    TARDANZA: "FFFFFBEB",
    AUSENTE: "FFFEF2F2",
    DESCANSO: "FFF1F5F9",
    JUSTIFICADO: "FFEFF6FF",
    SIN_MARCAR: "FFF8FAFC",
  };

  const headRes = ["ESTADO", "ENTRADA", "SALIDA", "TRABAJADAS", "TARDANZA", "EXTRA"];
  headRes.forEach((h, i) => {
    const col = String.fromCharCode(65 + i);
    const c = ws.getCell(`${col}${r}`);
    c.value = h;
    c.font = { size: 8, bold: true, color: { argb: "FFFFFFFF" } };
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: SLATE_900 } };
    c.alignment = { horizontal: "center", vertical: "middle" };
    c.border = BORDER_THIN;
  });
  ws.getRow(r).height = 20;
  r++;

  const valsRes = [
    estado,
    formatHora(a?.entradaReal),
    formatHora(a?.salidaReal),
    formatHoras(a?.horasTrabajadas),
    a?.minutosTardanza ? `${a.minutosTardanza} min` : "—",
    formatHoras(reporte.horasExtra),
  ];
  valsRes.forEach((v, i) => {
    const col = String.fromCharCode(65 + i);
    const c = ws.getCell(`${col}${r}`);
    c.value = v;

    // 👇 Columna TARDANZA (índice 4 = columna E): fuente roja y bold
    const esTardanza = i === 4;
    // 👇 Solo rojo si realmente hay tardanza (no en el "—")
    const hayTardanza = esTardanza && a?.minutosTardanza && a.minutosTardanza > 0;

    if (hayTardanza) {
      c.font = { size: 10, bold: true, color: { argb: "FFDC2626" } }; // rojo intenso
    } else {
      c.font = { size: 10, bold: i === 0, color: { argb: SLATE_900 } };
    }

    if (i === 0) {
      c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: estadoFill[estado] || SLATE_50 } };
    }
    c.alignment = { horizontal: "center", vertical: "middle" };
    c.border = BORDER_THIN;
  });
  ws.getRow(r).height = 22;
  r++;
  ws.getRow(r).height = 6;
  r++;

  // ============================================================
  // 7) SITUACIÓN / JUSTIFICACIÓN
  // ============================================================
  sectionHeader("SITUACIÓN / JUSTIFICACIÓN");

  const hasSituacion =
    a && (a.justificado || (a.situacion && a.situacion !== "NINGUNA") || (a.situacionesDetalle && a.situacionesDetalle.length > 0));

  if (!hasSituacion) {
    ws.mergeCells(`A${r}:F${r}`);
    const c = ws.getCell(`A${r}`);
    c.value = "Sin justificación registrada.";
    c.font = { size: 9, italic: true, color: { argb: "FF94A3B8" } };
    c.alignment = { vertical: "middle", indent: 1 };
    for (let col = 1; col <= 6; col++) {
      ws.getCell(r, col).border = BORDER_THIN;
    }
    ws.getRow(r).height = 18;
    r++;
  } else {
    const addSitRow = (label: string, val: string) => {
      ws.getCell(`A${r}`).value = label;
      ws.getCell(`A${r}`).font = { size: 8, bold: true, color: { argb: SLATE_500 } };
      ws.getCell(`A${r}`).fill = { type: "pattern", pattern: "solid", fgColor: { argb: SLATE_50 } };
      ws.getCell(`A${r}`).alignment = { vertical: "middle", indent: 1 };
      ws.getCell(`A${r}`).border = BORDER_THIN;

      ws.mergeCells(`B${r}:F${r}`);
      ws.getCell(`B${r}`).value = val;
      ws.getCell(`B${r}`).font = { size: 9, color: { argb: SLATE_900 } };
      ws.getCell(`B${r}`).alignment = { vertical: "middle", wrapText: true, indent: 1 };
      for (let col = 2; col <= 6; col++) {
        ws.getCell(r, col).border = BORDER_THIN;
      }
      ws.getRow(r).height = 18;
      r++;
    };
    addSitRow("Situación", a.situacion || "—");
    if (a.justificacionTipo) addSitRow("Tipo", a.justificacionTipo);
    if (a.justificacionMotivo) addSitRow("Motivo", a.justificacionMotivo);
    if (a.justificacionObservacion) addSitRow("Observación", a.justificacionObservacion);
  }
  ws.getRow(r).height = 6;
  r++;

  // ============================================================
  // 8) OBSERVACIONES
  // ============================================================
  if (a?.observaciones && a.observaciones.trim()) {
    sectionHeader("OBSERVACIONES");
    ws.mergeCells(`A${r}:F${r}`);
    const c = ws.getCell(`A${r}`);
    c.value = a.observaciones;
    c.font = { size: 9, color: { argb: "FF334155" } };
    c.alignment = { wrapText: true, vertical: "middle", indent: 1 };
    for (let col = 1; col <= 6; col++) {
      ws.getCell(r, col).border = BORDER_THIN;
    }
    ws.getRow(r).height = 32;
    r++;
  }

  // ============================================================
  // 9) FOOTER
  // ============================================================
  r += 1;
  ws.mergeCells(`A${r}:F${r}`);
  const foot = ws.getCell(`A${r}`);
  foot.value = `PractiQR • Sistema de Control de Asistencia • OLAMSA    •    Página 1 de 1    •    Generado: ${new Date().toLocaleString("es-ES")}`;
  foot.font = { size: 8, color: { argb: "FF94A3B8" } };
  foot.alignment = { horizontal: "center", vertical: "middle" };

  ws.pageSetup.printArea = `A1:F${r}`;
  ws.views = [{ state: "frozen", ySplit: 6 }];

  const buffer = await wb.xlsx.writeBuffer();
  return new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}

export async function descargarExcelDiario(reporte: ReporteDiarioResponse) {
  const blob = await generarExcelDiario(reporte);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const dni = reporte.practicante.documento || "sindni";
  const fecha = reporte.fecha;
  a.download = `ReporteDiario_${dni}_${fecha}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}