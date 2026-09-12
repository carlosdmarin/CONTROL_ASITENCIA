package com.asistencia.attendance_system.controller;

import com.asistencia.attendance_system.model.dto.ReporteDiarioResponse;
import com.asistencia.attendance_system.service.ReportesService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reportes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReportesController {

    private final ReportesService reportesService;

    @GetMapping("/diario")
    public ResponseEntity<ReporteDiarioResponse> getReporteDiario(
            @RequestParam Long practicanteId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        ReporteDiarioResponse reporte = reportesService.generarDiario(practicanteId, fecha);
        return ResponseEntity.ok(reporte);
    }

    // Alias por practicante
    @GetMapping("/diario/practicante/{practicanteId}/fecha/{fecha}")
    public ResponseEntity<ReporteDiarioResponse> getReporteDiarioPorRuta(
            @PathVariable Long practicanteId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        return getReporteDiario(practicanteId, fecha);
    }
}
