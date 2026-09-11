package com.asistencia.attendance_system.model.entity;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "Area")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Puesto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_area")
    @JsonAlias({"idArea", "id_area"})
    private Long idPuesto;

    @Column(name = "nombre_area", nullable = false, length = 100)
    @JsonAlias({"nombreArea", "nombre_area"})
    private String nombrePuesto;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    @JsonAlias({"area"})
    private String descripcion;

    // ====== Compatibilidad temporal: alias para código legacy que usa getArea()/setArea() ======
    // Nuevo contrato usa descripcion directamente; getArea/setArea delegan a descripcion
    public String getArea() { return descripcion; }
    public void setArea(String area) { this.descripcion = area; }

    // ====== Alias canónico Area: idArea / nombreArea ======
    public Long getIdArea() { return idPuesto; }
    public void setIdArea(Long idArea) { this.idPuesto = idArea; }

    public String getNombreArea() { return nombrePuesto; }
    public void setNombreArea(String nombreArea) { this.nombrePuesto = nombreArea; }

    @Column(name = "activo", nullable = false)
    private Boolean activo = true;

    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
    }
}