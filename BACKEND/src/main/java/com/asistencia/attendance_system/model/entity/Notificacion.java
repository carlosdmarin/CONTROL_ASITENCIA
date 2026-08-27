package com.asistencia.attendance_system.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "Notificacion")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_notificacion")
    private Long idNotificacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_practicante", nullable = false)
    private Practicante practicante;

    // ✅ NUEVO: Relación con TipoNotificacion
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tipo_notificacion", nullable = false)
    private TipoNotificacion tipoNotificacion;

    @Column(name = "mensaje", nullable = false, columnDefinition = "TEXT")
    private String mensaje;

    @Column(name = "fecha_envio", nullable = false, updatable = false)
    private LocalDateTime fechaEnvio;

    @Column(name = "fecha_lectura")
    private LocalDateTime fechaLectura;

    @Column(name = "leido", nullable = false)
    private Boolean leido = false;

    @PrePersist
    protected void onCreate() {
        fechaEnvio = LocalDateTime.now();
    }
}