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
- /api/almacenes/** -> usuarios-service
- /api/consultas/** -> usuarios-service
- /api/valoraciones/** -> usuarios-service
- /api/ofertas/** -> usuarios-service
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

The gateway accepts additional claims from the migrated auth flow, including `sid`, `session_id` and `roles`, while still enforcing signature, expiration, issuer and audience.

Authentication failures return `401` with a stable JSON body:

```json
{"message":"Token requerido o invalido"}
```

## Environment deployment

Set CORS to the frontend origins for each environment only. Do not include backend service URLs unless a browser client is actually served from them.

### Render dev

Configure the gateway service with:

- `AUTH_SERVICE_URL=https://alovecino-auth-service-dev.onrender.com`
- `USUARIOS_SERVICE_URL=https://alovecino-usuarios-service-dev.onrender.com`
- `AUTH_JWK_SET_URI=https://alovecino-auth-service-dev.onrender.com/.well-known/jwks.json`
- `AUTH_JWT_ISSUER=alovecino-auth`
- `AUTH_JWT_AUDIENCE=alovecino-api`
- `GATEWAY_CORS_ALLOWED_ORIGINS=<Expo/React Native dev origin>`

### EC2 QA and production

For EC2, expose this gateway as the public API entrypoint and point Expo to that URL with `EXPO_PUBLIC_API_URL`. The database remains behind the backend services; the gateway does not connect to PostgreSQL or Neon directly.

Use internal service URLs for backend routing:

- `AUTH_SERVICE_URL=http://<auth-service-private-dns-or-host>:<port>`
- `USUARIOS_SERVICE_URL=http://<usuarios-service-private-dns-or-host>:<port>`
- `AUTH_JWK_SET_URI=http://<auth-service-private-dns-or-host>:<port>/.well-known/jwks.json`
- `AUTH_JWT_ISSUER=<issuer shared with auth-service>`
- `AUTH_JWT_AUDIENCE=<audience shared with auth-service>`
- `GATEWAY_CORS_ALLOWED_ORIGINS=https://<qa-frontend-domain>` for QA, `https://<production-frontend-domain>` for production
