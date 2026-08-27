package com.asistencia.attendance_system.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JustificacionRequest {

    @NotNull(message = "El ID del practicante es obligatorio")
    private Long idPracticante;

    @NotNull(message = "La fecha de inicio es obligatoria")
    private LocalDate fechaInicio;

    @NotNull(message = "La fecha de fin es obligatoria")
    private LocalDate fechaFin;

    @NotBlank(message = "El tipo de justificación es obligatorio")
    private String tipoJustificacion; // MEDICO, PERSONAL, ACADEMICO, OTRO

    @NotBlank(message = "El motivo es obligatorio")
    private String motivo;

    private String archivoAdjunto; // Ruta del archivo (opcional)
    private String observaciones;
}