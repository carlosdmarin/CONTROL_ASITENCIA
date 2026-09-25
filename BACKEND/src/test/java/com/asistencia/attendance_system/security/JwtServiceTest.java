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
        String token = jwtService.generateToken("87", "RRHH", "trabajadores:87");
        assertNotNull(token);
        assertFalse(token.isBlank());
    }

    @Test
    public void testExtractSubject() {
        String token = jwtService.generateToken("87", "RRHH", "trabajadores:87");
        assertEquals("87", jwtService.getSubject(token));
    }

    @Test
    public void testExtractRol() {
        String token = jwtService.generateToken("87", "RRHH", "trabajadores:87");
        assertEquals("RRHH", jwtService.getRol(token));
    }

    @Test
    public void testExtractSid() {
        String token = jwtService.generateToken("87", "RRHH", "trabajadores:87");
        assertEquals("trabajadores:87", jwtService.getSid(token));
    }

    @Test
    public void testVerifyIssuer() {
        String token = jwtService.generateToken("87", "RRHH", "trabajadores:87");
        assertEquals("practiqr", jwtService.getIssuer(token));
    }

    @Test
    public void testValidToken() {
        String token = jwtService.generateToken("87", "RRHH", "trabajadores:87");
        assertTrue(jwtService.isValid(token));
    }

    @Test
    public void testExpiredTokenInvalid() throws InterruptedException {
        // Creamos un JwtService temporal con expiración 1ms
        JwtService shortLived = new JwtService("practiqr-dev-secret-key-32-chars-long-local-only-123456", 1, "practiqr", "practiqr_token", 1, false, "Lax");
        String token = shortLived.generateToken("87", "RRHH", "trabajadores:87");
        Thread.sleep(10);
        assertFalse(shortLived.isValid(token), "Token expirado debe ser inválido");
    }

    @Test
    public void testManipulatedTokenInvalid() {
        String token = jwtService.generateToken("87", "RRHH", "trabajadores:87");
        String manipulated = token.substring(0, token.length() - 4) + "abcd";
        assertFalse(jwtService.isValid(manipulated));
    }

    @Test
    public void testWrongKeyInvalid() {
        String token = jwtService.generateToken("87", "RRHH", "trabajadores:87");
        JwtService otherKeyService = new JwtService("otra-clave-secreta-diferente-32-chars-xxxxxx1234", 28800000, "practiqr", "practiqr_token", 28800, false, "Lax");
        assertFalse(otherKeyService.isValid(token));
    }
}
