import { api, handleApiError } from './axios';
import { Agencia } from '@/types/practicante';  // ← CAMBIADO

export const agenciasApi = {
  // ============================================
  // OBTENER TODAS LAS AGENCIAS
  // ============================================
  getAll: async (): Promise<Agencia[]> => {
    try {
      const response = await api.get('/agencias');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // ============================================
  // OBTENER AGENCIAS ACTIVAS
  // ============================================
  getActivas: async (): Promise<Agencia[]> => {
    try {
      const response = await api.get('/agencias/activas');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // ============================================
  // OBTENER AGENCIA POR ID
  // ============================================
  getById: async (id: number): Promise<Agencia> => {
    try {
      const response = await api.get(`/agencias/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};