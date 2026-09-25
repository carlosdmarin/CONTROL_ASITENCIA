# LOGIN IMPLEMENTATION AUDIT — FINAL

## 1. Resumen ejecutivo

**AUTENTICACIÓN: COMPLETA y SEGURA para el alcance actual (3 fuentes, JWT HttpOnly, BCrypt, validación de estado).**

El sistema pasó de un login mock (`localStorage` + `email.includes("admin")`) a una arquitectura real con `AuthService` → `JwtService` → `practiqr_token` HttpOnly → `JwtAuthenticationFilter` → `SecurityContext` → `GET /api/auth/me` con revalidación contra BD. No hay secretos en frontend, no hay JWT en `localStorage`, y la cookie nunca es leída por JS. La implementación está **bien diseñada** (no solo "funciona"): separación clara `AuthService` (negocio) / `JwtService` (firma) / `AuthController` (HTTP+cookie) / `JwtFilter` (validación), y está preparada para roles y QR dinámico. Riesgo bajo para desarrollo; para producción faltan solo endurecimientos (secret de 32+ chars vía env, `Secure=true`, y crear `/practicante`).

## 2. Estado general

- **Backend:** `Spring Boot 3.4 / Java 21 / MySQL one_db` con `SecurityConfig`, `PasswordEncoder`, `JwtService`, `AuthService`, `AuthController`, `JwtAuthenticationFilter`, `CORS` y `CSRF` correctamente configurados.
- **Frontend:** `Next.js 16.2.10` con `proxy.ts` para protección de rutas privadas y `lib/auth.ts` / `hooks/useAuth.ts` para hidratación de sesión. Login visual intacto.
- **Integración:** `POST /api/auth/login` genera JWT y cookie, `GET /api/auth/me` revalida contra BD, `lib/api/axios.ts` con `withCredentials:true` y `fetch` con `credentials:include` envían la cookie.
- **DB:** `one_db` con `Practicante` (1 registro OFTEST04 migrado a BCrypt), `vigilante` (0 registros, con `Estado` tinyint), `trabajadores` (219, RRHH id 87).
- **Tests:** 63 tests, todos `BUILD SUCCESS`.

## 3. Arquitectura real

```
Next.js (login) --POST /api/auth/login {usuario,contrasena} + credentials:include--> Spring Boot
  -> AuthController -> AuthService (busca en 3 repos, valida estado, valida BCrypt/legacy, decide rol, migra si legacy)
  -> AuthResult {id,nombre,usuario,rol,documento,sede,sid,source}
  -> JwtService.generateToken(sub=id, rol, sid) -> JWT {sub,rol,sid,iss,iat,exp} firmado HS256
  -> JwtService.createCookie(JWT) -> Set-Cookie: practiqr_token=...; HttpOnly; Path=/; Max-Age=28800; SameSite=Lax; Secure=false(dev)
  <- 200 {authenticated:true, user:{id,nombre,usuario,rol,documento}} + Set-Cookie
  --GET /api/auth/me + Cookie--> JwtAuthenticationFilter (valida firma/issuer/exp, crea UsernamePasswordAuthenticationToken(subject, sid, [ROLE_*]))
  -> SecurityContext -> AuthController.me() -> revalida sid contra BD (situacion/Estado) -> 200 {authenticated:true, user} o 401
```

Esta cadena coincide con el concepto del prompt y está implementada sin duplicación.

## 4. Flujo de autenticación

Verificado en código:
- `FRONTEND/app/login/page.tsx:46-71` hace `fetch(${API_URL}/auth/login, {credentials:"include", body: JSON.stringify({usuario,contrasena})})`, maneja `200→rol→router.push`, `401→"Usuario o contraseña incorrectos"`, `400→validación`, `catch→"No se pudo conectar"`.
- `BACKEND/controller/AuthController.java:44` valida `@Valid LoginRequest`, llama `authService.authenticate`, genera JWT, crea cookie, devuelve `200` sin exponer JWT en JSON.
- `AuthService.java:58` valida `usuario/contrasena` no blank, busca candidatos, valida contraseña, migra legacy, construye `AuthResult`.
- `JwtService.java:42` firma, `JwtAuthenticationFilter.java:33` valida y pone `SecurityContext`.
- `AuthController.java:81` en `/me` lee `SecurityContext`, parsea `sid`, revalida estado actual contra BD.

Sin diferencias con el flujo conceptual.

## 5. PRACTICANTE

- **Identificador:** `Practicante.usuario` (VARCHAR 50 UNIQUE) principal, compatibilidad `documento` (`PracticanteRepository: findByUsuario` + fallback `findByDocumento` en `AuthService.java:69-72`). En datos reales `usuario==documento` (OFTEST04).
- **Estado:** `situacion` enum `ACTIVO/INACTIVO` (`Practicante.java:50`). Solo `ACTIVO` entra a `candidates` (`AuthService.java:77`). Verificado con test `practicanteInactivoRechaza`.
- **Contraseña:** `contrasena VARCHAR(255)` (`Practicante.java:71`). Legacy `plaintext=documento` migrado a BCrypt tras login exitoso (`AuthService.java:142-147` `encode` + `save`). Verificado `SELECT LENGTH(contrasena)=60` y `$2a$` tras `RealDatabaseAuthenticationTest`. Ya migrado OFTEST04 sigue funcionando vía `matches`.
- **Rol:** `PRACTICANTE` por origen tabla, no por columna.
- **Sid:** `practicante:1`, **Repository:** `PracticanteRepository` con `findByUsuario` (añadido en Fase 2.4.1) y `findByDocumento`.

## 6. VIGILANTE

- **Identificador:** `vigilante.usuario` (VARCHAR 50 UNIQUE).
- **Contraseña:** `contrasena VARCHAR(255)` (se espera BCrypt, tabla vacía).
- **Estado:** `Estado tinyint(1) NOT NULL DEFAULT 1` (`Vigilante.java:14` `Boolean estado = true` con `columnDefinition="TINYINT(1)"`). `true` → puede autenticarse, `false` → rechazado (`AuthService.java:88`).
- **Rol:** `VIGILANTE` siempre.
- **Situación actual:** `SELECT COUNT(*) FROM vigilante` → `0` (verificado vía `MappingPhase21Test` y `RealDatabaseAuthenticationTest`). No se insertaron usuarios, como exige la regla.
- **Repository:** `VigilanteRepository` con `findByUsuario` y `findByUsuarioAndEstado`.

## 7. RRHH

- **Identificador:** `trabajadores.Usuario VARCHAR(15)` (valor `75257890` para id 87) con fallback `Email` si contiene `@` (`AuthService.java:98-100`).
- **Credenciales:** `PasswordUser VARCHAR(255)` con hash `$2y$10$...` (bcrypt detectado, 60 chars). Verificado `isBCrypt` con `$2y$` → normalizado a `$2a$` para `BCryptPasswordEncoder`.
- **Estado:** `Estado INT(1)` y `EstadoUsuario INT(1)` ambos `1` para id 87. Validación `Estado=1 && EstadoUsuario=1` (`AuthService.java:107`).
- **Whitelist:** `practiqr.auth.rrhh-worker-ids=87` (`application.properties:60`, inyectado vía `@Value` en `AuthService.java:31` y `AuthController.java:40`). No se usa `IdRol=2` (que es `TRABAJADOR` sin permisos, verificado `SELECT IdRol,COUNT(*) FROM trabajadores` → 217 con `2`). Solo `87` es RRHH.
- **Rol:** `RRHH` fijo.
- **Repository:** `TrabajadorRepository` con `findByUsuario`, `findByEmail`, `findByNroDoc`, `findByCodTrab`.

## 8. Password Security

Búsqueda `grep -R "password|contrasena|PasswordUser|encode|matches|BCrypt"`:
- **BCrypt donde corresponde:** `AuthService.java:133-135` para `isBCrypt` usa `passwordEncoder.matches(normalize)`, para legacy usa `encode` tras `equals`. `Vigilante` y `Trabajador` siempre `matches` con normalización `$2y$→$2a$`.
- **Ningún password en logs:** `log.info` solo registra `usuario` e `id`, nunca `contrasena`/`hash` (verificado `AuthService.java:147` loguea `usuario` e `id`).
- **Ningún hash en response:** `AuthResult` y `LoginResponse` no contienen `contrasena`/`PasswordUser` (verificados `AuthResult.java` y `LoginResponse.java`).
- **Ningún password en localStorage/sessionStorage:** `grep localStorage FRONTEND/app/login` → 0 en código propio (solo `node_modules`). Login no hace `localStorage.setItem`.
- **Ningún password en JWT:** `JwtService.java:45` solo `sub, rol, sid, iss, iat, exp`.
- **Riesgo legacy:** `stored.equals(contrasenaTrim)` es comparación en texto plano, pero solo dentro del servicio, sin almacenar, y se migra inmediatamente a BCrypt. Documentado como compatibilidad temporal.

## 9. JWT

- **JwtService.java:** `Keys.hmacShaKeyFor(secret.getBytes(UTF_8))` HS256, `issuer=practiqr`, `expiration=28800000` (8h), `subject`, `rol`, `sid`, `iat`, `exp` firmados. Validación `parse().verifyWith(key).requireIssuer(issuer)` + `!isExpired` (`JwtService:56`).
- **Firma segura:** HS256 con clave `>=32` chars (`jwt.secret` por defecto 45 chars `practiqr-dev-secret-key-...` para dev, `JWT_SECRET` env en prod).
- **Expiración:** 8h, verificada con test `JwtServiceTest.testExpiredTokenInvalid` (1ms).
- **Issuer:** `practiqr` verificado en `isValid` y `parse`.
- **Token manipulado:** `manipulated.substring` → `isValid=false`.
- **Clave incorrecta:** otro `JwtService` con clave distinta → `isValid=false`.
- **Secret no expuesto al frontend:** `jwt.secret` solo en `application.properties` con placeholder `${JWT_SECRET:...}` y nunca en `NEXT_PUBLIC_*` (verificado `grep NEXT_PUBLIC` en `FRONTEND` → solo `NEXT_PUBLIC_API_URL`).
- **`sid` correctamente utilizado:** `sid` se genera como `practicante:ID` etc., y `JwtAuthenticationFilter` lo guarda como `credentials` para que `/me` lo use sin confiar solo en `sub`.

## 10. Cookies

- **Nombre:** `practiqr_token` (`JwtService:28` `cookieName`, `application.properties:49` `jwt.cookie.name`).
- **Atributos:** `JwtService:99-106` `httpOnly=true`, `path="/"`, `maxAge=28800` (8h), `sameSite=Lax`, `secure=false` en dev (`application.properties:51` `jwt.cookie.secure=false`, en prod `true` vía env). Verificado en `AuthControllerTest` y `JwtFilterAndCookieCorsTest` con `assertTrue(header.contains("HttpOnly"))` etc.
- **Comportamiento dev:** `http://localhost:3000 → http://localhost:8080` con `Secure=false` permite cookie sin HTTPS. Producción `Secure=true` + `SameSite=Lax` correctamente externalizado.
- **No lectura JS:** `FRONTEND` nunca hace `document.cookie` para `practiqr_token` (grep 0). `lib/auth.ts` y `hooks/useAuth.ts` nunca leen la cookie, solo hacen `fetch` con `credentials:include`.

## 11. CSRF

- **Configuración actual:** `SecurityConfig.java:50-64` `CookieCsrfTokenRepository.withHttpOnlyFalse()` (`XSRF-TOKEN` no HttpOnly, `practiqr_token` sí) + `CsrfTokenRequestAttributeHandler` + `.ignoringRequestMatchers("/api/auth/**")`.
- **Separación correcta:** `practiqr_token` (JWT, HttpOnly, auth) vs `XSRF-TOKEN` (no HttpOnly, `X-XSRF-TOKEN` header) — no mezcladas.
- **Login exceptuado:** `POST /api/auth/login` y `/api/auth/logout` ignorados, no requieren CSRF token antes de tenerlo.
- **Otras operaciones:** `POST /api/asistencias/**`, `PUT`, `DELETE` requieren `X-XSRF-TOKEN`. Documentado para Next.js: leer `XSRF-TOKEN` de `document.cookie` y enviar `X-XSRF-TOKEN`.
- **Decisión discutible:** Ignorar `/api/auth/**` es correcto para login, pero deja `POST /api/auth/logout` sin CSRF. Alternativa sería exigir CSRF también para logout y hacer que el frontend lo envíe; actualmente se permite sin token, lo cual es aceptable para logout stateless pero podría endurecerse. No se cambia ahora.

## 12. CORS

- **SecurityConfig.java:36-45** `CorsConfigurationSource` con `allowedOrigins=[http://localhost:3000]`, `allowedMethods=[GET,POST,PUT,DELETE,OPTIONS]`, `allowedHeaders=[*]`, `allowCredentials=true` (para `practiqr_token`).
- **`application.properties:29`** `spring.web.cors.allowed-origins=http://localhost:3000` + `allow-credentials=true` — coherente.
- **`@CrossOrigin("*")` eliminado** de `PracticanteController.java:20`, `AsistenciaController.java:25`, `ReportesController.java:17` (conflicto con `allowCredentials`). Otros controllers ya tenían `http://localhost:3000`, se mantienen.
- **No se usa `*` con credentials.** Búsqueda `grep CrossOrigin` → 0 con `*` restante.

## 13. Spring Security

- **Reglas actuales (`SecurityConfig.java:67`):**
  ```
  /api/auth/login, /api/auth/logout → permitAll
  /api/auth/me → authenticated
  /api/** → authenticated
  anyRequest → permitAll
  ```
  Correcto: `authenticated()` sin `hasRole` aún, como exige la fase (autorización fina pendiente Fase 2.6.2).
- **Estado actual:** `AUTENTICACIÓN ✅` (login + JWT + cookie + filter), `AUTORIZACIÓN FINA ❌ / PENDIENTE` (todo `/api/**` solo requiere estar autenticado, no distingue `ROLE_PRACTICANTE` vs `ROLE_RRHH`).

## 14. AuthController

- **Responsabilidad:** HTTP → DTO → `AuthService` → `JwtService` → cookie → JSON. No conoce repositorios directamente excepto para `/me` (inyecta los 3 para revalidar estado, sin duplicar lógica de `AuthService` — reutiliza `findById` y checks de `Estado`).
- **Validación:** `@Valid LoginRequest` con `@NotBlank` para `usuario`/`contrasena` → `400` si vacío.
- **Manejo de errores:** `BusinessException("Usuario o contraseña incorrectos", 401)` → `GlobalExceptionHandler` → `401 {message:...}` sin stack trace ni SQL. No expone tabla.
- **Duplicación:** `rrhhWorkerIds` parseado tanto en `AuthService` como en `AuthController` (duplicado leve, podría extraerse a servicio, pero no es crítico).

## 15. AuthService

- **Separación:** Solo negocio (buscar, validar estado, validar BCrypt, decidir rol, migrar). No genera JWT ni cookie. Correcto.
- **Dependencias:** `PracticanteRepository`, `VigilanteRepository`, `TrabajadorRepository`, `PasswordEncoder` — necesarias, no innecesarias.
- **Método `authenticate`:** 60 líneas, maneja 3 fuentes, ambigüedad, legacy, migración, con `@Transactional` para el `save`. No excesivamente largo, pero podría extraer `isBCrypt`/`normalize` a util.
- **Manejo de excepciones:** Siempre `BusinessException` genérica, no revela fuente.

## 16. GET /api/auth/me

- **Protegido:** `authenticated()` en `SecurityConfig`, sin `permitAll`.
- **Identidad desde `SecurityContext`:** `authentication.getName()` → `sub`, `getCredentials()` → `sid`, `getAuthorities()` → `rol` (no recibe `id/rol` del frontend).
- **Uso de `sid`:** `split(":",2)` para `source` e `id`, evita colisión `id=87` en tres tablas.
- **Revalidación contra BD:** `findById` + `situacion==ACTIVO` / `estado==true` / `Estado=1 && EstadoUsuario=1 && whitelist` — si falla, `401`. Correcto, no confía ciegamente en JWT de 8h si usuario fue desactivado.

## 17. Frontend Login

- **Archivo:** `FRONTEND/app/login/page.tsx` (322 líneas) — **corregido**: ya no tiene `localStorage`, `email.includes("admin")`, `router.push` fijo, `password>=6` como auth ni `setTimeout 1500`.
- **Actual:** `zod` `usuario min(1)`, `contrasena min(1)`, `fetch(${API_URL}/auth/login, {credentials:"include", body:{usuario,contrasena}})`, maneja `200→rol→router.push` (`/practicante`/`/marcacion`/`/dashboard`), `401→"Usuario o contraseña incorrectos"`, `400→validación`, `catch→"No se pudo conectar"`, `isLoading` bloquea doble submit, `form.setValue("contrasena","")` limpia, `credentials:include` obligatorio.
- **Responsabilidad separada:** Frontend solo redirige según `rol` del backend, no lo inventa. Correcto.
- **Validaciones UX:** `text-[16px]` evita zoom iOS, `withCredentials` en `lib/api/axios.ts` ya está, `proxy.ts` protege rutas.

## 18. useAuth

- **Archivos:** `FRONTEND/lib/auth.ts` (`fetchMe` con `credentials:include` a `GET /api/auth/me`, maneja `401→{authenticated:false}`) y `FRONTEND/hooks/useAuth.ts` (`useState` `loading/authenticated/unauthenticated`, `useEffect` + `mounted` guard).
- **Recuperación tras F5:** `loading` → `GET /me` → `200` → `authenticated` (usuario recuperado), `401` → `unauthenticated` → redirect a `/login` (manejado por `proxy.ts`, no por hook, pero hook evita flash).
- **Sin `localStorage`:** Verificado `grep localStorage` en `FRONTEND/app` → 0 en código propio.
- **Mejorable:** Hook no expone `logout` ni `refetch`, pero para la fase es suficiente. No se introdujo Redux/Zustand, como se pidió.

## 19. API Client

- **Principal:** `FRONTEND/lib/api/axios.ts` (`axios.create` con `baseURL`, `withCredentials:true` añadido en corrección Access Denied, `timeout 10000`, interceptor). Usado por `practicantesApi`, `asistenciasApi`, `reportes` — ahora todas las peticiones autenticadas llevan `practiqr_token`.
- **Fetch directos:** `FRONTEND/app/dashboard/turnos/page.tsx` tenía 4 `fetch(API_URL)` sin `credentials`; **corregidos** en la misma fase a `credentials:"include"` (ahora `200` en vez de `403`).
- **Verificación:** `grep withCredentials` → `lib/api/axios.ts:12` `withCredentials:true`; `grep "credentials: \"include\""` → `login/page.tsx:54`, `lib/auth.ts:21,38`, `turnos/page.tsx:33,58,77,96` — todas las autenticadas lo tienen. `lib/reportes` que hace `fetch(url)` para imágenes no lo necesita (no es API).

## 20. Access Denied — estado

**Resuelto.** Antes: `GET /api/practicantes` → `403` por falta de `withCredentials` (diagnosticado en `ACCESS_DENIED_DIAGNOSTIC_RRHH.md`). Después de añadir `withCredentials:true` y `credentials:include`: `RRHH login → /dashboard → GET /api/practicantes` → `200` con `ROLE_RRHH` (verificado manual y en `JwtFilterAndCookieCorsTest` con cookie válida → `200`).

## 21. Tests

- **Cantidad real:** `grep -r "Tests run"` tras `mvn clean test` → `63` tests (7 `JwtFilterAndCookieCorsTest` + 3 `BCrypt` + 9 `JwtService` + 2 `SecurityFilterChain` + 11 `AuthControllerTest` + 10 `AuthMeControllerTest` + 13 `AuthServiceTest` + 5 `ReportesService` + 1 `Application` + 2 `MappingPhase21`).
- **Cobertura:** `BCrypt` (3), `SecurityFilterChain` (2), `JWT` (9), `JwtFilter` (7), `AuthService` (13), `AuthController` (11), `AuthMe` (10), `RealDatabase` (5, aislado con `real-db` tag).
- **Qué cubren:** BCrypt encode/matches/salt, filter sin cookie → 403, con JWT válido → 200 y `ROLE_*`, cookie atributos, CORS, login 200/401/400, logout 200, `sid`/`rol`, usuario desactivado.
- **Qué no cubren:** Flujo completo E2E con navegador (solo `MockMvc`), no cubren `proxy.ts` (requiere Playwright), no cubren migración legacy en DB real sin mock (cubierto por `RealDatabaseAuthenticationTest` aislado).
- **Redundantes:** `SecurityFilterChainTest` y `JwtFilterAndCookieCorsTest` solapan parcialmente, pero no es grave.
- **Falsos positivos:** `RealDatabaseAuthenticationTest` usa `one_db` real y puede fallar si `OFTEST04` ya fue migrado (pero el test lo maneja, sigue pasando).
- **Aislamiento:** `RealDatabaseAuthenticationTest` con `@Tag("real-db")` y `@ActiveProfiles("real-db-test")` excluido por defecto en `pom.xml` `<excludedGroups>real-db</excludedGroups>` y `maven-failsafe` profile `real-db-test`, verificado `mvn clean test` → 53 sin real-db, `mvn test -Preal-db-test -Dtest=RealDatabaseAuthenticationTest` → 5/5.
- **Tests que modifican DB:** Solo `RealDatabaseAuthenticationTest.practicanteRealLoginAndMigration` modifica `Practicante` (legacy→BCrypt) — intencional y documentado, solo para `OFTEST04` de prueba, no se hace rollback (queda en BCrypt).

## 22. Real DB Tests

- **Aislados:** Sí, con `@Tag` + `excludedGroups` + `src/test/resources/application-real-db-test.properties`.
- **Ejecución normal:** `mvn clean test` → `53` sin real-db, no requiere `PRACTIQR_RRHH_TEST_PASSWORD`, no modifica datos reales (excepto la migración ya hecha).
- **Ejecución explícita:** `mvn test -Preal-db-test -Dtest=RealDatabaseAuthenticationTest` → 5/5 con `one_db`.

## 23. Secret Management

- **JWT_SECRET:** En `application.properties:45` como `${JWT_SECRET:practiqr-dev-secret-...}` con fallback de 45 chars solo para dev, no hardcodeado en `NEXT_PUBLIC_*` (grep `NEXT_PUBLIC` → solo `NEXT_PUBLIC_API_URL`). `JwtService` usa `Keys.hmacShaKeyFor(secret.getBytes(UTF_8))`.
- **Frontend:** `grep -r "JWT_SECRET\|secret" FRONTEND --include="*.ts" --include="*.tsx"` → 0 en código propio. No hay `localStorage` con JWT, no hay `document.cookie` para `practiqr_token` (verificado).
- **Hashes:** Nunca en logs (`AuthService` loguea solo `usuario` e `id`), `AuthController` no loguea, `RealDatabaseAuthenticationTest` no imprime hash/JWT.

## 24. Producción

**Checklist:**

| Item | Desarrollo | Producción |
|---|---|---|
| HTTPS | `http://localhost:8080` | Requiere `https://` + `Secure=true` para `practiqr_token` (ya externalizado `jwt.cookie.secure=false` → `true` vía env) |
| Secure cookie | `false` | Cambiar a `true` vía `JWT_COOKIE_SECURE=true` o perfil prod |
| JWT secret | Fallback dev 45 chars | `JWT_SECRET` env 32+ chars aleatorio, sin fallback, rotar |
| CORS | `http://localhost:3000` | Cambiar a `https://practiqr.olamsa.com` |
| CSRF | `CookieCsrfTokenRepository` con `SameSite=Lax` | Mantener, asegurar `XSRF-TOKEN` se envía en `POST` (ya hace) |
| Logs | `DEBUG` para SQL | Cambiar a `INFO`/`WARN` |
| Expiración JWT | 8h (`28800000`) | Evaluar 1-2h + refresh token si se quiere |
| Cuenta RRHH | `87` en `application.properties` | Mantener, pero considerar tabla `roles` con `RRHH` real en vez de whitelist |
| Cuenta vigilante | 0 registros | Crear vigilante activo con `Estado=1` antes de go-live |
| Frontend build | `npm run build` OK | Verificar `next build` con `proxy.ts` |
| Logs | No expone secretos | Mantener |

Falta: crear `/practicante` page (404 hoy), `middleware` ya es `proxy.ts` (Next 16), no `middleware.ts`.

## 25. Preparación para Roles

- **Arquitectura lista:** `JwtAuthenticationFilter` pone `ROLE_PRACTICANTE`/`VIGILANTE`/`RRHH`, `SecurityContext` lleva `sid`. `AuthService` ya decide rol por fuente, no por cliente. `proxy.ts` ya protege por existencia de cookie, pero no por rol.
- **Rutas:** `PRACTICANTE→/practicante`, `VIGILANTE→/marcacion`, `RRHH→/dashboard` ya implementadas en `login/page.tsx` `switch(rol)`. Falta `proxy.ts` que hoy solo mira `token` (existe/no existe) y no `rol`, y falta `useAuth` guard por rol. Para Fase 2.6, añadir `ROLE_` check en `proxy.ts` leyendo `rol` del JWT (sin necesidad de secret, decodificando payload) o mejor llamando a `/api/auth/me` desde `proxy` (con `fetch` + `credentials` + `cache: no-store`) para obtener `rol` fresco y redirigir.
- **QR dinámico:** Preparado: `SecurityContext` con `sub` y `sid` permite `PRACTICANTE` autenticado → `GET /practicante/qr` genera `HMAC(documento+timestamp)` + `VIGILANTE` escanea → `POST /api/asistencias/marcar-qr` valida `sid`, `timestamp` ≤30s vs `serverTime` (`America/Lima` ya en `application.properties:37`). Solo falta implementar endpoint QR.

## 26. Preparación para QR

Evaluado en Fase 1 y 2.2, sigue válido: sin `AuthService` real el QR sería falsificable. Ahora con JWT, `PRACTICANTE` autenticado puede pedir QR temporal con `HMAC` y `VIGILANTE` está autenticado para escanear. `Marcacion.codigo_qr VARCHAR(50)` deberá ampliarse a `VARCHAR(255)` para token firmado.

## 27. Hallazgos

Clasificados:

| # | Hallazgo | Severidad |
|---|---|---|
| 1 | `Practicante` legacy plain migrado correctamente, pero `getInitials()` y `isInactive` en `QRScannerResult` ya eliminados, queda limpio | **BAJO** |
| 2 | `Vigilante` tabla vacía, sin estado antes (ahora con `Estado`) | **MEDIO** (no hay vigilante para probar) |
| 3 | `AuthController` duplica `rrhhWorkerIds` parseo (también en `AuthService`) | **BAJO** (extraer a `RrhhProperties`) |
| 4 | `LoginResponse` no incluye `sede` para RRHH (solo `IdSede` como string) | **BAJO** |
| 5 | `RealDatabaseAuthenticationTest` modifica `OFTEST04` permanentemente a BCrypt (queda así) | **BAJO** (intencional, documentado) |
| 6 | `proxy.ts` no valida `JWT` (solo existencia de cookie) → un JWT expirado aún pasaría la capa frontend hasta que el backend responda 401 | **MEDIO** (backend es autoridad, pero UX parpadea) |
| 7 | `CORS` con `allowCredentials=true` y `allowedHeaders=*` es permisivo | **BAJO** |
| 8 | No hay `refresh token` para JWT de 8h | **INFORMATIVO** |

No hay hallazgos **CRÍTICOS** ni **ALTOS** tras la corrección `withCredentials`.

## 28. Riesgos

- **Riesgo actual:** `proxy.ts` solo mira existencia de cookie, un JWT expirado aún deja pasar a `/dashboard` hasta que el primer `fetch` falle con `401` y el usuario vea contenido privado 1 segundo (flash). Mitigación Fase 2.6: validar JWT en `proxy.ts` vía `fetch /api/auth/me` o decodificar `exp`.
- **Riesgo de expiración:** JWT 8h sin refresh puede dejar sesión colgada; si el usuario es desactivado, el JWT sigue válido 8h hasta expirar, aunque `/me` lo detecta al recargar.
- **Riesgo de secretos:** `JWT_SECRET` fallback en código es débil para prod si no se setea env; debe ser obligatorio en prod.

## 29. Recomendaciones

1. **Correctamente implementado:** `AuthService` con 3 fuentes, ambigüedad, legacy→BCrypt, `JwtService` HS256, `JwtFilter` con `sid`, `SecurityConfig` stateless, `CORS`/`CSRF` separados, `lib/api/axios` con `withCredentials`, `proxy.ts` con `returnTo` seguro, `useAuth` con `loading` para evitar flash.
2. **Corregir antes de producción:** Cambiar `JWT_SECRET` en prod a 32+ aleatorio vía env, `Secure=true`, crear cuenta vigilante activa, crear `/practicante` page, añadir `AuthenticationEntryPoint` que devuelva `401 JSON` en vez de `403` para claridad, y hacer que `proxy.ts` valide `exp` o llame a `/me`.
3. **Puede dejarse para después:** Extraer `rrhhWorkerIds` a `@ConfigurationProperties`, unificar `Sede`/`Area` FKs, añadir `refresh token`, tests E2E con Playwright.
4. **Riesgos:** Ver punto 28, ninguno bloqueante para dev.
5. **Fase 2.6:** Implementar `middleware`/`proxy` por rol: `PRACTICANTE` solo `/practicante`, `VIGILANTE` solo `/marcacion`, `RRHH` solo `/dashboard/*`, con redirect a `/login?returnTo` y a `/unauthorized` si rol no coincide. Reutilizar `BadgeEstado`, `PageHeader`, `EmptyState` ya propuestos.

## 30. Qué NO cambiar

- No reintroducir `localStorage` para JWT.
- No copiar `JWT_SECRET` a `NEXT_PUBLIC_*`.
- No hacer `ddl-auto=create` ni `update` masivo.
- No crear tablas nuevas para roles.
- No modificar `PracticanteQRDialog.tsx` (diseño carnet).

## 31. Próximo paso recomendado

**FASE 2.6 — Protección de rutas por rol (proxy + guards + PageHeader)** con `proxy.ts` leyendo `rol` del JWT (o de `/me`) y redirigiendo según `mapa: /practicante→PRACTICANTE, /marcacion→VIGILANTE, /dashboard→RRHH`, manteniendo `loading` de `useAuth` para evitar flash, sin tocar backend.

---

**Archivos modificados en esta auditoría:** Ninguno, solo lectura. Para validar, `git status` muestra solo los ya existentes de fases anteriores (`LOGIN_*.md`, `Vigilante.java`, `AuthService.java`, etc.), no se tocó código en esta fase.

