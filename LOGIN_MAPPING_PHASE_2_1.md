# FASE 2.1: MAPEO VIGILANTE + TRABAJADOR — REPORTE

## 1. Resultado
**FASE 2.1: COMPLETADA**

Ambas entidades mapeadas contra tablas **reales** de `one_db` sin modificar la BD, compilación OK, Hibernate reconoce 16 repositorios, validación `ddl-auto=validate` OK, lecturas OK, no se crearon tablas nuevas, no se instaló Security/JWT, no se tocó frontend.

> Discrepancia documentada: la tarea pedía tabla `vigilantes` (plural) pero la tabla real es `vigilante` (singular). Se mapeó a `vigilante` con evidencia `SHOW TABLES` + `DESCRIBE`.

## 2. Tabla `vigilante` (real: `vigilante`, no `vigilantes`)
- **Nombre real:** `vigilante` ( `SHOW TABLES` → 63 tablas, `vigilante` existe, `vigilantes` → `1146 Table doesn't exist`)
- **PK:** `id_vigilante` int(11) auto_increment
- **Columnas reales (DESCRIBE):**
  ```
  id_vigilante int(11) PK auto_increment
  nombre varchar(100) NOT NULL
  apellido varchar(100) NOT NULL
  usuario varchar(50) UNIQUE NOT NULL
  contrasena varchar(255) NOT NULL
  ```
- **Columnas mapeadas en `Vigilante.java`:** las 5 anteriores (100%). No se inventaron columnas.
- **Identificador para login futuro:** `usuario` (único, varchar 50) — es el único candidato. `contrasena` para PasswordEncoder.
- **Estado/situación:** **NO EXISTE** columna estado. No hay forma de desactivar vigilante sin borrar registro. Riesgo documentado.
- **Relaciones importantes:** Ninguna FK. Tabla aislada, sin `id_sede` ni `id_rol`. No hay relación con `sedes`/`trabajadores`.
- **Entidad:** `BACKEND/src/main/java/com/asistencia/attendance_system/model/entity/Vigilante.java` `@Entity @Table(name="vigilante")`
- **Repository:** `VigilanteRepository.java` `findByUsuario(String usuario)`

**Verificación:** `SELECT COUNT(*) FROM vigilante` → `VIGILANTE_COUNT=0` (tabla vacía pero mapeo válido, query sin error). `findById(1)` → vacío, sin excepción de columna.

## 3. Tabla `trabajadores` (real: `trabajadores`)
- **Nombre real:** `trabajadores`
- **PK:** `IdTrabajador` int(11) auto_increment
- **Columnas reales totales:** 31 columnas (DESCRIBE). Mapeadas solo las necesarias para auth RRHH:
  ```
  IdTrabajador int PK
  CodTrab varchar(10) NOT NULL
  Nombres varchar(45) NOT NULL
  Apellidos varchar(45) NOT NULL
  NroDoc varchar(15) NOT NULL  (DNI)
  Email varchar(100)
  Usuario varchar(15) NOT NULL
  PasswordUser varchar(255) NOT NULL
  Estado int(1) NOT NULL          (1=activo del trabajador)
  EstadoUsuario int(1) NOT NULL   (1=usuario activo)
  IdRol int(11) NOT NULL
  IdSede int(11) NOT NULL
  ```
  Otras no mapeadas: `IdTipoDoc`, `FechaNacimiento`, `Direccion`, `FechaIngreso`, `CuentaBancaria`, etc. (no necesarias para login y se dejan sin mapear para no complicar `validate`; al ser solo lectura no afecta).
- **Columnas mapeadas en `Trabajador.java`:** 12 columnas arriba (100% de las necesarias).
- **Identificador para login futuro:** `Usuario` (valor `75257890` para RRHH) o `Email` (`kelitaharotamani@gmail.com`) o `NroDoc`/`CodTrab`. Se proveen 4 métodos. Para RRHH se usará `findByUsuario("75257890")` o `findByEmail`.
- **Estado/situación:** Dos columnas: `Estado` (trabajador) y `EstadoUsuario` (cuenta). Ambas `1` para ID 87 → activo. `IdRol=2` (rol RRHH, ver tabla `roles`).
- **Relaciones importantes:** `IdSede` int FK lógica a `sedes.IdSede` (no FK física, pero valor `IdSede` existe), `IdRol` a `roles`, `IdPuesto`. No se mapearon como `@ManyToOne` para mantener solo lectura simple; se deja como Integer.
- **Entidad:** `BACKEND/src/main/java/com/asistencia/attendance_system/model/entity/Trabajador.java` `@Entity @Table(name="trabajadores")`
- **Repository:** `TrabajadorRepository.java` con `findByUsuario`, `findByEmail`, `findByNroDoc`, `findByCodTrab`

**Verificación (no se imprimen hashes):**
```
TRABAJADOR_COUNT= ~? (tabla con datos)
Trabajador 87: id=87 cod=00424 nombre=KELITA HARO TAMANI usuario=75257890 estado=1 estadoUsuario=1 idRol=2
findByUsuario 75257890 present=true
```
Contraseña verificada como `bcrypt detectado` (hash inicia `$2y$10$`), no se muestra.

## 4. Archivos creados/modificados
```
BACKEND/src/main/java/com/asistencia/attendance_system/model/entity/Vigilante.java      (NUEVO)
BACKEND/src/main/java/com/asistencia/attendance_system/model/entity/Trabajador.java     (NUEVO)
BACKEND/src/main/java/com/asistencia/attendance_system/repository/VigilanteRepository.java   (NUEVO)
BACKEND/src/main/java/com/asistencia/attendance_system/repository/TrabajadorRepository.java  (NUEVO)
BACKEND/src/test/java/com/asistencia/attendance_system/MappingPhase21Test.java         (PRUEBA TEMPORAL, solo lectura, no imprime hashes)
LOGIN_MAPPING_PHASE_2_1.md                                                                (ESTE REPORTE)
```
No se tocó: `FRONTEND/*`, `Practicante.java`, `pom.xml`, `application.properties` (`ddl-auto=validate` intacto), `DB/*`.

## 5. Validación
- **Compilación:** `./mvnw -q compile -DskipTests` → OK (BUILD SUCCESS, sin output)
- **Aplicación inicia:** `./mvnw spring-boot:run` → `Found 16 JPA repository interfaces` (antes 14, +2), `Initialized JPA EntityManagerFactory` OK, `Tomcat started on port 8080` OK. Sin `Unknown column` ni `Table not found`. Segunda ejecución tras matar proceso en 8080 también OK.
- **Hibernate reconoce entidades:** Sí, 16 repositorios, `validate` no intenta `CREATE TABLE`.
- **Consultas de lectura:** `VigilanteRepository.count()` → 0 OK, `TrabajadorRepository.findById(87)` → presente con `estado=1`, `findByUsuario` OK. Tests `MappingPhase21Test` → `Tests run: 2, Failures: 0`.
- **Se modificó la BD:** NO. No se ejecutó `CREATE/ALTER/INSERT/UPDATE/DELETE`. Verificado via `SHOW TABLES` sigue 63 tablas, sin tablas nuevas.

## 6. Riesgos o pendientes
1. **Vigilante sin estado:** Tabla `vigilante` no tiene columna `estado`/`activo`. No se puede desactivar vigilante sin borrar. Antes de FASE 2.2, decidir si se añade columna `estado` (requiere ALTER, hoy prohibido) o se maneja borrado lógico en código.
2. **Vigilante vacío:** `count=0`. Para probar login vigilante habrá que insertar un registro de prueba (no hecho en esta fase).
3. **Nombre tabla singular vs plural:** Documentación y código futuro debe usar `vigilante` (singular) no `vigilantes`. Ya corregido.
4. **Trabajador con doble estado:** `Estado` vs `EstadoUsuario` — para RRHH se debe validar `Estado=1 AND EstadoUsuario=1 AND IdRol=2` para asegurar que es RRHH activo. Hoy solo se verifica `IdRol`.
5. **Incompatibilidad de contraseñas:** `vigilante.contrasena` y `trabajadores.PasswordUser` son bcrypt, `Practicante.contrasena` es texto plano (`documento`). Fase 2.2 deberá decidir si se migra practicante a bcrypt o se mantiene doble lógica.
6. **Relaciones no mapeadas:** `Trabajador` no tiene `@ManyToOne` a `Sede`/`Rol`. Para Fase 2.2 de autorización, si se necesita `IdSede` para filtrar, ya está disponible como Integer.
7. **Pruebas temporales:** `MappingPhase21Test.java` debe borrarse o mantenerse como test de regresión (no afecta producción). No imprime hashes.

---
**Próximo paso recomendado:** Fase 2.2 — No tocar estas entidades; implementar `AuthService` que use `VigilanteRepository.findByUsuario` y `TrabajadorRepository.findByUsuario` con `PasswordEncoder.matches()` contra bcrypt, y `PracticanteRepository.findByDocumento` con texto plano (temporal) hasta migración.
