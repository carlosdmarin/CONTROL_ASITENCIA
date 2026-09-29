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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
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
        String token = jwtService.generateToken("1", "RRHH", "administradores:1");
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
        String token = jwtService.generateToken("1", "RRHH", "administradores:1");
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
        String token = jwtService.generateToken("1", "RRHH", "administradores:1");
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
        String token = jwtService.generateToken("1", "RRHH", "administradores:1");
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
        String token = jwtService.generateToken("1", "RRHH", "administradores:1");
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
        String token = jwtService.generateToken("1", "RRHH", "administradores:1");
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
        String token = jwtService.generateToken("1", "RRHH", "administradores:1");
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
        String token = jwtService.generateToken("1", "RRHH", "administradores:1");
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

    // ===== PUT /api/vigilantes/{id}/password =====

    @Test
    @Transactional
    public void rrhhPuedeCambiarContrasena204() throws Exception {
        String token = jwtService.generateToken("1", "RRHH", "administradores:1");
        Cookie cookie = new Cookie("practiqr_token", token);
        // Crear vigilante temporal para no afectar al id 1
        String usuarioUnico = "test_pwd_" + UUID.randomUUID().toString().substring(0,6);
        Integer sedeId = sedeRepository.findAll().stream().findFirst().map(s -> s.getIdSede()).orElse(3);
        Map<String, Object> createBody = Map.of(
                "nombre", "Pwd", "apellido", "Test", "usuario", usuarioUnico,
                "contrasena", "OldPass123!", "sedeId", sedeId);
        MvcResult created = mockMvc.perform(post("/api/vigilantes").cookie(cookie).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createBody)))
                .andExpect(status().isCreated())
                .andReturn();
        Integer newId = objectMapper.readTree(created.getResponse().getContentAsString()).get("id").asInt();
        String nombreAntes = objectMapper.readTree(created.getResponse().getContentAsString()).get("nombre").asText();
        // Cambiar contraseña
        Map<String, Object> pwdBody = Map.of(
                "nuevaContrasena", "NuevaClave123!",
                "confirmarContrasena", "NuevaClave123!");
        MvcResult result = mockMvc.perform(put("/api/vigilantes/" + newId + "/password").cookie(cookie).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(pwdBody)))
                .andExpect(status().isNoContent())
                .andReturn();
        assertTrue(result.getResponse().getContentAsString().isEmpty() || result.getResponse().getContentAsString().equals(""), "204 debe tener body vacío");
        String body = result.getResponse().getContentAsString().toLowerCase();
        assertFalse(body.contains("contrasena"));
        assertFalse(body.contains("password"));
        // Verificar BCrypt y que otros campos no cambiaron
        var opt = vigilanteRepository.findById(newId);
        assertTrue(opt.isPresent());
        String hash = opt.get().getContrasena();
        assertNotEquals("NuevaClave123!", hash);
        assertTrue(hash.startsWith("$2a$") || hash.startsWith("$2b$"), "Debe ser BCrypt " + hash);
        assertTrue(passwordEncoder.matches("NuevaClave123!", hash));
        assertEquals("Pwd", opt.get().getNombre());
        assertEquals(nombreAntes, opt.get().getNombre());
    }

    @Test
    public void cambiarContrasenaVigilanteInexistente404() throws Exception {
        String token = jwtService.generateToken("1", "RRHH", "administradores:1");
        Cookie cookie = new Cookie("practiqr_token", token);
        Map<String, Object> body = Map.of(
                "nuevaContrasena", "Pass123!", "confirmarContrasena", "Pass123!");
        mockMvc.perform(put("/api/vigilantes/999999/password").cookie(cookie).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void cambiarContrasenaDiferentes400() throws Exception {
        String token = jwtService.generateToken("1", "RRHH", "administradores:1");
        Cookie cookie = new Cookie("practiqr_token", token);
        String usuarioUnico = "test_diff_" + UUID.randomUUID().toString().substring(0,6);
        Integer sedeId = sedeRepository.findAll().stream().findFirst().map(s -> s.getIdSede()).orElse(3);
        Map<String, Object> createBody = Map.of(
                "nombre", "Diff", "apellido", "Test", "usuario", usuarioUnico,
                "contrasena", "OldPass1!", "sedeId", sedeId);
        MvcResult created = mockMvc.perform(post("/api/vigilantes").cookie(cookie).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createBody)))
                .andExpect(status().isCreated()).andReturn();
        Integer newId = objectMapper.readTree(created.getResponse().getContentAsString()).get("id").asInt();
        String hashAntes = vigilanteRepository.findById(newId).get().getContrasena();
        Map<String, Object> pwdBody = Map.of(
                "nuevaContrasena", "Pass123!", "confirmarContrasena", "Otra456!");
        mockMvc.perform(put("/api/vigilantes/" + newId + "/password").cookie(cookie).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(pwdBody)))
                .andExpect(status().isBadRequest());
        // Verificar que no cambió
        String hashDespues = vigilanteRepository.findById(newId).get().getContrasena();
        assertEquals(hashAntes, hashDespues, "No debe haber cambiado con contraseñas diferentes");
    }

    @Test
    public void cambiarContrasenaCamposInvalidos400() throws Exception {
        String token = jwtService.generateToken("1", "RRHH", "administradores:1");
        Cookie cookie = new Cookie("practiqr_token", token);
        Map<String, Object> bodyVacio = Map.of(
                "nuevaContrasena", "", "confirmarContrasena", "");
        mockMvc.perform(put("/api/vigilantes/1/password").cookie(cookie).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bodyVacio)))
                .andExpect(status().isBadRequest());
        Map<String, Object> bodySoloEspacios = Map.of(
                "nuevaContrasena", "   ", "confirmarContrasena", "   ");
        mockMvc.perform(put("/api/vigilantes/1/password").cookie(cookie).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bodySoloEspacios)))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void vigilanteNoPuedeCambiarContrasena403() throws Exception {
        String token = jwtService.generateToken("1", "VIGILANTE", "vigilante:1");
        Cookie cookie = new Cookie("practiqr_token", token);
        Map<String, Object> body = Map.of(
                "nuevaContrasena", "Pass123!", "confirmarContrasena", "Pass123!");
        mockMvc.perform(put("/api/vigilantes/1/password").cookie(cookie).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isForbidden());
    }

    @Test
    public void practicanteNoPuedeCambiarContrasena403() throws Exception {
        String token = jwtService.generateToken("1", "PRACTICANTE", "practicante:1");
        Cookie cookie = new Cookie("practiqr_token", token);
        Map<String, Object> body = Map.of(
                "nuevaContrasena", "Pass123!", "confirmarContrasena", "Pass123!");
        mockMvc.perform(put("/api/vigilantes/1/password").cookie(cookie).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isForbidden());
    }

    @Test
    public void sinAuthNoPuedeCambiarContrasena401() throws Exception {
        Map<String, Object> body = Map.of(
                "nuevaContrasena", "Pass123!", "confirmarContrasena", "Pass123!");
        int status = mockMvc.perform(put("/api/vigilantes/1/password").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andReturn().getResponse().getStatus();
        assertTrue(status == 401 || status == 403, "Sin auth 401/403 fue " + status);
    }

    @Test
    @Transactional
    public void putNoExponeContrasena204() throws Exception {
        String token = jwtService.generateToken("1", "RRHH", "administradores:1");
        Cookie cookie = new Cookie("practiqr_token", token);
        String usuarioUnico = "test_nopass2_" + UUID.randomUUID().toString().substring(0,6);
        Integer sedeId = sedeRepository.findAll().stream().findFirst().map(s -> s.getIdSede()).orElse(3);
        Map<String, Object> createBody = Map.of(
                "nombre", "NoExp", "apellido", "Test", "usuario", usuarioUnico,
                "contrasena", "InitPass1!", "sedeId", sedeId);
        MvcResult created = mockMvc.perform(post("/api/vigilantes").cookie(cookie).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createBody)))
                .andExpect(status().isCreated()).andReturn();
        Integer newId = objectMapper.readTree(created.getResponse().getContentAsString()).get("id").asInt();
        Map<String, Object> pwdBody = Map.of(
                "nuevaContrasena", "OtraClave123!", "confirmarContrasena", "OtraClave123!");
        MvcResult result = mockMvc.perform(put("/api/vigilantes/" + newId + "/password").cookie(cookie).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(pwdBody)))
                .andExpect(status().isNoContent())
                .andReturn();
        String resp = result.getResponse().getContentAsString().toLowerCase();
        assertFalse(resp.contains("contrasena"));
        assertFalse(resp.contains("password"));
        assertFalse(resp.contains("otraclave123!"));
        assertTrue(resp.isEmpty());
    }

    // ===== PATCH /api/vigilantes/{id}/estado =====

    @Test
    @Transactional
    public void rrhhPuedeDesactivarVigilante200() throws Exception {
        String token = jwtService.generateToken("1", "RRHH", "administradores:1");
        Cookie cookie = new Cookie("practiqr_token", token);
        String usuarioUnico = "test_desact_" + UUID.randomUUID().toString().substring(0,6);
        Integer sedeId = sedeRepository.findAll().stream().findFirst().map(s -> s.getIdSede()).orElse(3);
        Map<String, Object> createBody = Map.of(
                "nombre", "Desact", "apellido", "Test", "usuario", usuarioUnico,
                "contrasena", "Pass123!", "sedeId", sedeId);
        MvcResult created = mockMvc.perform(post("/api/vigilantes").cookie(cookie).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createBody)))
                .andExpect(status().isCreated()).andReturn();
        Integer newId = objectMapper.readTree(created.getResponse().getContentAsString()).get("id").asInt();
        String hashAntes = vigilanteRepository.findById(newId).get().getContrasena();
        String nombreAntes = vigilanteRepository.findById(newId).get().getNombre();
        Map<String, Object> body = Map.of("estado", false);
        MvcResult result = mockMvc.perform(patch("/api/vigilantes/" + newId + "/estado").cookie(cookie).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value(false))
                .andExpect(jsonPath("$.id").value(newId))
                .andReturn();
        String resp = result.getResponse().getContentAsString().toLowerCase();
        assertFalse(resp.contains("contrasena"));
        assertFalse(resp.contains("password"));
        var opt = vigilanteRepository.findById(newId);
        assertTrue(opt.isPresent());
        assertEquals(false, opt.get().getEstado());
        assertEquals(nombreAntes, opt.get().getNombre());
        assertEquals(hashAntes, opt.get().getContrasena(), "Contraseña no debe cambiar al cambiar estado");
    }

    @Test
    @Transactional
    public void rrhhPuedeActivarVigilante200() throws Exception {
        String token = jwtService.generateToken("1", "RRHH", "administradores:1");
        Cookie cookie = new Cookie("practiqr_token", token);
        String usuarioUnico = "test_act_" + UUID.randomUUID().toString().substring(0,6);
        Integer sedeId = sedeRepository.findAll().stream().findFirst().map(s -> s.getIdSede()).orElse(3);
        Map<String, Object> createBody = Map.of(
                "nombre", "Activ", "apellido", "Test", "usuario", usuarioUnico,
                "contrasena", "Pass123!", "sedeId", sedeId);
        MvcResult created = mockMvc.perform(post("/api/vigilantes").cookie(cookie).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createBody)))
                .andExpect(status().isCreated()).andReturn();
        Integer newId = objectMapper.readTree(created.getResponse().getContentAsString()).get("id").asInt();
        // Desactivar primero
        mockMvc.perform(patch("/api/vigilantes/" + newId + "/estado").cookie(cookie).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("estado", false))))
                .andExpect(status().isOk());
        // Activar
        MvcResult result = mockMvc.perform(patch("/api/vigilantes/" + newId + "/estado").cookie(cookie).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("estado", true))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value(true))
                .andReturn();
        assertFalse(result.getResponse().getContentAsString().toLowerCase().contains("contrasena"));
        assertEquals(true, vigilanteRepository.findById(newId).get().getEstado());
    }

    @Test
    public void cambiarEstadoVigilanteInexistente404() throws Exception {
        String token = jwtService.generateToken("1", "RRHH", "administradores:1");
        Cookie cookie = new Cookie("practiqr_token", token);
        Map<String, Object> body = Map.of("estado", false);
        mockMvc.perform(patch("/api/vigilantes/999999/estado").cookie(cookie).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isNotFound());
    }

    @Test
    public void cambiarEstadoInvalido400() throws Exception {
        String token = jwtService.generateToken("1", "RRHH", "administradores:1");
        Cookie cookie = new Cookie("practiqr_token", token);
        // Sin campo
        mockMvc.perform(patch("/api/vigilantes/1/estado").cookie(cookie).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
        // null
        mockMvc.perform(patch("/api/vigilantes/1/estado").cookie(cookie).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"estado\": null}"))
                .andExpect(status().isBadRequest());
        // tipo incorrecto string
        String badJson = "{\"estado\": \"ACTIVO\"}";
        mockMvc.perform(patch("/api/vigilantes/1/estado").cookie(cookie).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(badJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void vigilanteNoPuedeCambiarEstado403() throws Exception {
        String token = jwtService.generateToken("1", "VIGILANTE", "vigilante:1");
        Cookie cookie = new Cookie("practiqr_token", token);
        Map<String, Object> body = Map.of("estado", false);
        mockMvc.perform(patch("/api/vigilantes/1/estado").cookie(cookie).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isForbidden());
    }

    @Test
    public void practicanteNoPuedeCambiarEstado403() throws Exception {
        String token = jwtService.generateToken("1", "PRACTICANTE", "practicante:1");
        Cookie cookie = new Cookie("practiqr_token", token);
        Map<String, Object> body = Map.of("estado", true);
        mockMvc.perform(patch("/api/vigilantes/1/estado").cookie(cookie).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isForbidden());
    }

    @Test
    public void sinAuthNoPuedeCambiarEstado401() throws Exception {
        Map<String, Object> body = Map.of("estado", false);
        int status = mockMvc.perform(patch("/api/vigilantes/1/estado").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andReturn().getResponse().getStatus();
        assertTrue(status == 401 || status == 403, "Sin auth 401/403 fue " + status);
    }

    @Test
    @Transactional
    public void vigilanteInactivoNoPuedeLogearse() throws Exception {
        String token = jwtService.generateToken("1", "RRHH", "administradores:1");
        Cookie cookie = new Cookie("practiqr_token", token);
        String usuarioUnico = "test_inact_" + UUID.randomUUID().toString().substring(0,6);
        String pass = "PassInact123!";
        Integer sedeId = sedeRepository.findAll().stream().findFirst().map(s -> s.getIdSede()).orElse(3);
        Map<String, Object> createBody = Map.of(
                "nombre", "Inact", "apellido", "Test", "usuario", usuarioUnico,
                "contrasena", pass, "sedeId", sedeId);
        MvcResult created = mockMvc.perform(post("/api/vigilantes").cookie(cookie).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createBody)))
                .andExpect(status().isCreated()).andReturn();
        Integer newId = objectMapper.readTree(created.getResponse().getContentAsString()).get("id").asInt();
        // Desactivar
        mockMvc.perform(patch("/api/vigilantes/" + newId + "/estado").cookie(cookie).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("estado", false))))
                .andExpect(status().isOk());
        // Intentar login como vigilante inactivo -> 401
        String loginJson = objectMapper.writeValueAsString(Map.of("usuario", usuarioUnico, "contrasena", pass));
        mockMvc.perform(post("/api/auth/login").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson))
                .andExpect(status().isUnauthorized());
        // Reactivar y login debe funcionar
        mockMvc.perform(patch("/api/vigilantes/" + newId + "/estado").cookie(cookie).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("estado", true))))
                .andExpect(status().isOk());
        mockMvc.perform(post("/api/auth/login").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.rol").value("VIGILANTE"));
    }
}
