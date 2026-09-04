package com.asistencia.attendance_system.service;

import com.asistencia.attendance_system.model.entity.BloqueHorario;
import com.asistencia.attendance_system.model.enums.EstadoDia;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Única fuente de verdad para determinar EstadoDia.
 * No realiza consultas a BD; recibe datos ya resueltos (bloque, horas, justificación, fecha/hoy/ahora en America/Lima).
 * Mantiene reglas: SIN_MARCAR antes de horaFin, AUSENTE después, PRESENTE/TARDANZA por horaInicio, JUSTIFICADO por permiso, DESCANSO sin bloque laborable.
 * Legacy TARDE/FALTA no se generan; normalizado() los convierte al leer.
 */
@Component
public class CalculadoraEstadoAsistencia {

    /**
     * Estado cuando NO hay marcación de entrada (o solo salida sin entrada).
     * @param bloque bloque laborable del día (null si DESCANSO)
     * @param fecha fecha consultada
     * @param hoy fecha hoy en America/Lima
     * @param ahora hora actual en America/Lima
     * @param hasJustificacion justificación aprobada para ese día
     */
    public EstadoDia estadoSinEntrada(BloqueHorario bloque, LocalDate fecha, LocalDate hoy, LocalTime ahora, boolean hasJustificacion) {
        if (bloque == null) {
            return EstadoDia.DESCANSO;
        }
        if (hasJustificacion) {
            return EstadoDia.JUSTIFICADO;
        }
        if (fecha.isBefore(hoy)) {
            return EstadoDia.AUSENTE;
        }
        if (fecha.isEqual(hoy) && !ahora.isBefore(bloque.getHoraFin())) {
            return EstadoDia.AUSENTE; // >= horaFin individual
        }
        return EstadoDia.SIN_MARCAR;
    }

    /**
     * Estado cuando hay entradaReal.
     * @param entradaReal hora marcación entrada (no null)
     * @param entradaEsperada horaInicio del bloque
     */
    public EstadoDia estadoConEntrada(LocalTime entradaReal, LocalTime entradaEsperada) {
        if (entradaReal.isAfter(entradaEsperada)) {
            return EstadoDia.TARDANZA;
        }
        return EstadoDia.PRESENTE;
    }

    /**
     * Helper para decidir si jornada ya terminó para un bloque y fecha.
     */
    public boolean jornadaTerminada(BloqueHorario bloque, LocalDate fecha, LocalDate hoy, LocalTime ahora) {
        if (bloque == null) return false;
        if (fecha.isBefore(hoy)) return true;
        if (fecha.isAfter(hoy)) return false;
        return !ahora.isBefore(bloque.getHoraFin());
    }
}
