export type AsistenciaDiaria = {
  id: number;
  practicante: string;
  entrada: string | null;
  salida: string | null;
  horas: string | null;
  estado: 'SIN_MARCAR' | 'PRESENTE' | 'TARDE' | 'TARDANZA' | 'FALTA' | 'AUSENTE' | 'DESCANSO' | 'JUSTIFICADO';
};

// DTO real del backend - espejo de AsistenciaDiariaResponse.java
export type AsistenciaDiariaResponse = {
  idAsistencia: number | null;
  idPracticante: number;
  nombreCompleto: string;
  fecha: string;
  estadoDia: 'SIN_MARCAR' | 'PRESENTE' | 'TARDANZA' | 'TARDE' | 'AUSENTE' | 'FALTA' | 'DESCANSO' | 'JUSTIFICADO';
  horasTrabajadas: number;
  minutosTardanza: number;
  entradaReal: string | null;
  salidaReal: string | null;
  entradaEsperada: string | null;
  salidaEsperada: string | null;
  observaciones?: string | null;
  justificado?: boolean | null;
  justificacionMotivo?: string | null;
  justificacionObservacion?: string | null;
  justificacionTipo?: string | null;
  justificacionFecha?: string | null;
  estadoVisual?: string | null; // PRESENTE, TARDANZA, TARDANZA_JUSTIFICADA, AUSENTE, INASISTENCIA_JUSTIFICADA, SIN_MARCAR, DESCANSO, JUSTIFICADO
};

// Espejo de ResumenAsistenciaDTO.java (semanal por practicante, usado por getResumenDiario actualmente descartado)
export type ResumenAsistenciaDTO = {
  idPracticante: number;
  nombreCompleto: string;
  documento: string;
  sede: string;
  cargo: string;
  horasSemanalesRequeridas: number;
  horasCumplidas: number;
  horasPendientes: number;
  diasPresente: number;
  diasTarde: number;
  diasFalta: number;
  diasJustificado: number;
  porcentajeCumplimiento: number;
  estadoSemanal: string;
  // alias compatibilidad con backend
  agencia?: string;
  codigoTrabajador?: string;
};

export type ResumenAsistencia = {
  total: number;
  presentes: number;
  tardanzas: number;
  ausentes: number;
  descansos: number; // ← NUEVO
};

// Normalización centralizada: legacy TARDE→TARDANZA, FALTA→AUSENTE. Usar en todo el frontend.
export function normalizeEstadoDia(estado: string): string {
  if (estado === "TARDE") return "TARDANZA";
  if (estado === "FALTA") return "AUSENTE";
  return estado;
}
export function isTardanza(estado: string): boolean {
  return normalizeEstadoDia(estado) === "TARDANZA";
}
export function isAusente(estado: string): boolean {
  return normalizeEstadoDia(estado) === "AUSENTE";
}