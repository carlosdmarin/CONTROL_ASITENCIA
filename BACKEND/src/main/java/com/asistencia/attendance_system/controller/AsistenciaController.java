package com.asistencia.attendance_system.controller;

import com.asistencia.attendance_system.model.dto.AsistenciaDiariaResponse;
import com.asistencia.attendance_system.model.dto.MarcacionRequest;
import com.asistencia.attendance_system.model.dto.MarcacionResponse;
import com.asistencia.attendance_system.model.dto.ResumenAsistenciaDTO;
import com.asistencia.attendance_system.model.enums.Agencia;
import com.asistencia.attendance_system.service.AsistenciaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/asistencias")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class AsistenciaController {

    private final AsistenciaService asistenciaService;

    // ========== MARCACIONES ==========

    @PostMapping("/marcar")
    public ResponseEntity<MarcacionResponse> registrarMarcacion(@Valid @RequestBody MarcacionRequest request) {
        MarcacionResponse response = asistenciaService.registrarMarcacion(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/entrada/{codigoTrabajador}")
    public ResponseEntity<MarcacionResponse> registrarEntrada(@PathVariable String codigoTrabajador) {
        MarcacionResponse response = asistenciaService.registrarEntrada(codigoTrabajador);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/salida/{codigoTrabajador}")
    public ResponseEntity<MarcacionResponse> registrarSalida(@PathVariable String codigoTrabajador) {
        MarcacionResponse response = asistenciaService.registrarSalida(codigoTrabajador);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // ========== CONSULTA DE MARCACIONES ==========

    @GetMapping("/marcaciones/practicante/{idPracticante}")
    public ResponseEntity<List<MarcacionResponse>> obtenerMarcacionesPorPracticante(@PathVariable Long idPracticante) {
        List<MarcacionResponse> responses = asistenciaService.obtenerMarcacionesPorPracticante(idPracticante);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/marcaciones/fecha")
    public ResponseEntity<List<MarcacionResponse>> obtenerMarcacionesPorFecha(@RequestParam String fecha) {
        LocalDate fechaLocal = LocalDate.parse(fecha);
        List<MarcacionResponse> responses = asistenciaService.obtenerMarcacionesPorFecha(fechaLocal);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/marcaciones/practicante/{idPracticante}/fecha/{fecha}")
    public ResponseEntity<List<MarcacionResponse>> obtenerMarcacionesPorPracticanteYFecha(
            @PathVariable Long idPracticante,
            @PathVariable String fecha) {
        LocalDate fechaLocal = LocalDate.parse(fecha);
        List<MarcacionResponse> responses = asistenciaService.obtenerMarcacionesPorPracticanteYFecha(idPracticante, fechaLocal);
        return ResponseEntity.ok(responses);
    }

    // ========== ASISTENCIA DIARIA ==========

    @GetMapping("/diaria/practicante/{idPracticante}/fecha/{fecha}")
    public ResponseEntity<AsistenciaDiariaResponse> obtenerAsistenciaDiaria(
            @PathVariable Long idPracticante,
            @PathVariable String fecha) {
        LocalDate fechaLocal = LocalDate.parse(fecha);
        AsistenciaDiariaResponse response = asistenciaService.obtenerAsistenciaDiaria(idPracticante, fechaLocal);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/diaria/practicante/{idPracticante}")
    public ResponseEntity<List<AsistenciaDiariaResponse>> obtenerAsistenciasPorPracticante(@PathVariable Long idPracticante) {
        List<AsistenciaDiariaResponse> responses = asistenciaService.obtenerAsistenciasPorPracticante(idPracticante);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/diaria/practicante/{idPracticante}/mes")
    public ResponseEntity<List<AsistenciaDiariaResponse>> obtenerAsistenciasPorPracticanteYMes(
            @PathVariable Long idPracticante,
            @RequestParam Integer mes,
            @RequestParam Integer anio) {
        List<AsistenciaDiariaResponse> responses = asistenciaService.obtenerAsistenciasPorPracticanteYMes(idPracticante, mes, anio);
        return ResponseEntity.ok(responses);
    }

    // ========== VALIDACIONES ==========

    @GetMapping("/validar/entrada-hoy/{idPracticante}")
    public ResponseEntity<Boolean> yaMarcoEntradaHoy(@PathVariable Long idPracticante) {
        boolean resultado = asistenciaService.yaMarcoEntradaHoy(idPracticante);
        return ResponseEntity.ok(resultado);
    }

    @GetMapping("/validar/salida-hoy/{idPracticante}")
    public ResponseEntity<Boolean> yaMarcoSalidaHoy(@PathVariable Long idPracticante) {
        boolean resultado = asistenciaService.yaMarcoSalidaHoy(idPracticante);
        return ResponseEntity.ok(resultado);
    }

    // ========== REPORTES ==========

    @GetMapping("/reporte/semanal/practicante/{idPracticante}")
    public ResponseEntity<ResumenAsistenciaDTO> obtenerResumenSemanal(
            @PathVariable Long idPracticante,
            @RequestParam String fechaInicio) {
        LocalDate fecha = LocalDate.parse(fechaInicio);
        ResumenAsistenciaDTO resumen = asistenciaService.obtenerResumenSemanal(idPracticante, fecha);
        return ResponseEntity.ok(resumen);
    }

    @GetMapping("/reporte/semanal/agencia/{agencia}")
    public ResponseEntity<List<ResumenAsistenciaDTO>> obtenerResumenSemanalPorAgencia(
            @PathVariable String agencia,
            @RequestParam String fechaInicio) {
        LocalDate fecha = LocalDate.parse(fechaInicio);
        Agencia agenciaEnum = Agencia.valueOf(agencia.toUpperCase());
        List<ResumenAsistenciaDTO> resumenes = asistenciaService.obtenerResumenSemanalPorAgencia(agenciaEnum, fecha);
        return ResponseEntity.ok(resumenes);
    }

    // ========== PROCESAMIENTO ==========

    @PostMapping("/procesar/diaria/{idPracticante}")
    public ResponseEntity<Void> procesarAsistenciaDiaria(
            @PathVariable Long idPracticante,
            @RequestParam String fecha) {
        LocalDate fechaLocal = LocalDate.parse(fecha);
        asistenciaService.procesarAsistenciaDiaria(idPracticante, fechaLocal);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/procesar/pendientes")
    public ResponseEntity<Void> procesarAsistenciasPendientes(@RequestParam String fecha) {
        LocalDate fechaLocal = LocalDate.parse(fecha);
        asistenciaService.procesarAsistenciasPendientes(fechaLocal);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/procesar/jornada-semanal/{idPracticante}")
    public ResponseEntity<Void> generarJornadaSemanal(
            @PathVariable Long idPracticante,
            @RequestParam String fechaInicio) {
        LocalDate fecha = LocalDate.parse(fechaInicio);
        asistenciaService.generarJornadaSemanal(idPracticante, fecha);
        return ResponseEntity.ok().build();
    }
}