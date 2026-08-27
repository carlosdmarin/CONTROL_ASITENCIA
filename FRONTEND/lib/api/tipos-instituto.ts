import { api, handleApiError } from './axios';
import { TipoInstituto } from '@/types/practicante';  // ← CAMBIADO

export const tiposInstitutoApi = {
  // ============================================
  // OBTENER TODOS LOS TIPOS DE INSTITUTO
  // ============================================
  getAll: async (): Promise<TipoInstituto[]> => {
    try {
      const response = await api.get('/tipos-instituto');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // ============================================
  // OBTENER TIPOS DE INSTITUTO ACTIVOS
  // ============================================
  getActivos: async (): Promise<TipoInstituto[]> => {
    try {
      const response = await api.get('/tipos-instituto/activos');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // ============================================
  // OBTENER TIPO DE INSTITUTO POR ID
  // ============================================
  getById: async (id: number): Promise<TipoInstituto> => {
    try {
      const response = await api.get(`/tipos-instituto/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};