package com.asistencia.attendance_system.model.entity;

import com.asistencia.attendance_system.model.enums.MetodoRegistro;
import com.asistencia.attendance_system.model.enums.TipoMarcacion;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "Marcacion")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Marcacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_marcacion")
    private Long idMarcacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_practicante", nullable = false)
    private Practicante practicante;

    @Column(name = "fecha", nullable = false)
    private LocalDate fecha;

    @Column(name = "hora_marcacion", nullable = false)
    private LocalTime horaMarcacion;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_marcacion", nullable = false)
    private TipoMarcacion tipoMarcacion;

    @Enumerated(EnumType.STRING)
    @Column(name = "metodo_registro", nullable = false)
    private MetodoRegistro metodoRegistro = MetodoRegistro.QR;

    @Column(name = "codigo_qr", length = 50)
    private String codigoQr;

    @Column(name = "latitud")
    private Double latitud;

    @Column(name = "longitud")
    private Double longitud;

    @Column(name = "ip_origen", length = 45)
    private String ipOrigen;

    @Column(name = "user_agent", length = 255)
    private String userAgent;

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    @Column(name = "fecha_registro", nullable = false, updatable = false)
    private LocalDateTime fechaRegistro;

    @PrePersist
    protected void onCreate() {
        fechaRegistro = LocalDateTime.now();
    }
}