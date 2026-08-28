package com.asistencia.attendance_system.controller;

import com.asistencia.attendance_system.model.dto.BloqueHorarioRequest;
import com.asistencia.attendance_system.model.entity.BloqueHorario;
import com.asistencia.attendance_system.service.HorarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/horarios")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class HorarioController {

    private final HorarioService horarioService;

    // ============================================
    // OBTENER HORARIO DE UN PRACTICANTE
    // ============================================
    @GetMapping("/practicante/{idPracticante}")
    public ResponseEntity<List<BloqueHorario>> obtenerHorarioPorPracticante(
            @PathVariable Long idPracticante) {
        List<BloqueHorario> horario = horarioService.obtenerHorarioPorPracticante(idPracticante);
        return ResponseEntity.ok(horario);
    }

    // ============================================
    // OBTENER HORARIO ACTIVO DE UN PRACTICANTE
    // ============================================
    @GetMapping("/practicante/{idPracticante}/activos")
    public ResponseEntity<List<BloqueHorario>> obtenerHorarioActivoPorPracticante(
            @PathVariable Long idPracticante) {
        List<BloqueHorario> horario = horarioService.obtenerHorarioActivoPorPracticante(idPracticante);
        return ResponseEntity.ok(horario);
    }

    // ============================================
    // GUARDAR HORARIO COMPLETO DE UN PRACTICANTE
    // ============================================
    @PostMapping("/practicante/{idPracticante}")
    public ResponseEntity<Void> guardarHorario(
            @PathVariable Long idPracticante,
            @RequestBody List<BloqueHorarioRequest> horarioRequests) {
        horarioService.guardarHorario(idPracticante, horarioRequests);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    // ============================================
    // ACTUALIZAR HORARIO COMPLETO DE UN PRACTICANTE
    // ============================================
    @PutMapping("/practicante/{idPracticante}")
    public ResponseEntity<Void> actualizarHorario(
            @PathVariable Long idPracticante,
            @RequestBody List<BloqueHorarioRequest> horarioRequests) {
        horarioService.guardarHorario(idPracticante, horarioRequests);
        return ResponseEntity.ok().build();
    }

    // ============================================
    // ELIMINAR TODO EL HORARIO DE UN PRACTICANTE
    // ============================================
    @DeleteMapping("/practicante/{idPracticante}")
    public ResponseEntity<Void> eliminarHorario(@PathVariable Long idPracticante) {
        horarioService.eliminarHorario(idPracticante);
        return ResponseEntity.noContent().build();
    }
}