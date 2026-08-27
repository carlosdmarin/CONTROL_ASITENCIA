// types/practicante.ts - Sincronizado con nueva BD (sin codigoTrabajador, Sede en lugar de Agencia)
import { Puesto } from './puestos';
export type { Puesto } from './puestos';

export type Sede = {
  idSede: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  fechaCreacion?: string;
};

// Alias compatibilidad: código antiguo usa Agencia
export type Agencia = Sede;

export type Cargo = {
  idCargo: number;
  nombre: string;
  descripcion?: string;
  horasSemanales?: number;
  activo: boolean;
  fechaCreacion?: string;
};

export type TipoInstituto = {
  idTipoInstituto: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  fechaCreacion?: string;
};

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
};

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
  // Alias para compatibilidad si frontend antiguo envía idAgencia/codigoTrabajador
  idAgencia?: number;
  codigoTrabajador?: string;
};
