package com.asistencia.attendance_system.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entidad para tabla existente one_db.vigilante
 * Mapeo verificado contra DESCRIBE vigilante (2026-09-23) + ALTER 2026-09-24:
 *  id_vigilante int(11) PK auto_increment
 *  nombre varchar(100) NOT NULL
 *  apellido varchar(100) NOT NULL
 *  usuario varchar(50) UNIQUE NOT NULL
 *  contrasena varchar(255) NOT NULL
 *  Estado tinyint(1) NOT NULL DEFAULT 1 (1=ACTIVO, 0=INACTIVO)
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
}
