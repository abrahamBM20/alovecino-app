# Deploy Dev En Render

## Objetivo

El ambiente `dev` debe desplegar backend automaticamente despues de mergear cambios hacia la rama `dev`, usando GitHub Actions y Render API.

## Workflow

El deploy dev vive en `.github/workflows/backend-ci.yml`.

En `pull_request` hacia `dev`:

- Ejecuta pruebas backend.
- No despliega en Render.

En `push` hacia `dev`:

- Ejecuta pruebas backend.
- Si todas pasan, ejecuta `Render dev deploy`.
- Dispara deploys Render para `auth-service`, `usuarios-service`, `geo-service` y `api-gateway`.
- `chat-service` es opcional: solo despliega si existe variable de servicio configurada.

## Secretos Requeridos

- `RENDER_API_KEY`: API key de Render para listar servicios y gatillar deploys.

## Variables Opcionales

El workflow puede resolver los servicios por nombre usando defaults. Si se prefiere evitar busqueda por nombre, configurar IDs explicitamente:

- `RENDER_DEV_AUTH_SERVICE_ID`
- `RENDER_DEV_USUARIOS_SERVICE_ID`
- `RENDER_DEV_GEO_SERVICE_ID`
- `RENDER_DEV_API_GATEWAY_SERVICE_ID`
- `RENDER_DEV_CHAT_SERVICE_ID`

Tambien se pueden sobreescribir nombres:

- `RENDER_DEV_AUTH_SERVICE_NAME` default `alovecino-auth-service-dev`
- `RENDER_DEV_USUARIOS_SERVICE_NAME` default `alovecino-usuarios-service-dev`
- `RENDER_DEV_GEO_SERVICE_NAME` default `alovecino-geo-service-dev`
- `RENDER_DEV_API_GATEWAY_SERVICE_NAME` default `alovecino-api-gateway-dev`
- `RENDER_DEV_CHAT_SERVICE_NAME`

## Relacion Con QA

QA ya despliega con `.github/workflows/qa-cd.yml` despues de un `push` hacia `qa`, siempre que pasen pruebas backend/frontend. La promocion hacia `qa` debe venir desde `dev` por el gate `dev-to-qa-gate.yml`.
