# AV-94 / HU-35 - Geocodificación Real De Almacenes

## Historia De Usuario

Como administrador del sistema, necesito que los almacenes registrados se publiquen con coordenadas reales obtenidas desde `geo-service`, para que el mapa muestre negocios en la ubicación correcta y no persista coordenadas de fallback cuando exista integración de geocodificación configurada.

## Criterios De Aceptación

- CA-01: Al registrar o actualizar un almacén, `usuarios-service` debe consultar `geo-service` con dirección normalizada por catálogo de región/comuna.
- CA-02: Si `geo-service` está configurado mediante JWT o `GEO_INTERNAL_API_KEY` y la geocodificación falla, el sistema debe rechazar la operación con error explícito en vez de guardar coordenadas determinísticas.
- CA-03: El timeout por defecto hacia `geo-service` debe tolerar cold starts del ambiente dev/qa.
- CA-04: Un administrador puede re-geocodificar un almacén existente para corregir coordenadas ya persistidas.
- CA-05: Un usuario no administrador no puede ejecutar re-geocodificación administrativa.

## Definition Of Done

- Código backend actualizado en `usuarios-service`.
- Pruebas unitarias/integración cubren fallback local, fallo remoto configurado y permiso admin para re-geocodificar.
- No se crean entidades paralelas al MER: se actualiza `direccion.latitud` y `direccion.longitud` asociada al `almacen`.
- PR usa `.github/pull_request_template.md` con trazabilidad Jira/HU, evidencia QA y notas de despliegue.
- En dev/qa, después del deploy del backend, se puede ejecutar re-geocodificación admin sobre datos existentes si quedaron coordenadas incorrectas.

## Pruebas Por Código

- `mvn -f backend/usuarios-service/pom.xml test`

