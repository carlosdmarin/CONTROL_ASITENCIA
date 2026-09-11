package com.asistencia.attendance_system.model.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para crear/actualizar Area.
 * Contrato canónico: nombreArea + descripcion + activo.
 * Compatibilidad: acepta nombrePuesto / area como alias.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AreaRequest {

    @JsonAlias({"nombrePuesto", "nombre_area", "nombre"})
    private String nombreArea;

    @JsonAlias({"area"})
    private String descripcion;

    private Boolean activo;
}
