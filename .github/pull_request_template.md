# 📝 Resumen
Se implementa la pantalla de registro de cliente en la app móvil React Native (Expo). Incluye el formulario completo con validación de campos, máscara automática para la fecha de nacimiento (DD/MM/AAAA), estructura de navegación entre pantallas de autenticación (Splash → Selección → Registro / Login → Home) y el servicio `registerService` preparado para conectarse al backend en una tarea posterior.

# 🔗 Trazabilidad
- **Jira ID:** AV-26
- **Historia de Usuario:** HU-01

# 🛠️ Tipo de cambio
- [x] **feat**: Nueva funcionalidad
- [ ] **fix**: Corrección de error
- [ ] **refactor**: Mejora de código (sin cambio funcional)
- [ ] **docs**: Documentación
- [ ] **chore**: Mantenimiento/Dependencias

# ✅ Criterios de Aceptación (Referencia HU)
Copia aquí los criterios de la historia que este PR completa:
- [x] CA-01: Formulario de registro con campos: nombre completo, nombre de usuario, correo electrónico, contraseña, confirmar contraseña y fecha de nacimiento.
- [x] CA-02: Validación de campos con mensajes de error (esquema Zod via `react-hook-form`).
- [x] CA-03: Máscara automática DD/MM/AAAA en el campo fecha de nacimiento.
- [ ] CA-04: Conexión real con el endpoint `/api/usuarios` del `usuarios-service` (actualmente en modo mock, pendiente de conectar con la URL del entorno real).
- [x] CA-05: Navegación funcional: Splash → Selección de auth → Registro / Login → Home.

# 🧪 Evidencia y QA
- [x] Pruebas unitarias/integración ejecutadas (`loginSchema.test.js`, `authService.test.js`, `AuthSelectionScreen.test.js`).
- [x] Build exitoso (Local).
- [ ] Capturas de pantalla, logs o video adjunto (Obligatorio para UI).

# 📋 Checklist Técnico
- [x] El título del PR sigue el formato: `feat: [AV-26][HU-01] pantalla de registro de cliente`.
- [x] Los mensajes de los commits incluyen el ID de Jira (`[AV-26][HU-01]`).
- [x] No rompe compatibilidad con otras ramas.
- [ ] Las variables de entorno (.env) están actualizadas en el grupo.

# 🚀 Notas de Despliegue
No requiere migraciones de base de datos. `registerService.js` tiene la llamada al backend implementada (`/api/usuarios`) pero opera en modo mock mientras `API_BASE_URL` apunte a `example.com`. La conexión real se activa configurando la URL correcta en `frontend/src/config/environment.js` — esto queda pendiente para la tarea de integración frontend-backend.
