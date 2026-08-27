import { api, handleApiError } from './axios';
import { Puesto, NuevoPuesto } from '@/types/puestos';

export const puestosApi = {
  // ============================================
  // OBTENER TODOS LOS PUESTOS
  // ============================================
  getAll: async (): Promise<Puesto[]> => {
    try {
      const response = await api.get('/puestos');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // ============================================
  // OBTENER PUESTOS ACTIVOS
  // ============================================
  getActivos: async (): Promise<Puesto[]> => {
    try {
      const response = await api.get('/puestos/activos');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // ============================================
  // OBTENER PUESTO POR ID
  // ============================================
  getById: async (id: number): Promise<Puesto> => {
    try {
      const response = await api.get(`/puestos/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // ============================================
  // CREAR NUEVO PUESTO
  // ============================================
  create: async (puesto: NuevoPuesto): Promise<Puesto> => {
    try {
      const response = await api.post('/puestos', puesto);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // ============================================
  // ACTUALIZAR PUESTO
  // ============================================
  update: async (id: number, puesto: Partial<Puesto>): Promise<Puesto> => {
    try {
      const response = await api.put(`/puestos/${id}`, puesto);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // ============================================
  // ELIMINAR PUESTO
  // ============================================
  eliminar: async (id: number): Promise<void> => {
    try {
      await api.delete(`/puestos/${id}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // ============================================
  // ACTIVAR PUESTO
  // ============================================
  activar: async (id: number): Promise<Puesto> => {
    try {
      const response = await api.patch(`/puestos/${id}/activar`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // ============================================
  // DESACTIVAR PUESTO
  // ============================================
  desactivar: async (id: number): Promise<Puesto> => {
    try {
      const response = await api.patch(`/puestos/${id}/desactivar`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};