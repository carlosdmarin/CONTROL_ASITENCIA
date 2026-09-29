# GUIA_DEPLOY — PractiQR Producción (OLAMSA)

Guía técnica de despliegue del backend (y contexto frontend) en el servidor Windows de OLAMSA.
No contiene secretos ni valores reales: todos se configuran en el servidor.

## 1. Arquitectura

```text
Internet
   ↓
https://one.olamsa.com.pe/PractiQR
   ↓
Apache / HTTPS / Reverse Proxy (strip de /PractiQR)
   ↓
Next.js :3000  (standalone)
   ↓ /api (rewrites internos)
Spring Boot :8080
   ↓
MySQL practiqr_db
```

- El backend es agnóstico al prefijo: **NO** configurar `server.servlet.context-path=/PractiQR`.
  Apache debe eliminar `/PractiQR` al enrutar (escenario validado con el código actual).
- Frontend y backend quedan bajo el mismo origin (`https://one.olamsa.com.pe`); CORS solo
  necesita ese origin en la allowlist.

## 2. Requisitos del servidor

- Windows Server con MySQL (base `practiqr_db` + seed de catálogos) y Java 21 (JRE) instalado.
- **NO** se necesita IntelliJ IDEA, Maven ni Spring Boot instalado: el backend se ejecuta como:
  ```text
  java -jar practiqr-backend.jar
  ```
- El mecanismo para servicio permanente (NSSM u otro) es responsabilidad de infraestructura.

## 3. Variables de entorno (obligatorias en producción)

```text
SPRING_PROFILES_ACTIVE=prod
DB_URL=jdbc:mysql://<host-mysql>:3306/practiqr_db?useSSL=false&serverTimezone=America/Lima&allowPublicKeyRetrieval=true&zeroDateTimeBehavior=convertToNull
DB_USERNAME=<usuario-dedicado>
DB_PASSWORD=<secreto>
JWT_SECRET=<clave de al menos 32 bytes>
CORS_ALLOWED_ORIGINS=https://one.olamsa.com.pe
BACKEND_URL=http://127.0.0.1:8080   (usada por Next.js para rewrites /api -> Spring Boot)
PORT=<puerto Next.js, default 3000>
```

- `JWT_SECRET` es la clave privada del servidor para firmar/verificar JWT (NO es el token de usuario).
- `JWT_SECRET` y `DB_PASSWORD` son secretos: configurarlos directamente en el servidor/NSSM,
  nunca en Git ni en `.properties`.
- Sin `DB_URL/DB_USERNAME/DB_PASSWORD/JWT_SECRET/CORS_ALLOWED_ORIGINS` el perfil `prod`
  falla al arrancar a propósito (fail-fast, sin defaults locales).
- `ddl-auto=validate`: el arranque valida el esquema, nunca lo modifica. No usar
  `create`, `create-drop` ni `update` en producción.
- Cookie `practiqr_token`: con perfil `prod` es `Secure; HttpOnly; SameSite=Lax; Path=/`
  (correcta para HTTPS bajo `/PractiQR`).

## 4. Base de datos

- Usuario dedicado recomendado `practiqr_app` con permisos mínimos
  `SELECT, INSERT, UPDATE, DELETE` (sin DDL). Compatible con `ddl-auto=validate`.
- Importar esquema `practiqr_db` y seed de catálogos (`sedes`, `tipo_practicante`,
  `tipo_instituto`) antes del primer arranque. Hacer backup periódico.
- `one_db` NO es dependencia de producción.

## 5. Apache / Reverse Proxy (ingeniería OLAMSA)

- VirtualHost TLS para el dominio existente; `ProxyPass /PractiQR/ http://127.0.0.1:3000/`
  y `ProxyPass /PractiQR/api/ http://127.0.0.1:8080/api/` (o equivalente con strip del prefijo).
- Confirmar: strip de `/PractiQR`, puerto interno del backend, servicio de estáticos Next.js.

## 6. Verificación post-deploy

1. `GET /health` → `{"status":"UP",...}`.
2. Login RRHH → cookie `practiqr_token` con flags `Secure; HttpOnly; SameSite=Lax`.
3. `GET /api/auth/me` autenticado; `POST /api/auth/logout` limpia la cookie.
4. `GET /api/tipos-practicante` y `/api/tipos-instituto` como RRHH → 200.

## 7. Notas

- Mejora posterior documentada (NO implementada): firmar el QR dinámico (HMAC + anti-replay).
- Rollback backend: detener servicio, restaurar JAR anterior y reiniciar (sin migraciones de BD).
