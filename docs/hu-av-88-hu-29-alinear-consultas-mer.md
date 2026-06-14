# HU - Alinear Consultas Del Chat-Service Al MER

## Enunciado Sugerido Jira

Como equipo técnico de AloVecino, quiero que el `chat-service` persista las consultas según el MER `consulta` + `consulta_detalle`, para evitar duplicidad semántica en la cabecera de consulta y dejar preparado el dominio para múltiples detalles solicitados por una misma consulta.

## Trazabilidad Sugerida

- Jira ID: `AV-88`
- Historia de Usuario: `HU-29`
- Rama GitHub: `feature/av-88-hu-29-alinear-consultas-mer`

## Contexto

El MER documentado define:

- `consulta`: cabecera asociada a `cliente`, `almacen`, `estado_consulta`, `respuesta` y `fecha_respuesta`.
- `consulta_detalle`: detalle asociado a `consulta`, con `descripcion` y `cantidad_solicitada`.

El `chat-service` legacy persistía `descripcion` y `cantidad` directamente en `consulta`. Esta HU introduce `consulta_detalle` como contrato funcional único: la cabecera `consulta` conserva solo los datos transaccionales y el detalle solicitado vive en `consulta_detalle`.

## Criterios De Aceptación

- [x] CA-01: Existe una migración Flyway que crea la tabla `consulta_detalle`.
- [x] CA-02: La migración copia datos legacy desde `consulta.descripcion` y `consulta.cantidad` hacia `consulta_detalle`.
- [x] CA-03: La entidad `Consulta` representa la cabecera y contiene una relación con `ConsultaDetalle`.
- [x] CA-04: Al crear una consulta, el backend exige `detalles[]` y no usa `descripcion`/`cantidad` en la cabecera del request.
- [x] CA-05: Al crear una consulta con `detalles[]`, el backend persiste cada item en `consulta_detalle`.
- [x] CA-06: `ConsultaResponse` expone `detalles[]` como única representación del detalle solicitado, sin alias legacy `descripcion`/`cantidad`.
- [x] CA-07: Los endpoints existentes de consulta no cambian de ruta, pero el body de creación queda normalizado al contrato MER.
- [x] CA-08: Las validaciones rechazan requests sin `detalles[]` y validan `descripcion`/`cantidadSolicitada` dentro de cada detalle.

## Definition Of Done

- [x] DoD-01: `chat-service` compila con la nueva entidad `ConsultaDetalle`.
- [x] DoD-02: Las pruebas unitarias de servicio cubren creación MER con uno o múltiples `detalles[]`.
- [x] DoD-03: Las pruebas de validación cubren detalle normalizado válido e inválido.
- [x] DoD-04: No se modifica `api-gateway`, porque las rutas `/api/consultas/**` se mantienen.
- [x] DoD-05: Ejecutar `mvn -f backend/chat-service/pom.xml test` y documentar resultado.
- [ ] DoD-06: Crear PR hacia `dev` usando `.github/pull_request_template.md`.

## Notas Técnicas

- Se conservan columnas legacy `consulta.descripcion` y `consulta.cantidad` creadas por `V1` solo para permitir la migración de datos existentes; la aplicación deja de leerlas, escribirlas o exponerlas en DTO.
- Los clientes deben enviar `detalles[]` al crear consultas.
- Una limpieza futura podría eliminar columnas legacy cuando todos los ambientes estén migrados y no existan consumidores antiguos.

## Evidencia De Pruebas

- `mvn -f backend/chat-service/pom.xml test`: 57 tests OK.
