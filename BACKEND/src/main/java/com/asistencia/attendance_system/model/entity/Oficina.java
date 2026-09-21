package com.asistencia.attendance_system.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "oficinas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Oficina {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdOficina")
    private Integer idOficina;

    @Column(name = "Oficina", nullable = false, length = 100)
    private String oficina;

    @Column(name = "Estado", nullable = false)
    private Integer estado;

    @Column(name = "CREATEDATE", insertable = false, updatable = false)
    private LocalDateTime createdDate;

    @Column(name = "UPDATEDATE", insertable = false, updatable = false)
    private LocalDateTime updatedDate;

    @Column(name = "IdOficinaSup")
    private Integer idOficinaSup;

    @Column(name = "IdSede")
    private Integer idSede;
}
