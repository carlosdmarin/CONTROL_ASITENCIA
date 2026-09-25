# LOGIN SESSION — PHASE 2.5.2

## 1. Resultado
**FASE 2.5.2: COMPLETADA**

`GET /api/auth/me` implementado, protegido, con validación de estado actual. Frontend con utilidad `fetchMe` y hook `useAuth` para hidratar sesión tras F5, con estados `loading/authenticated/unauthenticated`. Sin `localStorage`, sin JWT en JS, sin middleware, sin `/practicante`.

## 2. GET /api/auth/me
`AuthController.java:67` `@GetMapping("/me")` protegido (`SecurityConfig` ahora `requestMatchers("/api/auth/login","/api/auth/logout").permitAll()` y `"/api/auth/me".authenticated()`). Si no hay autenticación → `401 {authenticated:false, message:"No autenticado"}`. Si hay → `200 {authenticated:true, user:{id,nombre,usuario,rol,documento}}`.

## 3. Identidad desde SecurityContext
```java
Authentication auth = SecurityContextHolder.getContext().getAuthentication();
String sid = (String) auth.getCredentials(); // "trabajadores:87" etc.
String sub = auth.getName(); // "87"
String rol = auth.getAuthorities().stream().findFirst()...
```
No se recibe `id/rol` del frontend, solo del JWT validado por `JwtAuthenticationFilter` (firma+issuer+exp).

## 4. Uso de sid
`sid` con formato `practicante:ID / vigilante:ID / trabajadores:ID` evita colisión de IDs numéricos iguales entre tablas. Se hace `split(":",2)` y se busca en el repositorio correspondiente.

## 5. Validación del estado actual
No se confía solo en JWT de 8h. Se consulta DB actual:
- `practicante:ID` → `practicanteRepository.findById` + `situacion==ACTIVO` (si `INACTIVO` → 401)
- `vigilante:ID` → `findById` + `estado==true` → 401 si false
- `trabajadores:ID` → `findById` + `Estado==1 && EstadoUsuario==1 && id in rrhhWorkerIds` → 401 si no
Si usuario ya no existe → 401.

## 6. Response
Éxito `200`:
```json
{"authenticated":true,"user":{"id":87,"nombre":"KELITA HARO TAMANI","usuario":"75257890","rol":"RRHH","documento":"75257890"}}
```
Sin `contrasena`, `hash`, `JWT`, `secret`. Campos justificados: `id` para `sub`, `nombre` para UI, `rol` para autorización, `documento` para practicante.

## 7. 401
Si no hay cookie, JWT inválido/expirado, usuario no existe, inactivo, rol/sid inválido → `401 {authenticated:false}` genérico, sin revelar si es por expiración o inactivo.

## 8. Recuperación de sesión
`FRONTEND/lib/auth.ts`:
```ts
export async function fetchMe() => fetch(`${API_URL}/auth/me`, {credentials:"include"})
```
`FRONTEND/hooks/useAuth.ts`:
```ts
type AuthState = {status:"loading"|"authenticated"|"unauthenticated", user:AuthUser|null}
useEffect(() => fetchMe().then(data=> data?.authenticated ? authenticated : unauthenticated))
```
Tras F5, `loading` → `GET /me` → `200` recupera usuario sin login.

## 9. Logout
`POST /api/auth/logout` ya existía, sigue funcionando: `jwtService.createLogoutCookie()` → `Set-Cookie Max-Age=0`. Después `GET /me` → `401`.

## 10. Pruebas backend
`controller/AuthMeControllerTest.java` (10 tests, mocks de repos):
- sin auth → 401
- JWT PRACTICANTE → 200 rol PRACTICANTE
- JWT VIGILANTE → 200
- JWT RRHH → 200 (con `trabajadores:87`)
- expirado (1ms) → 401
- inválido → 401
- practicante INACTIVO → 401
- vigilante estado false → 401
- RRHH Estado 0 / EstadoUsuario 0 → 401
Sin modificar datos reales.

## 11. Pruebas frontend
No hay infraestructura `jest/vitest` (verificado `package.json` sin test). Validación manual:
- Login RRHH → /dashboard → F5 sigue autenticado (fetchMe 200)
- Logout → /login → F5 sigue /login
- Borrar cookie → /me 401 → redirect login
- Login practicante → /practicante (404 esperado, pero estado authenticated correcto)

## 12. Archivos modificados
```
BACKEND/src/main/java/com/asistencia/attendance_system/controller/AuthController.java (+GET /me)
BACKEND/src/main/java/com/asistencia/attendance_system/security/JwtAuthenticationFilter.java (sid en credentials)
BACKEND/src/main/java/com/asistencia/attendance_system/config/SecurityConfig.java (me authenticated)
FRONTEND/lib/auth.ts (NUEVO)
FRONTEND/hooks/useAuth.ts (NUEVO)
BACKEND/src/test/java/com/asistencia/attendance_system/controller/AuthMeControllerTest.java (NUEVO, 10 tests)
LOGIN_SESSION_PHASE_2_5_2.md (ESTE)
```

## 13. BD
**SIN CAMBIOS** — no se ejecutó ALTER/INSERT. Solo lecturas.

## 14. JWT
**SIN CAMBIOS** — `JwtService` ya existía, se reutiliza.

## 15. Pendientes
- `middleware.ts` para protección de rutas frontend (Fase 2.6)
- `/practicante` page
- Interceptor global 401 para APIs
