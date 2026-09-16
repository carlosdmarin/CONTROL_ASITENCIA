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

export type ReporteSemanalDetalleDTO = {
  fecha: string; // yyyy-MM-dd
  diaSemana: string; // LUNES..SABADO
  horaInicio: string | null;
  horaFin: string | null;
  esDescanso: boolean;
  horasEsperadas: number;
  asistencia: AsistenciaDiariaResponse;
  estado: string;
  situacion: string | null;
  horasTrabajadas: number;
  situacionesDetalle?: any[] | null;
};

export type ReporteSemanalResumenDTO = {
  diasProgramados: number;
  diasTrabajados: number;
  diasPresentes: number;
  tardanzas: number;
  ausencias: number;
  justificaciones: number;
  descansos: number;
  horasProgramadas: number;
  horasTrabajadas: number;
  horasFaltantes: number;
  horasAdicionales: number;
  porcentajeCumplimiento: number;
  estadoBalance: string; // FALTANTES | ADICIONALES | CUMPLIDA
};

export type ReporteSemanalResponse = {
  practicante: Practicante;
  semanaInicio: string; // yyyy-MM-dd lunes
  semanaFin: string; // yyyy-MM-dd sabado
  semanaLabel: string;
  resumen: ReporteSemanalResumenDTO;
  detalleDiario: ReporteSemanalDetalleDTO[];
  incidencias: string[];
  fechaGeneracion: string;
};
