# AV-95 / HU-36 - Mensaje De Error En Registro Con Geocodificación

## Historia De Usuario

Como usuario que registra un almacén, necesito ver un mensaje claro cuando la dirección no puede ser geocodificada, para corregir los datos o reintentar sin recibir errores técnicos como `Request failed with status code 502`.

## Criterios De Aceptación

- CA-01: Si `usuarios-service` rechaza el registro por falla de geocodificación, la respuesta HTTP conserva el estado correspondiente.
- CA-02: La respuesta incluye un JSON con `message` legible para la app móvil.
- CA-03: El frontend puede reutilizar el interceptor existente de `httpClient` para mostrar el mensaje del backend.

## Definition Of Done

- `ApiExceptionHandler` cubre `ResponseStatusException`.
- La prueba de handler valida que un `502` conserve el mensaje de geocodificación.
- No se cambia el contrato normalizado de registro ni el MER.

## Pruebas Por Código

- `mvn -f backend/usuarios-service/pom.xml test`

