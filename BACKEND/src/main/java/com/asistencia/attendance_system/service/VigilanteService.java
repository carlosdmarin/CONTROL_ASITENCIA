package com.asistencia.attendance_system.service;

import com.asistencia.attendance_system.model.dto.VigilanteCreateRequest;
import com.asistencia.attendance_system.model.dto.VigilanteResponse;

import java.util.List;

public interface VigilanteService {

    List<VigilanteResponse> listar();

    VigilanteResponse crear(VigilanteCreateRequest request);
}
