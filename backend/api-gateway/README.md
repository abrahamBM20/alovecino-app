# API Gateway

Spring Cloud Gateway for Alo Vecino.

## Local run

```bash
mvn spring-boot:run
```

## Environment variables

- SERVER_PORT or GATEWAY_PORT (default: 8082)
- AUTH_SERVICE_URL (default: http://localhost:8081)
- AUTH_JWK_SET_URI (default: http://localhost:8081/.well-known/jwks.json)
- AUTH_JWT_ISSUER (default: alovecino-auth)
- AUTH_JWT_AUDIENCE (default: alovecino-api)
- USUARIOS_SERVICE_URL (default: http://localhost:8080)
- GATEWAY_CORS_ALLOWED_ORIGINS

## Routes

- /auth/** -> auth-service
- /.well-known/jwks.json -> auth-service
- /api/usuarios/** -> usuarios-service
- /v3/api-docs/** -> usuarios-service
- /swagger-ui/** -> usuarios-service
- / -> redirect to /swagger-ui/index.html

## Security

Public paths:

- /
- /auth/login
- /auth/refresh
- /auth/logout
- /.well-known/jwks.json
- /v3/api-docs/**
- /swagger-ui/**
- /actuator/health
- /actuator/info

All other paths require a Bearer JWT signed by auth-service with RS256. The gateway validates the token through the configured JWKS URL, issuer and audience.

For EC2, expose this gateway as the public API entrypoint and point Expo to that URL with `EXPO_PUBLIC_API_URL`. The database remains behind the backend services; the gateway does not connect to PostgreSQL or Neon directly.
