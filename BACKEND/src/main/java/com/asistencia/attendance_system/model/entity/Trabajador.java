package com.asistencia.attendance_system.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entidad de solo lectura para tabla existente one_db.trabajadores
 * Mapeo verificado contra DESCRIBE trabajadores (2026-09-23) — 63 tablas en one_db
 * Solo se mapean columnas necesarias para futura autenticación RRHH.
 * Columnas reales: IdTrabajador int PK, CodTrab varchar(10) NOT NULL, Nombres varchar(45), Apellidos varchar(45),
 * NroDoc varchar(15), Email varchar(100), Usuario varchar(15), PasswordUser varchar(255), Estado int(1), EstadoUsuario int(1), IdRol int, IdSede int, etc.
 * No se modifica la tabla. No se exponen hashes en logs.
 */
@Entity
@Table(name = "trabajadores")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Trabajador {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdTrabajador")
    private Integer idTrabajador;

    @Column(name = "CodTrab", nullable = false, length = 10)
    private String codTrab;

    @Column(name = "Nombres", nullable = false, length = 45)
    private String nombres;

    @Column(name = "Apellidos", nullable = false, length = 45)
    private String apellidos;

    @Column(name = "NroDoc", nullable = false, length = 15)
    private String nroDoc;

    @Column(name = "Email", length = 100)
    private String email;

    @Column(name = "Usuario", nullable = false, length = 15)
    private String usuario;

    @Column(name = "PasswordUser", nullable = false, length = 255)
    private String passwordUser;

    @Column(name = "Estado", nullable = false)
    private Integer estado;

    @Column(name = "EstadoUsuario", nullable = false)
    private Integer estadoUsuario;

    @Column(name = "IdRol", nullable = false)
    private Integer idRol;

    @Column(name = "IdSede")
    private Integer idSede;
}
