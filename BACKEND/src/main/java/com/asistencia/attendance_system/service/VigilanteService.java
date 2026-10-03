package com.asistencia.attendance_system.service;

import com.asistencia.attendance_system.model.dto.VigilanteChangePasswordRequest;
import com.asistencia.attendance_system.model.dto.VigilanteCreateRequest;
import com.asistencia.attendance_system.model.dto.VigilanteEstadoRequest;
import com.asistencia.attendance_system.model.dto.VigilanteResponse;

import java.util.List;

public interface VigilanteService {

    List<VigilanteResponse> listar();

    VigilanteResponse crear(VigilanteCreateRequest request);

    void cambiarContrasena(Integer id, VigilanteChangePasswordRequest request);

    VigilanteResponse cambiarEstado(Integer id, VigilanteEstadoRequest request);

    /**
     * Sede asignada al vigilante. Retorna null si no existe o no tiene sede.
     * Se usa para acotar consultas por sede sin aceptar sede del cliente.
     */
    Integer obtenerIdSede(Integer idVigilante);
}
