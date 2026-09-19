// types/practicante.ts - Sincronizado con nueva BD (sin codigoTrabajador, Sede en lugar de Agencia)
import { Area } from './area';
export type { Area } from './area';

// ====== BLOQUE HORARIO ======
export type BloqueHorarioRequest = {
  diaSemana: string;   // "LUNES", "MARTES", etc.
  horaInicio: string;  // "07:00"
  horaFin: string;     // "17:00"
  activo: boolean;
};

export type BloqueHorarioResponse = {
  idBloque: number;
  idPracticante: number;
  diaSemana: string;
  horaInicio: string;
  horaFin: string;
  tipoBloque: string;
  activo: boolean;
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

// ====== CARGO ======
export type Cargo = {
  idCargo: number;
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

// ====== PRACTICANTE ======
export type Practicante = {
  idPracticante: number;
  nombreCompleto: string;
  documento: string;
  sede: string;
  area: string;
  // Canónico
  idArea?: number;
  nombreArea?: string;
  descripcionArea?: string;
  idSede?: number;
  idCargo?: number;
  idTipoInstituto?: number;
  tipoInstituto: string;
  cargo: string;
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
  areaObj?: Area;
  tipoInstitutoObj?: TipoInstituto;
  cargoObj?: Cargo;
  horario?: BloqueHorarioRequest[];
};

// ====== NUEVO PRACTICANTE ======
export type NuevoPracticante = {
  nombre: string;
  apellido: string;
  documento: string;
  idSede: number;
  idArea: number;
  idTipoInstituto: number;
  idCargo: number;
  correoElectronico?: string;
  telefono?: string;
  fechaInicioPracticas: string;
  fechaFinPracticas?: string;
  horario?: BloqueHorarioRequest[];  // ← NUEVO
};

// Tipo para actualización (usa IDs reales seleccionados, no hardcode)
export type ActualizarPracticante = {
  nombre: string;
  apellido: string;
  documento: string;
  idSede: number;
  idArea: number;
  idTipoInstituto: number;
  idCargo: number;
  correoElectronico?: string;
  telefono?: string;
  fechaInicioPracticas: string;
  fechaFinPracticas?: string;
  horario?: BloqueHorarioRequest[];
};