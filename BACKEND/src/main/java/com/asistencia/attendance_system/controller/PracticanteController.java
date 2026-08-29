package com.asistencia.attendance_system.controller;

import com.asistencia.attendance_system.model.dto.BloqueHorarioRequest;
import com.asistencia.attendance_system.model.dto.PracticanteRequest;
import com.asistencia.attendance_system.model.dto.PracticanteResponse;
import com.asistencia.attendance_system.model.entity.BloqueHorario;
import com.asistencia.attendance_system.service.PracticanteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/practicantes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PracticanteController {

    private final PracticanteService practicanteService;

    // ========== TEST ==========
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Backend funcionando correctamente");
    }

    // ========== CRUD BÁSICO ==========

    @GetMapping
    public ResponseEntity<List<PracticanteResponse>> obtenerTodos() {
        return ResponseEntity.ok(practicanteService.obtenerTodos());
    }

    @PostMapping
    public ResponseEntity<PracticanteResponse> crear(@Valid @RequestBody PracticanteRequest request) {
        PracticanteResponse response = practicanteService.crear(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PracticanteResponse> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody PracticanteRequest request) {
        PracticanteResponse response = practicanteService.actualizar(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        practicanteService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<PracticanteResponse> obtenerPorId(@PathVariable Long id) {
        PracticanteResponse response = practicanteService.obtenerPorId(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/codigo/{codigo}")
    public ResponseEntity<PracticanteResponse> obtenerPorCodigo(@PathVariable String codigo) {
        PracticanteResponse response = practicanteService.obtenerPorCodigo(codigo);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/documento/{documento}")
    public ResponseEntity<PracticanteResponse> obtenerPorDocumento(@PathVariable String documento) {
        PracticanteResponse response = practicanteService.obtenerPorDocumento(documento);
        return ResponseEntity.ok(response);
    }

    // ========== BÚSQUEDAS ==========

    @GetMapping("/activos")
    public ResponseEntity<List<PracticanteResponse>> obtenerActivos() {
        return ResponseEntity.ok(practicanteService.obtenerActivos());
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<PracticanteResponse>> buscar(@RequestParam String termino) {
        return ResponseEntity.ok(practicanteService.buscarPorNombre(termino));
    }

    // ========== ESTADÍSTICAS ==========

    @GetMapping("/contar/activos")
    public ResponseEntity<Long> contarActivos() {
        return ResponseEntity.ok(practicanteService.contarActivos());
    }

    @GetMapping({"/contar/sede/{id}", "/contar/agencia/{id}"})
    public ResponseEntity<Long> contarPorSede(@PathVariable Long id) {
        return ResponseEntity.ok(practicanteService.contarPorSede(id));
    }

    // ========== CAMBIOS DE ESTADO ==========

    @PatchMapping("/{id}/activar")
    public ResponseEntity<PracticanteResponse> activar(@PathVariable Long id) {
        return ResponseEntity.ok(practicanteService.activar(id));
    }

    @PatchMapping("/{id}/desactivar")
    public ResponseEntity<PracticanteResponse> desactivar(@PathVariable Long id) {
        return ResponseEntity.ok(practicanteService.desactivar(id));
    }

    // ========== ENDPOINTS PARA HORARIO ==========

    @GetMapping("/{id}/horario")
    public ResponseEntity<List<BloqueHorario>> getHorario(@PathVariable Long id) {
        List<BloqueHorario> horario = practicanteService.obtenerHorario(id);
        return ResponseEntity.ok(horario);
    }

    @PutMapping("/{id}/horario")
    public ResponseEntity<Void> updateHorario(
            @PathVariable Long id,
            @RequestBody List<BloqueHorarioRequest> horario) {
        practicanteService.actualizarHorario(id, horario);
        return ResponseEntity.ok().build();
    }
}