package com.asistencia.attendance_system.controller;


import com.asistencia.attendance_system.model.entity.Sede;
import com.asistencia.attendance_system.repository.SedeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/sedes", "/api/agencias", "/sedes", "/agencias"})
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class SedeController {
    private final SedeRepository sedeRepository;

    @GetMapping
    public List<Sede> getAll() {
        return sedeRepository.findAll();
    }

   

}
