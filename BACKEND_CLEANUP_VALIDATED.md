# BACKEND CLEANUP VALIDATED

> Validación controlada de candidatos `BACKEND_CLEANUP_AUDIT.md` — Solo análisis, 0 modificaciones, `validate` PASS.

## 1. ELIMINACIÓN SEGURA

| Elemento | Archivo | Evidencia | Consumidores | Riesgo |
|---|---|---|---|---|
| `PracticanteRepository.existsById(Long)` | `repository/PracticanteRepository.java:40` | Sobrescribe `JpaRepository.existsById` (ya provisto por `JpaRepository`); `grep -rn existsById` 0 callers en `src/main` salvo sobreescritura; Spring Data ya provee implementación | 0 | **BAJO** — borrar la línea duplica contrato base, no afecta `validate` |
| `AsistenciaDiariaRepository.findByMinutosTardanzaGreaterThan` | `repository/AsistenciaDiariaRepository.java:29` | `grep` 0 callers en `service/controller/repository/tests`; método Spring Data derivado sin uso; `AsistenciaDiaria.minutosTardanza` solo se setea, no se queryea | 0 | **BAJO** |
| `AsistenciaDiariaRepository.findByPracticante_IdPracticanteAndMinutosTardanzaGreaterThanAndFechaBetween` | `AsistenciaDiariaRepository.java:31` | 0 callers (`grep` 0), firma larga sin uso | 0 | **BAJO** |
| `PracticanteService.obtenerPorCodigo` / `findByCodigoTrabajador` alias | `service/PracticanteService.java`, `repository/PracticanteRepository.java:21` | `grep obtenerPorCodigo` solo `PracticanteController @GetMapping("/codigo/{codigo}")` que delega a `findByDocumento`; frontend usa `/documento` (grep `getByCodigo` 0 en frontend) | 0 frontend | **BAJO** — mantener alias no rompe, pero borrable |
| `AsistenciaService.obtenerResumenSemanalPorAgencia` default | `service/AsistenciaService.java:65` | `grep obtenerResumenSemanalPorAgencia` solo `AsistenciaServiceImpl:337 return List.of()` stub + controller expositor; nunca llamado por lógica real (usa `obtenerResumenSemanal`) | 0 | **BAJO** |
| `PracticanteService.contarPorAgencia` default alias | `service/PracticanteService.java:42` | `grep contarPorAgencia` 0 callers | 0 | **BAJO** |
| `ReportesServiceImpl` stub `generarJornadaSemanal` vacío | `service/impl/ReportesServiceImpl.java` (no, `AsistenciaServiceImpl:611`) | `grep generarJornadaSemanal` 1 caller `AsistenciaController:237` que solo loguea; `JornadaSemanal` 0 filas | 0 real | **BAJO** |

## 2. REVISIÓN MANUAL

| Elemento | Archivo | Motivo | Riesgo | Qué habría que confirmar |
|---|---|---|---|---|
| `JornadaSemanalRepository` métodos `findByPracticante_IdPracticante`, `findByEstadoSemanal`, `findJornadasIncompletasByPracticante`, `findBySemanaInicio`, `getPromedioHorasSemanales`, `countSemanasCompletas` | `repository/JornadaSemanalRepository.java:19-40` | 0 callers en `service/controller` hoy (`grep` 0), tabla `Jornada_Semanal` 0 filas, `ReportesServiceImpl` no los usa, `AsistenciaServiceImpl.generarJornadaSemanal` stub | **MEDIO** | Confirmar si `Jornada_Semanal` es feature futuro (no borrar si se planea reporte semanal) — verificar con producto |
| `Notificacion` + `TipoNotificacion` + Repositories | `model/entity/Notificacion.java`, `TipoNotificacion.java`, `repository/*Notificacion*` | 0 Controller, 0 Service, 0 frontend `grep Notificacion` 0 en `FRONTEND/src` salvo `tipo_notificacion` DB; tablas `Notificacion` 0 filas pero FK válidas, podría ser de otro sistema (`one_db` compartida) | **MEDIO** | Confirmar si pertenecen a PractiQR (si no, marcar `OTRO SISTEMA` y no borrar) |
| `ConfiguracionSistema` + Repository | `model/entity/ConfiguracionSistema.java`, `repository/ConfiguracionSistemaRepository.java` | 0 Controller/Service (`grep ConfiguracionSistema` 0), tabla `configuracion_sistema` 0 filas, sin `Controller`; podría ser para `TOLERANCIA_TARDANZA_MINUTOS` futuro QR | **MEDIO** | Confirmar si se usará para QR dinámico / tolerancia (si sí, `NO TOCAR`) |
| `AsistenciaDiariaRepository` `findByMinutosTardanza…` (si se confirma no uso en reports futuros) | `AsistenciaDiariaRepository.java` | Podría ser usado por futuro reporte de tardanzas | **BAJO-MEDIO** | Revisar roadmap reportes |
| `SedeController` alias `/agencias`, `/sedes` | `controller/SedeController.java:12` | `SedeController` expone `{" /api/sedes","/api/agencias", "/sedes","/agencias"}`; `grep /agencias` 0 en frontend tras FRONT-2, pero `curl /api/agencias` aún responde (alias) | **BAJO** | Confirmar 0 tráfico externo antes de quitar alias |

## 3. NO TOCAR

| Elemento | Motivo |
|---|---|
| `JornadaSemanal.java` Entity + `JornadaSemanalRepository.java` (tabla `Jornada_Semanal` vacía) | Posible arquitectura futura (reporte semanal horas). `validate` PASS, FK `id_practicante` válida. No borrar sin confirmar producto. |
| `Notificacion.java`, `TipoNotificacion.java` (+Repositories) | Tablas `Notificacion`/`TipoNotificacion` existen en `one_db` con FK válidas; podrían ser de PractiQR futuro (notificar tardanzas) o de otro sistema compartido. 0 Controller hoy no implica huérfano. |
| `ConfiguracionSistema.java` + Repository | Tabla `configuracion_sistema` vacía pero con `clave UNIQUE`; patrón clave-valor típico para `one_db` central (QR, tolerancia). No borrar. |
| `Oficina.java`, `Sede.java`, `Practicante.java` + `OficinaRepository` | Core `one_db` catálogos (13 oficinas, 10 sedes, 1 practicante con FK `id_oficina NOT NULL` validado F5) |
| `application.properties` `PhysicalNamingStrategyStandardImpl`, `zeroDateTimeBehavior`, `ddl-auto=validate`, `datasource one_db` | Necesarias para `IdSede` vs `id_sede`, `0000-00-00`, `validate` (ver `BACKEND_CLEANUP_AUDIT.md §10`) |
| `AsistenciaServiceImpl` lógica `PRESENTE/TARDANZA/AUSENTE` + `Oficina Estado` | Validada F6, no tocar |
| `HorarioServiceImpl` + `Oficina` validación `Estado/IdSede` | Validada OF-3 |
| `GlobalExceptionHandler`, `AsistenciaCierreScheduler`, `HorarioUtils` | En uso |

## 4. ALIASES LEGACY

| Endpoint/Método | Equivalente moderno | Consumidor | Recomendación |
|---|---|---|---|
| `GET /api/practicantes/codigo/{codigo}` `PracticanteController.obtenerPorCodigo` | `GET /api/practicantes/documento/{documento}` | 0 frontend (`grep codigo/{` 0, frontend usa `/documento`) | **SEGURO ELIMINAR** (mantener 1 sprint por compat externa si existe) |
| `POST /asistencias/entrada/{documento}` alias `/{codigoTrabajador}` `AsistenciaController:69` | `POST /asistencias/entrada/{documento}` | 0 (frontend usa `POST /marcar` con `documento`) | **MANTENER POR COMPATIBILIDAD** (no borra, alias barato) o **REVISAR** tráfico |
| `POST /asistencias/salida/{documento}` alias `/{codigoTrabajador}` | `POST /asistencias/salida/{documento}` | 0 | **REVISAR** idem |
| `GET /api/practicantes/contar/agencia/{id}` `PracticanteController:98` + `PracticanteService.contarPorAgencia` | `GET /api/practicantes/contar/sede/{id}` | `grep contar/agencia` 0 frontend, `countActivosByAgencia` 0 callers | **SEGURO ELIMINAR** alias, mantener `/sede` |
| `GET /api/agencias`, `/agencias`, `/sedes` (alias `SedeController:12`) | `GET /api/sedes` | Frontend ya solo `GET /sedes` tras FRONT-2, `grep /agencias` 0 | **MANTENER POR COMPATIBILIDAD** 1 sprint, luego eliminar alias `/agencias` |
| `GET /api/asistencias/reporte/semanal/agencia/{agencia}` `AsistenciaController:209` + `obtenerResumenSemanalPorAgencia(Agencia)` | `GET /api/asistencias/reporte/semanal/sede/{agencia}` (alias existe) + `Agencia` enum vs `Sede` | `grep reporte/semanal/agencia` 0 frontend, `Agencia.java` solo usado ahí | **REVISAR** — si 0 tráfico, eliminar `agencia` path y `Agencia` enum, mantener `/sede` |
| `PracticanteResponse.getAgencia()/setAgencia`, `getIdPuestoCompat()` | `getSede()/oficina` | `grep getAgencia` 0, `JsonAlias` ya cubre `agencia→sede` en deserialización | **REVISAR** — mantener `JsonAlias` lectura, borrar serializer `getAgencia` si no se serializa |
| `PracticanteRequest @JsonAlias({"idAgencia"})` `ResumenAsistenciaDTO @JsonAlias` | `idSede` | `grep idAgencia` 0 payload activo (FRONT-2 ya solo `idSede`) | **MANTENER POR COMPATIBILIDAD** lectura, no borra |
| `Sede.getIdAgencia()/setIdAgencia` | `getIdSede/setIdSede` | `grep getIdAgencia` 0 | **REVISAR** — mantener si frontend viejo lo serializa, sino eliminar |

## 5. ELEMENTOS FUTUROS

| Elemento | Por qué futuro |
|---|---|
| `JornadaSemanal` (Entity + Repository + `Jornada_Semanal` 0 filas) | Reporte semanal `horas_requeridas/cumplidas/pendientes` + `estado_semanal` — F3 clasificó `REQUIRES TRANSFORMATION` para horas, ahora `validate` PASS con `precision=5,scale=2`. Probable feature reporte semanal no usado hoy (0 filas) |
| `Notificacion` + `TipoNotificacion` | Tablas con `id_practicante` FK válida, `mensaje TEXT`, `leido BIT` — típico para notificar tardanzas/faltas. `grep Notificacion` 0 hoy, pero podría ser PractiQR futuro (FRONT-1 reportó 0). |
| `ConfiguracionSistema` (`clave UNIQUE`) | Clave-valor `TOLERANCIA_TARDANZA_MINUTOS=5` ya insertada en dump (Configuracion_Sistema). F4 no lo usa, pero futuro QR dinámico / tolerancia 07:30-07:31 podría leerlo (no tocar). |

## 6. PLAN DE LIMPIEZA

### FASE CLEAN-1 (BAJO RIESGO, evidencia fuerte, 0 consumidores)
1. `PracticanteRepository.existsById` (duplicado `JpaRepository`)
2. `AsistenciaDiariaRepository.findByMinutosTardanzaGreaterThan` + `findByPracticante_IdPracticanteAndMinutosTardanza...` (0 callers)
3. `PracticanteService.obtenerPorCodigo` + `PracticanteController GET /codigo/{codigo}` + `PracticanteRepository.findByCodigoTrabajador` alias (0 frontend)
4. `PracticanteService.contarPorAgencia` alias
5. `AsistenciaService.obtenerResumenSemanalPorAgencia` stub + `AsistenciaController GET /reporte/semanal/agencia/{agencia}` alias (mantener `/sede`)
6. `model/enums/Agencia.java` si se elimina punto 5 (verificar `Agencia` no usada en otro contexto `one_db` — `sedes.Sede` tiene `Abrev` no `Agencia`)
7. `model/enums/Cargo.java` duplicado de `model/entity/Cargo.java` (0 imports)
8. `model/enums/TipoInstituto.java` duplicado de `model/entity/TipoInstituto.java`

### FASE CLEAN-2 (REVISIÓN MANUAL)
1. Confirmar tráfico real de `POST /asistencias/entrada/{codigoTrabajador}` alias y `SedeController /agencias` alias (logs) antes de borrar; si 0 en 1 sprint → borrar alias, mantener canónico
2. `ResumenAsistenciaDTO` alias `agencia/codigoTrabajador` (si backend ya no serializa, borrar getter `getAgencia`)
3. `Notificacion/ConfiguracionSistema/JornadaSemanal` — confirmar con producto si son PractiQR futuro u otro sistema `one_db`; si otro sistema → documentar `NO TOCAR`, si PractiQR futuro → `NO TOCAR`
4. `AsistenciaService.generarJornadaSemanal` stub (si no hay plan `Jornada_Semanal`, borrar)

### NO TOCAR
- `Oficina`, `Sede`, `Practicante`, `Cargo`, `TipoInstituto`, `BloqueHorario`, `AsistenciaDiaria`, `Marcacion`, `Justificacion`, `ConfiguracionSistema` (posible futuro), `Notificacion`/`JornadaSemanal` (futuro), `PhysicalNamingStrategy`, `zeroDateTimeBehavior`, `validate`, `OficinaRepository`, `PracticanteService` validación `Estado/IdSede`
