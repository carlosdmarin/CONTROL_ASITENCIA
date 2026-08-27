import { api, handleApiError } from './axios';
import { Practicante, NuevoPracticante } from '@/types/practicante';

export const practicantesApi = {
  getAll: async (): Promise<Practicante[]> => {
    try {
      const response = await api.get('/practicantes');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
  getActivos: async (): Promise<Practicante[]> => {
    try {
      const response = await api.get('/practicantes/activos');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
  getById: async (id: number): Promise<Practicante> => {
    try {
      const response = await api.get(`/practicantes/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
  // Obtener por documento (nuevo, reemplaza codigo)
  getByDocumento: async (documento: string): Promise<Practicante> => {
    try {
      const response = await api.get(`/practicantes/documento/${documento}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
  // Compatibilidad: antiguo getByCodigo (ahora busca por documento)
  getByCodigo: async (codigo: string): Promise<Practicante> => {
    try {
      const response = await api.get(`/practicantes/documento/${codigo}`);
      return response.data;
    } catch {
      try {
        const response = await api.get(`/practicantes/codigo/${codigo}`);
        return response.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    }
  },
  buscar: async (termino: string): Promise<Practicante[]> => {
    try {
      const response = await api.get(`/practicantes/buscar?termino=${termino}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
  create: async (data: NuevoPracticante): Promise<Practicante> => {
    // Enviar tanto idSede como idAgencia para compatibilidad backend
    const payload: any = { ...data };
    if (payload.idSede && !payload.idAgencia) payload.idAgencia = payload.idSede;
    if (payload.idAgencia && !payload.idSede) payload.idSede = payload.idAgencia;
    // Remover codigoTrabajador si existe (backend ya no lo espera)
    delete payload.codigoTrabajador;
    try {
      const response = await api.post('/practicantes', payload);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
  update: async (id: number, data: Partial<NuevoPracticante>): Promise<Practicante> => {
    const payload: any = { ...data };
    if (payload.idSede && !payload.idAgencia) payload.idAgencia = payload.idSede;
    if (payload.idAgencia && !payload.idSede) payload.idSede = payload.idAgencia;
    delete payload.codigoTrabajador;
    try {
      const response = await api.put(`/practicantes/${id}`, payload);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
  activar: async (id: number): Promise<Practicante> => {
    try {
      const response = await api.patch(`/practicantes/${id}/activar`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
  desactivar: async (id: number): Promise<Practicante> => {
    try {
      const response = await api.patch(`/practicantes/${id}/desactivar`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
  eliminar: async (id: number): Promise<void> => {
    try {
      await api.delete(`/practicantes/${id}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
