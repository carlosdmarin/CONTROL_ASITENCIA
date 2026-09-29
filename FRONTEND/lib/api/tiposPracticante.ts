import { api, handleApiError } from './axios';
import { TipoPracticante } from '@/types/practicante';

export const tiposPracticanteApi = {
  // ============================================
  // OBTENER TODOS LOS TIPOS DE PRACTICANTE
  // ============================================
  getAll: async (): Promise<TipoPracticante[]> => {
    try {
      const response = await api.get('/tipos-practicante');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
