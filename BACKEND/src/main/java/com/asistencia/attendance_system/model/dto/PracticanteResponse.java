package com.asistencia.attendance_system.model.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PracticanteResponse {
    private Long idPracticante;
    private String nombreCompleto;
    private String documento;
    @JsonAlias({"agencia", "sede"})
    private String sede;
    private String puesto;
    private String area;
    private String tipoInstituto;
    private String cargo;
    private String situacion;
    private Integer horasSemanalesRequeridas;
    private String correoElectronico;
    private String telefono;
    private LocalDate fechaInicioPracticas;
    private LocalDate fechaFinPracticas;

    // Compatibilidad: frontend antiguo espera "agencia"
    public String getAgencia() { return sede; }
    public void setAgencia(String agencia) { this.sede = agencia; }
}