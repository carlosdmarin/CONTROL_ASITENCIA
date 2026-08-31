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
}