package com.asistencia.attendance_system.controller;

import com.asistencia.attendance_system.model.dto.AuthResult;
import com.asistencia.attendance_system.model.dto.LoginRequest;
import com.asistencia.attendance_system.model.dto.LoginResponse;
import com.asistencia.attendance_system.model.entity.Practicante;
import com.asistencia.attendance_system.model.entity.Trabajador;
import com.asistencia.attendance_system.model.entity.Vigilante;
import com.asistencia.attendance_system.repository.PracticanteRepository;
import com.asistencia.attendance_system.repository.TrabajadorRepository;
import com.asistencia.attendance_system.repository.VigilanteRepository;
import com.asistencia.attendance_system.security.JwtService;
import com.asistencia.attendance_system.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;
    private final PracticanteRepository practicanteRepository;
    private final VigilanteRepository vigilanteRepository;
    private final TrabajadorRepository trabajadorRepository;

    @Value("${practiqr.auth.rrhh-worker-ids:87}")
    private String rrhhWorkerIds;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResult authResult = authService.authenticate(request.getUsuario(), request.getContrasena());

        String token = jwtService.generateToken(
                String.valueOf(authResult.getId()),
                authResult.getRol(),
                authResult.getSid()
        );

        ResponseCookie cookie = jwtService.createCookie(token);

        LoginResponse.UserInfo userInfo = LoginResponse.UserInfo.builder()
                .id(authResult.getId())
                .nombre(authResult.getNombre())
                .usuario(authResult.getUsuario())
                .rol(authResult.getRol())
                .documento(authResult.getDocumento())
                .build();

        LoginResponse response = LoginResponse.builder()
                .authenticated(true)
                .user(userInfo)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout() {
        ResponseCookie cookie = jwtService.createLogoutCookie();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(Map.of("authenticated", false));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal() == null || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("authenticated", false, "message", "No autenticado"));
        }

        String sid = null;
        Object credentials = authentication.getCredentials();
        if (credentials instanceof String) {
            sid = (String) credentials;
        }
        // Fallback: si sid no está en credentials, intentar extraer de token? No necesario, ya está en credentials
        if (sid == null || !sid.contains(":")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("authenticated", false, "message", "Sesión inválida"));
        }

        String[] parts = sid.split(":", 2);
        String source = parts[0];
        String idStr = parts[1];
        String rol = authentication.getAuthorities().stream().findFirst().map(a -> a.getAuthority().replace("ROLE_", "")).orElse(null);

        try {
            if ("practicante".equals(source)) {
                Long id = Long.valueOf(idStr);
                var opt = practicanteRepository.findById(id);
                if (opt.isEmpty()) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("authenticated", false, "message", "Usuario no encontrado"));
                Practicante p = opt.get();
                if (p.getSituacion() == null || !"ACTIVO".equals(p.getSituacion().name())) {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("authenticated", false, "message", "Usuario inactivo"));
                }
                var userInfo = LoginResponse.UserInfo.builder()
                        .id(p.getIdPracticante())
                        .nombre(p.getNombre() + " " + p.getApellido())
                        .usuario(p.getUsuario())
                        .rol(rol != null ? rol : "PRACTICANTE")
                        .documento(p.getDocumento())
                        .build();
                return ResponseEntity.ok(Map.of("authenticated", true, "user", userInfo));

            } else if ("vigilante".equals(source)) {
                Integer id = Integer.valueOf(idStr);
                var opt = vigilanteRepository.findById(id);
                if (opt.isEmpty()) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("authenticated", false));
                Vigilante v = opt.get();
                if (!Boolean.TRUE.equals(v.getEstado())) {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("authenticated", false));
                }
                var userInfo = LoginResponse.UserInfo.builder()
                        .id(Long.valueOf(v.getIdVigilante()))
                        .nombre(v.getNombre() + " " + v.getApellido())
                        .usuario(v.getUsuario())
                        .rol(rol != null ? rol : "VIGILANTE")
                        .documento(v.getUsuario())
                        .build();
                return ResponseEntity.ok(Map.of("authenticated", true, "user", userInfo));

            } else if ("trabajadores".equals(source)) {
                Integer id = Integer.valueOf(idStr);
                var opt = trabajadorRepository.findById(id);
                if (opt.isEmpty()) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("authenticated", false));
                Trabajador t = opt.get();
                Set<Integer> allowed = new HashSet<>();
                for (String s : rrhhWorkerIds.split(",")) {
                    try { allowed.add(Integer.valueOf(s.trim())); } catch (Exception ignored) {}
                }
                if (!allowed.contains(t.getIdTrabajador()) || t.getEstado() == null || t.getEstado() != 1 || t.getEstadoUsuario() == null || t.getEstadoUsuario() != 1) {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("authenticated", false));
                }
                var userInfo = LoginResponse.UserInfo.builder()
                        .id(Long.valueOf(t.getIdTrabajador()))
                        .nombre(t.getNombres() + " " + t.getApellidos())
                        .usuario(t.getUsuario())
                        .rol(rol != null ? rol : "RRHH")
                        .documento(t.getNroDoc())
                        .build();
                return ResponseEntity.ok(Map.of("authenticated", true, "user", userInfo));
            }
        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("authenticated", false));
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("authenticated", false));
    }
}
