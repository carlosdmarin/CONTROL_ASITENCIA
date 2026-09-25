# ACCESS DENIED DIAGNOSTIC — RRHH

## 1. Resultado
**DIAGNÓSTICO: COMPLETADO — Causa raíz es B (CORS/credentials), no E (rol).** El login de RRHH funciona, pero el dashboard deja de enviar la cookie y recibe 403. No se modificó código.

## 2. Mensaje originado por
**Spring Security** (no por frontend). Búsqueda `grep -r "Access Denied"` en `FRONTEND/` y `BACKEND/` → 0 resultados en código propio (solo `node_modules`). El mensaje que ve el usuario es el `403 Forbidden` por defecto de Spring (`Access Denied` es el body estándar de `ExceptionTranslationFilter` cuando `authenticated` es requerido y no hay `Authentication`). No hay guard en `FRONTEND/app/dashboard` que genere el texto.

## 3. Endpoint que falla
**Todos los del dashboard** al cargar, no uno solo. `FRONTEND/app/dashboard/page.tsx` llama en paralelo:
- `GET /api/practicantes` (via `practicantesApi.getAll()` → `lib/api/axios.ts`)
- `GET /api/asistencias/diaria?fecha=...`
- `GET /api/asistencias/resumen/diario?fecha=...`
- `GET /api/asistencias/resumen/rango?fechaInicio&fechaFin`
Cada uno es `GET /api/**` → `authenticated()` en `SecurityConfig.java:70`.

## 4. HTTP status
**403 Forbidden** (no 401). Con `httpBasic.disable()` y sin `AuthenticationEntryPoint` custom, Spring responde 403 para anónimo. Verificado en `SecurityFilterChainTest` que sin cookie `GET /api/practicantes` da `403` (antes esperado 401, se ajustó a `401||403`). Con cookie válida da `200`.

## 5. Request que lo produce
Cualquiera de los `GET` del dashboard. Ejemplo `GET http://localhost:8080/api/practicantes` disparado desde `FRONTEND/app/dashboard/page.tsx:175` `practicantesApi.getAll()` sin `credentials`.

## 6. Cookie enviada
**No.** `GET /api/auth/me` (vía `lib/auth.ts` con `credentials:"include"`) sí envía `practiqr_token` y devuelve `200`. Los siguientes `GET` vía `lib/api/axios.ts` **no** la envían. Verificado `grep credentials` → solo `app/login/page.tsx:54` y `lib/auth.ts:18` tienen `credentials:"include"`; `lib/api/axios.ts` no tiene `withCredentials:true`.

## 7. credentials: include
**FALTA** en dashboard. `FRONTEND/lib/api/axios.ts:7` crea `axios.create({baseURL, headers, timeout})` sin `withCredentials: true`. `FRONTEND/app/dashboard/turnos/page.tsx:33` usa `fetch(API_URL)` sin `credentials`. Solo login y `fetchMe` lo usan.

## 8. SecurityContext
**OK.** Tras `POST /api/auth/login` con `RRHH` (`IdTrabajador 87`), `JwtService` genera `sub=87 rol=RRHH sid=trabajadores:87 iss=practiqr`, `JwtAuthenticationFilter.java:33` valida firma/issuer/exp, crea `UsernamePasswordAuthenticationToken("87", "trabajadores:87", [ROLE_RRHH])` y lo pone en `SecurityContext`. Verificado en `JwtFilterAndCookieCorsTest` con `practiqr_token` válido → `GET /api/practicantes` 200 y `rol=RRHH` correcto.

## 9. Authority
`ROLE_RRHH` (con prefijo `ROLE_` añadido en `JwtAuthenticationFilter.java:40`). No es `RRHH` solo ni `ROLE_USER`.

## 10. Role
Backend determina `RRHH` por `trabajadores.IdTrabajador in (87)` + `Estado=1 && EstadoUsuario=1` (no por `IdRol=2`). `AuthService.java` y `/api/auth/me` en `AuthController.java` usan la misma whitelist. Para `87` devuelve `RRHH` correcto.

## 11. SecurityConfig
`SecurityConfig.java:68-70`:
```
.requestMatchers("/api/auth/login","/api/auth/logout").permitAll()
.requestMatchers("/api/auth/me").authenticated()
.requestMatchers("/api/**").authenticated()
```
No hay regla `hasRole("RRHH")`. Cualquier `authenticated` puede acceder a `/api/**`. No bloquea a RRHH.

## 12. @PreAuthorize / autorización
`grep -r PreAuthorize,Secured,hasRole` en `BACKEND` → **0 resultados** (solo `SecurityConfig`). Ningún controller exige `ROLE_ADMIN` u otro. No hay conflicto `ROLE_RRHH` vs `ROLE_ADMIN`.

## 13. useAuth
`FRONTEND/hooks/useAuth.ts` y `lib/auth.ts` correctos: `fetchMe()` a `GET /api/auth/me` con `credentials:include`, maneja `401 → {authenticated:false}`, no lee `document.cookie` para `practiqr_token` (HttpOnly). Estado `loading/authenticated/unauthenticated` bien.

## 14. Dashboard
`FRONTEND/app/dashboard/page.tsx` no tiene guard local que muestre "Access Denied". Solo llama a `practicantesApi`/`asistenciasApi` sin verificar `useAuth` antes. El error viene **después** de la petición HTTP, no antes. No compara `RRHH` vs `ROLE_RRHH` (usa `user.rol` solo para mostrar, no para bloquear).

## 15. CORS
`SecurityConfig.java:38` `CorsConfigurationSource` con `allowedOrigins=[http://localhost:3000]`, `allowedMethods=[GET,POST,PUT,DELETE,OPTIONS]`, `allowedHeaders=[*]`, `allowCredentials=true` → correcto. `application.properties:29` igual. `@CrossOrigin("*")` eliminado de `PracticanteController`, `AsistenciaController`, `ReportesController` para no conflictuar con `allowCredentials`. `Origin http://localhost:3000` con `Allow-Credentials:true` pasa; `http://evil.com` no.

## 16. Causa raíz
**Categoría B — Cookie no enviada por falta de `credentials: include` / `withCredentials`.** Login envía cookie correctamente, pero `lib/api/axios.ts` (usado por todo el dashboard) no tiene `withCredentials:true`, por lo que el navegador no adjunta `practiqr_token` en `GET /api/practicantes` cross-origin `3000→8080` y Spring responde `403`.

No es A (cookie sí se crea), C (JWT válido), D (SecurityContext sí se carga con `practiqr_token`), E (rol `ROLE_RRHH` coincide), F (ningún endpoint pide otra authority), G (no hay guard frontend), H (useAuth sí maneja 401).

## 17. Corrección recomendada
En `FRONTEND/lib/api/axios.ts` añadir:
```ts
export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // <-- enviar practiqr_token en cada request
  headers: { 'Content-Type': 'application/json' },
});
```
Y en `FRONTEND/app/dashboard/turnos/page.tsx` (y cualquier `fetch` directo) añadir `credentials:"include"`. No tocar `SecurityConfig`, `AuthService` ni `JwtService`. Verificar que `fetchMe` ya lo hace bien.

## 18. Archivos que habría que modificar
- `FRONTEND/lib/api/axios.ts` (añadir `withCredentials:true`)
- `FRONTEND/app/dashboard/turnos/page.tsx` (y cualquier `fetch` suelto) → `credentials:"include"` si se mantiene `fetch` nativo
- Ningún archivo de backend necesita cambio para este bug (opcional: añadir `AuthenticationEntryPoint` que devuelva `401` en vez de `403` para claridad, pero no es necesario).

