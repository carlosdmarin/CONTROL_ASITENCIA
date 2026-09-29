package com.asistencia.attendance_system.controller;

import com.asistencia.attendance_system.model.dto.AuthResult;
import com.asistencia.attendance_system.security.JwtService;
import com.asistencia.attendance_system.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseCookie;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import jakarta.servlet.http.Cookie;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@SpringBootTest
@AutoConfigureMockMvc
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @MockBean
    private AuthService authService;

    @Autowired
    private ObjectMapper objectMapper;

    private AuthResult rrhhResult() {
        return AuthResult.builder()
                .id(1L).nombre("admin").usuario("admin")
                .rol("RRHH").documento(null).sid("administradores:1").source("administradores")
                .build();
    }

    private AuthResult practicanteResult() {
        return AuthResult.builder()
                .id(1L).nombre("Ana Ruiz").usuario("70000001")
                .rol("PRACTICANTE").documento("70000001").sid("practicante:1").source("practicante")
                .build();
    }

    private AuthResult vigilanteResult() {
        return AuthResult.builder()
                .id(10L).nombre("Juan Perez").usuario("vig1")
                .rol("VIGILANTE").documento("vig1").sid("vigilante:10").source("vigilante")
                .build();
    }

    @Test
    public void testLoginValidoRRHH() throws Exception {
        AuthResult authResult = rrhhResult();
        when(authService.authenticate("admin", "pass")).thenReturn(authResult);

        String json = "{\"usuario\":\"admin\",\"contrasena\":\"pass\"}";
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.authenticated").value(true))
                .andExpect(jsonPath("$.user.rol").value("RRHH"))
                .andReturn();

        var cookies = result.getResponse().getHeaders("Set-Cookie");
        assertNotNull(cookies);
        String practiqrCookie = cookies.stream().filter(c -> c.contains("practiqr_token")).findFirst().orElse(null);
        assertNotNull(practiqrCookie, "Debe existir Set-Cookie practiqr_token, headers: " + cookies);
        assertTrue(practiqrCookie.contains("practiqr_token"));
        assertFalse(result.getResponse().getContentAsString().contains("practiqr_token"), "JWT no debe aparecer en JSON");
    }

    @Test
    public void testLoginPracticante() throws Exception {
        when(authService.authenticate(anyString(), anyString())).thenReturn(practicanteResult());
        String json = "{\"usuario\":\"70000001\",\"contrasena\":\"70000001\"}";
        mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.rol").value("PRACTICANTE"))
                .andExpect(jsonPath("$.user.documento").value("70000001"));
    }

    @Test
    public void testLoginVigilante() throws Exception {
        when(authService.authenticate(anyString(), anyString())).thenReturn(vigilanteResult());
        String json = "{\"usuario\":\"vig1\",\"contrasena\":\"pass\"}";
        mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.rol").value("VIGILANTE"));
    }

    @Test
    public void testLoginRRHH() throws Exception {
        when(authService.authenticate(anyString(), anyString())).thenReturn(rrhhResult());
        String json = "{\"usuario\":\"admin\",\"contrasena\":\"pass\"}";
        mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.rol").value("RRHH"));
    }

    @Test
    public void testCredencialesInvalidas401() throws Exception {
        when(authService.authenticate(anyString(), anyString())).thenThrow(new com.asistencia.attendance_system.excepcion.BusinessException("Usuario o contraseña incorrectos", org.springframework.http.HttpStatus.UNAUTHORIZED));
        String json = "{\"usuario\":\"bad\",\"contrasena\":\"bad\"}";
        MvcResult result = mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content(json))
                .andExpect(status().isUnauthorized())
                .andReturn();
        var cookies = result.getResponse().getHeaders("Set-Cookie");
        String practiqrCookie = cookies != null ? cookies.stream().filter(c -> c.contains("practiqr_token")).findFirst().orElse(null) : null;
        assertTrue(practiqrCookie == null || practiqrCookie.contains("Max-Age=0"), "No debe existir cookie de auth válida en 401, headers: " + cookies);
    }

    @Test
    public void testRequestInvalido400() throws Exception {
        String json = "{\"usuario\":\"\",\"contrasena\":\"\"}";
        mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content(json))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void testCookieAtributos() throws Exception {
        when(authService.authenticate(anyString(), anyString())).thenReturn(rrhhResult());
        String json = "{\"usuario\":\"admin\",\"contrasena\":\"pass\"}";
        MvcResult result = mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content(json))
                .andExpect(status().isOk())
                .andReturn();
        var cookies = result.getResponse().getHeaders("Set-Cookie");
        String header = cookies.stream().filter(c -> c.contains("practiqr_token")).findFirst().orElse(null);
        assertNotNull(header, "Debe existir practiqr_token, headers: " + cookies);
        assertTrue(header.contains("HttpOnly"), "HttpOnly " + header);
        assertTrue(header.contains("Path=/"), "Path=/ " + header);
        assertTrue(header.contains("Max-Age=28800"), "Max-Age 28800 " + header);
        assertTrue(header.toLowerCase().contains("samesite=lax"), "SameSite Lax " + header);
        // Secure es configurable ${JWT_COOKIE_SECURE:false} en local http -> false, prod https -> true
        assertTrue(header.contains("SameSite"), "SameSite presente " + header);
    }

    @Test
    public void testLogoutEliminaCookie() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/logout"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.authenticated").value(false))
                .andReturn();
        var cookies = result.getResponse().getHeaders("Set-Cookie");
        String header = cookies.stream().filter(c -> c.contains("practiqr_token")).findFirst().orElse(null);
        assertNotNull(header, "Debe existir practiqr_token en logout, headers: " + cookies);
        assertTrue(header.contains("practiqr_token"));
        assertTrue(header.contains("Max-Age=0"));
    }

    @Test
    public void testJwtRealExtraccion() throws Exception {
        // Usar JwtService real para generar y validar
        String token = jwtService.generateToken("1", "RRHH", "administradores:1");
        assertEquals("1", jwtService.getSubject(token));
        assertEquals("RRHH", jwtService.getRol(token));
        assertEquals("administradores:1", jwtService.getSid(token));
        assertEquals("practiqr", jwtService.getIssuer(token));
        assertTrue(jwtService.isValid(token));
        // No mostrar token en logs
        assertNotNull(token);
    }

    @Test
    public void testAutorizacionConJwtValido() throws Exception {
        String token = jwtService.generateToken("1", "RRHH", "administradores:1");
        Cookie cookie = new Cookie("practiqr_token", token);
        // Endpoint protegido debe pasar con cookie válida
        int status = mockMvc.perform(get("/api/practicantes").cookie(cookie)).andReturn().getResponse().getStatus();
        assertEquals(200, status);
    }

    @Test
    public void testAutorizacionVigilanteRol() throws Exception {
        String token = jwtService.generateToken("10", "VIGILANTE", "vigilante:10");
        Cookie cookie = new Cookie("practiqr_token", token);
        // VIGILANTE no tiene acceso a lista de practicantes (RRHH only)
        int status = mockMvc.perform(get("/api/practicantes").cookie(cookie)).andReturn().getResponse().getStatus();
        assertEquals(403, status);
        assertEquals("VIGILANTE", jwtService.getRol(token));
        // Pero VIGILANTE sí debe poder acceder a endpoints de marcación (probado en AuthorizationTest)
    }
}
