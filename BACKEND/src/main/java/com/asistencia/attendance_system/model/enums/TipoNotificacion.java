package com.asistencia.attendance_system.model.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum TipoNotificacion {
    TARDANZA("TARDANZA"),
    FALTA("FALTA"),
    HORAS_INCOMPLETAS("HORAS INCOMPLETAS"),
    CAMBIO_HORARIO("CAMBIO HORARIO"),
    RECORDATORIO("RECORDATORIO");

    private final String value;

    TipoNotificacion(String value) {
        this.value = value;
    }

    @Override
    public String toString() {
        return value;
    }

    public String getDisplayName() {
        return value;
    }

    @JsonCreator
    public static TipoNotificacion fromValue(String value) {
        if (value == null) return null;
        for (TipoNotificacion tipo : TipoNotificacion.values()) {
            if (tipo.value.equalsIgnoreCase(value.trim())) {
                return tipo;
            }
        }
        String cleaned = value.trim().replace(" ", "_").toUpperCase();
        try {
            return TipoNotificacion.valueOf(cleaned);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Valor de tipo notificación no válido: " + value);
        }
    }
}