# Revisión y corrección de chat-service / consulta-service

## Cambios aplicados en src/main

- Se corrigió el puerto del consulta-service de `8082` a `8083`, para no chocar con api-gateway.
- Se cambió la validación JWT del consulta-service desde secret-key/HMAC a JWKS, compatible con auth-service y tokens RS256.
- Se agregó `@EnableMethodSecurity` para que funcionen los `@PreAuthorize` de los controladores.
- Se corrigió el converter de roles para que no duplique el prefijo `ROLE_`.
- Se agregó la ruta `/api/estados-consulta/**` en api-gateway hacia el chat/consulta service.
- Se agregó validación de cantidad mínima (`@Min(1)`) en `ConsultaRequest`.
- Se agregaron validaciones positivas para IDs de cliente, almacén y estado de respuesta.
- Se dejó `idEstadoConsulta` y `respuesta` en `ConsultaRequest` solo por compatibilidad, pero el service los ignora al crear una consulta.
- Se corrigió `ConsultaService` para asignar siempre el estado `PENDIENTE` al crear la consulta.
- Se corrigió `ConsultaService` para validar existencia de cliente y almacén antes de guardar.
- Se corrigió `responderConsulta` para hacer trim de la respuesta y validar el estado real encontrado.
- Se agregó `GlobalExceptionHandler` para devolver errores 400/404 más limpios.
- Se actualizó `.env.example` para usar `AUTH_JWK_SET_URI` en vez de una clave secreta local.

## Cambios aplicados en tests

- Se actualizaron los tests de seguridad para probar el comportamiento corregido.
- Se agregaron tests para validaciones nuevas de `ConsultaRequest`.
- Se agregaron tests para `ResponderConsultaRequest`.
- Se agregaron tests para la clase principal `ConsultaServiceApplication`.
- Se agregaron tests de `ConsultaService` para cliente inexistente y almacén inexistente.
- Se actualizó el test del api-gateway para incluir la ruta `estados-consulta-api`.

## Comando para ejecutar

```bash
cd backend/chat-service
./mvnw test
```

Para gateway:

```bash
cd backend/api-gateway
./mvnw test
```

> En este entorno no se pudo ejecutar Maven porque el wrapper intenta descargar Maven desde internet. El proyecto queda corregido para ejecutarlo localmente.
