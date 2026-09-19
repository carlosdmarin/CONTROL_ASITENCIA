# PRACTIQR — ESQUEMA ACTUAL DE BASE DE DATOS

> Generado por auditoría de código backend. No se ejecutó SQL. Fuente única: clases `@Entity` en `src/main/java/com/asistencia/attendance_system/model/entity/*.java`, `@Repository` y `application.properties`.

---

## 1. Resumen

| Métrica                                         | Valor                                                                                                                   |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Entidades JPA (`@Entity`) encontradas**       | **14**                                                                                                                  |
| **Tablas SQL mapeadas**                         | **14**                                                                                                                  |
| **Tablas principales (dominio PractiQR)**       | 7                                                                                                                       |
| **Tablas soporte / auxiliares**                 | 5                                                                                                                       |
| **Tablas legacy / sin uso relevante**           | 2                                                                                                                       |
| **Relaciones FK (`@ManyToOne` / `@OneToMany`)** | **10** FKs `ManyToOne` + 1 `OneToMany`                                                                                  |
| **Claves foráneas físicas**                     | 10 (`nullable=false` todas)                                                                                             |
| **Enums persistidos**                           | 7 (`Situacion`, `DiaSemana`, `TipoBloque`, `EstadoDia`, `SituacionAsistencia`, `TipoMarcacion`, `MetodoRegistro`, etc.) |
| **Archivos analizados**                         | 14 entidades + 14 repositories + 10 enums + `application.properties` + `pom.xml`                                        |

**Tablas:** `Practicante`, `Area`, `Sede`, `Cargo`, `Centro_estudios`, `Bloque_Horario`, `Asistencia_Diaria`, `Marcacion`, `Justificacion`, `asistencia_situacion`, `Jornada_Semanal`, `Configuracion_Sistema`, `Notificacion`, `TipoNotificacion`.

---

## 2. Inventario de tablas

| #   | Entidad Java           | Tabla SQL               | Tipo              | PK                     | Observaciones                                                           |
| --- | ---------------------- | ----------------------- | ----------------- | ---------------------- | ----------------------------------------------------------------------- |
| 1   | `Practicante`          | `Practicante`           | **PRINCIPAL**     | `id_practicante`       | Núcleo. 4 FK obligatorias. Sin `password/rol/qr`.                       |
| 2   | `Puesto`               | `Area`                  | **PRINCIPAL**     | `id_area`              | Nombre clase `Puesto` ≠ tabla `Area`. Alias `idPuesto↔idArea`.          |
| 3   | `Sede`                 | `Sede`                  | **PRINCIPAL**     | `id_sede`              | Alias `idAgencia`.                                                      |
| 4   | `Cargo`                | `Cargo`                 | **PRINCIPAL**     | `id_cargo`             | `horas_semanales` solo usado en `obtenerResumenSemanal` legacy.         |
| 5   | `TipoInstituto`        | `Centro_estudios`       | **PRINCIPAL**     | `id_centro_estudios`   | Tabla `Centro_estudios` con underscore y minúscula.                     |
| 6   | `BloqueHorario`        | `Bloque_Horario`        | **PRINCIPAL**     | `id_bloque`            | Horario por practicante/día.                                            |
| 7   | `AsistenciaDiaria`     | `Asistencia_Diaria`     | **PRINCIPAL**     | `id_asistencia`        | Estado + justificación embebida + `OneToMany` a `asistencia_situacion`. |
| 8   | `Marcacion`            | `Marcacion`             | **RELACIÓN**      | `id_marcacion`         | Entrada/salida QR, con `codigo_qr` VARCHAR(50).                         |
| 9   | `Justificacion`        | `Justificacion`         | **RELACIÓN**      | `id_justificacion`     | Rango `fecha_inicio/fin`, no FK a `Asistencia_Diaria`.                  |
| 10  | `AsistenciaSituacion`  | `asistencia_situacion`  | **RELACIÓN**      | `id`                   | Hija de `Asistencia_Diaria`, `UNIQUE(id_asistencia,tipo)`, `EAGER`.     |
| 11  | `JornadaSemanal`       | `Jornada_Semanal`       | **SOPORTE**       | `id_jornada`           | Casi no usada (`generarJornadaSemanal` vacía).                          |
| 12  | `ConfiguracionSistema` | `Configuracion_Sistema` | **CONFIGURACIÓN** | `id_config`            | `clave UNIQUE`, `valor`. No usada en lógica.                            |
| 13  | `Notificacion`         | `Notificacion`          | **SOPORTE**       | `id_notificacion`      | `ManyToOne` a `Practicante` y `TipoNotificacion`.                       |
| 14  | `TipoNotificacion`     | `TipoNotificacion`      | **SOPORTE**       | `id_tipo_notificacion` | Catálogo.                                                               |

**Tipos:** PRINCIPAL = dominio practicante/horario/asistencia. RELACIÓN = transaccional. SOPORTE = auxiliar. No hay tablas `LEGACY` puras pero `JornadaSemanal`/`Notificacion` son candidatas a archivar.

---

## 3. Esquema SQL completo

> Tipos inferidos de `@Column`/`@Enumerated`/`@GeneratedValue`. `VARCHAR/TEXT` según `length`/`columnDefinition`. FKs `ON DELETE NO ACTION` (NO DETERMINADO, por defecto JPA). `AUTO_INCREMENT` para `IDENTITY`.

```sql
CREATE TABLE Area (
    id_area BIGINT NOT NULL AUTO_INCREMENT,
    nombre_area VARCHAR(100) NOT NULL,
    descripcion TEXT NULL,
    activo TINYINT(1) NOT NULL DEFAULT 1,
    fecha_creacion DATETIME NOT NULL,
    PRIMARY KEY (id_area)
);

-- ESTA TABLA YA EXISTE EN ONE_DB. NO CREAR.
-- one_db.sedes

CREATE TABLE Cargo (
    id_cargo BIGINT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255) NULL,
    horas_semanales INT NOT NULL,
    activo TINYINT(1) NOT NULL DEFAULT 1,
    fecha_creacion DATETIME NOT NULL,
    PRIMARY KEY (id_cargo)
);

CREATE TABLE Centro_estudios (
    id_centro_estudios BIGINT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255) NULL,
    activo TINYINT(1) NOT NULL DEFAULT 1,
    fecha_creacion DATETIME NOT NULL,
    PRIMARY KEY (id_centro_estudios)
);

CREATE TABLE Practicante (
    id_practicante BIGINT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    documento VARCHAR(20) NOT NULL,

    -- FK hacia one_db.sedes
    id_sede INT NOT NULL,

    id_area BIGINT NOT NULL,
    id_centro_estudios BIGINT NOT NULL,
    id_cargo BIGINT NOT NULL,

    situacion VARCHAR(20) NOT NULL,
    fecha_desactivacion DATETIME NULL,

    correo_electronico VARCHAR(100) NULL,
    telefono VARCHAR(15) NULL,

    fecha_inicio_practicas DATE NOT NULL,
    fecha_fin_practicas DATE NULL,

    -- Credenciales propias de PractiQR
    usuario VARCHAR(50) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,

    fecha_registro DATETIME NOT NULL,
    fecha_actualizacion DATETIME NULL,

    PRIMARY KEY (id_practicante),

    CONSTRAINT fk_practicante_sede
        FOREIGN KEY (id_sede)
        REFERENCES sedes(IdSede),

    CONSTRAINT fk_practicante_area
        FOREIGN KEY (id_area)
        REFERENCES Area(id_area),

    CONSTRAINT fk_practicante_centro
        FOREIGN KEY (id_centro_estudios)
        REFERENCES Centro_estudios(id_centro_estudios),

    CONSTRAINT fk_practicante_cargo
        FOREIGN KEY (id_cargo)
        REFERENCES Cargo(id_cargo),

    UNIQUE KEY uk_practicante_documento (documento)
);

CREATE TABLE Bloque_Horario (
    id_bloque BIGINT NOT NULL AUTO_INCREMENT,
    id_practicante BIGINT NOT NULL,

    dia_semana VARCHAR(10) NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,

    tipo_bloque VARCHAR(20) NOT NULL,
    descripcion VARCHAR(100) NULL,

    activo TINYINT(1) NOT NULL DEFAULT 1,

    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NULL,

    fecha_creacion DATETIME NOT NULL,
    fecha_actualizacion DATETIME NULL,

    PRIMARY KEY (id_bloque),

    CONSTRAINT fk_bloque_practicante
        FOREIGN KEY (id_practicante)
        REFERENCES Practicante(id_practicante)
);

CREATE TABLE Asistencia_Diaria (
    id_asistencia BIGINT NOT NULL AUTO_INCREMENT,
    id_practicante BIGINT NOT NULL,

    fecha DATE NOT NULL,
    estado_dia VARCHAR(20) NOT NULL,

    horas_trabajadas DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    minutos_tardanza INT NULL DEFAULT 0,

    entrada_esperada TIME NULL,
    salida_esperada TIME NULL,
    entrada_real TIME NULL,
    salida_real TIME NULL,

    observaciones TEXT NULL,

    justificado TINYINT(1) NOT NULL DEFAULT 0,
    justificacion_motivo TEXT NULL,
    justificacion_observacion TEXT NULL,
    justificacion_fecha DATETIME NULL,
    justificacion_tipo VARCHAR(30) NULL,

    situacion VARCHAR(35) NOT NULL DEFAULT 'NINGUNA',

    fecha_calculo DATETIME NOT NULL,

    PRIMARY KEY (id_asistencia),

    CONSTRAINT fk_asistencia_practicante
        FOREIGN KEY (id_practicante)
        REFERENCES Practicante(id_practicante)
);

CREATE TABLE asistencia_situacion (
    id BIGINT NOT NULL AUTO_INCREMENT,
    id_asistencia BIGINT NOT NULL,

    tipo VARCHAR(35) NOT NULL,
    motivo TEXT NULL,
    observacion TEXT NULL,

    hora_salida_anticipada TIME NULL,
    hora_entrada_registrada TIME NULL,

    fecha_registro DATETIME NOT NULL,

    PRIMARY KEY (id),

    CONSTRAINT fk_situacion_asistencia
        FOREIGN KEY (id_asistencia)
        REFERENCES Asistencia_Diaria(id_asistencia)
        ON DELETE CASCADE,

    UNIQUE KEY uk_asistencia_tipo (id_asistencia, tipo)
);

CREATE TABLE Marcacion (
    id_marcacion BIGINT NOT NULL AUTO_INCREMENT,
    id_practicante BIGINT NOT NULL,

    fecha DATE NOT NULL,
    hora_marcacion TIME NOT NULL,

    tipo_marcacion VARCHAR(20) NOT NULL,
    metodo_registro VARCHAR(20) NOT NULL,

    -- Por ahora se mantiene para la implementación actual del QR.
    -- El QR dinámico se implementará posteriormente.
    codigo_qr VARCHAR(50) NULL,

    latitud DOUBLE NULL,
    longitud DOUBLE NULL,

    ip_origen VARCHAR(45) NULL,
    user_agent VARCHAR(255) NULL,

    observaciones TEXT NULL,

    fecha_registro DATETIME NOT NULL,

    PRIMARY KEY (id_marcacion),

    CONSTRAINT fk_marcacion_practicante
        FOREIGN KEY (id_practicante)
        REFERENCES Practicante(id_practicante)
);

CREATE TABLE Justificacion (
    id_justificacion BIGINT NOT NULL AUTO_INCREMENT,
    id_practicante BIGINT NOT NULL,

    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,

    tipo_justificacion VARCHAR(20) NOT NULL,
    motivo TEXT NOT NULL,

    archivo_adjunto VARCHAR(255) NULL,

    estado VARCHAR(20) NOT NULL,

    id_usuario_aprueba BIGINT NULL,
    fecha_aprobacion DATETIME NULL,

    observaciones TEXT NULL,

    fecha_registro DATETIME NOT NULL,

    PRIMARY KEY (id_justificacion),

    CONSTRAINT fk_justificacion_practicante
        FOREIGN KEY (id_practicante)
        REFERENCES Practicante(id_practicante)
);

CREATE TABLE Jornada_Semanal (
    id_jornada BIGINT NOT NULL AUTO_INCREMENT,
    id_practicante BIGINT NOT NULL,

    semana_inicio DATE NOT NULL,

    horas_requeridas DECIMAL(5,2) NOT NULL,
    horas_cumplidas DECIMAL(5,2) NULL DEFAULT 0.00,
    horas_pendientes DECIMAL(5,2) NULL DEFAULT 0.00,

    estado_semanal VARCHAR(20) NOT NULL,

    observaciones TEXT NULL,

    fecha_calculo DATETIME NOT NULL,

    PRIMARY KEY (id_jornada),

    CONSTRAINT fk_jornada_practicante
        FOREIGN KEY (id_practicante)
        REFERENCES Practicante(id_practicante)
);

CREATE TABLE Configuracion_Sistema (
    id_config BIGINT NOT NULL AUTO_INCREMENT,

    clave VARCHAR(50) NOT NULL UNIQUE,
    valor VARCHAR(255) NOT NULL,

    descripcion TEXT NULL,

    fecha_actualizacion DATETIME NULL,

    PRIMARY KEY (id_config)
);

CREATE TABLE vigilante (
    id_vigilante INT NOT NULL AUTO_INCREMENT,

    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,

    usuario VARCHAR(50) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,

    PRIMARY KEY (id_vigilante)
);
```

---

## 4. Relaciones

| Tabla origen           | Columna FK             | Tabla destino       | Columna destino        | Tipo                                |
| ---------------------- | ---------------------- | ------------------- | ---------------------- | ----------------------------------- |
| `Practicante`          | `id_sede`              | `Sede`              | `id_sede`              | ManyToOne                           |
| `Practicante`          | `id_area`              | `Area`              | `id_area`              | ManyToOne                           |
| `Practicante`          | `id_centro_estudios`   | `Centro_estudios`   | `id_centro_estudios`   | ManyToOne                           |
| `Practicante`          | `id_cargo`             | `Cargo`             | `id_cargo`             | ManyToOne                           |
| `Bloque_Horario`       | `id_practicante`       | `Practicante`       | `id_practicante`       | ManyToOne                           |
| `Asistencia_Diaria`    | `id_practicante`       | `Practicante`       | `id_practicante`       | ManyToOne                           |
| `asistencia_situacion` | `id_asistencia`        | `Asistencia_Diaria` | `id_asistencia`        | ManyToOne (OneToMany EAGER cascade) |
| `Marcacion`            | `id_practicante`       | `Practicante`       | `id_practicante`       | ManyToOne                           |
| `Justificacion`        | `id_practicante`       | `Practicante`       | `id_practicante`       | ManyToOne                           |
| `Jornada_Semanal`      | `id_practicante`       | `Practicante`       | `id_practicante`       | ManyToOne                           |
| `Notificacion`         | `id_practicante`       | `Practicante`       | `id_practicante`       | ManyToOne                           |
| `Notificacion`         | `id_tipo_notificacion` | `TipoNotificacion`  | `id_tipo_notificacion` | ManyToOne                           |

_No hay `@OneToMany` inverso en `Practicante` ni `@ManyToMany`._

---

## 5. Dependencias
2. Revisar Practicante.java → agregar usuario y contrasena
3. Corregir código viejo de agencia → sede
4. Corregir TARDE/FALTA → TARDANZA/AUSENTE
5. Revisar las demás entidades contra one_db
6. Recién después controlar ddl-auto
```
Area ──┐
Sede ──┼──► Practicante ──┬──► Bloque_Horario
Cargo ──┤                 ├──► Asistencia_Diaria ──► asistencia_situacion
Centro_estudios ──┘       ├──► Marcacion
                          ├──► Justificacion
                          ├──► Jornada_Semanal
                          └──► Notificacion ──► TipoNotificacion

Configuracion_Sistema (aislada)
```

**Orden migración sugerido:** `Area/Sede/Cargo/Centro_estudios/TipoNotificacion` → `Practicante` → resto.

---

## 6. Campos problemáticos o inconsistentes

| Archivo                                                        | Tabla/Entidad       | Problema                                                                                                            | Evidencia                                                                                     | Impacto                                                                                                  |
| -------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `Puesto.java:12` / `model/dto`                                 | `Area`              | Nombre clase `Puesto` ≠ tabla `Area`, campo `idPuesto` ↔ columna `id_area`                                          | `@Table(name="Area")` + `@Column(name="id_area") private Long idPuesto` + alias `getIdArea()` | Confunde JOINs a `one_db` (`area` vs `puesto`).                                                          |
| `PracticanteRepository` / `AsistenciaDiariaRepository.java:47` | `Asistencia_Diaria` | Query nativa usa `p.id_agencia` y `GROUP BY p.id_agencia`                                                           | `SELECT p.id_agencia ... FROM Practicante p`                                                  | **Se romperá** en `one_db` donde es `id_sede`; JPA `p.sede` espera `id_sede`.                            |
| `Sede.java:22`                                                 | `Sede`              | Alias `getIdAgencia()` para compat                                                                                  | `public Long getIdAgencia(){return idSede;}`                                                  | Indica migración incompleta `Agencia→Sede`.                                                              |
| `PuestoRepository` vs `Puesto.java`                            | `Area`              | Búsqueda `findByNombrePuesto` vs `nombre_area`                                                                      | `@Column(name="nombre_area") private String nombrePuesto`                                     | OK pero frágil al renombrar.                                                                             |
| `AsistenciaDiariaRepository.java:39-42`                        | `Asistencia_Diaria` | `COUNT ... estadoDia='FALTA'/'TARDE'` legacy                                                                        | `WHERE a.estadoDia='FALTA'`                                                                   | `EstadoDia` actual es `AUSENTE/TARDANZA`; legacy solo lectura, pero query nativa no usa `normalizado()`. |
| `TipoInstituto.java:10`                                        | `Centro_estudios`   | Tabla `Centro_estudios` (mayúscula C) vs resto `PascalCase` (`Practicante`) y `snake_case` (`asistencia_situacion`) | `@Table(name="Centro_estudios")`                                                              | Case-sensitive en Linux/MySQL puede fallar.                                                              |
| `Asistencia_Diaria`                                            | —                   | Sin `UNIQUE(id_practicante,fecha)`                                                                                  | No hay `@Table(uniqueConstraints)`                                                            | `ddl-auto=update` permitirá duplicados lógicos.                                                          |
| `Practicante.java`                                             | `Practicante`       | Sin `password/rol/qr_token`                                                                                         | No existe campo                                                                               | Bloquea integración `ONE` login/QR dinámico.                                                             |

---

## 7. Tablas candidatas para migración

### Tablas que probablemente permanecerán en PractiQR

`Practicante` (ajustar FKs), `Bloque_Horario`, `Asistencia_Diaria`, `asistencia_situacion`, `Marcacion`, `Justificacion`, `Jornada_Semanal` (evaluar archivar), `Cargo` (si `one_db` no tiene `horas_semanales`), `Centro_estudios` (si `one_db` no tiene centro de estudios).

### Tablas que probablemente serán reemplazadas por One

**`Sede` y `Area` (Puesto):** Ya existen en `one_db` como `sedes`/`areas`. Son las únicas 2 que el auditor debe comparar 1:1. No decidir reemplazo hasta ver `one_db` (`one_db.sedes(id,nombre)` vs `Sede`).

---

## 8. Resumen para comparación con OneDB

| Tabla PractiQR          | ¿Propia? | ¿Equivalente en OneDB?                                                          | Acción futura probable                                             |
| ----------------------- | -------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `Sede`                  | No       | **Sí** (seguro)                                                                 | **Comparar/Reutilizar** — mapear `id_sede/nombre` a `one_db.sedes` |
| `Area` (`Puesto`)       | No       | **Sí** (seguro)                                                                 | **Comparar/Reutilizar** — mapear `id_area/nombre_area`             |
| `Practicante`           | Sí       | **Por determinar** (existe `trabajadores`/`usuarios` en One, no `practicantes`) | **Mantener** y `ALTER` FKs a `one_db` tablas                       |
| `Cargo`                 | Sí       | Por determinar                                                                  | Mantener (si `one_db` no tiene `horas_semanales`)                  |
| `Centro_estudios`       | Sí       | Por determinar                                                                  | Mantener                                                           |
| `Bloque_Horario`        | Sí       | No                                                                              | Mantener                                                           |
| `Asistencia_Diaria`     | Sí       | No                                                                              | Mantener                                                           |
| `asistencia_situacion`  | Sí       | No                                                                              | Mantener                                                           |
| `Marcacion`             | Sí       | No                                                                              | Mantener (añadir `qr_token` a futuro)                              |
| `Justificacion`         | Sí       | No                                                                              | Mantener                                                           |
| `Jornada_Semanal`       | Sí       | No                                                                              | **Evaluar archivar**                                               |
| `Configuracion_Sistema` | Sí       | No                                                                              | Mantener                                                           |
| `Notificacion`          | Sí       | No                                                                              | Mantener                                                           |
| `TipoNotificacion`      | Sí       | No                                                                              | Mantener                                                           |

---

## Archivos analizados

14 entidades, 14 repositories, 4 services/impl, `application.properties` (`asistencia_db`, `ddl-auto=update`, `America/Lima`), `pom.xml` (sin Security/JWT/QR).

> **NO** se ejecutó SQL. **NO** se modificó código. Esquema es **aproximado fiel** a JPA.
