package com.asistencia.attendance_system.repository;

import com.asistencia.attendance_system.model.entity.AsistenciaSituacion;
import com.asistencia.attendance_system.model.enums.SituacionAsistencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AsistenciaSituacionRepository extends JpaRepository<AsistenciaSituacion, Long> {

    List<AsistenciaSituacion> findByAsistencia_IdAsistencia(Long idAsistencia);

    Optional<AsistenciaSituacion> findByAsistencia_IdAsistenciaAndTipo(Long idAsistencia, SituacionAsistencia tipo);

    boolean existsByAsistencia_IdAsistenciaAndTipo(Long idAsistencia, SituacionAsistencia tipo);
}
