# 📝 Resumen
Se implementa la configuración de preferencias de usuario para AV-85/HU-26, integrando backend, gateway y frontend. El `usuarios-service` expone la lectura/actualización de preferencias protegidas por usuario, el `api-gateway` enruta `/api/configuracion/**`, y la app móvil permite cargar/guardar configuración, cerrar sesión desde la pantalla de configuración y ajustar el radio de búsqueda en Home.

También se incorpora SkillOpt al proyecto para optimizar el uso de contexto/tokens con documentación, set de validación y scripts de medición/evaluación.

# 🔗 Trazabilidad
- **Jira ID:** AV-85
- **Historia de Usuario:** HU-26

# 🛠️ Tipo de cambio
- [x] **feat**: Nueva funcionalidad
- [ ] **fix**: Corrección de error
- [ ] **refactor**: Mejora de código (sin cambio funcional)
- [x] **docs**: Documentación
- [ ] **chore**: Mantenimiento/Dependencias

# ✅ Criterios de Aceptación (Referencia HU)
Criterios cubiertos por este PR:
- [x] CA-01: El backend permite consultar la configuración de un usuario autenticado mediante `/api/configuracion/{idUsuario}`.
- [x] CA-02: El backend permite actualizar preferencias de notificaciones, radio de ofertas, visibilidad de perfil y uso de biometría.
- [x] CA-03: El backend valida que el usuario autenticado solo pueda operar sobre su propia configuración.
- [x] CA-04: Si el usuario no tiene configuración persistida, se entrega una configuración por defecto.
- [x] CA-05: El `api-gateway` enruta correctamente `/api/configuracion/**` hacia `usuarios-service`.
- [x] CA-06: La pantalla móvil de Configuración carga y guarda preferencias reales usando `configuracionService`.
- [x] CA-07: La pantalla Home permite ajustar el radio de búsqueda y recargar almacenes cercanos según el radio seleccionado.
- [x] CA-08: La pantalla de Configuración mantiene cierre de sesión funcional y limpia la sesión local.
- [x] CA-09: SkillOpt queda documentado y medible mediante `best_skill.md`, protocolo, set de validación y scripts.

# 🧪 Evidencia y QA
- [x] Frontend: `npm test -- --runInBand` ejecutado en `frontend` con resultado PASS: 12 suites, 45 tests.
- [x] Backend usuarios-service: `mvn -f backend/usuarios-service/pom.xml test` con BUILD SUCCESS: 20 tests, 0 failures, 0 errors, 1 skipped.
- [x] Backend api-gateway: `mvn -f backend/api-gateway/pom.xml test` con BUILD SUCCESS: 20 tests, 0 failures, 0 errors, 0 skipped.
- [x] SkillOpt: `./scripts/evaluate-skillopt.ps1 -Candidate docs/skillopt/best_skill.md` con Score 100 y Passed True.
- [ ] Capturas de pantalla, logs o video adjunto (Obligatorio para UI): pendiente adjuntar captura en GitHub si el equipo lo exige para la validación visual.

# 📋 Checklist Técnico
- [x] El título del PR sigue el formato: `feat: [AV-85][HU-26] configurar API de preferencias de usuario`.
- [ ] Los mensajes de los commits incluyen el ID de Jira (`[AV-85][HU-26]`): los commits funcionales lo incluyen; los commits de documentación SkillOpt usan prefijo `docs:` sin ID por ser soporte transversal.
- [x] No rompe compatibilidad con otras ramas: rama actualizada con `origin/dev` y conflicto resuelto en `ConfiguracionScreen.js`.
- [x] Las variables de entorno (.env) están actualizadas en el grupo: no se agregan variables nuevas para AV-85/HU-26.

# 🚀 Notas de Despliegue
No requiere variables de entorno nuevas. La configuración se expone a través del gateway por `/api/configuracion/**` y requiere autenticación JWT. Los workflows existentes cubren el flujo del PR: `frontend-ci.yml` ejecuta pruebas frontend para cambios en `frontend/**` y `backend-ci.yml` ejecuta pruebas de servicios backend sobre PRs a `dev`, por lo que no se agregó código nuevo de workflow.

HU recomendada fuera del alcance de este PR:

**Título sugerido:** `[AV-XX][HU-XX] aplicar preferencias guardadas de radio de búsqueda al mapa de inicio`

**Enunciado Jira:** Como cliente autenticado, quiero que mi radio de búsqueda guardado en Configuración se aplique automáticamente al mapa de inicio, para ver almacenes según mis preferencias sin reajustarlo manualmente.

**Criterios de Aceptación / DoD sugeridos:**
- [ ] CA-01: Home carga `radioOfertasKm` desde `/api/configuracion/{idUsuario}` al iniciar sesión.
- [ ] CA-02: El selector de radio en Home refleja la preferencia guardada.
- [ ] CA-03: Si el usuario cambia la preferencia en Configuración, Home usa el nuevo valor en la próxima carga o regreso de foco.
- [ ] CA-04: Si la carga de configuración falla, Home usa un valor por defecto no bloqueante.
- [ ] CA-05: Se agregan pruebas de servicio/pantalla para éxito, fallback y cambio de radio.
- [ ] DoD: PR creado con plantilla `.github/pull_request_template.md`, evidencia de tests, trazabilidad Jira/HU y validación de CI.
