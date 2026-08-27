package com.asistencia.attendance_system.model.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResumenMensualDTO {
    @JsonAlias({"agencia", "sede"})
    private String sede;
    private Integer mes;
    private Integer anio;
    private Long totalPracticantes;
    private Long totalPresentes;
    private Long totalTardanzas;
    private Long totalFaltas;
    private Long totalJustificados;
    private BigDecimal promedioHorasTrabajadas;
    private Double porcentajeAsistencia;

    // Compatibilidad
    public String getAgencia() { return sede; }
    public void setAgencia(String agencia) { this.sede = agencia; }
}