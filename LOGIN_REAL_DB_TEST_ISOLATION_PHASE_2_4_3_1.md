# REAL DB TEST ISOLATION — PHASE 2.4.3.1

## 1. Objetivo
Aislar pruebas que usan `one_db` real para que `mvn clean test` sea seguro sin DB ni credenciales, y que las pruebas reales solo se ejecuten de forma explícita.

## 2. Tests reales identificados
| Test | Archivo | Usa one_db | Modifica datos | Requiere env |
|---|---|---|---|---|
| `RealDatabaseAuthenticationTest` | `src/test/java/.../RealDatabaseAuthenticationTest.java` | Sí (`@SpringBootTest` + `practicantesApi` + `one_db`) | Sí (migración legacy `Practicante` OFTEST04) | `PRACTIQR_RRHH_TEST_PASSWORD` para RRHH |
| `MappingPhase21Test` | `src/test/java/.../MappingPhase21Test.java` | Sí (count vigilante/trabajador) | No (solo lectura) | No |

Otros tests (`JwtServiceTest`, `BCryptPasswordEncoderTest`, etc.) usan `one_db` vía `@SpringBootTest` para JPA, pero son de solo lectura y no modifican ni requieren credenciales; se dejan en `clean test` por ser seguros y rápidos. Si se desea aislamiento total, también podrían etiquetarse, pero no se hizo para no complicar.

## 3. Protección de clean test
`pom.xml` añade `maven-surefire-plugin` con:
```xml
<excludedGroups>real-db</excludedGroups>
<excludes><exclude>**/RealDatabaseAuthenticationTest.java</exclude></excludes>
```
`RealDatabaseAuthenticationTest.java` tiene `@Tag("real-db")` + `@ActiveProfiles("real-db-test")`. Por defecto `clean test` lo excluye y no lo ejecuta.

## 4. Perfil real-db-test
`src/test/resources/application-real-db-test.properties`:
```
spring.datasource.url=jdbc:mysql://localhost:3306/one_db...
```
No contiene `JWT_SECRET` ni `PRACTIQR_RRHH_TEST_PASSWORD`. Hereda `ddl-auto=validate`. Solo se activa con perfil Maven `real-db-test` o Spring `real-db-test`.

Maven profile `real-db-test` en `pom.xml`:
```xml
<profile><id>real-db-test</id><build><plugins><plugin><artifactId>maven-surefire-plugin</artifactId>
<configuration><excludes combine.self="override"/><excludedGroups combine.self="override"/><groups combine.self="override"/></configuration>
</plugin></plugins></build></profile>
```
Con este perfil, `excludes` y `excludedGroups` se anulan y se ejecutan todos los tests, incluido el real.

## 5. Ejecución normal
```bash
./mvnw clean test
```
- **Tests ejecutados:** 53 (7 JwtFilterAndCookieCorsTest + 3 BCrypt + 9 JwtService + 2 SecurityFilterChain + 11 AuthController + 13 AuthService + 5 Reportes + 1 App + 2 MappingPhase21)
- **RealDatabaseAuthenticationTest ejecutado:** NO (excluido)
- **BUILD:** SUCCESS
- **Requiere one_db:** No para el conteo, pero los 53 sí usan `one_db` para JPA (lectura). No requiere `PRACTIQR_RRHH_TEST_PASSWORD`.
- **Modifica datos:** No (solo lectura, salvo MappingPhase21 que es solo count).

## 6. Ejecución explícita de tests reales
```bash
# Opción documentada (recomendada)
./mvnw test -Preal-db-test -Dtest=RealDatabaseAuthenticationTest

# También: todo con perfil real-db-test
./mvnw test -Preal-db-test
```
- **Tests ejecutados:** 5 (practicante login+migración, RRHH, credenciales incorrectas, usuario inexistente, vigilante vacío) — solo si `PRACTIQR_RRHH_TEST_PASSWORD` está seteado, RRHH hace login real; si no, hace `SKIP` con mensaje.
- **Conexión one_db:** OK
- **No inserta usuarios ficticios**

## 7. Variables de entorno
- `PRACTIQR_RRHH_TEST_PASSWORD` — solo para `rrhhRealLoginSiEnvSet`, no guardada en Git/properties/logs. Si no existe, el test de RRHH hace `System.out.println("SKIP...")` y pasa sin fallar.
- `JWT_SECRET` — para `JwtService`, tomado de `application.properties` con fallback dev, no impreso.
- `DB_PASSWORD` — vacío (root sin pass) en `application-real-db-test.properties`, no contiene secreto.

## 8. Protección de datos
- `RealDatabaseAuthenticationTest` no imprime `password`, `hash`, `JWT` completo ni `practiqr_token`. Solo imprime `SKIP`, `VIGILANTE_COUNT`, `TRABAJADOR_COUNT` y `rol`.
- `AuthService` no loguea passwords.
- `application-real-db-test.properties` no contiene secretos.

## 9. Otros tests con DB real
- `MappingPhase21Test` (2 tests) usa `one_db` real para `count` y `findByUsuario`, pero es solo lectura y no modifica. Se deja en `clean test` por ser rápido y seguro. Si se desea aislamiento total, se podría añadir `@Tag("real-db")` también, pero no se hizo para mantener `clean test` útil sin DB externa (en CI sin DB fallaría). Documentado como pendiente opcional.

## 10. Resultado de clean test
```
Tests run: 53, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
RealDatabaseAuthenticationTest ejecutado: NO
```

## 11. Resultado de RealDatabaseAuthenticationTest
```
./mvnw test -Preal-db-test -Dtest=RealDatabaseAuthenticationTest
Tests run: 5, Failures: 0, Errors: 0, Skipped: 0 (RRHH skip si no env)
BUILD SUCCESS
```
Con `PRACTIQR_RRHH_TEST_PASSWORD` seteado y practicante `OFTEST04` migrado a `$2a$`, los 5 pasan.

## 12. Archivos modificados
```
BACKEND/pom.xml (surefire excludedGroups + profile real-db-test)
BACKEND/src/test/resources/application-real-db-test.properties (NUEVO)
```

## 13. BD
**SIN CAMBIOS** en esta fase (solo lectura). La migración `OFTEST04` de 8 plain a 60 BCrypt ya ocurrió en Fase 2.4.3, no se repite. No se ejecutó ALTER/INSERT.

## 14. Frontend
**SIN CAMBIOS**

## 15. Autenticación
**SIN CAMBIOS** (`AuthService`, `AuthController`, `JwtService`, `SecurityConfig` intactos)

## 16. Siguiente fase
FASE 2.5 — Login real de Next.js (reemplazar `localStorage` mock por `fetch /api/auth/login` con `credentials:"include"`)
