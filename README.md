# Guía de Deploy — PractiQR

> Sistema de control de asistencia de practicantes (OLAMSA)
> Backend: Spring Boot 3.4 + Java 21 + MySQL
> Frontend: Next.js 16 (standalone) + Node.js
> Servidor: Windows Server (XAMPP + Apache)

> **URL objetivo de producción:** `https://one.olamsa.com.pe/PractiQR`
> La configuración real de DNS, Apache y HTTPS del servidor debe verificarse
> durante el despliegue. Nada de este documento asume que ya está configurado.

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
10. [Checklist pre go-live](#checklist-pre-go-live)
11. [Anexos](#anexos)

---

## 1. Resumen ejecutivo

**Arquitectura final:**

```
Internet
   │
   │ HTTPS :443
   ▼
[Apache XAMPP]  ← certificado del dominio existente
   │
   │ /PractiQR/   (Apache retira el prefijo al reenviar)
   ▼
[Next.js :3000]  (standalone, interno)
   │
   │ /api/*  (rewrite interno de Next.js)
   ▼
[Spring Boot :8080]  (interno)
   │
   ▼
[MySQL practiqr_db]  (interno)
```

- Apache es el único punto público. Los puertos `3000`, `8080` y `3306` permanecen internos.
- El navegador nunca accede directo a `8080`: usa `/api` en mismo origen; Next.js reenvía a Spring Boot.
- El backend es agnóstico al prefijo: **NO** se configura `server.servlet.context-path=/PractiQR`.

**Servicios Windows (NSSM):**
- `PractiqrBackend` → JAR de Spring Boot.
- `PractiqrFrontend` → `node .next/standalone/server.js`.

---

## 2. Requisitos previos

### 2.1 Software a instalar

| Software | Versión | Propósito |
|---|---|---|
| **Java** | 21 (Temurin/Adoptium) | Backend |
| **Node.js** | LTS compatible con Next.js 16 (20 LTS o 22 LTS) | Frontend |
| **NSSM** | 2.24+ | Servicios Windows |
| **7-Zip** o **WinRAR** | Cualquiera | Descomprimir `.zip` |
| **Visual C++ Redistributable** | 2015-2022 x64 | Requerido por Java/Node |

> Desarrollo local usó Node 24, pero **no** se exige Node 24 en producción.
> Instalar una versión LTS compatible con Next.js 16 (20 o 22 LTS).

### 2.2 Software ya existente (no tocar)

- **XAMPP** → Apache + MySQL/MariaDB (otros sistemas corriendo).
- **Certificado SSL** del dominio existente (verificar rutas reales en el servidor).

### 2.3 Comandos de instalación

**Java 21:** https://adoptium.net/temurin/releases/?version=21
- Descargar `OpenJDK21U-jdk_x64_windows_hotspot_21.x.x.msi`
- Instalar con opciones por defecto. **Marcar "Add to PATH"** y "Set JAVA_HOME variable".
- Verificar en CMD: `java -version` → debe mostrar `openjdk version "21.x.x"`.

**Node.js LTS:** https://nodejs.org/en/download
- Instalar con opciones por defecto. Verificar: `node -v` y `npm -v`.

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
│   ├── server.js              (de .next/standalone)
│   ├── package.json           (de .next/standalone)
│   ├── node_modules\          (de .next/standalone)
│   ├── .next\                 (de .next/standalone + .next/static copiado)
│   └── public\
├── logs\
│   ├── backend.log
│   ├── backend-error.log
│   ├── frontend.log
│   └── frontend-error.log
└── scripts\
    └── variables-entorno.txt  (SOLO nombres de variables, SIN secretos)
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

La base de producción es **`practiqr_db`**. No existe dependencia de ninguna otra base.

### A.1 Backup de `practiqr_db`

**Antes de tocar nada.** Ejecutar en CMD:

```cmd
cd C:\xampp\mysql\bin
mysqldump -u root practiqr_db > C:\practiqr\scripts\backup_practiqr_db_YYYY-MM-DD.sql
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
GRANT SELECT, INSERT, UPDATE, DELETE ON practiqr_db.* TO 'practiqr_app'@'localhost';
FLUSH PRIVILEGES;
```

**Importante:** la app solo necesita esos 4 permisos (sin DDL).
Spring usa `ddl-auto=validate`: valida que el esquema exista, pero nunca crea
ni modifica tablas. Guardar la contraseña en un lugar seguro.

### A.3 Verificar tablas esperadas

```sql
SHOW TABLES FROM practiqr_db;
```

Deben existir, entre otras: `administradores`, `Practicante`, `vigilante`,
`tipo_practicante`, `tipo_instituto`, `sedes`, `oficinas`, `Asistencia_Diaria`,
`Marcacion`, `Bloque_Horario`, `Jornada_Semanal`, `Justificacion`,
`asistencia_situacion`.

Modelo actual (referencia):
- `administradores(id, usuario UNIQUE, password_hash)` → autenticación RRHH.
- `Practicante.id_tipo_practicante → tipo_practicante.id_tipo_practicante`.
- `Practicante.id_centro_estudios → tipo_instituto.id_centro_estudios`
  (la columna conserva su nombre histórico; la tabla es `tipo_instituto`).

### A.4 Datos iniciales

Estado de referencia conocido:

```text
administradores: 219 actualmente → objetivo: 1 RRHH (ver REQUISITO PRE-GO-LIVE)
sedes: 3 | practicantes: 1 | vigilantes: 0
```

> **REQUISITO PRE-GO-LIVE:** depurar los registros administrativos y conservar
> únicamente el RRHH autorizado. Esta limpieza la ejecuta el responsable de datos
> en el servidor. Por seguridad, esta guía no incluye sentencias de borrado.

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
Debe tener al menos 32 bytes: la app no arranca sin un secreto válido.

**Alternativa:** si el servidor tiene OpenSSL instalado:
```cmd
openssl rand -base64 48
```

> `JWT_SECRET` es la clave privada del servidor para firmar los JWT.
> No es el token de ningún usuario. Nunca va en Git ni en `.properties`.

### B.3 Variables de entorno requeridas

La app lee configuración por entorno. Sin estas variables (con perfil `prod`)
**no arranca** a propósito:

```text
SPRING_PROFILES_ACTIVE=prod
DB_URL=jdbc:mysql://127.0.0.1:3306/practiqr_db?useSSL=false&serverTimezone=America/Lima&allowPublicKeyRetrieval=true&zeroDateTimeBehavior=convertToNull
DB_USERNAME=practiqr_app
DB_PASSWORD=<secreto>
JWT_SECRET=<secreto de al menos 32 bytes>
CORS_ALLOWED_ORIGINS=https://one.olamsa.com.pe
```

Notas:
- `CORS_ALLOWED_ORIGINS` es scheme + host (+ puerto si aplica). **Sin paths**:
  `https://one.olamsa.com.pe`, nunca con `/PractiQR`.
- La cookie JWT (`practiqr_token`) se configura `Secure=true` mediante el perfil
  `application-prod.properties`. No existe variable `JWT_COOKIE_SECURE`.
- La autenticación RRHH usa la tabla `administradores`. No existe ninguna
  propiedad de whitelist de trabajadores en el código actual.

### B.4 Probar el JAR manualmente

**Antes de crear el servicio NSSM**, probar que arranca:

```cmd
cd C:\practiqr\backend

set SPRING_PROFILES_ACTIVE=prod
set JWT_SECRET=PEGAR_AQUI_EL_SECRET_GENERADO
set DB_URL=jdbc:mysql://127.0.0.1:3306/practiqr_db?useSSL=false&serverTimezone=America/Lima&allowPublicKeyRetrieval=true&zeroDateTimeBehavior=convertToNull
set DB_USERNAME=practiqr_app
set DB_PASSWORD=PEGAR_AQUI_LA_PASSWORD_DEL_USUARIO
set CORS_ALLOWED_ORIGINS=https://one.olamsa.com.pe

java -jar attendance-system-0.0.1-SNAPSHOT.jar
```

**Lo que debe pasar:**
- Spring Boot arranca.
- Se conecta a MySQL (`practiqr_db`).
- Valida el esquema (`ddl-auto=validate`, sin modificarlo).
- Muestra `Started AttendanceSystemApplication in X seconds`.
- Queda escuchando en el puerto 8080 (interno).

**Si falla:**
- `Communications link failure` → MySQL no está corriendo o las credenciales están mal.
- Error de secreto JWT → el `JWT_SECRET` es muy corto o falta.
- `Table 'practiqr_db.xxx' doesn't exist` → falta aplicar el esquema en la BD.
- Error de placeholder `${DB_...}` → falta alguna variable de entorno.

Si arranca bien, presionar `Ctrl+C` para detener.

### B.5 Crear servicio NSSM

Abrir CMD **como Administrador**:

```cmd
C:\nssm\win64\nssm.exe install PractiqrBackend
```

Se abre una ventana. Rellenar:

**Pestaña "Application":**
- **Path**: `C:\Program Files\Eclipse Adoptium\jdk-21.x.x-hotspot\bin\java.exe`
  (o donde hayas instalado Java 21)
- **Startup directory**: `C:\practiqr\backend`
- **Arguments**: `-jar attendance-system-0.0.1-SNAPSHOT.jar`

**Pestaña "Details":**
- **Display name**: `PractiQR Backend`
- **Description**: `Backend Spring Boot del sistema PractiQR`
- **Startup type**: `Automatic`

**Pestaña "I/O":**
- **Output (stdout)**: `C:\practiqr\logs\backend.log`
- **Error (stderr)**: `C:\practiqr\logs\backend-error.log`

**Pestaña "Environment":** (agregar una por una, con valores reales del servidor)

```
SPRING_PROFILES_ACTIVE=prod
JWT_SECRET=<el generado en B.2>
DB_URL=jdbc:mysql://127.0.0.1:3306/practiqr_db?useSSL=false&serverTimezone=America/Lima&allowPublicKeyRetrieval=true&zeroDateTimeBehavior=convertToNull
DB_USERNAME=practiqr_app
DB_PASSWORD=<la password del usuario MySQL>
CORS_ALLOWED_ORIGINS=https://one.olamsa.com.pe
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

Verificar que responde (interno):

```cmd
curl http://127.0.0.1:8080/health
```

Debe devolver algo tipo `{"status":"UP"}`.

> El servidor NO necesita IntelliJ IDEA, Maven ni Spring Boot instalado:
> solo Java 21 para ejecutar el JAR ya compilado.

---

## FASE C — Frontend (Next.js)

El proyecto usa `output: "standalone"`. La opción de producción es el servidor
standalone generado, no `npm start` del proyecto completo.

### C.1 Copiar el standalone

1. Ejecutar `npm run build` en el proyecto (genera `.next/`).
2. Copiar al servidor dentro de `C:\practiqr\frontend\`:
   - Contenido de `.next/standalone` (`server.js`, `package.json`, `node_modules\`).
   - Carpeta `.next/static` (recursos JS/CSS generados).
   - Carpeta `public\` (imágenes y estáticos).
3. Verificar que existen `server.js`, `.next\`, `public\`.

### C.2 Variables del frontend

El frontend utiliza:

```text
NODE_ENV=production
PORT=3000
BACKEND_URL=http://127.0.0.1:8080
NEXT_PUBLIC_API_URL=/api
```

- `NEXT_PUBLIC_API_URL=/api` va incorporado en el build: el navegador llama
  en mismo origen y Next.js hace rewrite server-side hacia Spring Boot.
- `BACKEND_URL` es la dirección interna del backend para esos rewrites.
- El backend nunca se expone directamente al navegador.

### C.3 Probar el frontend manualmente

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
✓ Ready in XXXms
```

Abrir en el navegador `http://localhost:3000`. Debe cargar el login.

Si arranca bien, `Ctrl+C` para detener.

### C.4 Crear servicio NSSM

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

> **Configuración objetivo** (verificar contra el `httpd-vhosts.conf` real del servidor).
> Nada de esta sección asume que Apache ya está configurado.

### D.1 Puertos internos

Los servicios corren en `127.0.0.1` (`3000`, `8080`, `3306`). Solo el 443 es público.

### D.2 Crear vhost con path `/PractiQR`

Editar `C:\xampp\apache\conf\extra\httpd-vhosts.conf` y agregar al final un
`VirtualHost *:443` para el dominio existente, con:

- `ServerName one.olamsa.com.pe` (verificar el dominio real en el servidor).
- SSL con el certificado existente (ajustar rutas reales).
- Regla que exponga `/PractiQR/` haciendo proxy a `http://127.0.0.1:3000/`
  **retirando el prefijo**, de modo que Next.js siga funcionando sin `basePath`.
- Logs dedicados (`practiqr-error.log`, `practiqr-access.log`).
- Headers `X-Forwarded-Proto "https"` (y puerto si aplica).
- Redirección `*:80 → https`.

**⚠️ Importante:**
- Ajustar dominio, certificado y prefijo a lo real del servidor.
- El bloque va al **final** del archivo, para no romper otros vhosts/sistemas PHP.
- **NO** configurar Apache para enviar `/PractiQR/api` directo a Spring Boot:
  el flujo es `Browser → /PractiQR/api → Next.js → rewrite → Spring :8080`.
  Esto mantiene mismo origen para cookies (`practiqr_token`) y CSRF.
- **NO** configurar `server.servlet.context-path=/PractiQR` en Spring:
  el backend es agnóstico al prefijo si Apache lo retira.

### D.3 Verificar que los módulos Apache estén activos

En `C:\xampp\apache\conf\httpd.conf`, verificar descomentadas:

```apache
LoadModule proxy_module modules/mod_proxy.so
LoadModule proxy_http_module modules/mod_proxy_http.so
LoadModule headers_module modules/mod_headers.so
LoadModule ssl_module modules/mod_ssl.so
```

(más `rewrite_module` solo si la implementación del strip lo requiere).
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

### D.5 Verificar el dominio real

Verificar que `one.olamsa.com.pe` resuelve al servidor (DNS pendiente del entorno
real; no se afirma aquí que ya esté configurado).

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

Idealmente estos servicios escuchan ligados a loopback.

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

- `/health` → `{"status":"UP"}` (también existe `/health/ping`).
- `:3000` → HTML del login.

### F.3 Verificar desde fuera del servidor

Desde otro PC de la red:

```
https://one.olamsa.com.pe/PractiQR
```

Debe cargar el login. (Dominio/HTTPS pendientes de verificación en servidor.)

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

Sin errores graves. (Los logs de diagnóstico de login están en DEBUG;
en INFO solo quedan advertencias de seguridad.)

---

## Checklist pre go-live

```text
[ ] Backup de practiqr_db
[ ] Confirmar dominio one.olamsa.com.pe
[ ] Confirmar HTTPS/certificado
[ ] Confirmar Apache y módulos
[ ] Confirmar Java 21
[ ] Confirmar Node.js LTS
[ ] Confirmar NSSM
[ ] Crear usuario MySQL practiqr_app
[ ] Configurar variables backend
[ ] Configurar variables frontend
[ ] Copiar JAR
[ ] Copiar Next.js standalone (+ .next/static + public)
[ ] Configurar servicios Windows
[ ] Configurar Apache /PractiQR
[ ] Verificar firewall
[ ] Arrancar backend
[ ] Verificar /health
[ ] Arrancar frontend
[ ] Probar https://one.olamsa.com.pe/PractiQR
[ ] Depurar administradores (conservar 1 RRHH)
[ ] Cargar usuarios reales
[ ] Ejecutar prueba E2E
```

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

Si algo falla después del deploy (`ddl-auto=validate`: no hay migraciones que revertir):

1. **Backend:** detener servicio, restaurar JAR anterior, iniciar, verificar `/health` + login.
2. **Frontend:** detener servicio, restaurar carpeta standalone anterior, iniciar.
3. **DB:** solo si hubo cambio de datos, restaurar desde el backup:
   ```cmd
   mysql -u root practiqr_db < C:\practiqr\scripts\backup_practiqr_db_YYYY-MM-DD.sql
   ```
4. **Config:** restaurar variables/archivos Apache previos si cambiaron.

### C. Troubleshooting

| Síntoma | Causa probable | Solución |
|---|---|---|
| Backend no arranca | DB no accesible | Verificar `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` |
| Backend no arranca | JWT_SECRET corto/ausente | Generar uno de 48+ bytes (B.2) |
| Backend no arranca | Tabla faltante | Verificar esquema `practiqr_db` (tablas: `administradores`, `tipo_practicante`, `tipo_instituto`, …) |
| Backend no arranca | Falta variable con perfil `prod` | Revisar las 6 de B.3 (fallan a propósito si faltan) |
| Frontend no carga | Puerto 3000 ocupado | `netstat -ano \| findstr :3000` |
| Frontend da 502 | Backend caído | `sc query PractiqrBackend` |
| Login falla | CORS mal | `CORS_ALLOWED_ORIGINS` debe ser el origin exacto, sin path |
| Cookie no se guarda | Perfil sin `Secure` en HTTPS | Usar `SPRING_PROFILES_ACTIVE=prod` |
| Estáticos rotos | Falta `.next/static` | Copiar `.next/static` y `public\` (C.1) |
| Apache no arranca | vhost mal escrito | Revisar `httpd-vhosts.conf` y `error.log` |
| 404 en /PractiQR/... | Prefijo no retirado | Revisar regla de strip hacia `:3000` |

### D. Contacto

- **Desarrollador:** Carlos Marín
- **Servidor:** Windows Server (OLAMSA)
- **Repositorio:** CONTROL_ASISTENCIA

---

**Fin del documento.**
