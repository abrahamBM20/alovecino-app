# Log De Trayectorias SkillOpt

Este archivo guarda observaciones antes de promoverlas a `best_skill.md`. Debe ser más detallado que el skill, pero no un basurero de logs completos.

## Formato

```md
## YYYY-MM-DD - Nombre breve

Tipo: PR review | CI fix | frontend | backend | deploy | docs
Resultado: éxito | fallo | parcial
Archivos/rutas: `ruta`, `ruta`
Observación:
- Qué pasó.
- Qué se aprendió.
Promoción:
- No promovido todavía | Promovido a best_skill.md | Rechazado porque ...
```

## 2026-06-02 - Revisión De PRs Dev/QA

Tipo: PR review
Resultado: éxito
Archivos/rutas: `.github/workflows`, `frontend/src/app`, `frontend/src/features/auth`, `backend/usuarios-service`

Observación:

- Se revisaron PRs abiertos hacia `dev` y `qa`.
- Se aprobaron y mergearon PRs limpios con checks verdes.
- Se bloquearon PRs con conflicto de dashboard/auth y PRs a `qa` que fallaban gate.
- Se eliminó un `backend.zip` antes de aprobar un PR backend.

Lecciones:

- Los dashboards frontend pueden chocar en rutas Expo Router y navegación auth.
- La fuente confiable de rol es el claim JWT `roles`, no `user.rol` sin contrato.
- Los binarios generados no deben entrar al repo.
- En `qa`, la compuerta de promoción importa tanto como la mergeabilidad Git.
- Sonar Java necesita clases compiladas para cada ruta de `sonar.java.binaries`.

Promoción:

- Promovido a `best_skill.md`.

## 2026-06-02 - Permisos Elevados En Flujo Local

Tipo: CI fix
Resultado: éxito
Archivos/rutas: `docs/skillopt/best_skill.md`, `docs/skillopt/training-protocol.md`

Observación:

- En Windows el sandbox local puede fallar al leer o validar archivos.
- Para revisar GitHub, PRs, checks y referencias remotas se requieren comandos `gh`/`git` con permisos fuera del sandbox.
- El patrón correcto es solicitar permiso explícito con justificación acotada y continuar con el comando aprobado.

Promoción:

- Promovido a `best_skill.md` y `training-protocol.md`.

## 2026-06-02 - Plantilla Obligatoria De Pull Request

Tipo: docs
Resultado: éxito
Archivos/rutas: `.github/pull_request_template.md`, `docs/skillopt/best_skill.md`

Observación:

- Los PRs del repositorio deben seguir la plantilla oficial en `.github/pull_request_template.md`.
- La plantilla fuerza trazabilidad Jira/HU, criterios de aceptación, evidencia QA, checklist y notas de despliegue.
- Para evitar PRs incompletos, el flujo SkillOpt debe recordar leer y aplicar la plantilla antes de crear PR.

Promoción:

- Promovido a `best_skill.md` y `training-protocol.md`.

## 2026-06-02 - Identidad, Workflows Y EAS

Tipo: docs
Resultado: éxito
Archivos/rutas: `docs/skillopt/best_skill.md`, `.github/workflows`, `frontend/eas.json`

Observación:

- Las interacciones externas no deben firmarse ni atribuirse a la identidad del agente.
- Antes de tocar workflows hay que revisar si los triggers, paths y jobs existentes ya cubren el cambio.
- En Expo/EAS, un update OTA basta para cambios JS compatibles; un build nuevo aplica ante cambios nativos, runtime, permisos o perfil.

Promoción:

- Promovido a `best_skill.md`, `training-protocol.md`, `config.json` y `validation-set.json`.

## 2026-06-05 - Consultas Cliente Reemplazan Chat

Tipo: frontend
Resultado: éxito
Archivos/rutas: `frontend/src/features/consultas`, `frontend/src/features/valoracion/screens/NegocioDetailScreen.js`, `backend/chat-service`

Observación:

- El flujo cliente no debe navegar a chat cuando el dominio real es consulta estructurada.
- El contrato normalizado para crear consultas usa `detalles[].descripcion` y `detalles[].cantidadSolicitada`.
- Si se reemplaza un flujo legacy con una pantalla nueva, elimina la ruta legacy cuando no queden referencias desde `frontend/src`.

Promoción:

- No promovido todavía.
## 2026-06-05 - Refresh Token Móvil

Tipo: backend | frontend
Resultado: éxito
Archivos/rutas: `backend/auth-service`, `frontend/src/store/authStore.js`, `frontend/src/shared/api/httpClient.js`, `frontend/src/features/auth/services/authService.js`

Observación:

- `auth-service` ya persistía `sesion_usuario` y `refresh_token`, pero `TokenResponse` ocultaba `refreshToken` en JSON.
- React Native no podía renovar sesión de forma confiable solo con cookie httpOnly; el flujo móvil necesita recibir `refreshToken` en login/refresh y enviarlo por body a `/auth/refresh` y `/auth/logout`.
- El interceptor HTTP debe excluir endpoints `/auth/*`, usar un único refresh concurrente, reintentar una sola vez la request original y limpiar sesión si el refresh falla.

Promoción:

- Promovido a `best_skill.md`.

## 2026-06-07 - Configuración De Perfil De Almacén

Tipo: backend | frontend
Resultado: éxito
Archivos/rutas: `backend/usuarios-service`, `frontend/src/features/almacenero`

Observación:

- La configuración editable del almacén debe apoyarse en el MER existente: `almacen` para nombre/estado/imagen, `direccion` para ubicación y `almacen_contacto` para teléfono principal.
- Evita crear un contrato paralelo de "configuración de almacén" si los datos ya pertenecen a entidades normalizadas.
- En frontend, el perfil de almacenero debe usar `httpClient` y el servicio de feature, no llamadas directas ni datos mock.

Promoción:

- No promovido todavía.

## 2026-06-07 - Aprobación Y Visibilidad De Almacenes

Tipo: backend | frontend
Resultado: éxito
Archivos/rutas: `backend/usuarios-service`, `backend/geo-service`, `frontend/src/features/home`, `frontend/src/features/auth`

Observación:

- `PENDIENTE` no debe tratarse como error: representa almacén registrado pero no publicado.
- La publicación en el mapa debe depender de `estado_cuenta.codigo = ACTIVO` para evitar mostrar negocios no aprobados.
- Si frontend ofrece radios de búsqueda, `geo-service` debe aceptar exactamente esos radios o la UI debe ocultarlos.
- En móvil conviene priorizar ubicación actual antes de `lastKnownPosition`, porque el emulador puede conservar ubicaciones antiguas.

Promoción:

- No promovido todavía.

## 2026-06-10 - Catálogo De Ubicación Y Geocodificación

Tipo: backend | frontend
Resultado: éxito
Archivos/rutas: `backend/usuarios-service`, `frontend/src/features/auth`

Observación:

- `region` y `comuna` pertenecen al MER como catálogos; no deben crearse desde input libre del formulario.
- `usuarios-service` debe geocodificar con región/comuna normalizadas y existentes en catálogo para que `geo-service` y `GoogleGeocodingClient` trabajen con direcciones canónicas.
- Si la geocodificación real falla o falta `GEO_SERVICE_URL`, `GEO_INTERNAL_API_KEY` o `GOOGLE_MAPS_API_KEY`, el fallback determinístico puede dejar coordenadas válidas pero incorrectas para el negocio.

Promoción:

- No promovido todavía.
