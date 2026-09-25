package com.asistencia.attendance_system.controller;

import com.asistencia.attendance_system.model.dto.ReporteDiarioResponse;
import com.asistencia.attendance_system.model.dto.ReporteMensualResponse;
import com.asistencia.attendance_system.model.dto.ReporteSemanalResponse;
import com.asistencia.attendance_system.service.ReportesService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reportes")
@RequiredArgsConstructor
public class ReportesController {

    private final ReportesService reportesService;

    @GetMapping("/diario")
    @PreAuthorize("hasRole('RRHH') or (hasRole('PRACTICANTE') and #practicanteId.toString() == authentication.name)")
    public ResponseEntity<ReporteDiarioResponse> getReporteDiario(
            @RequestParam Long practicanteId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        ReporteDiarioResponse reporte = reportesService.generarDiario(practicanteId, fecha);
        return ResponseEntity.ok(reporte);
    }

    // Alias por practicante
    @GetMapping("/diario/practicante/{practicanteId}/fecha/{fecha}")
    @PreAuthorize("hasRole('RRHH') or (hasRole('PRACTICANTE') and #practicanteId.toString() == authentication.name)")
    public ResponseEntity<ReporteDiarioResponse> getReporteDiarioPorRuta(
            @PathVariable Long practicanteId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        return getReporteDiario(practicanteId, fecha);
    }

    @GetMapping("/semanal")
    @PreAuthorize("hasRole('RRHH') or (hasRole('PRACTICANTE') and #practicanteId.toString() == authentication.name)")
    public ResponseEntity<ReporteSemanalResponse> getReporteSemanal(
            @RequestParam Long practicanteId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        ReporteSemanalResponse reporte = reportesService.generarSemanal(practicanteId, fecha);
        return ResponseEntity.ok(reporte);
    }

    @GetMapping("/semanal/practicante/{practicanteId}/semana/{fecha}")
    @PreAuthorize("hasRole('RRHH') or (hasRole('PRACTICANTE') and #practicanteId.toString() == authentication.name)")
    public ResponseEntity<ReporteSemanalResponse> getReporteSemanalPorRuta(
            @PathVariable Long practicanteId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        return getReporteSemanal(practicanteId, fecha);
    }

    @GetMapping("/mensual")
    @PreAuthorize("hasRole('RRHH') or (hasRole('PRACTICANTE') and #practicanteId.toString() == authentication.name)")
    public ResponseEntity<ReporteMensualResponse> getReporteMensual(
            @RequestParam Long practicanteId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        ReporteMensualResponse reporte = reportesService.generarMensual(practicanteId, fecha);
        return ResponseEntity.ok(reporte);
    }

    @GetMapping("/mensual/practicante/{practicanteId}/mes/{fecha}")
    @PreAuthorize("hasRole('RRHH') or (hasRole('PRACTICANTE') and #practicanteId.toString() == authentication.name)")
    public ResponseEntity<ReporteMensualResponse> getReporteMensualPorRuta(
            @PathVariable Long practicanteId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        return getReporteMensual(practicanteId, fecha);
    }
}
