package com.asistencia.attendance_system.security;

import com.asistencia.attendance_system.model.entity.Practicante;
import com.asistencia.attendance_system.model.entity.Vigilante;
import com.asistencia.attendance_system.model.enums.Situacion;
import com.asistencia.attendance_system.repository.PracticanteRepository;
import com.asistencia.attendance_system.repository.VigilanteRepository;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * C-06: el filtro revalida la vigencia por request. Solo rechaza la
 * inactividad comprobada; cuenta inexistente o error conservan el
 * comportamiento anterior (individual, sin afectar a otros usuarios).
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
public class JwtRevalidacionTest {

    @Mock private JwtService jwtService;
    @Mock private PracticanteRepository practicanteRepository;
    @Mock private VigilanteRepository vigilanteRepository;
    @Mock private FilterChain chain;

    private JwtAuthenticationFilter filter;

    @BeforeEach
    public void setup() {
        SecurityContextHolder.clearContext();
        filter = new JwtAuthenticationFilter(jwtService, practicanteRepository,
                vigilanteRepository);
        when(jwtService.isValid("TOK")).thenReturn(true);
        when(jwtService.getSubject("TOK")).thenReturn("7");
        when(jwtService.getRol("TOK")).thenReturn("PRACTICANTE");
    }

    @AfterEach
    public void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private void requestConSid(String sid) throws Exception {
        when(jwtService.getSid("TOK")).thenReturn(sid);
        MockHttpServletRequest req = new MockHttpServletRequest();
        req.setCookies(new jakarta.servlet.http.Cookie("practiqr_token", "TOK"));
        filter.doFilter(req, new MockHttpServletResponse(), chain);
    }

    @Test
    public void practicanteDesactivado_noAutentica() throws Exception {
        Practicante p = new Practicante();
        p.setSituacion(Situacion.INACTIVO);
        when(practicanteRepository.findById(7L)).thenReturn(Optional.of(p));
        requestConSid("practicante:7");
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }

    @Test
    public void practicanteActivo_autentica() throws Exception {
        Practicante p = new Practicante();
        p.setSituacion(Situacion.ACTIVO);
        when(practicanteRepository.findById(7L)).thenReturn(Optional.of(p));
        requestConSid("practicante:7");
        assertNotNull(SecurityContextHolder.getContext().getAuthentication());
    }

    @Test
    public void vigilanteDesactivado_noAutentica() throws Exception {
        Vigilante v = new Vigilante();
        v.setEstado(false);
        when(vigilanteRepository.findById(10)).thenReturn(Optional.of(v));
        requestConSid("vigilante:10");
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }

    @Test
    public void cuentaInexistente_conservaComportamiento() throws Exception {
        when(practicanteRepository.findById(any())).thenReturn(Optional.empty());
        requestConSid("practicante:999");
        assertNotNull(SecurityContextHolder.getContext().getAuthentication());
    }

    @Test
    public void errorRepositorio_conservaComportamiento() throws Exception {
        when(practicanteRepository.findById(any())).thenThrow(new RuntimeException("caída"));
        requestConSid("practicante:7");
        assertNotNull(SecurityContextHolder.getContext().getAuthentication());
    }

    @Test
    public void tokenInvalido_noAutentica() throws Exception {
        when(jwtService.isValid("TOK")).thenReturn(false);
        requestConSid("practicante:7");
        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(practicanteRepository, never()).findById(any());
    }
}
