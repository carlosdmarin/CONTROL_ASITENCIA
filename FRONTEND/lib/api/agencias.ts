import { api, handleApiError } from './axios';
import { Sede } from '@/types/practicante';

// API para Sedes (antes Agencias) - mantiene compatibilidad con /agencias
export const agenciasApi = {
  getAll: async (): Promise<Sede[]> => {
    try {
      const response = await api.get('/sedes');
      return response.data;
    } catch {
      // Fallback a endpoint antiguo si backend aún no migrado
      try {
        const response = await api.get('/agencias');
        return response.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    }
  },
  getActivas: async (): Promise<Sede[]> => {
    try {
      const response = await api.get('/sedes/activas');
      return response.data;
    } catch {
      try {
        const response = await api.get('/agencias/activas');
        return response.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    }
  },
  getById: async (id: number): Promise<Sede> => {
    try {
      const response = await api.get(`/sedes/${id}`);
      return response.data;
    } catch {
      try {
        const response = await api.get(`/agencias/${id}`);
        return response.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    }
  },
};

// Alias para nuevo código que use sedeApi
export const sedeApi = agenciasApi;
export const sedesApi = agenciasApi;
