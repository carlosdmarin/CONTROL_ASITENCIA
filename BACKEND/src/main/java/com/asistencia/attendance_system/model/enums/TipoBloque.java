package com.asistencia.attendance_system.model.enums;

public enum TipoBloque {
    TRABAJO,
    CLASES,
    DESCANSO,
    ALMUERZO,
    OTRO;

    /**
     * Centraliza la regla de negocio: TRABAJO y CLASES son jornadas laborables que generan asistencia.
     * DESCANSO/ALMUERZO/OTRO no son laborables.
     */
    public boolean esLaborable() {
        return this == TRABAJO || this == CLASES;
    }
}
