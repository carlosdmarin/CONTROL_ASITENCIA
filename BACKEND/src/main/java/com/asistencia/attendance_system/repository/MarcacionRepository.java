package com.asistencia.attendance_system.repository;

import com.asistencia.attendance_system.model.entity.Marcacion;
import com.asistencia.attendance_system.model.enums.TipoMarcacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface MarcacionRepository extends JpaRepository<Marcacion, Long> {

    // ========== BÚSQUEDAS BÁSICAS ==========

    List<Marcacion> findByPracticante_IdPracticante(Long idPracticante);

    List<Marcacion> findByPracticante_IdPracticanteAndFecha(Long idPracticante, LocalDate fecha);

    List<Marcacion> findByTipoMarcacion(TipoMarcacion tipoMarcacion);

    List<Marcacion> findByMetodoRegistro(String metodoRegistro);

    // ========== BÚSQUEDAS COMBINADAS ==========

    List<Marcacion> findByPracticante_IdPracticanteAndFechaBetween(Long idPracticante, LocalDate fechaInicio, LocalDate fechaFin);

    @Query("SELECT m FROM Marcacion m WHERE m.practicante.idPracticante = :idPracticante AND m.fecha = :fecha ORDER BY m.horaMarcacion DESC LIMIT 1")
    Optional<Marcacion> findUltimaMarcacionDelDia(@Param("idPracticante") Long idPracticante, @Param("fecha") LocalDate fecha);

    @Query("SELECT m FROM Marcacion m WHERE m.practicante.idPracticante = :idPracticante AND m.fecha = :fecha AND m.tipoMarcacion = 'ENTRADA' ORDER BY m.horaMarcacion ASC LIMIT 1")
    Optional<Marcacion> findEntradaDelDia(@Param("idPracticante") Long idPracticante, @Param("fecha") LocalDate fecha);

    @Query("SELECT m FROM Marcacion m WHERE m.practicante.idPracticante = :idPracticante AND m.fecha = :fecha AND m.tipoMarcacion = 'SALIDA' ORDER BY m.horaMarcacion DESC LIMIT 1")
    Optional<Marcacion> findSalidaDelDia(@Param("idPracticante") Long idPracticante, @Param("fecha") LocalDate fecha);

    @Query("SELECT COUNT(m) > 0 FROM Marcacion m WHERE m.practicante.idPracticante = :idPracticante AND m.fecha = :fecha AND m.tipoMarcacion = 'ENTRADA'")
    boolean yaMarcoEntradaHoy(@Param("idPracticante") Long idPracticante, @Param("fecha") LocalDate fecha);

    @Query("SELECT COUNT(m) > 0 FROM Marcacion m WHERE m.practicante.idPracticante = :idPracticante AND m.fecha = :fecha AND m.tipoMarcacion = 'SALIDA'")
    boolean yaMarcoSalidaHoy(@Param("idPracticante") Long idPracticante, @Param("fecha") LocalDate fecha);

    // ========== QUERYS CON SQL NATIVO ==========

    @Query(value = "SELECT m.*, p.nombre, p.apellido FROM Marcacion m INNER JOIN Practicante p ON m.id_practicante = p.id_practicante WHERE m.fecha = :fecha ORDER BY m.hora_marcacion DESC", nativeQuery = true)
    List<Object[]> findMarcacionesDelDiaConDetalles(@Param("fecha") LocalDate fecha);

    @Query(value = "SELECT tipo_marcacion, COUNT(*) FROM Marcacion WHERE fecha = :fecha GROUP BY tipo_marcacion", nativeQuery = true)
    List<Object[]> countMarcacionesByTipo(@Param("fecha") LocalDate fecha);
}