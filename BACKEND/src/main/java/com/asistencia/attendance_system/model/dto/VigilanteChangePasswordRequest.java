package com.asistencia.attendance_system.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VigilanteChangePasswordRequest {

    @NotBlank(message = "La nueva contraseña es obligatoria")
    private String nuevaContrasena;

    @NotBlank(message = "La confirmación es obligatoria")
    private String confirmarContrasena;
}
