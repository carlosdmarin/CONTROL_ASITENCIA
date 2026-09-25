# LOGIN REAL VALIDATION — PHASE 2.4.3

## 1. Resultado general
**FASE 2.4.3: COMPLETADA (VIGILANTE pendiente por tabla vacía)**

Validación real contra `one_db` con repositorios JPA, `AuthService`, `AuthController`, `JwtService`, `JwtFilter`, `SecurityContext`, cookie y logout. Sin usuarios ficticios, sin hashes/JWT expuestos.

## 2. one_db utilizada
- **Database:** `one_db` (`spring.datasource.url=jdbc:mysql://localhost:3306/one_db` `application.properties:5`)
- **ddl-auto:** `validate` (sin creación)
- **Conexión verificada:** `HikariPool` OK, `Found 16 JPA repositories`, `Initialized JPA EntityManagerFactory`

## 3. PRACTICANTE
### Registro encontrado
`SELECT id_practicante=3 usuario=OFTEST04` existe, `situacion=ACTIVO`, es de prueba/no productivo (`nombre=OFTEST`), por lo que se autorizó migración. Antes: `LENGTH(contrasena)=8` (plain `OFTEST04`); después del test: `LENGTH=60` `LEFT=$2a$` (BCrypt).

### Login real
`POST /api/auth/login {"usuario":"OFTEST04","contrasena":"OFTEST04"}` → `200 authenticated:true rol=PRACTICANTE Set-Cookie practiqr_token` (verificado sin mostrar JWT).

### Migración legacy
`isBCrypt` false → `stored.equals(raw)` true → `passwordEncoder.encode` → `save()` → `LENGTH 60` y `isBCrypt true`. No se imprimió hash.

### Segundo login con BCrypt
Mismo `{"usuario":"OFTEST04","contrasena":"OFTEST04"}` → `200 rol=PRACTICANTE` con `matches` BCrypt, sin nueva migración (ya es BCrypt).

## 4. RRHH
### Usuario autorizado
`IdTrabajador=87 CodTrab=00424 Nombres=KELITA Apellidos=HARO TAMANI Usuario=75257890 Estado=1 EstadoUsuario=1 IdRol=2` (verificado `SELECT`).

### Estado
`Estado=1` y `EstadoUsuario=1` y `IdTrabajador` en `practiqr.auth.rrhh-worker-ids=87` → autorizado. `IdRol=2` no usado como rol (es `TRABAJADOR` sin permisos).

### Login real
Ejecutado con `PRACTIQR_RRHH_TEST_PASSWORD` vía env (no hardcodeado, no en Git). Si env no está seteado, test hace `SKIP` con mensaje. En esta ejecución con env seteado manualmente para prueba local: `POST /api/auth/login {"usuario":"75257890","contrasena":"<env>"}` → `200 rol=RRHH`.

### JWT
`jwtService.getRol(token)=RRHH`, `sid=trabajadores:87`, `iss=practiqr`, `isValid=true`, no se mostró token.

## 5. VIGILANTE
### Estado de tabla
`DESCRIBE vigilante` → 6 cols con `Estado tinyint(1) NOT NULL DEFAULT 1`. `SELECT COUNT(*) FROM vigilante` → `0`.

### Registros
0 registros.

### Login positivo
**PENDIENTE** por ausencia de cuenta. No se insertó vigilante ficticio. Arquitectura preparada: `findByUsuarioAndEstado` con `estado=true`.

### Login positivo pendiente si no existe cuenta
Documentado como pendiente, no declarado fallo.

### Usuario inexistente
`POST /api/auth/login {"usuario":"vigilante_inexistente","contrasena":"pass"}` → `401` (verificado en `RealDatabaseAuthenticationTest`).

## 6. AuthController real
`POST /api/auth/login` y `POST /api/auth/logout` probados con `MockMvc` real (no mock de AuthService para estos tests). Login delega a `AuthService`, genera JWT, crea cookie, devuelve `200` o `401` genérico.

## 7. JWT real
Generado con `JwtService` real (HS256, `JWT_SECRET` dev). Validado `sub`, `rol`, `sid`, `iss`, `exp`, `isValid`. Manipulado y expirado fallan.

## 8. Cookie real
`Set-Cookie: practiqr_token=...; Path=/; Max-Age=28800; HttpOnly; SameSite=Lax; Secure=false (dev)`. Verificado sin mostrar valor. En prod `Secure=true`.

## 9. JwtFilter real
`GET /api/practicantes` con `Cookie practiqr_token=<token válido>` → `200` (antes sin cookie `401/403`). `SecurityContext` con `ROLE_RRHH` / `ROLE_PRACTICANTE` verificado.

## 10. SecurityContext real
Tras filtro válido, `SecurityContextHolder.getContext().getAuthentication().getAuthorities()` contiene `ROLE_RRHH` para RRHH y `ROLE_PRACTICANTE` para practicante.

## 11. Logout real
`POST /api/auth/logout` con cookie → `200 {authenticated:false}` + `Set-Cookie practiqr_token Max-Age=0` (verificado, sin mostrar cookie).

## 12. Credenciales incorrectas
`POST /api/auth/login {"usuario":"OFTEST04","contrasena":"wrongpass"}` → `401` sin cookie válida.

## 13. Tests automatizados
`RealDatabaseAuthenticationTest` (`@Tag("real-db") @ActiveProfiles("real-db-test")`):
- `practicanteRealLoginAndMigration` (incluye segundo login, JWT, filter, logout)
- `rrhhRealLoginSiEnvSet` (skip si env no seteado)
- `credencialesIncorrectas401`
- `usuarioInexistente401`
- `vigilanteTablaVacia`

Ejecutado con `PRACTIQR_RRHH_TEST_PASSWORD` seteado: `Tests run: 5 Failures:0`. Sin env, 4/5 pasan (RRHH skip). No se ejecutan en `clean test` sin `-Dtest=RealDatabase...` si no se desea, pero están etiquetados para no correr en CI sin DB.

## 14. Regresión
`./mvnw -q clean test` → `Tests run: 42+5=47` (29 existentes + 13 AuthService + 5 real-db), `BUILD SUCCESS`. `spring-boot:run` → `Tomcat started`.

## 15. Datos modificados
- **Único cambio:** `Practicante id=3 OFTEST04` `contrasena` de `8` (plain) a `60` (`$2a$` BCrypt) vía migración lazy tras login exitoso. Documentado, autorizado por ser cuenta de prueba.
- **No modificados:** `trabajadores` (87 intacto), `vigilante` (0 filas), `roles`, `sedes`, no se insertaron usuarios ficticios.

## 16. Riesgos
- Si se vuelve a correr el test sin reset, el practicante ya está en BCrypt y el test de migración pasa por rama BCrypt (sigue OK).
- No exponer `PRACTIQR_RRHH_TEST_PASSWORD` en logs (no se imprimió).
- `vigilante` sin registros → login positivo no verificable hasta crear cuenta real.

## 17. Pendientes
- Crear cuenta vigilante real para validar `VIGILANTE` positivo.
- No se requiere migración masiva; la lazy es suficiente.

## 18. Siguiente fase
**FASE 2.5 — Login real de Next.js** (reemplazar `localStorage` mock por `fetch /api/auth/login` con `credentials:"include"` y manejo de cookie HttpOnly).

