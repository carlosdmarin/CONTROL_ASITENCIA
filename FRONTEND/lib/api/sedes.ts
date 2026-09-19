import { api, handleApiError } from './axios';
import { Sede } from '@/types/practicante';

// API para Sedes (antes Agencias) - mantiene compatibilidad con /agencias
export const agenciasApi = {
  getAll: async (): Promise<Sede[]> => {
    const response = await api.get('/sedes');
    return response.data;
  },
  getActivas: async (): Promise<Sede[]> => {
    const response = await api.get('/sedes');
    return (response.data as Sede[]).filter((s) => s.activo);
  },
  getById: async (id: number): Promise<Sede> => {
    const response = await api.get(`/sedes/${id}`);
    return response.data;
  },
};

// Alias para nuevo código que use sedeApi
export const sedeApi = agenciasApi;
export const sedesApi = agenciasApi;
