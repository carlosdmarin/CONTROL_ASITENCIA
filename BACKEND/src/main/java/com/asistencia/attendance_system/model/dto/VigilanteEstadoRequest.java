package com.asistencia.attendance_system.model.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class VigilanteEstadoRequest {

    @NotNull(message = "El estado es obligatorio")
    private Boolean estado;
}
