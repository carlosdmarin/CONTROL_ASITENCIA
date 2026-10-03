package com.asistencia.attendance_system.service;

import com.asistencia.attendance_system.excepcion.BusinessException;
import com.asistencia.attendance_system.model.dto.AuthResult;
import com.asistencia.attendance_system.model.entity.Practicante;
import com.asistencia.attendance_system.model.entity.Vigilante;
import com.asistencia.attendance_system.model.enums.Situacion;
import com.asistencia.attendance_system.repository.AdministradorRepository;
import com.asistencia.attendance_system.repository.PracticanteRepository;
import com.asistencia.attendance_system.repository.VigilanteRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

/**
 * C-06: una cuenta desactivada no recibe JWT nuevo y ve mensaje claro.
 * Con credencial incorrecta o usuario inexistente se mantiene el genérico.
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
public class AuthDesactivadaTest {

    @Mock private PracticanteRepository practicanteRepository;
    @Mock private VigilanteRepository vigilanteRepository;
    @Mock private AdministradorRepository administradorRepository;

    private AuthService authService;

    @BeforeEach
    public void setup() {
        authService = new AuthService(practicanteRepository, vigilanteRepository,
                administradorRepository, new BCryptPasswordEncoder());
    }

    private Practicante practicanteInactivo(String passBCrypt) {
        Practicante p = new Practicante();
        p.setIdPracticante(7L);
        p.setUsuario("60563764");
        p.setDocumento("60563764");
        p.setNombre("T");
        p.setApellido("C");
        p.setSituacion(Situacion.INACTIVO);
        p.setContrasena(passBCrypt);
        return p;
    }

    @Test
    public void login_practicanteInactivoConClaveCorrecta_mensajeDesactivada() {
        String hash = new BCryptPasswordEncoder().encode("60563764");
        when(practicanteRepository.findByUsuario("60563764"))
                .thenReturn(Optional.of(practicanteInactivo(hash)));
        BusinessException ex = assertThrows(BusinessException.class,
                () -> authService.authenticate("60563764", "60563764"));
        assertTrue(ex.getMessage().toLowerCase().contains("desactivada"),
                "Mensaje fue: " + ex.getMessage());
    }

    @Test
    public void login_practicanteInactivoConClaveIncorrecta_generico() {
        String hash = new BCryptPasswordEncoder().encode("60563764");
        when(practicanteRepository.findByUsuario("60563764"))
                .thenReturn(Optional.of(practicanteInactivo(hash)));
        BusinessException ex = assertThrows(BusinessException.class,
                () -> authService.authenticate("60563764", "otra"));
        assertFalse(ex.getMessage().toLowerCase().contains("desactivada"),
                "Mensaje fue: " + ex.getMessage());
    }

    @Test
    public void login_vigilanteInactivoConClaveCorrecta_mensajeDesactivada() {
        Vigilante v = new Vigilante();
        v.setIdVigilante(10);
        v.setUsuario("vig1");
        v.setContrasena("pass1");
        v.setEstado(false);
        when(vigilanteRepository.findByUsuario("vig1")).thenReturn(Optional.of(v));
        BusinessException ex = assertThrows(BusinessException.class,
                () -> authService.authenticate("vig1", "pass1"));
        assertTrue(ex.getMessage().toLowerCase().contains("desactivada"),
                "Mensaje fue: " + ex.getMessage());
    }

    @Test
    public void login_usuarioInexistente_generico() {
        when(practicanteRepository.findByUsuario(anyString())).thenReturn(Optional.empty());
        when(practicanteRepository.findByDocumento(anyString())).thenReturn(Optional.empty());
        when(vigilanteRepository.findByUsuario(anyString())).thenReturn(Optional.empty());
        when(administradorRepository.findByUsuario(anyString())).thenReturn(Optional.empty());
        BusinessException ex = assertThrows(BusinessException.class,
                () -> authService.authenticate("nadie", "x"));
        assertFalse(ex.getMessage().toLowerCase().contains("desactivada"),
                "Mensaje fue: " + ex.getMessage());
    }

    @Test
    public void login_practicanteActivo_ok() {
        Practicante p = practicanteInactivo(new BCryptPasswordEncoder().encode("60563764"));
        p.setSituacion(Situacion.ACTIVO);
        when(practicanteRepository.findByUsuario("60563764")).thenReturn(Optional.of(p));
        AuthResult r = authService.authenticate("60563764", "60563764");
        assertEquals("PRACTICANTE", r.getRol());
        assertEquals("60563764", r.getDocumento());
    }
}
