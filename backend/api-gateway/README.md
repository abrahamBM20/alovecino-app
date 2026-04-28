# API Gateway

Spring Cloud Gateway for Alo Vecino.

## Local run

```bash
mvn spring-boot:run
```

## Environment variables

- GATEWAY_PORT (default: 8082)
- USUARIOS_SERVICE_URL (default: http://localhost:8080)
- JWT_SECRET (required in non-dev environments)

## Routes

- /auth/** -> usuarios-service
- /api/usuarios/** -> usuarios-service
- /v3/api-docs/** -> usuarios-service
- /swagger-ui/** -> usuarios-service
- / -> redirect to /swagger-ui/index.html
