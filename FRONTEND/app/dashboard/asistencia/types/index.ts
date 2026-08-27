export type AsistenciaDiaria = {
  id: number;
  practicante: string;
  area: string;
  entrada: string | null;
  salida: string | null;
  horas: string | null;
  estado: 'PRESENTE' | 'TARDANZA' | 'AUSENTE' | 'EN_JORNADA';
};

export type ResumenAsistencia = {
  total: number;
  presentes: number;
  tardanzas: number;
  ausentes: number;
};