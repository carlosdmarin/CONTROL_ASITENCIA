-- MariaDB dump 10.19  Distrib 10.4.28-MariaDB, for osx10.10 (x86_64)
--
-- Host: localhost    Database: practiqr_db
-- ------------------------------------------------------
-- Server version	10.4.28-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Asistencia_Diaria`
--

DROP TABLE IF EXISTS `Asistencia_Diaria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Asistencia_Diaria` (
  `id_asistencia` bigint(20) NOT NULL AUTO_INCREMENT,
  `id_practicante` bigint(20) NOT NULL,
  `fecha` date NOT NULL,
  `estado_dia` varchar(20) NOT NULL,
  `horas_trabajadas` decimal(5,2) DEFAULT NULL,
  `minutos_tardanza` int(11) DEFAULT 0,
  `entrada_esperada` time DEFAULT NULL,
  `salida_esperada` time DEFAULT NULL,
  `entrada_real` time DEFAULT NULL,
  `salida_real` time DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `justificado` tinyint(1) NOT NULL DEFAULT 0,
  `justificacion_motivo` text DEFAULT NULL,
  `justificacion_observacion` text DEFAULT NULL,
  `justificacion_fecha` datetime DEFAULT NULL,
  `justificacion_tipo` varchar(30) DEFAULT NULL,
  `situacion` varchar(35) NOT NULL DEFAULT 'NINGUNA',
  `fecha_calculo` datetime NOT NULL,
  PRIMARY KEY (`id_asistencia`),
  KEY `FKgadyobpud3k2rq4kpnyvvm1dn` (`id_practicante`),
  CONSTRAINT `FKgadyobpud3k2rq4kpnyvvm1dn` FOREIGN KEY (`id_practicante`) REFERENCES `Practicante` (`id_practicante`),
  CONSTRAINT `FKgvcmyoniq3afmuw56an8t4sl5` FOREIGN KEY (`id_practicante`) REFERENCES `practicante` (`id_practicante`),
  CONSTRAINT `fk_asistencia_practicante` FOREIGN KEY (`id_practicante`) REFERENCES `Practicante` (`id_practicante`)
) ENGINE=InnoDB AUTO_INCREMENT=66 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Asistencia_Diaria`
--

LOCK TABLES `Asistencia_Diaria` WRITE;
/*!40000 ALTER TABLE `Asistencia_Diaria` DISABLE KEYS */;
INSERT INTO `Asistencia_Diaria` VALUES (64,7,'2026-09-28','AUSENTE',0.00,0,'07:30:00','17:00:00',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,'NINGUNA','2026-09-28 22:13:57'),(65,7,'2026-09-30','SIN_MARCAR',0.00,0,'14:00:00','17:00:00',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,'NINGUNA','2026-09-30 07:08:37');
/*!40000 ALTER TABLE `Asistencia_Diaria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Bloque_Horario`
--

DROP TABLE IF EXISTS `Bloque_Horario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Bloque_Horario` (
  `id_bloque` bigint(20) NOT NULL AUTO_INCREMENT,
  `id_practicante` bigint(20) NOT NULL,
  `dia_semana` varchar(10) NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL,
  `tipo_bloque` varchar(20) NOT NULL,
  `descripcion` varchar(100) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date DEFAULT NULL,
  `fecha_creacion` datetime NOT NULL,
  `fecha_actualizacion` datetime DEFAULT NULL,
  PRIMARY KEY (`id_bloque`),
  KEY `FKc5uh4eaxoelgsxtal4qfryqjv` (`id_practicante`),
  CONSTRAINT `FKb2lcwk95dcl1qb6qwm1tniawu` FOREIGN KEY (`id_practicante`) REFERENCES `practicante` (`id_practicante`),
  CONSTRAINT `FKc5uh4eaxoelgsxtal4qfryqjv` FOREIGN KEY (`id_practicante`) REFERENCES `Practicante` (`id_practicante`),
  CONSTRAINT `fk_bloque_practicante` FOREIGN KEY (`id_practicante`) REFERENCES `Practicante` (`id_practicante`)
) ENGINE=InnoDB AUTO_INCREMENT=72 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Bloque_Horario`
--

LOCK TABLES `Bloque_Horario` WRITE;
/*!40000 ALTER TABLE `Bloque_Horario` DISABLE KEYS */;
INSERT INTO `Bloque_Horario` VALUES (67,7,'LUNES','07:30:00','17:00:00','TRABAJO',NULL,1,'2026-09-29','2026-12-31','2026-09-28 22:13:06','2026-09-28 22:13:06'),(68,7,'MIERCOLES','14:00:00','17:00:00','TRABAJO',NULL,1,'2026-09-29','2026-12-31','2026-09-28 22:13:06','2026-09-28 22:13:06'),(69,7,'JUEVES','11:30:00','17:00:00','TRABAJO',NULL,1,'2026-09-29','2026-12-31','2026-09-28 22:13:06','2026-09-28 22:13:06'),(70,7,'VIERNES','07:30:00','17:00:00','TRABAJO',NULL,1,'2026-09-29','2026-12-31','2026-09-28 22:13:06','2026-09-28 22:13:06'),(71,7,'SABADO','07:30:00','13:00:00','TRABAJO',NULL,1,'2026-09-29','2026-12-31','2026-09-28 22:13:06','2026-09-28 22:13:06');
/*!40000 ALTER TABLE `Bloque_Horario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Jornada_Semanal`
--

DROP TABLE IF EXISTS `Jornada_Semanal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Jornada_Semanal` (
  `id_jornada` bigint(20) NOT NULL AUTO_INCREMENT,
  `id_practicante` bigint(20) NOT NULL,
  `semana_inicio` date NOT NULL,
  `horas_requeridas` decimal(5,2) NOT NULL,
  `horas_cumplidas` decimal(5,2) DEFAULT NULL,
  `horas_pendientes` decimal(5,2) DEFAULT NULL,
  `estado_semanal` varchar(20) NOT NULL,
  `observaciones` text DEFAULT NULL,
  `fecha_calculo` datetime NOT NULL,
  PRIMARY KEY (`id_jornada`),
  KEY `FKc25shmobdaf1708vntkfjwptv` (`id_practicante`),
  CONSTRAINT `FK8qo2fd2b0opujv8cpn5x90hwc` FOREIGN KEY (`id_practicante`) REFERENCES `practicante` (`id_practicante`),
  CONSTRAINT `FKc25shmobdaf1708vntkfjwptv` FOREIGN KEY (`id_practicante`) REFERENCES `Practicante` (`id_practicante`),
  CONSTRAINT `fk_jornada_practicante` FOREIGN KEY (`id_practicante`) REFERENCES `Practicante` (`id_practicante`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Jornada_Semanal`
--

LOCK TABLES `Jornada_Semanal` WRITE;
/*!40000 ALTER TABLE `Jornada_Semanal` DISABLE KEYS */;
/*!40000 ALTER TABLE `Jornada_Semanal` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Justificacion`
--

DROP TABLE IF EXISTS `Justificacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Justificacion` (
  `id_justificacion` bigint(20) NOT NULL AUTO_INCREMENT,
  `id_practicante` bigint(20) NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `tipo_justificacion` varchar(20) NOT NULL,
  `motivo` text NOT NULL,
  `archivo_adjunto` varchar(255) DEFAULT NULL,
  `estado` varchar(20) NOT NULL,
  `id_usuario_aprueba` bigint(20) DEFAULT NULL,
  `fecha_aprobacion` datetime DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `fecha_registro` datetime NOT NULL,
  PRIMARY KEY (`id_justificacion`),
  KEY `FKrr701625ee0nvoi7ilmxawtgb` (`id_practicante`),
  CONSTRAINT `FKrr701625ee0nvoi7ilmxawtgb` FOREIGN KEY (`id_practicante`) REFERENCES `Practicante` (`id_practicante`),
  CONSTRAINT `FKt6exv8snp18rwd5u9eii4suyn` FOREIGN KEY (`id_practicante`) REFERENCES `practicante` (`id_practicante`),
  CONSTRAINT `fk_justificacion_practicante` FOREIGN KEY (`id_practicante`) REFERENCES `Practicante` (`id_practicante`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Justificacion`
--

LOCK TABLES `Justificacion` WRITE;
/*!40000 ALTER TABLE `Justificacion` DISABLE KEYS */;
/*!40000 ALTER TABLE `Justificacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Marcacion`
--

DROP TABLE IF EXISTS `Marcacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Marcacion` (
  `id_marcacion` bigint(20) NOT NULL AUTO_INCREMENT,
  `id_practicante` bigint(20) NOT NULL,
  `fecha` date NOT NULL,
  `hora_marcacion` time NOT NULL,
  `tipo_marcacion` varchar(20) NOT NULL,
  `metodo_registro` varchar(20) NOT NULL,
  `codigo_qr` varchar(50) DEFAULT NULL,
  `latitud` double DEFAULT NULL,
  `longitud` double DEFAULT NULL,
  `ip_origen` varchar(45) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `fecha_registro` datetime NOT NULL,
  PRIMARY KEY (`id_marcacion`),
  KEY `FK6t26w5mh6efsgqwqtljw5dfw9` (`id_practicante`),
  CONSTRAINT `FK3sa81sqqx3014tq44qrpcm6xt` FOREIGN KEY (`id_practicante`) REFERENCES `practicante` (`id_practicante`),
  CONSTRAINT `FK6t26w5mh6efsgqwqtljw5dfw9` FOREIGN KEY (`id_practicante`) REFERENCES `Practicante` (`id_practicante`),
  CONSTRAINT `fk_marcacion_practicante` FOREIGN KEY (`id_practicante`) REFERENCES `Practicante` (`id_practicante`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Marcacion`
--

LOCK TABLES `Marcacion` WRITE;
/*!40000 ALTER TABLE `Marcacion` DISABLE KEYS */;
/*!40000 ALTER TABLE `Marcacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Practicante`
--

DROP TABLE IF EXISTS `Practicante`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Practicante` (
  `id_practicante` bigint(20) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `documento` varchar(20) NOT NULL,
  `id_sede` int(11) NOT NULL,
  `id_centro_estudios` bigint(20) NOT NULL,
  `id_tipo_practicante` bigint(20) NOT NULL,
  `situacion` varchar(20) NOT NULL,
  `fecha_desactivacion` datetime DEFAULT NULL,
  `correo_electronico` varchar(100) DEFAULT NULL,
  `telefono` varchar(15) DEFAULT NULL,
  `fecha_inicio_practicas` date NOT NULL,
  `fecha_fin_practicas` date DEFAULT NULL,
  `usuario` varchar(50) NOT NULL,
  `contrasena` varchar(255) NOT NULL,
  `fecha_registro` datetime NOT NULL,
  `fecha_actualizacion` datetime DEFAULT NULL,
  `id_oficina` int(11) NOT NULL,
  PRIMARY KEY (`id_practicante`),
  UNIQUE KEY `usuario` (`usuario`),
  UNIQUE KEY `uk_practicante_documento` (`documento`),
  UNIQUE KEY `UKfpsqor87fm6i6hu5quqv87x22` (`documento`),
  UNIQUE KEY `UKjwfc8475es5mf5knd7sqolrq6` (`documento`),
  KEY `FKdr42ir37aqempxky9b11eevpb` (`id_sede`),
  KEY `fk_practicante_oficina` (`id_oficina`),
  KEY `fk_practicante_tipo_practicante` (`id_tipo_practicante`),
  KEY `fk_practicante_centro` (`id_centro_estudios`),
  CONSTRAINT `FKdr42ir37aqempxky9b11eevpb` FOREIGN KEY (`id_sede`) REFERENCES `sedes` (`IdSede`),
  CONSTRAINT `fk_practicante_centro` FOREIGN KEY (`id_centro_estudios`) REFERENCES `tipo_instituto` (`id_centro_estudios`),
  CONSTRAINT `fk_practicante_oficina` FOREIGN KEY (`id_oficina`) REFERENCES `oficinas` (`IdOficina`),
  CONSTRAINT `fk_practicante_sede` FOREIGN KEY (`id_sede`) REFERENCES `sedes` (`IdSede`),
  CONSTRAINT `fk_practicante_tipo_practicante` FOREIGN KEY (`id_tipo_practicante`) REFERENCES `tipo_practicante` (`id_tipo_practicante`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Practicante`
--

LOCK TABLES `Practicante` WRITE;
/*!40000 ALTER TABLE `Practicante` DISABLE KEYS */;
INSERT INTO `Practicante` VALUES (7,'Carlos Daniel','Daniel Marin Panduro','60563764',3,5,5,'ACTIVO',NULL,'carlos.marin@example.com','900193302','2026-09-29','2026-12-31','60563764','$2a$10$Fk9i6eODwioVB48FPOmm..klBZi2u8wKdfAE7anSKjOKsU4C/R5Am','2026-09-28 22:13:06','2026-09-28 22:13:20',12);
/*!40000 ALTER TABLE `Practicante` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `administradores`
--

DROP TABLE IF EXISTS `administradores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `administradores` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `usuario` varchar(15) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_administradores_usuario` (`usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=517 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `administradores`
--

LOCK TABLES `administradores` WRITE;
/*!40000 ALTER TABLE `administradores` DISABLE KEYS */;
INSERT INTO `administradores` VALUES (1,'administrador','$2b$10$bwgmWuBRvzNNg8PUwX0yxefL0tTwyKFayTPMWf/.VP/v60x9C18JO');
/*!40000 ALTER TABLE `administradores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `asistencia_situacion`
--

DROP TABLE IF EXISTS `asistencia_situacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `asistencia_situacion` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `id_asistencia` bigint(20) NOT NULL,
  `tipo` varchar(35) NOT NULL,
  `motivo` text DEFAULT NULL,
  `observacion` text DEFAULT NULL,
  `hora_salida_anticipada` time DEFAULT NULL,
  `hora_entrada_registrada` time DEFAULT NULL,
  `fecha_registro` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_asistencia_tipo` (`id_asistencia`,`tipo`),
  UNIQUE KEY `UKr46weysvoo33r7aitd1xlda34` (`id_asistencia`,`tipo`),
  CONSTRAINT `fk_situacion_asistencia` FOREIGN KEY (`id_asistencia`) REFERENCES `Asistencia_Diaria` (`id_asistencia`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asistencia_situacion`
--

LOCK TABLES `asistencia_situacion` WRITE;
/*!40000 ALTER TABLE `asistencia_situacion` DISABLE KEYS */;
/*!40000 ALTER TABLE `asistencia_situacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `oficinas`
--

DROP TABLE IF EXISTS `oficinas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `oficinas` (
  `IdOficina` int(11) NOT NULL AUTO_INCREMENT,
  `Oficina` varchar(100) NOT NULL,
  `Estado` int(11) NOT NULL,
  `CREATEDATE` timestamp NOT NULL DEFAULT current_timestamp(),
  `UPDATEDATE` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `IdOficinaSup` int(11) DEFAULT NULL,
  `IdSede` int(11) DEFAULT NULL,
  PRIMARY KEY (`IdOficina`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `oficinas`
--

LOCK TABLES `oficinas` WRITE;
/*!40000 ALTER TABLE `oficinas` DISABLE KEYS */;
INSERT INTO `oficinas` VALUES (1,'Gerencia General',1,'2026-08-19 15:49:34','2026-08-20 21:46:40',0,3),(2,'Jefatura de Administración y Finanzas',1,'2026-08-19 15:49:34','2026-08-19 17:43:53',1,3),(3,'Jefatura de Articulación Comercial',1,'2026-08-19 15:49:34','2026-08-19 17:43:53',1,3),(4,'Jefatura de Contabilidad',1,'2026-08-19 15:49:34','2026-08-19 17:43:53',1,3),(5,'Jefatura de Logística y Servicios',1,'2026-08-19 15:49:34','2026-08-19 17:43:53',1,3),(6,'Jefatura de Patrimonio y Activos Fijos',0,'2026-08-19 15:49:34','2026-08-20 21:24:05',2,3),(7,'Jefatura de Planta KM 37',1,'2026-08-19 15:49:34','2026-08-19 17:43:53',1,2),(8,'Jefatura de Planta KM 60',1,'2026-08-19 15:49:34','2026-08-19 15:49:34',1,1),(9,'Jefatura de Recursos Humanos',1,'2026-08-19 15:49:34','2026-08-19 17:43:53',1,3),(10,'Jefatura de Sostenibilidad y SIG',1,'2026-08-19 15:49:34','2026-08-19 17:43:53',1,3),(11,'Jefatura de SSOMA',1,'2026-08-19 15:49:34','2026-08-19 17:43:53',1,3),(12,'Jefatura de Tecnología de la Información',1,'2026-08-19 15:49:34','2026-08-19 17:43:53',1,3),(14,'Presidencia',1,'2026-08-20 17:29:30','2026-08-20 17:29:59',0,3);
/*!40000 ALTER TABLE `oficinas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sedes`
--

DROP TABLE IF EXISTS `sedes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sedes` (
  `IdSede` int(11) NOT NULL AUTO_INCREMENT,
  `Sede` varchar(45) NOT NULL,
  `Abrev` varchar(7) NOT NULL,
  `Estado` int(11) NOT NULL,
  `CREATEDATE` timestamp NOT NULL DEFAULT current_timestamp(),
  `activo` bit(1) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `fecha_creacion` datetime(6) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  PRIMARY KEY (`IdSede`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sedes`
--

LOCK TABLES `sedes` WRITE;
/*!40000 ALTER TABLE `sedes` DISABLE KEYS */;
INSERT INTO `sedes` VALUES (1,'PLANTA KM 59.8','KM59',1,'2026-06-16 14:40:13','\0','Planta neshuya','2026-06-16 09:40:13.000000','PLANTA KM 59.8'),(2,'PLANTA KM 36.8','KM36',1,'2026-06-16 14:40:13','\0','Planta campoverde','2026-06-16 09:40:13.000000','PLANTA KM 36.8'),(3,'SEDE PUCALLPA','PUC',1,'2026-06-16 14:40:13','\0','Oficina pucallpa','2026-06-16 09:40:13.000000','OFICINA PUCALLPA');
/*!40000 ALTER TABLE `sedes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipo_instituto`
--

DROP TABLE IF EXISTS `tipo_instituto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tipo_instituto` (
  `id_centro_estudios` bigint(20) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `fecha_creacion` datetime NOT NULL,
  PRIMARY KEY (`id_centro_estudios`),
  UNIQUE KEY `nombre` (`nombre`),
  UNIQUE KEY `UKgajasvrso853fkqexegfd70qo` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipo_instituto`
--

LOCK TABLES `tipo_instituto` WRITE;
/*!40000 ALTER TABLE `tipo_instituto` DISABLE KEYS */;
INSERT INTO `tipo_instituto` VALUES (5,'SENATI','Servicio Nacional De Adiestramineto en el Trabajo Industrial',1,'2026-09-28 00:00:00'),(6,'UNIVERSIDAD','Univerdad publica o privada',1,'2026-09-28 00:00:00');
/*!40000 ALTER TABLE `tipo_instituto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipo_practicante`
--

DROP TABLE IF EXISTS `tipo_practicante`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tipo_practicante` (
  `id_tipo_practicante` bigint(20) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `horas_semanales` int(11) NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `fecha_creacion` datetime NOT NULL,
  PRIMARY KEY (`id_tipo_practicante`),
  UNIQUE KEY `nombre` (`nombre`),
  UNIQUE KEY `UKajdj1q254skhgc8efatac20tx` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipo_practicante`
--

LOCK TABLES `tipo_practicante` WRITE;
/*!40000 ALTER TABLE `tipo_practicante` DISABLE KEYS */;
INSERT INTO `tipo_practicante` VALUES (5,'PRACTICANTE PRE PROFESIONAL','Practicante con estudios en cursos',30,1,'2026-09-28 00:00:00'),(6,'PRACTICANTE PROFESIONAL','Practicante egresado',48,1,'2026-09-28 00:00:00');
/*!40000 ALTER TABLE `tipo_practicante` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vigilante`
--

DROP TABLE IF EXISTS `vigilante`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vigilante` (
  `id_vigilante` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `usuario` varchar(50) NOT NULL,
  `contrasena` varchar(255) NOT NULL,
  `Estado` tinyint(1) NOT NULL DEFAULT 1,
  `sede_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_vigilante`),
  UNIQUE KEY `usuario` (`usuario`),
  KEY `FK_vigilante_sede` (`sede_id`),
  CONSTRAINT `FK_vigilante_sede` FOREIGN KEY (`sede_id`) REFERENCES `sedes` (`IdSede`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=244 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vigilante`
--

LOCK TABLES `vigilante` WRITE;
/*!40000 ALTER TABLE `vigilante` DISABLE KEYS */;
INSERT INTO `vigilante` VALUES (232,'Pablito','Ruiz','Prueba','$2a$10$3to4d3kv2lgQZdRoMqvmDOz5/JyDEL5I3/2p7ikE3ow7ct0eC7Pwe',1,3);
/*!40000 ALTER TABLE `vigilante` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'practiqr_db'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-30 14:06:42
