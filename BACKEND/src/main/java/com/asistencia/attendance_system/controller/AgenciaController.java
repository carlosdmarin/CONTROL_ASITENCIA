package com.asistencia.attendance_system.controller;


import com.asistencia.attendance_system.model.dto.PracticanteResponse;
import com.asistencia.attendance_system.model.entity.Agencia;
import com.asistencia.attendance_system.repository.AgenciaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/agencias")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class AgenciaController {
    private final AgenciaRepository agenciaRepository;

    @GetMapping
    public List<Agencia> getAll() {
        return agenciaRepository.findAll();
    }

   

}
