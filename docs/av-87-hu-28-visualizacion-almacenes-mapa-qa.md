# AV-87-HU-28 - Visualizacion de almacenes en el mapa

## Objetivo QA

Validar que el cliente ve en el mapa los almacenes registrados que tienen coordenadas validas y estan dentro del radio de busqueda de 500 m.

## Precondiciones

- APK `dev-preview` instalado en el emulador.
- Usuario cliente autenticado en la app.
- Servicios dev activos:
  - `api-gateway`
  - `usuarios-service`
  - `geo-service`
- Google Maps SDK for Android autorizado para el package `com.alovecino.app.dev`.
- Al menos un almacen registrado con direccion geocodificada cerca de la ubicacion simulada.

## Ubicacion simulada sugerida

Configurar el emulador en Android Studio:

1. Abrir el emulador.
2. Ir a `Extended controls` > `Location`.
3. Usar estas coordenadas:

```text
Latitude: -33.448890
Longitude: -70.669265
```

4. Presionar `Set Location`.
5. Abrir AloVecino Dev y otorgar permiso de ubicacion si Android lo solicita.

## Datos de prueba cercanos

Crear un almacen desde una cuenta tipo almacen usando una direccion cercana al centro de Santiago, por ejemplo:

```text
Nombre: Almacen QA Centro
Calle: Agustinas
Numero: 1022
Comuna: Santiago
Region: Metropolitana
Telefono: +56912345678
```

Con la ubicacion simulada anterior, esta direccion deberia quedar dentro o cerca del radio de 500 m si la geocodificacion de Google esta disponible.

## Escenarios

### Almacen dentro del radio

1. Configurar la ubicacion simulada sugerida.
2. Iniciar sesion como cliente.
3. Abrir el mapa.
4. Verificar que aparece un marker con el nombre del almacen cercano.

Resultado esperado: el marker se renderiza con nombre y distancia.

### Almacen fuera del radio

1. Configurar la ubicacion simulada lejos del almacen registrado.
2. Abrir el mapa o presionar `Buscar nuevamente`.

Resultado esperado: el almacen no aparece como marker.

### Sin almacenes cercanos

1. Configurar una ubicacion sin almacenes en 500 m.
2. Abrir el mapa.

Resultado esperado: la app muestra el mensaje `No hay almacenes cercanos en 500 m.`.

### Nuevo almacen registrado

1. Registrar un almacen con una direccion cercana a la ubicacion simulada.
2. Volver al mapa como cliente.
3. Presionar `Buscar nuevamente` o volver a abrir la pantalla.

Resultado esperado: el nuevo almacen aparece como marker si fue geocodificado correctamente.

### Almacen sin coordenadas

1. Usar o preparar un registro de almacen cuya direccion no tenga `latitud` o `longitud`.
2. Abrir el mapa.

Resultado esperado: la app no se rompe y ese almacen no se muestra.

## Decision de estado de almacenes

Para esta HU no se aplica filtro por estado en el frontend. El mapa muestra lo que retorne `GET /api/geo/stores`.

Si el producto decide mostrar solo almacenes `ACTIVO`, el filtro debe agregarse en `geo-service` para que el endpoint excluya almacenes `PENDIENTE` u otros estados.

## Validacion tecnica rapida

Desde el frontend:

```powershell
npm test -- --runInBand src/features/home/services/geoService.test.js
```

Desde la app:

- El mapa consulta `GET /api/geo/stores`.
- El radio por defecto es `500` metros.
- Coordenadas nulas o invalidas no llegan a renderizarse como markers.
