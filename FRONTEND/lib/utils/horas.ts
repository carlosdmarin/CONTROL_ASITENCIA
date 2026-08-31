/**
 * Utilidad centralizada para cálculo de horas trabajadas
 * Regla de negocio: Almuerzo 13:00-14:00 NO cuenta. Solo se descuenta el solapamiento real.
 */

export const ALMUERZO_INICIO_MIN = 13 * 60; // 780
export const ALMUERZO_FIN_MIN = 14 * 60; // 840
export const ALMUERZO_DURACION_MAX = 60;

/**
 * Calcula el solapamiento en minutos entre [inicio, fin) y [13:00, 14:00)
 */
export function calcularSolapamientoAlmuerzo(inicioMin: number, finMin: number): number {
  const solapamiento = Math.max(0, Math.min(finMin, ALMUERZO_FIN_MIN) - Math.max(inicioMin, ALMUERZO_INICIO_MIN));
  return Math.min(solapamiento, ALMUERZO_DURACION_MAX);
}

/**
 * Convierte "HH:MM" a minutos desde 00:00. Retorna NaN si es inválido.
 */
export function timeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return NaN;
  return h * 60 + m;
}

/**
 * Calcula minutos efectivamente trabajados entre entrada y salida,
 * descontando solo el solapamiento real con 13:00-14:00.
 * Retorna NaN si entrada >= salida o formato inválido.
 * Retorna 0 si el día no está activo (manejado por el llamador).
 */
export function calcularMinutosTrabajados(entrada: string, salida: string): number {
  const ini = timeToMinutes(entrada);
  const fin = timeToMinutes(salida);
  if (Number.isNaN(ini) || Number.isNaN(fin) || ini >= fin) return NaN;
  const duracionTotal = fin - ini;
  const solapamiento = calcularSolapamientoAlmuerzo(ini, fin);
  return duracionTotal - solapamiento;
}

/**
 * Formatea minutos a "X h" o "X h Y min"
 */
export function formatHorasMinutos(minutos: number): string {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}
