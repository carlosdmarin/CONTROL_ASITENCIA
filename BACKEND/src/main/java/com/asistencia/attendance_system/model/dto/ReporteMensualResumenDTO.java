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
public class ReporteMensualResumenDTO {
    private Integer diasProgramados;
    private Integer diasTrabajados;
    private Integer diasPresentes;
    private Integer tardanzas;
    private Integer ausencias;
    private Integer justificaciones;
    private Integer descansos;
    private BigDecimal horasProgramadas;
    private BigDecimal horasTrabajadas;
    private BigDecimal horasFaltantes;
    private BigDecimal horasAdicionales;
    private BigDecimal porcentajeCumplimiento;
    private String estadoBalance; // FALTANTES | ADICIONALES | CUMPLIDA
}
