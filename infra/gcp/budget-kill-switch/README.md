# Budget kill switch - Aló Vecino

Cloud Function asociada al budget mensual de Google Cloud.

Flujo:

1. Cloud Billing Budget emite una notificación a Pub/Sub.
2. Pub/Sub dispara `budgetKillSwitch`.
3. Si `alertThresholdExceeded >= DISABLE_AT_PERCENT`, la función deshabilita las APIs definidas en `SERVICES_TO_DISABLE`.

Variables:

- `PROJECT_ID`: proyecto donde se deshabilitan servicios.
- `DISABLE_AT_PERCENT`: umbral de corte. Para 100%, usar `1`.
- `SERVICES_TO_DISABLE`: lista separada por coma. Por defecto:
  - `geocoding-backend.googleapis.com`
  - `maps-android-backend.googleapis.com`

Nota: Google Cloud Budgets no es un límite duro en tiempo real. Esta función reduce el riesgo deshabilitando servicios después de recibir la alerta programática.
