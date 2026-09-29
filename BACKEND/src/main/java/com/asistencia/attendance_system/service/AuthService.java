package com.asistencia.attendance_system.service;

import com.asistencia.attendance_system.excepcion.BusinessException;
import com.asistencia.attendance_system.model.dto.AuthResult;
import com.asistencia.attendance_system.model.entity.Administrador;
import com.asistencia.attendance_system.model.entity.Practicante;
import com.asistencia.attendance_system.model.entity.Vigilante;
import com.asistencia.attendance_system.repository.AdministradorRepository;
import com.asistencia.attendance_system.repository.PracticanteRepository;
import com.asistencia.attendance_system.repository.VigilanteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
    private final AdministradorRepository administradorRepository;
    private final PasswordEncoder passwordEncoder;

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
        // ADMINISTRADOR (tabla propia: administradores)
        // Sin whitelist, sin estados heredados: la existencia
        // del registro es la autorización.
        // =========================================================

        Optional<Administrador> optAdministrador =
                administradorRepository.findByUsuario(usuarioTrim);

        if (optAdministrador.isPresent()) {

            candidates.add(
                    new Candidate("administradores", optAdministrador.get())
            );
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
        // AUTENTICACIÓN DEL ADMINISTRADOR (rol RRHH)
        // =========================================================

        else if ("administradores".equals(source)) {

            Administrador a = (Administrador) entity;

            String stored =
                    a.getPasswordHash();

            // DEBUG (sin exponer el hash)
            log.info(
                    "LOGIN DEBUG - administrador encontrado id={}, usuario={}, passwordBCrypt={}",
                    a.getId(),
                    a.getUsuario(),
                    isBCrypt(stored)
            );

            // Solo se aceptan hashes BCrypt
            if (!isBCrypt(stored)) {

                log.warn(
                        "Administrador {} con password no BCrypt",
                        a.getUsuario()
                );

                throw new BusinessException(
                        "Usuario o contraseña incorrectos",
                        HttpStatus.UNAUTHORIZED
                );
            }

            String normalized =
                    normalizeForBcrypt(stored);

            boolean matches =
                    passwordEncoder.matches(
                            contrasenaTrim,
                            normalized
                    );

            if (!matches) {

                log.warn(
                        "LOGIN DEBUG - contraseña incorrecta para administrador usuario={}",
                        a.getUsuario()
                );

                throw new BusinessException(
                        "Usuario o contraseña incorrectos",
                        HttpStatus.UNAUTHORIZED
                );
            }

            log.info(
                    "LOGIN DEBUG - autenticación exitosa como RRHH, id={}",
                    a.getId()
            );

            return AuthResult.builder()
                    .id(a.getId())
                    .nombre(a.getUsuario())
                    .usuario(a.getUsuario())
                    .rol("RRHH")
                    .documento(null)
                    .sede(null)
                    .sid("administradores:" + a.getId())
                    .source("administradores")
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