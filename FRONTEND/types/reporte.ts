import { Practicante } from "./practicante";
import { AsistenciaDiariaResponse } from "./asistencia";

export type ReporteDiarioResponse = {
  practicante: Practicante;
  fecha: string; // yyyy-MM-dd
  diaSemana: string; // LUNES...
  horaInicio: string | null; // HH:mm
  horaFin: string | null;
  esDescanso: boolean;
  horasEsperadas: number;
  asistencia: AsistenciaDiariaResponse;
  horasExtra: number;
  fechaGeneracion: string;
};
