import { api, handleApiError } from "./axios";
import { ReporteDiarioResponse, ReporteSemanalResponse, ReporteMensualResponse } from "@/types/reporte";

export const reportesApi = {
  getReporteDiario: async (practicanteId: number, fecha: string): Promise<ReporteDiarioResponse> => {
    try {
      const res = await api.get("/reportes/diario", { params: { practicanteId, fecha } });
      return res.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
  getReporteSemanal: async (practicanteId: number, fecha: string): Promise<ReporteSemanalResponse> => {
    try {
      const res = await api.get("/reportes/semanal", { params: { practicanteId, fecha } });
      return res.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
  getReporteMensual: async (practicanteId: number, fecha: string): Promise<ReporteMensualResponse> => {
    try {
      const res = await api.get("/reportes/mensual", { params: { practicanteId, fecha } });
      return res.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
