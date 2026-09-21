package com.asistencia.attendance_system.repository;

import com.asistencia.attendance_system.model.entity.Oficina;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OficinaRepository extends JpaRepository<Oficina, Integer> {

    List<Oficina> findByEstado(Integer estado);

    default List<Oficina> findByActivoTrue() {
        return findByEstado(1);
    }
}
