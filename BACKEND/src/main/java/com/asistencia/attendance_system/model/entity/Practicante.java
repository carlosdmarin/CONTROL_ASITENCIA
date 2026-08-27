package com.asistencia.attendance_system.model.entity;

import com.asistencia.attendance_system.model.enums.Situacion;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "Practicante")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Practicante {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_practicante")
    private Long idPracticante;

    @Column(name = "nombre", nullable = false, length = 100)
    private String nombre;

    @Column(name = "apellido", nullable = false, length = 100)
    private String apellido;

    @Column(name = "documento", unique = true, nullable = false, length = 20)
    private String documento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_sede", nullable = false)
    private Sede sede;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_area", nullable = false)
    private Puesto puesto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_centro_estudios", nullable = false)
    private TipoInstituto tipoInstituto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_cargo", nullable = false)
    private Cargo cargo;

    @Enumerated(EnumType.STRING)
    @Column(name = "situacion", nullable = false)
    private Situacion situacion = Situacion.ACTIVO;

    @Column(name = "correo_electronico", length = 100)
    private String correoElectronico;

    @Column(name = "telefono", length = 15)
    private String telefono;

    @Column(name = "fecha_inicio_practicas", nullable = false)
    private LocalDate fechaInicioPracticas;

    @Column(name = "fecha_fin_practicas")
    private LocalDate fechaFinPracticas;

    @Column(name = "fecha_registro", nullable = false, updatable = false)
    private LocalDateTime fechaRegistro;

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    @PrePersist
    protected void onCreate() {
        fechaRegistro = LocalDateTime.now();
        fechaActualizacion = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        fechaActualizacion = LocalDateTime.now();
    }
}