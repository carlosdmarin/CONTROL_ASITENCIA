package com.asistencia.attendance_system.repository;

import com.asistencia.attendance_system.model.entity.Cargo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CargoRepository extends JpaRepository<Cargo, Long> {
    Optional<Cargo> findByNombre(String nombre);
    List<Cargo> findByActivoTrue();
}