# BACKEND CLEANUP CLEAN1

> Limpieza controlada 2026-09-21. Solo código muerto con evidencia 0 consumidores, 0 impacto en `validate`, `one_db` intacto.

## Eliminado

| Elemento | Archivo | Por qué | Evidencia |
|---|---|---|---|
| `model/enums/Cargo.java` | `backend/model/enums/Cargo.java` (enum duplicado) | Duplicado de `model/entity/Cargo.java` (Entity usada), 0 imports productivos (`grep import.*model.enums.Cargo` 0), `grep model.enums.Cargo` 0, no Jackson, no Spring, no config, no tests | BAJO — borrar no afecta Entity `Cargo` |
| `model/enums/TipoInstituto.java` | `backend/model/enums/TipoInstituto.java` | Duplicado de `model/entity/TipoInstituto.java`, 0 imports (`grep model.enums.TipoInstituto` 0) | BAJO |
| `PracticanteRepository.existsById(Long)` | `repository/PracticanteRepository.java:40` | Override manual de `JpaRepository.existsById(ID)` ya provisto; `grep existsById` 0 callers en `src/main` | BAJO — `JpaRepository` lo provee |
| `PracticanteRepository.findByCodigoTrabajador(String)` default | `repository/PracticanteRepository.java:20` | Alias QR antiguo `codigoTrabajador→documento`; `grep findByCodigoTrabajador` 0 callers (Service usa `findByDocumento` directo), `grep codigoTrabajador` en BACKEND solo definición, frontend ya no envía `codigoTrabajador` (FRONT-2) | BAJO — alias muerto |
| `AsistenciaDiariaRepository.findByMinutosTardanzaGreaterThan` | `repository/AsistenciaDiariaRepository.java:29` | `grep findByMinutosTardanzaGreaterThan` 0 callers, `grep MinutosTardanza` solo `setMinutosTardanza` (write), no query | BAJO |
| `AsistenciaDiariaRepository.findByPracticante_IdPracticanteAndMinutosTardanzaGreaterThanAndFechaBetween` | `repository/AsistenciaDiariaRepository.java:31` | 0 callers (`grep` 0) | BAJO |

## Conservado

| Elemento | Archivo | Motivo |
|---|---|---|
| `PracticanteService.obtenerPorCodigo` + `PracticanteController @GetMapping("/codigo/{codigo}")` | `service/PracticanteService.java:23`, `controller/PracticanteController.java:68` | API legacy documentada como `LEGACY / COMPATIBILIDAD` (no borrar hasta confirmar 0 tráfico externo). Usa `findByDocumento`, no depende del alias borrado. |
| `PracticanteService.contarPorAgencia` + `AsistenciaService.obtenerResumenSemanalPorAgencia` + `AsistenciaController @GetMapping("/reporte/semanal/agencia/{agencia}")` | `service/*`, `controller/AsistenciaController:209` | Alias `agencia` → `sede` (SedeController alias `/agencias`). `grep contarPorAgencia` 0 frontend, pero endpoint aún responde (alias). Conservar 1 sprint por compat externa. |
| `SedeController` aliases `/agencias`, `/sedes` | `controller/SedeController.java:12` | Frontend ya solo `GET /sedes`, pero alias barato, no romper. |
| `AsistenciaController` alias `/{codigoTrabajador}` en `/entrada/{documento}` | `controller/AsistenciaController.java:69` | `grep codigoTrabajador` 0 frontend tras FRONT-2 (`lib/api/practicantes.ts` ya borra `codigoTrabajador`), pero alias no molesta, mantener. |
| `ResumenAsistenciaDTO` alias `agencia`/`codigoTrabajador` (`@JsonAlias`) | `model/dto/ResumenAsistenciaDTO.java:30` | `grep agencia` 0 payload activo, pero `JsonAlias` permite lectura de viejos clientes sin costo. Conservar. |
| `Sede.getIdAgencia()/setIdAgencia` | `model/entity/Sede.java:22` | Alias `getIdAgencia` para `idSede`, 0 callers (`grep getIdAgencia` 0), pero es getter alias sin riesgo, conservar por compat. |

## Legacy (mantenido temporalmente)

| Endpoint/Método | Equivalente moderno | Estado |
|---|---|---|
| `GET /api/practicantes/codigo/{codigo}` | `GET /api/practicantes/documento/{documento}` | LEGACY — mantener |
| `POST /asistencias/entrada/{codigoTrabajador}` alias | `POST /asistencias/entrada/{documento}` | LEGACY — mantener |
| `POST /asistencias/salida/{codigoTrabajador}` alias | `POST /asistencias/salida/{documento}` | LEGACY — mantener |
| `GET /api/practicantes/contar/agencia/{id}` | `GET /api/practicantes/contar/sede/{id}` | LEGACY — mantener |
| `GET /api/asistencias/reporte/semanal/agencia/{agencia}` | `GET /api/asistencias/reporte/semanal/sede/{agencia}` (alias existe) | LEGACY — mantener |
| `GET /api/agencias`, `/agencias`, `/sedes` alias | `GET /api/sedes` | LEGACY — mantener |
| `Sede.getIdAgencia` | `getIdSede` | LEGACY — mantener |

## Futuro (no borrar)

| Elemento | Archivo | Motivo |
|---|---|---|
| `JornadaSemanal` Entity + `JornadaSemanalRepository` (7 métodos) | `model/entity/JornadaSemanal.java`, `repository/JornadaSemanalRepository.java` | Tabla `Jornada_Semanal` 0 filas, `ReportesServiceImpl.generarJornadaSemanal` stub vacío, pero es arquitectura futura para reporte semanal horas. `validate` PASS, FK válida. **NO TOCAR** |
| `Notificacion` + `TipoNotificacion` Entity/Repository | `model/entity/Notificacion.java`, `TipoNotificacion.java` | Tablas `Notificacion`/`TipoNotificacion` 0 filas, 0 Controller hoy, pero FK válidas (`one_db` compartida), posible PractiQR notificaciones. **NO TOCAR** |
| `ConfiguracionSistema` | `model/entity/ConfiguracionSistema.java` | Tabla `configuracion_sistema` 0 filas, `clave UNIQUE`, patrón clave-valor para `TOLERANCIA_TARDANZA_MINUTOS` futuro QR. **NO TOCAR** |
| `AsistenciaDiariaRepository` alias `getResumenAsistenciasPorAgencia` | `repository/AsistenciaDiariaRepository.java:51` | Alias de `getResumenAsistenciasPorSede` (id_sede), 0 costo, mantener. |

## Verificación

```
mvn clean test: PASS — Tests run: 6, Failures: 0, Errors: 0, Skipped: 0 (AttendanceSystemApplicationTests 1 + ReportesServiceC1C2Test 5)
mvn clean compile: PASS — Compiling 92 source files (antes 94, -2 enums), BUILD SUCCESS
grep -r "Area|Puesto" BACKEND/src (excl. docsig_* central) → 0 (Area ya eliminado OF-5)
grep -r "model.enums.Cargo|model.enums.TipoInstituto" → 0
grep -r "findByCodigoTrabajador|existsById" → 0 (solo JpaRepository nativo)
```

## Archivos modificados

```
M BACKEND/src/main/java/com/asistencia/attendance_system/repository/PracticanteRepository.java (2 métodos borrados)
M BACKEND/src/main/java/com/asistencia/attendance_system/repository/AsistenciaDiariaRepository.java (2 métodos borrados)
D BACKEND/src/main/java/com/asistencia/attendance_system/model/enums/Cargo.java (39 líneas)
D BACKEND/src/main/java/com/asistencia/attendance_system/model/enums/TipoInstituto.java (6 líneas)
```

## Archivos conservados intencionalmente (no modificados)

```
JornadaSemanal.java / Repository, Notificacion.java / TipoNotificacion.java / Repositories, ConfiguracionSistema.java / Repository,
SedeController alias /agencias, AsistenciaController alias /codigoTrabajador, PracticanteService alias contarPorAgencia/obtenerPorCodigo,
ResumenAsistenciaDTO alias agencia/codigoTrabajador, Sede.getIdAgencia
```

## Resumen git diff

```
5 files changed, 1 insertion(+), 57 deletions(-)
- 2 enums borrados, 4 métodos repository borrados, 1 alias borrado, 0 lógica de negocio cambiada
- validate PASS, one_db intacto (0 ALTER/DROP), oficinas read-only intacta
```
