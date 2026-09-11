// types/puestos.ts - @deprecated Usar types/area.ts
// Mantenido solo para compatibilidad temporal. Nuevo código debe usar Area/NuevaArea desde './area'
export type Puesto = {
  idPuesto: number;
  nombrePuesto: string;
  area: string;
  descripcion?: string;
  activo: boolean;
  fechaCreacion?: string;
  // Alias canónicos opcionales para migración
  idArea?: number;
  nombreArea?: string;
};

export type NuevoPuesto = {
  nombrePuesto: string;
  area: string;
  descripcion?: string;
  activo: boolean;
  nombreArea?: string;
};