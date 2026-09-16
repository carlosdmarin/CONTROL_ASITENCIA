package com.asistencia.attendance_system.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReporteSemanalResumenDTO {
    private Integer diasProgramados;
    private Integer diasTrabajados;
    private Integer diasPresentes;
    private Integer tardanzas;
    private Integer ausencias;
    private Integer justificaciones;
    private Integer descansos;
    private BigDecimal horasProgramadas;
    private BigDecimal horasTrabajadas;
    private BigDecimal horasFaltantes; // max(0, programadas - trabajadas)
    private BigDecimal horasAdicionales; // max(0, trabajadas - programadas)
    private BigDecimal porcentajeCumplimiento; // (trabajadas/programadas*100) 0 si programadas=0
    private String estadoBalance; // FALTANTES | ADICIONALES | CUMPLIDA
}
