package com.asistencia.attendance_system.service;

import com.asistencia.attendance_system.model.dto.BloqueHorarioRequest;
import com.asistencia.attendance_system.model.dto.BloqueHorarioResponseDTO;
import java.time.LocalDate;
import java.util.List;

public interface HorarioService {

    /**
     * Obtiene todo el horario de un practicante
     */
    List<BloqueHorarioResponseDTO> obtenerHorarioPorPracticante(Long idPracticante);

    /**
     * Obtiene solo el horario activo de un practicante
     */
    List<BloqueHorarioResponseDTO> obtenerHorarioActivoPorPracticante(Long idPracticante);

    /**
     * Guarda el horario de un practicante (elimina el anterior y crea el nuevo)
     */
    void guardarHorario(Long idPracticante, List<BloqueHorarioRequest> horarioRequests);

    /**
     * Elimina todo el horario de un practicante
     */
    void eliminarHorario(Long idPracticante);

    /**
     * Verifica si un día es laborable (tiene bloque TRABAJO activo)
     * Si es descanso (sin bloque TRABAJO o solo DESCANSO), retorna false
     */
    boolean esDiaLaborable(Long idPracticante, LocalDate fecha);

    /**
     * Verifica si el practicante debe estar en empresa a esa hora
     */
    boolean debeEstarEnEmpresa(Long idPracticante, LocalDate fecha, String hora);

    /**
     * Obtiene el bloque TRABAJO del día (entrada/salida esperada). Vacío si es descanso.
     */
    java.util.Optional<com.asistencia.attendance_system.model.entity.BloqueHorario> obtenerBloqueDelDia(Long idPracticante, LocalDate fecha);

    /**
     * Obtiene horario esperado (entrada, salida) para fecha dada.
     */
    default java.util.Optional<java.time.LocalTime[]> obtenerHorarioDelDia(Long idPracticante, LocalDate fecha) {
        return obtenerBloqueDelDia(idPracticante, fecha)
                .map(b -> new java.time.LocalTime[]{b.getHoraInicio(), b.getHoraFin()});
    }
}