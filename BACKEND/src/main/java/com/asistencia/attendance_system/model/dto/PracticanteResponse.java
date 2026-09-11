package com.asistencia.attendance_system.model.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PracticanteResponse {
    private Long idPracticante;
    private String nombreCompleto;
    private String documento;
    @JsonAlias({"agencia", "sede"})
    private String sede;
    // Legacy: puesto = nombreArea, area = nombreArea (corregido) + descripcionArea separada
    private String puesto;
    private String area;
    // Contrato canónico nuevo
    private Long idArea;
    private String nombreArea;
    private String descripcionArea;
    private Long idSede;
    private Long idCargo;
    private Long idTipoInstituto;
    private String tipoInstituto;
    private String cargo;
    private String situacion;
    private Integer horasSemanalesRequeridas;
    private String correoElectronico;
    private String telefono;
    private LocalDate fechaInicioPracticas;
    private LocalDate fechaFinPracticas;
    private LocalDateTime fechaDesactivacion;

    // Compatibilidad: frontend antiguo espera "agencia"
    public String getAgencia() { return sede; }
    public void setAgencia(String agencia) { this.sede = agencia; }

    // Compat legacy para idPuesto / nombrePuesto
    @com.fasterxml.jackson.annotation.JsonProperty("idPuesto")
    public Long getIdPuestoCompat() { return idArea; }
    @com.fasterxml.jackson.annotation.JsonProperty("nombrePuesto")
    public String getNombrePuestoCompat() { return nombreArea; }
}