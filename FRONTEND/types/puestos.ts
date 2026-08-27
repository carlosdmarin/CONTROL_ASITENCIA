// types/puesto.ts
export type Puesto = {
  idPuesto: number;        // Long en Java → number en TypeScript
  nombrePuesto: string;
  area: string;
  descripcion?: string;
  activo: boolean;
  fechaCreacion?: string;  // LocalDateTime → string ISO
};

export type NuevoPuesto = {
  nombrePuesto: string;
  area: string;
  descripcion?: string;
  activo: boolean;
};