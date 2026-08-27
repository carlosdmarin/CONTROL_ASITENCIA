package com.asistencia.attendance_system.repository;

import com.asistencia.attendance_system.model.entity.TipoInstituto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TipoInstitutoRepository extends JpaRepository<TipoInstituto, Long> {
    Optional<TipoInstituto> findByNombre(String nombre);
    List<TipoInstituto> findByActivoTrue();
}