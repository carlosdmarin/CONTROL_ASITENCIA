package com.asistencia.attendance_system.service.impl;

import com.asistencia.attendance_system.model.entity.Puesto;
import com.asistencia.attendance_system.repository.PuestoRepository;
import com.asistencia.attendance_system.service.PuestoService;
import lombok.RequiredArgsConstructor;
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

        // Actualizar solo los campos permitidos
        if (puestoActualizado.getNombrePuesto() != null) {
            puestoExistente.setNombrePuesto(puestoActualizado.getNombrePuesto());
        }
        if (puestoActualizado.getArea() != null) {
            puestoExistente.setArea(puestoActualizado.getArea());
        }
        if (puestoActualizado.getDescripcion() != null) {
            puestoExistente.setDescripcion(puestoActualizado.getDescripcion());
        }
        if (puestoActualizado.getActivo() != null) {
            puestoExistente.setActivo(puestoActualizado.getActivo());
        }

        return puestoRepository.save(puestoExistente);
    }

    @Override
    public void delete(Long id) {
        if (!puestoRepository.existsById(id)) {
            throw new RuntimeException("Puesto no encontrado con ID: " + id);
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
        puesto.setActivo(false);
        return puestoRepository.save(puesto);
    }

    @Override
    public boolean existsById(Long id) {
        return puestoRepository.existsById(id);
    }
}