package com.asistencia.attendance_system.security;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

@SpringBootTest
@AutoConfigureMockMvc
public class SecurityFilterChainTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void endpointProtegidoSinAuthDebeResponder401() throws Exception {
        // Cualquier endpoint bajo /api/** distinto de /api/auth/** debe estar protegido
        // PracticanteController GET /api/practicantes está protegido (401 o 403 según config sin httpBasic)
        int status = mockMvc.perform(get("/api/practicantes")).andReturn().getResponse().getStatus();
        assertTrue(status == 401 || status == 403, "Endpoint protegido debe responder 401/403, fue " + status);
    }

    @Test
    public void apiAuthPermitidoSinAuth() throws Exception {
        // /api/auth/** está permitido (aunque no exista el endpoint, no debe ser 401)
        // Si no existe, esperamos 404, pero nunca 401
        int status = mockMvc.perform(get("/api/auth/login")).andReturn().getResponse().getStatus();
        // 401 significa protegido, 404 significa permitido pero no encontrado (esperado)
        assertTrue(status != 401, "api/auth/** debe estar permitido, no 401, fue " + status);
    }
}
