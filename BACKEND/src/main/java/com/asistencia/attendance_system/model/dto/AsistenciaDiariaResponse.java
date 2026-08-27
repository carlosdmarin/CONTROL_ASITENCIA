package com.asistencia.attendance_system.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AsistenciaDiariaResponse {
    private Long idAsistencia;
    private Long idPracticante;
    private String nombreCompleto;
    private LocalDate fecha;
    private String estadoDia; // PRESENTE, TARDE, FALTA, CLASES, DESCANSO, JUSTIFICADO, MIXTO
    private BigDecimal horasTrabajadas;
    private Integer minutosTardanza;
    private LocalTime entradaEsperada;
    private LocalTime salidaEsperada;
    private LocalTime entradaReal;
    private LocalTime salidaReal;
    private String observaciones;
}