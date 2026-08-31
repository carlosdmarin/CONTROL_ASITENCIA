export type AsistenciaDiaria = {
  id: number;
  practicante: string;
  entrada: string | null;
  salida: string | null;
  horas: string | null;
  estado: 'PRESENTE' | 'TARDE' | 'TARDANZA' | 'FALTA' | 'AUSENTE' | 'CLASES' | 'DESCANSO' | 'JUSTIFICADO' | 'MIXTO' | 'EN_JORNADA';
};

// DTO real del backend - espejo de AsistenciaDiariaResponse.java
export type AsistenciaDiariaResponse = {
  idAsistencia: number | null;
  idPracticante: number;
  nombreCompleto: string;
  fecha: string;
  estadoDia: 'PRESENTE' | 'TARDE' | 'FALTA' | 'CLASES' | 'DESCANSO' | 'JUSTIFICADO' | 'MIXTO';
  horasTrabajadas: number;
  minutosTardanza: number;
  entradaReal: string | null;
  salidaReal: string | null;
  entradaEsperada: string | null;
  salidaEsperada: string | null;
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