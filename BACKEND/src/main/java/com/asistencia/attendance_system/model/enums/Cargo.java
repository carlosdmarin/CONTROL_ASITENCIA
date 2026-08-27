package com.asistencia.attendance_system.model.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum Cargo {
    PRACTICANTE_PROFESIONAL("PRACTICANTE PROFESIONAL"),
    PRACTICANTE_PRE_PROFESIONAL("PRACTICANTE PRE PROFESIONAL");

    private final String value;

    Cargo(String value) {
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
    public static Cargo fromValue(String value) {
        if (value == null) return null;
        for (Cargo cargo : Cargo.values()) {
            if (cargo.value.equalsIgnoreCase(value.trim())) {
                return cargo;
            }
        }
        String cleaned = value.trim().replace(" ", "_").toUpperCase();
        try {
            return Cargo.valueOf(cleaned);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Valor de cargo no válido: " + value);
        }
    }
}