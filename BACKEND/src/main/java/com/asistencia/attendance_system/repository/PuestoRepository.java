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

    // Buscar por descripcion (canónico)
    List<Puesto> findByDescripcionContainingIgnoreCase(String descripcion);

    // Buscar por nombre y descripcion (canónico)
    List<Puesto> findByNombrePuestoContainingIgnoreCaseOrDescripcionContainingIgnoreCase(String nombre, String descripcion);

    // Compat legacy: búsqueda por area (delegada a descripcion)
    @Deprecated
    default List<Puesto> findByAreaContainingIgnoreCase(String area) {
        return findByDescripcionContainingIgnoreCase(area);
    }

    @Deprecated
    default List<Puesto> findByNombrePuestoContainingIgnoreCaseOrAreaContainingIgnoreCase(String nombre, String area) {
        return findByNombrePuestoContainingIgnoreCaseOrDescripcionContainingIgnoreCase(nombre, area);
    }
}