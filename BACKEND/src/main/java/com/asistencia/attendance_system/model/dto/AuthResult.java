package com.asistencia.attendance_system.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResult {
    private Long id;
    private String nombre;
    private String usuario;
    private String rol; // PRACTICANTE, VIGILANTE, RRHH
    private String documento;
    private String sede;
    private String sid; // practicante:1, vigilante:1, administradores:1
    private String source; // practicante, vigilante, administradores
}
