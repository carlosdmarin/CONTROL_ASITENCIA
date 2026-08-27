package com.asistencia.attendance_system.model.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HorarioSemanalDTO {
    private Long idPracticante;
    private String nombreCompleto;
    @JsonAlias({"codigoTrabajador", "codigo_trabajador"})
    private String documento;
    private List<BloqueHorarioResponse> lunes;
    private List<BloqueHorarioResponse> martes;
    private List<BloqueHorarioResponse> miercoles;
    private List<BloqueHorarioResponse> jueves;
    private List<BloqueHorarioResponse> viernes;
    private List<BloqueHorarioResponse> sabado;
    private List<BloqueHorarioResponse> domingo;

    // Compatibilidad
    public String getCodigoTrabajador() { return documento; }
    public void setCodigoTrabajador(String codigoTrabajador) { this.documento = codigoTrabajador; }
}