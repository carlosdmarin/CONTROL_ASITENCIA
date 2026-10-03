package com.asistencia.attendance_system.controller;

import com.asistencia.attendance_system.model.entity.TipoPracticante;
import com.asistencia.attendance_system.repository.TipoPracticanteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping({"/api/tipos-practicante", "/tipos-practicante"})
@RequiredArgsConstructor
public class TiposPracticanteController {

    public final TipoPracticanteRepository tipoPracticanteRepository;
    @GetMapping
    @PreAuthorize("hasRole('RRHH')")
    public List<TipoPracticante> getAllTiposPracticante()
    {
        return tipoPracticanteRepository.findAll();
    }
}
