# Estrategia de pruebas QA AloVecino

Este repositorio deja configuradas cinco capas de validacion priorizando costo cero. Con GitHub Education se obtiene GitHub Pro para estudiantes, por lo que el margen esperado sube a 3.000 minutos mensuales de GitHub Actions y 1 GB de artifacts para repos privados. La estrategia sigue siendo cuidar minutos y storage: ejecutar lo liviano en cada PR y dejar Appium/builds moviles como pasos manuales u opcionales.

| Capa | Herramienta | Ejecucion |
| --- | --- | --- |
| Estatico | Semgrep + cobertura; Sonar opcional | `.github/workflows/quality-static.yml` |
| Unitario | JUnit + Jest | `.github/workflows/backend-ci.yml` y `.github/workflows/frontend-ci.yml` |
| Integracion/API | Postman + Newman | `.github/workflows/api-integration.yml` |
| E2E movil | Appium | `.github/workflows/mobile-e2e.yml` |
| Rendimiento | K6 | `.github/workflows/performance.yml` |

El flujo recomendado para aprobar el paso a produccion es abrir un PR de `dev` hacia `qa`. Ese PR dispara `.github/workflows/qa-release-candidate.yml`, que genera artefactos descargables con evidencia de:

- reportes Surefire de JUnit;
- reportes JaCoCo de cobertura backend;
- reporte Jest/lcov frontend;
- reporte SARIF de Semgrep;
- reporte JSON/JUnit de Newman;
- resumen JSON de K6;
- log Appium cuando existe APK configurado.

## SonarQube y costo cero

No se levanta SonarQube en Render para el flujo free tier. SonarQube self-hosted necesita servicio web, base de datos y disco persistente; en Render eso obliga a planes pagados. Para evitar billing accidental, el blueprint de SonarQube Render no forma parte de esta rama.

La validacion estatica principal queda en GitHub Actions con Semgrep y reportes de cobertura. Sonar se mantiene solo como integracion opcional: si algun dia el dueno del repositorio habilita SonarQube Cloud o existe una instancia externa ya financiada, basta configurar:

- variable `SONAR_HOST_URL`
- variable `SONAR_PROJECT_KEY`
- secret `SONAR_TOKEN`

## Secrets y variables

Como colaborador, la ruta mas practica es usar `workflow_dispatch` para las pruebas que dependen de infraestructura y configurar estos valores en GitHub Actions. Los valores de Sonar son opcionales.

| Nombre | Tipo | Uso |
| --- | --- | --- |
| `NEON_DATABASE_URL` | Secret | Base QA para levantar servicios en Docker Compose. |
| `NEON_DATABASE_USERNAME` | Secret | Usuario de base QA. |
| `NEON_DATABASE_PASSWORD` | Secret | Password de base QA. |
| `APP_JWT_PRIVATE_KEY` | Secret | Llave privada RSA para auth-service QA. |
| `APP_JWT_PUBLIC_KEY` | Secret | Llave publica RSA para auth-service QA. |
| `QA_BASE_URL` | Variable | URL de un ambiente QA ya desplegado, si no se levanta localmente. |
| `APPIUM_APK_URL` | Secret | URL publica o firmada para descargar el APK usado por Appium. |
| `EXPO_TOKEN` | Secret | Token EAS para compilar APKs Android. |
| `SONAR_TOKEN` | Secret opcional | Token de SonarQube/SonarCloud si se habilita fuera de Render. |
| `SONAR_HOST_URL` | Variable opcional | URL de SonarQube/SonarCloud si existe. |
| `SONAR_PROJECT_KEY` | Variable opcional | Project key de Sonar, recomendado `alovecino-app`. |

Puedes cargar los valores con:

```powershell
.\scripts\setup-github-qa-secrets.ps1 -Repo abrahamBM20/alovecino-app
```

El script pide los secretos en tu terminal y los sube con `gh secret set`.

Para preparar o leer la rama QA de Neon y cargar los secrets `NEON_DATABASE_*`:

```powershell
.\scripts\setup-neon-qa.ps1 -Repo abrahamBM20/alovecino-app -ProjectId <neon-project-id> -Branch qa -Database neondb -Role neondb_owner
```

Para configurar las variables runtime de los tres servicios Render QA sin usar el dashboard:

```powershell
$env:RENDER_API_KEY = "<render-api-key>"
.\scripts\setup-render-qa-env.ps1 -ProjectId super-poetry-34181860 -Branch qa
```

El script usa `neonctl` para obtener la connection string QA, genera llaves RSA para `auth-service` y actualiza variables directamente con la Render API. La CLI de Render v2.16.0 permite listar/validar servicios, pero no expone un comando no interactivo para modificar env vars.

En el flujo normal no deberias necesitar ejecutar ese script: `.github/workflows/qa-cd.yml` configura esas mismas variables automaticamente antes del deploy cuando se hace push a `qa`, usando los secrets de GitHub.

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
5. Revisar que Semgrep, JUnit, Jest, Newman y K6 hayan terminado correctamente.
6. Si todo esta correcto, aprobar y mergear `dev` hacia `qa`.
7. Ejecutar manualmente `QA Release Candidate` contra `QA_BASE_URL` si se quiere una evidencia post-merge.

## Limites free tier

- GitHub Education/GitHub Pro entrega mas margen que GitHub Free, pero no elimina los limites de Actions ni artifacts.
- Render Free duerme servicios tras inactividad y no tiene disco persistente. Es valido para QA, no para produccion.
- Neon Free es preferible para QA porque scalea a cero y evita el vencimiento de 30 dias de Render Postgres Free.
- Appium en Android emulator consume bastante tiempo de CI; por eso queda condicionado a `APPIUM_APK_URL` y con retencion de evidencia reducida.
