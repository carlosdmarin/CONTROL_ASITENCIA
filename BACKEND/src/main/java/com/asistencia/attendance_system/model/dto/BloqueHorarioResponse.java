package com.asistencia.attendance_system.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BloqueHorarioResponse {
    private Long idBloque;
    private Long idPracticante;
    private String practicanteNombre;
    private String diaSemana;
    private LocalTime horaInicio;
    private LocalTime horaFin;
    private String tipoBloque;
    private String descripcion;
    private Boolean activo;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
}