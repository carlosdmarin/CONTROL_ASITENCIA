package com.asistencia.attendance_system.service;

import com.asistencia.attendance_system.model.dto.BloqueHorarioRequest;
import com.asistencia.attendance_system.model.dto.BloqueHorarioResponse;
import com.asistencia.attendance_system.model.dto.HorarioSemanalDTO;
import com.asistencia.attendance_system.model.enums.TipoBloque;

import java.time.LocalDate;
import java.util.List;

public interface HorarioService {

    // ========== CRUD DE BLOQUES ==========

    BloqueHorarioResponse crearBloque(BloqueHorarioRequest request);

    BloqueHorarioResponse actualizarBloque(Long id, BloqueHorarioRequest request);

    void eliminarBloque(Long id);

    BloqueHorarioResponse obtenerBloquePorId(Long id);

    List<BloqueHorarioResponse> obtenerBloquesPorPracticante(Long idPracticante);

    List<BloqueHorarioResponse> obtenerBloquesActivosPorPracticante(Long idPracticante);

    // ========== HORARIO SEMANAL ==========

    HorarioSemanalDTO obtenerHorarioSemanal(Long idPracticante);

    List<BloqueHorarioResponse> obtenerBloquesPorDia(Long idPracticante, String diaSemana);

    // ========== VALIDACIONES ==========

    boolean esDiaLaborable(Long idPracticante, LocalDate fecha);

    boolean debeEstarEnEmpresa(Long idPracticante, LocalDate fecha, String hora);

    String obtenerEstadoDia(Long idPracticante, LocalDate fecha);

    // ========== COPIA DE HORARIO ==========

    void copiarHorarioSemana(Long idPracticante, LocalDate fechaInicio, LocalDate fechaFin);
}