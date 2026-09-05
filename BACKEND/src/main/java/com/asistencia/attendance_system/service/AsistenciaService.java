package com.asistencia.attendance_system.service;

import com.asistencia.attendance_system.model.dto.AsistenciaDiariaResponse;
import com.asistencia.attendance_system.model.dto.MarcacionRequest;
import com.asistencia.attendance_system.model.dto.MarcacionResponse;
import com.asistencia.attendance_system.model.dto.ResumenAsistenciaDTO;
import com.asistencia.attendance_system.model.entity.Sede;
import com.asistencia.attendance_system.model.enums.Agencia;

import java.time.LocalDate;
import java.util.List;

public interface AsistenciaService {

    // ========== MARCACIONES ==========

    MarcacionResponse registrarMarcacion(MarcacionRequest request);

    MarcacionResponse registrarEntrada(String documento);

    MarcacionResponse registrarSalida(String documento);

    // Alias compatibilidad
    default MarcacionResponse registrarEntradaPorCodigo(String codigoTrabajador) {
        return registrarEntrada(codigoTrabajador);
    }
    default MarcacionResponse registrarSalidaPorCodigo(String codigoTrabajador) {
        return registrarSalida(codigoTrabajador);
    }

    // ========== CONSULTA DE MARCACIONES ==========

    List<MarcacionResponse> obtenerMarcacionesPorPracticante(Long idPracticante);

    List<MarcacionResponse> obtenerMarcacionesPorFecha(LocalDate fecha);

    List<MarcacionResponse> obtenerMarcacionesPorPracticanteYFecha(Long idPracticante, LocalDate fecha);

    // ========== ASISTENCIA DIARIA ==========

    AsistenciaDiariaResponse obtenerAsistenciaDiaria(Long idPracticante, LocalDate fecha);

    List<AsistenciaDiariaResponse> obtenerAsistenciasPorPracticante(Long idPracticante);

    List<AsistenciaDiariaResponse> obtenerAsistenciasPorPracticanteYMes(Long idPracticante, Integer mes, Integer anio);

    List<AsistenciaDiariaResponse> obtenerAsistenciasDelDia(LocalDate fecha);

    // Resumen diario para stats (total, presentes, tardanzas, ausentes)
    ResumenAsistenciaDTO obtenerResumenDiario(LocalDate fecha);

    // ========== VALIDACIONES ==========

    boolean yaMarcoEntradaHoy(Long idPracticante);

    boolean yaMarcoSalidaHoy(Long idPracticante);

    // ========== REPORTES ==========

    ResumenAsistenciaDTO obtenerResumenSemanal(Long idPracticante, LocalDate fechaInicio);

    List<ResumenAsistenciaDTO> obtenerResumenSemanalPorSede(Sede sede, LocalDate fechaInicio);

    // Compatibilidad temporal: antiguo endpoint por Agencia enum
    default List<ResumenAsistenciaDTO> obtenerResumenSemanalPorAgencia(Agencia agencia, LocalDate fechaInicio) {
        return List.of();
    }

    // ========== PROCESAMIENTO AUTOMÁTICO ==========

    void procesarAsistenciaDiaria(Long idPracticante, LocalDate fecha);

    void procesarAsistenciasPendientes(LocalDate fecha);

    void generarJornadaSemanal(Long idPracticante, LocalDate fechaInicio);

    // ========== NUEVO: REGLAS RH ==========
    // Justificar tardanza/ausencia (no altera hora real)
    default com.asistencia.attendance_system.model.dto.AsistenciaDiariaResponse justificarAsistencia(Long idAsistencia, String motivo, String observacion, String tipo) {
        return justificarAsistencia(idAsistencia, motivo, observacion, tipo, null);
    }
    com.asistencia.attendance_system.model.dto.AsistenciaDiariaResponse justificarAsistencia(Long idAsistencia, String motivo, String observacion, String tipo, String horaSalidaAnticipada);

    // Permiso previo (fecha futura)
    com.asistencia.attendance_system.model.entity.Justificacion registrarPermiso(Long idPracticante, LocalDate fecha, String motivo, String observacion, String tipoJustificacion);

    // Corrección manual de entrada/salida por RH (recalcula estado)
    com.asistencia.attendance_system.model.dto.AsistenciaDiariaResponse corregirAsistenciaManual(Long idPracticante, LocalDate fecha, String horaEntrada, String horaSalida, String observaciones);

    // Historial reciente de marcaciones
    List<com.asistencia.attendance_system.model.dto.MarcacionResponse> obtenerMarcacionesRecientes(int limite);

    // Cierre diario: convierte SIN_MARCAR -> AUSENTE al finalizar jornada (excluye descansos y justificados)
    int cerrarJornadaDelDia(LocalDate fecha);
}