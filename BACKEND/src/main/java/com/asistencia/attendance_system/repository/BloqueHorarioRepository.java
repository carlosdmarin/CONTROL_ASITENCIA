package com.asistencia.attendance_system.repository;

import com.asistencia.attendance_system.model.entity.BloqueHorario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BloqueHorarioRepository extends JpaRepository<BloqueHorario, Long> {

    // Obtener horario de un practicante
    List<BloqueHorario> findByPracticanteIdPracticante(Long idPracticante);

    // Obtener horario activo de un practicante
    List<BloqueHorario> findByPracticanteIdPracticanteAndActivoTrue(Long idPracticante);

    // Eliminar todo el horario de un practicante
    void deleteByPracticanteIdPracticante(Long idPracticante);

    // Buscar por practicante y día
    List<BloqueHorario> findByPracticanteIdPracticanteAndDiaSemana(Long idPracticante, com.asistencia.attendance_system.model.enums.DiaSemana diaSemana);

    List<BloqueHorario> findByPracticanteIdPracticanteAndDiaSemanaAndActivoTrue(Long idPracticante, com.asistencia.attendance_system.model.enums.DiaSemana diaSemana);
}