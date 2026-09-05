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
    private String estadoDia; // SIN_MARCAR, PRESENTE, TARDANZA, AUSENTE, DESCANSO, JUSTIFICADO (canónicos)
    private BigDecimal horasTrabajadas;
    private Integer minutosTardanza;
    private LocalTime entradaEsperada;
    private LocalTime salidaEsperada;
    private LocalTime entradaReal;
    private LocalTime salidaReal;
    private String observaciones;
    // Justificación separada del estado
    private Boolean justificado;
    private String justificacionMotivo;
    private String justificacionObservacion;
    private String justificacionTipo;
    private String justificacionFecha;
    private String estadoVisual; // DEPRECADO: usar situacion. Se mantiene para compatibilidad
    private String situacion; // NINGUNA, TARDANZA_JUSTIFICADA, SALIDA_ANTICIPADA_JUSTIFICADA, INASISTENCIA_JUSTIFICADA (compat, primer valor)
    private java.util.Set<String> situaciones; // Múltiples situaciones
    private java.time.LocalTime horaSalidaAnticipadaAutorizada;
    private java.util.List<SituacionDetalleDTO> situacionesDetalle;
}