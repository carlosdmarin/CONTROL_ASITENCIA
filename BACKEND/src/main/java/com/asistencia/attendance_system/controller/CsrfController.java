package com.asistencia.attendance_system.controller;

import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class CsrfController {

    @GetMapping("/csrf")
    public Map<String, String> csrf(CsrfToken token) {
        // Spring genera la cookie XSRF-TOKEN automáticamente; devolvemos el valor en JSON
        // para que el frontend cross-origin (sin acceso a document.cookie del backend) lo guarde en memoria
        return Map.of("token", token.getToken());
    }
}
