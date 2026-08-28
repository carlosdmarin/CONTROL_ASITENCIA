import { api, handleApiError } from './axios';
import { Practicante, NuevoPracticante, BloqueHorarioRequest, BloqueHorarioResponse } from '@/types/practicante';

export const practicantesApi = {
  // ============================================
  // OBTENER TODOS LOS PRACTICANTES
  // ============================================
  getAll: async (): Promise<Practicante[]> => {
    try {
      const response = await api.get('/practicantes');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // ============================================
  // OBTENER PRACTICANTES ACTIVOS
  // ============================================
  getActivos: async (): Promise<Practicante[]> => {
    try {
      const response = await api.get('/practicantes/activos');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // ============================================
  // OBTENER PRACTICANTE POR ID
  // ============================================
  getById: async (id: number): Promise<Practicante> => {
    try {
      const response = await api.get(`/practicantes/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // ============================================
  // OBTENER POR DOCUMENTO
  // ============================================
  getByDocumento: async (documento: string): Promise<Practicante> => {
    try {
      const response = await api.get(`/practicantes/documento/${documento}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // ============================================
  // OBTENER POR CÓDIGO (compatibilidad)
  // ============================================
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

  // ============================================
  // BUSCAR PRACTICANTES POR NOMBRE
  // ============================================
  buscar: async (termino: string): Promise<Practicante[]> => {
    try {
      const response = await api.get(`/practicantes/buscar?termino=${termino}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // ============================================
  // CREAR PRACTICANTE (CON HORARIO)
  // ============================================
  create: async (data: NuevoPracticante): Promise<Practicante> => {
    const payload: any = { ...data };
    // Compatibilidad con backend
    if (payload.idSede && !payload.idAgencia) payload.idAgencia = payload.idSede;
    if (payload.idAgencia && !payload.idSede) payload.idSede = payload.idAgencia;
    delete payload.codigoTrabajador;
    try {
      const response = await api.post('/practicantes', payload);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // ============================================
  // ACTUALIZAR PRACTICANTE
  // ============================================
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

  // ============================================
  // ELIMINAR PRACTICANTE
  // ============================================
  eliminar: async (id: number): Promise<void> => {
    try {
      await api.delete(`/practicantes/${id}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // ============================================
  // ACTIVAR PRACTICANTE
  // ============================================
  activar: async (id: number): Promise<Practicante> => {
    try {
      const response = await api.patch(`/practicantes/${id}/activar`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // ============================================
  // DESACTIVAR PRACTICANTE
  // ============================================
  desactivar: async (id: number): Promise<Practicante> => {
    try {
      const response = await api.patch(`/practicantes/${id}/desactivar`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // ============================================
  // OBTENER HORARIO DE UN PRACTICANTE
  // ============================================
  getHorario: async (idPracticante: number): Promise<BloqueHorarioResponse[]> => {
    try {
      const response = await api.get(`/horarios/practicante/${idPracticante}`);
      return response.data;
    } catch (error) {
      // Fallback al endpoint antiguo
      try {
        const response = await api.get(`/practicantes/${idPracticante}/horario`);
        return response.data;
      } catch (err) {
        throw new Error(handleApiError(err));
      }
    }
  },

  // ============================================
  // ACTUALIZAR HORARIO DE UN PRACTICANTE
  // ============================================
  updateHorario: async (idPracticante: number, horario: BloqueHorarioRequest[]): Promise<void> => {
    try {
      await api.put(`/horarios/practicante/${idPracticante}`, horario);
    } catch (error) {
      try {
        await api.put(`/practicantes/${idPracticante}/horario`, horario);
      } catch (err) {
        throw new Error(handleApiError(err));
      }
    }
  },

  // Guardar horario (POST, para creación)
  guardarHorario: async (idPracticante: number, horario: BloqueHorarioRequest[]): Promise<void> => {
    try {
      await api.post(`/horarios/practicante/${idPracticante}`, horario);
    } catch (error) {
      try {
        await api.put(`/horarios/practicante/${idPracticante}`, horario);
      } catch (err) {
        throw new Error(handleApiError(err));
      }
    }
  },
};