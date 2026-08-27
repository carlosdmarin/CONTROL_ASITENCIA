package com.asistencia.attendance_system.service;

import com.asistencia.attendance_system.model.dto.PracticanteRequest;
import com.asistencia.attendance_system.model.dto.PracticanteResponse;
import com.asistencia.attendance_system.model.enums.Situacion;

import java.util.List;

public interface PracticanteService {

    // ========== CRUD BÁSICO ==========

    PracticanteResponse crear(PracticanteRequest request);

    PracticanteResponse actualizar(Long id, PracticanteRequest request);

    void eliminar(Long id);

    PracticanteResponse obtenerPorId(Long id);

    PracticanteResponse obtenerPorCodigo(String codigo);

    PracticanteResponse obtenerPorDocumento(String documento);

    List<PracticanteResponse> obtenerTodos();

    List<PracticanteResponse> obtenerActivos();

    // ========== BÚSQUEDAS ==========

    List<PracticanteResponse> buscarPorNombre(String termino);

    // ========== ESTADÍSTICAS ==========

    Long contarActivos();

    Long contarPorSede(Long idSede);

    // Compatibilidad temporal: antiguo endpoint /contar/agencia
    default Long contarPorAgencia(Long idAgencia) {
        return contarPorSede(idAgencia);
    }

    // ========== CAMBIOS DE ESTADO ==========

    void cambiarSituacion(Long id, Situacion nuevaSituacion);

    PracticanteResponse activar(Long id);

    PracticanteResponse desactivar(Long id);
}