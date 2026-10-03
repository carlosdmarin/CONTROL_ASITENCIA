package com.asistencia.attendance_system.security;

import com.asistencia.attendance_system.repository.PracticanteRepository;
import com.asistencia.attendance_system.repository.VigilanteRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final PracticanteRepository practicanteRepository;
    private final VigilanteRepository vigilanteRepository;

    public JwtAuthenticationFilter(JwtService jwtService,
                                   PracticanteRepository practicanteRepository,
                                   VigilanteRepository vigilanteRepository) {
        this.jwtService = jwtService;
        this.practicanteRepository = practicanteRepository;
        this.vigilanteRepository = vigilanteRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String token = extractTokenFromCookie(request);

        if (token != null && jwtService.isValid(token)) {
            try {
                String subject = jwtService.getSubject(token);
                String rol = jwtService.getRol(token);
                String sid = jwtService.getSid(token);

                if (subject != null && rol != null && sid != null && cuentaActiva(sid)) {
                    String authority = "ROLE_" + rol;
                    var authorities = List.of(new SimpleGrantedAuthority(authority));
                    var authentication = new UsernamePasswordAuthenticationToken(subject, sid, authorities);
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            } catch (Exception e) {
                // No autenticar, continuar sin authentication para endpoints públicos
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Revalida la vigencia de la cuenta en cada request: una cuenta desactivada
     * después de emitir el JWT deja de autenticar aunque el token siga vigente.
     * Si la cuenta ya no existe o no puede verificarse, se conserva el
     * comportamiento anterior (solo se rechaza la inactividad comprobada).
     */
    private boolean cuentaActiva(String sid) {
        try {
            if (sid.startsWith("practicante:")) {
                Long id = Long.valueOf(sid.substring("practicante:".length()));
                return practicanteRepository.findById(id)
                        .map(p -> p.getSituacion() != null
                                && "ACTIVO".equals(p.getSituacion().name()))
                        .orElse(true);
            }
            if (sid.startsWith("vigilante:")) {
                Integer id = Integer.valueOf(sid.substring("vigilante:".length()));
                return vigilanteRepository.findById(id)
                        .map(v -> Boolean.TRUE.equals(v.getEstado()))
                        .orElse(true);
            }
            // administradores no tiene estado: la existencia del registro ya fue
            // la autorización al emitir el JWT; se conserva el comportamiento.
        } catch (Exception e) {
            return true;
        }
        return true;
    }

    private String extractTokenFromCookie(HttpServletRequest request) {
        if (request.getCookies() == null) return null;
        for (Cookie cookie : request.getCookies()) {
            if ("practiqr_token".equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }
}
