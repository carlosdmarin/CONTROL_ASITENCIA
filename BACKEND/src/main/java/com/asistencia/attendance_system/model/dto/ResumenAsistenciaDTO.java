package com.asistencia.attendance_system.model.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResumenAsistenciaDTO {
    private Long idPracticante;
    private String nombreCompleto;
    @JsonAlias({"codigoTrabajador", "codigo_trabajador"})
    private String documento;
    @JsonAlias({"agencia", "sede"})
    private String sede;
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

    // Compatibilidad
    public String getAgencia() { return sede; }
    public void setAgencia(String agencia) { this.sede = agencia; }

    public String getCodigoTrabajador() { return documento; }
    public void setCodigoTrabajador(String codigoTrabajador) { this.documento = codigoTrabajador; }
}