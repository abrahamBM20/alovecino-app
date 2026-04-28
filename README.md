# Alo Vecino
Repositorio para el proyecto de Alo Vecino. Contiene todo el código de la plataforma (aplicaciones, interfaces, microservicios, integraciones)..

## Flujo Git y GitHub (ES)

Este repositorio incluye plantillas para mapear cambios con historia de usuario y Jira:

- Convencion de ramas: ver .github/convenciones-git.md
- Plantilla de Pull Request: .github/pull_request_template.md
- Plantilla de commit: .gitmessage.txt

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

## Swagger y mapeo Front (login)

Con el microservicio de usuarios arriba, la documentación OpenAPI queda disponible en:

- `http://localhost:8080/swagger-ui/index.html`
- `http://localhost:8080/v3/api-docs`

Endpoint de login para el frontend:

- `POST /auth/login`

Request:

```json
{
	"email": "admin@alovecino.com",
	"password": "admin1234"
}
```

Response:

```json
{
	"token": "session-token",
	"user": {
		"id": "1",
		"name": "admin@alovecino.com",
		"email": "admin@alovecino.com"
	}
}
```
