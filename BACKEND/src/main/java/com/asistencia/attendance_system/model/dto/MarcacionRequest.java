package com.asistencia.attendance_system.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MarcacionRequest {

    @NotBlank(message = "El código del trabajador es obligatorio")
    private String codigoTrabajador;

    @NotBlank(message = "El tipo de marcación es obligatorio")
    private String tipoMarcacion; // ENTRADA, SALIDA

    private String metodoRegistro; // QR, MANUAL, ADMIN (opcional, por defecto QR)

    private String codigoQr; // Código QR escaneado (opcional)

    private Double latitud; // Ubicación del marcador (opcional)
    private Double longitud;

    private String observaciones;
}