// lib/api/asistencias.ts
import { api, handleApiError } from './axios';

export const asistenciasApi = {
  getAsistenciasDelDia: async (fecha: string): Promise<any[]> => {
    try {
      const response = await api.get(`/asistencias/diaria?fecha=${fecha}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getResumenDiario: async (fecha: string): Promise<any> => {
    try {
      const response = await api.get(`/asistencias/resumen/diario?fecha=${fecha}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  marcar: async (qrData: string, tipo: 'ENTRADA' | 'SALIDA' = 'ENTRADA'): Promise<any> => {
    try {
      // Extraer el documento del contenido del QR (puede ser JSON, URL o texto plano)
      let documento = qrData.trim();
      try {
        const obj = JSON.parse(qrData);
        documento = obj.documento || obj.dni || obj.codigo || obj.documentoPracticante || qrData;
      } catch {
        try {
          const url = new URL(qrData);
          documento = url.searchParams.get("documento") || url.searchParams.get("dni") || url.searchParams.get("codigo") || qrData;
        } catch {
          // texto plano, usar tal cual
        }
      }

      const response = await api.post('/asistencias/marcar', {
        documento: documento.toString().trim(),
        tipoMarcacion: tipo,
        metodoRegistro: 'QR',
      });
      return response.data;
    } catch (error) {
      const mensaje = handleApiError(error);
      throw new Error(mensaje);
    }
  },

  marcarEntrada: async (qrData: string): Promise<any> => {
    try {
      let documento = qrData.trim();
      try {
        const obj = JSON.parse(qrData);
        documento = obj.documento || obj.dni || obj.codigo || qrData;
      } catch {}
      const response = await api.post(`/asistencias/entrada/${encodeURIComponent(documento.toString().trim())}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  marcarSalida: async (qrData: string): Promise<any> => {
    try {
      let documento = qrData.trim();
      try {
        const obj = JSON.parse(qrData);
        documento = obj.documento || obj.dni || obj.codigo || qrData;
      } catch {}
      const response = await api.post(`/asistencias/salida/${encodeURIComponent(documento.toString().trim())}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};