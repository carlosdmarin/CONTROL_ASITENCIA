package com.asistencia.attendance_system.repository;

import com.asistencia.attendance_system.model.entity.Agencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AgenciaRepository extends JpaRepository<Agencia, Long> {
    Optional<Agencia> findByNombre(String nombre);
    List<Agencia> findByActivoTrue();
}