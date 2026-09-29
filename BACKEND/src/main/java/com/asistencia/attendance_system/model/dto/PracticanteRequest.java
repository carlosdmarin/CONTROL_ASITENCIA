package com.asistencia.attendance_system.model.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class PracticanteRequest {
    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100, message = "El nombre no debe superar 100 caracteres")
    private String nombre;

    @NotBlank(message = "El apellido es obligatorio")
    @Size(max = 100, message = "El apellido no debe superar 100 caracteres")
    private String apellido;

    @NotBlank(message = "El documento es obligatorio")
    @Size(max = 20, message = "El documento no debe superar 20 caracteres")
    private String documento;

    @JsonAlias({"idAgencia"})
    @NotNull(message = "La sede es obligatoria")
    @Positive(message = "La sede no es válida")
    private Integer idSede;

    @JsonAlias({"idOficina", "id_oficina"})
    @NotNull(message = "La oficina es obligatoria")
    @Positive(message = "La oficina no es válida")
    private Integer idOficina;

    @NotNull(message = "El tipo de instituto es obligatorio")
    @Positive(message = "El tipo de instituto no es válido")
    private Long idTipoInstituto;

    @NotNull(message = "El tipo de practicante es obligatorio")
    @Positive(message = "El tipo de practicante no es válido")
    private Long idTipoPracticante;

    @Email(message = "El correo electrónico no es válido")
    @Size(max = 100, message = "El correo electrónico no debe superar 100 caracteres")
    private String correoElectronico;

    @Size(max = 15, message = "El teléfono no debe superar 15 caracteres")
    private String telefono;

    @NotNull(message = "La fecha de inicio de prácticas es obligatoria")
    private LocalDate fechaInicioPracticas;

    private LocalDate fechaFinPracticas;

    // ====== NUEVO: Horario ======
    private List<BloqueHorarioRequest> horario;
}