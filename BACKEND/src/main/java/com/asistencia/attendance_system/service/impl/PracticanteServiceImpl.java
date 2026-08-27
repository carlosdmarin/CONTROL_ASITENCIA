package com.asistencia.attendance_system.service.impl;

import com.asistencia.attendance_system.model.dto.PracticanteRequest;
import com.asistencia.attendance_system.model.dto.PracticanteResponse;
import com.asistencia.attendance_system.model.entity.*;
import com.asistencia.attendance_system.model.enums.Situacion;
import com.asistencia.attendance_system.repository.*;
import com.asistencia.attendance_system.service.PracticanteService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PracticanteServiceImpl implements PracticanteService {

    private final PracticanteRepository practicanteRepository;
    private final PuestoRepository puestoRepository;
    private final AgenciaRepository agenciaRepository;
    private final CargoRepository cargoRepository;
    private final TipoInstitutoRepository tipoInstitutoRepository;

    @Override
    public PracticanteResponse crear(PracticanteRequest request) {
        log.info("Creando nuevo practicante: {}", request.getCodigoTrabajador());

        if (practicanteRepository.findByCodigoTrabajador(request.getCodigoTrabajador()).isPresent()) {
            throw new RuntimeException("Ya existe un practicante con el código: " + request.getCodigoTrabajador());
        }

        if (practicanteRepository.findByDocumento(request.getDocumento()).isPresent()) {
            throw new RuntimeException("Ya existe un practicante con el documento: " + request.getDocumento());
        }

        Agencia agencia = agenciaRepository.findById(request.getIdAgencia())
                .orElseThrow(() -> new RuntimeException("Agencia no encontrada con ID: " + request.getIdAgencia()));

        Puesto puesto = puestoRepository.findById(request.getIdPuesto())
                .orElseThrow(() -> new RuntimeException("Puesto no encontrado con ID: " + request.getIdPuesto()));

        TipoInstituto tipoInstituto = tipoInstitutoRepository.findById(request.getIdTipoInstituto())
                .orElseThrow(() -> new RuntimeException("Tipo de instituto no encontrado con ID: " + request.getIdTipoInstituto()));

        Cargo cargo = cargoRepository.findById(request.getIdCargo())
                .orElseThrow(() -> new RuntimeException("Cargo no encontrado con ID: " + request.getIdCargo()));

        Practicante practicante = new Practicante();
        practicante.setCodigoTrabajador(request.getCodigoTrabajador());
        practicante.setNombre(request.getNombre());
        practicante.setApellido(request.getApellido());
        practicante.setDocumento(request.getDocumento());
        practicante.setAgencia(agencia);
        practicante.setPuesto(puesto);
        practicante.setTipoInstituto(tipoInstituto);
        practicante.setCargo(cargo);
        practicante.setSituacion(Situacion.ACTIVO);
        practicante.setCorreoElectronico(request.getCorreoElectronico());
        practicante.setTelefono(request.getTelefono());
        practicante.setFechaInicioPracticas(request.getFechaInicioPracticas());
        practicante.setFechaFinPracticas(request.getFechaFinPracticas());

        Practicante saved = practicanteRepository.save(practicante);
        log.info("Practicante creado con ID: {}", saved.getIdPracticante());

        return convertToResponse(saved);
    }

    @Override
    public PracticanteResponse actualizar(Long id, PracticanteRequest request) {
        log.info("Actualizando practicante ID: {}", id);

        Practicante practicante = practicanteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Practicante no encontrado con ID: " + id));

        Agencia agencia = agenciaRepository.findById(request.getIdAgencia())
                .orElseThrow(() -> new RuntimeException("Agencia no encontrada con ID: " + request.getIdAgencia()));

        Puesto puesto = puestoRepository.findById(request.getIdPuesto())
                .orElseThrow(() -> new RuntimeException("Puesto no encontrado con ID: " + request.getIdPuesto()));

        TipoInstituto tipoInstituto = tipoInstitutoRepository.findById(request.getIdTipoInstituto())
                .orElseThrow(() -> new RuntimeException("Tipo de instituto no encontrado con ID: " + request.getIdTipoInstituto()));

        Cargo cargo = cargoRepository.findById(request.getIdCargo())
                .orElseThrow(() -> new RuntimeException("Cargo no encontrado con ID: " + request.getIdCargo()));

        practicante.setNombre(request.getNombre());
        practicante.setApellido(request.getApellido());
        practicante.setDocumento(request.getDocumento());
        practicante.setAgencia(agencia);
        practicante.setPuesto(puesto);
        practicante.setTipoInstituto(tipoInstituto);
        practicante.setCargo(cargo);
        practicante.setCorreoElectronico(request.getCorreoElectronico());
        practicante.setTelefono(request.getTelefono());
        practicante.setFechaInicioPracticas(request.getFechaInicioPracticas());
        practicante.setFechaFinPracticas(request.getFechaFinPracticas());

        Practicante updated = practicanteRepository.save(practicante);
        log.info("Practicante actualizado: {}", updated.getCodigoTrabajador());

        return convertToResponse(updated);
    }

    @Override
    public void eliminar(Long id) {
        log.info("Eliminando practicante ID: {}", id);
        practicanteRepository.deleteById(id);
    }

    @Override
    public PracticanteResponse obtenerPorId(Long id) {
        Practicante practicante = practicanteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Practicante no encontrado con ID: " + id));
        return convertToResponse(practicante);
    }

    @Override
    public PracticanteResponse obtenerPorCodigo(String codigo) {
        Practicante practicante = practicanteRepository.findByCodigoTrabajador(codigo)
                .orElseThrow(() -> new RuntimeException("Practicante no encontrado con código: " + codigo));
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
        return practicanteRepository.findBySituacion(Situacion.ACTIVO).stream().count();
    }

    @Override
    public Long contarPorAgencia(Long idAgencia) {
        Agencia agencia = agenciaRepository.findById(idAgencia)
                .orElseThrow(() -> new RuntimeException("Agencia no encontrada con ID: " + idAgencia));
        return practicanteRepository.countActivosByAgencia(agencia);
    }

    @Override
    public void cambiarSituacion(Long id, Situacion nuevaSituacion) {
        Practicante practicante = practicanteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Practicante no encontrado con ID: " + id));
        practicante.setSituacion(nuevaSituacion);
        practicanteRepository.save(practicante);
        log.info("Situación cambiada a {} para practicante: {}", nuevaSituacion, practicante.getCodigoTrabajador());
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

    // ========== MÉTODOS PRIVADOS ==========

    private PracticanteResponse convertToResponse(Practicante practicante) {
        PracticanteResponse response = new PracticanteResponse();
        response.setIdPracticante(practicante.getIdPracticante());
        response.setCodigoTrabajador(practicante.getCodigoTrabajador());
        response.setNombreCompleto(practicante.getNombre() + " " + practicante.getApellido());
        response.setDocumento(practicante.getDocumento());
        response.setAgencia(practicante.getAgencia().getNombre());
        response.setPuesto(practicante.getPuesto().getNombrePuesto());
        response.setArea(practicante.getPuesto().getArea());
        response.setTipoInstituto(practicante.getTipoInstituto().getNombre());
        response.setCargo(practicante.getCargo().getNombre());
        response.setSituacion(practicante.getSituacion().toString());

        // ✅ CORRECTO: Obtener las horas desde el objeto Cargo
        response.setHorasSemanalesRequeridas(practicante.getCargo().getHorasSemanales());

        response.setCorreoElectronico(practicante.getCorreoElectronico());
        response.setTelefono(practicante.getTelefono());
        response.setFechaInicioPracticas(practicante.getFechaInicioPracticas());
        response.setFechaFinPracticas(practicante.getFechaFinPracticas());
        return response;
    }
}