package com.asistencia.attendance_system.controller;

import com.asistencia.attendance_system.model.dto.BloqueHorarioRequest;
import com.asistencia.attendance_system.model.dto.BloqueHorarioResponseDTO;
import com.asistencia.attendance_system.service.HorarioService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/horarios")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
@Slf4j
public class HorarioController {

    private final HorarioService horarioService;

    // ============================================
    // OBTENER HORARIO DE UN PRACTICANTE
    // ============================================
    @GetMapping("/practicante/{idPracticante}")
    public ResponseEntity<List<BloqueHorarioResponseDTO>> obtenerHorarioPorPracticante(
            @PathVariable Long idPracticante) {
        List<BloqueHorarioResponseDTO> horario = horarioService.obtenerHorarioPorPracticante(idPracticante);
        log.info("✅ Horario encontrado: {} registros", horario.size());
        return ResponseEntity.ok(horario);
    }

    // ============================================
    // OBTENER HORARIO ACTIVO DE UN PRACTICANTE
    // ============================================
    @GetMapping("/practicante/{idPracticante}/activos")
    public ResponseEntity<List<BloqueHorarioResponseDTO>> obtenerHorarioActivoPorPracticante(
            @PathVariable Long idPracticante) {
        List<BloqueHorarioResponseDTO> horario = horarioService.obtenerHorarioActivoPorPracticante(idPracticante);
        return ResponseEntity.ok(horario);
    }

    // ============================================
    // GUARDAR HORARIO
    // ============================================
    @PostMapping("/practicante/{idPracticante}")
    public ResponseEntity<?> guardarHorario(
            @PathVariable Long idPracticante,
            @RequestBody List<BloqueHorarioRequest> horarioRequests) {
        try {
            log.info("💾 Guardando horario para practicante ID: {}", idPracticante);
            horarioService.guardarHorario(idPracticante, horarioRequests);
            return ResponseEntity.status(HttpStatus.CREATED).build();
        } catch (Exception e) {
            log.error("❌ Error al guardar horario: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }

    // ============================================
    // ACTUALIZAR HORARIO
    // ============================================
    @PutMapping("/practicante/{idPracticante}")
    public ResponseEntity<?> actualizarHorario(
            @PathVariable Long idPracticante,
            @RequestBody List<BloqueHorarioRequest> horarioRequests) {
        try {
            log.info("🔄 Actualizando horario para practicante ID: {}", idPracticante);
            horarioService.guardarHorario(idPracticante, horarioRequests);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("❌ Error al actualizar horario: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }

    // ============================================
    // ELIMINAR HORARIO
    // ============================================
    @DeleteMapping("/practicante/{idPracticante}")
    public ResponseEntity<?> eliminarHorario(@PathVariable Long idPracticante) {
        try {
            log.info("🗑️ Eliminando horario para practicante ID: {}", idPracticante);
            horarioService.eliminarHorario(idPracticante);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("❌ Error al eliminar horario: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }
}