# LOGIN AUTH CONTROLLER — PHASE 2.4.2

## 1. Resultado
**FASE 2.4.2: COMPLETADA**

`AuthController` creado con `POST /api/auth/login` y `POST /api/auth/logout`, integrado a `AuthService` y `JwtService` existentes, cookie `practiqr_token` HttpOnly, manejo de errores 401/400, CSRF/CORS ya configurados en Fase 2.3.2 y verificados. Sin frontend/DB/QR.

## 2. POST /api/auth/login
`POST /api/auth/login` `Content-Type: application/json` → valida `@Valid LoginRequest`, llama `authService.authenticate(usuario, contrasena)`, genera JWT, crea cookie, devuelve 200 con JSON seguro. Protegido por `permitAll` en `SecurityConfig`.

## 3. Request DTO
`model/dto/LoginRequest.java`:
```java
@NotBlank String usuario;
@NotBlank String contrasena;
```
No acepta `rol`, `id`, `sede`. Validación `@NotBlank` → 400 si vacío.

## 4. AuthService integration
Controller no conoce `PracticanteRepository` etc. Solo inyecta `AuthService` (3 fuentes) y delega. `AuthService` resuelve candidatos (0/1/>1), valida estado y BCrypt/legacy, determina rol, sin recibir rol del cliente.

## 5. JWT generation
```java
String token = jwtService.generateToken(
    String.valueOf(authResult.getId()),
    authResult.getRol(), // PRACTICANTE/VIGILANTE/RRHH
    authResult.getSid()  // practicante:1, vigilante:10, trabajadores:87
);
```
Claims: `sub`, `rol`, `sid`, `iss=practiqr`, `iat`, `exp=28_800_000`. No se crea otro servicio, se usa `JwtService` existente.

## 6. Cookie
`jwtService.createCookie(token)` → `ResponseCookie.from("practiqr_token", token).httpOnly(true).secure(false dev / true prod).sameSite("Lax").path("/").maxAge(28800).build()` → `Set-Cookie: practiqr_token=...; Path=/; Max-Age=28800; HttpOnly; SameSite=Lax`. JWT nunca en JSON (verificado `assertFalse(body.contains("practiqr_token"))`).

## 7. Response
Éxito `200`:
```json
{ "authenticated": true, "user": { "id":87, "nombre":"KELITA HARO TAMANI", "usuario":"75257890", "rol":"RRHH", "documento":"75257890" } }
```
Solo campos de `AuthResult` (id, nombre, usuario, rol, documento). No incluye `contrasena`, `hash`, `JWT`.

## 8. Error handling
- Credenciales inválidas (0 candidatos, >1 ambiguo, password no match, inactivo) → `BusinessException("Usuario o contraseña incorrectos", 401)` → `GlobalExceptionHandler` → `401 {message:"..."}`
- Validación `@Valid` falla → Spring `MethodArgumentNotValidException` → `400`
- No expone SQL, hashes, tablas, stack traces. Mensaje genérico.

## 9. Logout
`POST /api/auth/logout` → `jwtService.createLogoutCookie()` → `Set-Cookie: practiqr_token=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax` + `200 {authenticated:false}`. Stateless, no invalida JWT en servidor.

## 10. CSRF
Configuración Fase 2.3.2: `CookieCsrfTokenRepository.withHttpOnlyFalse()` (`XSRF-TOKEN` no HttpOnly, `practiqr_token` sí HttpOnly) + `ignoringRequestMatchers("/api/auth/**")`. Login/logout no requieren `X-XSRF-TOKEN` (ignorado), resto `/api/**` sí requiere header si se hace POST con cookie. No se deshabilitó globalmente. Documentado para Next.js: leer `XSRF-TOKEN` de `document.cookie` y enviar `X-XSRF-TOKEN`.

## 11. Tests
`controller/AuthControllerTest.java` 11 tests con `@SpringBootTest @AutoConfigureMockMvc` + `@MockBean AuthService`:
- 1 RRHH válido → 200 + cookie
- 2 practicante → 200 rol PRACTICANTE
- 3 vigilante → 200 rol VIGILANTE
- 4 RRHH → 200
- 5 inválidas → 401 sin cookie válida
- 6 vacío → 400
- 7 cookie atributos → HttpOnly, Path=/, Max-Age 28800, SameSite Lax, Secure false dev
- 8 logout → 200 + Max-Age 0
- 9 JWT real → sub/rol/sid/iss/valid
- 10 auth con JWT válido → `GET /api/practicantes` 200
- 11 rol VIGILANTE → 200 y rol correcto
Plus `JwtServiceTest` 9 tests y `JwtFilterAndCookieCorsTest` 7 tests ya existentes.

## 12. BD
**SIN CAMBIOS** — no se ejecutó ALTER/INSERT. `one_db` 63 tablas, `vigilante.Estado` ya de Fase 2.2.1.

## 13. Frontend
**SIN CAMBIOS** — `FRONTEND/app/login/page.tsx` sigue mock `localStorage`, no se tocó `PracticanteQRDialog`.

## 14. Archivos modificados
```
BACKEND/src/main/java/com/asistencia/attendance_system/model/dto/LoginRequest.java (NUEVO)
BACKEND/src/main/java/com/asistencia/attendance_system/model/dto/LoginResponse.java (NUEVO)
BACKEND/src/main/java/com/asistencia/attendance_system/controller/AuthController.java (NUEVO)
BACKEND/src/test/java/com/asistencia/attendance_system/controller/AuthControllerTest.java (NUEVO, 11 tests)
LOGIN_AUTH_CONTROLLER_PHASE_2_4_2.md (ESTE)
```
Modificados previos de Fase 2.3.2 (SecurityConfig, JwtService, etc.) no tocados salvo uso.

## 15. Próximo paso
**FASE 2.4.3 — Pruebas reales contra `one_db` y validación completa del flujo con usuarios reales (PRACTICANTE legacy, VIGILANTE, RRHH 87) + frontend login real.**
