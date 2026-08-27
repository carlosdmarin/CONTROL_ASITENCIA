package com.asistencia.attendance_system.repository;

import com.asistencia.attendance_system.model.entity.BloqueHorario;
import com.asistencia.attendance_system.model.enums.TipoBloque;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BloqueHorarioRepository extends JpaRepository<BloqueHorario, Long> {

    // ========== BÚSQUEDAS BÁSICAS ==========

    List<BloqueHorario> findByPracticante_IdPracticante(Long idPracticante);

    List<BloqueHorario> findByPracticante_IdPracticanteAndActivoTrue(Long idPracticante);

    List<BloqueHorario> findByDiaSemanaAndActivoTrue(String diaSemana);

    List<BloqueHorario> findByTipoBloqueAndActivoTrue(TipoBloque tipoBloque);

    // ========== BÚSQUEDAS COMBINADAS ==========

    @Query("SELECT b FROM BloqueHorario b WHERE b.practicante.idPracticante = :idPracticante AND b.diaSemana = :diaSemana AND b.activo = true")
    List<BloqueHorario> findByIdPracticanteAndDiaSemana(@Param("idPracticante") Long idPracticante, @Param("diaSemana") String diaSemana);

    @Query("SELECT b FROM BloqueHorario b WHERE b.practicante.idPracticante = :idPracticante AND b.tipoBloque = 'TRABAJO' AND b.activo = true")
    List<BloqueHorario> findBloquesTrabajoByPracticante(@Param("idPracticante") Long idPracticante);

    @Query("SELECT b FROM BloqueHorario b WHERE b.practicante.idPracticante = :idPracticante AND b.tipoBloque = 'CLASES' AND b.activo = true")
    List<BloqueHorario> findBloquesClasesByPracticante(@Param("idPracticante") Long idPracticante);

    @Query("SELECT COUNT(b) > 0 FROM BloqueHorario b WHERE b.practicante.idPracticante = :idPracticante AND b.diaSemana = :diaSemana AND b.activo = true AND :fecha BETWEEN b.fechaInicio AND COALESCE(b.fechaFin, '9999-12-31')")
    boolean existeBloqueEnFecha(@Param("idPracticante") Long idPracticante, @Param("diaSemana") String diaSemana, @Param("fecha") LocalDate fecha);

    @Query(value = "SELECT * FROM Bloque_Horario WHERE id_practicante = :idPracticante AND activo = 1 AND CURDATE() BETWEEN fecha_inicio AND COALESCE(fecha_fin, '9999-12-31') ORDER BY FIELD(dia_semana, 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'), hora_inicio", nativeQuery = true)
    List<BloqueHorario> findHorarioSemanalCompleto(@Param("idPracticante") Long idPracticante);
}