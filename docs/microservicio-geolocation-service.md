# Microservicio de Geolocalización - AloVecino

##  Descripción General

El **Geolocation Service** es un microservicio Spring Boot especializado en proporcionar funcionalidades de geolocalización y búsqueda espacial. Permite:

-  **Geocodificación**: Convertir direcciones en coordenadas geográficas (latitud/longitud)
-  **Búsqueda Espacial**: Encontrar almacenes cercanos a una ubicación específica dentro de un radio determinado
-  **Integración con Google Maps**: Utiliza la API de Google Maps para geocodificación en producción
-  **Modo Determinístico**: Incluye un servicio de geocodificación determinístico para desarrollo/testing

---

##  Arquitectura

### Stack Tecnológico

```
Java 21 (LTS)
├── Spring Boot 4.0.5
├── Spring Data JPA
├── Spring Security + OAuth2 Resource Server
├── PostgreSQL (via NeonDB)
└── Spring Doc OpenAPI (Swagger)
```

### Estructura de Carpetas

```
backend/geolocation-service/
├── src/main/java/com/alovecino/geolocationservice/
│   ├── controller/              # Controladores REST
│   │   ├── GeolocationController.java
│   │   └── AlmacenSearchController.java
│   ├── service/                 # Lógica de negocio
│   │   ├── GeolocationService.java (interfaz)
│   │   ├── DeterministicGeolocationService.java
│   │   ├── GeocodingService.java (interfaz)
│   │   └── GoogleGeocodingService.java
│   ├── model/                   # Entidades JPA
│   │   ├── Almacen.java
│   │   ├── Direccion.java
│   │   ├── Comuna.java
│   │   ├── Region.java
│   │   └── EstadoCuenta.java
│   ├── dto/                     # Data Transfer Objects
│   │   ├── DireccionRequest.java
│   │   ├── CoordinatesResponse.java
│   │   └── AlmacenNearbyResponse.java
│   ├── repository/              # Acceso a datos
│   │   └── AlmacenRepository.java
│   ├── config/                  # Configuración
│   │   └── RestTemplateConfig.java
│   ├── exception/               # Manejo de excepciones
│   │   └── GeocodingException.java
│   └── GeolocationServiceApplication.java
├── src/main/resources/
│   ├── application.yml          # Configuración base
│   ├── application-dev.yml      # Configuración desarrollo
│   └── application.properties   # Propiedades legacy
├── pom.xml                      # Dependencias Maven
├── Dockerfile                   # Producción
└── Dockerfile.dev               # Desarrollo
```

---

## 🔌 Endpoints API

### 1. Geocodificación de Direcciones

**Endpoint:** `POST /api/geolocalizacion/geocode`

**Descripción:** Convierte una dirección en coordenadas geográficas (latitud y longitud)

**Request Body:**
```json
{
  "calle": "Alameda",
  "numero": "1000",
  "comuna": "Santiago",
  "region": "Región Metropolitana",
  "codigoPostal": "8320000"  // Opcional
}
```

**Response (200 OK):**
```json
{
  "latitud": -33.4377,
  "longitud": -70.6705
}
```

**Validaciones:**
- ✓ Todos los campos excepto `codigoPostal` son obligatorios
- ✓ La geocodificación requiere una dirección válida
- ✓ Requiere autenticación JWT

**Errores Posibles:**
- `400`: Solicitud inválida (campos faltantes o dirección vacía)
- `401`: No autenticado
- `500`: Error en la geocodificación (API Google no disponible)

---

### 2. Búsqueda Espacial de Almacenes

**Endpoint:** `GET /api/v1/almacenes/busqueda-espacial`

**Descripción:** Busca almacenes cercanos a una ubicación dentro de un radio especificado

**Query Parameters:**

| Parámetro | Tipo | Requerido | Descripción | Ejemplo |
|-----------|------|-----------|-------------|---------|
| `lat` | BigDecimal | Condicional | Latitud | `-33.4377` |
| `lng` | BigDecimal | Condicional | Longitud | `-70.6705` |
| `direccion` | String | Condicional | Dirección a geocodificar | `"Alameda 1000, Santiago"` |
| `radioKm` | Double | No | Radio de búsqueda en km (default: 5.0) | `10.0` |

**Notas:**
- Debe proporcionar **EITHER** `lat`+`lng` **OR** `direccion`
- Si proporciona `direccion`, esta se geocodificará automáticamente

**Response (200 OK):**
```json
[
  {
    "idAlmacen": 1,
    "nombre": "Almacén Central",
    "calle": "Alameda",
    "numero": "1000",
    "comuna": "Santiago",
    "region": "Región Metropolitana",
    "latitud": -33.4375,
    "longitud": -70.6704,
    "distanciaKm": 0.15
  },
  {
    "idAlmacen": 2,
    "nombre": "Almacén Providencia",
    "calle": "Providencia",
    "numero": "2000",
    "comuna": "Providencia",
    "region": "Región Metropolitana",
    "latitud": -33.4250,
    "longitud": -70.5900,
    "distanciaKm": 4.75
  }
]
```

**Ordenamiento:** Los resultados se ordenan por distancia ascendente (más cercanos primero)

**Filtros Aplicados:**
- ✓ Solo almacenes con estado de cuenta = `ACTIVO`
- ✓ Solo almacenes con coordenadas válidas
- ✓ Solo dentro del radio especificado

**Errores Posibles:**
- `400`: Parámetros de búsqueda inválidos o incompletos
- `401`: No autenticado

---

## Modelos de Datos

### Entidades JPA

#### 1. **Almacen**
```
Tabla: almacen
├── id_almacen (PK)
├── nombre (String, hasta 140 caracteres)
├── id_direccion (FK) → direccion
└── id_estado_cuenta (FK) → estado_cuenta
```

**Relaciones:**
- `1:1` con `Direccion` (ManyToOne)
- `1:1` con `EstadoCuenta` (ManyToOne)

#### 2. **Direccion**
```
Tabla: direccion
├── id_direccion (PK)
├── calle (String, hasta 160 caracteres)
├── numero (String, hasta 30 caracteres)
├── codigo_postal (String, hasta 20 caracteres) - Opcional
├── latitud (Decimal con 7 dígitos decimales)
├── longitud (Decimal con 7 dígitos decimales)
└── id_comuna (FK) → comuna
```

**Validaciones:**
- `latitud`: precision(10,7) - rango: -90 a +90
- `longitud`: precision(10,7) - rango: -180 a +180

#### 3. **Comuna**
```
Tabla: comuna
├── id_comuna (PK)
├── nombre (String, hasta 120 caracteres)
└── id_region (FK) → region

Constraint Único: (nombre, id_region)
```

#### 4. **Region**
```
Tabla: region
├── id_region (PK)
├── nombre (String, único, hasta 120 caracteres)
└── codigo (String, único, hasta 20 caracteres)
```

#### 5. **EstadoCuenta**
```
Tabla: estado_cuenta
├── id_estado_cuenta (PK)
├── codigo (String, único, hasta 50 caracteres)
├── nombre (String)
└── descripcion (String)

Códigos válidos: ACTIVO, PENDIENTE, SUSPENDIDO, RECHAZADO, INACTIVO
```

---

##  Flujos de Procesamiento

### Flujo 1: Geocodificación de Dirección

```
Usuario
  ↓
POST /api/geolocalizacion/geocode
  ↓ (DireccionRequest)
GeolocationController.geocode()
  ↓
GeolocationService.geocode()
  ├─→ DeterministicGeolocationService (Development)
  │    └─→ Generador hash determinístico
  │        └─→ Calcula lat/lng basado en hash de dirección
  │
  └─→ GoogleGeocodingService (Production)
       ├─→ Construye dirección en string
       ├─→ URL-encoda la dirección
       ├─→ Llama a Google Maps API
       ├─→ Parsea respuesta JSON
       └─→ Retorna lat/lng del primer resultado
  ↓
CoordinatesResponse { latitud, longitud }
  ↓
Usuario (200 OK)
```

**Selección de Implementación:**
- Por defecto usa `DeterministicGeolocationService` (@Service sin @Primary)
- Para cambiar a Google Maps, agregar `@Primary` a `GoogleGeocodingService`

---

### Flujo 2: Búsqueda Espacial de Almacenes

```
Usuario
  ↓
GET /api/v1/almacenes/busqueda-espacial?lat=X&lng=Y&radioKm=5
  ↓
AlmacenSearchController.buscarAlmacenesCercanos()
  ├─→ Valida parámetros (lat+lng O direccion)
  │
  ├─→ Si solo tiene dirección:
  │    ├─→ GeocodingService.geocode(direccion)
  │    └─→ Obtiene lat/lng
  │
  ├─→ AlmacenRepository.findNearby(lat, lng, radioKm)
  │    ├─→ Query nativa SQL con Haversine
  │    ├─→ Calcula distancia a cada almacén
  │    ├─→ Filtra por radio
  │    ├─→ Filtra por estado ACTIVO
  │    └─→ Retorna proyección: AlmacenNearbyProjection
  │
  ├─→ Mapea proyecciones a AlmacenNearbyResponse
  │
  └─→ Usuario (200 OK con lista ordenada por distancia)
```

---

##  Algoritmos Clave

### 1. Geocodificación Determinística

**Ubicado en:** `DeterministicGeolocationService.java`

**Algoritmo:**
```java
// 1. Concatena componentes de dirección separados por |
String value = "Alameda|1000|Santiago|Metropolitana|";

// 2. Calcula hash determinístico
int hash = Math.abs(value.toLowerCase().hashCode());

// 3. Genera latitud basada en hash
// Rango: -33.65 a -33.3700 (aprox Santiago)
BigDecimal latitud = -33.65 + (hash % 7000) / 10000.0;

// 4. Genera longitud basada en hash
// Rango: -70.95 a -70.5700 (aprox Santiago)
BigDecimal longitud = -70.95 + ((hash / 7000) % 7000) / 10000.0;
```

**Ventajas:**
- ✓ No requiere API externa
- ✓ Determinístico (misma entrada = siempre mismo resultado)
- ✓ Válido para testing y desarrollo
- ✓ Rápido

**Desventajas:**
- ✗ No usa coordenadas reales
- ✗ Solo funciona en región Santiago

---

### 2. Fórmula de Haversine (Distancia Geodésica)

**Ubicado en:** `AlmacenRepository.java` (Query nativa)

**Fórmula:**
```sql
6371 * acos(
  LEAST(1, GREATEST(-1,
    cos(radians(lat1)) * cos(radians(lat2)) * cos(radians(lng2) - radians(lng1)) +
    sin(radians(lat1)) * sin(radians(lat2))
  ))
)
```

**Componentes:**
- `6371` = Radio de la Tierra en km
- `radians()` = Convierte grados a radianes
- `cos()`, `sin()`, `acos()` = Funciones trigonométricas
- `LEAST(1, GREATEST(-1, ...))` = Asegura que el argumento de acos esté en [-1, 1]

**Precisión:**
- Exacta hasta ~0.5% para distancias < 20 km
- Calcula distancia ortodrómica (línea recta sobre esfera)

**Ejemplo de Cálculo:**
- Punto A: (-33.4377, -70.6705) Santiago
- Punto B: (-33.4250, -70.5900) Providencia
- Distancia: ~4.75 km

---

##  Seguridad

### Autenticación y Autorización

**Mecanismo:** OAuth2 Resource Server con JWT

**Implementación:**
```properties
# application.yml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: ${AUTH_JWT_ISSUER}
          audiences: ${AUTH_JWT_AUDIENCE}
```

**Requerimientos:**
- ✓ Todos los endpoints requieren JWT válido
- ✓ Gateway filtra y valida tokens antes de pasar a este servicio
- ✓ Tokens debe contener aud = `alovecino-api`

**Headers Requeridos:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

---

##  Configuración

### Variables de Entorno

```env
# Base de Datos
SPRING_DATASOURCE_URL=jdbc:postgresql://[host]/neondb?sslmode=require&channelBinding=require
SPRING_DATASOURCE_USERNAME=neondb_owner
SPRING_DATASOURCE_PASSWORD=<password>

# Google Maps API (requerido para GoogleGeocodingService)
GOOGLE_MAPS_API_KEY=AIzaSyBJiOQNUhp8FIeqkwWDAvk7n7Kid0R8P9g

# Puerto del servicio
GEOLOCATION_SERVICE_PORT=8084

# JWT
AUTH_JWT_ISSUER=alovecino-auth
AUTH_JWT_AUDIENCE=alovecino-api
```

### Perfiles Spring

**Desarrollo:**
```bash
java -jar geolocation-service.jar --spring.profiles.active=dev
```

**application-dev.yml** habilita:
- `spring.jpa.show-sql=true` - Log de queries SQL
- `logging.level.org.springframework.web=DEBUG` - Debug de HTTP

---

##  Ejecución

### Local (Maven)

```bash
# 1. Navega a la carpeta del servicio
cd backend/geolocation-service

# 2. Compila y ejecuta
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"

# 3. Servicio estará disponible en
http://localhost:8084
```

### Docker

```bash
# 1. Build
docker build -f Dockerfile.dev -t alovecino-geolocation-service:dev .

# 2. Run
docker run -d \
  -p 8084:8084 \
  -e SPRING_DATASOURCE_URL=... \
  -e SPRING_DATASOURCE_USERNAME=... \
  -e SPRING_DATASOURCE_PASSWORD=... \
  -e GOOGLE_MAPS_API_KEY=... \
  -e AUTH_JWT_ISSUER=alovecino-auth \
  -e AUTH_JWT_AUDIENCE=alovecino-api \
  alovecino-geolocation-service:dev
```

### Docker Compose

```bash
# Ejecuta con el archivo de configuración
cd deploy/docker
docker compose --env-file .env.dev.example -f docker-compose.dev.yml up -d

# El servicio se inicia automáticamente en puerto 8084
```

---

##  Documentación Swagger

**Disponible en:** `http://localhost:8084/swagger-ui.html`

**Características:**
- ✓ Documentación interactiva de endpoints
- ✓ Prueba directa de APIs
- ✓ Esquemas de request/response
- ✓ Códigos de error documentados

---

##  Dependencias Principales

```xml
<!-- Spring Boot Core -->
<spring-boot-starter-web>              <!-- REST API -->
<spring-boot-starter-security>         <!-- Seguridad -->
<spring-boot-starter-oauth2-resource-server> <!-- JWT -->
<spring-boot-starter-data-jpa>         <!-- ORM -->

<!-- Base de Datos -->
<postgresql>                            <!-- Driver JDBC -->

<!-- Validación -->
<spring-boot-starter-validation>        <!-- @Valid, @NotBlank -->

<!-- Documentación -->
<springdoc-openapi-starter-webmvc-ui>  <!-- Swagger/OpenAPI -->

<!-- Monitoreo -->
<spring-boot-starter-actuator>         <!-- Métricas, Health -->
```

---

##  Troubleshooting

### Problema: "Google Maps API key no está configurada"

**Causa:** Variable de entorno `GOOGLE_MAPS_API_KEY` no establecida

**Solución:**
```bash
# Asegurate de exportar la variable antes de ejecutar
export GOOGLE_MAPS_API_KEY="tu_clave_aqui"
```

---

### Problema: "No se encontraron coordenadas para la dirección"

**Causa:** La dirección no existe en Google Maps o hay error de conexión

**Soluciones:**
1. Verifica que la dirección sea correcta y esté en Chile
2. Comprueba conexión a internet
3. Usa `DeterministicGeolocationService` para testing (no requiere API)

---

### Problema: Busqueda de almacenes retorna lista vacía

**Causas Posibles:**
1. No hay almacenes en ese radio
2. Los almacenes no tienen coordenadas (latitud/longitud NULL)
3. Los almacenes no tienen estado = ACTIVO
4. Las coordenadas están fuera de la zona de Santiago

**Diagnóstico:**
```sql
-- Query SQL para verificar almacenes
SELECT a.id_almacen, a.nombre, d.latitud, d.longitud, e.codigo
FROM almacen a
JOIN direccion d ON a.id_direccion = d.id_direccion
JOIN estado_cuenta e ON a.id_estado_cuenta = e.id_estado_cuenta
ORDER BY a.id_almacen;
```

---

##  Monitoreo

### Health Check

**Endpoint:** `GET http://localhost:8084/actuator/health`

```json
{
  "status": "UP",
  "components": {
    "db": {
      "status": "UP",
      "details": {
        "database": "PostgreSQL",
        "validationQuery": "isValid()"
      }
    },
    "diskSpace": {
      "status": "UP",
      "details": {
        "total": 500107862016,
        "free": 350000000000,
        "threshold": 10485760
      }
    }
  }
}
```

### Métricas

**Endpoint:** `GET http://localhost:8084/actuator/metrics`

Métricas disponibles:
- `http.server.requests` - Contadores de requests HTTP
- `process.cpu.usage` - Uso de CPU
- `jvm.memory.usage` - Uso de memoria JVM

---

##  Integración con Otros Servicios

### API Gateway
- Requiere JWT válido de auth-service
- Gateway en puerto `8082` enruta a geolocation-service:8084
- Ruta: `/api/geolocalizacion/**` → geolocation-service

### Auth Service
- Valida tokens JWT
- Proporciona `issuer-uri` para verificar firmas

### Usuarios Service
- No hay integración directa
- Ambos leen de la misma BD (NeonDB)

---

##  Ejemplo de Uso Completo

### Paso 1: Obtener Coordenadas de una Dirección

```bash
curl -X POST http://localhost:8082/api/geolocalizacion/geocode \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "calle": "Alameda",
    "numero": "1000",
    "comuna": "Santiago",
    "region": "Región Metropolitana",
    "codigoPostal": "8320000"
  }'

# Respuesta:
{
  "latitud": -33.4377,
  "longitud": -70.6705
}
```

### Paso 2: Buscar Almacenes Cercanos

```bash
# Opción A: Usando coordenadas
curl -X GET "http://localhost:8082/api/v1/almacenes/busqueda-espacial?lat=-33.4377&lng=-70.6705&radioKm=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Opción B: Usando dirección (se geocodifica automáticamente)
curl -X GET "http://localhost:8082/api/v1/almacenes/busqueda-espacial?direccion=Alameda%201000&radioKm=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Respuesta:
[
  {
    "idAlmacen": 1,
    "nombre": "Almacén Central",
    "calle": "Alameda",
    "numero": "1000",
    "comuna": "Santiago",
    "region": "Región Metropolitana",
    "latitud": -33.4375,
    "longitud": -70.6704,
    "distanciaKm": 0.15
  },
  ...
]
```

---

##  Checklist de Verificación

- [ ] Servicio iniciado exitosamente en puerto 8084
- [ ] Base de datos PostgreSQL/NeonDB accesible
- [ ] JWT tokens válidos de auth-service
- [ ] Google Maps API key configurada
- [ ] Health check retorna status UP
- [ ] Swagger accesible en `/swagger-ui.html`
- [ ] Endpoints responden con 200 OK
- [ ] Búsqueda espacial retorna almacenes dentro del radio

---

##  Próximos Pasos

1. **Migración a GoogleGeocodingService:**
   - Cambiar `@Primary` de `DeterministicGeolocationService` a `GoogleGeocodingService`
   - Verificar que API key sea válida

2. **Optimizaciones:**
   - Agregar índice geoespacial en tabla `direccion` para búsquedas más rápidas
   - Implementar caché para resultados de geocodificación
   - Agregar rate limiting a Google Maps API

3. **Funcionalidades Futuras:**
   - Búsqueda por polígono en lugar de radio circular
   - Rutas optimizadas entre almacenes
   - Geocodificación inversa (coordenadas → dirección)


**Última actualización:** 13 de Mayo de 2026
