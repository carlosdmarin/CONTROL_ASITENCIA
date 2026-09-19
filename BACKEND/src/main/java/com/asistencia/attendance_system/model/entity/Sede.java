package com.asistencia.attendance_system.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "sedes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Sede {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdSede")
    private Integer idSede;

    // Alias compatibilidad: código/frontend antiguo usa idAgencia
    public Integer getIdAgencia() { return idSede; }
    public void setIdAgencia(Integer idAgencia) { this.idSede = idAgencia; }

    // FASE 6.1: columna oficial OLAMSA es `Sede` (varchar 45), no `nombre` (vacía en datos reales)
    @Column(name = "Sede", nullable = false, length = 45)
    private String nombre;

    @Column(name = "descripcion", length = 255)
    private String descripcion;

    @Column(name = "activo", nullable = false)
    private Boolean activo = true;

    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;

    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
    }
}