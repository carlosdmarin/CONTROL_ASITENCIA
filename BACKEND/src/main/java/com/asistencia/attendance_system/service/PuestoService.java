package com.asistencia.attendance_system.service;

import com.asistencia.attendance_system.model.entity.Puesto;
import java.util.List;
import java.util.Optional;

public interface PuestoService {
    List<Puesto> findAll();
    List<Puesto> findActivos();
    Optional<Puesto> findById(Long id);
    Puesto save(Puesto puesto);
    Puesto update(Long id, Puesto puesto);
    void delete(Long id);
    Puesto activar(Long id);
    Puesto desactivar(Long id);
    boolean existsById(Long id);
}