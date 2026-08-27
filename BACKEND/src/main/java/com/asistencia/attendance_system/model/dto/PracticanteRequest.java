package com.asistencia.attendance_system.model.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.Length;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PracticanteRequest {

    @NotBlank(message = "El código del trabajador es obligatorio")
    @Length(min = 3, max = 10, message = "El código debe tener entre 3 y 10 caracteres")
    private String codigoTrabajador;

    @NotBlank(message = "El nombre es obligatorio")
    @Length(max = 100, message = "El nombre no puede tener más de 100 caracteres")
    private String nombre;

    @NotBlank(message = "El apellido es obligatorio")
    @Length(max = 100, message = "El apellido no puede tener más de 100 caracteres")
    private String apellido;

    @NotBlank(message = "El documento es obligatorio")
    @Pattern(regexp = "^[0-9]{8,15}$", message = "El documento debe contener solo números (8-15 dígitos)")
    private String documento;

    @NotNull(message = "El ID de la agencia es obligatorio")
    private Long idAgencia;

    @NotNull(message = "El ID del puesto es obligatorio")
    private Long idPuesto;

    @NotNull(message = "El ID del tipo de instituto es obligatorio")
    private Long idTipoInstituto;

    @NotNull(message = "El ID del cargo es obligatorio")
    private Long idCargo;

    @Email(message = "El correo electrónico debe ser válido")
    private String correoElectronico;

    @Pattern(regexp = "^[0-9]{9}$", message = "El teléfono debe tener 9 dígitos")
    private String telefono;

    @NotNull(message = "La fecha de inicio de prácticas es obligatoria")
    private LocalDate fechaInicioPracticas;

    private LocalDate fechaFinPracticas;
}