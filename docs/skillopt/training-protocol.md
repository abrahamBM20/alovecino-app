# Protocolo SkillOpt Para AloVecino

Este flujo adapta SkillOpt al repositorio. La idea no depende del idioma: SkillOpt entrena instrucciones en lenguaje natural. Para este proyecto conviene español porque el equipo, las historias y muchas evidencias están en español. Lo importante es que el skill sea compacto, validado y reutilizable.

## Objetivo

Reducir tokens y errores repetidos manteniendo un artefacto estable:

- `docs/skillopt/best_skill.md`: skill desplegable actual.
- `docs/skillopt/candidates/`: skills candidatos.
- `docs/skillopt/trajectory-log.md`: rollouts, errores, reviews y aprendizajes.
- `docs/skillopt/validation-set.json`: pruebas de validación del skill.
- `docs/skillopt/config.json`: presupuesto y reglas del optimizador textual.
- `scripts/evaluate-skillopt.ps1`: compuerta automática local.
- `scripts/measure-skill-budget.ps1`: estimación de tokens.

## Traducción Del Concepto SkillOpt

SkillOpt original:

- Estado entrenable: documento de skill.
- Rollouts: intentos del agente resolviendo tareas.
- Optimizador: propone ediciones acotadas.
- Learning rate textual: limita cuánto puede cambiar el skill.
- Gate de validación: acepta solo si el candidato mejora.
- Artefacto final: `best_skill.md`.

Adaptación AloVecino:

- Estado entrenable: `docs/skillopt/best_skill.md`.
- Rollouts: PR reviews, fixes de CI, cambios frontend/backend, deploys y errores reales.
- Optimizador: humano o agente propone un candidato en `docs/skillopt/candidates/`.
- Learning rate textual: máximo de líneas agregadas/reemplazadas por iteración definido en `config.json`.
- Gate: presupuesto de tokens, secciones requeridas, patrones obligatorios/prohibidos y validación manual.
- Artefacto final: se reemplaza `best_skill.md` solo si el candidato supera el gate.

## Ciclo De Entrenamiento

1. **Recolectar rollout**
   - Registra en `trajectory-log.md` la tarea, archivos relevantes, fallo/éxito y lección candidata.
   - No pegues logs completos; resume lo que sería útil en futuras sesiones.

2. **Crear candidato**
   - Copia `best_skill.md` a `docs/skillopt/candidates/skill_vNNNN.md`.
   - Aplica una edición acotada: agregar, eliminar o reemplazar una sección pequeña.
   - Cada edición debe resolver una lección del log.

3. **Validar**
   - Ejecuta:

```powershell
./scripts/evaluate-skillopt.ps1 -Candidate docs/skillopt/candidates/skill_vNNNN.md
```

   - El candidato debe superar el score mínimo y no exceder el presupuesto.

4. **Comparar contra best**
   - Si el candidato pasa el gate, compáralo manualmente contra `best_skill.md`.
   - Acepta solo si reduce contexto esperado, previene un error real o mejora rutas de inspección.

5. **Promover**
   - Reemplaza `best_skill.md`.
   - Registra en `trajectory-log.md`: candidato, score, decisión y motivo.

## Gate De Aceptación

Un candidato se acepta si cumple todo:

- Está bajo `max_tokens` en `config.json`.
- Tiene todas las secciones requeridas por `validation-set.json`.
- Incluye los contratos críticos del repo: JWT roles, `httpClient`, gate QA, validaciones por tipo de cambio.
- No introduce instrucciones temporales como ramas puntuales ya mergeadas.
- Mejora o mantiene el score de `best_skill.md`.
- La edición está respaldada por una observación real en `trajectory-log.md`.

Se rechaza si:

- Copia documentación larga que ya existe en otro archivo.
- Agrega detalles efímeros de una rama, PR o bug puntual.
- Supera el presupuesto sin eliminar contexto menos útil.
- Repite reglas que ya estaban cubiertas.

## Parámetros Recomendados

- Épocas: 1 por bloque de 5 a 10 tareas relevantes.
- Batch de rollouts: 3 a 5 observaciones del log.
- Learning rate textual: máximo 12 líneas nuevas o 8 líneas reemplazadas por candidato.
- Presupuesto inicial: 1400 tokens estimados.
- Métrica local: score de `evaluate-skillopt.ps1` más revisión humana.

## Uso Diario

- Antes de pedir ayuda a un agente: abre `best_skill.md`.
- Durante una tarea: carga archivos concretos, no carpetas completas.
- Después de una tarea con aprendizaje durable: actualiza `trajectory-log.md`.
- Cuando el log acumule suficiente evidencia: genera y valida un candidato.

## Pull Requests

Antes de crear un PR, lee `.github/pull_request_template.md` y usa sus secciones en el body. No reemplaces la plantilla por un resumen libre. Si falta información, conserva la sección y marca claramente lo pendiente.

La plantilla actual exige:

- Resumen.
- Trazabilidad con Jira ID e Historia de Usuario.
- Tipo de cambio.
- Criterios de Aceptación de la HU.
- Evidencia y QA.
- Checklist Técnico.
- Notas de Despliegue.

## Permisos Y Sandbox

El flujo permite ejecutar comandos fuera del sandbox cuando sea necesario, pero siempre con solicitud de permiso y una justificación concreta. La solicitud debe explicar el objetivo del comando, no solo el comando mismo.

Ejemplos aceptables:

- Consultar PRs o checks con `gh` cuando se necesita estado remoto actual.
- Ejecutar `git fetch` para validar mergeabilidad contra `dev`.
- Correr tests que requieren acceso fuera del sandbox por limitaciones del entorno local.

Regla de registro:

- Si el comando elevado descubre una lección durable, anótala en `trajectory-log.md`.
- Si solo fue una verificación puntual, basta con reportarla en el cierre de la tarea.
