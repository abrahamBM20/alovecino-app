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
