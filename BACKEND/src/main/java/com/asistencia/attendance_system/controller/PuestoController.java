package com.asistencia.attendance_system.controller;

import com.asistencia.attendance_system.model.entity.Puesto;
import com.asistencia.attendance_system.service.PuestoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/puestos")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class PuestoController {

    private final PuestoService puestoService;

    // ========== TEST ==========
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Backend funcionando correctamente");
    }

    // ========== OBTENER TODOS LOS PUESTOS ==========
    @GetMapping
    public ResponseEntity<List<Puesto>> getAllPuestos() {
        List<Puesto> puestos = puestoService.findAll();
        return ResponseEntity.ok(puestos);
    }

    // ========== OBTENER PUESTOS ACTIVOS ==========
    @GetMapping("/activos")
    public ResponseEntity<List<Puesto>> getPuestosActivos() {
        List<Puesto> puestos = puestoService.findActivos();
        return ResponseEntity.ok(puestos);
    }

    // ========== OBTENER PUESTO POR ID ==========
    @GetMapping("/{id}")
    public ResponseEntity<Puesto> getPuestoById(@PathVariable Long id) {
        return puestoService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ========== CREAR NUEVO PUESTO ==========
    @PostMapping
    public ResponseEntity<Puesto> createPuesto(@RequestBody Puesto puesto) {
        Puesto nuevoPuesto = puestoService.save(puesto);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoPuesto);
    }

    // ========== ACTUALIZAR PUESTO ==========
    @PutMapping("/{id}")
    public ResponseEntity<Puesto> updatePuesto(@PathVariable Long id, @RequestBody Puesto puesto) {
        try {
            Puesto puestoActualizado = puestoService.update(id, puesto);
            return ResponseEntity.ok(puestoActualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ========== ELIMINAR PUESTO ==========
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePuesto(@PathVariable Long id) {
        try {
            puestoService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ========== ACTIVAR PUESTO ==========
    @PatchMapping("/{id}/activar")
    public ResponseEntity<Puesto> activarPuesto(@PathVariable Long id) {
        try {
            Puesto puestoActivado = puestoService.activar(id);
            return ResponseEntity.ok(puestoActivado);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ========== DESACTIVAR PUESTO ==========
    @PatchMapping("/{id}/desactivar")
    public ResponseEntity<Puesto> desactivarPuesto(@PathVariable Long id) {
        try {
            Puesto puestoDesactivado = puestoService.desactivar(id);
            return ResponseEntity.ok(puestoDesactivado);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}