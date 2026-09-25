package com.asistencia.attendance_system.security;

import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.ResponseCookie;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class JwtFilterAndCookieCorsTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @Test
    public void sinCookieNoAutenticado() throws Exception {
        int status = mockMvc.perform(get("/api/practicantes")).andReturn().getResponse().getStatus();
        assertTrue(status == 401 || status == 403, "Sin cookie debe ser 401/403, fue " + status);
    }

    @Test
    public void cookieValidaAutentica() throws Exception {
        String token = jwtService.generateToken("87", "RRHH", "trabajadores:87");
        Cookie cookie = new Cookie("practiqr_token", token);
        // Con cookie válida, endpoint protegido debe pasar (200) porque token válido
        // Si no hay datos, puede ser 200 con lista vacía, pero no 401/403
        int status = mockMvc.perform(get("/api/practicantes").cookie(cookie)).andReturn().getResponse().getStatus();
        assertTrue(status == 200, "Con cookie válida debe ser 200, fue " + status);
        // Verificar que el contexto tenga ROLE_RRHH indirectamente: no hay endpoint que devuelva rol, pero status 200 indica autenticado
    }

    @Test
    public void cookieInvalidaNoAutentica() throws Exception {
        Cookie cookie = new Cookie("practiqr_token", "invalido.manipulado.firma");
        int status = mockMvc.perform(get("/api/practicantes").cookie(cookie)).andReturn().getResponse().getStatus();
        assertTrue(status == 401 || status == 403, "Cookie inválida debe ser 401/403, fue " + status);
    }

    @Test
    public void rolVigilanteSeConvierteCorrectamente() throws Exception {
        String token = jwtService.generateToken("10", "VIGILANTE", "vigilante:10");
        Cookie cookie = new Cookie("practiqr_token", token);
        // VIGILANTE no debe acceder a /api/practicantes (lista) que es exclusivo RRHH → 403
        int status = mockMvc.perform(get("/api/practicantes").cookie(cookie)).andReturn().getResponse().getStatus();
        assertEquals(403, status, "VIGILANTE no debe acceder a lista practicantes (RRHH only), debe ser 403, fue " + status);
        // Verificar claim rol
        assertEquals("VIGILANTE", jwtService.getRol(token));
    }

    @Test
    public void cookieContieneAtributosCorrectos() {
        String token = jwtService.generateToken("87", "RRHH", "trabajadores:87");
        ResponseCookie cookie = jwtService.createCookie(token);
        String header = cookie.toString();
        // HttpOnly
        assertTrue(header.contains("HttpOnly"), "Cookie debe ser HttpOnly: " + header);
        // Path=/
        assertTrue(header.contains("Path=/"), "Cookie debe tener Path=/ : " + header);
        // Max-Age=28800
        assertTrue(header.contains("Max-Age=28800"), "Cookie debe tener Max-Age=28800 : " + header);
        // SameSite=Lax para same-origin via Next.js rewrite (más seguro que None)
        assertTrue(header.toLowerCase().contains("samesite=lax"), "Cookie debe tener SameSite=Lax : " + header);
        // Secure true (HTTPS trycloudflare)
        assertTrue(header.contains("Secure"), "Secure debe ser true: " + header);
    }

    @Test
    public void corsOrigenLocalhostPermitido() throws Exception {
        MvcResult result = mockMvc.perform(get("/api/practicantes")
                .header("Origin", "http://localhost:3000")
                .cookie(new Cookie("practiqr_token", jwtService.generateToken("87", "RRHH", "trabajadores:87"))))
                .andReturn();
        String allowOrigin = result.getResponse().getHeader("Access-Control-Allow-Origin");
        // Con allowCredentials true, debe devolver el origen exacto, no *
        assertEquals("http://localhost:3000", allowOrigin);
    }

    @Test
    public void corsOrigenArbitrarioRechazado() throws Exception {
        MvcResult result = mockMvc.perform(get("/api/practicantes")
                .header("Origin", "http://evil.com")
                .cookie(new Cookie("practiqr_token", jwtService.generateToken("87", "RRHH", "trabajadores:87"))))
                .andReturn();
        String allowOrigin = result.getResponse().getHeader("Access-Control-Allow-Origin");
        // Origen no permitido no debe ser reflejado
        assertTrue(allowOrigin == null || !allowOrigin.equals("http://evil.com"), "Origen arbitrario no debe ser aceptado, fue: " + allowOrigin);
    }
}
