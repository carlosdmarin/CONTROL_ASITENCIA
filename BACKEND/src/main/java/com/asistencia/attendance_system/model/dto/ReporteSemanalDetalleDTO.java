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
public class ReporteSemanalDetalleDTO {
    private LocalDate fecha;
    private String diaSemana; // LUNES..SABADO
    private LocalTime horaInicio; // programada null si descanso
    private LocalTime horaFin;
    private Boolean esDescanso;
    private BigDecimal horasEsperadas; // programadas del día
    private AsistenciaDiariaResponse asistencia; // null si descanso? usamos virtual
    // shortcuts para tabla
    private String estado; // PRESENTE/TARDANZA/AUSENTE/DESCANSO/JUSTIFICADO/SIN_MARCAR
    private String situacion; // NINGUNA / TARDANZA_JUSTIFICADA etc
    private BigDecimal horasTrabajadas;
    private List<SituacionDetalleDTO> situacionesDetalle;
}
