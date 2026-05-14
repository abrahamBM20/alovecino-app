# Sprint Review y Retrospective - AloVecino

Documento preparado para presentar el estado del proyecto luego de 4 sprints. La trazabilidad se basa en el historial de ramas, PRs, workflows y pruebas automatizadas del repositorio.

## 1. Resumen Ejecutivo

Durante los primeros 4 sprints el equipo avanzo desde una base inicial de aplicacion movil y microservicios hasta un entregable verificable en QA, con pipeline de calidad, ambiente QA, evidencias automatizadas y preparacion de despliegue productivo.

El primer entregable formal se consolida recien en el Sprint 4, pero los sprints anteriores aportaron capacidades base: registro, autenticacion, gateway, modelo de datos, migracion de servicios, configuracion QA y preparacion de produccion.

Evidencia principal disponible:

- QA Release Candidate aprobado: https://github.com/abrahamBM20/alovecino-app/actions/runs/25690421341
- Unit coverage and static analysis: exitoso.
- API and K6 evidence: exitoso.
- Mobile E2E smoke: exitoso.
- PR de regularizacion `qa -> dev`: #44.
- PR de promocion `qa -> main`: #45.
- PR de control de builds EAS: #46.

## 2. Historias de Usuario Avanzadas

| AV / HU | Nombre funcional | Estado | Evidencia principal |
| --- | --- | --- | --- |
| AV-26 / HU-01 | Registro de cliente y almacen | Avanzada / integrada | Pantallas de registro, validacion frontend, mapeo a contrato backend |
| AV-28 / HU-03 | Login, autenticacion y sesion | Avanzada / integrada | Login frontend, auth-service, JWT, refresh token, logout |
| AV-72 / HU-20 | API Gateway y flujo JWT | Avanzada / integrada | Rutas Gateway, seguridad JWT, health endpoints |
| AV-73 / HU-11 | Modelo de datos backend para autenticacion | Avanzada | Documentacion tecnica y base para migracion |
| AV-74 / HU-12 | Sesiones y refresh token en auth-service | Avanzada / integrada | Tests de login, refresh, rotacion y logout |
| AV-75 / HU-13 | Modelo de usuarios, clientes y almacenes | Avanzada / integrada | Tests de creacion de cliente/almacen y entidades relacionadas |
| AV-76 / HU-18 | Ajuste Gateway a migracion auth | Avanzada / integrada | Registro publico permitido y rutas protegidas con JWT |
| AV-78 / HU-22 | Ajuste registro a modelo de datos | Avanzada / integrada | Payload frontend alineado a contrato backend |
| AV-80 / HU-23 | Configuracion ambiente QA y evidencias | Entregable validado | QA Release Candidate, Postman, K6, Appium, Semgrep, coverage |
| AV-82 / HU-24 | Produccion AWS EC2 | Preparada para promocion | Workflow `prod-cd.yml`, bundle backend, deploy por SSH y Docker Compose |
| AV-32 / HU-07 | Chat / consultas con minimarket | Avance parcial | Ramas y commits de UI/chat, sin evidencia final en QA actual |
| AV-77 / HU-21 | Mapa interactivo / geolocalizacion | Avance parcial | Ramas de mapa/assets, no forma parte del entregable QA final |

## 3. Casos de Uso Verificados por Pruebas

### 3.1 Autenticacion y Sesion

| Caso de uso | Actor | Objetivo | Validacion automatizada |
| --- | --- | --- | --- |
| Iniciar sesion con credenciales validas | Usuario registrado | Obtener sesion activa | `AuthServiceApplicationTests.loginReturnsAccessTokenAndRefreshTokenForSeededUser`, `authService.test.js` |
| Rechazar login invalido | Usuario no autenticado | Evitar acceso con password incorrecta | `AuthServiceApplicationTests.loginReturnsUnauthorizedForInvalidPassword`, Postman `Auth rejects invalid login` |
| Emitir access token JWT RS256 | Auth service | Entregar token verificable por Gateway | Test valida formato JWT, algoritmo RS256, claims `sid`, `session_id`, `email`, `roles` |
| Guardar refresh token seguro | Auth service | Mantener sesion renovable sin exponer token en body | Test valida cookie `HttpOnly`, hash persistido y ausencia de refresh token en respuesta JSON |
| Rotar refresh token | Usuario autenticado | Renovar access token y revocar token anterior | `refreshRotatesRefreshTokenAndRejectsOldToken` |
| Rechazar refresh expirado | Usuario autenticado | Invalidar tokens vencidos | `refreshReturnsUnauthorizedForExpiredRefreshToken` |
| Cerrar sesion | Usuario autenticado | Revocar sesion y refresh token | `logoutRevokesRefreshToken` |
| Publicar JWKS | Gateway / clientes internos | Permitir validacion de JWT | `jwksExposesPublicSigningKey` |

### 3.2 Registro de Usuario Cliente y Almacen

| Caso de uso | Actor | Objetivo | Validacion automatizada |
| --- | --- | --- | --- |
| Registrar cliente | Visitante | Crear cuenta tipo cliente con direccion y configuracion | `UsuarioServiceTests.shouldCreateClienteWithDireccionConfiguracionAndBcryptPassword` |
| Registrar almacen | Dueño de almacen | Crear cuenta almacen con estado inicial pendiente | `UsuarioServiceTests.shouldCreateAlmacenWithDireccionAndConfiguracion` |
| Validar RUT chileno | Visitante | Evitar cuentas con RUT invalido | `registerSchema.test.js`, `UsuarioServiceTests.shouldRejectInvalidRut` |
| Evitar duplicados | Sistema | Proteger unicidad de RUT, correo y nombre de usuario | `shouldRejectDuplicateRutCorreoAndNombreUsuario` |
| Cifrar password | Sistema | No persistir contrasenas en texto plano | Tests validan BCrypt y `passwordEncoder.matches` |
| Mapear formulario cliente a backend | Frontend | Enviar contrato correcto a `/api/usuarios` | `registerService.test.js` |
| Mapear formulario almacen a backend | Frontend | Enviar `tipoCuenta=ALMACEN` y `nombreAlmacen` | `registerService.test.js` |
| Aceptar caracteres locales | Usuario chileno | Permitir ñ, tildes y nombres reales | `registerSchema.test.js`, `almacenSchema.test.js` |
| Exigir fecha a clientes | Sistema | Cumplir regla de datos cliente | `registerSchema.test.js` |
| Exigir nombre de almacen | Sistema | Cumplir regla de datos almacen | `registerSchema.test.js` |

### 3.3 Navegacion y Experiencia Mobile

| Caso de uso | Actor | Objetivo | Validacion automatizada |
| --- | --- | --- | --- |
| Ver pantalla Splash con marca | Usuario movil | Reconocer AloVecino al iniciar app | `SplashScreen.test.js` |
| Ir a login desde seleccion auth | Usuario movil | Acceder a inicio de sesion | `AuthSelectionScreen.test.js` |
| Ir a registro desde seleccion auth | Usuario movil | Crear una cuenta | `AuthSelectionScreen.test.js` |
| Empaquetar logos localmente | App mobile | Evitar assets remotos rotos en APK QA | `assets.test.js` |
| Abrir APK QA en emulador Android | QA / CI | Validar smoke E2E real | `tests/e2e/appium/alovecino-smoke.test.js` |
| Confirmar UI inicial del APK | QA / CI | Verificar que la app renderiza textos clave | Appium busca `AloVecino`, `Crear Cuenta`, `Correo` o `Contrase` en page source |

### 3.4 API Gateway y Seguridad

| Caso de uso | Actor | Objetivo | Validacion automatizada |
| --- | --- | --- | --- |
| Consultar health sin token | Operacion / CI | Verificar disponibilidad | `JwtSecurityConfigTests.shouldAllowHealthEndpointsWithoutToken`, Postman, K6 |
| Proteger rutas privadas | Usuario no autenticado | Bloquear acceso a recursos protegidos | `shouldRequireTokenForProtectedRoutes` |
| Permitir registro publico | Visitante | Crear cuenta sin JWT previo | `shouldAllowUserRegistrationWithoutToken` |
| Permitir preflight CORS de registro | Frontend Expo Web | Evitar bloqueo CORS en registro | `shouldAllowRegistrationPreflightFromExpoWebWithoutToken` |
| Registrar rutas esperadas | Gateway | Enrutar auth, usuarios, almacenes, consultas, valoraciones y ofertas | `GatewayRoutesConfigTests` |
| Validar issuer y audience JWT | Gateway | Aceptar solo tokens del auth-service esperado | `JwtDecoderConfigTests` |
| Propagar/generar request id | Operacion / observabilidad | Trazar peticiones | `RequestIdFilterTests` |

### 3.5 Integracion API, Rendimiento y QA

| Caso de uso | Actor | Objetivo | Validacion automatizada |
| --- | --- | --- | --- |
| Gateway saludable en QA | QA / DevOps | Confirmar ambiente vivo | Postman `Gateway health is ready`, K6 health |
| Login invalido responde 401 | QA / Seguridad | Confirmar contrato auth negativo | Postman |
| Endpoint usuarios disponible | QA / Integracion | Confirmar contrato estable aunque requiera auth | Postman y K6 aceptan `200`, `401` o `403` |
| OpenAPI publicado | QA / Integracion | Exponer contrato de API | Postman y K6 |
| Rendimiento smoke | QA / DevOps | Validar estabilidad basica bajo carga liviana | K6 con 10 a 25 VUs, `http_req_failed < 2%`, `p95 < 1500 ms` |
| Warm-up de servicios QA | QA / DevOps | Mitigar latencia de Render Free | Workflow `qa-release-candidate.yml` |
| Evidencia descargable | QA / Auditoria | Adjuntar resultados al proceso de aprobacion | Artifacts de GitHub Actions |

### 3.6 Produccion y Control de Builds

| Caso de uso | Actor | Objetivo | Validacion / Implementacion |
| --- | --- | --- | --- |
| Desplegar backend en EC2 | DevOps | Publicar microservicios productivos | `prod-cd.yml`: package, bundle, SSH, Docker Compose, health check |
| Evitar builds EAS innecesarios | Product Owner / DevOps | Cuidar cuota pagada de Expo | Builds en `dev` solo manuales; QA/prod gateados por variables |
| Construir APK/AAB solo cuando corresponde | DevOps | Ejecutar EAS por ambiente bajo control | `workflow_dispatch` o variables GitHub en `true` solo cuando se requiera build |

## 4. Cobertura por Tipo de Prueba

| Capa | Herramienta | Que cubre | Estado |
| --- | --- | --- | --- |
| Unitarias backend | JUnit / Spring Boot | Auth, usuarios, gateway, seguridad, rutas, request id | Activa en CI |
| Unitarias frontend | Jest / React Native Testing Library | Formularios, navegacion, servicios, assets | Activa en CI |
| Integracion API | Postman / Newman | Health, auth negativo, usuarios, OpenAPI | Activa en QA Release Candidate |
| Performance smoke | K6 | Health, OpenAPI, usuarios bajo carga liviana | Activa en QA Release Candidate |
| E2E mobile | Appium / UiAutomator2 | APK QA en emulador Android | Activa con `APPIUM_APK_URL` |
| Estatico | Semgrep / cobertura | Analisis repo completo y reportes | Activa en QA Release Candidate |
| Deploy productivo | GitHub Actions / SSH / Docker Compose | Backend a EC2 | Preparado para `main` |

## 5. Sprint Review por Sprint

### Sprint 1 - Base de Producto y Primeros Flujos Mobile

Objetivo del sprint:

- Iniciar la estructura del producto AloVecino.
- Construir las primeras pantallas mobile.
- Organizar frontend y backend en el repositorio.

Trabajo avanzado:

- AV-26 / HU-01: inicio del registro de cliente.
- AV-28 / HU-03: primeras bases de login/sesion.
- Reorganizacion de proyecto hacia `frontend` y servicios backend.
- Primeros ajustes de convenciones Git y estructura de ramas.

Resultado:

- No hubo entregable final desplegable.
- Se genero base tecnica necesaria para iterar.

Demo posible:

- Navegacion inicial mobile.
- Pantalla de registro preliminar.
- Estructura del repositorio y convenciones.

Riesgos observados:

- Falta de pipeline QA.
- Cambios grandes sin evidencia automatizada suficiente.
- Necesidad de ordenar convenciones y ramas.

### Sprint 2 - Autenticacion, Gateway y Servicios Base

Objetivo del sprint:

- Dar soporte backend real a login, autenticacion y enrutamiento.
- Separar responsabilidades entre auth-service, usuarios-service y api-gateway.

Trabajo avanzado:

- AV-28 / HU-03: login, JWT y sesion.
- AV-72 / HU-20: API Gateway, JWKS y rutas.
- AV-74 / HU-12: refresh token y manejo de sesiones.
- AV-75 / HU-13: migracion de usuarios al modelo de datos.

Resultado:

- Aumento fuerte de capacidad backend.
- Se agregaron pruebas relevantes de auth, gateway y usuarios.
- No hubo aun entregable funcional estable de punta a punta.

Demo posible:

- Login tecnico contra backend.
- Health endpoints.
- Rutas Gateway protegidas y publicas.
- JWKS publicado por auth-service.

Riesgos observados:

- Integracion entre servicios todavia inmadura.
- Falta de ambiente QA persistente.
- Necesidad de alinear frontend con el contrato backend.

### Sprint 3 - Modelo de Datos, Registro Integrado y QA Inicial

Objetivo del sprint:

- Alinear registro frontend con el modelo backend.
- Preparar ambiente QA y evidencias.
- Comenzar a validar contratos reales.

Trabajo avanzado:

- AV-73 / HU-11: documentacion/modelo de datos backend.
- AV-76 / HU-18: ajustes de Gateway por migracion auth.
- AV-78 / HU-22: registro ajustado al nuevo contrato.
- AV-80 / HU-23: primera configuracion QA, Render, Neon, Postman, K6 y Semgrep.

Resultado:

- Ya existia mayor trazabilidad y automatizacion.
- QA aun presentaba inestabilidad por Render Free, builds Expo y Appium.
- No se considero entregable listo porque faltaba evidencia live consistente.

Demo posible:

- Registro cliente/almacen validado por frontend.
- Contrato `/api/usuarios`.
- Pipeline QA con pasos diferidos.

Riesgos observados:

- Servicios free tier se duermen y afectan pruebas.
- Appium consume muchos minutos de CI.
- Builds Expo tienen cuota limitada.

### Sprint 4 - Entregable QA, Evidencias y Preparacion Produccion

Objetivo del sprint:

- Consolidar un entregable validado en QA.
- Generar evidencia automatizada para promover a produccion.
- Preparar deploy de backend a EC2.

Trabajo avanzado:

- AV-80 / HU-23: estabilizacion QA live, Postman, K6 y Appium.
- AV-82 / HU-24: configuracion de produccion en AWS EC2.
- Control de builds EAS para evitar gasto accidental de cuota.
- Regularizacion del flujo de ramas `qa -> dev`.
- Preparacion de PR `qa -> main`.

Resultado:

- Primer entregable con evidencia completa.
- QA Release Candidate aprobado.
- Mobile E2E smoke aprobado con KVM.
- Produccion lista para promocion de backend a EC2.

Demo recomendada:

1. Mostrar PR de promocion `qa -> main`.
2. Mostrar GitHub Actions QA Release Candidate exitoso.
3. Mostrar health del gateway QA.
4. Mostrar evidencia Postman/K6.
5. Mostrar Appium mobile smoke exitoso.
6. Explicar control de builds EAS para cuidar cuota.

Riesgos remanentes:

- Cuota Expo agotada hasta pagar o esperar renovacion.
- Produccion depende de secrets EC2/Neon/JWT correctamente configurados.
- EAS production build debe ejecutarse solo cuando `ENABLE_PROD_EAS_BUILD=true`.

## 6. Retrospective por Sprint

### Sprint 1

Que funciono:

- Se logro levantar una base mobile y backend inicial.
- El equipo empezo a ordenar estructura de carpetas y convenciones.

Que no funciono:

- No habia una definicion clara de entregable.
- Las pruebas y CI no eran aun criterio central de avance.

Aprendizajes:

- Antes de crecer funcionalidades, se necesita una base de calidad y convenciones.
- Los cambios grandes sin pipeline generan deuda de integracion.

Acciones de mejora:

- Mantener ramas por HU.
- Exigir PR con plantilla.
- Asociar commits a AV/HU.

### Sprint 2

Que funciono:

- Se avanzo fuerte en arquitectura backend.
- Auth, Gateway y usuarios empezaron a tener responsabilidades claras.

Que no funciono:

- La integracion end-to-end no estaba totalmente demostrable.
- Algunos cambios dependian de contratos que todavia se estaban moviendo.

Aprendizajes:

- Gateway y auth deben estabilizarse antes de construir flujos funcionales encima.
- Las pruebas de contrato reducen retrabajo entre frontend y backend.

Acciones de mejora:

- Mantener tests de rutas y seguridad como obligatorios.
- Documentar contratos OpenAPI.
- Validar login/registro desde frontend contra gateway.

### Sprint 3

Que funciono:

- Se comenzo a formalizar QA.
- Se agregaron evidencias y pruebas automatizadas mas completas.
- Se incorporo el modelo de datos real.

Que no funciono:

- El ambiente QA free tier fue inestable.
- Hubo friccion por builds moviles y servicios dormidos.
- Algunas evidencias quedaban diferidas hasta tener despliegue real.

Aprendizajes:

- Render Free necesita warm-up explicito.
- Appium y EAS deben tratarse como recursos costosos.
- La evidencia debe separarse entre PR, push y ejecucion manual post-deploy.

Acciones de mejora:

- Mantener `QA Release Candidate` manual despues del deploy QA.
- Guardar artifacts de Newman, K6 y Appium.
- Evitar que builds moviles corran automaticamente sin aprobacion.

### Sprint 4

Que funciono:

- Se logro primer entregable validado.
- QA Release Candidate paso completo.
- Appium se estabilizo habilitando KVM.
- Se preparo el camino a produccion con EC2.

Que no funciono:

- Se consumio la cuota gratuita de Expo antes de cerrar produccion.
- Algunos commits llegaron a `qa` antes de pasar por `dev`.
- Hubo que regularizar ramas despues.

Aprendizajes:

- La cuota de builds debe protegerse con variables de control.
- KVM es requisito practico para Appium en GitHub Actions.
- El orden sano es `feature -> dev -> qa -> main`, incluso cuando hay urgencia de estabilizar QA.

Acciones de mejora:

- Mergear PR #46 antes de nuevas promociones.
- Mantener `ENABLE_*_EAS_BUILD=false` por defecto.
- Activar solo el build EAS del ambiente necesario.
- Cerrar regularizacion `qa -> dev` antes o junto a la promocion productiva.

## 7. Estado Actual para Presentar

Entregable disponible:

- Ambiente QA validado con evidencia automatizada.
- Backend listo para despliegue productivo en EC2.
- Mobile E2E smoke validado contra APK QA.
- Workflows de QA y produccion preparados.

Pendiente antes de produccion:

- Aprobar PR #46 para controlar builds EAS.
- Regularizar `qa -> dev` con PR #44.
- Confirmar secrets/variables productivas:
  - `PROD_EC2_HOST`
  - `PROD_EC2_USER`
  - `PROD_EC2_SSH_KEY`
  - `PROD_NEON_DATABASE_URL`
  - `PROD_NEON_DATABASE_USERNAME`
  - `PROD_NEON_DATABASE_PASSWORD`
  - `PROD_APP_JWT_PRIVATE_KEY`
  - `PROD_APP_JWT_PUBLIC_KEY`
  - `PROD_CORS_ALLOWED_ORIGINS`
  - `PROD_API_BASE_URL`
  - `EXPO_TOKEN`
- Mantener `ENABLE_PROD_EAS_BUILD=false` si se quiere desplegar solo backend sin gastar build Expo.
- Activar `ENABLE_PROD_EAS_BUILD=true` solo cuando se quiera generar AAB productivo; usar `ENABLE_PROD_PREVIEW_EAS_BUILD=true` o `workflow_dispatch` para APK `prod-preview`.
