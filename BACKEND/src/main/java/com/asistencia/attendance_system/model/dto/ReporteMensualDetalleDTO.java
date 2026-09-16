package com.asistencia.attendance_system.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReporteMensualDetalleDTO {
    private LocalDate fecha;
    private String diaSemana; // LUNES..DOMINGO
    private LocalTime horaInicio; // null si descanso
    private LocalTime horaFin;
    private Boolean esDescanso;
    private BigDecimal horasEsperadas;
    private AsistenciaDiariaResponse asistencia;
    private String estado; // PRESENTE/TARDANZA/AUSENTE/DESCANSO/JUSTIFICADO/SIN_MARCAR
    private String situacion;
    private BigDecimal horasTrabajadas;
    private List<SituacionDetalleDTO> situacionesDetalle;
}
