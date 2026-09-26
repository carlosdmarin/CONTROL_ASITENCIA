package com.asistencia.attendance_system.repository;

import com.asistencia.attendance_system.model.entity.Vigilante;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VigilanteRepository extends JpaRepository<Vigilante, Integer> {

    Optional<Vigilante> findByUsuario(String usuario);

    Optional<Vigilante> findByUsuarioAndEstado(String usuario, Boolean estado);

    @Override
    @EntityGraph(attributePaths = "sede")
    List<Vigilante> findAll();
}
