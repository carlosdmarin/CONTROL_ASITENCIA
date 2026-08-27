package com.asistencia.attendance_system.model.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MarcacionResponse {
    private Long idMarcacion;
    @JsonAlias({"codigoTrabajador", "codigo_trabajador"})
    private String documento;
    private String nombreCompleto;
    private LocalDate fecha;
    private LocalTime horaMarcacion;
    private String tipoMarcacion;
    private String metodoRegistro;
    private String estado; // "EXITOSA", "FUERA_DE_HORARIO", "DUPLICADA"
    private String mensaje;
    private LocalDateTime fechaRegistro;

    // Compatibilidad
    public String getCodigoTrabajador() { return documento; }
    public void setCodigoTrabajador(String codigoTrabajador) { this.documento = codigoTrabajador; }
}