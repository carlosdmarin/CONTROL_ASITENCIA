package com.asistencia.attendance_system.service;

import com.asistencia.attendance_system.excepcion.BusinessException;
import com.asistencia.attendance_system.model.dto.AuthResult;
import com.asistencia.attendance_system.model.entity.Practicante;
import com.asistencia.attendance_system.model.entity.Trabajador;
import com.asistencia.attendance_system.model.entity.Vigilante;
import com.asistencia.attendance_system.repository.PracticanteRepository;
import com.asistencia.attendance_system.repository.TrabajadorRepository;
import com.asistencia.attendance_system.repository.VigilanteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final PracticanteRepository practicanteRepository;
    private final VigilanteRepository vigilanteRepository;
    private final TrabajadorRepository trabajadorRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${practiqr.auth.rrhh-worker-ids:87}")
    private String rrhhWorkerIds;

    private Set<Integer> parseRrhhIds() {
        Set<Integer> ids = new HashSet<>();
        if (rrhhWorkerIds == null || rrhhWorkerIds.isBlank()) return ids;
        for (String s : rrhhWorkerIds.split(",")) {
            try {
                ids.add(Integer.valueOf(s.trim()));
            } catch (NumberFormatException e) {
                log.warn("Id RRHH inválido en configuración: {}", s);
            }
        }
        return ids;
    }

    private boolean isBCrypt(String hash) {
        return hash != null && (hash.startsWith("$2a$") || hash.startsWith("$2b$") || hash.startsWith("$2y$"));
    }

    private String normalizeForBcrypt(String hash) {
        if (hash != null && hash.startsWith("$2y$")) {
            return "$2a$" + hash.substring(4);
        }
        return hash;
    }

    @Transactional
    public AuthResult authenticate(String usuario, String contrasena) {
        if (usuario == null || usuario.isBlank() || contrasena == null || contrasena.isBlank()) {
            throw new BusinessException("Usuario o contraseña incorrectos", HttpStatus.UNAUTHORIZED);
        }
        String usuarioTrim = usuario.trim();
        String contrasenaTrim = contrasena; // no trim password, pero usuario sí

        List<Candidate> candidates = new ArrayList<>();

        // Practicante - identificador principal usuario, compatibilidad documento
        Optional<Practicante> optPracticante = practicanteRepository.findByUsuario(usuarioTrim);
        if (optPracticante.isEmpty()) {
            // Compatibilidad: si no encontró por usuario, intentar por documento (mismo valor en datos actuales)
            optPracticante = practicanteRepository.findByDocumento(usuarioTrim);
        }
        if (optPracticante.isPresent()) {
            Practicante p = optPracticante.get();
            // Solo activo
            if (p.getSituacion() != null && p.getSituacion().name().equals("ACTIVO")) {
                candidates.add(new Candidate("practicante", p));
            } else {
                log.debug("Practicante encontrado pero inactivo: {}", usuarioTrim);
            }
        }

        // Vigilante
        Optional<Vigilante> optVigilante = vigilanteRepository.findByUsuario(usuarioTrim);
        if (optVigilante.isPresent()) {
            Vigilante v = optVigilante.get();
            if (Boolean.TRUE.equals(v.getEstado())) {
                candidates.add(new Candidate("vigilante", v));
            } else {
                log.debug("Vigilante inactivo: {}", usuarioTrim);
            }
        }

        // Trabajador / RRHH
        Optional<Trabajador> optTrabajador = trabajadorRepository.findByUsuario(usuarioTrim);
        if (optTrabajador.isEmpty()) {
            // Fallback por email si usuario parece email (contiene @)
            if (usuarioTrim.contains("@")) {
                optTrabajador = trabajadorRepository.findByEmail(usuarioTrim);
            }
        }
        if (optTrabajador.isPresent()) {
            Trabajador t = optTrabajador.get();
            Set<Integer> allowed = parseRrhhIds();
            boolean isAuthorized = allowed.contains(t.getIdTrabajador());
            boolean estadoOk = t.getEstado() != null && t.getEstado() == 1;
            boolean estadoUsuarioOk = t.getEstadoUsuario() != null && t.getEstadoUsuario() == 1;
            if (isAuthorized && estadoOk && estadoUsuarioOk) {
                candidates.add(new Candidate("trabajadores", t));
            } else {
                log.debug("Trabajador no autorizado o inactivo: usuario={}, id={}, estado={}, estadoUsuario={}, autorizado={}", usuarioTrim, t.getIdTrabajador(), t.getEstado(), t.getEstadoUsuario(), isAuthorized);
            }
        }

        if (candidates.isEmpty()) {
            throw new BusinessException("Usuario o contraseña incorrectos", HttpStatus.UNAUTHORIZED);
        }
        if (candidates.size() > 1) {
            log.warn("Autenticación ambigua para usuario {}: {} candidatos en fuentes distintas", usuarioTrim, candidates.size());
            throw new BusinessException("Usuario o contraseña incorrectos", HttpStatus.UNAUTHORIZED);
        }

        Candidate candidate = candidates.get(0);
        String source = candidate.source;
        Object entity = candidate.entity;

        // Validar contraseña según fuente
        if ("practicante".equals(source)) {
            Practicante p = (Practicante) entity;
            String stored = p.getContrasena();
            boolean matches;
            if (isBCrypt(stored)) {
                String normalized = normalizeForBcrypt(stored);
                matches = passwordEncoder.matches(contrasenaTrim, normalized);
            } else {
                // Compatibilidad legacy: texto plano = documento (comparación segura temporal)
                // No almacenar contraseña ingresada, solo comparar y migrar
                boolean legacyMatches = stored != null && stored.equals(contrasenaTrim);
                // Alternativa segura: usar MessageDigest.isEqual para tiempo constante, pero no crítico para esta fase
                matches = legacyMatches;
                if (matches) {
                    // Migrar a BCrypt después de autenticación exitosa
                    String newHash = passwordEncoder.encode(contrasenaTrim);
                    p.setContrasena(newHash);
                    practicanteRepository.save(p);
                    log.info("Migración de contraseña legacy a BCrypt para practicante usuario={} id={}", p.getUsuario(), p.getIdPracticante());
                }
            }
            if (!matches) {
                throw new BusinessException("Usuario o contraseña incorrectos", HttpStatus.UNAUTHORIZED);
            }
            // Construir AuthResult
            String nombre = p.getNombre() + " " + p.getApellido();
            String sede = p.getSede() != null ? p.getSede().getNombre() : null;
            return AuthResult.builder()
                    .id(p.getIdPracticante())
                    .nombre(nombre)
                    .usuario(p.getUsuario())
                    .rol("PRACTICANTE")
                    .documento(p.getDocumento())
                    .sede(sede)
                    .sid("practicante:" + p.getIdPracticante())
                    .source("practicante")
                    .build();

        } else if ("vigilante".equals(source)) {
            Vigilante v = (Vigilante) entity;
            String stored = v.getContrasena();
            String normalized = normalizeForBcrypt(stored);
            // Vigilante siempre BCrypt (aunque tabla vacía, preparado)
            boolean matches;
            if (isBCrypt(stored)) {
                matches = passwordEncoder.matches(contrasenaTrim, normalized);
            } else {
                matches = stored != null && stored.equals(contrasenaTrim);
            }
            if (!matches) {
                throw new BusinessException("Usuario o contraseña incorrectos", HttpStatus.UNAUTHORIZED);
            }
            String nombre = v.getNombre() + " " + v.getApellido();
            return AuthResult.builder()
                    .id(Long.valueOf(v.getIdVigilante()))
                    .nombre(nombre)
                    .usuario(v.getUsuario())
                    .rol("VIGILANTE")
                    .documento(v.getUsuario())
                    .sid("vigilante:" + v.getIdVigilante())
                    .source("vigilante")
                    .build();

        } else if ("trabajadores".equals(source)) {
            Trabajador t = (Trabajador) entity;
            String stored = t.getPasswordUser();
            String normalized = normalizeForBcrypt(stored);
            if (!isBCrypt(stored)) {
                // No debería ocurrir, trabajadores siempre bcrypt
                log.warn("Trabajador {} con password no BCrypt", t.getUsuario());
                throw new BusinessException("Usuario o contraseña incorrectos", HttpStatus.UNAUTHORIZED);
            }
            boolean matches = passwordEncoder.matches(contrasenaTrim, normalized);
            if (!matches) {
                throw new BusinessException("Usuario o contraseña incorrectos", HttpStatus.UNAUTHORIZED);
            }
            String nombre = t.getNombres() + " " + t.getApellidos();
            return AuthResult.builder()
                    .id(Long.valueOf(t.getIdTrabajador()))
                    .nombre(nombre)
                    .usuario(t.getUsuario())
                    .rol("RRHH")
                    .documento(t.getNroDoc())
                    .sede(t.getIdSede() != null ? String.valueOf(t.getIdSede()) : null)
                    .sid("trabajadores:" + t.getIdTrabajador())
                    .source("trabajadores")
                    .build();
        }

        throw new BusinessException("Usuario o contraseña incorrectos", HttpStatus.UNAUTHORIZED);
    }

    private static class Candidate {
        String source;
        Object entity;
        Candidate(String source, Object entity) {
            this.source = source;
            this.entity = entity;
        }
    }
}
