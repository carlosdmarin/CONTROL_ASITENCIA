package com.asistencia.attendance_system.model.entity;

import com.asistencia.attendance_system.model.enums.EstadoJustificacion;
import com.asistencia.attendance_system.model.enums.TipoJustificacion;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "Justificacion")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Justificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_justificacion")
    private Long idJustificacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_practicante", nullable = false)
    private Practicante practicante;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin", nullable = false)
    private LocalDate fechaFin;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_justificacion", nullable = false)
    private TipoJustificacion tipoJustificacion;

    @Column(name = "motivo", nullable = false, columnDefinition = "TEXT")
    private String motivo;

    @Column(name = "archivo_adjunto", length = 255)
    private String archivoAdjunto;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false)
    private EstadoJustificacion estado = EstadoJustificacion.PENDIENTE;

    @Column(name = "id_usuario_aprueba")
    private Long idUsuarioAprueba;

    @Column(name = "fecha_aprobacion")
    private LocalDateTime fechaAprobacion;

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    @Column(name = "fecha_registro", nullable = false, updatable = false)
    private LocalDateTime fechaRegistro;

    @PrePersist
    protected void onCreate() {
        fechaRegistro = LocalDateTime.now();
    }
}