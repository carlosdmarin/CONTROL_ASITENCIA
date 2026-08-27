package com.asistencia.attendance_system.repository;

import com.asistencia.attendance_system.model.entity.Justificacion;
import com.asistencia.attendance_system.model.enums.EstadoJustificacion;
import com.asistencia.attendance_system.model.enums.TipoJustificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface JustificacionRepository extends JpaRepository<Justificacion, Long> {

    // ========== BÚSQUEDAS BÁSICAS ==========

    List<Justificacion> findByPracticante_IdPracticante(Long idPracticante);

    List<Justificacion> findByEstado(EstadoJustificacion estado);

    List<Justificacion> findByTipoJustificacion(TipoJustificacion tipoJustificacion);

    // ========== BÚSQUEDAS COMBINADAS ==========

    List<Justificacion> findByPracticante_IdPracticanteAndEstado(Long idPracticante, EstadoJustificacion estado);

    @Query("SELECT j FROM Justificacion j WHERE j.practicante.idPracticante = :idPracticante AND j.fechaInicio <= :fechaFin AND j.fechaFin >= :fechaInicio")
    List<Justificacion> findJustificacionesEnRango(@Param("idPracticante") Long idPracticante, @Param("fechaInicio") LocalDate fechaInicio, @Param("fechaFin") LocalDate fechaFin);

    List<Justificacion> findByEstadoAndFechaAprobacionBetween(EstadoJustificacion estado, LocalDate fechaInicio, LocalDate fechaFin);
}