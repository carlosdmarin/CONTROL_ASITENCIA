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
public class ReporteSemanalResponse {

    private PracticanteResponse practicante;

    private LocalDate semanaInicio; // lunes
    private LocalDate semanaFin; // sábado
    private String semanaLabel; // "Semana del lunes 14 al sábado 19 de septiembre de 2026"

    private ReporteSemanalResumenDTO resumen;

    private List<ReporteSemanalDetalleDTO> detalleDiario; // 6 elementos LUNES-SABADO

    private List<String> incidencias; // textos resumidos

    private LocalDateTime fechaGeneracion;
}
