package com.asistencia.attendance_system.controller;

import com.asistencia.attendance_system.model.entity.Oficina;
import com.asistencia.attendance_system.repository.OficinaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/oficinas", "/oficinas"})
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class OficinaController {

    private final OficinaRepository oficinaRepository;

    @GetMapping
    @PreAuthorize("hasRole('RRHH')")
    public List<Oficina> getAll() {
        return oficinaRepository.findAll();
    }

    @GetMapping("/activas")
    @PreAuthorize("hasRole('RRHH')")
    public List<Oficina> getActivas() {
        return oficinaRepository.findByEstado(1);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('RRHH')")
    public ResponseEntity<Oficina> getById(@PathVariable Integer id) {
        return oficinaRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
