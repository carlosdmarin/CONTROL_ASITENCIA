package com.asistencia.attendance_system.model.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class PracticanteRequest {
    private String nombre;
    private String apellido;
    private String documento;
    private Long idSede;
    private Long idPuesto;
    private Long idTipoInstituto;
    private Long idCargo;
    private String correoElectronico;
    private String telefono;
    private LocalDate fechaInicioPracticas;
    private LocalDate fechaFinPracticas;

    // ====== NUEVO: Horario ======
    private List<BloqueHorarioRequest> horario;
}