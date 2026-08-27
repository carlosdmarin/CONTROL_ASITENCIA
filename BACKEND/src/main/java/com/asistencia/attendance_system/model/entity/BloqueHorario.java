package com.asistencia.attendance_system.model.entity;

import com.asistencia.attendance_system.model.enums.TipoBloque;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "Bloque_Horario")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BloqueHorario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_bloque")
    private Long idBloque;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_practicante", nullable = false)
    private Practicante practicante;

    @Column(name = "dia_semana", nullable = false, length = 10)
    private String diaSemana;

    @Column(name = "hora_inicio", nullable = false)
    private LocalTime horaInicio;

    @Column(name = "hora_fin", nullable = false)
    private LocalTime horaFin;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_bloque", nullable = false)
    private TipoBloque tipoBloque;

    @Column(name = "descripcion", length = 100)
    private String descripcion;

    @Column(name = "activo", nullable = false)
    private Boolean activo = true;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDate fechaFin;

    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
        fechaActualizacion = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        fechaActualizacion = LocalDateTime.now();
    }
}