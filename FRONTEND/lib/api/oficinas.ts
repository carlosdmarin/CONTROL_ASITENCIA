import { api, handleApiError } from './axios';
import { Oficina } from '@/types/practicante';

export const oficinasApi = {
  getAll: async (): Promise<Oficina[]> => {
    const response = await api.get('/oficinas');
    return response.data;
  },
  getActivas: async (): Promise<Oficina[]> => {
    const response = await api.get('/oficinas/activas');
    return response.data;
  },
  getById: async (id: number): Promise<Oficina> => {
    const response = await api.get(`/oficinas/${id}`);
    return response.data;
  },
};
