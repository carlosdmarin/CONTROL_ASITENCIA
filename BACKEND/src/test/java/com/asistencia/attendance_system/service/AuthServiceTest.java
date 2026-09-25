package com.asistencia.attendance_system.service;

import com.asistencia.attendance_system.model.dto.AuthResult;
import com.asistencia.attendance_system.model.entity.Practicante;
import com.asistencia.attendance_system.model.entity.Trabajador;
import com.asistencia.attendance_system.model.entity.Vigilante;
import com.asistencia.attendance_system.model.enums.Situacion;
import com.asistencia.attendance_system.repository.PracticanteRepository;
import com.asistencia.attendance_system.repository.TrabajadorRepository;
import com.asistencia.attendance_system.repository.VigilanteRepository;
import com.asistencia.attendance_system.model.entity.Sede;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
public class AuthServiceTest {

    @Mock
    private PracticanteRepository practicanteRepository;
    @Mock
    private VigilanteRepository vigilanteRepository;
    @Mock
    private TrabajadorRepository trabajadorRepository;

    private PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private AuthService authService;

    @BeforeEach
    void setup() {
        authService = new AuthService(practicanteRepository, vigilanteRepository, trabajadorRepository, passwordEncoder);
        ReflectionTestUtils.setField(authService, "rrhhWorkerIds", "87");
    }

    private Practicante practicanteActivo(String usuario, String contrasena) {
        Practicante p = new Practicante();
        p.setIdPracticante(1L);
        p.setNombre("Ana");
        p.setApellido("Ruiz");
        p.setDocumento("70000001");
        p.setUsuario(usuario);
        p.setContrasena(contrasena);
        p.setSituacion(Situacion.ACTIVO);
        Sede sede = new Sede();
        sede.setIdSede(1);
        // Use reflection to set nombre via field or set via setter if exists
        // Sede has setNombre
        sede.setNombre("Pucallpa");
        p.setSede(sede);
        return p;
    }

    private Vigilante vigilanteActivo(String usuario, String hash) {
        Vigilante v = new Vigilante();
        v.setIdVigilante(10);
        v.setNombre("Juan");
        v.setApellido("Perez");
        v.setUsuario(usuario);
        v.setContrasena(hash);
        v.setEstado(true);
        return v;
    }

    private Trabajador trabajadorRRHH(String usuario, String hash) {
        Trabajador t = new Trabajador();
        t.setIdTrabajador(87);
        t.setNombres("KELITA");
        t.setApellidos("HARO TAMANI");
        t.setUsuario(usuario);
        t.setPasswordUser(hash);
        t.setNroDoc("75257890");
        t.setCodTrab("00424");
        t.setEstado(1);
        t.setEstadoUsuario(1);
        t.setIdRol(2);
        t.setIdSede(1);
        return t;
    }

    @Test
    void practicanteActivoLegacyCorrectoAutenticaYMigra() {
        String raw = "70000001";
        Practicante p = practicanteActivo("ana_ruiz", raw); // legacy plain
        when(practicanteRepository.findByUsuario("ana_ruiz")).thenReturn(Optional.of(p));
        when(practicanteRepository.save(any(Practicante.class))).thenAnswer(i -> i.getArgument(0));

        AuthResult result = authService.authenticate("ana_ruiz", raw);
        assertEquals("PRACTICANTE", result.getRol());
        assertEquals("ana_ruiz", result.getUsuario());
        // Verificar migración
        verify(practicanteRepository).save(any(Practicante.class));
        // Nuevo hash debe validar con BCrypt
        assertTrue(passwordEncoder.matches(raw, p.getContrasena()));
        assertNotEquals(raw, p.getContrasena());
    }

    @Test
    void practicanteLegacyIncorrectoRechaza() {
        Practicante p = practicanteActivo("ana", "correcto");
        when(practicanteRepository.findByUsuario("ana")).thenReturn(Optional.of(p));
        assertThrows(Exception.class, () -> authService.authenticate("ana", "incorrecto"));
        verify(practicanteRepository, never()).save(any());
    }

    @Test
    void practicanteInactivoRechaza() {
        Practicante p = practicanteActivo("ana", "pass");
        p.setSituacion(Situacion.INACTIVO);
        when(practicanteRepository.findByUsuario("ana")).thenReturn(Optional.of(p));
        when(vigilanteRepository.findByUsuario("ana")).thenReturn(Optional.empty());
        when(trabajadorRepository.findByUsuario("ana")).thenReturn(Optional.empty());
        // También por documento
        when(practicanteRepository.findByDocumento("ana")).thenReturn(Optional.empty());
        assertThrows(Exception.class, () -> authService.authenticate("ana", "pass"));
    }

    @Test
    void practicanteLegacyMigraYValidaConBCrypt() {
        String raw = "70000002";
        Practicante p = practicanteActivo("test", raw);
        when(practicanteRepository.findByUsuario("test")).thenReturn(Optional.of(p));
        when(practicanteRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        authService.authenticate("test", raw);
        String newHash = p.getContrasena();
        assertTrue(newHash.startsWith("$2a$") || newHash.startsWith("$2b$"));
        assertTrue(passwordEncoder.matches(raw, newHash));
    }

    @Test
    void trabajadorAutorizadoCorrecto() {
        String raw = "RRHHpass123";
        String hash = passwordEncoder.encode(raw);
        Trabajador t = trabajadorRRHH("75257890", hash);
        when(trabajadorRepository.findByUsuario("75257890")).thenReturn(Optional.of(t));
        when(practicanteRepository.findByUsuario("75257890")).thenReturn(Optional.empty());
        when(practicanteRepository.findByDocumento("75257890")).thenReturn(Optional.empty());
        when(vigilanteRepository.findByUsuario("75257890")).thenReturn(Optional.empty());

        AuthResult r = authService.authenticate("75257890", raw);
        assertEquals("RRHH", r.getRol());
        assertEquals(87L, r.getId());
    }

    @Test
    void trabajadorPasswordIncorrectoRechaza() {
        String hash = passwordEncoder.encode("correcto");
        Trabajador t = trabajadorRRHH("75257890", hash);
        when(trabajadorRepository.findByUsuario("75257890")).thenReturn(Optional.of(t));
        when(practicanteRepository.findByUsuario(anyString())).thenReturn(Optional.empty());
        when(practicanteRepository.findByDocumento(anyString())).thenReturn(Optional.empty());
        when(vigilanteRepository.findByUsuario(anyString())).thenReturn(Optional.empty());
        assertThrows(Exception.class, () -> authService.authenticate("75257890", "incorrecto"));
    }

    @Test
    void trabajadorEstado0Rechaza() {
        Trabajador t = trabajadorRRHH("75257890", passwordEncoder.encode("pass"));
        t.setEstado(0);
        when(trabajadorRepository.findByUsuario("75257890")).thenReturn(Optional.of(t));
        when(practicanteRepository.findByUsuario(anyString())).thenReturn(Optional.empty());
        when(practicanteRepository.findByDocumento(anyString())).thenReturn(Optional.empty());
        when(vigilanteRepository.findByUsuario(anyString())).thenReturn(Optional.empty());
        assertThrows(Exception.class, () -> authService.authenticate("75257890", "pass"));
    }

    @Test
    void trabajadorEstadoUsuario0Rechaza() {
        Trabajador t = trabajadorRRHH("75257890", passwordEncoder.encode("pass"));
        t.setEstadoUsuario(0);
        when(trabajadorRepository.findByUsuario("75257890")).thenReturn(Optional.of(t));
        when(practicanteRepository.findByUsuario(anyString())).thenReturn(Optional.empty());
        when(practicanteRepository.findByDocumento(anyString())).thenReturn(Optional.empty());
        when(vigilanteRepository.findByUsuario(anyString())).thenReturn(Optional.empty());
        assertThrows(Exception.class, () -> authService.authenticate("75257890", "pass"));
    }

    @Test
    void trabajadorNoAutorizadoRechaza() {
        Trabajador t = trabajadorRRHH("75257890", passwordEncoder.encode("pass"));
        t.setIdTrabajador(99); // no está en lista 87
        when(trabajadorRepository.findByUsuario("75257890")).thenReturn(Optional.of(t));
        when(practicanteRepository.findByUsuario(anyString())).thenReturn(Optional.empty());
        when(practicanteRepository.findByDocumento(anyString())).thenReturn(Optional.empty());
        when(vigilanteRepository.findByUsuario(anyString())).thenReturn(Optional.empty());
        assertThrows(Exception.class, () -> authService.authenticate("75257890", "pass"));
    }

    @Test
    void vigilanteActivoCorrecto() {
        String raw = "vigilantePass";
        String hash = passwordEncoder.encode(raw);
        Vigilante v = vigilanteActivo("vig1", hash);
        when(vigilanteRepository.findByUsuario("vig1")).thenReturn(Optional.of(v));
        when(practicanteRepository.findByUsuario(anyString())).thenReturn(Optional.empty());
        when(practicanteRepository.findByDocumento(anyString())).thenReturn(Optional.empty());
        when(trabajadorRepository.findByUsuario(anyString())).thenReturn(Optional.empty());
        // Mock email fallback
        when(trabajadorRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        AuthResult r = authService.authenticate("vig1", raw);
        assertEquals("VIGILANTE", r.getRol());
    }

    @Test
    void vigilanteEstadoFalseRechaza() {
        Vigilante v = vigilanteActivo("vig1", passwordEncoder.encode("pass"));
        v.setEstado(false);
        when(vigilanteRepository.findByUsuario("vig1")).thenReturn(Optional.of(v));
        when(practicanteRepository.findByUsuario(anyString())).thenReturn(Optional.empty());
        when(practicanteRepository.findByDocumento(anyString())).thenReturn(Optional.empty());
        when(trabajadorRepository.findByUsuario(anyString())).thenReturn(Optional.empty());
        when(trabajadorRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        assertThrows(Exception.class, () -> authService.authenticate("vig1", "pass"));
    }

    @Test
    void vigilantePasswordIncorrectoRechaza() {
        Vigilante v = vigilanteActivo("vig1", passwordEncoder.encode("correcto"));
        when(vigilanteRepository.findByUsuario("vig1")).thenReturn(Optional.of(v));
        when(practicanteRepository.findByUsuario(anyString())).thenReturn(Optional.empty());
        when(practicanteRepository.findByDocumento(anyString())).thenReturn(Optional.empty());
        when(trabajadorRepository.findByUsuario(anyString())).thenReturn(Optional.empty());
        when(trabajadorRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        assertThrows(Exception.class, () -> authService.authenticate("vig1", "incorrecto"));
    }

    @Test
    void ambiguedadMismoIdentificadorEnDosFuentesRechaza() {
        Practicante p = practicanteActivo("duplicado", "pass");
        p.setContrasena(passwordEncoder.encode("pass"));
        Vigilante v = vigilanteActivo("duplicado", passwordEncoder.encode("pass"));
        when(practicanteRepository.findByUsuario("duplicado")).thenReturn(Optional.of(p));
        when(vigilanteRepository.findByUsuario("duplicado")).thenReturn(Optional.of(v));
        // trabajador no encontrado
        when(trabajadorRepository.findByUsuario("duplicado")).thenReturn(Optional.empty());
        when(trabajadorRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        assertThrows(Exception.class, () -> authService.authenticate("duplicado", "pass"));
    }
}
