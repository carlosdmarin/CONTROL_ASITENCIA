package com.asistencia.attendance_system.controller;

import com.asistencia.attendance_system.repository.SedeRepository;
import com.asistencia.attendance_system.repository.VigilanteRepository;
import com.asistencia.attendance_system.security.JwtService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@SpringBootTest
@AutoConfigureMockMvc
public class VigilanteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private VigilanteRepository vigilanteRepository;

    @Autowired
    private SedeRepository sedeRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void rrhhPuedeListarVigilantes200() throws Exception {
        String token = jwtService.generateToken("87", "RRHH", "trabajadores:87");
        Cookie cookie = new Cookie("practiqr_token", token);
        MvcResult result = mockMvc.perform(get("/api/vigilantes").cookie(cookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").exists())
                .andExpect(jsonPath("$[0].usuario").exists())
                .andExpect(jsonPath("$[0].nombre").exists())
                .andReturn();
        String body = result.getResponse().getContentAsString();
        assertFalse(body.toLowerCase().contains("contrasena"), "No debe exponer contrasena: " + body);
        assertFalse(body.toLowerCase().contains("password"), "No debe exponer password: " + body);
        // Verificar sede
        assertTrue(body.contains("sedeId") || body.contains("sedeNombre"), "Debe contener sede: " + body);
    }

    @Test
    public void vigilanteNoPuedeListar403() throws Exception {
        String token = jwtService.generateToken("1", "VIGILANTE", "vigilante:1");
        Cookie cookie = new Cookie("practiqr_token", token);
        mockMvc.perform(get("/api/vigilantes").cookie(cookie))
                .andExpect(status().isForbidden());
    }

    @Test
    public void practicanteNoPuedeListar403() throws Exception {
        String token = jwtService.generateToken("1", "PRACTICANTE", "practicante:1");
        Cookie cookie = new Cookie("practiqr_token", token);
        mockMvc.perform(get("/api/vigilantes").cookie(cookie))
                .andExpect(status().isForbidden());
    }

    @Test
    public void sinAuth401() throws Exception {
        int status = mockMvc.perform(get("/api/vigilantes")).andReturn().getResponse().getStatus();
        assertTrue(status == 401 || status == 403, "Sin auth debe ser 401/403 fue " + status);
    }

    @Test
    public void passwordNuncaExpuesta() throws Exception {
        String token = jwtService.generateToken("87", "RRHH", "trabajadores:87");
        Cookie cookie = new Cookie("practiqr_token", token);
        MvcResult result = mockMvc.perform(get("/api/vigilantes").cookie(cookie))
                .andExpect(status().isOk())
                .andReturn();
        String body = result.getResponse().getContentAsString().toLowerCase();
        assertFalse(body.contains("contrasena"), "Body no debe contener contrasena");
        assertFalse(body.contains("password"), "Body no debe contener password");
        // No verificar valor 123456 porque es también usuario legítimo
    }

    @Test
    public void sedeRealDevuelta() throws Exception {
        String token = jwtService.generateToken("87", "RRHH", "trabajadores:87");
        Cookie cookie = new Cookie("practiqr_token", token);
        MvcResult result = mockMvc.perform(get("/api/vigilantes").cookie(cookie))
                .andExpect(status().isOk())
                .andReturn();
        String body = result.getResponse().getContentAsString();
        // Verificar al menos un vigilante con sedeId 3 y sedeNombre SEDE PUCALLPA
        assertTrue(body.contains("\"sedeId\"") || body.contains("sedeId"), "Debe tener sedeId");
        assertTrue(body.contains("SEDE PUCALLPA") || body.contains("PUCALLPA"), "Debe tener sedeNombre real SEDE PUCALLPA, body: " + body);
    }

    // ===== POST /api/vigilantes =====

    @Test
    @Transactional
    public void rrhhPuedeCrearVigilante201() throws Exception {
        String token = jwtService.generateToken("87", "RRHH", "trabajadores:87");
        Cookie cookie = new Cookie("practiqr_token", token);
        String usuarioUnico = "testvig_" + UUID.randomUUID().toString().substring(0, 8);
        Integer sedeId = sedeRepository.findAll().stream().findFirst().map(s -> s.getIdSede()).orElse(3);
        Map<String, Object> body = Map.of(
                "nombre", "Test",
                "apellido", "Vigilante",
                "usuario", usuarioUnico,
                "contrasena", "Secret123!",
                "sedeId", sedeId
        );
        MvcResult result = mockMvc.perform(post("/api/vigilantes").cookie(cookie).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.usuario").value(usuarioUnico))
                .andExpect(jsonPath("$.nombre").value("Test"))
                .andExpect(jsonPath("$.estado").value(true))
                .andExpect(jsonPath("$.sedeId").value(sedeId))
                .andReturn();
        String resp = result.getResponse().getContentAsString();
        assertFalse(resp.toLowerCase().contains("contrasena"));
        assertFalse(resp.toLowerCase().contains("password"));
        // Verificar BCrypt en BD
        var opt = vigilanteRepository.findByUsuario(usuarioUnico);
        assertTrue(opt.isPresent(), "Debe haberse guardado");
        String hash = opt.get().getContrasena();
        assertNotEquals("Secret123!", hash, "No debe guardar texto plano");
        assertTrue(hash.startsWith("$2a$") || hash.startsWith("$2b$"), "Debe ser BCrypt: " + hash);
        assertTrue(passwordEncoder.matches("Secret123!", hash), "BCrypt debe validar");
    }

    @Test
    public void vigilanteNoPuedeCrear403() throws Exception {
        String token = jwtService.generateToken("1", "VIGILANTE", "vigilante:1");
        Cookie cookie = new Cookie("practiqr_token", token);
        Map<String, Object> body = Map.of(
                "nombre", "X", "apellido", "Y", "usuario", "nope_" + UUID.randomUUID().toString().substring(0,4),
                "contrasena", "pass123", "sedeId", 3);
        mockMvc.perform(post("/api/vigilantes").cookie(cookie).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isForbidden());
    }

    @Test
    public void practicanteNoPuedeCrear403() throws Exception {
        String token = jwtService.generateToken("1", "PRACTICANTE", "practicante:1");
        Cookie cookie = new Cookie("practiqr_token", token);
        Map<String, Object> body = Map.of(
                "nombre", "X", "apellido", "Y", "usuario", "nope2_" + UUID.randomUUID().toString().substring(0,4),
                "contrasena", "pass123", "sedeId", 3);
        mockMvc.perform(post("/api/vigilantes").cookie(cookie).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isForbidden());
    }

    @Test
    public void sinAuthNoPuedeCrear401() throws Exception {
        Map<String, Object> body = Map.of(
                "nombre", "X", "apellido", "Y", "usuario", "nope3",
                "contrasena", "pass", "sedeId", 3);
        int status = mockMvc.perform(post("/api/vigilantes").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andReturn().getResponse().getStatus();
        assertTrue(status == 401 || status == 403, "Sin auth 401/403 fue " + status);
    }

    @Test
    @Transactional
    public void crearUsuarioDuplicado409() throws Exception {
        String token = jwtService.generateToken("87", "RRHH", "trabajadores:87");
        Cookie cookie = new Cookie("practiqr_token", token);
        // 123456 ya existe (vigilante inicial)
        Map<String, Object> body = Map.of(
                "nombre", "Dup", "apellido", "Test", "usuario", "123456",
                "contrasena", "pass123", "sedeId", 3);
        MvcResult result = mockMvc.perform(post("/api/vigilantes").cookie(cookie).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isConflict())
                .andReturn();
        String resp = result.getResponse().getContentAsString();
        assertTrue(resp.toLowerCase().contains("usuario") || resp.toLowerCase().contains("registrado"));
    }

    @Test
    public void crearSedeInexistente400() throws Exception {
        String token = jwtService.generateToken("87", "RRHH", "trabajadores:87");
        Cookie cookie = new Cookie("practiqr_token", token);
        String usuarioUnico = "test_sede_" + UUID.randomUUID().toString().substring(0,6);
        Map<String, Object> body = Map.of(
                "nombre", "Test", "apellido", "Sede", "usuario", usuarioUnico,
                "contrasena", "pass123", "sedeId", 99999);
        mockMvc.perform(post("/api/vigilantes").cookie(cookie).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void crearValidacion400() throws Exception {
        String token = jwtService.generateToken("87", "RRHH", "trabajadores:87");
        Cookie cookie = new Cookie("practiqr_token", token);
        Map<String, Object> body = Map.of(
                "nombre", "", "apellido", "", "usuario", "   ",
                "contrasena", "", "sedeId", 3);
        mockMvc.perform(post("/api/vigilantes").cookie(cookie).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @Transactional
    public void postNoExponeContrasena() throws Exception {
        String token = jwtService.generateToken("87", "RRHH", "trabajadores:87");
        Cookie cookie = new Cookie("practiqr_token", token);
        String usuarioUnico = "test_nopass_" + UUID.randomUUID().toString().substring(0,6);
        Map<String, Object> body = Map.of(
                "nombre", "NoPass", "apellido", "Test", "usuario", usuarioUnico,
                "contrasena", "SuperSecret1", "sedeId", 3);
        MvcResult result = mockMvc.perform(post("/api/vigilantes").cookie(cookie).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andReturn();
        String resp = result.getResponse().getContentAsString().toLowerCase();
        assertFalse(resp.contains("contrasena"));
        assertFalse(resp.contains("password"));
        assertFalse(resp.contains("supersecret1"));
    }
}
