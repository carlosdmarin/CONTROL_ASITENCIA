package com.asistencia.attendance_system.model.dto;

import lombok.Data;

@Data
public class BloqueHorarioRequest {
    private String diaSemana;    // "LUNES", "MARTES", etc.
    private String horaInicio;   // "08:00"
    private String horaFin;      // "17:00"
    private Boolean activo;      // true = trabaja, false = descanso
    private Boolean descuentaAlmuerzo; // true = NORMAL, false = CORRIDO; null = NORMAL
}