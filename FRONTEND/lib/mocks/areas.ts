import { Area } from '@/types/area';

export const MOCK_AREAS: Area[] = [
  {
    idArea: 1,
    nombreArea: 'Logística y servicios',
    descripcion: 'Gestión de insumos y despachos',
    activo: true,
  },
  {
    idArea: 2,
    nombreArea: 'Mantenimiento',
    descripcion: 'Control de maquinaria y equipos',
    activo: true,
  },
  {
    idArea: 3,
    nombreArea: 'Recursos Humanos',
    descripcion: 'Control administrativo y financiero',
    activo: true,
  },
  {
    idArea: 4,
    nombreArea: 'Tecnología de la Información',
    descripcion: 'Soporte y desarrollo de sistemas',
    activo: true,
  },
  {
    idArea: 5,
    nombreArea: 'Operaciones',
    descripcion: 'Operación de línea de producción Neshuya',
    activo: true,
  },
  {
    idArea: 6,
    nombreArea: 'Calidad',
    descripcion: 'Muestreo y control de parámetros físico-químicos',
    activo: true,
  },
];

// Compat legacy export
export const MOCK_PUESTOS = MOCK_AREAS;
