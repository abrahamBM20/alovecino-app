# Pruebas en Celular Físico - Red Local

Guía rápida para probar geolocalización en un celular físico conectado a la misma WiFi.

---

## Paso 1: Obtén tu IP local

En Windows CMD:
```bash
ipconfig
```

Busca la línea "Dirección IPv4" bajo tu conexión de red.  
**Ejemplo:** `192.168.100.88`

Nota esta IP.

---

## Paso 2: Abre el firewall para puerto 8084

**Opción A: CMD (como administrador)**
```bash
netsh advfirewall firewall add rule name="Allow 8084" dir=in action=allow protocol=tcp localport=8084
```

**Opción B: Manual en Windows**
1. Abre "Firewall de Windows Defender"
2. Click en "Permitir que una aplicación atraviese el firewall"
3. Busca "Java" o "Maven" y marca ambas opciones
4. Click en OK

---

## Paso 3: Inicia los servicios del backend

```bash
# Terminal 1: Geolocation Service (Puerto 8084)
cd backend/geolocation-service
mvn spring-boot:run

# Terminal 2: Auth Service (Para generar JWT)
cd backend/auth-service
mvn spring-boot:run
```

Espera a que ambos digan "Started" (1-2 minutos).

---

## Paso 4: Verifica conexión desde el celular

En el navegador del celular, ve a:
```
http://192.168.100.88:8084/actuator/health
```

**Esperado:** Ves un JSON con `"status":"UP"`

Si NO funciona:
- ❌ Asegúrate que el celular está en WiFi
- ❌ Asegúrate que están en la misma red (mismo WiFi)
- ❌ Reinicia los servicios backend
- ❌ Verifica que no hay firewall bloqueando

---

## Paso 5: Actualiza la app con tu IP

Edita `frontend/eas.json`:

Busca la sección `"dev"` y actualiza:
```json
"env": {
  "APP_VARIANT": "dev",
  "EXPO_PUBLIC_APP_ENV": "dev",
  "EXPO_PUBLIC_API_URL": "https://alovecino-api-gateway-dev.onrender.com",
  "EXPO_PUBLIC_GOOGLE_MAPS_API_KEY": "AIzaSyBKEsbqZ5k9JpgEf9w9WoBB-eaFaH85s8Y",
  "EXPO_PUBLIC_USE_LOCAL_GEO": "true",
  "EXPO_PUBLIC_GEO_LOCAL_URL": "http://192.168.100.88:8084"
}
```

⚠️ **Reemplaza `192.168.100.88` con tu IP**

---

## Paso 6: Reconstruye la app

```bash
cd frontend

# Si usas Android
eas build --platform android --local --profile dev

# O si usas expo start
expo start
```

---

## Paso 7: Prueba

En el celular:
1. Abre la app AloVecino
2. Acepta permisos de ubicación
3. Espera a que el mapa cargue
4. Verifica que aparecen almacenes como marcadores

---

## ¿Qué hacer si falla?

### Opción A: Ver logs en Expo

Conecta el celular a tu PC vía USB o usa Expo Go.

```bash
cd frontend
expo start
```

Abre "Logs" en la app Expo Go.

Busca mensajes que comiencen con `🌍 GEO LOCAL`.

### Opción B: Probar manualmente desde celular

1. Abre navegador del celular
2. Ve a: `http://192.168.100.88:8084/api/v1/almacenes/busqueda-espacial?lat=-33.4377&lng=-70.6705&radioKm=10`
3. Si ves un JSON con almacenes: ✅ El backend está bien
4. Si ves error CORS: ✅ Backend necesita CORS config
5. Si ves 401: ✅ Necesitas JWT pero el backend está bien

---

## Checklist

- [ ] IP local obtenida
- [ ] Firewall abierto para puerto 8084
- [ ] Geolocation Service corriendo en 8084
- [ ] Auth Service corriendo para JWT
- [ ] `eas.json` actualizado con IP
- [ ] Celular en la misma WiFi
- [ ] App compilada y desplegada
- [ ] Mapa se ve en el celular
- [ ] Almacenes aparecen como marcadores

---

## URLs de Referencia

**Health check:**
```
http://192.168.100.88:8084/actuator/health
```

**Buscar almacenes (sin autenticación en dev):**
```
http://192.168.100.88:8084/api/v1/almacenes/busqueda-espacial?lat=-33.4377&lng=-70.6705&radioKm=10
```

**Swagger UI (si el backend lo tiene):**
```
http://192.168.100.88:8084/swagger-ui.html
```

---

## Notas

- `10.0.2.2` es para emulador Android
- `192.168.X.X` es para celular físico en la misma red
- La app siempre necesita ubicación para mostrar almacenes
- Sin CORS configurado, los requests desde celular fallarán
