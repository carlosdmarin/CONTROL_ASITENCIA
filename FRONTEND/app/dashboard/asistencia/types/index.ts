export type AsistenciaDiaria = {
  id: number;
  practicante: string;
  area: string;
  entrada: string | null;
  salida: string | null;
  horas: string | null;
  estado: 'PRESENTE' | 'TARDANZA' | 'AUSENTE' | 'EN_JORNADA';
};

// DTO real del backend
export type AsistenciaDiariaResponse = {
  idAsistencia: number | null;
  idPracticante: number;
  nombreCompleto: string;
  fecha: string;
  estadoDia: string; // PRESENTE, TARDE, FALTA, DESCANSO, JUSTIFICADO
  horasTrabajadas: number;
  minutosTardanza: number;
  entradaReal: string | null;
  salidaReal: string | null;
  entradaEsperada: string | null;
  salidaEsperada: string | null;
};

export type ResumenAsistencia = {
  total: number;
  presentes: number;
  tardanzas: number;
  ausentes: number;
};