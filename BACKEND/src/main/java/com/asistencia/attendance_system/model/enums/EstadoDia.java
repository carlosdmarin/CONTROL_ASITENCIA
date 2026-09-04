package com.asistencia.attendance_system.model.enums;

public enum EstadoDia {
    SIN_MARCAR,
    PRESENTE,
    TARDANZA,
    AUSENTE,
    DESCANSO,
    JUSTIFICADO,
    // LEGACY - solo para lectura de históricos ya migrados a TARDANZA/AUSENTE. No generar nuevos.
    @Deprecated
    TARDE,
    @Deprecated
    FALTA;

    /**
     * Normaliza estados legacy TARDE->TARDANZA, FALTA->AUSENTE
     */
    public EstadoDia normalizado() {
        if (this == TARDE) return TARDANZA;
        if (this == FALTA) return AUSENTE;
        return this;
    }

    public boolean esTardanza() {
        return this == TARDANZA || this == TARDE;
    }

    public boolean esAusente() {
        return this == AUSENTE || this == FALTA;
    }

    public String nombreCorto() {
        return normalizado().name();
    }
}