# EAS mobile delivery

Esta guia resume como los workflows deciden entre `eas update` y `eas build`.

## Perfiles

- `dev`: development client. Puede requerir Metro.
- `dev-preview`: APK interno instalable para dev. No requiere Metro.
- `qa`: APK interno instalable para QA. No requiere Metro.
- `prod-preview`: APK interno instalable con configuracion productiva. No requiere Metro.
- `prod`: AAB productivo para Play Store.

## Acciones

- `update`: publica un OTA update compatible con el runtime nativo actual.
- `apk`: genera un APK interno instalable.
- `store`: solo produccion; genera el AAB `prod`.
- `auto`: detecta cambios y elige `update` o `apk`.
- `none`: no ejecuta delivery movil.

## Deteccion automatica

El script `scripts/resolve-eas-mobile-action.sh` clasifica los cambios asi:

- Build requerido si cambia runtime nativo/configuracion:
  - `frontend/app.config.js`
  - `frontend/app.json`
  - `frontend/eas.json`
  - `frontend/package.json`
  - `frontend/package-lock.json`
  - `frontend/android/**`
  - `frontend/ios/**`
  - `frontend/plugins/**`
  - iconos o splash usados por la app nativa
- Update permitido si cambian solo JS o assets compatibles con el runtime actual.

La regla es conservadora: si hay duda, genera build en vez de update.

## Variables de control

Para evitar gastar cuota EAS accidentalmente, los push automaticos solo ejecutan delivery movil si estas variables estan activas:

- Dev:
  - `ENABLE_DEV_EAS_UPDATE=true`
  - `ENABLE_DEV_EAS_BUILD=true`
- QA:
  - `ENABLE_QA_EAS_UPDATE=true`
  - `ENABLE_QA_EAS_BUILD=true`
- Produccion:
  - `ENABLE_PROD_EAS_UPDATE=true`
  - `ENABLE_PROD_PREVIEW_EAS_BUILD=true`
  - `ENABLE_PROD_EAS_BUILD=true`

Los `workflow_dispatch` manuales pueden ejecutar la accion elegida sin depender de esas variables.

## Ramas EAS Update

- Dev publica en branch EAS `development`.
- QA publica en branch EAS `qa`.
- Produccion publica en branch EAS `production`.

El `runtimeVersion` usa la policy `appVersion`, por lo que los updates son compatibles mientras no cambie la version nativa de la app.
