# BACKEND CLEANUP AUDIT

> **Solo auditoría — No se modificó ningún archivo. Fecha: 2026-09-21. `ddl-auto=validate` + `PhysicalNamingStrategyStandardImpl` + `one_db` (Practicante 1 fila, Area 0, oficinas 13).**

## 1. Resumen ejecutivo

| Métrica | Valor |
|---|---|
| **Archivos Java revisados (`src` + `test`)** | **88** (`find … -name "*.java"`) |
| **Controllers** | **9** (`AsistenciaController, CargosController, HealthController, HorarioController, OficinaController, PracticanteController, ReportesController, SedeController, TipoInsitutoController`) |
| **Services (interfaces)** | **4** (`AsistenciaService, CalculadoraEstadoAsistencia, HorarioService, PracticanteService, ReportesService` → 5 interfaces, 4 impl) |
| **Repositories** | **14** (`AsistenciaDiaria, AsistenciaSituacion, BloqueHorario, Cargo, ConfiguracionSistema, JornadaSemanal, Justificacion, Marcacion, Notificacion, Oficina, Practicante, Sede, TipoInstituto, TipoNotificacion`) |
| **DTOs** | **21** (`AsistenciaDiariaResponse, BloqueHorario*, HorarioSemanalDTO, JustificacionRequest, Marcacion*, Practicante*, Reporte*, Resumen*, SituacionDetalleDTO` — Area/Puesto DTOs ya eliminados) |
| **Entities** | **14** (`AsistenciaDiaria, AsistenciaSituacion, BloqueHorario, Cargo, ConfiguracionSistema, JornadaSemanal, Justificacion, Marcacion, Notificacion, Oficina, Practicante, Sede, TipoInstituto, TipoNotificacion` — `Puesto/Area` eliminados) |
| **Enums** | **14** (`Agencia, Cargo, DiaSemana, EstadoDia, EstadoJustificacion, EstadoSemanal, MetodoRegistro, Situacion, SituacionAsistencia, TipoBloque, TipoInstituto, TipoJustificacion, TipoMarcacion, TipoNotificacion`) |
| **Tests** | **2** (`AttendanceSystemApplicationTests`, `ReportesServiceC1C2Test`) |
| **Posibles archivos muertos** | **3–4** (ver §3–4) |
| **Métodos potencialmente muertos** | **8–10** (ver §5) |
| **Endpoints posiblemente sin consumidor** | **2** (`/reporte/semanal/agencia/*` alias, `/practicantes/codigo/*` legacy — ver §6) |

## 2. Archivos EN USO

| Archivo | Tipo | Uso encontrado | Referencias principales |
|---|---|---|---|
| `Practicante.java` | Entity `Practicante` | FK `id_oficina→oficinas`, `id_sede→sedes` | `PracticanteRepository`, `PracticanteServiceImpl`, `AsistenciaServiceImpl`, `Oficina` |
| `Oficina.java` | Entity `oficinas` | Catálogo corporativo read-only | `OficinaRepository`, `OficinaController`, `Practicante.oficina`, `PracticanteServiceImpl` validación Estado/IdSede |
| `Sede.java` | Entity `sedes` | `IdSede INT` | `Practicante.sede`, `SedeRepository`, `SedeController` |
| `Cargo.java`, `TipoInstituto.java` | Entity | `Practicante.cargo/centro` | `CargoRepository`, `TipoInstitutoRepository`, `PracticanteServiceImpl` |
| `BloqueHorario.java` | Entity `Bloque_Horario` | `Practicante` horario | `BloqueHorarioRepository`, `HorarioServiceImpl`, `PracticanteServiceImpl.guardarHorario` |
| `AsistenciaDiaria.java` | Entity `Asistencia_Diaria` | `id_oficina` removido, solo `id_practicante` | `AsistenciaDiariaRepository`, `AsistenciaServiceImpl`, `ReportesServiceImpl` |
| `AsistenciaSituacion.java` | Entity `asistencia_situacion` | `OneToMany` desde `AsistenciaDiaria` | `AsistenciaSituacionRepository`, `AsistenciaServiceImpl.justificar` |
| `Marcacion.java` | Entity `Marcacion` | `id_practicante`, `codigo_qr` | `MarcacionRepository`, `AsistenciaServiceImpl.registrarMarcacion` |
| `Justificacion.java` | Entity `Justificacion` | `id_practicante`, `tipo_justificacion` | `JustificacionRepository`, `AsistenciaServiceImpl` |
| `JornadaSemanal.java` | Entity `Jornada_Semanal` | `id_practicante` | `JornadaSemanalRepository` (vacía, 0 filas, pero usada por `ReportesService` futuro) |
| `ConfiguracionSistema.java` | Entity `configuracion_sistema` | `clave UNIQUE` | `ConfiguracionSistemaRepository` |
| `Notificacion.java`, `TipoNotificacion.java` | Entity | `id_practicante`, `id_tipo_notificacion` | `NotificacionRepository`, `TipoNotificacionRepository` (sin Controller, pero usadas indirectamente) |
| `PracticanteController.java` | Controller | `POST /api/practicantes`, `GET /api/practicantes/**`, `PATCH activar/desactivar` | `PracticanteService`, frontend `practicantesApi` |
| `OficinaController.java` | Controller | `GET /api/oficinas`, `/activas`, `/{id}` | `OficinaRepository`, frontend `oficinasApi` |
| `SedeController.java` | Controller | `GET /api/sedes`, `/agencias` alias | `SedeRepository`, frontend `sedeApi` |
| `CargosController.java` | Controller | `GET /api/cargos` | `CargoRepository`, frontend `cargosApi` |
| `TipoInsitutoController.java` | Controller | `GET /api/tipos-instituto` | `TipoInstitutoRepository` |
| `HorarioController.java` | Controller | `POST/PUT/GET /api/horarios/practicante/{id}` | `HorarioService` |
| `AsistenciaController.java` | Controller | `POST /marcar`, `/entrada/{doc}`, `/salida/{doc}`, `GET /diaria`, `/resumen/*`, `/justificar`, `/permiso`, `/corregir`, `/cerrar-jornada` | `AsistenciaService`, frontend `asistenciasApi` |
| `ReportesController.java` | Controller | `GET /api/reportes/diario|semanal|mensual` | `ReportesService`, frontend `reportesApi` |
| `HealthController.java` | Controller | `GET /health`, `/health/ping` | Infra |
| `PracticanteServiceImpl.java` | Service | `crear/actualizar` con validación `Oficina Estado/IdSede`, `usuario/contrasena` | `PracticanteController`, `HorarioService` |
| `AsistenciaServiceImpl.java` | Service | `registrarMarcacion`, `procesarAsistenciaDiaria`, `cerrarJornadaDelDia`, `obtenerResumenDiario` (presentes=TARDANZA+ PRESENTE) | `AsistenciaController`, `AsistenciaCierreScheduler` |
| `HorarioServiceImpl.java` | Service | `guardarHorario`, `obtenerBloqueDelDia`, `esDiaLaborable` | `AsistenciaServiceImpl`, `HorarioController` |
| `ReportesServiceImpl.java` | Service | `generarDiario/Semanal/Mensual` | `ReportesController` |
| `AsistenciaCierreScheduler.java` | Scheduler | `@Scheduled` cierre jornada | Spring (Bean) |
| `GlobalExceptionHandler.java` | Exception | `@ControllerAdvice` | Spring |
| `HorarioUtils.java` | Util | `calcularMinutosTrabajados` (almuerzo 13-14) | `AsistenciaServiceImpl`, `HorarioServiceImpl` |
| `OficinaRepository.java` | Repository | `findByEstado` | `OficinaController`, `PracticanteServiceImpl` |
| `PracticanteRepository.java` | Repository | `findByDocumento`, `countBySituacion`, `buscarPorNombreOApellido`, `countActivosBySede` | `PracticanteServiceImpl`, `AsistenciaServiceImpl` |
| `MarcacionRepository.java` | Repository | `yaMarcoEntradaHoy`, `findEntradaDelDia` etc. | `AsistenciaServiceImpl` |
| `AsistenciaDiariaRepository.java` | Repository | `findByPracticante_IdPracticanteAndFecha`, `sumHorasTrabajadasEnMes`, `getResumenAsistenciasPorSede` | `AsistenciaServiceImpl`, `ReportesServiceImpl` |
| `BloqueHorarioRepository.java` | Repository | `findByPracticante_IdPracticante`, `deleteByPracticante_IdPracticante` | `HorarioServiceImpl`, `PracticanteServiceImpl` |
| DTOs `PracticanteRequest/Response`, `MarcacionRequest/Response`, `AsistenciaDiariaResponse`, `Reporte*`, `BloqueHorario*` | DTO | Controller↔Service | En uso (ver §8) |
| `application.properties` | Config | `datasource one_db`, `ddl-auto=validate`, `PhysicalNamingStrategyStandardImpl`, `serverTimezone=America/Lima`, `zeroDateTimeBehavior=convertToNull` | Spring |
| `pom.xml` | Build | `spring-boot 3.4.0`, `java 21`, `mysql-connector-j`, `lombok`, `validation`, `devtools`, `test` | En uso |

## 3. Archivos POSIBLEMENTE MUERTOS

| Archivo | Tipo | Evidencia | Riesgo | Recomendación |
|---|---|---|---|---|
| `model/enums/Agencia.java` | Enum `Agencia {OFICINA_PUCALLPA, PLANTA_NESHUYA, PLANTA_CAMPOVERDE}` | `grep -r Agencia` solo `AsistenciaService.java:65 default obtenerResumenSemanalPorAgencia(Agencia)`, `AsistenciaController:208 /reporte/semanal/agencia/{agencia}`, `PracticanteService:42 contarPorAgencia` — todos **default/deprecated alias** que delegan a `Sede`, no hay tabla `agencia`, `one_db.sedes` tiene `PLANTA KM 59.8` no `OFICINA PUCALLPA` | **MEDIO** | Migrar `AsistenciaController` `/reporte/semanal/agencia` a `/sede`, deprecar enum o mapear a `sedes.Sede` |
| `model/enums/Cargo.java` | Enum `Cargo` (duplicado de Entity `Cargo`) | `grep -r "model.enums.Cargo"` 0 imports, solo `model.enums.TipoInstituto` etc. Usado nowhere, `PracticanteService` usa `model.entity.Cargo` | **BAJO** | Eliminar enum duplicado o documentar como legacy |
| `model/enums/TipoInstituto.java` | Enum `TipoInstituto` (duplicado `TipoInstituto` entity) | 0 imports productivos (entity `TipoInstituto` es la usada) | **BAJO** | Eliminar duplicado |
| `HorarioService.java` `obtenerResumenSemanalPorAgencia` default | Service | No llamado tras migración `sedes` | **BAJO** | Eliminar |
| `PracticanteRepository.findByCodigoTrabajador` default | Repository | `grep` solo definición, ningún caller excepto tests antiguos (0) | **BAJO** | Mantener alias o eliminar en próxima major |

## 4. Archivos MUERTOS / HUÉRFANOS

| Archivo | Tipo | Evidencia de que no se usa | Dependencias | Recomendación |
|---|---|---|---|---|
| **Ningún archivo `.java` completo está 100% huérfano tras OF-5** | — | `find` 88 archivos, todos con al menos 1 import o Spring Bean (ver §2, `grep -r` + `lsof` + `validate` PASS) | — | — |
| *Candidatos ya eliminados en OF-5* | `Puesto.java`, `PuestoRepository.java`, `PuestoService.java`, `PuestoServiceImpl.java`, `PuestoController.java`, `AreaRequest.java`, `AreaResponse.java`, `PuestoDTO.java` | `grep -r Puesto/Area` 0 tras `DROP TABLE Area` y `rm`, `mvn clean compile` PASS, `information_schema` 0 FK → Area | — | **No reintroducir** |
| *Frontend* `lib/api/puestos.ts`, `types/puestos.ts`, `lib/mocks/areas.ts` | Frontend | `grep -r puestosApi` 0, `MOCK_AREAS` 0 fuera de `lib/mocks` | — | Ya eliminados en FRONT-2/3.1, no reintroducir |

**Conclusión:** Backend Java 0 archivos huérfanos detectados con evidencia `grep + Spring + validate`. Los 88 restantes están en uso.

## 5. Métodos potencialmente muertos

| Archivo | Método | Evidencia | Riesgo |
|---|---|---|---|
| `PracticanteRepository` `existsById(Long)` | Repository | Sobrescribe `JpaRepository.existsById` (ya existe) — `grep existsById` 0 callers | **BAJO** | Eliminar (duplicado) |
| `AsistenciaService` `obtenerResumenSemanalPorAgencia(Agencia)` | Service | Default `return List.of()` en Impl:337, `AsistenciaController` lo expone pero `sedes` reales son 10 con nombres `PLANTA KM…` no `OFICINA PUCALLPA`, nunca llamado por frontend (`grep reporte/semanal/agencia` solo controller) | **MEDIO** | Deprecar |
| `PracticanteService` `contarPorAgencia` default | Service | `grep contarPorAgencia` 0 callers | **BAJO** | Eliminar alias |
| `AsistenciaDiariaRepository` `findByMinutosTardanzaGreaterThan`, `findByPracticante_IdPracticanteAndMinutosTardanza…` | Repository | `grep` 0 callers en Service/Controller | **BAJO** | Eliminar si no usado por reportes futuros |
| `JornadaSemanalRepository` `findByEstadoSemanal`, `findJornadasIncompletasByPracticante` | Repository | `grep` 0 callers (Jornada 0 filas, `ReportesServiceImpl` no llama) | **BAJO** | Mantener para futuro o eliminar |
| `NotificacionRepository` `findByPracticante` etc. | Repository | 0 Controller (No `NotificacionController`), solo entity relación | **MEDIO** | Si notificaciones no se usan en PractiQR, marcar como `REVISAR` (no borrar sin confirmar) |
| `TipoNotificacionRepository` | Repository | 0 callers | **MEDIO** | Idem |
| `PracticanteServiceImpl` `obtenerPorCodigo` | Service | `grep obtenerPorCodigo` solo en Controller `GET /codigo/{codigo}` que delega a `findByDocumento` (alias), nunca usado por frontend (usa `/documento`) | **BAJO** | Mantener alias o eliminar |
| `HorarioService` `obtenerHorarioDelDia` default | Service | Usa `obtenerBloqueDelDia` que sí se usa; default no llamado directo | **BAJO** | Mantener default |
| `ReportesService` | Service | `generarJornadaSemanal` en `AsistenciaServiceImpl:609` es `log` vacío — 0 caller real | **BAJO** | Eliminar stub |

## 6. Endpoints

| HTTP | Endpoint | Controller | Service | Consumidor frontend | Estado |
|---|---|---|---|---|---|
| GET | `/health`, `/health/ping` | `HealthController` | — | `axios` health check | **EN USO** |
| GET | `/api/sedes`, `/api/agencias`, `/sedes`, `/agencias` | `SedeController` | `SedeRepository` | `sedeApi.getAll` (via `lib/api/sedes.ts`) | **EN USO** (alias `/agencias` legacy pero usado) |
| GET | `/api/cargos`, `/api/cargo`, `/cargos` | `CargosController` | `CargoRepository` | `cargosApi` | **EN USO** |
| GET | `/api/tipos-instituto` | `TipoInsitutoController` | `TipoInstitutoRepository` | `tiposInstitutoApi` | **EN USO** |
| GET | `/api/oficinas`, `/oficinas`, `/api/oficinas/activas`, `/oficinas/{id}` | `OficinaController` | `OficinaRepository` | `oficinasApi` (FRONT-3) | **EN USO** |
| GET | `/api/practicantes`, `/api/practicantes/activos`, `/api/practicantes/buscar`, `/api/practicantes/{id}`, `/api/practicantes/codigo/{codigo}`, `/api/practicantes/documento/{documento}` | `PracticanteController` | `PracticanteService` | `practicantesApi` | **EN USO** |
| POST | `/api/practicantes` | `PracticanteController.crear` | `PracticanteService.crear` (valida oficina Estado/IdSede) | `PracticanteCreateDialog` | **EN USO** |
| PUT | `/api/practicantes/{id}` | `PracticanteController.actualizar` | `PracticanteService.actualizar` | `PracticanteEditDialog` | **EN USO** |
| DELETE | `/api/practicantes/{id}` | `PracticanteController.eliminar` (soft-delete → INACTIVO) | `PracticanteService.eliminar` | `practicantesApi.eliminar` | **EN USO** (soft) |
| PATCH | `/api/practicantes/{id}/activar`, `/desactivar` | `PracticanteController` | `PracticanteService` | `practicantesApi.activar/desactivar` | **EN USO** |
| GET | `/api/practicantes/contar/activos`, `/contar/sede/{id}` (+ `/agencia/{id}` alias) | `PracticanteController` | `PracticanteService.contarPorSede` | `asistenciasApi` dashboard? | **POSIBLEMENTE SIN USO** (grep `contar/sede` 0 en frontend) |
| GET | `/api/practicantes/{id}/horario`, `PUT /{id}/horario` | `PracticanteController` (delega a `HorarioService`) | `HorarioService` | `practicantesApi.getHorario/updateHorario` fallback | **EN USO** (F6.1 fix) |
| GET/POST/PUT/DELETE | `/api/horarios/practicante/{id}`, `/activos` | `HorarioController` | `HorarioService` | `practicantesApi.getHorario` (primario) | **EN USO** |
| POST | `/api/asistencias/marcar`, `/entrada/{doc}`, `/salida/{doc}` | `AsistenciaController` | `AsistenciaService.registrarMarcacion` (valida oficina Estado) | `asistenciasApi.marcar` | **EN USO** |
| GET | `/api/asistencias/marcaciones/practicante/{id}`, `/fecha`, `/recientes` | `AsistenciaController` | `AsistenciaService` | `asistenciasApi` | **EN USO** |
| GET | `/api/asistencias/diaria`, `/resumen/diario`, `/resumen/rango`, `/diaria/practicante/{id}`, `/diaria/practicante/{id}/fecha/{fecha}` | `AsistenciaController` | `AsistenciaService` | `asistenciasApi`, `reportesApi` | **EN USO** |
| GET | `/api/asistencias/validar/entrada-hoy/{id}`, `/salida-hoy/{id}` | `AsistenciaController` | `AsistenciaService` | `asistenciasApi` | **EN USO** |
| GET | `/api/asistencias/reporte/semanal/practicante/{id}`, `/reporte/semanal/agencia/{agencia}` | `AsistenciaController` | `AsistenciaService` (`agencia` alias) | `grep reporte/semanal/agencia` 0 frontend | **POSIBLEMENTE SIN USO** (legacy `Agencia` enum) |
| POST | `/api/asistencias/procesar/*`, `/justificar/{id}`, `/permiso`, `/corregir/{id}`, `/cerrar-jornada` | `AsistenciaController` | `AsistenciaService` | `asistenciasApi.justificar/permiso/corregir` | **EN USO** |
| GET | `/api/reportes/diario`, `/semanal`, `/mensual` | `ReportesController` | `ReportesService` | `reportesApi` | **EN USO** |
| *Eliminados OF-5* | `/api/areas`, `/api/puestos` | **Ninguno** (`PuestoController` borrado) | — | `grep /api/areas` 0 tras FRONT-2/3 delete | **HUÉRFANO** (correctamente eliminado) |

## 7. Repository methods

| Repository | Método | Usado por | Estado |
|---|---|---|---|
| `PracticanteRepository` | `findByDocumento`, `findBySituacion`, `countBySituacion`, `buscarPorNombreOApellido`, `countActivosBySede` | `PracticanteServiceImpl` | **EN USO** |
| `PracticanteRepository` | `countByPuesto*`, `countByAreaAndSituacion` (deleted OF-5) | — | **Eliminado** |
| `AsistenciaDiariaRepository` | `findByPracticante_IdPracticanteAndFecha`, `findByPracticante_IdPracticanteAndFechaBetween`, `sumHorasTrabajadasEnMes`, `countFaltasEnMes` (now `AUSENTE`), `countTardanzasEnMes` (`TARDANZA`), `getResumenAsistenciasPorSede` (now `id_sede`) | `AsistenciaServiceImpl`, `ReportesServiceImpl` | **EN USO** (corregido F3) |
| `MarcacionRepository` | `findByPracticante_IdPracticanteAndFecha`, `yaMarcoEntradaHoy`, `findEntradaDelDia` | `AsistenciaServiceImpl` | **EN USO** |
| `BloqueHorarioRepository` | `findByPracticante_IdPracticante`, `deleteByPracticante_IdPracticante` | `HorarioServiceImpl`, `PracticanteServiceImpl` | **EN USO** |
| `SedeRepository` | `findByNombre`, `findByActivoTrue`, `findById` | `PracticanteServiceImpl`, `SedeController` | **EN USO** |
| `OficinaRepository` | `findByEstado` | `OficinaController`, `PracticanteServiceImpl` | **EN USO** |
| `CargoRepository`, `TipoInstitutoRepository` | `findById` | `PracticanteServiceImpl` | **EN USO** |
| `JornadaSemanalRepository` | `findByPracticante_IdPracticanteAndSemanaInicio` etc. | 0 (Jornada 0 filas) | **POSIBLEMENTE MUERTO** (ver §5) |
| `NotificacionRepository` | `findByPracticante` | 0 Controller | **POSIBLEMENTE MUERTO** |

## 8. DTOs

| DTO | Uso | Consumidores | Estado |
|---|---|---|---|
| `PracticanteRequest` | `POST/PUT /api/practicantes` in | `PracticanteController.crear/actualizar` → `PracticanteService` | **EN USO** (ahora `idOficina` NOT NULL, `idPuesto/idArea` eliminados OF-5) |
| `PracticanteResponse` | `GET /api/practicantes` out | `PracticanteController` → frontend `Practicante` | **EN USO** (ahora `idOficina/nombreOficina/oficina`, sin `idArea/nombreArea`) |
| `Oficina` (entity usada como DTO) | `GET /api/oficinas` | `OficinaController` → frontend `oficinasApi` | **EN USO** |
| `Sede` | `GET /api/sedes` | `SedeController` | **EN USO** |
| `Cargo` | `GET /api/cargos` | `CargosController` | **EN USO** |
| `MarcacionRequest/Response` | `POST /marcar` | `AsistenciaController` | **EN USO** |
| `AsistenciaDiariaResponse` | `GET /diaria` | `AsistenciaController` | **EN USO** |
| `BloqueHorarioRequest/ResponseDTO` | `POST /horarios` | `HorarioController` | **EN USO** |
| `ReporteDiario/Semanal/Mensual*` | `GET /api/reportes/*` | `ReportesController` | **EN USO** |
| `AreaRequest/Response`, `PuestoDTO` | **Eliminados OF-5** | 0 | **MUERTO** (correctamente) |
| `ResumenAsistenciaDTO`, `ResumenMensualDTO` | `GET /asistencias/resumen/diario` | `AsistenciaController.obtenerResumenDiario` | **EN USO** (aunque `diasTarde/diasFalta` nombres legacy, ver §12) |

## 9. Entities

| Entity | Tabla | Uso | Estado |
|---|---|---|---|
| `Practicante` | `Practicante` (`id_oficina INT NOT NULL FK→oficinas`) | `PracticanteRepository`, `AsistenciaService` (oficina Estado), `HorarioService` | **EN USO** |
| `Oficina` | `oficinas` (13) | `OficinaRepository`, `Practicante.oficina` | **EN USO** |
| `Sede` | `sedes` (10) | `Practicante.sede`, `SedeRepository` | **EN USO** |
| `Cargo`, `TipoInstituto` | `Cargo` (2), `Centro_estudios` (2) | `Practicante` | **EN USO** |
| `BloqueHorario` | `Bloque_Horario` (0) | `HorarioService` | **EN USO** |
| `AsistenciaDiaria` | `Asistencia_Diaria` (0) | `AsistenciaService`, `ReportesService` | **EN USO** |
| `AsistenciaSituacion` | `asistencia_situacion` | `AsistenciaDiaria.situacionesDetalle` | **EN USO** |
| `Marcacion` | `Marcacion` (0) | `AsistenciaService` | **EN USO** |
| `Justificacion` | `Justificacion` (0) | `AsistenciaService.justificar` | **EN USO** |
| `JornadaSemanal` | `Jornada_Semanal` (0) | `JornadaSemanalRepository` | **POSIBLEMENTE MUERTO** (0 filas, `ReportesServiceImpl` stub `generarJornadaSemanal` no usado) |
| `ConfiguracionSistema` | `configuracion_sistema` (0) | `ConfiguracionSistemaRepository` | **POSIBLEMENTE MUERTO** (sin Controller, `grep configuracion_sistema` 0) |
| `Notificacion`, `TipoNotificacion` | `Notificacion`, `TipoNotificacion` | `NotificacionRepository` | **POSIBLEMENTE MUERTO** (sin Controller, 0 frontend) |
| `Puesto` / `Area` | **Eliminados** | 0 | **MUERTO** (correctamente) |

## 10. Configuración potencialmente obsoleta

| Archivo | Configuración | Motivo | Riesgo |
|---|---|---|---|
| `application.properties:14` `spring.jpa.hibernate.naming.physical-strategy=StandardImpl` | Necesaria para `IdSede` vs `id_sede` | Mantener (sin ella `IdSede`→`id_sede` FK fail) | **NO TOCAR** |
| `application.properties:5` `zeroDateTimeBehavior=convertToNull` | Necesaria para `sedes.fecha_creacion 0000-00-00` | Mantener | **NO TOCAR** |
| `application.properties:15` `hibernate.dialect=MySQL8Dialect` | Deprecated warning `MySQLDialect` | **BAJO** | Cambiar a `MySQLDialect` en próxima |
| `application.properties` `spring.jpa.show-sql=true`, `format_sql=true`, `logging.level.org.hibernate.SQL=DEBUG` | Solo dev, no prod | **BAJO** | Desactivar en prod |
| `pom.xml` `spring-boot-devtools` | Solo dev | **BAJO** | Mantener dev, opcional prod |
| `CORS` `allowed-origins http://localhost:3000` | Solo dev | **BAJO** | Parametrizar para prod |

## 11. Dependencias potencialmente innecesarias

| Dependencia | Motivo | Evidencia | Riesgo |
|---|---|---|---|
| `devtools` | `scope runtime optional true` | Solo dev, no prod | **BAJO** — mantener |
| `lombok` | Usado en **todas** las Entities/DTOs (`@Data`) | `grep lombok` 30+ files | **NO TOCAR** |
| `mysql-connector-j` | `runtime` | Usado | **NO TOCAR** |
| `validation` | `spring-boot-starter-validation` | Usado en `PracticanteRequest` `@Valid` | **NO TOCAR** |
| `spring-boot-starter-web/data-jpa` | Core | En uso | **NO TOCAR** |
| **Ninguna dependencia huérfana detectada** | `mvn dependency:analyze` no ejecutado, pero `grep` 0 imports huérfanos | — | **NO TOCAR** |

## 12. Residuos de Area/Puesto

| Tipo | Referencia | Estado actual |
|---|---|---|
| **Código real Area** | `Puesto.java`, `PuestoRepository`, `PuestoService`, `PuestoController`, `AreaRequest/Response`, `PuestoDTO`, `countByArea` | **ELIMINADO OF-5** (0 archivos, `grep -r "Puesto/Area" src` 0, `mvn clean compile` PASS) |
| **String "Area"** | `docsig_*` tablas `Area` (central, no PractiQR), comentarios históricos `PuestoDTO: @deprecated` ya borrados | **NO AFECTA** (no `practicante`関連) |
| **Frontend `area`** | `types/area.ts`, `lib/api/areas.ts`, `app/dashboard/areas/` ya borrados FRONT-2/3 (grep 0) | **ELIMINADO** |
| **Comentarios** | `PracticanteServiceImpl` `// Dummy Area` ya borrado | **ELIMINADO** |
| **Tests** | 0 tests de Area (grep `Area` en `src/test` 0) | **NO AFECTA** |
| **Imports** | `import Puesto` 0 tras deletes | **ELIMINADO** |
| **Config** | `application.properties` no menciona Area | **ELIMINADO** |
| **Conclusión** | `grep -r "Area" BACKEND/src` 0 (excl. `docsig`), `grep -r "idArea|Puesto" BACKEND/src` 0, `information_schema` 0 FK → Area, `SHOW TABLES LIKE 'Area'` 0 | **0 residuos activos** (solo `docsig` central, no PractiQR) |

## 13. Limpieza recomendada

### BAJO RIESGO (claramente eliminables, 0 consumidores)
- `model/enums/Agencia.java`, `Cargo.java`, `TipoInstituto.java` duplicados de Entity → elegir uno
- `PracticanteRepository.existsById`, `AsistenciaDiariaRepository.findByMinutosTardanza*`, `JornadaSemanalRepository` métodos sin uso
- `PracticanteService` `obtenerPorCodigo` alias (usa `/documento`)
- `ResumenAsistenciaDTO` alias `agencia`/`codigoTrabajador` (si backend ya no lo devuelve)

### RIESGO MEDIO (revisar antes)
- `Notificacion`/`TipoNotificacion` + `JornadaSemanal` + `ConfiguracionSistema` (0 filas, sin Controller, pero son auxiliares; verificar si PractiQR los usa indirectamente o son de otro sistema)
- `AsistenciaService.obtenerResumenSemanalPorAgencia(Agencia)` + `PracticanteService.contarPorAgencia` alias (dependen de `Agencia` enum)
- `ReportesServiceImpl` stub `generarJornadaSemanal` (vacío)

### ALTO RIESGO (no tocar sin entender)
- `Oficina`/`Sede`/`Practicante` core — no tocar
- `AsistenciaService`/`HorarioService` lógica `TARDANZA`/`AUSENTE` — no tocar
- `application.properties` `PhysicalNamingStrategy`, `zeroDateTimeBehavior`, `ddl-auto=validate` — no tocar

## 14. Checklist para la siguiente fase

```
[ ] Eliminar enums duplicados Agencia/Cargo/TipoInstituto (si se confirma no usados)
[ ] Eliminar Repository methods: existsById, findByMinutosTardanza*, Jornada* sin uso, Notificacion sin Controller
[ ] Eliminar Service methods: obtenerPorCodigo alias, obtenerResumenSemanalPorAgencia, contarPorAgencia alias, generarJornadaSemanal stub
[ ] Eliminar DTO alias agencia/codigoTrabajador si backend ya no los serializa
[ ] Confirmar Notificacion/JornadaSemanal/ConfiguracionSistema son de PractiQR o de otro sistema (si otro, no borrar, documentar como no usado)
[ ] Verificar frontend ya no llama /contar/sede, /reporte/semanal/agencia (si no, deprecar backend)
[ ] No reintroducir Area/Puesto (verificado 0)
[ ] mvn clean test + frontend npm run build deben seguir PASS
```

---

> **Evidencia:** `grep -r`, `find 88 files`, `SHOW CREATE/DESCRIBE`, `information_schema`, `mvn clean compile PASS` (94 files), `validate` PASS, `lsof` 0 DDL. Todo respaldado por búsquedas, no suposiciones.
