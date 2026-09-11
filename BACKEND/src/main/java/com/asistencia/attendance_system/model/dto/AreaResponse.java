package com.asistencia.attendance_system.model.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO canónico para Area.
 * Expone idArea / nombreArea / descripcion como contrato limpio.
 * Mantiene compatibilidad con legacy: acepta/serializa idPuesto/nombrePuesto/area.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AreaResponse {

    @JsonAlias({"idPuesto", "id_area"})
    @JsonProperty("idArea")
    private Long idArea;

    @JsonAlias({"nombrePuesto", "nombre_area"})
    @JsonProperty("nombreArea")
    private String nombreArea;

    @JsonAlias({"area"})
    private String descripcion;

    private Boolean activo;

    private LocalDateTime fechaCreacion;

    // ====== Compatibilidad legacy: exponer también idPuesto/nombrePuesto/area ======
    @JsonProperty("idPuesto")
    public Long getIdPuestoCompat() { return idArea; }

    @JsonProperty("nombrePuesto")
    public String getNombrePuestoCompat() { return nombreArea; }

    @JsonProperty("area")
    public String getAreaCompat() { return descripcion; }
}
