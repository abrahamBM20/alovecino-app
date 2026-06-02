# AloVecino Best Skill

Usa este skill como primer contexto antes de trabajar en el repositorio. Es el artefacto desplegable inspirado en SkillOpt: compacto, reutilizable y mantenido por validación. Carga archivos detallados solo cuando la tarea los toque.

## Mapa Del Proyecto

- `frontend/`: app Expo Router + React Native.
- `backend/api-gateway`: Spring Cloud Gateway y resource server JWT.
- `backend/auth-service`: login, refresh token, JWT RS256 y JWKS.
- `backend/usuarios-service`: usuarios, almacenes, perfil, configuración y valoraciones.
- `backend/geo-service`: geolocalización y búsqueda de almacenes.
- `backend/chat-service`: consultas/chat.
- `.github/workflows/`: CI/CD de frontend, backend, QA, promoción y calidad estática.
- `docs/`: arquitectura, QA, despliegue, base de datos y evidencias.
- `scripts/`: setup de ambientes, QA, despliegue y helpers.

## Contratos Estables

- Los tokens de autenticación vienen de `auth-service`.
- El JWT usa RS256 y trae `roles` como `ROLE_CLIENTE` o `ROLE_ALMACEN`.
- No asumas `user.rol` en frontend salvo que el contrato API lo garantice; deriva el rol del JWT o revisa `authStore`.
- El estado auth del frontend vive en `frontend/src/store/authStore.js`.
- Las llamadas HTTP del frontend deben pasar por `frontend/src/shared/api/httpClient.js`.
- La respuesta de login conserva `token` y `accessToken` por compatibilidad.
- Los servicios Spring usan Java 21 y Maven.
- El frontend usa npm, Expo SDK 54, React 19 y Jest con `jest-expo`.
- La promoción a `qa` tiene gate; no basta con que Git diga `MERGEABLE`.

## Rutas De Inspección Rápida

- Pantallas frontend: mira primero `frontend/src/app/**`, luego `frontend/src/features/<feature>/**`.
- Servicios frontend/API: mira `frontend/src/features/**/services`, luego `httpClient`.
- Auth/roles: confirma claims en `backend/auth-service/**` antes de cambiar navegación o permisos.
- Endpoint backend: revisa controller, service, repository, DTO y tests del microservicio.
- CI/QA: revisa `.github/workflows`, `docs/qa-testing.md`, `gh pr checks` y logs fallidos.
- Datos/modelo: revisa `docs/modelo-datos-alovecino.md`, SQL en `docs/` y entidades JPA.
- Deploy/ambientes: revisa `docs/eas-mobile-delivery.md`, `docs/produccion-aws-ec2-av-82-hu-24.md` y scripts de `scripts/`.

## Lecciones Validadas

- No mezcles implementaciones paralelas de dashboard sin revisar conflictos de Expo Router y auth.
- Prefiere roles desde JWT sobre campos ad hoc en `user`.
- No aceptes artefactos generados como `backend.zip` en PRs.
- En PRs a `qa`, valida el origen permitido por el gate de promoción.
- Si Sonar usa `sonar.java.binaries`, compila cada módulo listado antes del scan.
- Si una pantalla usa mocks (`mock*`, `actualizar*Mock`), decláralo en review cuando se espere persistencia.
- Antes de mergear varios PRs, valida también la interacción entre ellos, no solo cada PR contra base.

## Matriz Mínima De Validación

- Frontend-only: `cd frontend; npm test -- --runInBand` o tests Jest dirigidos.
- Backend servicio único: `mvn -f backend/<service>/pom.xml test`.
- Auth/gateway compartido: corre tests de `auth-service`, `api-gateway` y el servicio afectado.
- Workflows/QA: usa `gh pr checks`, `gh run view --log-failed` e inspección YAML.
- Merge readiness: usa `gh pr view --json mergeable,mergeStateStatus,reviewDecision,statusCheckRollup` y `git merge-tree --write-tree`.
- SkillOpt local: antes de promover cambios al skill, corre `scripts/measure-skill-budget.ps1` y `scripts/evaluate-skillopt.ps1`.
- Comandos fuera del sandbox: si el sandbox falla o se requiere red/GitHub, pide permiso explícito con justificación y alcance acotado antes de ejecutar.

## Disciplina De Tokens

- Empieza por este archivo, no por todo el repo.
- Lee solo archivos nombrados por la tarea o por las rutas de inspección.
- Resume aprendizajes durables en `docs/skillopt/trajectory-log.md`.
- Promueve al skill solo reglas repetibles, validadas y útiles para futuras tareas.
- Mantén este archivo bajo el presupuesto de `docs/skillopt/config.json`.
- Si una tarea exige permisos elevados, documenta qué comando se ejecutó y por qué en el cierre o en el log si deja una lección durable.
