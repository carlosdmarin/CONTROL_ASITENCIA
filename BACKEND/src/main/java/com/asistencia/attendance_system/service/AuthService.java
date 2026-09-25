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

        if (rrhhWorkerIds == null || rrhhWorkerIds.isBlank()) {
            return ids;
        }

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
        return hash != null &&
                (hash.startsWith("$2a$")
                        || hash.startsWith("$2b$")
                        || hash.startsWith("$2y$"));
    }

    private String normalizeForBcrypt(String hash) {
        if (hash != null && hash.startsWith("$2y$")) {
            return "$2a$" + hash.substring(4);
        }

        return hash;
    }

    @Transactional
    public AuthResult authenticate(String usuario, String contrasena) {

        if (usuario == null || usuario.isBlank()
                || contrasena == null || contrasena.isBlank()) {

            throw new BusinessException(
                    "Usuario o contraseña incorrectos",
                    HttpStatus.UNAUTHORIZED
            );
        }

        String usuarioTrim = usuario.trim();

        // No hacemos trim de la contraseña
        String contrasenaTrim = contrasena;

        List<Candidate> candidates = new ArrayList<>();

        // =========================================================
        // PRACTICANTE
        // =========================================================

        Optional<Practicante> optPracticante =
                practicanteRepository.findByUsuario(usuarioTrim);

        if (optPracticante.isEmpty()) {

            // Compatibilidad:
            // si no encontró por usuario, intenta por documento
            optPracticante =
                    practicanteRepository.findByDocumento(usuarioTrim);
        }

        if (optPracticante.isPresent()) {

            Practicante p = optPracticante.get();

            // Solo practicantes activos
            if (p.getSituacion() != null
                    && p.getSituacion().name().equals("ACTIVO")) {

                candidates.add(
                        new Candidate("practicante", p)
                );

            } else {

                log.debug(
                        "Practicante encontrado pero inactivo: {}",
                        usuarioTrim
                );
            }
        }

        // =========================================================
        // VIGILANTE
        // =========================================================

        Optional<Vigilante> optVigilante =
                vigilanteRepository.findByUsuario(usuarioTrim);

        if (optVigilante.isPresent()) {

            Vigilante v = optVigilante.get();

            if (Boolean.TRUE.equals(v.getEstado())) {

                candidates.add(
                        new Candidate("vigilante", v)
                );

            } else {

                log.debug(
                        "Vigilante inactivo: {}",
                        usuarioTrim
                );
            }
        }

        // =========================================================
        // TRABAJADOR / RRHH
        // =========================================================

        Optional<Trabajador> optTrabajador =
                trabajadorRepository.findByUsuario(usuarioTrim);

        if (optTrabajador.isEmpty()) {

            // Fallback por email
            if (usuarioTrim.contains("@")) {

                optTrabajador =
                        trabajadorRepository.findByEmail(usuarioTrim);
            }
        }

        if (optTrabajador.isPresent()) {

            Trabajador t = optTrabajador.get();

            Set<Integer> allowed = parseRrhhIds();

            boolean isAuthorized =
                    allowed.contains(t.getIdTrabajador());

            boolean estadoOk =
                    t.getEstado() != null
                            && t.getEstado() == 1;

            boolean estadoUsuarioOk =
                    t.getEstadoUsuario() != null
                            && t.getEstadoUsuario() == 1;

            if (isAuthorized
                    && estadoOk
                    && estadoUsuarioOk) {

                candidates.add(
                        new Candidate("trabajadores", t)
                );

            } else {

                log.debug(
                        "Trabajador no autorizado o inactivo: " +
                                "usuario={}, id={}, estado={}, " +
                                "estadoUsuario={}, autorizado={}",
                        usuarioTrim,
                        t.getIdTrabajador(),
                        t.getEstado(),
                        t.getEstadoUsuario(),
                        isAuthorized
                );
            }
        }

        // =========================================================
        // DEBUG: CANDIDATOS ENCONTRADOS
        // =========================================================

        log.info(
                "LOGIN DEBUG - usuario recibido: [{}]",
                usuarioTrim
        );

        log.info(
                "LOGIN DEBUG - candidatos encontrados: {}",
                candidates.size()
        );

        for (Candidate c : candidates) {

            log.info(
                    "LOGIN DEBUG - source={}",
                    c.source
            );
        }

        // =========================================================
        // SIN CANDIDATOS
        // =========================================================

        if (candidates.isEmpty()) {

            log.warn(
                    "LOGIN DEBUG - No se encontró ningún usuario activo/autorizado para [{}]",
                    usuarioTrim
            );

            throw new BusinessException(
                    "Usuario o contraseña incorrectos",
                    HttpStatus.UNAUTHORIZED
            );
        }

        // =========================================================
        // MÁS DE UN CANDIDATO
        // =========================================================

        if (candidates.size() > 1) {

            log.warn(
                    "Autenticación ambigua para usuario {}: {} candidatos en fuentes distintas",
                    usuarioTrim,
                    candidates.size()
            );

            throw new BusinessException(
                    "Usuario o contraseña incorrectos",
                    HttpStatus.UNAUTHORIZED
            );
        }

        Candidate candidate = candidates.get(0);

        String source = candidate.source;

        Object entity = candidate.entity;

        // =========================================================
        // AUTENTICACIÓN DEL PRACTICANTE
        // =========================================================

        if ("practicante".equals(source)) {

            Practicante p = (Practicante) entity;

            String stored = p.getContrasena();

            // DEBUG
            log.info(
                    "LOGIN DEBUG - practicante encontrado id={}, usuario={}, passwordBCrypt={}",
                    p.getIdPracticante(),
                    p.getUsuario(),
                    isBCrypt(stored)
            );

            boolean matches;

            if (isBCrypt(stored)) {

                String normalized =
                        normalizeForBcrypt(stored);

                matches =
                        passwordEncoder.matches(
                                contrasenaTrim,
                                normalized
                        );

            } else {

                // Compatibilidad legacy:
                // contraseña antigua = documento

                boolean legacyMatches =
                        stored != null
                                && stored.equals(contrasenaTrim);

                matches = legacyMatches;

                if (matches) {

                    // Migrar automáticamente a BCrypt
                    String newHash =
                            passwordEncoder.encode(
                                    contrasenaTrim
                            );

                    p.setContrasena(newHash);

                    practicanteRepository.save(p);

                    log.info(
                            "Migración de contraseña legacy a BCrypt para practicante usuario={} id={}",
                            p.getUsuario(),
                            p.getIdPracticante()
                    );
                }
            }

            if (!matches) {

                log.warn(
                        "LOGIN DEBUG - contraseña incorrecta para practicante usuario={}",
                        p.getUsuario()
                );

                throw new BusinessException(
                        "Usuario o contraseña incorrectos",
                        HttpStatus.UNAUTHORIZED
                );
            }

            // Construir resultado de autenticación

            String nombre =
                    p.getNombre() + " " + p.getApellido();

            String sede =
                    p.getSede() != null
                            ? p.getSede().getNombre()
                            : null;

            log.info(
                    "LOGIN DEBUG - autenticación exitosa como PRACTICANTE, id={}",
                    p.getIdPracticante()
            );

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
        }

        // =========================================================
        // AUTENTICACIÓN DEL VIGILANTE
        // =========================================================

        else if ("vigilante".equals(source)) {

            Vigilante v = (Vigilante) entity;

            String stored = v.getContrasena();

            // DEBUG
            log.info(
                    "LOGIN DEBUG - vigilante encontrado id={}, usuario={}, passwordBCrypt={}",
                    v.getIdVigilante(),
                    v.getUsuario(),
                    isBCrypt(stored)
            );

            String normalized =
                    normalizeForBcrypt(stored);

            boolean matches;

            // Vigilante normalmente usa BCrypt
            if (isBCrypt(stored)) {

                matches =
                        passwordEncoder.matches(
                                contrasenaTrim,
                                normalized
                        );

            } else {

                // Compatibilidad legacy
                matches =
                        stored != null
                                && stored.equals(contrasenaTrim);
            }

            if (!matches) {

                log.warn(
                        "LOGIN DEBUG - contraseña incorrecta para vigilante usuario={}",
                        v.getUsuario()
                );

                throw new BusinessException(
                        "Usuario o contraseña incorrectos",
                        HttpStatus.UNAUTHORIZED
                );
            }

            String nombre =
                    v.getNombre() + " " + v.getApellido();

            log.info(
                    "LOGIN DEBUG - autenticación exitosa como VIGILANTE, id={}",
                    v.getIdVigilante()
            );

            return AuthResult.builder()
                    .id(Long.valueOf(v.getIdVigilante()))
                    .nombre(nombre)
                    .usuario(v.getUsuario())
                    .rol("VIGILANTE")
                    .documento(v.getUsuario())
                    .sid("vigilante:" + v.getIdVigilante())
                    .source("vigilante")
                    .build();
        }

        // =========================================================
        // AUTENTICACIÓN DE RRHH
        // =========================================================

        else if ("trabajadores".equals(source)) {

            Trabajador t = (Trabajador) entity;

            String stored =
                    t.getPasswordUser();

            // DEBUG
            log.info(
                    "LOGIN DEBUG - trabajador encontrado id={}, usuario={}, passwordBCrypt={}",
                    t.getIdTrabajador(),
                    t.getUsuario(),
                    isBCrypt(stored)
            );

            String normalized =
                    normalizeForBcrypt(stored);

            // Trabajadores deben tener BCrypt
            if (!isBCrypt(stored)) {

                log.warn(
                        "Trabajador {} con password no BCrypt",
                        t.getUsuario()
                );

                throw new BusinessException(
                        "Usuario o contraseña incorrectos",
                        HttpStatus.UNAUTHORIZED
                );
            }

            boolean matches =
                    passwordEncoder.matches(
                            contrasenaTrim,
                            normalized
                    );

            if (!matches) {

                log.warn(
                        "LOGIN DEBUG - contraseña incorrecta para trabajador usuario={}",
                        t.getUsuario()
                );

                throw new BusinessException(
                        "Usuario o contraseña incorrectos",
                        HttpStatus.UNAUTHORIZED
                );
            }

            String nombre =
                    t.getNombres() + " " + t.getApellidos();

            log.info(
                    "LOGIN DEBUG - autenticación exitosa como RRHH, id={}",
                    t.getIdTrabajador()
            );

            return AuthResult.builder()
                    .id(Long.valueOf(t.getIdTrabajador()))
                    .nombre(nombre)
                    .usuario(t.getUsuario())
                    .rol("RRHH")
                    .documento(t.getNroDoc())
                    .sede(
                            t.getIdSede() != null
                                    ? String.valueOf(t.getIdSede())
                                    : null
                    )
                    .sid("trabajadores:" + t.getIdTrabajador())
                    .source("trabajadores")
                    .build();
        }

        // =========================================================
        // FALLBACK
        // =========================================================

        throw new BusinessException(
                "Usuario o contraseña incorrectos",
                HttpStatus.UNAUTHORIZED
        );
    }

    // =============================================================
    // CANDIDATO DE AUTENTICACIÓN
    // =============================================================

    private static class Candidate {

        String source;

        Object entity;

        Candidate(
                String source,
                Object entity
        ) {
            this.source = source;
            this.entity = entity;
        }
    }
}