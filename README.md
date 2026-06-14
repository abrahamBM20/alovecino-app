# Alo Vecino
Repositorio para el proyecto de Alo Vecino. Contiene todo el código de la plataforma (aplicaciones, interfaces, microservicios, integraciones)..

## Flujo Git y GitHub (ES)

Este repositorio incluye plantillas para mapear cambios con historia de usuario y Jira:

- Convencion de ramas: ver .github/convenciones-git.md
- Plantilla de Pull Request: .github/pull_request_template.md
- Plantilla de commit: .gitmessage.txt
- Contexto optimizado tipo SkillOpt para agentes: ver `docs/skillopt/best_skill.md`

### Contexto optimizado para agentes

Para reducir tokens en revisiones y cambios asistidos, usa primero `docs/skillopt/best_skill.md`.
Ese archivo resume los contratos estables del repo, rutas de inspeccion y validaciones minimas.
Las lecciones nuevas se registran en `docs/skillopt/trajectory-log.md` y solo se promueven al skill si pasan el protocolo de `docs/skillopt/training-protocol.md`.
El flujo esta en español porque SkillOpt optimiza instrucciones naturales; usar el idioma del equipo mejora reutilizacion y reduce ambiguedad.

Verifica el presupuesto aproximado de tokens con:

```powershell
./scripts/measure-skill-budget.ps1 -Path docs/skillopt/best_skill.md -MaxTokens 1400
./scripts/evaluate-skillopt.ps1 -Candidate docs/skillopt/best_skill.md
```

### Configuracion recomendada (local)

Para usar la plantilla de commit en tu entorno local:

```bash
git config commit.template .gitmessage.txt
```

## Entornos Docker (dev y qa)

Se incluyen entornos Docker para el servicio de usuarios y PostgreSQL en:

- `deploy/docker/docker-compose.dev.yml`
- `deploy/docker/docker-compose.qa.yml`

### 1) Preparar variables por entorno

```bash
cp deploy/docker/.env.dev.example deploy/docker/.env.dev
cp deploy/docker/.env.qa.example deploy/docker/.env.qa
```

Edita los valores segun tus credenciales y puertos.

Para NeonDB, usa formato JDBC para Spring:

```bash
NEON_DATABASE_URL=jdbc:postgresql://<host-neon>/<database>?sslmode=require&channelBinding=require
NEON_DATABASE_USERNAME=<role>
NEON_DATABASE_PASSWORD=<password>
```

Si copias el string de Neon en formato `postgresql://...`, conviertelo a `jdbc:postgresql://...`.

### 2) Levantar entorno dev

```bash
docker compose --env-file deploy/docker/.env.dev -f deploy/docker/docker-compose.dev.yml up -d --build
```

### 3) Levantar entorno qa

```bash
docker compose --env-file deploy/docker/.env.qa -f deploy/docker/docker-compose.qa.yml up -d --build
```

### 4) Detener entorno

```bash
docker compose --env-file deploy/docker/.env.dev -f deploy/docker/docker-compose.dev.yml down
docker compose --env-file deploy/docker/.env.qa -f deploy/docker/docker-compose.qa.yml down
```

## Auth service y JWT

El login debe ser emitido por `auth-service`, que autentica contra las tablas `usuario`/`rol`, firma un access token JWT con RS256 y almacena refresh tokens hasheados en la tabla `refresh_token`.

En desarrollo:

- Swagger auth: `http://localhost:8081/swagger-ui/index.html`
- JWKS para API Gateway: `http://localhost:8081/.well-known/jwks.json`
- Dentro de Docker, el Gateway debe validar con `http://auth-service:8080/.well-known/jwks.json`

Endpoints:

- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`

Login request:

```json
{
	"email": "admin@alovecino.com",
	"password": "admin1234"
}
```

Login/refresh response:

```json
{
	"token": "access-jwt",
	"accessToken": "access-jwt",
	"refreshToken": "opaque-refresh-token",
	"tokenType": "Bearer",
	"accessTokenExpiresAt": "2026-04-28T12:15:00Z",
	"refreshTokenExpiresAt": "2026-05-28T12:00:00Z",
	"user": {
		"id": "1",
		"name": "Administrador",
		"email": "admin@alovecino.com"
	}
}
```

El campo `token` se mantiene como alias de `accessToken` para compatibilidad con el frontend actual.

Configuración base para Spring Cloud Gateway como resource server:

```properties
spring.security.oauth2.resourceserver.jwt.jwk-set-uri=http://auth-service:8080/.well-known/jwks.json
spring.security.oauth2.resourceserver.jwt.issuer-uri=
```

Si el Gateway corre fuera de Docker en desarrollo, usa `http://localhost:8081/.well-known/jwks.json`.
