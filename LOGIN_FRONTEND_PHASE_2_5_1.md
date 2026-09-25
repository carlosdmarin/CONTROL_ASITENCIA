# LOGIN FRONTEND — PHASE 2.5.1

## 1. Resultado
**FASE 2.5.1: COMPLETADA**

Login real conectado a `POST /api/auth/login` con `credentials: "include"` y manejo de cookie HttpOnly. Visual, splash, tipografías y responsive intactos. Sin `localStorage` para sesión, sin JWT en JS.

## 2. Login mock eliminado
Eliminados de `FRONTEND/app/login/page.tsx:46-70`:
- `if (email && password.length >=6) { role = email.includes("admin")?"admin":"practicante" }`
- `localStorage.setItem("user", JSON.stringify(...))`
- `router.push("/marcacion")` incondicional
- Validación local `password>=6` como única.
No queda `localStorage`, `email.includes`, ni `setTimeout` de simulación (solo queda el splash de 1250ms que es visual y necesario).

## 3. Endpoint utilizado
`POST /api/auth/login` (Spring Boot `http://localhost:8080/api/auth/login` vía `NEXT_PUBLIC_API_URL`).
No se creó proxy; se usa URL directa del backend.

## 4. Request
```json
{ "usuario": "75257890", "contrasena": "..." }
```
Validación `zod`: `usuario: z.string().min(1)`, `contrasena: z.string().min(1)` (ya no `email`). Campos enviados exactamente como backend espera (`AuthController` valida `@NotBlank`). No se envían `email`, `password`, `role`, `id`, `sede`. `usuario` se envía `trim()` y `contrasena` sin trim.

## 5. credentials include
`fetch(`${API_URL}/auth/login`, { method:"POST", credentials:"include", headers:{"Content-Type":"application/json"}, body:JSON.stringify({usuario, contrasena}) })` — obligatorio para recibir y enviar `practiqr_token` HttpOnly. Verificado `API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api"` (`.env.local` tiene `http://localhost:8080/api`).

## 6. Cookie HttpOnly
Backend envía `Set-Cookie: practiqr_token=...; HttpOnly; Path=/; Max-Age=28800; SameSite=Lax; Secure=false` (dev). Frontend **no** lee ni escribe la cookie: no hay `document.cookie`, no `localStorage.setItem("token")`, no `localStorage.setItem("user")`. El navegador la almacena automáticamente.

## 7. Manejo de respuesta
Si `response.ok && body.authenticated`: se lee `body.user.rol` y se confía en el backend. No se inventa rol. `form.setValue("contrasena","")` limpia el input. Si falta rol o es desconocido, se muestra error seguro sin redirigir.

## 8. Redirección por rol
```ts
switch(rol){
  case "PRACTICANTE": router.push("/practicante"); break;
  case "VIGILANTE": router.push("/marcacion"); break;
  case "RRHH": router.push("/dashboard"); break;
  default: setError("Tu cuenta no tiene un rol válido para PractiQR.");
}
```
`/practicante` aún no existe (documentado). No se creó en esta fase para no romper la regla; si se navega dará 404 temporal hasta Fase 2.5.2.

## 9. Manejo de errores
- **401** → `Usuario o contraseña incorrectos` (genérico, no revela si usuario existe o es de otra tabla)
- **400** → `body.message || "Datos inválidos. Revisa los campos."`
- Otro `!ok` → `body.message || Error inesperado (status)`
- **Red** (`fetch` lanza) → `No se pudo conectar con el servidor. Intenta nuevamente.` (sin detalles técnicos ni stack trace)

## 10. Loading
`isLoading` bloquea doble submit: `if (isLoading) return;` al inicio de `onSubmit`, `disabled` en inputs y botón, `disabled=true` en botón, spinner `Ingresando...`. Al terminar `finally {setIsLoading(false)}`. Sin `setTimeout` artificial.

## 11. localStorage eliminado
Búsqueda `grep -r localStorage FRONTEND --include="*.tsx"` → 0 resultados en código propio (solo aparece en `node_modules`). No se guarda `user`, `token` ni `role` en `localStorage`/`sessionStorage`.

## 12. Splash
Conservado: `{showSplash && <SplashScreen duration={1250} .../>}` y animación `login-enter`. No se añadió segundo loader. Solo se eliminó el `1500ms` de simulación.

## 13. Tests
Proyecto no tiene infraestructura de tests frontend (no hay `jest`/`vitest`). No se instaló nueva herramienta. Para Fase 2.5.2 se podrá añadir test de `fetch` con mock de `credentials:include` si se introduce framework.

Manual:
- RRHH `75257890` + pass real → 200, `rol=RRHH`, cookie, redirect `/dashboard`
- Practicante `OFTEST04` + pass → 200 `PRACTICANTE` → `/practicante` (404 hasta crear)
- Vigilante (tabla vacía) → pendiente cuenta real
- 401/400/network → mensajes correctos, sin `localStorage`
- Doble click → solo 1 POST

## 14. Archivos modificados
```
FRONTEND/app/login/page.tsx (reemplazado onSubmit, schema, Controller name, payload, manejo de respuesta, redirección, eliminado localStorage y setTimeout)
```
No se tocó `FRONTEND/app/practicante` (no existe), `PracticanteQRDialog.tsx`, `CustomQRCode.tsx`.

## 15. BD
**SIN CAMBIOS** — `one_db` intacta, `vigilante.Estado` ya de Fase 2.2.1, `trabajadores` y `Practicante` con migración lazy ya validada.

## 16. Backend
**SIN CAMBIOS** — `AuthService`, `AuthController`, `JwtService`, `SecurityConfig` siguen igual. Solo se consume `POST /api/auth/login` y `POST /api/auth/logout` (ya existentes).

## 17. Pendientes para FASE 2.5.2
- Crear lectura de usuario autenticado (`GET /api/auth/me` o similar) para hidratar sesión tras recarga (hoy la sesión solo vive en memoria y cookie).
- Redirección real a `/practicante` cuando exista la página.
- Manejo de `401` global para expirar sesión.
