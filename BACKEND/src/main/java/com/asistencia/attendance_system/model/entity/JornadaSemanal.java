package com.asistencia.attendance_system.model.entity;

import com.asistencia.attendance_system.model.enums.EstadoSemanal;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "Jornada_Semanal")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class JornadaSemanal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_jornada")
    private Long idJornada;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_practicante", nullable = false)
    private Practicante practicante;

    @Column(name = "semana_inicio", nullable = false)
    private LocalDate semanaInicio;  // ✅ Campo correcto

    @Column(name = "horas_requeridas", nullable = false, columnDefinition = "DECIMAL(5,2)")
    private BigDecimal horasRequeridas;

    @Column(name = "horas_cumplidas", columnDefinition = "DECIMAL(5,2)")
    private BigDecimal horasCumplidas = BigDecimal.ZERO;

    @Column(name = "horas_pendientes", columnDefinition = "DECIMAL(5,2)")
    private BigDecimal horasPendientes = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_semanal", nullable = false)
    private EstadoSemanal estadoSemanal = EstadoSemanal.INCOMPLETO;

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    @Column(name = "fecha_calculo", nullable = false, updatable = false)
    private LocalDateTime fechaCalculo;

    @PrePersist
    protected void onCreate() {
        fechaCalculo = LocalDateTime.now();
    }
}