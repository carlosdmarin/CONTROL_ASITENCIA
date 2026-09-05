package com.asistencia.attendance_system.model.entity;

import com.asistencia.attendance_system.model.enums.SituacionAsistencia;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "asistencia_situacion", uniqueConstraints = @UniqueConstraint(columnNames = {"id_asistencia", "tipo"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AsistenciaSituacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_asistencia", nullable = false)
    private AsistenciaDiaria asistencia;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false, length = 35)
    private SituacionAsistencia tipo;

    @Column(name = "motivo", columnDefinition = "TEXT")
    private String motivo;

    @Column(name = "observacion", columnDefinition = "TEXT")
    private String observacion;

    @Column(name = "hora_salida_anticipada")
    private LocalTime horaSalidaAnticipada;

    @Column(name = "hora_entrada_registrada")
    private LocalTime horaEntradaRegistrada;

    @Column(name = "fecha_registro", nullable = false)
    private LocalDateTime fechaRegistro;

    @PrePersist
    protected void onCreate() {
        fechaRegistro = LocalDateTime.now();
    }
}
