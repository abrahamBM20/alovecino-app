# Docker / Deploy / Stack - Backend AloVecino

## Archivos agregados

- `docker-compose.yml`: levanta Postgres, auth-service, usuarios-service, consulta-service y api-gateway.
- `.env.example`: variables necesarias para el stack local.
- `docker/postgres/init/01-create-databases.sql`: crea las bases locales usadas por los servicios.
- `chat-service/Dockerfile`: build multi-stage para consulta-service.
- `chat-service/Dockerfile.dev`: ejecución dev con Maven.
- `chat-service/Dockerfile.prod`: runtime para usar un `.jar` ya construido.
- `chat-service/.dockerignore`: evita copiar `target`, `.env` y archivos innecesarios.
- `chat-service/src/main/resources/application-docker.properties`: perfil Docker con PostgreSQL + Flyway.
- `.github/workflows/backend-services-ci.yml`: ejecuta tests de todos los microservicios, incluyendo `chat-service`.
- `.github/workflows/backend-docker-build.yml`: valida build de imágenes Docker de todos los microservicios.

## Uso local

```bash
cd backend
cp .env.example .env
docker compose up --build
```

Servicios expuestos:

- usuarios-service: `http://localhost:8080`
- auth-service: `http://localhost:8081`
- api-gateway: `http://localhost:8082`
- consulta-service/chat-service: `http://localhost:8083`
- postgres: `localhost:5432`

## Validación rápida

```bash
curl http://localhost:8081/actuator/health
curl http://localhost:8080/actuator/health
curl http://localhost:8082/actuator/health
curl http://localhost:8083/actuator/health
```

## Nota importante

Para QA/producción no uses `postgres/postgres`. Configura `POSTGRES_USER`, `POSTGRES_PASSWORD`, `APP_JWT_PRIVATE_KEY`, `APP_JWT_PUBLIC_KEY` y URLs internas mediante secrets del entorno.
