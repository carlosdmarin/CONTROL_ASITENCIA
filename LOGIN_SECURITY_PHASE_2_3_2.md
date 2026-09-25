# LOGIN SECURITY — PHASE 2.3.2

## 1. Resultado
**FASE 2.3.2: COMPLETADA**

Infraestructura JWT completa sin login real. Generación, validación, filtro, cookie HttpOnly, CORS con credentials y CSRF con cookie listos y testeados. Sin AuthController/AuthService.

## 2. Dependencia JWT
`pom.xml:14` añadidas 3 JJWT 0.12.6 compatibles con Spring Boot 3.4 / Java 21:
```xml
jjwt-api 0.12.6
jjwt-impl 0.12.6 runtime
jjwt-jackson 0.12.6 runtime
```
No se añadieron librerías duplicadas. `mvnw` ejecutado OK.

## 3. JwtService
`security/JwtService.java` (`@Service`):
- `generateToken(String sub, String rol, String sid)` → `Jwts.builder().subject(sub).claim("rol",rol).claim("sid",sid).issuer(issuer).issuedAt(now).expiration(now+expiration).signWith(key).compact()`
- `isValid(String token)` → `parse().verifyWith(key).requireIssuer(issuer).expiration` + catch `JwtException`
- `getSubject/getRol/getSid/getIssuer/getExpiration` vía `parse().getPayload()`
- `createCookie(String token)` y `createLogoutCookie()` → `ResponseCookie.from("practiqr_token")...`
- Clave: `Keys.hmacShaKeyFor(secret.getBytes(UTF_8))` HS256 ≥32 chars. No incluye contraseñas ni sede.

## 4. Claims
```json
{ "sub":"87", "rol":"RRHH", "sid":"trabajadores:87", "iat":171..., "exp":171+28800, "iss":"practiqr" }
```
`sid` futuro `practicante:ID / vigilante:ID / trabajadores:ID`. No se incluyen hashes ni datos sensibles.

## 5. JwtAuthenticationFilter
`security/JwtAuthenticationFilter.java` (`@Component extends OncePerRequestFilter`):
1. extrae `practiqr_token` de `request.getCookies()`
2. `jwtService.isValid(token)` (firma + issuer + exp)
3. `getSubject` + `getRol` → `new UsernamePasswordAuthenticationToken(subject, null, List.of(new SimpleGrantedAuthority("ROLE_"+rol)))`
4. `SecurityContextHolder.getContext().setAuthentication(...)`
- Si no hay cookie → continúa sin autenticación (endpoints públicos no fallan)
- Si inválida → no autentica, `clearContext()`, no lanza excepción

## 6. SecurityContext
Tras filtro válido: `SecurityContextHolder.getContext().getAuthentication()` contiene `principal=87` y `authority=ROLE_RRHH` (o `ROLE_PRACTICANTE`/`ROLE_VIGILANTE`). Verificado en `JwtFilterAndCookieCorsTest` con cookie válida → `GET /api/practicantes` pasa a 200 y rol extraído `VIGILANTE` es `ROLE_VIGILANTE`. Fase 2.4 lo usará.

## 7. Cookie JWT
`JwtService.createCookie()`:
```
Set-Cookie: practiqr_token=<JWT>; Path=/; Max-Age=28800; HttpOnly; SameSite=Lax; Secure=false (dev)
```
`application.properties: jwt.cookie.name=practiqr_token, max-age=28800, secure=false, same-site=Lax` (en prod `Secure=true` vía env). Nunca en `localStorage/sessionStorage`. `createLogoutCookie()` con `Max-Age=0`.

## 8. CORS
`SecurityConfig.corsConfigurationSource()`:
```java
CorsConfiguration.setAllowedOrigins(List.of("http://localhost:3000"));
setAllowedMethods(GET,POST,PUT,DELETE,OPTIONS); setAllowedHeaders(*); setAllowCredentials(true);
```
Registrado en `/**`. Eliminados `@CrossOrigin("*")` de `PracticanteController`, `AsistenciaController`, `ReportesController` (conflicto con credentials). Otros controllers ya tenían `http://localhost:3000`.

## 9. CSRF
Autenticación por cookie → CSRF relevante. Configurado:
```java
CookieCsrfTokenRepository.withHttpOnlyFalse() // XSRF-TOKEN no HttpOnly, JWT sí
.csrfTokenRepository(...).csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler() {setCsrfRequestAttributeName(null);})
.ignoringRequestMatchers("/api/auth/**")
```
`practiqr_token` (HttpOnly, auth) separada de `XSRF-TOKEN` (no HttpOnly, header `X-XSRF-TOKEN`). Documentado para Next.js: leer `XSRF-TOKEN` de `document.cookie` y enviar `X-XSRF-TOKEN`. No es `csrf.disable()` arbitrario; se habilita protección y se ignora solo auth para obtener token inicial.

## 10. Tests JWT
`JwtServiceTest` (9 tests):
- token != null, subject, rol, sid, issuer, valid=true, expirado (shortLived 1ms → sleep 10ms → invalid), manipulado (cambiar 4 chars → invalid), clave incorrecta → invalid. Todos sin datos reales.

## 11. Tests Filter
`JwtFilterAndCookieCorsTest`:
- sin cookie → 401/403
- cookie válida `sub=87 rol=RRHH` → 200 (autenticado)
- cookie inválida → 401/403
- rol VIGILANTE → `getRol` == VIGILANTE y 200

## 12. Tests Cookie
`cookieContieneAtributosCorrectos` → header contiene `HttpOnly`, `Path=/`, `Max-Age=28800`, `SameSite=Lax`, no `Secure` en dev (verifica `jwt.cookie.secure=false`).

## 13. Tests CORS
- `Origin: http://localhost:3000` → `Access-Control-Allow-Origin: http://localhost:3000`
- `Origin: http://evil.com` → no refleja `evil.com`

## 14. BD
**SIN CAMBIOS** — no se ejecutó ALTER/INSERT. `one_db` intacta (63 tablas). `vigilante.Estado` ya de Fase 2.2.1.

## 15. Frontend
**SIN CAMBIOS** — `FRONTEND/app/login/page.tsx` sigue mock, no se tocó `PracticanteQRDialog`, no se creó middleware.

## 16. Archivos modificados
```
BACKEND/pom.xml (JJWT)
BACKEND/src/main/resources/application.properties (jwt.*)
BACKEND/src/main/java/com/asistencia/attendance_system/security/JwtService.java (NUEVO)
BACKEND/src/main/java/com/asistencia/attendance_system/security/JwtAuthenticationFilter.java (NUEVO)
BACKEND/src/main/java/com/asistencia/attendance_system/config/SecurityConfig.java (CORS/CSRF/JWT filter)
BACKEND/src/main/java/com/asistencia/attendance_system/controller/PracticanteController.java (quit @CrossOrigin *)
BACKEND/src/main/java/com/asistencia/attendance_system/controller/AsistenciaController.java (quit *)
BACKEND/src/main/java/com/asistencia/attendance_system/controller/ReportesController.java (quit *)
BACKEND/src/test/java/.../security/JwtServiceTest.java (NUEVO, 9 tests)
BACKEND/src/test/java/.../security/JwtFilterAndCookieCorsTest.java (NUEVO, 7 tests)
```

## 17. Riesgos
- `JWT_SECRET` fallback `practiqr-dev-secret...` solo para local; en prod debe ser variable de entorno 32+ chars, documentado.
- `Secure=false` en dev permite http; en prod debe ser `true` (HTTPS).
- `HttpOnly` JWT + `SameSite=Lax` sin CSRF sería vulnerable a top-level POST; por eso CSRF con `XSRF-TOKEN` es obligatorio.

## 18. Próximo paso
**FASE 2.4 — AuthController + AuthService + login real de PRACTICANTE, VIGILANTE y RRHH** usando `JwtService`, `PasswordEncoder` y `practiqr_token` cookie. No se tocará `JwtService`/`JwtFilter`.
