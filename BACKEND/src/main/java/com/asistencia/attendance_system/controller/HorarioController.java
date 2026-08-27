package com.asistencia.attendance_system.controller;

import com.asistencia.attendance_system.model.dto.BloqueHorarioRequest;
import com.asistencia.attendance_system.model.dto.BloqueHorarioResponse;
import com.asistencia.attendance_system.model.dto.HorarioSemanalDTO;
import com.asistencia.attendance_system.service.HorarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/horarios")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class HorarioController {

    private final HorarioService horarioService;

    // ========== CRUD DE BLOQUES ==========

    @PostMapping("/bloques")
    public ResponseEntity<BloqueHorarioResponse> crearBloque(@Valid @RequestBody BloqueHorarioRequest request) {
        BloqueHorarioResponse response = horarioService.crearBloque(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/bloques/{id}")
    public ResponseEntity<BloqueHorarioResponse> actualizarBloque(
            @PathVariable Long id,
            @Valid @RequestBody BloqueHorarioRequest request) {
        BloqueHorarioResponse response = horarioService.actualizarBloque(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/bloques/{id}")
    public ResponseEntity<Void> eliminarBloque(@PathVariable Long id) {
        horarioService.eliminarBloque(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/bloques/{id}")
    public ResponseEntity<BloqueHorarioResponse> obtenerBloquePorId(@PathVariable Long id) {
        BloqueHorarioResponse response = horarioService.obtenerBloquePorId(id);
        return ResponseEntity.ok(response);
    }

    // ========== HORARIO POR PRACTICANTE ==========

    @GetMapping("/practicante/{idPracticante}")
    public ResponseEntity<List<BloqueHorarioResponse>> obtenerBloquesPorPracticante(@PathVariable Long idPracticante) {
        List<BloqueHorarioResponse> responses = horarioService.obtenerBloquesPorPracticante(idPracticante);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/practicante/{idPracticante}/activos")
    public ResponseEntity<List<BloqueHorarioResponse>> obtenerBloquesActivosPorPracticante(@PathVariable Long idPracticante) {
        List<BloqueHorarioResponse> responses = horarioService.obtenerBloquesActivosPorPracticante(idPracticante);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/practicante/{idPracticante}/semanal")
    public ResponseEntity<HorarioSemanalDTO> obtenerHorarioSemanal(@PathVariable Long idPracticante) {
        HorarioSemanalDTO horario = horarioService.obtenerHorarioSemanal(idPracticante);
        return ResponseEntity.ok(horario);
    }

    @GetMapping("/practicante/{idPracticante}/dia/{diaSemana}")
    public ResponseEntity<List<BloqueHorarioResponse>> obtenerBloquesPorDia(
            @PathVariable Long idPracticante,
            @PathVariable String diaSemana) {
        List<BloqueHorarioResponse> responses = horarioService.obtenerBloquesPorDia(idPracticante, diaSemana.toUpperCase());
        return ResponseEntity.ok(responses);
    }

    // ========== VALIDACIONES ==========

    @GetMapping("/practicante/{idPracticante}/validar/dia-laborable")
    public ResponseEntity<Boolean> esDiaLaborable(
            @PathVariable Long idPracticante,
            @RequestParam String fecha) {
        LocalDate fechaLocal = LocalDate.parse(fecha);
        boolean resultado = horarioService.esDiaLaborable(idPracticante, fechaLocal);
        return ResponseEntity.ok(resultado);
    }

    @GetMapping("/practicante/{idPracticante}/validar/estado-dia")
    public ResponseEntity<String> obtenerEstadoDia(
            @PathVariable Long idPracticante,
            @RequestParam String fecha) {
        LocalDate fechaLocal = LocalDate.parse(fecha);
        String estado = horarioService.obtenerEstadoDia(idPracticante, fechaLocal);
        return ResponseEntity.ok(estado);
    }

    @GetMapping("/practicante/{idPracticante}/validar/en-empresa")
    public ResponseEntity<Boolean> debeEstarEnEmpresa(
            @PathVariable Long idPracticante,
            @RequestParam String fecha,
            @RequestParam String hora) {
        LocalDate fechaLocal = LocalDate.parse(fecha);
        boolean resultado = horarioService.debeEstarEnEmpresa(idPracticante, fechaLocal, hora);
        return ResponseEntity.ok(resultado);
    }

    // ========== COPIA DE HORARIO ==========

    @PostMapping("/practicante/{idPracticante}/copiar")
    public ResponseEntity<Void> copiarHorarioSemana(
            @PathVariable Long idPracticante,
            @RequestParam String fechaInicio,
            @RequestParam String fechaFin) {
        LocalDate inicio = LocalDate.parse(fechaInicio);
        LocalDate fin = LocalDate.parse(fechaFin);
        horarioService.copiarHorarioSemana(idPracticante, inicio, fin);
        return ResponseEntity.ok().build();
    }
}