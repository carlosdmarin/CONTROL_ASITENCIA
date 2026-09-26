/**
 * Centralización de fechas y horas para módulo Reportes
 * Zona horaria del sistema: America/Lima
 * Mantiene compatibilidad con contratos backend (yyyy-MM-dd, HH:mm)
 *
 * NOTA CONTRATOS PENDIENTES (no confirmados con backend):
 * - Endpoint semanal /reportes/semanal?fecha=yyyy-MM-dd acepta cualquier día de la semana
 *   (se conserva envío sin normalizar a lunes; documentado).
 * - Endpoint mensual /reportes/mensual?fecha=yyyy-MM-dd: se normaliza a día 1 del mes para consistencia.
 * - Horas trabajadas recibidas del backend ya incluyen cálculo de negocio; no se descuenta almuerzo aquí.
 */

import { startOfWeek, endOfWeek } from "date-fns";
import { es } from "date-fns/locale";

const ZONA = "America/Lima";

/**
 * Formatea Date a yyyy-MM-dd en America/Lima
 * Evita desfase cuando navegador está en otra TZ (usa Intl)
 */
export function formatFechaISO(date: Date): string {
  // en-CA produce yyyy-MM-dd directamente
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/**
 * Parsea yyyy-MM-dd a Date a medianoche local (sin TZ shift)
 * Usa T00:00:00 para evitar UTC parse de new Date("yyyy-MM-dd")
 */
export function parseFechaISO(fechaStr: string): Date {
  return new Date(fechaStr + "T00:00:00");
}

/**
 * Fecha larga para mostrar al usuario: "5 de septiembre de 2026" en es-ES / America/Lima
 */
export function formatFechaLarga(fechaStr: string): string {
  try {
    const d = parseFechaISO(fechaStr);
    return d.toLocaleDateString("es-ES", {
      timeZone: ZONA,
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return fechaStr;
  }
}

export function formatFechaLargaFromDate(date: Date): string {
  return date.toLocaleDateString("es-ES", {
    timeZone: ZONA,
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatFechaCorta(fechaStr: string): string {
  try {
    const d = parseFechaISO(fechaStr);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `${dd}/${mm}/${d.getFullYear()}`;
  } catch {
    return fechaStr;
  }
}

export function formatMesLabel(date: Date): string {
  const s = date.toLocaleString("es-ES", { timeZone: ZONA, month: "long", year: "numeric" });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function formatFechaGeneracion(fechaStr?: string | null): string {
  const d = fechaStr ? new Date(fechaStr) : new Date();
  // fechaGeneracion del backend ya viene en America/Lima; se formatea en misma zona
  return d.toLocaleString("es-ES", {
    timeZone: ZONA,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Rango de semana lunes-domingo para reporte semanal
 * Centraliza getWeekRange / getWeekLabel previamente duplicados
 */
export function getWeekRange(date: Date): { monday: Date; sunday: Date; label: string } {
  const monday = startOfWeek(date, { weekStartsOn: 1, locale: es });
  const sunday = endOfWeek(date, { weekStartsOn: 1, locale: es });
  monday.setHours(0, 0, 0, 0);
  sunday.setHours(0, 0, 0, 0);
  const label = `${monday.getDate()} al ${sunday.getDate()} de ${sunday.toLocaleString("es-ES", { timeZone: ZONA, month: "long" })} de ${sunday.getFullYear()}`;
  return { monday, sunday, label: label.charAt(0).toUpperCase() + label.slice(1) };
}

/**
 * Formateo de horas consistente entre preview HTML / PDF / Excel
 * Mantiene "—" para nulos y HH:mm recortado a 5 chars
 */
export function formatHora(hora?: string | null): string {
  if (!hora) return "—";
  return hora.substring(0, 5);
}

export function formatHoras(num?: number | null): string {
  if (num == null) return "—";
  const h = Math.floor(num);
  const m = Math.round((num - h) * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
