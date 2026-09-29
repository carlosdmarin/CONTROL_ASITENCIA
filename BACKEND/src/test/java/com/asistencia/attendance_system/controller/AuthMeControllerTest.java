package com.asistencia.attendance_system.controller;

import com.asistencia.attendance_system.model.entity.Administrador;
import com.asistencia.attendance_system.model.entity.Practicante;
import com.asistencia.attendance_system.model.entity.Vigilante;
import com.asistencia.attendance_system.model.enums.Situacion;
import com.asistencia.attendance_system.repository.AdministradorRepository;
import com.asistencia.attendance_system.repository.PracticanteRepository;
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
    private AdministradorRepository administradorRepository;

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

    private Administrador administrador() {
        Administrador a = new Administrador();
        a.setId(1L);
        a.setUsuario("admin");
        return a;
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
        Administrador a = administrador();
        when(administradorRepository.findById(1L)).thenReturn(Optional.of(a));

        String token = jwtService.generateToken("1", "RRHH", "administradores:1");
        Cookie cookie = new Cookie("practiqr_token", token);

        mockMvc.perform(get("/api/auth/me").cookie(cookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.authenticated").value(true))
                .andExpect(jsonPath("$.user.rol").value("RRHH"))
                .andExpect(jsonPath("$.user.usuario").value("admin"));
    }

    @Test
    public void jwtExpirado401() throws Exception {
        String secret = System.getenv("JWT_SECRET");
        org.junit.jupiter.api.Assertions.assertNotNull(secret, "JWT_SECRET debe estar configurado para ejecutar las pruebas");
        org.junit.jupiter.api.Assertions.assertFalse(secret.isBlank(), "JWT_SECRET no debe estar vacío para ejecutar las pruebas");
        JwtService shortLived = new JwtService(secret, 1, "practiqr", "practiqr_token", 1, false, "Lax");
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
    public void administradorEliminado401() throws Exception {
        when(administradorRepository.findById(1L)).thenReturn(Optional.empty());

        String token = jwtService.generateToken("1", "RRHH", "administradores:1");
        Cookie cookie = new Cookie("practiqr_token", token);

        mockMvc.perform(get("/api/auth/me").cookie(cookie))
                .andExpect(status().isUnauthorized());
    }
}
