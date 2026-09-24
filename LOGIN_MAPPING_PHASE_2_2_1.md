# FASE 2.2.1: AGREGAR ESTADO A VIGILANTE — REPORTE

## 1. Objetivo
Agregar estado ACTIVO/INACTIVO a `one_db.vigilante` (5 columnas → 6) para que un vigilante inactivo no pueda loguearse. Mantener coherencia con `trabajadores.Estado` (int 1/0).

## 2. Estado anterior
```
vigilante:
  id_vigilante int(11) PK auto_increment
  nombre varchar(100) NOT NULL
  apellido varchar(100) NOT NULL
  usuario varchar(50) UNIQUE NOT NULL
  contrasena varchar(255) NOT NULL
```
COUNT(*) = 0 (tabla vacía, verificada vía pymysql).

## 3. Cambio realizado
```sql
ALTER TABLE vigilante ADD COLUMN Estado TINYINT(1) NOT NULL DEFAULT 1;
```
Ejecutado vía `pymysql` tras verificar que `Estado` no existía en `DESCRIBE`. No se hizo dump completo.

## 4. Significado
```
1 = ACTIVO  (puede iniciar sesión)
0 = INACTIVO (no puede iniciar sesión)
```
Mismo criterio que `trabajadores.Estado` (int 1) y `trabajadores.EstadoUsuario` (int 1). Se eligió `TINYINT(1)` para coherencia con `tinyint(1)` habitual en MySQL para boolean, aunque `trabajadores` usa `int(1)` — ambos mapean a 1/0.

## 5. BD modificada
`one_db.vigilante` únicamente. No se tocó `trabajadores`, `Practicante`, `roles`, `sedes`.

## 6. Entidad JPA
**Archivo:** `BACKEND/src/main/java/com/asistencia/attendance_system/model/entity/Vigilante.java`
```java
@Entity @Table(name="vigilante")
public class Vigilante {
  @Id @GeneratedValue(IDENTITY) @Column(name="id_vigilante") Integer idVigilante;
  @Column(name="nombre", nullable=false, length=100) String nombre;
  @Column(name="apellido", nullable=false, length=100) String apellido;
  @Column(name="usuario", nullable=false, unique=true, length=50) String usuario;
  @Column(name="contrasena", nullable=false, length=255) String contrasena;
  @Column(name="Estado", nullable=false, columnDefinition="TINYINT(1)") Boolean estado = true;
}
```
Nota: Se usa `Boolean` con `columnDefinition="TINYINT(1)"` porque MySQL reporta `tinyint(1)` como `BIT` (Types#BIT) y `Integer` esperaba `INTEGER` (validación falló con `wrong column type: found [bit] expecting [integer]`). Con `Boolean` Hibernate espera `BIT` y valida OK. Default `true` (=1) coincide con `DEFAULT 1`.

## 7. Repository
**Archivo:** `BACKEND/src/main/java/com/asistencia/attendance_system/repository/VigilanteRepository.java`
```java
Optional<Vigilante> findByUsuario(String usuario);
Optional<Vigilante> findByUsuarioAndEstado(String usuario, Boolean estado); // nuevo, para futuro auth
```
Solo facilita consulta por usuario activo, sin lógica de contraseña.

## 8. Validación
- **DESCRIBE correcto:** `Estado tinyint(1) NO DEFAULT 1` (verificado `DESCRIBE vigilante` post-ALTER).
- **COUNT antes:** 0 → **COUNT después:** 0 (sin registros, se mantiene).
- **GROUP BY Estado:** 0 filas (tabla vacía, válido).
- **Compile:** `./mvnw -q compile -DskipTests` → exit 0 (BUILD SUCCESS). Inicial falló con `wrong column type` al mapear como `Integer`; corregido a `Boolean` → OK.
- **Spring Boot:** `./mvnw spring-boot:run` → `Found 16 JPA repository interfaces` (antes 14), `Initialized JPA EntityManagerFactory` sin `Unknown column`, `Tomcat started on port 8080` OK (segundo intento tras matar puerto 8080).
- **JPA:** `ddl-auto=validate` intacto (no se cambió a update), validación OK.
- **Lectura:** `VigilanteRepository.count()=0`, `findByUsuarioAndEstado("noexiste",true) present=false` OK; `TrabajadorRepository.findById(87)` sigue OK (Kelita, estado 1, IdRol 2). Tests `MappingPhase21Test` → `Tests run:2 Failures:0` tras fix.

## 9. Datos
```
no se insertaron vigilantes (COUNT 0 → 0)
no se modificaron contraseñas (no se imprimen hashes)
no se modificaron trabajadores (Id 87 sigue cod 00424)
no se modificaron practicantes
```

## 10. Próximo paso
**FASE 2.3 — Spring Security + PasswordEncoder + JWT** (sin tocar BD, solo código auth).

---
**Archivos modificados:**
- `BACKEND/src/main/java/com/asistencia/attendance_system/model/entity/Vigilante.java` (añadida columna Estado)
- `BACKEND/src/main/java/com/asistencia/attendance_system/repository/VigilanteRepository.java` (+ findByUsuarioAndEstado)
- `BACKEND/src/test/java/com/asistencia/attendance_system/MappingPhase21Test.java` (verificación estado, no inserta datos)
- `DB` → `one_db.vigilante` + columna `Estado`
