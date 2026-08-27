package com.asistencia.attendance_system.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResumenAsistenciaDTO {
    private Long idPracticante;
    private String nombreCompleto;
    private String codigoTrabajador;
    private String agencia;
    private String cargo;
    private Integer horasSemanalesRequeridas;
    private Integer horasCumplidas;
    private Integer horasPendientes;
    private Integer diasPresente;
    private Integer diasTarde;
    private Integer diasFalta;
    private Integer diasJustificado;
    private Double porcentajeCumplimiento;
    private String estadoSemanal; // CUMPLIDO, INCOMPLETO, EXCEDIDO
}