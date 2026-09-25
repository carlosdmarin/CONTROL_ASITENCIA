# LOGIN AUTH SERVICE — PHASE 2.4.1

## 1. Resultado
**FASE 2.4.1: COMPLETADA**

`AuthService` implementado con 3 fuentes reales, validación de estado, compatibilidad BCrypt/legacy con migración, control de ambigüedad y manejo de errores genérico. Sin JWT/cookie/AuthController.

## 2. Fuentes consultadas
- `Practicante` (`Practicante.java:12`, `PracticanteRepository.java:14` + nuevo `findByUsuario`)
- `vigilante` (`Vigilante.java:17`, `VigilanteRepository:12` `findByUsuario`, `findByUsuarioAndEstado`)
- `trabajadores` (`Trabajador.java:13`, `TrabajadorRepository:12`)
- `application.properties:58` `practiqr.auth.rrhh-worker-ids=87`
- `Sede.java` para `sede.nombre`

## 3. Resolución de candidatos
`List<Candidate> candidates`:
- Busca en las 3 fuentes con `usuarioTrim` (trim). Practicante intenta `findByUsuario` luego fallback `findByDocumento`.
- Filtra por activo: `Practicante.situacion==ACTIVO`, `Vigilante.estado==true`, `Trabajador` con `Estado=1 && EstadoUsuario=1 && id in allowed`.
- 0 → `BusinessException("Usuario o contraseña incorrectos", 401)`
- 1 → continúa a validar contraseña
- >1 → log.warn ambiguo + misma excepción genérica (no revela fuente). No depende del orden.

## 4. Regla PRACTICANTE
- **Identificador:** `usuario` principal (`findByUsuario`), compatibilidad `documento` como fallback (mismo valor hoy `usuario==documento`).
- **Estado:** `situacion = ACTIVO` (`Practicante.java:50` enum). Solo activo entra a `candidates`.
- **Rol:** `PRACTICANTE` por origen tabla.

## 5. Regla VIGILANTE
- **Identificador:** `usuario` único (`vigilante.usuario`).
- **Credenciales:** `contrasena` VARCHAR 255 (se espera BCrypt, tabla vacía hoy).
- **Estado:** `estado = true` (`TINYINT(1)`). Falso → rechazado aunque password correcta.
- **Rol:** `VIGILANTE` siempre.

## 6. Regla RRHH
- **Identificador:** `Usuario` (valor `75257890` para id 87) con fallback `Email` si contiene `@`.
- **Credenciales:** `PasswordUser` bcrypt.
- **Estado:** `Estado=1 AND EstadoUsuario=1` y `IdTrabajador` en `practiqr.auth.rrhh-worker-ids` (parseado a `Set<Integer>`). No se usa `IdRol=2`.
- **Rol:** `RRHH` fijo, no se incluye `IdRol` en JWT.

## 7. Estados
- Practicante: `Situacion.ACTIVO` vs `INACTIVO` (fechaDesactivacion).
- Vigilante: `estado true/false` (Boolean).
- Trabajador: `Estado` y `EstadoUsuario` ambos `1`.
- Todos validados antes de contar candidato, para no revelar "inactivo" al cliente.

## 8. Contraseñas
| Fuente | Almacenado | Verificación |
|---|---|---|
| Practicante | `contrasena` plaintext = documento (ej. `70000001`, length 8) o ya migrado a bcrypt `$2a$` | `isBCrypt()` chequea `$2a$/$2b$/$2y$`. Si bcrypt → `passwordEncoder.matches(normalize)`. Si legacy → `stored.equals(raw)` y si coincide migra. |
| Vigilante | `contrasena` bcrypt (vacío hoy) | `isBCrypt` → `matches` con normalización `$2y$→$2a$` |
| Trabajador | `PasswordUser` bcrypt `$2y$10$...` (id 87) | `isBCrypt` → `matches` con normalización |

`normalizeForBcrypt`: `$2y$` → `$2a$` para que `BCryptPasswordEncoder` valide hashes de `one_db` generados con `$2y$`.

## 9. Migración legacy
Solo para `practicante` con `!isBCrypt(stored)`.
- Si `stored.equals(contrasena)` es true → `newHash = passwordEncoder.encode(contrasena)` → `p.setContrasena(newHash)` → `practicanteRepository.save(p)` dentro de `@Transactional`.
- Solo después de autenticación exitosa, nunca antes. No masiva, no log de passwords/hashes. Verificado en test `practicanteActivoLegacyCorrectoAutenticaYMigra` que `p.getContrasena()` cambia a `$2a$` y `matches` con nuevo hash.

## 10. Manejo de errores
Siempre `BusinessException("Usuario o contraseña incorrectos", 401)` genérico, sin revelar si existe usuario, si está inactivo o si es de otra fuente. Logs `warn` para ambigüedad sin passwords. Para `inactivo` no se responde "está inactivo" al cliente.

## 11. Ambigüedad entre fuentes
Si mismo `usuario` existe en 2+ fuentes activas (ej. `duplicado` en practicante y vigilante), se rechaza con mismo mensaje genérico y `log.warn("Autenticación ambigua... {} candidatos")`. No resuelve silenciosamente por orden.

## 12. DTO de autenticación
`model/dto/AuthResult.java` (`@Builder`):
```java
Long id; String nombre; String usuario; String rol; String documento; String sede; String sid; String source;
```
Ejemplo: `id=87, nombre=KELITA HARO TAMANI, usuario=75257890, rol=RRHH, documento=75257890, sede=1, sid=trabajadores:87`. No incluye `contrasena`/`hash`.

## 13. Tests
`service/AuthServiceTest.java` (13 tests, `@MockitoSettings LENIENT`):
- Practicante: activo legacy correcto → éxito+migración, incorrecto → rechazo, inactivo → rechazo, migración valida con BCrypt.
- Trabajador: autorizado 87 correcto → RRHH, password incorrecto → rechazo, Estado 0 → rechazo, EstadoUsuario 0 → rechazo, no autorizado id 99 → rechazo.
- Vigilante: activo correcto → VIGILANTE, estado false → rechazo, password incorrecto → rechazo.
- Ambigüedad: duplicado en 2 fuentes → rechazo.
No usan datos reales de `one_db`, usan `@Mock` y `BCryptPasswordEncoder` real. Verifican `verify(save)` y `matches`.

## 14. BD
**SIN CAMBIOS** durante pruebas: tests usan `@Mock` y `ReflectionTestUtils`, no `one_db`. En ejecución real, solo `Practicante.contrasena` se actualizaría al migrar (transaccional). Verificado `one_db` sigue con `Practicante` con contrasena plain y `trabajadores` intacto. `vigilante` sigue 0 registros.

## 15. Frontend
**SIN CAMBIOS**: `FRONTEND/app/login/page.tsx` sigue mock `localStorage`, no se creó `/practicante`, no se tocó QR.

## 16. Archivos modificados
```
BACKEND/src/main/java/com/asistencia/attendance_system/model/dto/AuthResult.java (NUEVO)
BACKEND/src/main/java/com/asistencia/attendance_system/service/AuthService.java (NUEVO, 231 líneas)
BACKEND/src/main/java/com/asistencia/attendance_system/repository/PracticanteRepository.java (+findByUsuario)
BACKEND/src/main/resources/application.properties (+practiqr.auth.rrhh-worker-ids=87)
BACKEND/src/test/java/com/asistencia/attendance_system/service/AuthServiceTest.java (NUEVO, 13 tests)
```

## 17. Pendientes para FASE 2.4.2
- `AuthController` con `POST /api/auth/login` que llame a `AuthService.authenticate()` y genere JWT vía `JwtService` + cookie `practiqr_token`.
- Manejar `BusinessException` a 401 JSON genérico.
- No migrar todas las contraseñas masivamente, dejar migración lazy.

