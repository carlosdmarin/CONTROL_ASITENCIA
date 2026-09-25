package com.asistencia.attendance_system.security;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;

public class BCryptPasswordEncoderTest {

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Test
    public void testEncodeAndMatches_CorrectPassword() {
        String rawPassword = "TestPassword123!";
        String hash = passwordEncoder.encode(rawPassword);
        assertTrue(passwordEncoder.matches(rawPassword, hash), "BCrypt debe validar contraseña correcta");
    }

    @Test
    public void testMatches_WrongPassword() {
        String rawPassword = "TestPassword123!";
        String wrongPassword = "WrongPassword456!";
        String hash = passwordEncoder.encode(rawPassword);
        assertFalse(passwordEncoder.matches(wrongPassword, hash), "BCrypt no debe validar contraseña distinta");
    }

    @Test
    public void testDifferentHashesForSamePassword() {
        String rawPassword = "MismaPassword123!";
        String hash1 = passwordEncoder.encode(rawPassword);
        String hash2 = passwordEncoder.encode(rawPassword);
        // BCrypt usa salt aleatorio, los hashes deben ser distintos
        assertNotEquals(hash1, hash2, "Dos hashes de la misma contraseña deben ser distintos por el salt");
        // Pero ambos deben validar
        assertTrue(passwordEncoder.matches(rawPassword, hash1));
        assertTrue(passwordEncoder.matches(rawPassword, hash2));
    }
}
