package com.asistencia.attendance_system.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReporteDiarioResponse {

    // Practicante
    private PracticanteResponse practicante;

    // Fecha reporte
    private LocalDate fecha;
    private String diaSemana; // LUNES, MARTES...

    // Horario programado
    private LocalTime horaInicio;
    private LocalTime horaFin;
    private Boolean esDescanso;
    private BigDecimal horasEsperadas; // ya descontando almuerzo 13-14

    // Asistencia
    private AsistenciaDiariaResponse asistencia;

    // Derivados
    private BigDecimal horasExtra; // max(0, trabajadas - esperadas)

    // Metadatos generación
    private LocalDateTime fechaGeneracion;
}
