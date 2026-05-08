# Geolocation Service

Servicio base de geolocalización para Alo Vecino.

## Endpoints

- `POST /api/geolocalizacion/geocode`
  - Body: `DireccionRequest` con `calle`, `numero`, `comuna`, `region` y `codigoPostal` opcional.
  - Respuesta: coordenadas latitud/longitud.

## Ejecución local

```bash
cd backend/geolocation-service
mvn spring-boot:run
```

## Variables de entorno

- `SERVER_PORT` (default 8080)
- `AUTH_JWK_SET_URI`
- `AUTH_JWT_ISSUER`
- `AUTH_JWT_AUDIENCE`
