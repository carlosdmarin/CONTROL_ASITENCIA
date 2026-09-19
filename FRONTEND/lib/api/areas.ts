import { api, handleApiError } from './axios';
import { Area, NuevaArea, ActualizarArea } from '@/types/area';

export const areasApi = {
  getAll: async (): Promise<Area[]> => {
    const response = await api.get('/areas');
    return (response.data as Area[]).map(mapLegacyToArea);
  },

  getActivos: async (): Promise<Area[]> => {
    const response = await api.get('/areas/activos');
    return (response.data as Area[]).map(mapLegacyToArea);
  },

  getById: async (id: number): Promise<Area> => {
    const response = await api.get(`/areas/${id}`);
    return mapLegacyToArea(response.data);
  },

  create: async (area: NuevaArea): Promise<Area> => {
    try {
      const response = await api.post('/areas', area);
      return mapLegacyToArea(response.data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  update: async (id: number, area: ActualizarArea): Promise<Area> => {
    try {
      const response = await api.put(`/areas/${id}`, area);
      return mapLegacyToArea(response.data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  eliminar: async (id: number): Promise<void> => {
    await api.delete(`/areas/${id}`);
  },

  activar: async (id: number): Promise<Area> => {
    const response = await api.patch(`/areas/${id}/activar`);
    return mapLegacyToArea(response.data);
  },

  desactivar: async (id: number): Promise<Area> => {
    const response = await api.patch(`/areas/${id}/desactivar`);
    return mapLegacyToArea(response.data);
  },
};

// Adapter for legacy Puesto shape -> Area
function mapLegacyToArea(raw: any): Area {
  if (!raw) return raw;
  // If already Area shape
  if (raw.idArea !== undefined && raw.nombreArea !== undefined) return raw as Area;
  // Legacy Puesto shape
  return {
    idArea: raw.idArea ?? raw.idPuesto ?? raw.id_area ?? 0,
    nombreArea: raw.nombreArea ?? raw.nombrePuesto ?? raw.nombre_area ?? '',
    descripcion: raw.descripcion ?? raw.area ?? undefined,
    activo: raw.activo ?? true,
    fechaCreacion: raw.fechaCreacion ?? raw.fecha_creacion,
  };
}

// Compat alias: puestosApi deprecated
export const puestosApiCompat = areasApi;
