import { api, handleApiError } from "./axios";
import { ReporteDiarioResponse } from "@/types/reporte";

export const reportesApi = {
  getReporteDiario: async (practicanteId: number, fecha: string): Promise<ReporteDiarioResponse> => {
    try {
      const res = await api.get("/reportes/diario", { params: { practicanteId, fecha } });
      return res.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
