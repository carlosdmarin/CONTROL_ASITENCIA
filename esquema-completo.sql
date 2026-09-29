-- ═══════════════════════════════════════════════════════════
-- PractiQR — Esquema completo de base de datos
-- Generado desde las entidades JPA (BACKEND/.../model/entity/*.java)
-- Base de datos destino: one_db
-- Motor: InnoDB | Charset: utf8mb4 | Collation: utf8mb4_unicode_ci
--
-- REGLAS DE SEGURIDAD DE ESTE SCRIPT:
--   * Solo CREATE TABLE IF NOT EXISTS (nunca toca tablas existentes).
--   * Sin DROP TABLE, sin DROP COLUMN, sin MODIFY COLUMN activos.
--   * Columnas nuevas solo con ADD COLUMN condicional (si faltan).
--   * Nombres de tabla/columna con el case EXACTO de @Table/@Column.
--     (MySQL en Linux distingue mayúsculas/minúsculas.)
-- ═══════════════════════════════════════════════════════════

USE one_db;

-- ═══════════════════════════════════════════════════════════
-- TABLAS DEL SISTEMA (ordenadas por dependencia de FK)
-- ═══════════════════════════════════════════════════════════


-- ----------------------------------------------------------------
-- tipo_instituto  (entidad: TipoInstituto) — sin dependencias
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tipo_instituto` (
  `id_centro_estudios` BIGINT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(50) NOT NULL,
  `descripcion` VARCHAR(255) NULL,
  `activo` TINYINT(1) NOT NULL,
  `fecha_creacion` DATETIME NOT NULL,
  PRIMARY KEY (`id_centro_estudios`),
  UNIQUE KEY `uk_centro_estudios_nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------
-- tipo_practicante  (entidad: TipoPracticante) — sin dependencias
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tipo_practicante` (
  `id_tipo_practicante` BIGINT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(50) NOT NULL,
  `descripcion` VARCHAR(255) NULL,
  `horas_semanales` INT NOT NULL,
  `activo` TINYINT(1) NOT NULL,
  `fecha_creacion` DATETIME NOT NULL,
  PRIMARY KEY (`id_tipo_practicante`),
  UNIQUE KEY `uk_tipo_practicante_nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ----------------------------------------------------------------
-- vigilante  (entidad: Vigilante) — FK -> sedes
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `vigilante` (
  `id_vigilante` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  `apellido` VARCHAR(100) NOT NULL,
  `usuario` VARCHAR(50) NOT NULL,
  `contrasena` VARCHAR(255) NOT NULL,
  `Estado` TINYINT(1) NOT NULL,
  `sede_id` INT NULL,
  PRIMARY KEY (`id_vigilante`),
  UNIQUE KEY `uk_vigilante_usuario` (`usuario`),
  CONSTRAINT `FK_vigilante_sede` FOREIGN KEY (`sede_id`)
    REFERENCES `sedes` (`IdSede`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------
-- Practicante  (entidad: Practicante)
-- FK -> sedes, oficinas, tipo_instituto, tipo_practicante
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Practicante` (
  `id_practicante` BIGINT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  `apellido` VARCHAR(100) NOT NULL,
  `documento` VARCHAR(20) NOT NULL,
  `id_sede` INT NOT NULL,
  `id_oficina` INT NOT NULL,
  `id_centro_estudios` BIGINT NOT NULL,
  `id_tipo_practicante` BIGINT NOT NULL,
  `situacion` VARCHAR(255) NOT NULL,
  `fecha_desactivacion` DATETIME NULL,
  `correo_electronico` VARCHAR(100) NULL,
  `telefono` VARCHAR(15) NULL,
  `fecha_inicio_practicas` DATE NOT NULL,
  `fecha_fin_practicas` DATE NULL,
  `usuario` VARCHAR(50) NOT NULL,
  `contrasena` VARCHAR(255) NOT NULL,
  `fecha_registro` DATETIME NOT NULL,
  `fecha_actualizacion` DATETIME NULL,
  PRIMARY KEY (`id_practicante`),
  UNIQUE KEY `uk_practicante_documento` (`documento`),
  UNIQUE KEY `uk_practicante_usuario` (`usuario`),
  CONSTRAINT `fk_practicante_sede` FOREIGN KEY (`id_sede`)
    REFERENCES `sedes` (`IdSede`)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_practicante_oficina` FOREIGN KEY (`id_oficina`)
    REFERENCES `oficinas` (`IdOficina`)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_practicante_centro` FOREIGN KEY (`id_centro_estudios`)
    REFERENCES `tipo_instituto` (`id_centro_estudios`)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_practicante_tipo_practicante` FOREIGN KEY (`id_tipo_practicante`)
    REFERENCES `tipo_practicante` (`id_tipo_practicante`)
    ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------
-- Bloque_Horario  (entidad: BloqueHorario) — FK -> Practicante
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Bloque_Horario` (
  `id_bloque` BIGINT NOT NULL AUTO_INCREMENT,
  `id_practicante` BIGINT NOT NULL,
  `dia_semana` VARCHAR(10) NOT NULL,
  `hora_inicio` TIME NOT NULL,
  `hora_fin` TIME NOT NULL,
  `tipo_bloque` VARCHAR(255) NOT NULL,
  `descripcion` VARCHAR(100) NULL,
  `activo` TINYINT(1) NOT NULL,
  `fecha_inicio` DATE NOT NULL,
  `fecha_fin` DATE NULL,
  `fecha_creacion` DATETIME NOT NULL,
  `fecha_actualizacion` DATETIME NULL,
  PRIMARY KEY (`id_bloque`),
  CONSTRAINT `fk_bloque_practicante` FOREIGN KEY (`id_practicante`)
    REFERENCES `Practicante` (`id_practicante`)
    ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------
-- Jornada_Semanal  (entidad: JornadaSemanal) — FK -> Practicante
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Jornada_Semanal` (
  `id_jornada` BIGINT NOT NULL AUTO_INCREMENT,
  `id_practicante` BIGINT NOT NULL,
  `semana_inicio` DATE NOT NULL,
  `horas_requeridas` DECIMAL(5,2) NOT NULL,
  `horas_cumplidas` DECIMAL(5,2) NULL,
  `horas_pendientes` DECIMAL(5,2) NULL,
  `estado_semanal` VARCHAR(255) NOT NULL,
  `observaciones` TEXT NULL,
  `fecha_calculo` DATETIME NOT NULL,
  PRIMARY KEY (`id_jornada`),
  CONSTRAINT `fk_jornada_practicante` FOREIGN KEY (`id_practicante`)
    REFERENCES `Practicante` (`id_practicante`)
    ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------
-- Justificacion  (entidad: Justificacion) — FK -> Practicante
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Justificacion` (
  `id_justificacion` BIGINT NOT NULL AUTO_INCREMENT,
  `id_practicante` BIGINT NOT NULL,
  `fecha_inicio` DATE NOT NULL,
  `fecha_fin` DATE NOT NULL,
  `tipo_justificacion` VARCHAR(255) NOT NULL,
  `motivo` TEXT NOT NULL,
  `archivo_adjunto` VARCHAR(255) NULL,
  `estado` VARCHAR(255) NOT NULL,
  `id_usuario_aprueba` BIGINT NULL,
  `fecha_aprobacion` DATETIME NULL,
  `observaciones` TEXT NULL,
  `fecha_registro` DATETIME NOT NULL,
  PRIMARY KEY (`id_justificacion`),
  CONSTRAINT `fk_justificacion_practicante` FOREIGN KEY (`id_practicante`)
    REFERENCES `Practicante` (`id_practicante`)
    ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------
-- Marcacion  (entidad: Marcacion) — FK -> Practicante
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Marcacion` (
  `id_marcacion` BIGINT NOT NULL AUTO_INCREMENT,
  `id_practicante` BIGINT NOT NULL,
  `fecha` DATE NOT NULL,
  `hora_marcacion` TIME NOT NULL,
  `tipo_marcacion` VARCHAR(255) NOT NULL,
  `metodo_registro` VARCHAR(255) NOT NULL,
  `codigo_qr` VARCHAR(50) NULL,
  `latitud` DOUBLE NULL,
  `longitud` DOUBLE NULL,
  `ip_origen` VARCHAR(45) NULL,
  `user_agent` VARCHAR(255) NULL,
  `observaciones` TEXT NULL,
  `fecha_registro` DATETIME NOT NULL,
  PRIMARY KEY (`id_marcacion`),
  CONSTRAINT `fk_marcacion_practicante` FOREIGN KEY (`id_practicante`)
    REFERENCES `Practicante` (`id_practicante`)
    ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ----------------------------------------------------------------
-- Asistencia_Diaria  (entidad: AsistenciaDiaria) — FK -> Practicante
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Asistencia_Diaria` (
  `id_asistencia` BIGINT NOT NULL AUTO_INCREMENT,
  `id_practicante` BIGINT NOT NULL,
  `fecha` DATE NOT NULL,
  `estado_dia` VARCHAR(20) NOT NULL,
  `horas_trabajadas` DECIMAL(5,2) NULL,
  `minutos_tardanza` INT NULL,
  `entrada_esperada` TIME NULL,
  `salida_esperada` TIME NULL,
  `entrada_real` TIME NULL,
  `salida_real` TIME NULL,
  `observaciones` TEXT NULL,
  `justificado` TINYINT(1) NULL,
  `justificacion_motivo` TEXT NULL,
  `justificacion_observacion` TEXT NULL,
  `justificacion_fecha` DATETIME NULL,
  `justificacion_tipo` VARCHAR(30) NULL,
  `situacion` VARCHAR(35) NULL,
  `fecha_calculo` DATETIME NOT NULL,
  PRIMARY KEY (`id_asistencia`),
  CONSTRAINT `fk_asistencia_practicante` FOREIGN KEY (`id_practicante`)
    REFERENCES `Practicante` (`id_practicante`)
    ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------
-- asistencia_situacion  (entidad: AsistenciaSituacion)
-- FK -> Asistencia_Diaria + UNIQUE(id_asistencia, tipo)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `asistencia_situacion` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `id_asistencia` BIGINT NOT NULL,
  `tipo` VARCHAR(35) NOT NULL,
  `motivo` TEXT NULL,
  `observacion` TEXT NULL,
  `hora_salida_anticipada` TIME NULL,
  `hora_entrada_registrada` TIME NULL,
  `fecha_registro` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_asistencia_situacion` (`id_asistencia`, `tipo`),
  CONSTRAINT `fk_situacion_asistencia` FOREIGN KEY (`id_asistencia`)
    REFERENCES `Asistencia_Diaria` (`id_asistencia`)
    ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


