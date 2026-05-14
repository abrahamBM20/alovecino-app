# Resumen
Se refuerza la configuracion de produccion de AloVecino agregando un perfil EAS `prod-preview` para generar APK interno con variables productivas, manteniendo el perfil `prod` como AAB para Play Store. Tambien se evita que los builds Expo se generen automaticamente en `push` o PR hacia `dev`, dejando los builds moviles bajo ejecucion manual o variables explicitas.

# Trazabilidad
- **Jira ID:** AV-82
- **Historia de Usuario:** HU-24

# Tipo de cambio
- [x] **feat**: Nueva funcionalidad
- [ ] **fix**: Correccion de error
- [ ] **refactor**: Mejora de codigo (sin cambio funcional)
- [x] **docs**: Documentacion
- [x] **chore**: Mantenimiento/Dependencias

# Criterios de Aceptacion (Referencia HU)
- [x] CA-01: Workflow productivo mantiene build Android `prod` como AAB para publicacion en Google Play.
- [x] CA-02: Perfil EAS `prod-preview` genera APK interno con configuracion productiva para revision visual.
- [x] CA-03: `prod-preview` puede ejecutarse desde GitHub Actions mediante `workflow_dispatch` o variable `ENABLE_PROD_PREVIEW_EAS_BUILD`.
- [x] CA-04: `push` y PR hacia `dev` no generan builds Expo/EAS automaticamente.
- [x] CA-05: La documentacion explica la diferencia entre `prod` y `prod-preview`.
- [x] CA-06: El smoke Appium conserva evidencia descargable con capturas y page source XML.

# Evidencia y QA
- [x] Validacion local de JSON en `frontend/eas.json` y `frontend/package.json`.
- [x] Revision de diff con `git diff --check`.
- [ ] Build EAS `prod-preview` ejecutado. Pendiente hasta habilitar cuota/credenciales y disparar manualmente el workflow.
- [ ] Deploy productivo validado en EC2. Pendiente de ejecucion desde `main` con secrets productivos configurados.

# Checklist Tecnico
- [x] El titulo del PR sigue el formato: `AV82 HU-24 - configurar ambiente de produccion`.
- [x] Los mensajes de commits incluyen el ID de Jira (`[AV-82][HU-24]`).
- [x] No genera builds Expo por `push` o PR hacia `dev`.
- [x] Variables/secretos requeridos quedan documentados.

# Notas de Despliegue
Configurar en GitHub los secrets/variables productivos requeridos por `prod-cd.yml`: `EXPO_TOKEN`, `PROD_API_BASE_URL`, `PROD_EC2_HOST`, `PROD_EC2_USER`, `PROD_EC2_SSH_KEY`, `PROD_NEON_DATABASE_URL`, `PROD_NEON_DATABASE_USERNAME`, `PROD_NEON_DATABASE_PASSWORD`, `PROD_APP_JWT_PRIVATE_KEY`, `PROD_APP_JWT_PUBLIC_KEY` y `PROD_CORS_ALLOWED_ORIGINS`. Mantener `ENABLE_PROD_EAS_BUILD=false` para desplegar solo backend sin gastar builds Expo. Para generar el APK revisable, ejecutar manualmente `Production CI/CD` con `build_prod_preview=true` o activar temporalmente `ENABLE_PROD_PREVIEW_EAS_BUILD=true`.
