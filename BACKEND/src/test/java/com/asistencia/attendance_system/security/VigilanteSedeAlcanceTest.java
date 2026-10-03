package com.asistencia.attendance_system.security;

import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

/**
 * C-01 (solo lectura sobre BD dev): VIGILANTE acotado a su sede en
 * búsquedas y validaciones; RRHH conserva vista global.
 * Requiere vigilante 244 (sede 1) y practicantes de sedes 1 y 3.
 */
@SpringBootTest
@AutoConfigureMockMvc
public class VigilanteSedeAlcanceTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private JwtService jwtService;

    private Cookie vigSede1() {
        return new Cookie("practiqr_token", jwtService.generateToken("244", "VIGILANTE", "vigilante:244"));
    }

    private Cookie rrhh() {
        return new Cookie("practiqr_token", jwtService.generateToken("1", "RRHH", "administradores:1"));
    }

    @Test
    public void buscar_vigilanteSoloSuSede() throws Exception {
        // "Carlos" vive en sede 3 -> vigilante sede 1 no lo ve
        MvcResult r = mockMvc.perform(get("/api/practicantes/buscar")
                        .param("termino", "Carlos").cookie(vigSede1()))
                .andReturn();
        assertEquals(200, r.getResponse().getStatus());
        assertEquals("[]", r.getResponse().getContentAsString().trim());
    }

    @Test
    public void buscar_vigilanteVeSuSede() throws Exception {
        // "Valentina" vive en sede 1 -> visible
        MvcResult r = mockMvc.perform(get("/api/practicantes/buscar")
                        .param("termino", "Valentina").cookie(vigSede1()))
                .andReturn();
        assertEquals(200, r.getResponse().getStatus());
        assertTrue(r.getResponse().getContentAsString().contains("Valentina"));
    }

    @Test
    public void buscar_rrhhGlobal() throws Exception {
        MvcResult r = mockMvc.perform(get("/api/practicantes/buscar")
                        .param("termino", "Carlos").cookie(rrhh()))
                .andReturn();
        assertEquals(200, r.getResponse().getStatus());
        assertTrue(r.getResponse().getContentAsString().contains("Carlos"));
    }

    @Test
    public void validar_otraSede_403() throws Exception {
        // practicante 7 vive en sede 3
        MvcResult r = mockMvc.perform(get("/api/asistencias/validar/entrada-hoy/7")
                        .cookie(vigSede1()))
                .andReturn();
        assertEquals(403, r.getResponse().getStatus());
    }

    @Test
    public void validar_mismaSede_200() throws Exception {
        // practicante 9 vive en sede 1
        MvcResult r = mockMvc.perform(get("/api/asistencias/validar/entrada-hoy/9")
                        .cookie(vigSede1()))
                .andReturn();
        assertEquals(200, r.getResponse().getStatus());
    }

    @Test
    public void validar_rrhhGlobal_200() throws Exception {
        MvcResult r = mockMvc.perform(get("/api/asistencias/validar/entrada-hoy/7")
                        .cookie(rrhh()))
                .andReturn();
        assertEquals(200, r.getResponse().getStatus());
    }
}
