package com.asistencia.attendance_system.repository;

import com.asistencia.attendance_system.model.entity.AsistenciaDiaria;
import com.asistencia.attendance_system.model.enums.EstadoDia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AsistenciaDiariaRepository extends JpaRepository<AsistenciaDiaria, Long> {

    // ========== BÚSQUEDAS BÁSICAS ==========

    List<AsistenciaDiaria> findByPracticante_IdPracticante(Long idPracticante);

    Optional<AsistenciaDiaria> findByPracticante_IdPracticanteAndFecha(Long idPracticante, LocalDate fecha);

    List<AsistenciaDiaria> findByEstadoDia(EstadoDia estadoDia);

    // ========== BÚSQUEDAS COMBINADAS ==========

    List<AsistenciaDiaria> findByPracticante_IdPracticanteAndFechaBetween(Long idPracticante, LocalDate fechaInicio, LocalDate fechaFin);

    List<AsistenciaDiaria> findByMinutosTardanzaGreaterThan(Integer minutos);

    List<AsistenciaDiaria> findByPracticante_IdPracticanteAndMinutosTardanzaGreaterThanAndFechaBetween(
            Long idPracticante, Integer minutos, LocalDate fechaInicio, LocalDate fechaFin);

    // ========== QUERYS CON JPQL ==========

    @Query("SELECT SUM(a.horasTrabajadas) FROM AsistenciaDiaria a WHERE a.practicante.idPracticante = :idPracticante AND FUNCTION('YEAR', a.fecha) = :anio AND FUNCTION('MONTH', a.fecha) = :mes")
    Double sumHorasTrabajadasEnMes(@Param("idPracticante") Long idPracticante, @Param("anio") Integer anio, @Param("mes") Integer mes);

    @Query("SELECT COUNT(a) FROM AsistenciaDiaria a WHERE a.practicante.idPracticante = :idPracticante AND a.estadoDia = 'FALTA' AND FUNCTION('YEAR', a.fecha) = :anio AND FUNCTION('MONTH', a.fecha) = :mes")
    Long countFaltasEnMes(@Param("idPracticante") Long idPracticante, @Param("anio") Integer anio, @Param("mes") Integer mes);

    @Query("SELECT COUNT(a) FROM AsistenciaDiaria a WHERE a.practicante.idPracticante = :idPracticante AND a.estadoDia = 'TARDE' AND FUNCTION('YEAR', a.fecha) = :anio AND FUNCTION('MONTH', a.fecha) = :mes")
    Long countTardanzasEnMes(@Param("idPracticante") Long idPracticante, @Param("anio") Integer anio, @Param("mes") Integer mes);

    // ========== QUERYS CON SQL NATIVO ==========

    @Query(value = "SELECT p.id_agencia, COUNT(*) as total, SUM(CASE WHEN ad.estado_dia = 'PRESENTE' THEN 1 ELSE 0 END) as presentes, SUM(CASE WHEN ad.estado_dia = 'FALTA' THEN 1 ELSE 0 END) as faltas FROM Asistencia_Diaria ad INNER JOIN Practicante p ON ad.id_practicante = p.id_practicante WHERE YEAR(ad.fecha) = :anio AND MONTH(ad.fecha) = :mes GROUP BY p.id_agencia", nativeQuery = true)
    List<Object[]> getResumenAsistenciasPorSede(@Param("anio") Integer anio, @Param("mes") Integer mes);

    // Alias compatibilidad
    default List<Object[]> getResumenAsistenciasPorAgencia(Integer anio, Integer mes) {
        return getResumenAsistenciasPorSede(anio, mes);
    }
}