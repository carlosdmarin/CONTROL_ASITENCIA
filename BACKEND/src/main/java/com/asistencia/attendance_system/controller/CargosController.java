package com.asistencia.attendance_system.controller;


import com.asistencia.attendance_system.model.entity.Cargo;
import com.asistencia.attendance_system.repository.CargoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping({"/api/cargos", "/api/cargo", "/cargos", "/cargo"})
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class CargosController {

    public final CargoRepository cargoRepository;
    @GetMapping
    public List<Cargo> getAllCargos()
    {
        return cargoRepository.findAll();
    }
}
