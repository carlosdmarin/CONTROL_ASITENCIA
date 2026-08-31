package com.asistencia.attendance_system.repository;

import com.asistencia.attendance_system.model.entity.BloqueHorario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BloqueHorarioRepository extends JpaRepository<BloqueHorario, Long> {

    // Obtener horario de un practicante - con _ para propiedad anidada
    List<BloqueHorario> findByPracticante_IdPracticante(Long idPracticante);

    // Obtener horario activo de un practicante
    List<BloqueHorario> findByPracticante_IdPracticanteAndActivoTrue(Long idPracticante);

    // Eliminar todo el horario de un practicante
    void deleteByPracticante_IdPracticante(Long idPracticante);

    // Buscar por practicante y día
    List<BloqueHorario> findByPracticante_IdPracticanteAndDiaSemana(Long idPracticante, com.asistencia.attendance_system.model.enums.DiaSemana diaSemana);

    List<BloqueHorario> findByPracticante_IdPracticanteAndDiaSemanaAndActivoTrue(Long idPracticante, com.asistencia.attendance_system.model.enums.DiaSemana diaSemana);

    // Alias para compatibilidad con código antiguo sin _
    default List<BloqueHorario> findByPracticanteIdPracticante(Long id) { return findByPracticante_IdPracticante(id); }
    default List<BloqueHorario> findByPracticanteIdPracticanteAndActivoTrue(Long id) { return findByPracticante_IdPracticanteAndActivoTrue(id); }
    default void deleteByPracticanteIdPracticante(Long id) { deleteByPracticante_IdPracticante(id); }
    default List<BloqueHorario> findByPracticanteIdPracticanteAndDiaSemana(Long id, com.asistencia.attendance_system.model.enums.DiaSemana d) { return findByPracticante_IdPracticanteAndDiaSemana(id, d); }
    default List<BloqueHorario> findByPracticanteIdPracticanteAndDiaSemanaAndActivoTrue(Long id, com.asistencia.attendance_system.model.enums.DiaSemana d) { return findByPracticante_IdPracticanteAndDiaSemanaAndActivoTrue(id, d); }
}