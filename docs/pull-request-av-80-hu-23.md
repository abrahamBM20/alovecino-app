# Resumen
Se configura el ambiente QA de AloVecino con servicios backend en Render, perfil EAS Android QA y pipeline CI/CD para la promocion desde `dev` hacia `qa`. El flujo ejecuta pruebas backend/frontend, permite analisis SonarQube y dispara deploys QA mas build Android con el perfil `qa`.

# Trazabilidad
- **Jira ID:** AV-80
- **Historia de Usuario:** HU-23

# Tipo de cambio
- [x] **feat**: Nueva funcionalidad
- [ ] **fix**: Correccion de error
- [ ] **refactor**: Mejora de codigo (sin cambio funcional)
- [x] **docs**: Documentacion
- [x] **chore**: Mantenimiento/Dependencias

# Criterios de Aceptacion (Referencia HU)
- [x] CA-01: Ambiente Render QA creado para `api-gateway`, `auth-service` y `usuarios-service`.
- [x] CA-02: Servicios QA configurados para desplegar desde branch `qa`.
- [x] CA-03: Perfil EAS `qa` apunta al gateway QA.
- [x] CA-04: Workflow `QA CI/CD` ejecuta pruebas en PR hacia `qa`.
- [x] CA-05: Workflow `QA CI/CD` gatilla deploy Render QA y build Android EAS QA en push a `qa`.
- [x] CA-06: SonarQube queda integrado como paso opcional mediante secretos/variables.

# Evidencia y QA
- [x] Pruebas backend ejecutadas localmente.
- [x] Pruebas frontend ejecutadas localmente.
- [ ] Primer deploy QA validado en Render. Bloqueado hasta promover `dev` hacia `qa`; la rama `qa` actual no contiene los Dockerfiles de los servicios.
- [x] Build EAS QA iniciado con perfil `qa` y estado `IN_PROGRESS`. Build URL: https://expo.dev/accounts/alovecino/projects/alovecino-app/builds/4088332c-5728-4d3a-8ae0-d2935f696f96

# Checklist Tecnico
- [x] El titulo del PR sigue el formato: `AV80 HU-23 - configurar ambiente QA`.
- [x] Los mensajes de commits incluyen el ID de Jira (`[AV-80][HU-23]`).
- [x] No mezcla cambios pendientes de AV-78.
- [x] Variables/secretos requeridos documentados.

# Notas de Despliegue
Configurar en GitHub los secretos `EXPO_TOKEN`, `RENDER_API_KEY`, `SONAR_TOKEN`, `SONAR_HOST_URL` y la variable `SONAR_ENABLED=true` si se quiere activar SonarQube. Los servicios Render QA ya existen y apuntan a la branch Git `qa`.
