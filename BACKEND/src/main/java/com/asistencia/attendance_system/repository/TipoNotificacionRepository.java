package com.asistencia.attendance_system.repository;

import com.asistencia.attendance_system.model.entity.TipoNotificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TipoNotificacionRepository extends JpaRepository<TipoNotificacion, Long> {
    Optional<TipoNotificacion> findByNombre(String nombre);
    List<TipoNotificacion> findByActivoTrue();
}