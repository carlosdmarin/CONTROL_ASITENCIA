package com.asistencia.attendance_system.controller;

import com.asistencia.attendance_system.excepcion.BusinessException;
import com.asistencia.attendance_system.model.dto.AreaRequest;
import com.asistencia.attendance_system.model.dto.AreaResponse;
import com.asistencia.attendance_system.model.entity.Puesto;
import com.asistencia.attendance_system.service.PuestoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping({"/api/puestos", "/api/areas"})
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class PuestoController {

    private final PuestoService puestoService;

    // ====== Helpers DTO ↔ Entity ======
    private AreaResponse toResponse(Puesto p) {
        return toResponse(p, null);
    }

    private AreaResponse toResponse(Puesto p, Long cantidad) {
        AreaResponse r = new AreaResponse();
        r.setIdArea(p.getIdPuesto());
        r.setNombreArea(p.getNombrePuesto());
        r.setDescripcion(p.getDescripcion());
        r.setActivo(p.getActivo());
        r.setFechaCreacion(p.getFechaCreacion());
        r.setCantidadPracticantes(cantidad != null ? cantidad : 0L);
        return r;
    }

    private Puesto toEntity(AreaRequest req) {
        Puesto p = new Puesto();
        p.setNombrePuesto(req.getNombreArea());
        p.setDescripcion(req.getDescripcion());
        p.setActivo(req.getActivo() != null ? req.getActivo() : true);
        return p;
    }

    // ========== TEST ==========
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Backend funcionando correctamente");
    }

    // ========== OBTENER TODOS ========== (canónico /api/areas, alias /api/puestos)
    @GetMapping
    public ResponseEntity<List<AreaResponse>> getAll() {
        java.util.Map<Long, Long> counts = puestoService.countActivosGrouped();
        List<AreaResponse> list = puestoService.findAll().stream()
                .map(p -> toResponse(p, counts.getOrDefault(p.getIdPuesto(), 0L)))
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    // ========== OBTENER ACTIVOS ==========
    @GetMapping("/activos")
    public ResponseEntity<List<AreaResponse>> getActivos() {
        java.util.Map<Long, Long> counts = puestoService.countActivosGrouped();
        List<AreaResponse> list = puestoService.findActivos().stream()
                .map(p -> toResponse(p, counts.getOrDefault(p.getIdPuesto(), 0L)))
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    // ========== OBTENER POR ID ==========
    @GetMapping("/{id}")
    public ResponseEntity<AreaResponse> getById(@PathVariable Long id) {
        java.util.Map<Long, Long> counts = puestoService.countActivosGrouped();
        return puestoService.findById(id)
                .map(p -> toResponse(p, counts.getOrDefault(p.getIdPuesto(), 0L)))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ========== CREAR ==========
    @PostMapping
    public ResponseEntity<AreaResponse> create(@RequestBody AreaRequest request) {
        Puesto entity = toEntity(request);
        Puesto saved = puestoService.save(entity);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(saved, 0L));
    }

    // ========== ACTUALIZAR ==========
    @PutMapping("/{id}")
    public ResponseEntity<AreaResponse> update(@PathVariable Long id, @RequestBody AreaRequest request) {
        try {
            Puesto existing = puestoService.findById(id)
                    .orElseThrow(() -> new RuntimeException("Area no encontrada con ID: " + id));
            if (request.getNombreArea() != null) existing.setNombrePuesto(request.getNombreArea());
            if (request.getDescripcion() != null) existing.setDescripcion(request.getDescripcion());
            if (request.getActivo() != null) existing.setActivo(request.getActivo());
            Puesto updated = puestoService.update(id, existing);
            java.util.Map<Long, Long> counts = puestoService.countActivosGrouped();
            return ResponseEntity.ok(toResponse(updated, counts.getOrDefault(updated.getIdPuesto(), 0L)));
        } catch (BusinessException e) {
            throw e;
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ========== ELIMINAR ==========
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        try {
            puestoService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (BusinessException e) {
            throw e;
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ========== ACTIVAR ==========
    @PatchMapping("/{id}/activar")
    public ResponseEntity<AreaResponse> activar(@PathVariable Long id) {
        try {
            Puesto p = puestoService.activar(id);
            java.util.Map<Long, Long> counts = puestoService.countActivosGrouped();
            return ResponseEntity.ok(toResponse(p, counts.getOrDefault(p.getIdPuesto(), 0L)));
        } catch (BusinessException e) {
            throw e;
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ========== DESACTIVAR ==========
    @PatchMapping("/{id}/desactivar")
    public ResponseEntity<AreaResponse> desactivar(@PathVariable Long id) {
        try {
            Puesto p = puestoService.desactivar(id);
            java.util.Map<Long, Long> counts = puestoService.countActivosGrouped();
            return ResponseEntity.ok(toResponse(p, counts.getOrDefault(p.getIdPuesto(), 0L)));
        } catch (BusinessException e) {
            throw e;
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ====== LEGACY: Soporte directo para clientes que envían Puesto (entity) ======
    // Mantener compatibilidad si algún cliente antiguo POSTea Puesto raw
    @PostMapping(value = "/legacy", consumes = "application/json")
    @Deprecated
    public ResponseEntity<AreaResponse> createLegacy(@RequestBody Puesto puesto) {
        Puesto saved = puestoService.save(puesto);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(saved));
    }
}