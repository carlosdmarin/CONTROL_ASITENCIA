package com.asistencia.attendance_system.service.impl;

import com.asistencia.attendance_system.model.dto.BloqueHorarioRequest;
import com.asistencia.attendance_system.model.dto.PracticanteRequest;
import com.asistencia.attendance_system.model.dto.PracticanteResponse;
import com.asistencia.attendance_system.model.entity.*;
import com.asistencia.attendance_system.model.enums.DiaSemana;
import com.asistencia.attendance_system.model.enums.Situacion;
import com.asistencia.attendance_system.model.enums.TipoBloque;
import com.asistencia.attendance_system.repository.*;
import com.asistencia.attendance_system.service.PracticanteService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PracticanteServiceImpl implements PracticanteService {

    private final PracticanteRepository practicanteRepository;
    private final PuestoRepository puestoRepository;
    private final SedeRepository sedeRepository;
    private final CargoRepository cargoRepository;
    private final TipoInstitutoRepository tipoInstitutoRepository;
    private final BloqueHorarioRepository bloqueHorarioRepository;

    // ====== MÉTODOS PRINCIPALES ======

    @Override
    public PracticanteResponse crear(PracticanteRequest request) {
        log.info("Creando nuevo practicante: {}", request.getDocumento());

        if (practicanteRepository.findByDocumento(request.getDocumento()).isPresent()) {
            throw new RuntimeException("Ya existe un practicante con el documento: " + request.getDocumento());
        }

        Sede sede = sedeRepository.findById(request.getIdSede())
                .orElseThrow(() -> new RuntimeException("Sede no encontrada con ID: " + request.getIdSede()));

        Puesto puesto = puestoRepository.findById(request.getIdPuesto())
                .orElseThrow(() -> new RuntimeException("Puesto no encontrado con ID: " + request.getIdPuesto()));

        TipoInstituto tipoInstituto = tipoInstitutoRepository.findById(request.getIdTipoInstituto())
                .orElseThrow(() -> new RuntimeException("Tipo de instituto no encontrado con ID: " + request.getIdTipoInstituto()));

        Cargo cargo = cargoRepository.findById(request.getIdCargo())
                .orElseThrow(() -> new RuntimeException("Cargo no encontrado con ID: " + request.getIdCargo()));

        // 1. Crear el practicante
        Practicante practicante = new Practicante();
        practicante.setNombre(request.getNombre());
        practicante.setApellido(request.getApellido());
        practicante.setDocumento(request.getDocumento());
        practicante.setSede(sede);
        practicante.setPuesto(puesto);
        practicante.setTipoInstituto(tipoInstituto);
        practicante.setCargo(cargo);
        practicante.setSituacion(Situacion.ACTIVO);
        practicante.setCorreoElectronico(request.getCorreoElectronico());
        practicante.setTelefono(request.getTelefono());
        practicante.setFechaInicioPracticas(request.getFechaInicioPracticas());
        practicante.setFechaFinPracticas(request.getFechaFinPracticas());

        // 2. Guardar el practicante para obtener su ID
        Practicante saved = practicanteRepository.save(practicante);
        log.info("Practicante creado con ID: {}", saved.getIdPracticante());

        // 3. Guardar el horario (si existe)
        if (request.getHorario() != null && !request.getHorario().isEmpty()) {
            guardarHorario(saved, request.getHorario());
        }

        return convertToResponse(saved);
    }

    @Override
    public PracticanteResponse actualizar(Long id, PracticanteRequest request) {
        log.info("Actualizando practicante ID: {}", id);

        Practicante practicante = practicanteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Practicante no encontrado con ID: " + id));

        Sede sede = sedeRepository.findById(request.getIdSede())
                .orElseThrow(() -> new RuntimeException("Sede no encontrada con ID: " + request.getIdSede()));

        Puesto puesto = puestoRepository.findById(request.getIdPuesto())
                .orElseThrow(() -> new RuntimeException("Puesto no encontrado con ID: " + request.getIdPuesto()));

        TipoInstituto tipoInstituto = tipoInstitutoRepository.findById(request.getIdTipoInstituto())
                .orElseThrow(() -> new RuntimeException("Tipo de instituto no encontrado con ID: " + request.getIdTipoInstituto()));

        Cargo cargo = cargoRepository.findById(request.getIdCargo())
                .orElseThrow(() -> new RuntimeException("Cargo no encontrado con ID: " + request.getIdCargo()));

        // 1. Actualizar datos del practicante
        practicante.setNombre(request.getNombre());
        practicante.setApellido(request.getApellido());
        practicante.setDocumento(request.getDocumento());
        practicante.setSede(sede);
        practicante.setPuesto(puesto);
        practicante.setTipoInstituto(tipoInstituto);
        practicante.setCargo(cargo);
        practicante.setCorreoElectronico(request.getCorreoElectronico());
        practicante.setTelefono(request.getTelefono());
        practicante.setFechaInicioPracticas(request.getFechaInicioPracticas());
        practicante.setFechaFinPracticas(request.getFechaFinPracticas());

        Practicante updated = practicanteRepository.save(practicante);
        log.info("Practicante actualizado: {}", updated.getDocumento());

        // 2. Actualizar horario (borrar y recrear)
        if (request.getHorario() != null) {
            bloqueHorarioRepository.deleteByPracticanteIdPracticante(id);
            guardarHorario(updated, request.getHorario());
        }

        return convertToResponse(updated);
    }

    @Override
    public void eliminar(Long id) {
        log.info("Eliminando practicante ID: {}", id);
        bloqueHorarioRepository.deleteByPracticanteIdPracticante(id);
        practicanteRepository.deleteById(id);
        log.info("Practicante eliminado ID: {}", id);
    }

    @Override
    public PracticanteResponse obtenerPorId(Long id) {
        Practicante practicante = practicanteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Practicante no encontrado con ID: " + id));
        return convertToResponse(practicante);
    }

    @Override
    public PracticanteResponse obtenerPorCodigo(String codigo) {
        Practicante practicante = practicanteRepository.findByDocumento(codigo)
                .orElseThrow(() -> new RuntimeException("Practicante no encontrado con código/documento: " + codigo));
        return convertToResponse(practicante);
    }

    @Override
    public PracticanteResponse obtenerPorDocumento(String documento) {
        Practicante practicante = practicanteRepository.findByDocumento(documento)
                .orElseThrow(() -> new RuntimeException("Practicante no encontrado con documento: " + documento));
        return convertToResponse(practicante);
    }

    @Override
    public List<PracticanteResponse> obtenerTodos() {
        return practicanteRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<PracticanteResponse> obtenerActivos() {
        return practicanteRepository.findBySituacion(Situacion.ACTIVO).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<PracticanteResponse> buscarPorNombre(String termino) {
        return practicanteRepository.buscarPorNombreOApellido(termino).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Long contarActivos() {
        return practicanteRepository.countBySituacion(Situacion.ACTIVO);
    }

    @Override
    public Long contarPorSede(Long idSede) {
        Sede sede = sedeRepository.findById(idSede)
                .orElseThrow(() -> new RuntimeException("Sede no encontrada con ID: " + idSede));
        return practicanteRepository.countActivosBySede(sede);
    }

    @Override
    public void cambiarSituacion(Long id, Situacion nuevaSituacion) {
        Practicante practicante = practicanteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Practicante no encontrado con ID: " + id));
        practicante.setSituacion(nuevaSituacion);
        practicanteRepository.save(practicante);
        log.info("Situación cambiada a {} para practicante: {}", nuevaSituacion, practicante.getDocumento());
    }

    @Override
    public PracticanteResponse activar(Long id) {
        cambiarSituacion(id, Situacion.ACTIVO);
        return obtenerPorId(id);
    }

    @Override
    public PracticanteResponse desactivar(Long id) {
        cambiarSituacion(id, Situacion.INACTIVO);
        return obtenerPorId(id);
    }

    // ============================================
    // ====== MÉTODOS PARA HORARIO ======
    // ============================================

    @Override
    public List<BloqueHorario> obtenerHorario(Long idPracticante) {
        log.info("Obteniendo horario del practicante ID: {}", idPracticante);
        return bloqueHorarioRepository.findByPracticanteIdPracticante(idPracticante);
    }

    @Override
    public void actualizarHorario(Long idPracticante, List<BloqueHorarioRequest> horario) {
        log.info("Actualizando horario del practicante ID: {}", idPracticante);

        // 1. Eliminar horario existente
        bloqueHorarioRepository.deleteByPracticanteIdPracticante(idPracticante);
        log.info("Horario anterior eliminado para practicante ID: {}", idPracticante);

        // 2. Obtener el practicante
        Practicante practicante = practicanteRepository.findById(idPracticante)
                .orElseThrow(() -> new RuntimeException("Practicante no encontrado con ID: " + idPracticante));

        // 3. Guardar nuevo horario
        guardarHorario(practicante, horario);
    }

    // ====== MÉTODOS PRIVADOS ======

    /**
     * Guarda los bloques horarios de un practicante
     */
    private void guardarHorario(Practicante practicante, List<BloqueHorarioRequest> horarioRequests) {
        if (horarioRequests == null || horarioRequests.isEmpty()) {
            log.info("No hay horario para guardar para el practicante ID: {}", practicante.getIdPracticante());
            return;
        }

        List<BloqueHorario> bloques = new ArrayList<>();

        for (BloqueHorarioRequest req : horarioRequests) {
            // Solo guardar si está activo (trabaja ese día)
            if (req.getActivo() != null && req.getActivo()) {
                try {
                    BloqueHorario bloque = new BloqueHorario();
                    bloque.setPracticante(practicante);
                    // ✅ CONVERSIÓN: String → DiaSemana Enum
                    bloque.setDiaSemana(DiaSemana.valueOf(req.getDiaSemana()));
                    bloque.setHoraInicio(LocalTime.parse(req.getHoraInicio()));
                    bloque.setHoraFin(LocalTime.parse(req.getHoraFin()));
                    bloque.setTipoBloque(TipoBloque.TRABAJO);
                    bloque.setActivo(true);
                    bloque.setFechaInicio(practicante.getFechaInicioPracticas());
                    bloque.setFechaFin(practicante.getFechaFinPracticas());

                    bloques.add(bloque);
                } catch (IllegalArgumentException e) {
                    log.warn("Día de semana inválido '{}' para practicante ID {}: {}",
                            req.getDiaSemana(), practicante.getIdPracticante(), e.getMessage());
                } catch (Exception e) {
                    log.warn("Error al procesar bloque horario para día {}: {}", req.getDiaSemana(), e.getMessage());
                }
            }
        }

        if (!bloques.isEmpty()) {
            bloqueHorarioRepository.saveAll(bloques);
            log.info("Guardados {} bloques horarios para practicante ID: {}", bloques.size(), practicante.getIdPracticante());
        }
    }

    /**
     * Convierte una entidad Practicante a PracticanteResponse
     */
    private PracticanteResponse convertToResponse(Practicante practicante) {
        PracticanteResponse response = new PracticanteResponse();
        response.setIdPracticante(practicante.getIdPracticante());
        response.setNombreCompleto(practicante.getNombre() + " " + practicante.getApellido());
        response.setDocumento(practicante.getDocumento());
        response.setSede(practicante.getSede().getNombre());
        response.setPuesto(practicante.getPuesto().getNombrePuesto());
        response.setArea(practicante.getPuesto().getArea());
        response.setTipoInstituto(practicante.getTipoInstituto().getNombre());
        response.setCargo(practicante.getCargo().getNombre());
        response.setSituacion(practicante.getSituacion().toString());
        response.setHorasSemanalesRequeridas(practicante.getCargo().getHorasSemanales());
        response.setCorreoElectronico(practicante.getCorreoElectronico());
        response.setTelefono(practicante.getTelefono());
        response.setFechaInicioPracticas(practicante.getFechaInicioPracticas());
        response.setFechaFinPracticas(practicante.getFechaFinPracticas());
        return response;
    }
}