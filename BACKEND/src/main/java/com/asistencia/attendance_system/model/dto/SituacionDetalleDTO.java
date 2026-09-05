package com.asistencia.attendance_system.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SituacionDetalleDTO {
    private String tipo; // TARDANZA_JUSTIFICADA, SALIDA_ANTICIPADA_JUSTIFICADA, INASISTENCIA_JUSTIFICADA
    private String motivo;
    private String observacion;
    private LocalTime horaEntradaRegistrada;
    private LocalTime horaSalidaAnticipadaAutorizada;
    private LocalDateTime fechaRegistro;
}
