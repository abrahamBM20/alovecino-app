# HU - Dashboard Y Perfil Real De Almacenero

## Enunciado Sugerido Jira

Como usuario almacenero autenticado, quiero ver un dashboard alimentado con datos reales de mi almacén y contar con una pantalla de perfil de almacén, para gestionar mis consultas y revisar cómo se presenta mi negocio dentro de AloVecino sin depender de información mock o dummy.

## Alcance Funcional

- Al iniciar sesión con rol `ALMACEN`, el usuario debe ingresar al panel de almacenero.
- El panel debe obtener el almacén real asociado al usuario autenticado.
- El panel debe mostrar métricas calculadas desde consultas reales del almacén.
- La bandeja de consultas debe consumir datos reales desde el backend.
- Debe existir una pantalla de perfil de almacén accesible desde el panel.
- La pantalla de perfil debe mostrar datos reales del almacén: nombre, imagen, estado, dirección y ubicación base.
- El perfil de almacén para el usuario almacenero puede reutilizar criterios visuales del detalle público de negocio, pero no debe incluir acciones propias del cliente como iniciar chat con el mismo almacén.

## Criterios De Aceptación

- [x] CA-01: Dado un usuario con rol `ALMACEN`, cuando inicia sesión correctamente, entonces es redirigido a `/home/almacenero`.
- [x] CA-02: Dado un usuario almacenero autenticado, cuando ingresa al panel, entonces el frontend consulta `/api/almacenes/mis-almacenes`.
- [x] CA-03: Dado que el usuario tiene al menos un almacén asociado, cuando carga el panel, entonces se muestra el nombre, imagen si existe, estado y dirección real del primer almacén asociado.
- [x] CA-04: Dado que el usuario no tiene almacenes asociados, cuando carga el panel, entonces se muestra un estado vacío accionable sin datos mock.
- [x] CA-05: Dado un almacén real asociado, cuando carga el panel, entonces el frontend consulta `/api/consultas/almacen/{idAlmacen}/dashboard`.
- [x] CA-06: Dado que existen consultas reales, cuando carga el panel, entonces los indicadores se calculan desde esas consultas: total/hoy, pendientes, respondidas/cerradas y tiempo promedio si los datos lo permiten.
- [x] CA-07: Dado que no existen consultas reales, cuando carga el panel, entonces los indicadores muestran cero y la sección de consultas recientes queda vacía sin datos ficticios.
- [x] CA-08: Dado que falla la carga de almacén o consultas, cuando carga el panel, entonces se muestra un mensaje de error y una acción de reintento.
- [x] CA-09: Dado un usuario almacenero, cuando entra a la bandeja de consultas, entonces la lista se alimenta desde `/api/consultas/almacen/{idAlmacen}` y no desde `mockConsultas`.
- [x] CA-10: Dado una consulta pendiente real, cuando el almacenero la selecciona, entonces puede navegar al flujo de respuesta con el `idConsulta` real.
- [x] CA-11: Dado una respuesta enviada por el almacenero, cuando el backend responde exitosamente, entonces la consulta se actualiza y la bandeja/panel reflejan el nuevo estado al refrescar o volver a foco.
- [x] CA-12: Dado un usuario almacenero, cuando toca la acción de perfil de almacén, entonces navega a una pantalla de perfil propia del almacenero.
- [x] CA-13: Dado un almacén real, cuando se abre su perfil, entonces se muestran datos persistidos del backend y no textos dummy.
- [x] CA-14: Dado que el perfil de almacén reutiliza elementos del detalle público del negocio, cuando se renderiza para almacenero, entonces no muestra CTA de cliente como chat o valoración del mismo almacén.
- [x] CA-15: Dado que el usuario refresca manualmente el panel o la bandeja, cuando termina la carga, entonces los datos quedan sincronizados con backend.

## Definition Of Done

- [x] DoD-01: No quedan `MOCK_STATS`, `MOCK_CONSULTAS` ni `mockConsultas` alimentando pantallas productivas de almacenero.
- [x] DoD-02: Las llamadas HTTP nuevas pasan por `frontend/src/shared/api/httpClient.js`.
- [x] DoD-03: El rol de usuario se deriva del JWT o de `authStore`, sin depender de campos ad hoc no garantizados.
- [x] DoD-04: El panel maneja estados `loading`, `error`, `empty` y `success`.
- [x] DoD-05: La bandeja maneja estados `loading`, `error`, `empty` y `success`.
- [x] DoD-06: La pantalla de perfil de almacén existe como ruta Expo dentro de `/home/almacenero`.
- [x] DoD-07: La navegación hacia perfil y bandeja mantiene guardas de rol `ALMACEN`.
- [x] DoD-08: Las consultas reales se normalizan en una capa de servicio frontend para aislar diferencias de contrato backend.
- [x] DoD-09: Se agregan o actualizan pruebas unitarias de servicios frontend para `mis-almacenes`, consultas por almacén, dashboard y acciones de respuesta/cierre.
- [x] DoD-10: Se agregan pruebas de pantalla para panel y bandeja con datos reales mockeados desde servicios, no datos hardcodeados en pantalla.
- [x] DoD-11: Se ejecutan suites dirigidas de almacenero y servicios afectados.
- [x] DoD-12: Se ejecutan tests Maven de `chat-service` y `usuarios-service`; no se cambió `api-gateway`.
- [ ] DoD-13: El PR debe usar `.github/pull_request_template.md` e incluir Jira/HU, criterios de aceptación, evidencia QA, checklist técnico y notas de despliegue.
- [x] DoD-14: La implementación no requiere cambios de workflow; los workflows existentes cubren cambios bajo `frontend/**` y `backend/**`.
- [ ] DoD-15: Pendiente evidencia manual en Android Emulator: login como almacenero, carga de panel, apertura de perfil y apertura de bandeja.

## Notas Técnicas

- Endpoint de almacenes del usuario: `GET /api/almacenes/mis-almacenes`.
- Endpoint real de dashboard de almacén: `GET /api/consultas/almacen/{idAlmacen}/dashboard`.
- Endpoint real de consultas por almacén: `GET /api/consultas/almacen/{idAlmacen}`.
- La ruta `GET /api/almacenes/{id}/consultas` no corresponde al contrato backend actual.
- `ConsultaResponse` fue enriquecido con `clienteNombre` y `estadoNombre` para evitar que el frontend muestre solo IDs.
- Si se requiere editar perfil de almacén, horarios, contactos, categorías o estado abierto/cerrado persistente, debe levantarse una HU separada porque el contrato actual solo permite crear almacén, listar mis almacenes y actualizar imagen.

## Evidencia De Pruebas

- `mvn -f backend/chat-service/pom.xml test`: 60 tests OK.
- `mvn -f backend/usuarios-service/pom.xml test`: 20 tests OK, 1 skipped existente.
- `cd frontend; npm test -- --runInBand src/features/almacenero/services/almacenService.test.js src/features/almacenero/services/consultasService.test.js src/features/almacenero/screens/AlmaceneroScreens.test.js`: 10 tests OK.

## HU Complementarias Recomendadas

### HU - Editar Perfil Operativo Del Almacén

Como almacenero, quiero editar datos visibles de mi almacén, horario, contacto, categorías y estado operativo, para mantener mi perfil actualizado para clientes.

DoD mínimo:

- [ ] Existe endpoint de actualización parcial del almacén.
- [ ] Existe pantalla/formulario de edición.
- [ ] Se valida autorización del dueño del almacén.
- [ ] Se agregan pruebas frontend/backend.
