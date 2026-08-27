package com.asistencia.attendance_system.repository;

import com.asistencia.attendance_system.model.entity.JornadaSemanal;
import com.asistencia.attendance_system.model.enums.EstadoSemanal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface JornadaSemanalRepository extends JpaRepository<JornadaSemanal, Long> {

    // ========== BÚSQUEDAS BÁSICAS ==========

    List<JornadaSemanal> findByPracticante_IdPracticante(Long idPracticante);

    Optional<JornadaSemanal> findByPracticante_IdPracticanteAndSemanaInicio(Long idPracticante, LocalDate semanaInicio);

    List<JornadaSemanal> findByEstadoSemanal(EstadoSemanal estadoSemanal);

    // ========== BÚSQUEDAS COMBINADAS ==========

    @Query("SELECT j FROM JornadaSemanal j WHERE j.practicante.idPracticante = :idPracticante AND j.estadoSemanal = 'INCOMPLETO'")
    List<JornadaSemanal> findJornadasIncompletasByPracticante(@Param("idPracticante") Long idPracticante);

    // ✅ CORREGIDO: Usar @Query para evitar problemas de nombres
    @Query("SELECT j FROM JornadaSemanal j WHERE j.semanaInicio = :semanaInicio")
    List<JornadaSemanal> findBySemanaInicio(@Param("semanaInicio") LocalDate semanaInicio);

    // ========== QUERYS CON JPQL ==========

    @Query("SELECT AVG(j.horasCumplidas) FROM JornadaSemanal j WHERE j.practicante.idPracticante = :idPracticante")
    Double getPromedioHorasSemanales(@Param("idPracticante") Long idPracticante);

    @Query("SELECT COUNT(j) FROM JornadaSemanal j WHERE j.practicante.idPracticante = :idPracticante AND j.estadoSemanal = 'CUMPLIDO'")
    Long countSemanasCompletas(@Param("idPracticante") Long idPracticante);
}