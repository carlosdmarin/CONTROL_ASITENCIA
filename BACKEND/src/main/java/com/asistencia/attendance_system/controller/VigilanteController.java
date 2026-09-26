package com.asistencia.attendance_system.controller;

import com.asistencia.attendance_system.model.dto.VigilanteCreateRequest;
import com.asistencia.attendance_system.model.dto.VigilanteResponse;
import com.asistencia.attendance_system.service.VigilanteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vigilantes")
@RequiredArgsConstructor
public class VigilanteController {

    private final VigilanteService vigilanteService;

    @GetMapping
    @PreAuthorize("hasRole('RRHH')")
    public ResponseEntity<List<VigilanteResponse>> listar() {
        List<VigilanteResponse> lista = vigilanteService.listar();
        return ResponseEntity.ok(lista);
    }

    @PostMapping
    @PreAuthorize("hasRole('RRHH')")
    public ResponseEntity<VigilanteResponse> crear(@Valid @RequestBody VigilanteCreateRequest request) {
        VigilanteResponse creado = vigilanteService.crear(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }
}
