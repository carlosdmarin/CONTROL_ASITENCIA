package com.asistencia.attendance_system.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * Entidad para tabla existente one_db.vigilante
 * Mapeo verificado contra DESCRIBE vigilante (2026-09-23) + ALTER 2026-09-24 + ALTER 2026-09-25 sede_id:
 *  id_vigilante int(11) PK auto_increment
 *  nombre varchar(100) NOT NULL
 *  apellido varchar(100) NOT NULL
 *  usuario varchar(50) UNIQUE NOT NULL
 *  contrasena varchar(255) NOT NULL
 *  Estado tinyint(1) NOT NULL DEFAULT 1 (1=ACTIVO, 0=INACTIVO)
 *  sede_id int(11) NULL FK -> sedes.IdSede (FK_vigilante_sede) ON UPDATE CASCADE ON DELETE RESTRICT
 */
@Entity
@Table(name = "vigilante")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Vigilante {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_vigilante")
    private Integer idVigilante;

    @Column(name = "nombre", nullable = false, length = 100)
    private String nombre;

    @Column(name = "apellido", nullable = false, length = 100)
    private String apellido;

    @Column(name = "usuario", nullable = false, unique = true, length = 50)
    private String usuario;

    @Column(name = "contrasena", nullable = false, length = 255)
    private String contrasena;

    @Column(name = "Estado", nullable = false, columnDefinition = "TINYINT(1)")
    private Boolean estado = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sede_id", referencedColumnName = "IdSede", foreignKey = @ForeignKey(name = "FK_vigilante_sede"))
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Sede sede;
}
