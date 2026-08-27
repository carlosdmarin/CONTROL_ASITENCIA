import { api, handleApiError } from './axios';
import { Cargo } from '@/types/practicante';  // ← CAMBIADO

export const cargosApi = {
  // ============================================
  // OBTENER TODOS LOS CARGOS
  // ============================================
  getAll: async (): Promise<Cargo[]> => {
    try {
      const response = await api.get('/cargos');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // ============================================
  // OBTENER CARGOS ACTIVOS
  // ============================================
  getActivos: async (): Promise<Cargo[]> => {
    try {
      const response = await api.get('/cargos/activos');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // ============================================
  // OBTENER CARGO POR ID
  // ============================================
  getById: async (id: number): Promise<Cargo> => {
    try {
      const response = await api.get(`/cargos/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};