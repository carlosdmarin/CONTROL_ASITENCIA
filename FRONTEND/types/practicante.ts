// types/practicante.ts - Sincronizado con nueva BD (sin codigoTrabajador, Sede en lugar de Agencia)
import { Puesto } from './puestos';
export type { Puesto } from './puestos';

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
  puesto: string;
  area: string;
  tipoInstituto: string;
  cargo: string;
  situacion: string;
  horasSemanalesRequeridas: number;
  correoElectronico?: string;
  telefono?: string;
  fechaInicioPracticas: string;
  fechaFinPracticas?: string;
  // Compatibilidad: backend aún puede devolver agencia/codigoTrabajador
  agencia?: string;
  codigoTrabajador?: string;
  // Relaciones completas
  sedeObj?: Sede;
  agenciaObj?: Sede;
  puestoObj?: Puesto;
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
  idPuesto: number;
  idTipoInstituto: number;
  idCargo: number;
  correoElectronico?: string;
  telefono?: string;
  fechaInicioPracticas: string;
  fechaFinPracticas?: string;
  horario?: BloqueHorarioRequest[];  // ← NUEVO
  // Alias para compatibilidad
  idAgencia?: number;
  codigoTrabajador?: string;
};