package com.asistencia.attendance_system.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey key;
    private final long expiration;
    private final String issuer;
    private final String cookieName;
    private final long cookieMaxAge;
    private final boolean cookieSecure;
    private final String cookieSameSite;

    public JwtService(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration}") long expiration,
            @Value("${jwt.issuer}") String issuer,
            @Value("${jwt.cookie.name:practiqr_token}") String cookieName,
            @Value("${jwt.cookie.max-age:28800}") long cookieMaxAge,
            @Value("${jwt.cookie.secure}") boolean cookieSecure,
            @Value("${jwt.cookie.same-site:Lax}") String cookieSameSite) {
        // HS256 requiere clave >= 256 bits (32 bytes). No existe secreto por defecto:
        // la propiedad jwt.secret debe provenir de configuración externa, normalmente JWT_SECRET.
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException("Falta jwt.secret: configure JWT_SECRET y vuelva a arrancar");
        }
        byte[] secretBytes = secret.getBytes(StandardCharsets.UTF_8);
        if (secretBytes.length < 32) {
            throw new IllegalStateException("jwt.secret debe tener al menos 32 bytes para HS256");
        }
        this.key = Keys.hmacShaKeyFor(secretBytes);
        this.expiration = expiration;
        this.issuer = issuer;
        this.cookieName = cookieName;
        this.cookieMaxAge = cookieMaxAge;
        this.cookieSecure = cookieSecure;
        this.cookieSameSite = cookieSameSite;
    }

    public String generateToken(String subject, String rol, String sid) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expiration);

        String token = Jwts.builder()
                .subject(subject)
                .claim("rol", rol)
                .claim("sid", sid)
                .issuer(issuer)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(key)
                .compact();

        return token;
    }

    public boolean isValid(String token) {
        try {
            Jws<Claims> jws = parse(token);
            String tokenIssuer = jws.getPayload().getIssuer();
            return issuer.equals(tokenIssuer) && !isExpired(jws);
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public String getSubject(String token) {
        return parse(token).getPayload().getSubject();
    }

    public String getRol(String token) {
        return parse(token).getPayload().get("rol", String.class);
    }

    public String getSid(String token) {
        return parse(token).getPayload().get("sid", String.class);
    }

    public String getIssuer(String token) {
        return parse(token).getPayload().getIssuer();
    }

    public Date getExpiration(String token) {
        return parse(token).getPayload().getExpiration();
    }

    private boolean isExpired(Jws<Claims> jws) {
        Date exp = jws.getPayload().getExpiration();
        return exp != null && exp.before(new Date());
    }

    private Jws<Claims> parse(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .requireIssuer(issuer)
                .build()
                .parseSignedClaims(token);
    }

    public ResponseCookie createCookie(String token) {
        return ResponseCookie.from(cookieName, token)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(cookieSameSite)
                .path("/")
                .maxAge(cookieMaxAge)
                .build();
    }

    public ResponseCookie createLogoutCookie() {
        return ResponseCookie.from(cookieName, "")
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(cookieSameSite)
                .path("/")
                .maxAge(0)
                .build();
    }

    // Para tests: exponer expiración e issuer
    public long getExpirationMs() {
        return expiration;
    }

    public String getIssuerConfig() {
        return issuer;
    }

    public String getCookieName() {
        return cookieName;
    }
}
