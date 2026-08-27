package com.asistencia.attendance_system.controller;

import com.asistencia.attendance_system.model.dto.PracticanteRequest;
import com.asistencia.attendance_system.model.dto.PracticanteResponse;
import com.asistencia.attendance_system.service.PracticanteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/practicantes")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class PracticanteController {

    private final PracticanteService practicanteService;

    // ========== TEST ==========
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Backend funcionando correctamente");
    }

    // ========== CRUD BÁSICO ==========

    // Obtener todos los practicantes
    @GetMapping
    public ResponseEntity<List<PracticanteResponse>> obtenerTodos() {
        List<PracticanteResponse> responses = practicanteService.obtenerTodos();
        return ResponseEntity.ok(responses);
    }

    // Crear un practicante
    @PostMapping
    public ResponseEntity<PracticanteResponse> crear(@Valid @RequestBody PracticanteRequest request) {
        PracticanteResponse response = practicanteService.crear(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // Actualizar un practicante
    @PutMapping("/{id}")
    public ResponseEntity<PracticanteResponse> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody PracticanteRequest request) {
        PracticanteResponse response = practicanteService.actualizar(id, request);
        return ResponseEntity.ok(response);
    }

    // Eliminar un practicante
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        practicanteService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    // Obtener practicante por ID
    @GetMapping("/{id}")
    public ResponseEntity<PracticanteResponse> obtenerPorId(@PathVariable Long id) {
        PracticanteResponse response = practicanteService.obtenerPorId(id);
        return ResponseEntity.ok(response);
    }

    // Obtener practicante por código (alias, ahora usa documento)
    @GetMapping("/codigo/{codigo}")
    public ResponseEntity<PracticanteResponse> obtenerPorCodigo(@PathVariable String codigo) {
        PracticanteResponse response = practicanteService.obtenerPorCodigo(codigo);
        return ResponseEntity.ok(response);
    }

    // Obtener practicante por documento
    @GetMapping("/documento/{documento}")
    public ResponseEntity<PracticanteResponse> obtenerPorDocumento(@PathVariable String documento) {
        PracticanteResponse response = practicanteService.obtenerPorDocumento(documento);
        return ResponseEntity.ok(response);
    }

    // ========== BÚSQUEDAS ==========

    // Obtener practicantes activos
    @GetMapping("/activos")
    public ResponseEntity<List<PracticanteResponse>> obtenerActivos() {
        List<PracticanteResponse> responses = practicanteService.obtenerActivos();
        return ResponseEntity.ok(responses);
    }

    // Buscar practicantes por nombre
    @GetMapping("/buscar")
    public ResponseEntity<List<PracticanteResponse>> buscar(@RequestParam String termino) {
        List<PracticanteResponse> responses = practicanteService.buscarPorNombre(termino);
        return ResponseEntity.ok(responses);
    }

    // ========== ESTADÍSTICAS ==========

    // Contar practicantes activos
    @GetMapping("/contar/activos")
    public ResponseEntity<Long> contarActivos() {
        Long count = practicanteService.contarActivos();
        return ResponseEntity.ok(count);
    }

    // Contar practicantes por sede (alias /agencia para compatibilidad frontend)
    @GetMapping({"/contar/sede/{id}", "/contar/agencia/{id}"})
    public ResponseEntity<Long> contarPorSede(@PathVariable Long id) {
        Long count = practicanteService.contarPorSede(id);
        return ResponseEntity.ok(count);
    }

    // ========== CAMBIOS DE ESTADO ==========

    // Activar un practicante
    @PatchMapping("/{id}/activar")
    public ResponseEntity<PracticanteResponse> activar(@PathVariable Long id) {
        PracticanteResponse response = practicanteService.activar(id);
        return ResponseEntity.ok(response);
    }

    // Desactivar un practicante
    @PatchMapping("/{id}/desactivar")
    public ResponseEntity<PracticanteResponse> desactivar(@PathVariable Long id) {
        PracticanteResponse response = practicanteService.desactivar(id);
        return ResponseEntity.ok(response);
    }
}