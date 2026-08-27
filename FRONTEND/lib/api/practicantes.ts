import { api, handleApiError } from './axios';
import { Practicante, NuevoPracticante } from '@/types/practicante';

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
  // OBTENER PRACTICANTE POR CÓDIGO DE TRABAJADOR
  // ============================================
  getByCodigo: async (codigo: string): Promise<Practicante> => {
    try {
      const response = await api.get(`/practicantes/codigo/${codigo}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // ============================================
  // BUSCAR PRACTICANTES POR NOMBRE O DOCUMENTO
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
  // CREAR NUEVO PRACTICANTE
  // ============================================
  create: async (data: NuevoPracticante): Promise<Practicante> => {
    try {
      const response = await api.post('/practicantes', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // ============================================
  // ACTUALIZAR PRACTICANTE
  // ============================================
  update: async (id: number, data: Partial<NuevoPracticante>): Promise<Practicante> => {
    try {
      const response = await api.put(`/practicantes/${id}`, data);
      return response.data;
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
  // ELIMINAR PRACTICANTE
  // ============================================
  eliminar: async (id: number): Promise<void> => {
    try {
      await api.delete(`/practicantes/${id}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};