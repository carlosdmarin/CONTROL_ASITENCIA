package com.asistencia.attendance_system.model.dto;

public record VigilanteResponse(
        Integer id,
        String nombre,
        String apellido,
        String usuario,
        Boolean estado,
        Integer sedeId,
        String sedeNombre
) {}
