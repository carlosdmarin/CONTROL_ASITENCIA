package com.asistencia.attendance_system.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PracticanteResponse {
    private Long idPracticante;
    private String codigoTrabajador;
    private String nombreCompleto;
    private String documento;
    private String agencia;
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
}