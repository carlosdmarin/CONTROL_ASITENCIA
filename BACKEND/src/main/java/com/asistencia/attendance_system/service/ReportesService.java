package com.asistencia.attendance_system.service;

import com.asistencia.attendance_system.model.dto.ReporteDiarioResponse;

import java.time.LocalDate;

public interface ReportesService {

    ReporteDiarioResponse generarDiario(Long practicanteId, LocalDate fecha);
}
