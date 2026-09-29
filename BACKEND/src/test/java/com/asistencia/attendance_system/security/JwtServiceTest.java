package com.asistencia.attendance_system.security;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class JwtServiceTest {

    @Autowired
    private JwtService jwtService;

    @Test
    public void testGenerateTokenNotNull() {
        String token = jwtService.generateToken("1", "RRHH", "administradores:1");
        assertNotNull(token);
        assertFalse(token.isBlank());
    }

    @Test
    public void testExtractSubject() {
        String token = jwtService.generateToken("1", "RRHH", "administradores:1");
        assertEquals("1", jwtService.getSubject(token));
    }

    @Test
    public void testExtractRol() {
        String token = jwtService.generateToken("1", "RRHH", "administradores:1");
        assertEquals("RRHH", jwtService.getRol(token));
    }

    @Test
    public void testExtractSid() {
        String token = jwtService.generateToken("1", "RRHH", "administradores:1");
        assertEquals("administradores:1", jwtService.getSid(token));
    }

    @Test
    public void testVerifyIssuer() {
        String token = jwtService.generateToken("1", "RRHH", "administradores:1");
        assertEquals("practiqr", jwtService.getIssuer(token));
    }

    @Test
    public void testValidToken() {
        String token = jwtService.generateToken("1", "RRHH", "administradores:1");
        assertTrue(jwtService.isValid(token));
    }

    @Test
    public void testExpiredTokenInvalid() throws InterruptedException {
        // Creamos un JwtService temporal con expiración 1ms
        JwtService shortLived = new JwtService(testSecret(), 1, "practiqr", "practiqr_token", 1, false, "Lax");
        String token = shortLived.generateToken("1", "RRHH", "administradores:1");
        Thread.sleep(10);
        assertFalse(shortLived.isValid(token), "Token expirado debe ser inválido");
    }

    @Test
    public void testManipulatedTokenInvalid() {
        String token = jwtService.generateToken("1", "RRHH", "administradores:1");
        String manipulated = token.substring(0, token.length() - 4) + "abcd";
        assertFalse(jwtService.isValid(manipulated));
    }

    @Test
    public void testWrongKeyInvalid() {
        String token = jwtService.generateToken("1", "RRHH", "administradores:1");
        JwtService otherKeyService = new JwtService(testSecret() + "-clave-diferente", 28800000, "practiqr", "practiqr_token", 28800, false, "Lax");
        assertFalse(otherKeyService.isValid(token));
    }

    private static String testSecret() {
        String secret = System.getenv("JWT_SECRET");
        assertNotNull(secret, "JWT_SECRET debe estar configurado para ejecutar las pruebas");
        assertFalse(secret.isBlank(), "JWT_SECRET no debe estar vacío para ejecutar las pruebas");
        return secret;
    }
}
