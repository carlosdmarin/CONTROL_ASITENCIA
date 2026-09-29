package com.asistencia.attendance_system.repository;

import com.asistencia.attendance_system.model.entity.Administrador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdministradorRepository extends JpaRepository<Administrador, Long> {

    Optional<Administrador> findByUsuario(String usuario);

    boolean existsByUsuario(String usuario);
}
