# geo-service

Microservicio de geolocalizacion para Alo Vecino.

## Responsabilidad

- Geocodificar direcciones de almacenes con Google Maps.
- Buscar almacenes cercanos usando las coordenadas `direccion.latitud` y `direccion.longitud` del MER.
- Retornar distancia aproximada desde la ubicacion del cliente.

## Endpoints

- `GET /api/geo/stores?latitud=-33.4488900&longitud=-70.6692650&radio_metros=500`
- `POST /api/geo/geocode`

Radios soportados: `200`, `500`, `1000` y `2000` metros. Si `radio_metros` no viene informado, se usa `500`.

## Seguridad

`/api/geo/**` requiere Bearer JWT validado contra el JWKS del `auth-service`. El consumo esperado es a traves de `api-gateway`.

## Base de datos

El servicio lee el modelo compartido:

- `almacen.id_direccion`
- `direccion.latitud`
- `direccion.longitud`
- `comuna`
- `region`

El DDL incluye un indice parcial sobre `direccion(latitud, longitud)` para acelerar el filtro por caja geografica previo al calculo Haversine.

## Variables

- `GEO_SERVICE_PORT` o `SERVER_PORT`
- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `AUTH_JWK_SET_URI`
- `AUTH_JWT_ISSUER`
- `AUTH_JWT_AUDIENCE`
- `GOOGLE_MAPS_API_KEY`
- `GEO_GOOGLE_TIMEOUT_MS`
- `GOOGLE_GEOCODE_DAILY_REQUEST_LIMIT` default `100`. Set `0` to block external geocoding.

Si `GOOGLE_MAPS_API_KEY` no esta configurada, `POST /api/geo/geocode` responde con error controlado salvo que exista una coordenada valida en cache para la misma direccion.
