package com.asistencia.attendance_system.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResumenMensualDTO {
    private String agencia;
    private Integer mes;
    private Integer anio;
    private Long totalPracticantes;
    private Long totalPresentes;
    private Long totalTardanzas;
    private Long totalFaltas;
    private Long totalJustificados;
    private BigDecimal promedioHorasTrabajadas;
    private Double porcentajeAsistencia;
}