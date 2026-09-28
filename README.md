# Guía de Deploy — PractiQR

> Sistema de control de asistencia de practicantes (OLAMSA)
> Backend: Spring Boot 3.4 + Java + MySQL
> Frontend: Next.js 16 + Node.js
> Servidor: Windows Server (XAMPP + Apache)

---

## Índice

1. [Resumen ejecutivo](#1-resumen-ejecutivo)
2. [Requisitos previos](#2-requisitos-previos)
3. [Estructura de carpetas](#3-estructura-de-carpetas)
4. [FASE A — Base de datos](#fase-a--base-de-datos)
5. [FASE B — Backend (Spring Boot)](#fase-b--backend-spring-boot)
6. [FASE C — Frontend (Next.js)](#fase-c--frontend-nextjs)
7. [FASE D — Apache (XAMPP)](#fase-d--apache-xampp)
8. [FASE E — Firewall Windows](#fase-e--firewall-windows)
9. [FASE F — Validación final](#fase-f--validación-final)
10. [Anexos](#anexos)

---

## 1. Resumen ejecutivo

Este documento describe los pasos exactos para desplegar **PractiQR** en el servidor
Windows de OLAMSA, bajo el subdominio:

```
https://practiqr.olamsa.pe.com
```

**Arquitectura final:**

```
Internet / Red interna
        │
        ▼
   [Apache XAMPP :443]  ← SSL wildcard *.olamsa.pe.com
        │
        ├── /  ──────────►  Proxy a 127.0.0.1:3000  (Frontend Next.js)
        │
        └── (Next.js hace rewrite interno de /api → 127.0.0.1:8080)
                                │
                                ▼
                        [Spring Boot :8080]
                                │
                                ▼
                        [MySQL one_db]
```

**Servicios Windows (NSSM):**
- `PractiqrBackend` → corre el JAR de Spring Boot.
- `PractiqrFrontend` → corre `node server.js`.

---

## 2. Requisitos previos

### 2.1 Software a instalar

| Software | Versión | Propósito |
|---|---|---|
| **Java** | 17 o 21 (ver nota) | Backend |
| **Node.js** | 20 LTS o 22 LTS | Frontend |
| **NSSM** | 2.24+ | Servicios Windows |
| **7-Zip** o **WinRAR** | Cualquiera | Descomprimir `.zip` |
| **Visual C++ Redistributable** | 2015-2022 x64 | Requerido por Java/Node |

### 2.2 Software ya existente (no tocar)

- **XAMPP** → Apache + MySQL/MariaDB (varios sistemas corriendo).
- **Certificado SSL wildcard** `*.olamsa.pe.com`.

### 2.3 ⚠️ Nota sobre Windows Server 2012

Windows Server 2012 está **sin soporte desde octubre 2023**.

**Recomendación firme:**
- Si el servidor **se actualiza a 2019/2022** → instalar **Java 21** + **Node 22 LTS**.
- Si **se queda en 2012** → instalar **Java 17** + **Node 20 LTS** (más estables).

En caso de duda, **elegir Java 17 + Node 20 LTS**. Funcionan en ambas versiones de Windows.

### 2.4 Comandos de instalación

**Java (elegir uno):**

- Java 17: https://adoptium.net/temurin/releases/?version=17
  - Descargar `OpenJDK17U-jdk_x64_windows_hotspot_17.x.x.msi`
- Java 21: https://adoptium.net/temurin/releases/?version=21
  - Descargar `OpenJDK21U-jdk_x64_windows_hotspot_21.x.x.msi`

Instalar con opciones por defecto. **Marcar "Add to PATH"** y "Set JAVA_HOME variable".

Verificar en CMD:
```cmd
java -version
```

Debe mostrar `openjdk version "17.x.x"` o `"21.x.x"`.

**Node.js:**

- Descargar Node 20 LTS: https://nodejs.org/en/download
  - O Node 22 LTS si el server es 2019/2022.
- Instalar con opciones por defecto.

Verificar en CMD:
```cmd
node -v
npm -v
```

Debe mostrar `v20.x.x` y `10.x.x`.

**NSSM:**

- Descargar: https://nssm.cc/download
- Descomprimir en `C:\nssm\`.
- Verificar que existe `C:\nssm\win64\nssm.exe`.

---

## 3. Estructura de carpetas

Crear en el servidor:

```
C:\practiqr\
├── backend\
│   └── attendance-system-0.0.1-SNAPSHOT.jar
├── frontend\
│   ├── server.js
│   ├── package.json
│   ├── node_modules\
│   ├── public\
│   ├── .next\
│   └── .env.production
├── logs\
│   ├── backend.log
│   ├── backend-error.log
│   ├── frontend.log
│   └── frontend-error.log
└── scripts\
    ├── script-creacion-tablas.sql
    └── variables-entorno.txt
```

Comando en CMD (como Administrador):

```cmd
mkdir C:\practiqr
mkdir C:\practiqr\backend
mkdir C:\practiqr\frontend
mkdir C:\practiqr\logs
mkdir C:\practiqr\scripts
```

---

## FASE A — Base de datos

### A.1 Backup de `one_db`

**Antes de tocar nada.** Ejecutar en CMD:

```cmd
cd C:\xampp\mysql\bin
mysqldump -u root one_db > C:\practiqr\scripts\backup_one_db_YYYY-MM-DD.sql
```

(si root tiene contraseña, agregar `-p` y escribirla al prompt)

Verificar que el archivo se generó:

```cmd
dir C:\practiqr\scripts\
```

### A.2 Crear usuario dedicado `practiqr_app`

**NO usar root para la app.** Desde phpMyAdmin o consola MySQL:

```sql
CREATE USER 'practiqr_app'@'localhost' IDENTIFIED BY 'PONER_PASSWORD_FUERTE_AQUI';
GRANT SELECT, INSERT, UPDATE, DELETE ON one_db.* TO 'practiqr_app'@'localhost';
FLUSH PRIVILEGES;
```

**Importante:** la app solo necesita esos 4 permisos (no DDL, porque `ddl-auto=validate`).
Guardar la contraseña generada en un lugar seguro.

### A.3 Aplicar script de creación de tablas

**Opción A — phpMyAdmin:**
1. Abrir phpMyAdmin.
2. Seleccionar base de datos `one_db`.
3. Ir a pestaña **SQL**.
4. Pegar el contenido completo de `script-creacion-tablas.sql`.
5. Click en **Continuar**.

**Opción B — consola CMD:**
```cmd
cd C:\xampp\mysql\bin
mysql -u root one_db < C:\practiqr\scripts\script-creacion-tablas.sql
```

### A.4 Verificar que se crearon las tablas

En phpMyAdmin, ejecutar:

```sql
SHOW TABLES;
```

Debe mostrar (además de las existentes `sedes`, `oficinas`, `trabajadores`):

```
Centro_estudios
Cargo
vigilante
Practicante
Bloque_Horario
Jornada_Semanal
Justificacion
Marcacion
Asistencia_Diaria
asistencia_situacion
```

Verificar que **`sedes` y `oficinas` siguen intactas**:

```sql
SELECT COUNT(*) FROM sedes;
SELECT COUNT(*) FROM oficinas;
```

Los conteos deben coincidir con los que había antes del backup.

---

## FASE B — Backend (Spring Boot)

### B.1 Copiar el JAR

1. Descomprimir `practiqr-backend.zip` en `C:\practiqr\backend\`.
2. Verificar que existe:

```cmd
dir C:\practiqr\backend\
```

Debe mostrar `attendance-system-0.0.1-SNAPSHOT.jar`.

### B.2 Generar JWT_SECRET

**En el servidor**, abrir CMD y ejecutar:

```cmd
powershell -Command "[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))"
```

Copiar el resultado (algo tipo `oV4nN/K9PhjEa6j6...`). **Guardarlo bien**, no compartirlo.

**Alternativa:** si el servidor tiene OpenSSL instalado:
```cmd
openssl rand -base64 48
```

### B.3 Probar el JAR manualmente

**Antes de crear el servicio NSSM**, probar que arranca:

```cmd
cd C:\practiqr\backend

set SPRING_PROFILES_ACTIVE=prod
set JWT_SECRET=PEGAR_AQUI_EL_SECRET_GENERADO
set JWT_COOKIE_SECURE=true
set DB_URL=jdbc:mysql://127.0.0.1:3306/one_db?useSSL=false&serverTimezone=America/Lima&allowPublicKeyRetrieval=true&zeroDateTimeBehavior=convertToNull
set DB_USERNAME=practiqr_app
set DB_PASSWORD=PEGAR_AQUI_LA_PASSWORD_DEL_USUARIO
set CORS_ALLOWED_ORIGINS=https://practiqr.olamsa.pe.com
set practiqr.auth.rrhh-worker-ids=87

java -jar attendance-system-0.0.1-SNAPSHOT.jar
```

**Lo que debe pasar:**
- Spring Boot arranca.
- Se conecta a MySQL.
- Muestra `Started AttendanceSystemApplication in X seconds`.
- Queda escuchando en el puerto 8080.

**Si falla:**
- `Communications link failure` → MySQL no está corriendo o las credenciales están mal.
- `JWT secret must be at least 32 bytes` → el JWT_SECRET es muy corto.
- `Table 'one_db.xxx' doesn't exist` → el script SQL no se aplicó bien.

Si arranca bien, presionar `Ctrl+C` para detener.

### B.4 Crear servicio NSSM

Abrir CMD **como Administrador**:

```cmd
C:\nssm\win64\nssm.exe install PractiqrBackend
```

Se abre una ventana. Rellenar:

**Pestaña "Application":**
- **Path**: `C:\Program Files\Eclipse Adoptium\jdk-17.x.x-hotspot\bin\java.exe`
  (o donde hayas instalado Java; en Windows suele ser `C:\Program Files\Java\jdk-17\bin\java.exe`)
- **Startup directory**: `C:\practiqr\backend`
- **Arguments**: `-jar attendance-system-0.0.1-SNAPSHOT.jar`

**Pestaña "Details":**
- **Display name**: `PractiQR Backend`
- **Description**: `Backend Spring Boot del sistema PractiQR`
- **Startup type**: `Automatic`

**Pestaña "I/O":**
- **Output (stdout)**: `C:\practiqr\logs\backend.log`
- **Error (stderr)**: `C:\practiqr\logs\backend-error.log`

**Pestaña "Environment":** (agregar una por una)

```
SPRING_PROFILES_ACTIVE=prod
JWT_SECRET=<el generado en B.2>
JWT_COOKIE_SECURE=true
DB_URL=jdbc:mysql://127.0.0.1:3306/one_db?useSSL=false&serverTimezone=America/Lima&allowPublicKeyRetrieval=true&zeroDateTimeBehavior=convertToNull
DB_USERNAME=practiqr_app
DB_PASSWORD=<la password del usuario MySQL>
CORS_ALLOWED_ORIGINS=https://practiqr.olamsa.pe.com
practiqr.auth.rrhh-worker-ids=87
```

**Pestaña "Exit actions":**
- **Restart**: `Restart application`
- **Delay**: `5000` ms

Click en **"Install service"**.

Iniciar el servicio:

```cmd
net start PractiqrBackend
```

Verificar:

```cmd
sc query PractiqrBackend
```

Debe mostrar `STATE : 4 RUNNING`.

Verificar que responde:

```cmd
curl http://127.0.0.1:8080/health
```

Debe devolver algo tipo `{"status":"UP"}`.

---

## FASE C — Frontend (Next.js)

### C.1 Copiar el standalone

1. Descomprimir `practiqr-frontend.zip` en `C:\practiqr\frontend\`.
2. Verificar que existen:

```cmd
dir C:\practiqr\frontend\
```

Debe mostrar `server.js`, `package.json`, `node_modules\`, `public\`, `.next\`.

### C.2 Probar el frontend manualmente

**Antes de crear el servicio NSSM:**

```cmd
cd C:\practiqr\frontend

set NODE_ENV=production
set PORT=3000
set BACKEND_URL=http://127.0.0.1:8080

node server.js
```

**Lo que debe pasar:**
```
▲ Next.js 16.2.10
- Local:        http://localhost:3000
- Network:      http://0.0.0.0:3000
✓ Ready in XXXms
```

Abrir en el navegador `http://localhost:3000`. Debe cargar el login.

Si arranca bien, `Ctrl+C` para detener.

### C.3 Crear servicio NSSM

```cmd
C:\nssm\win64\nssm.exe install PractiqrFrontend
```

**Pestaña "Application":**
- **Path**: `C:\Program Files\nodejs\node.exe`
- **Startup directory**: `C:\practiqr\frontend`
- **Arguments**: `server.js`

**Pestaña "Details":**
- **Display name**: `PractiQR Frontend`
- **Description**: `Frontend Next.js del sistema PractiQR`
- **Startup type**: `Automatic`

**Pestaña "I/O":**
- **Output**: `C:\practiqr\logs\frontend.log`
- **Error**: `C:\practiqr\logs\frontend-error.log`

**Pestaña "Environment":**
```
NODE_ENV=production
PORT=3000
BACKEND_URL=http://127.0.0.1:8080
```

**Pestaña "Exit actions":**
- **Restart**: `Restart application`
- **Delay**: `5000` ms

Click en **"Install service"**.

Iniciar:

```cmd
net start PractiqrFrontend
```

Verificar:

```cmd
curl http://127.0.0.1:3000
```

Debe devolver HTML del login.

---

## FASE D — Apache (XAMPP)

### D.1 Verificar que los puertos 3000 y 8080 no estén expuestos al exterior

Los servicios corren en `127.0.0.1`. Apache hará el proxy.

### D.2 Crear vhost para el subdominio

Editar `C:\xampp\apache\conf\extra\httpd-vhosts.conf` y agregar al final:

```apache
# ═══════════════════════════════════════════════════════════
# PractiQR — Subdominio
# ═══════════════════════════════════════════════════════════
<VirtualHost *:443>
    ServerName practiqr.olamsa.pe.com
    ServerAlias practiqr.olamsa.pe.com

    # SSL (ajustar rutas al certificado wildcard existente)
    SSLEngine on
    SSLCertificateFile "C:/xampp/apache/conf/ssl/olamsa.crt"
    SSLCertificateKeyFile "C:/xampp/apache/conf/ssl/olamsa.key"
    SSLCertificateChainFile "C:/xampp/apache/conf/ssl/olamsa-chain.crt"

    # Logs
    ErrorLog "C:/xampp/apache/logs/practiqr-error.log"
    CustomLog "C:/xampp/apache/logs/practiqr-access.log" combined

    # Proxy al frontend Next.js
    ProxyPreserveHost On
    ProxyRequests Off
    ProxyPass / http://127.0.0.1:3000/
    ProxyPassReverse / http://127.0.0.1:3000/

    # Headers para que Next.js sepa que viene de HTTPS
    RequestHeader set X-Forwarded-Proto "https"
    RequestHeader set X-Forwarded-Port "443"
</VirtualHost>

# Redirección HTTP → HTTPS
<VirtualHost *:80>
    ServerName practiqr.olamsa.pe.com
    Redirect permanent / https://practiqr.olamsa.pe.com/
</VirtualHost>
```

**⚠️ Importante:**
- Ajustar las rutas del certificado SSL a las reales del servidor.
- El bloque va al **final** del archivo, para no romper otros vhosts.
- **NO** agregar `ProxyPass /api` → Next.js hace ese rewrite internamente.

### D.3 Verificar que los módulos Apache estén activos

En `C:\xampp\apache\conf\httpd.conf`, verificar que estén descomentadas estas líneas:

```apache
LoadModule proxy_module modules/mod_proxy.so
LoadModule proxy_http_module modules/mod_proxy_http.so
LoadModule headers_module modules/mod_headers.so
LoadModule ssl_module modules/mod_ssl.so
```

Y que exista:

```apache
Include conf/extra/httpd-vhosts.conf
```

### D.4 Reiniciar Apache

Desde el panel de XAMPP, click en **Stop** Apache, luego **Start**.

O desde CMD:

```cmd
C:\xampp\apache\bin\httpd.exe -k restart
```

Verificar que no haya errores en `C:\xampp\apache\logs\error.log`.

### D.5 Verificar resolución DNS

En CMD:

```cmd
nslookup practiqr.olamsa.pe.com
```

Debe resolver a la IP del servidor. Si no resuelve, avisar a IT.

---

## FASE E — Firewall Windows

### E.1 Abrir puerto 443 (HTTPS)

```cmd
netsh advfirewall firewall add rule name="PractiQR HTTPS" dir=in action=allow protocol=TCP localport=443
```

### E.2 Verificar que 8080, 3000 y 3306 NO estén abiertos al exterior

```cmd
netsh advfirewall firewall show rule name=all | findstr "8080"
netsh advfirewall firewall show rule name=all | findstr "3000"
netsh advfirewall firewall show rule name=all | findstr "3306"
```

Si aparecen reglas abriendo esos puertos, **deshabilitarlas** o restringirlas a `127.0.0.1`:

```cmd
netsh advfirewall firewall delete rule name="NOMBRE_DE_LA_REGLA"
```

---

## FASE F — Validación final

### F.1 Verificar los servicios

```cmd
sc query PractiqrBackend
sc query PractiqrFrontend
```

Ambos deben mostrar `RUNNING`.

### F.2 Verificar localmente

```cmd
curl http://127.0.0.1:8080/health
curl http://127.0.0.1:3000
```

Ambos deben responder.

### F.3 Verificar desde fuera del servidor

Desde otro PC de la red o desde tu Mac:

```
https://practiqr.olamsa.pe.com
```

Debe cargar el login.

### F.4 Probar el flujo completo

1. **Login con RRHH** → entrar al dashboard.
2. **Verificar que carga la lista de practicantes.**
3. **Generar un PDF/Excel de prueba.**
4. **Login con VIGILANTE** → probar marcación.
5. **Login con PRACTICANTE** → ver su información.

### F.5 Verificar el scheduler

El backend tiene un `@Scheduled` que corre cada minuto (cierre de jornada).

```cmd
type C:\practiqr\logs\backend.log | findstr "cierreAutomatico"
```

Debe aparecer actividad periódica.

### F.6 Verificar logs

```cmd
type C:\practiqr\logs\backend.log
type C:\practiqr\logs\backend-error.log
type C:\practiqr\logs\frontend.log
type C:\practiqr\logs\frontend-error.log
```

Sin errores graves.

---

## Anexos

### A. Comandos útiles

**Reiniciar servicios:**
```cmd
net stop PractiqrBackend
net start PractiqrBackend
```

**Ver logs en vivo (PowerShell):**
```powershell
Get-Content C:\practiqr\logs\backend.log -Wait -Tail 50
```

**Desinstalar servicio NSSM (si algo falla):**
```cmd
C:\nssm\win64\nssm.exe remove PractiqrBackend confirm
```

### B. Rollback

Si algo falla después del deploy:

1. **Backend:** restaurar JAR anterior (guardar copia antes de actualizar).
2. **Frontend:** restaurar carpeta `.next/standalone` anterior.
3. **DB:** restaurar desde el backup:
   ```cmd
   mysql -u root one_db < C:\practiqr\scripts\backup_one_db_YYYY-MM-DD.sql
   ```

### C. Troubleshooting

| Síntoma | Causa probable | Solución |
|---|---|---|
| Backend no arranca | DB no accesible | Verificar `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` |
| Backend no arranca | JWT_SECRET corto | Usar uno de 48+ bytes |
| Backend no arranca | Tabla faltante | Aplicar script SQL completo |
| Frontend no carga | Puerto 3000 ocupado | `netstat -ano \| findstr :3000` |
| Frontend da 502 | Backend caído | `sc query PractiqrBackend` |
| Login falla | CORS mal | `CORS_ALLOWED_ORIGINS` debe coincidir exacto |
| Cookie no se guarda | `JWT_COOKIE_SECURE=false` en HTTPS | Poner `true` |
| Imágenes no cargan | `sharp` faltante | Ya está `unoptimized: true`, no requiere sharp |
| Apache no arranca | vhost mal escrito | Revisar `httpd-vhosts.conf` |

### D. Contacto

- **Desarrollador:** Carlos Marín
- **Servidor:** Windows Server (OLAMSA)
- **Repositorio:** CONTROL_ASISTENCIA

---

## APÉNDICE — Script SQL de creación de tablas

```sql
-- ═══════════════════════════════════════════════════════════
-- PractiQR — Script de creación de tablas
-- Base de datos: one_db
-- Motor: InnoDB | Charset: utf8mb4 | Collation: utf8mb4_general_ci
--
-- ⚠️ INSTRUCCIONES:
--   1. HACER BACKUP de one_db antes de ejecutar esto.
--   2. Ejecutar como root o usuario con permisos DDL en one_db.
--   3. Este script es IDEMPOTENTE: usa CREATE TABLE IF NOT EXISTS,
--      no rompe tablas existentes (sedes, oficinas, trabajadores).
-- ═══════════════════════════════════════════════════════════

USE one_db;

-- ----------------------------------------------------------------
-- Centro_estudios  (sin dependencias)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Centro_estudios` (
  `id_centro_estudios` BIGINT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(50) NOT NULL,
  `descripcion` VARCHAR(255) NULL,
  `activo` TINYINT(1) NOT NULL,
  `fecha_creacion` DATETIME NOT NULL,
  PRIMARY KEY (`id_centro_estudios`),
  UNIQUE KEY `uk_centro_estudios_nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------------------------------------------
-- Cargo  (sin dependencias)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Cargo` (
  `id_cargo` BIGINT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(50) NOT NULL,
  `descripcion` VARCHAR(255) NULL,
  `horas_semanales` INT NOT NULL,
  `activo` TINYINT(1) NOT NULL,
  `fecha_creacion` DATETIME NOT NULL,
  PRIMARY KEY (`id_cargo`),
  UNIQUE KEY `uk_cargo_nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------------------------------------------
-- vigilante  (FK -> sedes)
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------------------------------------------
-- Practicante  (FK -> sedes, oficinas, Centro_estudios, Cargo)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Practicante` (
  `id_practicante` BIGINT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  `apellido` VARCHAR(100) NOT NULL,
  `documento` VARCHAR(20) NOT NULL,
  `id_sede` INT NOT NULL,
  `id_oficina` INT NOT NULL,
  `id_centro_estudios` BIGINT NOT NULL,
  `id_cargo` BIGINT NOT NULL,
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
    REFERENCES `Centro_estudios` (`id_centro_estudios`)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_practicante_cargo` FOREIGN KEY (`id_cargo`)
    REFERENCES `Cargo` (`id_cargo`)
    ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------------------------------------------
-- Bloque_Horario  (FK -> Practicante)
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------------------------------------------
-- Jornada_Semanal  (FK -> Practicante)
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------------------------------------------
-- Justificacion  (FK -> Practicante)
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------------------------------------------
-- Marcacion  (FK -> Practicante)
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------------------------------------------
-- Asistencia_Diaria  (FK -> Practicante)
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------------------------------------------
-- asistencia_situacion  (FK -> Asistencia_Diaria)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `asistencia_situacion` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `id_asistencia` BIGINT NOT NULL,
  `t
