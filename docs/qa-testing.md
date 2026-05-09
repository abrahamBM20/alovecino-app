# Estrategia de pruebas AloVecino

Este repositorio deja configuradas cinco capas de validacion:

| Capa | Herramienta | Ejecucion |
| --- | --- | --- |
| Estatico | SonarQube/SonarCloud | `.github/workflows/quality-static.yml` |
| Unitario | JUnit + Jest | `.github/workflows/backend-ci.yml` y `.github/workflows/frontend-ci.yml` |
| Integracion/API | Postman + Newman | `.github/workflows/api-integration.yml` |
| E2E movil | Appium | `.github/workflows/mobile-e2e.yml` |
| Rendimiento | K6 | `.github/workflows/performance.yml` |

El flujo recomendado para aprobar el paso a produccion es abrir un PR de `dev` hacia `qa`. Ese PR dispara `.github/workflows/qa-release-candidate.yml`, que genera artefactos descargables con evidencia de:

- reportes Surefire de JUnit;
- reportes JaCoCo de cobertura backend;
- reporte Jest/lcov frontend;
- reporte JSON/JUnit de Newman;
- resumen JSON de K6;
- log Appium cuando existe APK configurado.

## SonarQube QA en Render

Como no es necesario asociar el repositorio a SonarCloud, la opcion recomendada es una instancia SonarQube propia en Render QA:

- Blueprint: `render.qa.sonarqube.yaml`
- Dockerfile: `deploy/sonarqube/Dockerfile`
- Datos persistentes: Render Disk en `/opt/sonarqube/data`
- Base de datos: Render Postgres `alovecino-sonarqube-postgres-qa`

Validar el blueprint localmente:

```powershell
render blueprints validate .\render.qa.sonarqube.yaml
```

Luego crear el Blueprint desde Render Dashboard usando `render.qa.sonarqube.yaml`. La CLI actual valida blueprints, pero la creacion/sync inicial de Blueprint se realiza desde Dashboard.

Cuando SonarQube este arriba:

1. Entrar a `https://alovecino-sonarqube-qa.onrender.com`.
2. Cambiar password inicial de `admin`.
3. Crear un token de analisis.
4. Cargar en GitHub:
   - variable `SONAR_HOST_URL`
   - variable `SONAR_PROJECT_KEY`
   - secret `SONAR_TOKEN`

## Secrets y variables

Como colaborador, la ruta mas practica es usar `workflow_dispatch` para las pruebas que dependen de infraestructura y configurar estos valores en GitHub Actions:

| Nombre | Tipo | Uso |
| --- | --- | --- |
| `SONAR_TOKEN` | Secret | Autenticacion contra SonarQube Render QA. |
| `SONAR_HOST_URL` | Variable | URL de SonarQube Render QA. |
| `SONAR_PROJECT_KEY` | Variable | Project key de Sonar, recomendado `alovecino-app`. |
| `NEON_DATABASE_URL` | Secret | Base QA para levantar servicios en Docker Compose. |
| `NEON_DATABASE_USERNAME` | Secret | Usuario de base QA. |
| `NEON_DATABASE_PASSWORD` | Secret | Password de base QA. |
| `APP_JWT_PRIVATE_KEY` | Secret | Llave privada RSA para auth-service QA. |
| `APP_JWT_PUBLIC_KEY` | Secret | Llave publica RSA para auth-service QA. |
| `QA_BASE_URL` | Variable | URL de un ambiente QA ya desplegado, si no se levanta localmente. |
| `APPIUM_APK_URL` | Secret | URL publica o firmada para descargar el APK usado por Appium. |
| `EXPO_TOKEN` | Secret | Token EAS para compilar APKs Android. |

Puedes cargar los valores con:

```powershell
.\scripts\setup-github-qa-secrets.ps1 -Repo abrahamBM20/alovecino-app
```

El script pide los secretos en tu terminal y los sube con `gh secret set`.

Para preparar o leer la rama QA de Neon y cargar los secrets `NEON_DATABASE_*`:

```powershell
.\scripts\setup-neon-qa.ps1 -Repo abrahamBM20/alovecino-app -ProjectId <neon-project-id> -Branch qa -Database neondb -Role neondb_owner
```

## Uso local

```powershell
cd backend/auth-service
mvn test

cd ../../frontend
npm test -- --runInBand
npm run test:coverage

npx newman run ../tests/postman/alovecino-api.postman_collection.json `
  -e ../tests/postman/local.postman_environment.json

k6 run ../tests/k6/alovecino-smoke.js
```

Las pruebas de Appium requieren un emulador Android, Appium Server y un APK instalado o accesible por `APPIUM_APP_PATH`.

## Evidencia del merge dev a qa

1. Verificar que `qa` exista en GitHub.
2. Abrir PR desde `dev` hacia `qa`.

```powershell
.\scripts\open-dev-to-qa-pr.ps1 -Repo abrahamBM20/alovecino-app
```

3. Esperar el workflow `QA Release Candidate`.
4. Descargar artefactos:
   - `qa-code-quality-evidence`
   - `qa-api-performance-evidence`
   - `qa-mobile-e2e-evidence`
5. Revisar el Quality Gate en SonarQube Render QA.
6. Si todo esta correcto, aprobar y mergear `dev` hacia `qa`.
7. Ejecutar manualmente `QA Release Candidate` contra `QA_BASE_URL` si se quiere una evidencia post-merge.
