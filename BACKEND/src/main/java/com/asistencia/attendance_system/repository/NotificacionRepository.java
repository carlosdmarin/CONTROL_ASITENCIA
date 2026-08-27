package com.asistencia.attendance_system.repository;

import com.asistencia.attendance_system.model.entity.Notificacion;
import com.asistencia.attendance_system.model.enums.TipoNotificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {

    // ========== BÚSQUEDAS BÁSICAS ==========

    List<Notificacion> findByPracticante_IdPracticante(Long idPracticante);

    List<Notificacion> findByPracticante_IdPracticanteAndLeidoFalse(Long idPracticante);

    List<Notificacion> findByTipoNotificacion(TipoNotificacion tipoNotificacion);

    // ========== BÚSQUEDAS COMBINADAS ==========

    @Query("SELECT COUNT(n) FROM Notificacion n WHERE n.practicante.idPracticante = :idPracticante AND n.leido = false")
    Long countNotificacionesNoLeidas(@Param("idPracticante") Long idPracticante);

    @Query("SELECT n FROM Notificacion n WHERE n.practicante.idPracticante = :idPracticante ORDER BY n.fechaEnvio DESC LIMIT 10")
    List<Notificacion> findRecentByPracticante(@Param("idPracticante") Long idPracticante);

    List<Notificacion> findByPracticante_IdPracticanteAndLeidoFalseAndTipoNotificacion(Long idPracticante, TipoNotificacion tipoNotificacion);
}