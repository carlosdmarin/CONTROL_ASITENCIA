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
}