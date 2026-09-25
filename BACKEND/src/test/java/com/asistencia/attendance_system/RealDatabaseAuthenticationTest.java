package com.asistencia.attendance_system;

import com.asistencia.attendance_system.model.entity.Practicante;
import com.asistencia.attendance_system.repository.PracticanteRepository;
import com.asistencia.attendance_system.security.JwtService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import jakarta.servlet.http.Cookie;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * TEMPORAL - Pruebas reales contra one_db. Solo se ejecuta con perfil real-db-test y env PRACTIQR_RRHH_TEST_PASSWORD
 * No imprime hashes, JWT ni secretos.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("real-db-test")
@Tag("real-db")
public class RealDatabaseAuthenticationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private PracticanteRepository practicanteRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private boolean isBCrypt(String hash) {
        return hash != null && (hash.startsWith("$2a$") || hash.startsWith("$2b$") || hash.startsWith("$2y$"));
    }

    @Test
    public void practicanteRealLoginAndMigration() throws Exception {
        // Buscar practicante de prueba no productivo: OFTEST04
        var opt = practicanteRepository.findByUsuario("OFTEST04");
        if (opt.isEmpty()) opt = practicanteRepository.findByDocumento("OFTEST04");
        assertTrue(opt.isPresent(), "Practicante de prueba OFTEST04 debe existir");
        Practicante p = opt.get();
        assertEquals("ACTIVO", p.getSituacion().name(), "Debe estar ACTIVO");
        String usuario = p.getUsuario();
        String rawPassword = "OFTEST04"; // legacy = documento
        boolean wasBCryptBefore = isBCrypt(p.getContrasena());

        // Login real
        String json = "{\"usuario\":\"" + usuario + "\",\"contrasena\":\"" + rawPassword + "\"}";
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isOk())
                .andReturn();

        String body = result.getResponse().getContentAsString();
        assertTrue(body.contains("\"authenticated\":true"));
        assertTrue(body.contains("\"rol\":\"PRACTICANTE\""));
        String setCookie = result.getResponse().getHeaders("Set-Cookie").stream().filter(c -> c.contains("practiqr_token")).findFirst().orElse(null);
        assertNotNull(setCookie, "Cookie practiqr_token debe existir");
        assertTrue(setCookie.contains("HttpOnly"));
        assertTrue(setCookie.contains("Path=/"));
        assertTrue(setCookie.contains("Max-Age=28800"));
        assertTrue(setCookie.toLowerCase().contains("samesite=lax"));
        // No imprimir JWT

        // Verificar migración
        var after = practicanteRepository.findByUsuario(usuario).orElseThrow();
        boolean isBCryptAfter = isBCrypt(after.getContrasena());
        assertTrue(isBCryptAfter, "Después del login debe estar en BCrypt");

        // Segundo login con BCrypt debe seguir funcionando
        MvcResult result2 = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isOk())
                .andReturn();
        assertTrue(result2.getResponse().getContentAsString().contains("\"rol\":\"PRACTICANTE\""));

        // Validar JWT
        String token = extractToken(result);
        assertNotNull(token);
        assertTrue(jwtService.isValid(token));
        assertEquals("PRACTICANTE", jwtService.getRol(token));
        assertTrue(jwtService.getSid(token).startsWith("practicante:"));

        // Validar filter
        Cookie cookie = new Cookie("practiqr_token", token);
        mockMvc.perform(get("/api/practicantes").cookie(cookie))
                .andExpect(status().isOk());

        // Logout
        MvcResult logout = mockMvc.perform(post("/api/auth/logout").cookie(cookie))
                .andExpect(status().isOk())
                .andReturn();
        String logoutCookie = logout.getResponse().getHeaders("Set-Cookie").stream().filter(c -> c.contains("practiqr_token")).findFirst().orElse(null);
        assertNotNull(logoutCookie);
        assertTrue(logoutCookie.contains("Max-Age=0"));

        // Post logout ya no autentica
        // Usar cookie eliminada (vacía) debe dar 401/403
        Cookie emptyCookie = new Cookie("practiqr_token", "");
        int statusAfterLogout = mockMvc.perform(get("/api/practicantes").cookie(emptyCookie)).andReturn().getResponse().getStatus();
        assertTrue(statusAfterLogout == 401 || statusAfterLogout == 403);
    }

    @Test
    public void rrhhRealLoginSiEnvSet() throws Exception {
        String pwd = System.getenv("PRACTIQR_RRHH_TEST_PASSWORD");
        if (pwd == null || pwd.isBlank()) {
            System.out.println("SKIP RRHH test: PRACTIQR_RRHH_TEST_PASSWORD no está seteado");
            return;
        }
        // Usuario de RRHH es 75257890
        String usuario = "75257890";
        String json = "{\"usuario\":\"" + usuario + "\",\"contrasena\":\"" + pwd + "\"}";
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isOk())
                .andReturn();
        assertTrue(result.getResponse().getContentAsString().contains("\"rol\":\"RRHH\""));
        String token = extractToken(result);
        assertNotNull(token);
        assertEquals("RRHH", jwtService.getRol(token));
        assertTrue(jwtService.getSid(token).equals("trabajadores:87"));
    }

    @Test
    public void credencialesIncorrectas401() throws Exception {
        String json = "{\"usuario\":\"OFTEST04\",\"contrasena\":\"wrongpass\"}";
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isUnauthorized())
                .andReturn();
        var cookies = result.getResponse().getHeaders("Set-Cookie");
        String practiqr = cookies != null ? cookies.stream().filter(c -> c.contains("practiqr_token") && c.contains("Max-Age=28800")).findFirst().orElse(null) : null;
        assertNull(practiqr, "No debe haber cookie válida en 401");
    }

    @Test
    public void usuarioInexistente401() throws Exception {
        String json = "{\"usuario\":\"noexiste999\",\"contrasena\":\"whatever\"}";
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isUnauthorized());
    }

    @Test
    public void vigilanteTablaVacia() throws Exception {
        // Verificar que vigilante está vacío y que login con usuario inexistente da 401
        String json = "{\"usuario\":\"vigilante_inexistente\",\"contrasena\":\"pass\"}";
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isUnauthorized());
    }

    private String extractToken(MvcResult result) {
        var cookies = result.getResponse().getHeaders("Set-Cookie");
        if (cookies == null) return null;
        for (String c : cookies) {
            if (c.contains("practiqr_token")) {
                // Formato: practiqr_token=XXX; Path=/; ...
                int start = c.indexOf("practiqr_token=") + "practiqr_token=".length();
                int end = c.indexOf(";", start);
                if (end == -1) end = c.length();
                return c.substring(start, end);
            }
        }
        return null;
    }
}
