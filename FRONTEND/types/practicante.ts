// types/practicante.ts - Sincronizado con nueva BD (sin codigoTrabajador, Sede en lugar de Agencia, Area eliminado → Oficina)

// ====== BLOQUE HORARIO ======
export type BloqueHorarioRequest = {
  diaSemana: string;   // "LUNES", "MARTES", etc.
  horaInicio: string;  // "07:00"
  horaFin: string;     // "17:00"
  activo: boolean;
  descuentaAlmuerzo?: boolean; // true = NORMAL (defecto), false = CORRIDO
};

export type BloqueHorarioResponse = {
  idBloque: number;
  idPracticante: number;
  diaSemana: string;
  horaInicio: string;
  horaFin: string;
  tipoBloque: string;
  activo: boolean;
  descuentaAlmuerzo?: boolean; // true = NORMAL, false = CORRIDO
  fechaInicio: string;
  fechaFin?: string;
};

// ====== SEDE ======
export type Sede = {
  idSede: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  fechaCreacion?: string;
};

// Alias compatibilidad: código antiguo usa Agencia
export type Agencia = Sede;

// ====== TIPO PRACTICANTE ======
export type TipoPracticante = {
  idTipoPracticante: number;
  nombre: string;
  descripcion?: string;
  horasSemanales?: number;
  activo: boolean;
  fechaCreacion?: string;
};

// ====== TIPO INSTITUTO ======
export type TipoInstituto = {
  idTipoInstituto: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  fechaCreacion?: string;
};

// ====== OFICINA (catálogo corporativo) ======
export type Oficina = {
  idOficina: number;
  oficina: string;
  estado: number;
  idSede?: number | null;
  idOficinaSup?: number | null;
};

// ====== PRACTICANTE ======
export type Practicante = {
  idPracticante: number;
  nombreCompleto: string;
  documento: string;
  sede: string;
  oficina: string;
  idOficina: number;
  nombreOficina: string;
  idSede?: number;
  idTipoPracticante?: number;
  idTipoInstituto?: number;
  tipoInstituto: string;
  tipoPracticante: string;
  situacion: string;
  horasSemanalesRequeridas: number;
  correoElectronico?: string;
  telefono?: string;
  fechaInicioPracticas: string;
  fechaFinPracticas?: string;
  fechaDesactivacion?: string | null;
  usuario?: string;
  fechaRegistro?: string;
  fechaActualizacion?: string | null;
  // Relaciones completas
  sedeObj?: Sede;
  oficinaObj?: Oficina;
  tipoInstitutoObj?: TipoInstituto;
  tipoPracticanteObj?: TipoPracticante;
  horario?: BloqueHorarioRequest[];
};

// ====== NUEVO PRACTICANTE ======
export type NuevoPracticante = {
  nombre: string;
  apellido: string;
  documento: string;
  idSede: number;
  idOficina: number;
  idTipoInstituto: number;
  idTipoPracticante: number;
  correoElectronico?: string;
  telefono?: string;
  fechaInicioPracticas: string;
  fechaFinPracticas?: string;
  horario?: BloqueHorarioRequest[];
};

// Tipo para actualización (usa IDs reales seleccionados, no hardcode)
export type ActualizarPracticante = {
  nombre: string;
  apellido: string;
  documento: string;
  idSede: number;
  idOficina: number;
  idTipoInstituto: number;
  idTipoPracticante: number;
  correoElectronico?: string;
  telefono?: string;
  fechaInicioPracticas: string;
  fechaFinPracticas?: string;
  horario?: BloqueHorarioRequest[];
};