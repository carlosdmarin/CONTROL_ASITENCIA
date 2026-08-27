package com.asistencia.attendance_system.repository;

import com.asistencia.attendance_system.model.entity.ConfiguracionSistema;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ConfiguracionSistemaRepository extends JpaRepository<ConfiguracionSistema, Long> {

    // Buscar configuración por clave
    Optional<ConfiguracionSistema> findByClave(String clave);

    // Buscar valor de una configuración específica
    @Query("SELECT c.valor FROM ConfiguracionSistema c WHERE c.clave = :clave")
    String findValorByClave(String clave);
}