package com.asistencia.attendance_system.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PuestoDTO {
    private Long idPuesto;
    private String nombrePuesto;
    private String area;
    private String descripcion;
    private Boolean activo;
}