package com.asistencia.attendance_system.service.impl;

import com.asistencia.attendance_system.excepcion.BusinessException;
import com.asistencia.attendance_system.model.entity.Puesto;
import com.asistencia.attendance_system.model.enums.Situacion;
import com.asistencia.attendance_system.repository.PracticanteRepository;
import com.asistencia.attendance_system.repository.PuestoRepository;
import com.asistencia.attendance_system.service.PuestoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class PuestoServiceImpl implements PuestoService {

    private final PuestoRepository puestoRepository;
    private final PracticanteRepository practicanteRepository;

    @Override
    public List<Puesto> findAll() {
        return puestoRepository.findAll();
    }

    @Override
    public List<Puesto> findActivos() {
        return puestoRepository.findByActivoTrue();
    }

    @Override
    public Optional<Puesto> findById(Long id) {
        return puestoRepository.findById(id);
    }

    @Override
    public Puesto save(Puesto puesto) {
        // Asegurar que fechaCreacion se establezca
        if (puesto.getFechaCreacion() == null) {
            puesto.setFechaCreacion(LocalDateTime.now());
        }
        if (puesto.getActivo() == null) {
            puesto.setActivo(true);
        }
        return puestoRepository.save(puesto);
    }

    @Override
    public Puesto update(Long id, Puesto puestoActualizado) {
        Puesto puestoExistente = puestoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Puesto no encontrado con ID: " + id));

        // Actualizar solo los campos permitidos - contrato canónico: nombreArea (nombrePuesto) + descripcion
        // Soporta alias legacy: nombreArea -> nombrePuesto, area -> descripcion
        String nuevoNombre = puestoActualizado.getNombrePuesto() != null ? puestoActualizado.getNombrePuesto() : puestoActualizado.getNombreArea();
        if (nuevoNombre != null) {
            puestoExistente.setNombrePuesto(nuevoNombre);
        }
        // descripcion es canónico; area es alias legacy que delega a descripcion
        String nuevaDesc = puestoActualizado.getDescripcion() != null ? puestoActualizado.getDescripcion() : puestoActualizado.getArea();
        if (nuevaDesc != null) {
            puestoExistente.setDescripcion(nuevaDesc);
        }
        if (puestoActualizado.getActivo() != null) {
            // Si intenta desactivar vía PUT, validar regla 1
            if (Boolean.TRUE.equals(puestoExistente.getActivo()) && Boolean.FALSE.equals(puestoActualizado.getActivo())) {
                long activos = practicanteRepository.countByPuestoAndSituacion(puestoExistente, Situacion.ACTIVO);
                if (activos > 0) {
                    throw new BusinessException(
                            "El área no puede desactivarse porque tiene " + activos + " practicante(s) activo(s) asociado(s). Desactive primero los practicantes.",
                            HttpStatus.CONFLICT);
                }
            }
            puestoExistente.setActivo(puestoActualizado.getActivo());
        }

        return puestoRepository.save(puestoExistente);
    }

    @Override
    public void delete(Long id) {
        Puesto puesto = puestoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Puesto no encontrado con ID: " + id));
        // REGLA 4: No eliminar físicamente si tiene practicantes asociados (histórico)
        long totalAsociados = practicanteRepository.countByPuesto(puesto);
        if (totalAsociados > 0) {
            throw new BusinessException(
                    "El área no puede eliminarse porque tiene " + totalAsociados + " practicante(s) asociado(s). Desactive el área en su lugar (baja lógica).",
                    HttpStatus.CONFLICT);
        }
        puestoRepository.deleteById(id);
    }

    @Override
    public Puesto activar(Long id) {
        Puesto puesto = puestoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Puesto no encontrado con ID: " + id));
        puesto.setActivo(true);
        return puestoRepository.save(puesto);
    }

    @Override
    public Puesto desactivar(Long id) {
        Puesto puesto = puestoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Puesto no encontrado con ID: " + id));
        // REGLA 1: No desactivar si tiene practicantes ACTIVO
        long activos = practicanteRepository.countByPuestoAndSituacion(puesto, Situacion.ACTIVO);
        if (activos > 0) {
            throw new BusinessException(
                    "El área no puede desactivarse porque tiene " + activos + " practicante(s) activo(s) asociado(s). Desactive primero los practicantes.",
                    HttpStatus.CONFLICT);
        }
        puesto.setActivo(false);
        return puestoRepository.save(puesto);
    }

    @Override
    public boolean existsById(Long id) {
        return puestoRepository.existsById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.Map<Long, Long> countActivosGrouped() {
        List<Object[]> rows = practicanteRepository.countByAreaAndSituacion(Situacion.ACTIVO);
        java.util.Map<Long, Long> map = new java.util.HashMap<>();
        for (Object[] row : rows) {
            Long idArea = (Long) row[0];
            Long cnt = (Long) row[1];
            map.put(idArea, cnt);
        }
        return map;
    }
}