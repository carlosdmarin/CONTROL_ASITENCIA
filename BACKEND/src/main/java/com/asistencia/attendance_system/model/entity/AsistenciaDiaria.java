package com.asistencia.attendance_system.model.entity;

import com.asistencia.attendance_system.model.enums.EstadoDia;
import com.asistencia.attendance_system.model.enums.SituacionAsistencia;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "Asistencia_Diaria")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AsistenciaDiaria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_asistencia")
    private Long idAsistencia;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_practicante", nullable = false)
    private Practicante practicante;

    @Column(name = "fecha", nullable = false)
    private LocalDate fecha;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_dia", nullable = false, length = 20, columnDefinition = "VARCHAR(20)")
    private EstadoDia estadoDia;

    @Column(name = "horas_trabajadas", columnDefinition = "DECIMAL(5,2)")
    private BigDecimal horasTrabajadas = BigDecimal.ZERO;

    @Column(name = "minutos_tardanza")
    private Integer minutosTardanza = 0;

    @Column(name = "entrada_esperada")
    private LocalTime entradaEsperada;

    @Column(name = "salida_esperada")
    private LocalTime salidaEsperada;

    @Column(name = "entrada_real")
    private LocalTime entradaReal;

    @Column(name = "salida_real")
    private LocalTime salidaReal;

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    // ========== JUSTIFICACIÓN (separada del estado) ==========
    @Column(name = "justificado")
    private Boolean justificado = false;

    @Column(name = "justificacion_motivo", columnDefinition = "TEXT")
    private String justificacionMotivo;

    @Column(name = "justificacion_observacion", columnDefinition = "TEXT")
    private String justificacionObservacion;

    @Column(name = "justificacion_fecha")
    private LocalDateTime justificacionFecha;

    @Column(name = "justificacion_tipo", length = 30)
    private String justificacionTipo; // TARDANZA | INASISTENCIA | PERMISO | SALIDA_ANTICIPADA

    @Enumerated(EnumType.STRING)
    @Column(name = "situacion", length = 35)
    private SituacionAsistencia situacion = SituacionAsistencia.NINGUNA;

    // Múltiples situaciones justificadas por asistencia (nuevo)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @OneToMany(mappedBy = "asistencia", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private Set<AsistenciaSituacion> situacionesDetalle = new HashSet<>();

    @Column(name = "fecha_calculo", nullable = false, updatable = false)
    private LocalDateTime fechaCalculo;

    @PrePersist
    protected void onCreate() {
        fechaCalculo = LocalDateTime.now();
    }
}