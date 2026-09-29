package com.asistencia.attendance_system.repository;

import com.asistencia.attendance_system.model.entity.TipoPracticante;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TipoPracticanteRepository extends JpaRepository<TipoPracticante, Long> {
}
