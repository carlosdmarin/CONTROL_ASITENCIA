import { api, handleApiError } from './axios';

export const asistenciasApi = {
  marcar: async (documento: string, tipo: 'ENTRADA' | 'SALIDA' = 'ENTRADA'): Promise<any> => {
    try {
      const response = await api.post('/asistencias/marcar', {
        documento,
        tipoMarcacion: tipo,
        metodoRegistro: 'QR',
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  marcarEntrada: async (documento: string): Promise<any> => {
    try {
      const response = await api.post(`/asistencias/entrada/${documento}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  marcarSalida: async (documento: string): Promise<any> => {
    try {
      const response = await api.post(`/asistencias/salida/${documento}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
