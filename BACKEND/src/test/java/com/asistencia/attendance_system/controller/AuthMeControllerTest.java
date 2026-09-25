package com.asistencia.attendance_system.controller;

import com.asistencia.attendance_system.model.entity.Practicante;
import com.asistencia.attendance_system.model.entity.Trabajador;
import com.asistencia.attendance_system.model.entity.Vigilante;
import com.asistencia.attendance_system.model.enums.Situacion;
import com.asistencia.attendance_system.repository.PracticanteRepository;
import com.asistencia.attendance_system.repository.TrabajadorRepository;
import com.asistencia.attendance_system.repository.VigilanteRepository;
import com.asistencia.attendance_system.security.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import jakarta.servlet.http.Cookie;

import java.util.Optional;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class AuthMeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @MockBean
    private PracticanteRepository practicanteRepository;

    @MockBean
    private VigilanteRepository vigilanteRepository;

    @MockBean
    private TrabajadorRepository trabajadorRepository;

    private Practicante practicanteActivo() {
        Practicante p = new Practicante();
        p.setIdPracticante(1L);
        p.setNombre("Ana");
        p.setApellido("Ruiz");
        p.setUsuario("ana_ruiz");
        p.setDocumento("70000001");
        p.setSituacion(Situacion.ACTIVO);
        return p;
    }

    private Vigilante vigilanteActivo() {
        Vigilante v = new Vigilante();
        v.setIdVigilante(10);
        v.setNombre("Juan");
        v.setApellido("Perez");
        v.setUsuario("vig1");
        v.setEstado(true);
        return v;
    }

    private Trabajador trabajadorRRHH() {
        Trabajador t = new Trabajador();
        t.setIdTrabajador(87);
        t.setNombres("KELITA");
        t.setApellidos("HARO TAMANI");
        t.setUsuario("75257890");
        t.setNroDoc("75257890");
        t.setEstado(1);
        t.setEstadoUsuario(1);
        t.setIdRol(2);
        return t;
    }

    @Test
    public void sinAutenticacion401() throws Exception {
        int status = mockMvc.perform(get("/api/auth/me")).andReturn().getResponse().getStatus();
        org.junit.jupiter.api.Assertions.assertTrue(status == 401 || status == 403);
    }

    @Test
    public void jwtValidoPracticante200() throws Exception {
        Practicante p = practicanteActivo();
        when(practicanteRepository.findById(1L)).thenReturn(Optional.of(p));

        String token = jwtService.generateToken("1", "PRACTICANTE", "practicante:1");
        Cookie cookie = new Cookie("practiqr_token", token);

        mockMvc.perform(get("/api/auth/me").cookie(cookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.authenticated").value(true))
                .andExpect(jsonPath("$.user.rol").value("PRACTICANTE"));
    }

    @Test
    public void jwtValidoVigilante200() throws Exception {
        Vigilante v = vigilanteActivo();
        when(vigilanteRepository.findById(10)).thenReturn(Optional.of(v));

        String token = jwtService.generateToken("10", "VIGILANTE", "vigilante:10");
        Cookie cookie = new Cookie("practiqr_token", token);

        mockMvc.perform(get("/api/auth/me").cookie(cookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.rol").value("VIGILANTE"));
    }

    @Test
    public void jwtValidoRRHH200() throws Exception {
        Trabajador t = trabajadorRRHH();
        when(trabajadorRepository.findById(87)).thenReturn(Optional.of(t));

        String token = jwtService.generateToken("87", "RRHH", "trabajadores:87");
        Cookie cookie = new Cookie("practiqr_token", token);

        mockMvc.perform(get("/api/auth/me").cookie(cookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.rol").value("RRHH"));
    }

    @Test
    public void jwtExpirado401() throws Exception {
        JwtService shortLived = new JwtService("practiqr-dev-secret-key-32-chars-long-local-only-123456", 1, "practiqr", "practiqr_token", 1, false, "Lax");
        String token = shortLived.generateToken("1", "PRACTICANTE", "practicante:1");
        Thread.sleep(10);
        Cookie cookie = new Cookie("practiqr_token", token);
        int status = mockMvc.perform(get("/api/auth/me").cookie(cookie)).andReturn().getResponse().getStatus();
        org.junit.jupiter.api.Assertions.assertTrue(status == 401 || status == 403);
    }

    @Test
    public void jwtInvalido401() throws Exception {
        Cookie cookie = new Cookie("practiqr_token", "invalido.manipulado.firma");
        int status = mockMvc.perform(get("/api/auth/me").cookie(cookie)).andReturn().getResponse().getStatus();
        org.junit.jupiter.api.Assertions.assertTrue(status == 401 || status == 403);
    }

    @Test
    public void usuarioDesactivadoPracticante401() throws Exception {
        Practicante p = practicanteActivo();
        p.setSituacion(Situacion.INACTIVO);
        when(practicanteRepository.findById(1L)).thenReturn(Optional.of(p));

        String token = jwtService.generateToken("1", "PRACTICANTE", "practicante:1");
        Cookie cookie = new Cookie("practiqr_token", token);

        mockMvc.perform(get("/api/auth/me").cookie(cookie))
                .andExpect(status().isUnauthorized());
    }

    @Test
    public void usuarioDesactivadoVigilante401() throws Exception {
        Vigilante v = vigilanteActivo();
        v.setEstado(false);
        when(vigilanteRepository.findById(10)).thenReturn(Optional.of(v));

        String token = jwtService.generateToken("10", "VIGILANTE", "vigilante:10");
        Cookie cookie = new Cookie("practiqr_token", token);

        mockMvc.perform(get("/api/auth/me").cookie(cookie))
                .andExpect(status().isUnauthorized());
    }

    @Test
    public void usuarioDesactivadoRRHHEstado0_401() throws Exception {
        Trabajador t = trabajadorRRHH();
        t.setEstado(0);
        when(trabajadorRepository.findById(87)).thenReturn(Optional.of(t));

        String token = jwtService.generateToken("87", "RRHH", "trabajadores:87");
        Cookie cookie = new Cookie("practiqr_token", token);

        mockMvc.perform(get("/api/auth/me").cookie(cookie))
                .andExpect(status().isUnauthorized());
    }

    @Test
    public void usuarioDesactivadoRRHHEstadoUsuario0_401() throws Exception {
        Trabajador t = trabajadorRRHH();
        t.setEstadoUsuario(0);
        when(trabajadorRepository.findById(87)).thenReturn(Optional.of(t));

        String token = jwtService.generateToken("87", "RRHH", "trabajadores:87");
        Cookie cookie = new Cookie("practiqr_token", token);

        mockMvc.perform(get("/api/auth/me").cookie(cookie))
                .andExpect(status().isUnauthorized());
    }
}
