package com.asistencia.attendance_system.repository;

import com.asistencia.attendance_system.model.entity.Puesto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PuestoRepository extends JpaRepository<Puesto, Long> {

    // Buscar puestos activos
    List<Puesto> findByActivoTrue();

    // Buscar por nombre (opcional)
    List<Puesto> findByNombrePuestoContainingIgnoreCase(String nombre);

    // Buscar por área (opcional)
    List<Puesto> findByAreaContainingIgnoreCase(String area);

    // Buscar por nombre y área (opcional)
    List<Puesto> findByNombrePuestoContainingIgnoreCaseOrAreaContainingIgnoreCase(String nombre, String area);
}