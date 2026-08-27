package com.asistencia.attendance_system.repository;

import com.asistencia.attendance_system.model.entity.Sede;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SedeRepository extends JpaRepository<Sede, Long> {
    Optional<Sede> findByNombre(String nombre);
    List<Sede> findByActivoTrue();
}