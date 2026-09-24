# LOGIN AUTH DESIGN — PHASE 2.2

## 1. Resultado de la auditoría
**FASE 2.2: COMPLETADA (con 1 punto PENDIENTE DE CONFIRMACIÓN)**

Se inspeccionó `one_db` real vía `pymysql` + `DESCRIBE` + `SELECT` y código `BACKEND/src` + `FRONTEND/app/login`. No se modificó código, BD ni frontend. Se determinó con evidencia el identificador, credencial, estado y rol de las 3 fuentes. Queda pendiente confirmar cómo ONE distingue `RRHH` si no es por `IdRol=2` (ver §5/19). No se instaló dependencia.

## 2. Fuentes reales de usuarios
| Fuente | Tabla real one_db | Entidad JPA | PK | Registros | Rol futuro |
|---|---|---|---|---|---|
| Practicante | `Practicante` | `Practicante.java:13` | `id_practicante` BIGINT | 1 (id=3 OFTEST04) | PRACTICANTE |
| Vigilante | `vigilante` (singular, no `vigilantes`) | `Vigilante.java:13` | `id_vigilante` INT | 0 | VIGILANTE |
| Trabajador/RRHH | `trabajadores` | `Trabajador.java:13` | `IdTrabajador` INT | 219 (87=KELITA) | RRHH (solo id 87) |

Evidencia: `SHOW TABLES` → 63 tablas, `vigilante` existe, `vigilantes` → `1146 Table doesn't exist`. `trabajadores` existe con 31 cols.

## 3. PRACTICANTE
### Identificador
`documento` (VARCHAR 20 UNIQUE NOT NULL) y `usuario` (VARCHAR 50 UNIQUE NOT NULL) son idénticos en datos reales: `PracticanteServiceImpl.java:85` `setUsuario(documento)` `setContrasena(documento)`. El login más coherente es `usuario` (o `documento`, son intercambiables). `PracticanteRepository.java:17` `findByDocumento` es el método real usado. `correo_electronico` es nullable, no sirve como identificador principal.

### Credenciales
`contrasena VARCHAR(255)` (`Practicante.java:71`). **Texto plano = documento**. Muestra: `LENGTH(contrasena)=8` para `OFTEST04` (id 3). No hay hash. `SELECT LENGTH` confirma 8, no 60 de bcrypt.

### Estado
` situacion VARCHAR(20) NOT NULL` (`Practicante.java:50`) con enum `Situacion.ACTIVO/INACTIVO`. `practicante.situacion` decide. `fecha_desactivacion` nullable. Solo `ACTIVO` puede loguearse.

### Rol
No hay columna `rol`. El rol `PRACTICANTE` se asigna **por origen**: si el registro viene de tabla `Practicante`, rol=PRACTICANTE (lógica de `AuthService` futura, no BD).

### Repository
`PracticanteRepository` existe, `findByDocumento` funcional. Para login futuro se usará ese método.

## 4. VIGILANTE
### Identificador
`usuario VARCHAR(50) UNIQUE NOT NULL` (`vigilante` DESCRIBE). Único candidato (no hay email ni DNI).

### Credenciales
`contrasena VARCHAR(255) NOT NULL`. Tabla vacía (`COUNT=0`), pero `Vigilante.java:21` mapea `contrasena`. Por analogía con `trabajadores`, se espera **bcrypt** cuando se inserte (no hay muestra). Hoy no se puede verificar formato.

### Estado
**NO EXISTE** columna `estado`/`situacion` en `DESCRIBE vigilante` (solo 5 cols: id, nombre, apellido, usuario, contrasena). No hay forma de desactivar sin borrar. Riesgo documentado en `LOGIN_MAPPING_PHASE_2_1.md`.

### Rol
Por origen tabla `vigilante` → `VIGILANTE`. No hay `IdRol`.

### Repository
`VigilanteRepository.java` `findByUsuario` — funcional, validado con `count=0` sin error.

## 5. TRABAJADOR / RRHH
### Identificador
`Usuario VARCHAR(15) NOT NULL` (valor `75257890` para id 87) y `Email VARCHAR(100)` ambos únicos candidatos. `CodTrab 00424` y `NroDoc 75257890` también existen. El login más coherente es `Usuario` (es lo que `trabajadores` usa como login en ONE), con fallback `Email`. Se proveen en `TrabajadorRepository` `findByUsuario`, `findByEmail`, `findByNroDoc`, `findByCodTrab`.

### Credenciales
`PasswordUser VARCHAR(255) NOT NULL` — **bcrypt detectado** (`$2y$10$...` para id 87, `LENGTH` ~60, no mostrado). No es texto plano.

### Estado
Dos columnas: `Estado INT(1)` (trabajador activo) y `EstadoUsuario INT(1)` (cuenta activa). Para id 87 ambos `1`. Debe validarse `Estado=1 AND EstadoUsuario=1`.

### Rol
`IdRol INT NOT NULL` FK a `roles.IdRol`. Valores reales: `SELECT IdRol, COUNT(*) FROM trabajadores GROUP BY IdRol` → `(1,1) SYSTEMADMIN, (2,217) TRABAJADOR, (8,1) ANALISTA`. **IdRol=2 es `TRABAJADOR` ("Usuario por defecto sin permisos") — NO es RRHH.** No existe rol `RRHH` en `roles` (9 roles listados, ninguno contiene `RRHH`/`RECURSOS`). La designación RRHH para id 87 es **por identidad** (`IdTrabajador=87`), no por rol. Para futuro, `RRHH` debe ser `IdTrabajador=87` whitelist o crear rol `RRHH` (pendiente confirmación con ONE).

### Repository
`TrabajadorRepository` con 4 finders — funcional (`findByUsuario("75257890") present=true`).

## 6. Tabla/estructura de roles
Tabla `roles` existe: `IdRol PK, Rol VARCHAR(45), Descripcion, Estado, CREATEDATE`. 10 filas. No hay `IdRol` para RRHH. Relación `trabajadores.IdRol → roles.IdRol` lógica pero sin FK física. No hay tabla `perfil` aparte. `vigilante` no tiene rol.

## 7. Estrategia de contraseñas
| Fuente | Columna | Formato | Longitud | PasswordEncoder |
|---|---|---|---|---|
| Practicante | `contrasena` | **plaintext = documento** | 8-20 | Ninguno hoy; futuro `BCryptPasswordEncoder` con migración |
| Vigilante | `contrasena` | **presumible bcrypt** (vacío) | 255 | `BCrypt` |
| Trabajador | `PasswordUser` | **bcrypt** (`$2y$10$`) | ~60 | `BCrypt` |

Incompatibilidad: practicante debe migrarse a bcrypt. Estrategia futura: `if (hash startsWith $2) matches(bcrypt) else if (plain==documento) re-hash y update`. No modificar ahora.

## 8. Contrato propuesto de /api/auth/login
**Request:**
```json
{ "usuario": "75257890", "contrasena": "plano-o-bcrypt" }
```
`usuario` acepta `usuario`/`documento`/`email` (se intenta en orden `findByUsuario → findByEmail → findByDocumento`). No se pide `rol` al cliente.

**Response éxito (sin datos sensibles):**
```json
{
  "authenticated": true,
  "user": {
    "id": 87,
    "nombre": "KELITA HARO TAMANI",
    "usuario": "75257890",
    "rol": "RRHH",
    "sede": "Pucallpa (IdSede=2)",
    "documento": "75257890"
  }
}
```
Campos justificados: `id` para JWT `sub`, `nombre` para UI, `rol` para autorización, `sede/documento` para QR y reportes. No incluir `hash` ni `IdRol`.

## 9. Arquitectura de sesión
```
Login POST /api/auth/login {usuario, contrasena}
  → AuthService valida contra 3 repositorios en orden: Vigilante → Trabajador(87) → Practicante
  → PasswordEncoder.matches()
  → valida Estado/ Situacion
  → genera JWT
  → Set-Cookie: practiqr_token=JWT; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=8h
  → Response JSON user
Peticiones posteriores: browser envía cookie automáticamente → JwtFilter valida → SecurityContext
Logout: POST /api/auth/logout → Set-Cookie Max-Age=0
```

## 10. JWT propuesto
Payload (firmado HS256 con secret 32+ chars en `application.properties`):
```json
{ "sub": "87", "rol": "RRHH", "sid": "trabajadores:87", "iat": 123, "exp": 123+28800, "iss": "practiqr" }
```
Para practicante: `sub=id_practicante`, `sid=practicante:3`. Para vigilante: `sid=vigilante:1`. `exp` 8h (jornada). No incluir `sede` en JWT para no desactualizar; se consulta al refrescar.

## 11. Cookie HttpOnly
`Set-Cookie: practiqr_token=<JWT>; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=28800` . `Secure` solo en prod https, `Lax` permite top-level GET. Frontend nunca toca `localStorage` (eliminar `localStorage.setItem("user")` de `login/page.tsx:58`). Con `SameSite=Lax` y `allowCredentials=true` en CORS.

## 12. Matriz de autorización
| Recurso | PRACTICANTE | VIGILANTE | RRHH |
|---|:---:|:---:|:---:|
| `/login` | ✅ | ✅ | ✅ |
| `/practicante` (futura) | ✅ | ❌ | ❌ |
| `/marcacion` | ❌ | ✅ | ❌ |
| `/marcacion/historial` | ❌ | ✅ | ❌ |
| `/dashboard` `/dashboard/practicantes` `/reportes` | ❌ | ❌ | ✅ |
| `POST /api/auth/login` | ✅ | ✅ | ✅ |
| `GET /api/practicantes/**` | ❌ | ✅(solo lectura QR) | ✅ |
| `POST /api/asistencias/marcar` | ❌ (solo via QR) | ✅ | ❌ |
| `GET /api/asistencias/diaria` `/resumen/*` | ❌ | ✅ | ✅ |
| `GET /api/reportes/**` | ❌ | ❌ | ✅ |

## 13. Endpoints actualmente abiertos
Todos sin auth (muestra):
- `PracticanteController.java:14` `@CrossOrigin(origins="*")` `GET /api/practicantes`, `POST /api/practicantes`, `GET /api/practicantes/{id}`, `/documento/{doc}`, `/activos`, `/buscar` — públicos.
- `AsistenciaController.java:23` `@CrossOrigin(origins="*")` `POST /api/asistencias/marcar`, `/entrada/{doc}`, `/salida/{doc}`, `GET /diaria`, `/resumen/*`, `/reporte/*` — públicos.
- `SedeController`, `OficinaController`, `ReportesController` — todos `*`.

Deberán protegerse con `SecurityFilterChain` + `@PreAuthorize` o `requestMatchers`.

## 14. Cambios futuros de CORS
Actual: `application.properties:29` `allowed-origins=http://localhost:3000` + `@CrossOrigin("*")` en controllers (anula). Futuro: quitar `@CrossOrigin("*")`, crear `CorsConfigurationSource` con `allowedOrigins=http://localhost:3000`, `allowedMethods=GET,POST,PUT,DELETE,OPTIONS`, `allowedHeaders=*`, `allowCredentials=true` (requerido para cookie HttpOnly). Sin `allowCredentials`, el browser no enviará `practiqr_token`.

## 15. Cambios futuros del login frontend
Archivo `FRONTEND/app/login/page.tsx`:
- Eliminar `localStorage.setItem("user")` (`:58`), `role = email.includes("admin")`, `setTimeout 1500`, `if (email && password>=6) router.push("/marcacion")` (`:50-61`).
- Reemplazar por `fetch("http://localhost:8080/api/auth/login", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({usuario,password}), credentials:"include"})` y manejar `response.authenticated` → `router.push` según `user.rol` (`/marcacion` si VIGILANTE, `/practicante` si PRACTICANTE, `/dashboard` si RRHH).
- Eliminar validación local `password>=6` como única, mantener `zod` pero delegar verificación a backend.
- Eliminar `middleware.ts` inexistente → crearlo para proteger rutas con lectura de cookie JWT (no `localStorage`).

## 16. Compatibilidad con QR dinámico
Sí, compatible si se hace login real primero: `PRACTICANTE` autenticado → `GET /api/practicante/qr` (futuro) genera `base64(documento|timestamp|HMAC-SHA256(documento+timestamp, secret))` con `secret` por practicante o global. `VIGILANTE` escanea → `POST /api/asistencias/marcar-qr {tokenQr}` → backend valida `HMAC`, `timestamp` ≤30s vs `serverTime` (`America/Lima` ya configurado), y `practicante.situacion=ACTIVO`. Sin login real hoy, el QR sería falsificable con solo DNI.

## 17. Riesgos encontrados
- Vigilante tabla vacía y sin estado.
- IdRol=2 no es RRHH, RRHH es whitelist id 87 sin rol dedicado.
- Contraseñas practicante en texto plano.
- Endpoints sin auth y CORS `*`.

## 18. Dependencias para FASE 2.3
`pom.xml` añadir `spring-boot-starter-security` + `jjwt-api/impl/jackson` (o `nimbus`), `application.properties` añadir `jwt.secret` (32+ chars) y `jwt.expiration=28800000`, crear `SecurityConfig`, `JwtUtil`, `JwtFilter`, `AuthController/Service/DTO`.

## 19. Decisiones finales
1. PRACTICANTE → `Practicante.usuario` (=`documento`)
2. VIGILANTE → `vigilante.usuario`
3. RRHH → `trabajadores.Usuario` (o Email) para `IdTrabajador=87` (whitelist)
4. Dónde: `Practicante.contrasena`, `vigilante.contrasena`, `trabajadores.PasswordUser`
5. Formato: practicante plaintext, vigilante/trabajador bcrypt
6. Activo: `Practicante.situacion=ACTIVO`, `trabajadores.Estado=1 && EstadoUsuario=1`, vigilante sin estado (siempre activo hasta crear columna)
7. Rol: por origen tabla (practicante→PRACTICANTE, vigilante→VIGILANTE, trabajadores 87→RRHH)
8. Tabla roles existe (`roles` 10 filas) pero RRHH no existe como rol
9. IdRol=2 es `TRABAJADOR` sin permisos, no RRHH
10. JWT: `sub, rol, sid, iat, exp, iss`
11. Sesión: cookie `HttpOnly Secure SameSite=Lax`
12. Endpoints: ver matriz §12
13. CORS: quitar `*`, `allowCredentials=true`, `allowedOrigins localhost:3000`
14. Login frontend: eliminar `localStorage`/`role`/`router.push` mock, usar `fetch` con `credentials:"include"`
15. QR dinámico: compatible si hay JWT + `qr_secret` + validación 30s, sin confiar en ID del cliente

---
**Resumen breve:**
```
FASE 2.2: COMPLETADA (1 pendiente: confirmar rol RRHH no es IdRol sino whitelist 87)

Usuarios:
PRACTICANTE → Practicante (1 registro OFTEST04)
VIGILANTE → vigilante (0 registros, tabla vacía)
RRHH → trabajadores Id 87 KELITA (IdRol 2 = TRABAJADOR, no RRHH)

Login identifier:
PRACTICANTE → usuario (=documento)
VIGILANTE → usuario
RRHH → Usuario / Email (75257890 / kelitaharotamani@gmail.com)

Roles: por origen tabla, no por columna rol; roles tabla no tiene RRHH

Passwords: practicante plaintext, vigilante/trabajador bcrypt

Sesión propuesta: JWT en cookie HttpOnly Secure SameSite Lax 8h

JWT: sub, rol, sid, iat, exp, iss

Cookie: practiqr_token HttpOnly

Dependencias FASE 2.3: spring-security, jjwt, jwt.secret, SecurityConfig, JwtFilter, AuthController/Service
```
