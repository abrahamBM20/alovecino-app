# HU - Consultas Cliente Sin Chat Legacy

## Enunciado Sugerido Jira

Como cliente autenticado, quiero enviar consultas estructuradas a un almacén y revisar sus respuestas, para consultar disponibilidad o cantidades sin depender de una pantalla de chat que no representa el flujo real del negocio.

## Alcance Funcional

- El detalle público de un almacén debe dirigir a una pantalla de nueva consulta.
- La pantalla legacy de chat deja de ser el flujo principal para clientes.
- El cliente puede ingresar uno o más detalles de consulta.
- Cada detalle debe enviar `descripcion` y `cantidadSolicitada`, según el MER normalizado.
- El cliente puede revisar sus consultas y ver estado/respuesta cuando exista.
- La bandeja de almacenero debe interpretar respuestas normalizadas con `detalles`.

## Criterios De Aceptación

- [x] CA-01: Dado un cliente autenticado, cuando abre el detalle de un almacén y toca la acción principal, entonces navega a `/home/consultas/nueva/{idAlmacen}`.
- [x] CA-02: Dado el nuevo flujo, cuando el cliente usa el detalle de almacén, entonces no navega a `/home/chat/{id}`.
- [x] CA-03: Dado un almacén seleccionado, cuando se abre la pantalla de nueva consulta, entonces se muestra el nombre del almacén en el encabezado.
- [x] CA-04: Dado un cliente autenticado, cuando completa descripción y cantidad, entonces puede enviar la consulta.
- [x] CA-05: Dado que la consulta se envía, cuando el frontend llama al backend, entonces usa `POST /api/consultas` con `idCliente`, `idAlmacen` y `detalles[].cantidadSolicitada`.
- [x] CA-06: Dado que falta descripción, cantidad o IDs válidos, cuando el cliente intenta enviar, entonces la acción permanece deshabilitada.
- [x] CA-07: Dado que el backend responde exitosamente, cuando se crea la consulta, entonces se muestra confirmación con folio.
- [x] CA-08: Dado que falla el envío, cuando el backend responde error o la red falla, entonces se muestra feedback de error y permite reintentar.
- [x] CA-09: Dado un cliente autenticado, cuando abre `/home/consultas/mis`, entonces la app consulta `GET /api/consultas/cliente/{idCliente}`.
- [x] CA-10: Dado que hay consultas respondidas, cuando se listan mis consultas, entonces se muestra el estado y la respuesta del almacén.
- [x] CA-11: Dado que el backend usa contrato normalizado, cuando la bandeja de almacenero recibe `detalles`, entonces muestra pregunta y cantidad desde el primer detalle.

## Definition Of Done

- [x] DoD-01: Existe ruta Expo Router para crear consulta cliente.
- [x] DoD-02: Existe ruta Expo Router para mis consultas cliente.
- [x] DoD-03: Existe servicio frontend cliente para `POST /api/consultas` y `GET /api/consultas/cliente/{idCliente}`.
- [x] DoD-04: Todas las llamadas HTTP pasan por `frontend/src/shared/api/httpClient.js`.
- [x] DoD-05: La pantalla de creación maneja estados `idle`, `submitting`, `done` y `error`.
- [x] DoD-06: La pantalla de mis consultas maneja estados `loading`, `error`, `empty` y `success`.
- [x] DoD-07: La navegación principal ya no apunta a `ChatMinimarketScreen`.
- [x] DoD-08: Se agregan pruebas unitarias del servicio cliente de consultas.
- [x] DoD-09: Se agregan pruebas de pantalla para crear consulta y ver mis consultas.
- [x] DoD-10: Se agrega prueba de navegación desde detalle de almacén hacia nueva consulta.
- [x] DoD-11: Se actualiza prueba del mapeo almacenero para contrato `detalles`.
- [x] DoD-12: La implementación no requiere cambios de workflow; `frontend/**` ya está cubierto por Frontend CI.
- [ ] DoD-13: PR debe usar `.github/pull_request_template.md` con Jira/HU, evidencia QA y notas de despliegue.
- [ ] DoD-14: Pendiente evidencia manual en Android Emulator: cliente crea consulta, almacén responde desde bandeja, cliente ve respuesta en mis consultas.

## Evidencia De Pruebas

- `cd frontend; npm test -- --runInBand src/features/consultas/services/consultasClienteService.test.js src/features/consultas/screens/ConsultasClienteScreens.test.js src/features/valoracion/screens/NegocioDetailScreen.test.js src/features/almacenero/services/consultasService.test.js`: 12 tests OK.
- `cd frontend; npm test -- --runInBand`: 18 suites, 62 tests OK.
- `rg -n "home/chat|features/chat|ChatMinimarketScreen" frontend/src`: sin referencias.

## Notas Técnicas

- Se elimina la ruta `/home/chat/[id]` y la pantalla `ChatMinimarketScreen`; el reemplazo funcional es `/home/consultas/nueva/[id]`.
- Para una trazabilidad más rica, una HU futura puede agregar detalle de consulta cliente por folio y notificaciones push cuando el almacén responda.
