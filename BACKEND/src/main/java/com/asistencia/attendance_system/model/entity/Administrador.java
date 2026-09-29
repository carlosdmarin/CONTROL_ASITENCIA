package com.asistencia.attendance_system.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Cuenta administrativa exclusiva de PractiQR.
 * Tabla propia: practiqr_db.administradores.
 * Sin relación con sistemas corporativos externos.
 * passwordHash almacena exclusivamente hashes BCrypt.
 */
@Entity
@Table(name = "administradores",
        uniqueConstraints = @UniqueConstraint(name = "uk_administradores_usuario", columnNames = "usuario"))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Administrador {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "usuario", nullable = false, unique = true, length = 15)
    private String usuario;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;
}
