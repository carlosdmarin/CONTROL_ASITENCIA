package com.asistencia.attendance_system.model.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MarcacionRequest {

    @NotBlank(message = "El documento es obligatorio")
    @JsonAlias({"codigoTrabajador", "codigo_trabajador"})
    private String documento;

    // Compatibilidad
    public String getCodigoTrabajador() { return documento; }
    public void setCodigoTrabajador(String codigoTrabajador) { this.documento = codigoTrabajador; }

    @NotBlank(message = "El tipo de marcación es obligatorio")
    private String tipoMarcacion; // ENTRADA, SALIDA

    private String metodoRegistro; // QR, MANUAL, ADMIN (opcional, por defecto QR)

    private String codigoQr; // Código QR escaneado (opcional)

    private Double latitud; // Ubicación del marcador (opcional)
    private Double longitud;

    private String observaciones;
}