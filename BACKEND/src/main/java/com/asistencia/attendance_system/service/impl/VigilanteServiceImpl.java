package com.asistencia.attendance_system.service.impl;

import com.asistencia.attendance_system.excepcion.BusinessException;
import com.asistencia.attendance_system.model.dto.VigilanteChangePasswordRequest;
import com.asistencia.attendance_system.model.dto.VigilanteCreateRequest;
import com.asistencia.attendance_system.model.dto.VigilanteEstadoRequest;
import com.asistencia.attendance_system.model.dto.VigilanteResponse;
import com.asistencia.attendance_system.model.entity.Sede;
import com.asistencia.attendance_system.model.entity.Vigilante;
import com.asistencia.attendance_system.repository.SedeRepository;
import com.asistencia.attendance_system.repository.VigilanteRepository;
import com.asistencia.attendance_system.service.VigilanteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VigilanteServiceImpl implements VigilanteService {

    private final VigilanteRepository vigilanteRepository;
    private final SedeRepository sedeRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public Integer obtenerIdSede(Integer idVigilante) {
        if (idVigilante == null) {
            return null;
        }
        return vigilanteRepository.findById(idVigilante)
                .map(v -> v.getSede() != null ? v.getSede().getIdSede() : null)
                .orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VigilanteResponse> listar() {
        List<Vigilante> vigilantes = vigilanteRepository.findAll();
        return vigilantes.stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional
    public VigilanteResponse crear(VigilanteCreateRequest request) {
        String nombre = request.getNombre() != null ? request.getNombre().trim() : null;
        String apellido = request.getApellido() != null ? request.getApellido().trim() : null;
        String usuario = request.getUsuario() != null ? request.getUsuario().trim() : null;
        String contrasena = request.getContrasena();
        Integer sedeId = request.getSedeId();

        if (nombre == null || nombre.isBlank()) {
            throw new BusinessException("El nombre es obligatorio", HttpStatus.BAD_REQUEST);
        }
        if (apellido == null || apellido.isBlank()) {
            throw new BusinessException("El apellido es obligatorio", HttpStatus.BAD_REQUEST);
        }
        if (usuario == null || usuario.isBlank()) {
            throw new BusinessException("El usuario es obligatorio", HttpStatus.BAD_REQUEST);
        }
        if (contrasena == null || contrasena.isBlank()) {
            throw new BusinessException("La contraseña es obligatoria", HttpStatus.BAD_REQUEST);
        }
        if (sedeId == null) {
            throw new BusinessException("La sede es obligatoria", HttpStatus.BAD_REQUEST);
        }

        if (vigilanteRepository.findByUsuario(usuario).isPresent()) {
            throw new BusinessException("El usuario ya está registrado", HttpStatus.CONFLICT);
        }

        Sede sede = sedeRepository.findById(sedeId)
                .orElseThrow(() -> new BusinessException("La sede seleccionada no existe", HttpStatus.BAD_REQUEST));

        Vigilante vigilante = new Vigilante();
        vigilante.setNombre(nombre);
        vigilante.setApellido(apellido);
        vigilante.setUsuario(usuario);
        vigilante.setContrasena(passwordEncoder.encode(contrasena));
        vigilante.setEstado(true);
        vigilante.setSede(sede);

        Vigilante guardado = vigilanteRepository.save(vigilante);
        return toResponse(guardado);
    }

    @Override
    @Transactional
    public void cambiarContrasena(Integer id, VigilanteChangePasswordRequest request) {
        String nueva = request.getNuevaContrasena();
        String confirmar = request.getConfirmarContrasena();

        if (nueva == null || nueva.isBlank()) {
            throw new BusinessException("La nueva contraseña es obligatoria", HttpStatus.BAD_REQUEST);
        }
        if (confirmar == null || confirmar.isBlank()) {
            throw new BusinessException("La confirmación es obligatoria", HttpStatus.BAD_REQUEST);
        }
        if (!nueva.equals(confirmar)) {
            throw new BusinessException("Las contraseñas no coinciden", HttpStatus.BAD_REQUEST);
        }

        Vigilante vigilante = vigilanteRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Vigilante no encontrado", HttpStatus.NOT_FOUND));

        vigilante.setContrasena(passwordEncoder.encode(nueva));
        vigilanteRepository.save(vigilante);
    }

    @Override
    @Transactional
    public VigilanteResponse cambiarEstado(Integer id, VigilanteEstadoRequest request) {
        if (request.getEstado() == null) {
            throw new BusinessException("El estado es obligatorio", HttpStatus.BAD_REQUEST);
        }

        Vigilante vigilante = vigilanteRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Vigilante no encontrado", HttpStatus.NOT_FOUND));

        vigilante.setEstado(request.getEstado());
        Vigilante guardado = vigilanteRepository.save(vigilante);
        return toResponse(guardado);
    }

    private VigilanteResponse toResponse(Vigilante v) {
        Integer sedeId = null;
        String sedeNombre = null;
        if (v.getSede() != null) {
            sedeId = v.getSede().getIdSede();
            sedeNombre = v.getSede().getNombre();
        }
        return new VigilanteResponse(
                v.getIdVigilante(),
                v.getNombre(),
                v.getApellido(),
                v.getUsuario(),
                v.getEstado(),
                sedeId,
                sedeNombre
        );
    }
}
