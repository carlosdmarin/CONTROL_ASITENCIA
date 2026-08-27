package com.asistencia.attendance_system.repository;

import com.asistencia.attendance_system.model.entity.Agencia;
import com.asistencia.attendance_system.model.entity.Practicante;
import com.asistencia.attendance_system.model.enums.Situacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PracticanteRepository extends JpaRepository<Practicante, Long> {

    Optional<Practicante> findByCodigoTrabajador(String codigoTrabajador);

    Optional<Practicante> findByDocumento(String documento);

    List<Practicante> findBySituacion(Situacion situacion);

    @Query("SELECT p FROM Practicante p WHERE LOWER(p.nombre) LIKE LOWER(CONCAT('%', :termino, '%')) OR LOWER(p.apellido) LIKE LOWER(CONCAT('%', :termino, '%'))")
    List<Practicante> buscarPorNombreOApellido(@Param("termino") String termino);

    @Query("SELECT COUNT(p) FROM Practicante p WHERE p.agencia = :agencia AND p.situacion = 'ACTIVO'")
    Long countActivosByAgencia(@Param("agencia") Agencia agencia);
}