package com.asistencia.attendance_system.controller;


import com.asistencia.attendance_system.model.entity.TipoInstituto;
import com.asistencia.attendance_system.repository.TipoInstitutoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/tipo-instituto")
@RequiredArgsConstructor
@CrossOrigin (origins = "http://localhost:3000")
public class TipoInsitutoController {

    public final TipoInstitutoRepository tipoInstitutoRepository;
//    Obtenemos tods los tipos de instito
    @GetMapping
    public ResponseEntity<List<TipoInstituto>> getAll() {
        return ResponseEntity.ok(tipoInstitutoRepository.findAll());
    }
}
