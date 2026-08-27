package com.asistencia.attendance_system.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "Configuracion_Sistema")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConfiguracionSistema {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_config")
    private Long idConfig;

    @Column(name = "clave", unique = true, nullable = false, length = 50)
    private String clave;

    @Column(name = "valor", nullable = false, length = 255)
    private String valor;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    @PreUpdate
    protected void onUpdate() {
        fechaActualizacion = LocalDateTime.now();
    }
}