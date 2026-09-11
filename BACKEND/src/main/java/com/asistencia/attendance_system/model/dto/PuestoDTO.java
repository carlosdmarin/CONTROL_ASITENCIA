package com.asistencia.attendance_system.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
/**
 * @deprecated Usar AreaResponse / AreaRequest. Mantenido solo para compatibilidad.
 */
@Deprecated
public class PuestoDTO {
    private Long idPuesto;
    private String nombrePuesto;
    private String area;
    private String descripcion;
    private Boolean activo;

    // Alias canónico
    public Long getIdArea() { return idPuesto; }
    public void setIdArea(Long idArea) { this.idPuesto = idArea; }
    public String getNombreArea() { return nombrePuesto; }
    public void setNombreArea(String nombreArea) { this.nombrePuesto = nombreArea; }
}