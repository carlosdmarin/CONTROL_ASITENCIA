package com.asistencia.attendance_system.repository;

import com.asistencia.attendance_system.model.entity.Trabajador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TrabajadorRepository extends JpaRepository<Trabajador, Integer> {

    Optional<Trabajador> findByUsuario(String usuario);

    Optional<Trabajador> findByEmail(String email);

    Optional<Trabajador> findByNroDoc(String nroDoc);

    Optional<Trabajador> findByCodTrab(String codTrab);
}
