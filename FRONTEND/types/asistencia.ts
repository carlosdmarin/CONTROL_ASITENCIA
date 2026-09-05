export type AsistenciaDiaria = {
  id: number;
  practicante: string;
  entrada: string | null;
  salida: string | null;
  horas: string | null;
  estado: 'SIN_MARCAR' | 'PRESENTE' | 'TARDE' | 'TARDANZA' | 'FALTA' | 'AUSENTE' | 'DESCANSO' | 'JUSTIFICADO';
  situacion?: string | null;
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
  estadoVisual?: string | null; // DEPRECADO: usar situacion
  situacion?: string | null; // NINGUNA, TARDANZA_JUSTIFICADA, SALIDA_ANTICIPADA_JUSTIFICADA, INASISTENCIA_JUSTIFICADA
  situaciones?: string[] | null; // Múltiples situaciones
  situacionesDetalle?: any[] | null;
  horaSalidaAnticipadaAutorizada?: string | null;
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
  if (estado === "JUSTIFICADO") return "AUSENTE"; // legacy JUSTIFICADO → AUSENTE para columna Estado
  return estado;
}
export function isTardanza(estado: string): boolean {
  return normalizeEstadoDia(estado) === "TARDANZA";
}
export function isAusente(estado: string): boolean {
  return normalizeEstadoDia(estado) === "AUSENTE";
}
export function getSituacionLabel(situacion?: string | null): string {
  if (!situacion || situacion === "NINGUNA") return "Ninguna";
  if (situacion === "TARDANZA_JUSTIFICADA") return "Tardanza justificada";
  if (situacion === "SALIDA_ANTICIPADA_JUSTIFICADA") return "Salida anticipada justificada";
  if (situacion === "INASISTENCIA_JUSTIFICADA") return "Inasistencia justificada";
  return situacion;
}