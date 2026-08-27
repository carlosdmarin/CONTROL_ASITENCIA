package com.asistencia.attendance_system.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BloqueHorarioRequest {

    @NotNull(message = "El ID del practicante es obligatorio")
    private Long idPracticante;

    @NotBlank(message = "El día de la semana es obligatorio")
    private String diaSemana; // LUNES, MARTES, MIERCOLES, JUEVES, VIERNES, SABADO, DOMINGO

    @NotNull(message = "La hora de inicio es obligatoria")
    private LocalTime horaInicio;

    @NotNull(message = "La hora de fin es obligatoria")
    private LocalTime horaFin;

    @NotBlank(message = "El tipo de bloque es obligatorio")
    private String tipoBloque; // TRABAJO, CLASES, DESCANSO, ALMUERZO, OTRO

    private String descripcion;

    @NotNull(message = "La fecha de inicio es obligatoria")
    private LocalDate fechaInicio;

    private LocalDate fechaFin;
}