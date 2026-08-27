package com.asistencia.attendance_system.model.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum Agencia {
    // ✅ Los nombres del enum DEBEN coincidir con la base de datos
    OFICINA_PUCALLPA("OFICINA PUCALLPA"),
    PLANTA_NESHUYA("PLANTA NESHUYA"),
    PLANTA_CAMPOVERDE("PLANTA CAMPOVERDE");

    private final String value;

    Agencia(String value) {
        this.value = value;
    }

    // ✅ Para guardar en base de datos (con espacios)
    @Override
    public String toString() {
        return value;
    }

    // ✅ Para mostrar en el frontend (con espacios)
    public String getDisplayName() {
        return value;
    }

    // ✅ Para recibir desde el frontend
    @JsonCreator
    public static Agencia fromValue(String value) {
        if (value == null) return null;

        // Buscar por el valor con espacios
        for (Agencia agencia : Agencia.values()) {
            if (agencia.value.equalsIgnoreCase(value.trim())) {
                return agencia;
            }
        }

        // Si viene con guiones bajos, también funciona
        String cleaned = value.trim().replace(" ", "_").toUpperCase();
        try {
            return Agencia.valueOf(cleaned);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Valor de agencia no válido: " + value);
        }
    }
}