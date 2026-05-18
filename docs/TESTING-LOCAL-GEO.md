# Guía de Pruebas Locales: Mapa Google + Servicio Geo

Esta guía explica cómo probar que:
1. El mapa de Google carga correctamente
2. Los almacenes aparecen desde la BD del microservicio de geolocalización

---

## Problema Original

El error era:
```
java.lang.IllegalStateException: API key not found. 
Check that <meta-data android:name="com.google.android.geo.API_KEY" 
android:value="your API key"/> is in the <application> element of AndroidManifest.xml
```

**Solución:** Ya está corregido en `app.config.js`. La API key se inyecta desde `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`.

---

## Cambios Realizados

### 1. `app.config.js`
- Asegura que `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` se inyecte en el AndroidManifest.xml

### 2. `HomeScreen.js`
- **Antes:** Si fallaba la conexión a geo, la pantalla mostraba un error y no se veía el mapa.
- **Ahora:** El mapa SIEMPRE se carga, incluso si falla geo. Los almacenes usan datos de ejemplo si hay error.
- El mapa es independiente del servicio geo.

### 3. `eas.json`
- Añadidas variables de prueba:
  - `EXPO_PUBLIC_USE_LOCAL_GEO`: Habilita o deshabilita uso de geo local
  - `EXPO_PUBLIC_GEO_LOCAL_URL`: URL del servicio geo local

### 4. `geoService.local.js`
- Configurado para conectarse directamente a `http://10.0.2.2:8084`
- Si quieres cambiar, usa `EXPO_PUBLIC_GEO_LOCAL_URL`

---

## Prueba 1: Verificar que el Mapa Carga

### Paso 1: Compilar sin cambios
```bash
cd frontend
expo start --no-dev
```

### Esperado
- La pantalla Home debe mostrar **un mapa** centrado en la ubicación por defecto (-33.4400, -70.7570)
- Si el dispositivo tiene ubicación, debe mostrar la ubicación real del usuario
- Si falla la conexión a geo, debe mostrar un banner naranja: *"No se pudieron cargar los negocios desde el gateway..."*
- El mapa NO desaparece aunque falle geo

Si el mapa NO carga y ves el error de API key, verifica:
- `frontend/eas.json`: ¿tiene `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` con un valor válido?
- `frontend/app.config.js`: ¿tiene la sección `android.config.googleMaps.apiKey`?

---

## Prueba 2: Verificar que los Almacenes Cargan desde BD

### Opción A: Desde el Gateway Local (recomendado)

#### Paso 1: Asegurate que el backend corre
```bash
# Terminal 1: Gateway en puerto 8082
cd backend/api-gateway
mvn spring-boot:run

# Terminal 2: Geolocation Service en puerto 8084
cd backend/geolocation-service
mvn spring-boot:run

# Terminal 3: Auth Service (para generar JWT)
cd backend/auth-service
mvn spring-boot:run
```

#### Paso 2: Obtén un JWT válido
```bash
# En Postman o terminal, POST a:
POST http://localhost:8081/api/auth/login
Content-Type: application/json

{
  "email": "test@alovecino.com",
  "password": "password123"
}

# Copia el `accessToken` de la respuesta
```

#### Paso 3: Prueba el endpoint directamente
```bash
# Reemplaza YOUR_JWT_TOKEN con el token del paso anterior
curl -X GET "http://localhost:8084/api/v1/almacenes/busqueda-espacial?lat=-33.4377&lng=-70.6705&radioKm=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Esperado:** Un JSON con la lista de almacenes de la BD

#### Paso 4: Inicia Expo con geo local
```bash
# Windows CMD
set EXPO_PUBLIC_USE_LOCAL_GEO=true
set EXPO_PUBLIC_GEO_LOCAL_URL=http://10.0.2.2:8084
expo start

# PowerShell
$env:EXPO_PUBLIC_USE_LOCAL_GEO = 'true'
$env:EXPO_PUBLIC_GEO_LOCAL_URL = 'http://10.0.2.2:8084'
expo start
```

**Esperado:**
- El mapa carga
- Los almacenes de la BD aparecen como marcadores en el mapa
- NO debe haber banner naranja de error

---

### Opción B: A Través del Gateway Local

Si prefieres ir a través del gateway en lugar de directamente al servicio geo:

#### Paso 1: Asegurate que el gateway y geo corren (Opción A paso 1)

#### Paso 2: Obtén JWT (Opción A paso 2)

#### Paso 3: Prueba a través del gateway
```bash
curl -X GET "http://localhost:8082/api/v1/almacenes/busqueda-espacial?lat=-33.4377&lng=-70.6705&radioKm=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Esperado:** Mismo resultado que Opción A paso 3

#### Paso 4: Inicia Expo con gateway local
```bash
# Windows CMD
set EXPO_PUBLIC_USE_LOCAL_GEO=true
set EXPO_PUBLIC_GEO_LOCAL_URL=http://10.0.2.2:8082
expo start

# PowerShell
$env:EXPO_PUBLIC_USE_LOCAL_GEO = 'true'
$env:EXPO_PUBLIC_GEO_LOCAL_URL = 'http://10.0.2.2:8082'
expo start
```

**Esperado:** Mismo comportamiento que Opción A

---

## Qué Cambió en la Lógica

### Antes (broken)
```js
useEffect(() => {
  1. Solicitar permisos
  2. Obtener ubicación
  3. Cargar almacenes
     ❌ Si esto fallaba -> pantalla de error completa
     -> El mapa nunca se veía
}, [])
```

### Ahora (fixed)
```js
useEffect(() => {
  1. Solicitar permisos
  2. Obtener ubicación -> setUserLocation, setRegion
  3. Intentar cargar almacenes
     ❌ Si falla -> setGeoError(true), pero el mapa YA está visible
     ✅ El mapa se sigue mostrando
     ✅ Los almacenes son datos de ejemplo si hay error
}, [])
```

---

## Flujo de Render Simplificado

```
¿Permisos denegados?
  SÍ  → Mostrar pantalla de error
  NO  → Continuar

¿Tenemos ubicación del usuario?
  NO  → Mostrar indicador de carga
  SÍ  → Mostrar mapa

¿Fallamos al cargar almacenes?
  SÍ  → Mostrar banner naranja + almacenes de ejemplo
  NO  → Mostrar almacenes reales de BD
```

---

## Checklist Final

- [ ] El mapa carga en HomeScreen
- [ ] El mapa muestra la ubicación del usuario (azul)
- [ ] El mapa dibuja un círculo naranja de 1km alrededor del usuario
- [ ] Si geo local está habilitado y tienes almacenes en BD, aparecen como marcadores
- [ ] Si falla geo, aparece banner naranja pero el mapa sigue visible
- [ ] Puedes tocar un marcador y va a la pantalla de negocio

---

## Próximos Pasos

1. Asegurate de que tienes almacenes en la BD (`almacenes_schema.sql` table)
2. Verifica que `geolocation-service` pueda conectarse a la BD
3. Prueba manualmente con curl antes de probar en la app
4. Si aún falla, revisa los logs de:
   - `geolocation-service` en `localhost:8084`
   - `api-gateway` en `localhost:8082`
   - La app React Native en Expo

---

## Notas Técnicas

### ¿Por qué cambié la URL de geo de 8082 a 8084?

- `8084` es el puerto del `geolocation-service` directo
- `8082` es el puerto del `api-gateway`
- Ambos funcionan, pero `8084` es más directo (sin pasar por el gateway)

### ¿Cómo cambio la URL?

En los comandos de Expo arriba, modifica `EXPO_PUBLIC_GEO_LOCAL_URL`:
```bash
# Para usar gateway
set EXPO_PUBLIC_GEO_LOCAL_URL=http://10.0.2.2:8082

# Para usar servicio directo
set EXPO_PUBLIC_GEO_LOCAL_URL=http://10.0.2.2:8084
```

### ¿Qué pasa si NO establezco `EXPO_PUBLIC_USE_LOCAL_GEO=true`?

La app intenta conectarse al gateway de Render (`https://alovecino-api-gateway-dev.onrender.com`).
Si ese gateway está down o el servicio geo no está desplegado allá, usará almacenes de ejemplo.

---

## Referencia de Archivos Modificados

- `frontend/app.config.js`: Inyección de API key
- `frontend/src/features/home/screens/HomeScreen.js`: Lógica de render
- `frontend/src/features/home/services/geoService.js`: Selecciona local vs remoto
- `frontend/src/features/home/services/geoService.local.js`: Cliente local
- `frontend/eas.json`: Variables de entorno

