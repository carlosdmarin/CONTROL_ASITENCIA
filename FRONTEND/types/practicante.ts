// types/practicante.ts
import { Puesto } from './puestos';
export type { Puesto } from './puestos';

export type Agencia = {
  idAgencia: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  fechaCreacion?: string;
};

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
  codigoTrabajador: string;
  nombreCompleto: string;
  documento: string;
  agencia: string;
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
  // Para relaciones completas
  agenciaObj?: Agencia;
  puestoObj?: Puesto;
  tipoInstitutoObj?: TipoInstituto;
  cargoObj?: Cargo;
};

export type NuevoPracticante = {
  codigoTrabajador: string;
  nombre: string;
  apellido: string;
  documento: string;
  idAgencia: number;
  idPuesto: number;
  idTipoInstituto: number;
  idCargo: number;
  correoElectronico?: string;
  telefono?: string;
  fechaInicioPracticas: string;
  fechaFinPracticas?: string;
};