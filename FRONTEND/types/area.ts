// types/area.ts - Modelo canónico Area
export type Area = {
  idArea: number;
  nombreArea: string;
  descripcion?: string;
  activo: boolean;
  fechaCreacion?: string;
  cantidadPracticantes?: number;
};

export type NuevaArea = {
  nombreArea: string;
  descripcion?: string;
  activo: boolean;
};

export type ActualizarArea = Partial<NuevaArea>;

// Compat alias para migración gradual: Puesto es Area
export type PuestoCompat = Area;
