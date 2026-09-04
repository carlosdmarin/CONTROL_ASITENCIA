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
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/asistencias", "/asistencias"})
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AsistenciaController {

    private final AsistenciaService asistenciaService;

    // ========== MARCACIONES ==========

    @PostMapping("/marcar")
    public ResponseEntity<?> registrarMarcacion(@Valid @RequestBody MarcacionRequest request) {
        try {
            MarcacionResponse response = asistenciaService.registrarMarcacion(request);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            errorResponse.put("error", true);
            String mensaje = e.getMessage().toLowerCase();
            if (mensaje.contains("descanso") || mensaje.contains("día de descanso")) {
                errorResponse.put("tipo", "DESCANSO");
            } else if (mensaje.contains("jornada de ingreso ya terminó") || mensaje.contains("jornada ya terminó")) {
                errorResponse.put("tipo", "JORNADA_FINALIZADA");
            } else if (mensaje.contains("ya registraste") || mensaje.contains("ya has registrado") || mensaje.contains("jornada de hoy ya está registrada")) {
                errorResponse.put("tipo", "YA_REGISTRADO");
            } else if (mensaje.contains("no encontrado")) {
                errorResponse.put("tipo", "NOT_FOUND");
            } else {
                errorResponse.put("tipo", "ERROR");
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error interno del servidor: " + e.getMessage());
            errorResponse.put("error", true);
            errorResponse.put("tipo", "ERROR");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    @PostMapping({"/entrada/{documento}", "/entrada/{codigoTrabajador}"})
    public ResponseEntity<MarcacionResponse> registrarEntrada(@PathVariable Map<String, String> pathVars) {
        String doc = pathVars.get("documento");
        if (doc == null) doc = pathVars.get("codigoTrabajador");
        MarcacionResponse response = asistenciaService.registrarEntrada(doc);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping({"/salida/{documento}", "/salida/{codigoTrabajador}"})
    public ResponseEntity<MarcacionResponse> registrarSalida(@PathVariable Map<String, String> pathVars) {
        String doc = pathVars.get("documento");
        if (doc == null) doc = pathVars.get("codigoTrabajador");
        MarcacionResponse response = asistenciaService.registrarSalida(doc);
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

    @GetMapping("/marcaciones/recientes")
    public ResponseEntity<List<MarcacionResponse>> obtenerMarcacionesRecientes(@RequestParam(defaultValue = "20") int limite) {
        List<MarcacionResponse> responses = asistenciaService.obtenerMarcacionesRecientes(limite);
        return ResponseEntity.ok(responses);
    }

    // ========== ASISTENCIA DIARIA ==========

    @GetMapping("/diaria")
    public ResponseEntity<List<AsistenciaDiariaResponse>> obtenerAsistenciasDelDia(
            @RequestParam String fecha) {
        LocalDate fechaLocal = LocalDate.parse(fecha);
        List<AsistenciaDiariaResponse> responses = asistenciaService.obtenerAsistenciasDelDia(fechaLocal);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/resumen/diario")
    public ResponseEntity<ResumenAsistenciaDTO> obtenerResumenDiario(
            @RequestParam String fecha) {
        LocalDate fechaLocal = LocalDate.parse(fecha);
        ResumenAsistenciaDTO resumen = asistenciaService.obtenerResumenDiario(fechaLocal);
        return ResponseEntity.ok(resumen);
    }

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

    @GetMapping({"/reporte/semanal/agencia/{agencia}", "/reporte/semanal/sede/{agencia}"})
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

    // ========== JUSTIFICAR / PERMISO / CORRECCIÓN MANUAL ==========

    @PostMapping("/justificar/{idAsistencia}")
    public ResponseEntity<?> justificarAsistencia(
            @PathVariable Long idAsistencia,
            @RequestBody Map<String, String> body) {
        try {
            String motivo = body.get("motivo");
            String observacion = body.get("observacion");
            String tipo = body.getOrDefault("tipo", "OTRO");
            if (motivo == null || motivo.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "El motivo es obligatorio"));
            }
            AsistenciaDiariaResponse resp = asistenciaService.justificarAsistencia(idAsistencia, motivo, observacion, tipo);
            return ResponseEntity.ok(resp);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/permiso")
    public ResponseEntity<?> registrarPermiso(@RequestBody Map<String, String> body) {
        try {
            Long idPracticante = Long.valueOf(body.get("idPracticante"));
            LocalDate fecha = LocalDate.parse(body.get("fecha"));
            String motivo = body.get("motivo");
            String observacion = body.get("observacion");
            String tipo = body.getOrDefault("tipo", "PERSONAL");
            if (motivo == null || motivo.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "El motivo es obligatorio"));
            }
            var j = asistenciaService.registrarPermiso(idPracticante, fecha, motivo, observacion, tipo);
            return new ResponseEntity<>(j, HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/corregir/{idPracticante}")
    public ResponseEntity<?> corregirAsistenciaManual(
            @PathVariable Long idPracticante,
            @RequestBody Map<String, String> body) {
        try {
            String fechaStr = body.get("fecha");
            if (fechaStr == null) return ResponseEntity.badRequest().body(Map.of("message", "Fecha requerida"));
            LocalDate fecha = LocalDate.parse(fechaStr);
            String horaEntrada = body.get("horaEntrada");
            String horaSalida = body.get("horaSalida");
            String observaciones = body.get("observaciones");
            AsistenciaDiariaResponse resp = asistenciaService.corregirAsistenciaManual(idPracticante, fecha, horaEntrada, horaSalida, observaciones);
            return ResponseEntity.ok(resp);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/cerrar-jornada")
    public ResponseEntity<?> cerrarJornada(@RequestParam String fecha) {
        LocalDate f = LocalDate.parse(fecha);
        int c = asistenciaService.cerrarJornadaDelDia(f);
        return ResponseEntity.ok(Map.of("fecha", fecha, "actualizados", c, "message", "Jornada cerrada: " + c + " ausencias registradas"));
    }
}