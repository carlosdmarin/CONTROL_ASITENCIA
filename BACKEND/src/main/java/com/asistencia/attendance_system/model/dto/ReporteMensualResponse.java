package com.asistencia.attendance_system.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReporteMensualResponse {
    private PracticanteResponse practicante;

    private LocalDate mesInicio; // primer día del mes
    private LocalDate mesFin; // último día del mes
    private String mesLabel; // "Septiembre 2026"
    private Integer anio;
    private Integer mes; // 1-12

    private ReporteMensualResumenDTO resumen;

    private List<ReporteMensualDetalleDTO> detalleDiario; // 28-31 elementos

    private List<String> incidencias;

    private LocalDateTime fechaGeneracion;
}
