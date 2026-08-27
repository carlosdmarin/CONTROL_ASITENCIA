package com.asistencia.attendance_system.model.entity;

import com.asistencia.attendance_system.model.enums.EstadoDia;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

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
    @Column(name = "estado_dia", nullable = false)
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

    @Column(name = "fecha_calculo", nullable = false, updatable = false)
    private LocalDateTime fechaCalculo;

    @PrePersist
    protected void onCreate() {
        fechaCalculo = LocalDateTime.now();
    }
}