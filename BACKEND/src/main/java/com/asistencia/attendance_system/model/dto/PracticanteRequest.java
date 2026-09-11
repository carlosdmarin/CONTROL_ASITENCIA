package com.asistencia.attendance_system.model.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class PracticanteRequest {
    private String nombre;
    private String apellido;
    private String documento;
    @JsonAlias({"idAgencia"})
    private Long idSede;
    @JsonAlias({"idArea", "id_area"})
    private Long idPuesto;
    // Canónico nuevo: idArea (alias de idPuesto para migración)
    public Long getIdArea() { return idPuesto; }
    public void setIdArea(Long idArea) { this.idPuesto = idArea; }

    private Long idTipoInstituto;
    private Long idCargo;
    private String correoElectronico;
    private String telefono;
    private LocalDate fechaInicioPracticas;
    private LocalDate fechaFinPracticas;

    // ====== NUEVO: Horario ======
    private List<BloqueHorarioRequest> horario;
}