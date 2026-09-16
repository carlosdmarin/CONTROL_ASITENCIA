package com.asistencia.attendance_system.service;

import com.asistencia.attendance_system.model.dto.ReporteDiarioResponse;
import com.asistencia.attendance_system.model.dto.ReporteMensualResponse;
import com.asistencia.attendance_system.model.dto.ReporteSemanalResponse;

import java.time.LocalDate;

public interface ReportesService {

    ReporteDiarioResponse generarDiario(Long practicanteId, LocalDate fecha);

    ReporteSemanalResponse generarSemanal(Long practicanteId, LocalDate fechaReferencia);

    ReporteMensualResponse generarMensual(Long practicanteId, LocalDate fechaReferencia);
}
