package com.asistencia.attendance_system.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BloqueHorarioResponseDTO {
    private Long idBloque;
    private String diaSemana;
    private String horaInicio; // "08:00"
    private String horaFin;    // "17:00"
    private Boolean activo;
    private String tipoBloque; // "TRABAJO" o "DESCANSO"
}
