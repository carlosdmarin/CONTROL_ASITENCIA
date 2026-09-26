import { api, handleApiError } from './axios';

export type VigilanteResponse = {
  id: number;
  nombre: string;
  apellido: string;
  usuario: string;
  estado: boolean;
  sedeId: number | null;
  sedeNombre: string | null;
};

export const vigilantesApi = {
  getAll: async (): Promise<VigilanteResponse[]> => {
    try {
      const response = await api.get('/vigilantes');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  create: async (data: { nombre: string; apellido: string; usuario: string; contrasena: string; sedeId: number }): Promise<VigilanteResponse> => {
    try {
      const response = await api.post('/vigilantes', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
