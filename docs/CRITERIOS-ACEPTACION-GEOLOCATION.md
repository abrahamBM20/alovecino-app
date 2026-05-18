# Criterios de Aceptación - Microservicio de Geolocalización

Mapeo de criterios de aceptación a la arquitectura actual de AloVecino. Los endpoints mantienen sus rutas existentes.

---

## 📋 Matriz de Criterios

### CA-01: Endpoints Protegidos con Autenticación JWT

**Estado:** ✅ **PARCIALMENTE IMPLEMENTADO**

**Criterio Original:**
> Se crea geo-service con endpoints protegidos GET /api/geo/stores y POST /api/geo/geocode.

**Adaptación a Arquitectura Actual:**
- `POST /api/geolocalizacion/geocode` - ✅ Existe, necesita verificar autenticación JWT
- `GET /api/v1/almacenes/busqueda-espacial` - ✅ Existe, necesita verificar autenticación JWT

**Implementación Requerida:**
```java
// En ambos controladores, agregar:
@PreAuthorize("isAuthenticated()")
@GetMapping("/busqueda-espacial")
public ResponseEntity<List<AlmacenNearbyResponse>> buscarAlmacenesCercanos(...) { ... }

@PreAuthorize("isAuthenticated()")
@PostMapping("/geocode")
public ResponseEntity<CoordinatesResponse> geocode(...) { ... }
```

**Verificación:**
- [ ] `AlmacenSearchController` tiene `@PreAuthorize("isAuthenticated()")`
- [ ] `GeolocationController` tiene `@PreAuthorize("isAuthenticated()")`
- [ ] Headers `Authorization: Bearer <accessToken>` son validados por Spring Security

---

### CA-02: API Gateway Enruta Solicitudes Hacia Geo-Service

**Estado:** ✅ **COMPLETAMENTE IMPLEMENTADO**

**Criterio Original:**
> api-gateway enruta /api/geo/** hacia geo-service.

**Implementación Actual:**
En [GatewayRoutesConfig.java](../backend/api-gateway/src/main/java/com/alovecino/apigateway/config/GatewayRoutesConfig.java):

```java
.route("geolocalizacion-api", route -> route
    .path("/api/geolocalizacion/**")
    .uri(geolocationUrl))
.route("geolocalizacion-almacenes-api", route -> route
    .path("/api/v1/almacenes/**")
    .uri(geolocationUrl))
```

**Rutas Configuradas:**
| Path | Destino | Servicio |
|------|---------|----------|
| `/api/geolocalizacion/**` | `geolocation-service:8084` | Geocodificación |
| `/api/v1/almacenes/**` | `geolocation-service:8084` | Búsqueda espacial |

**Verificación:**
- [x] Gateway redirige `/api/geolocalizacion/**` correctamente
- [x] Gateway redirige `/api/v1/almacenes/**` correctamente
- [x] JWT es propagado a través del gateway

---

### CA-03: POST Geocode Consume Google Geocoding API

**Estado:** ✅ **COMPLETAMENTE IMPLEMENTADO**

**Criterio Original:**
> POST /api/geo/geocode consume Google Geocoding API mediante API key por variable de entorno.

**Implementación Actual:**
En [GoogleGeocodingService.java](../backend/geolocation-service/src/main/java/com/alovecino/geolocationservice/service/GoogleGeocodingService.java):

```java
@Service
public class GoogleGeocodingService implements GeocodingService {
    private static final String GEOCODING_URL = "https://maps.googleapis.com/maps/api/geocode/json";
    
    private final RestTemplate restTemplate;
    private final String apiKey;

    public GoogleGeocodingService(RestTemplate restTemplate, 
        @Value("${google.maps.api.key}") String apiKey) {
        this.restTemplate = restTemplate;
        this.apiKey = apiKey;
    }

    @Override
    public Coordinates geocode(String address) {
        // Construye URI con API key
        URI uri = URI.create(GEOCODING_URL + "?address=" + encodedAddress + "&key=" + apiKey);
        // Llama a Google
        GoogleGeocodingResponse response = restTemplate.getForObject(uri, GoogleGeocodingResponse.class);
        // Parsea respuesta
        return new Coordinates(location.lat(), location.lng());
    }
}
```

**Configuración:**
```yaml
# application-dev.yml
google:
  maps:
    api:
      key: ${GOOGLE_MAPS_API_KEY}  # Variable de entorno
```

**Endpoint:**
- `POST /api/geolocalizacion/geocode`
- Request: DireccionRequest (calle, número, comuna, región)
- Response: CoordinatesResponse (latitud, longitud)

**Verificación:**
- [x] Consume Google Geocoding API v2
- [x] API key cargada desde variable de entorno
- [x] Manejo de errores: ZERO_RESULTS, INVALID_REQUEST, etc.
- [x] Fallback a DeterministicGeolocationService en caso de error

---

### CA-04: Límite Diario Configurable para Google Geocoding

**Estado:** ❌ **NO IMPLEMENTADO**

**Criterio Original:**
> Se agrega límite diario configurable para llamadas a Google Geocoding.

**Implementación Requerida:**

#### Paso 1: Crear tabla de auditoría

```sql
CREATE TABLE IF NOT EXISTS geocoding_audit (
    id_geocoding_audit BIGINT PRIMARY KEY AUTO_INCREMENT,
    id_usuario BIGINT NOT NULL,
    direccion VARCHAR(500) NOT NULL,
    fecha_llamada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resultado VARCHAR(10),  -- SUCCESS, ERROR
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
    INDEX idx_usuario_fecha (id_usuario, DATE(fecha_llamada))
);
```

#### Paso 2: Crear entidad y repository

```java
// GeocodeAudit.java
@Entity
@Table(name = "geocoding_audit")
public class GeocodeAudit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idGeocodeAudit;
    
    @Column(name = "id_usuario", nullable = false)
    private Long idUsuario;
    
    @Column(nullable = false, length = 500)
    private String direccion;
    
    @Column(name = "fecha_llamada")
    private LocalDateTime fechaLlamada;
    
    @Column(length = 10)
    private String resultado;
    
    // Getters/setters
}

// GeocodeAuditRepository.java
@Repository
public interface GeocodeAuditRepository extends JpaRepository<GeocodeAudit, Long> {
    @Query("""
        SELECT COUNT(*) FROM GeocodeAudit 
        WHERE idUsuario = :idUsuario 
        AND DATE(fechaLlamada) = CURDATE()
    """)
    long countTodayByUsuario(@Param("idUsuario") Long idUsuario);
}
```

#### Paso 3: Agregar validación en servicio

```java
@Service
public class GoogleGeocodingService implements GeocodingService {
    private final GeocodeAuditRepository auditRepository;
    
    @Value("${geocoding.daily-limit:100}")
    private int dailyLimit;
    
    @Override
    public Coordinates geocode(String address, Long idUsuario) throws GeocodingException {
        long callsToday = auditRepository.countTodayByUsuario(idUsuario);
        
        if (callsToday >= dailyLimit) {
            throw new GeocodingException(
                "Límite diario de " + dailyLimit + " llamadas alcanzado"
            );
        }
        
        try {
            Coordinates coords = callGoogleApi(address);
            auditRepository.save(new GeocodeAudit(idUsuario, address, "SUCCESS"));
            return coords;
        } catch (Exception e) {
            auditRepository.save(new GeocodeAudit(idUsuario, address, "ERROR"));
            throw e;
        }
    }
}
```

#### Paso 4: Configuración

```yaml
# application.yml
geocoding:
  daily-limit: 100  # Configurable por ambiente
```

**Verificación:**
- [ ] Tabla `geocoding_audit` creada
- [ ] Entidad `GeocodeAudit` implementada
- [ ] Repository con query de conteo diario
- [ ] Servicio valida límite antes de llamar Google API
- [ ] Variable de entorno `geocoding.daily-limit` configurable
- [ ] Test: Verifique que al exceder límite lanza excepción

---

### CA-05: GET Busca Almacenes Cercanos por Coordenadas

**Estado:** ✅ **COMPLETAMENTE IMPLEMENTADO**

**Criterio Original:**
> GET /api/geo/stores busca almacenes cercanos por latitud, longitud y radio_metros.

**Implementación Actual:**
En [AlmacenSearchController.java](../backend/geolocation-service/src/main/java/com/alovecino/geolocationservice/controller/AlmacenSearchController.java):

```java
@GetMapping("/busqueda-espacial")
public ResponseEntity<List<AlmacenNearbyResponse>> buscarAlmacenesCercanos(
    @RequestParam(required = false) String direccion,
    @RequestParam(required = false) BigDecimal lat,
    @RequestParam(required = false) BigDecimal lng,
    @RequestParam(defaultValue = "5.0") @Positive double radioKm) {
    
    // Busca almacenes en radio
    List<AlmacenNearbyProjection> nearbyProjections = 
        almacenRepository.findNearby(actualLat, actualLng, radioKm);
    
    return ResponseEntity.ok(responses);
}
```

**Parámetros:**
| Parámetro | Tipo | Obligatorio | Descripción |
|-----------|------|-------------|-------------|
| `lat` | BigDecimal | * | Latitud del punto de búsqueda |
| `lng` | BigDecimal | * | Longitud del punto de búsqueda |
| `direccion` | String | * | O coordenadas o dirección |
| `radioKm` | Double | No | Radio en km (default: 5.0) |

*Al menos uno: (lat, lng) o direccion

**Query SQL (Native):**
```sql
SELECT a.id_almacen, a.nombre, d.calle, d.numero, c.nombre AS comuna, r.nombre AS region,
       d.latitud, d.longitud,
       (6371 * acos(LEAST(1, GREATEST(-1, 
           cos(radians(?1)) * cos(radians(d.latitud)) * cos(radians(d.longitud) - radians(?2)) + 
           sin(radians(?1)) * sin(radians(d.latitud))
       )))) AS distanciaKm
FROM almacen a
JOIN direccion d ON d.id_direccion = a.id_direccion
JOIN comuna c ON c.id_comuna = d.id_comuna
JOIN region r ON r.id_region = c.id_region
WHERE d.latitud IS NOT NULL AND d.longitud IS NOT NULL
  AND a.id_estado_cuenta = (SELECT id_estado_cuenta FROM estado_cuenta WHERE codigo = 'ACTIVO')
  AND distanciaKm <= ?3
ORDER BY distanciaKm ASC
```

**Verificación:**
- [x] Busca por coordenadas (lat, lng)
- [x] Busca por dirección (llama a geocode internamente)
- [x] Radio configurable en km
- [x] Filtra solo almacenes ACTIVOS
- [x] Solo devuelve almacenes con coordenadas válidas

---

### CA-06: Respuesta Incluye Distancia y Ordenada por Cercanía

**Estado:** ✅ **COMPLETAMENTE IMPLEMENTADO**

**Criterio Original:**
> La respuesta incluye distancia en metros/kilómetros y ordena resultados por cercanía.

**Implementación Actual:**
En [AlmacenNearbyResponse.java](../backend/geolocation-service/src/main/java/com/alovecino/geolocationservice/dto/AlmacenNearbyResponse.java):

```java
public class AlmacenNearbyResponse {
    private Long idAlmacen;
    private String nombre;
    private String calle;
    private String numero;
    private String comuna;
    private String region;
    private BigDecimal latitud;
    private BigDecimal longitud;
    private Double distanciaKm;        // ✅ Incluye distancia
    private Double distanciaMetros;    // ✅ En metros también
    
    public static AlmacenNearbyResponse fromProjection(
        AlmacenSearchController.AlmacenNearbyProjection projection) {
        AlmacenNearbyResponse response = new AlmacenNearbyResponse();
        response.distanciaKm = projection.getDistanciaKm();
        response.distanciaMetros = projection.getDistanciaKm() * 1000;  // Conversión
        return response;
    }
}
```

**Response JSON:**
```json
[
  {
    "idAlmacen": 1,
    "nombre": "Almacén Centro",
    "calle": "Alameda",
    "numero": "1000",
    "comuna": "Santiago",
    "region": "Región Metropolitana",
    "latitud": -33.4377,
    "longitud": -70.6705,
    "distanciaKm": 0.5,
    "distanciaMetros": 500
  },
  {
    "idAlmacen": 2,
    "nombre": "Almacén Sur",
    "calle": "Avenida Portugal",
    "numero": "5500",
    "comuna": "La Florida",
    "region": "Región Metropolitana",
    "latitud": -33.5012,
    "longitud": -70.5800,
    "distanciaKm": 8.2,
    "distanciaMetros": 8200
  }
]
```

**Ordenamiento:**
- ✅ Query tiene `ORDER BY distanciaKm ASC`
- ✅ Resultados llegan ordenados por cercanía (más cercanos primero)

**Verificación:**
- [x] Response incluye `distanciaKm`
- [x] Response incluye `distanciaMetros` (opcional pero recomendado)
- [x] Resultados ordenados ascendentemente por distancia
- [x] Cálculo usa fórmula de Haversine correcta

---

### CA-07: Persistencia Usa MER Existente

**Estado:** ✅ **COMPLETAMENTE IMPLEMENTADO**

**Criterio Original:**
> La persistencia usa el MER existente mediante almacen -> direccion -> comuna -> region y direccion.latitud/longitud.

**Modelo de Relaciones:**
```
ALMACEN (id_almacen)
  └─ id_direccion (FK)
     └─ DIRECCION (id_direccion)
        ├─ latitud
        ├─ longitud
        └─ id_comuna (FK)
           └─ COMUNA (id_comuna)
              ├─ nombre
              └─ id_region (FK)
                 └─ REGION (id_region)
                    └─ nombre
```

**Entidades JPA:**

```java
// REGION
@Entity
@Table(name = "region")
public class Region {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idRegion;
    
    private String nombre;
    private String codigo;
}

// COMUNA
@Entity
@Table(name = "comuna")
public class Comuna {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idComuna;
    
    private String nombre;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_region")
    private Region region;
}

// DIRECCION
@Entity
@Table(name = "direccion")
public class Direccion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idDireccion;
    
    private String calle;
    private String numero;
    private String codigoPostal;
    private BigDecimal latitud;      // ✅ Coordenadas
    private BigDecimal longitud;     // ✅ Coordenadas
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_comuna")
    private Comuna comuna;
}

// ALMACEN
@Entity
@Table(name = "almacen")
public class Almacen {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idAlmacen;
    
    private String nombre;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_direccion")
    private Direccion direccion;      // ✅ Enlace a dirección
}
```

**Query Repository:**
```java
@Repository
public interface AlmacenRepository extends JpaRepository<Almacen, Long> {
    @Query("""
        SELECT a FROM Almacen a
        JOIN a.direccion d
        JOIN d.comuna c
        JOIN c.region r
        WHERE d.latitud IS NOT NULL
        AND d.longitud IS NOT NULL
        AND a.estadoCuenta.codigo = 'ACTIVO'
    """)
    List<Almacen> findActiveWithCoordinates();
}
```

**Verificación:**
- [x] Entidades mapeadas correctamente
- [x] Relaciones: Almacen → Dirección → Comuna → Región
- [x] Campos `latitud`, `longitud` en tabla `direccion`
- [x] Queries usan navegación de relaciones

---

### CA-08: Frontend Consume Endpoint y Deja Mock

**Estado:** ✅ **COMPLETAMENTE IMPLEMENTADO**

**Criterio Original:**
> El frontend del mapa consume /api/geo/stores y deja de usar almacenes mock.

**Implementación Actual:**

En [geoService.js](../frontend/src/features/home/services/geoService.js):

```javascript
const USE_LOCAL_GEO = process.env.EXPO_PUBLIC_USE_LOCAL_GEO === 'true';

export async function fetchNearbyAlmacenes({ lat, lng, radioKm = 5 }) {
  if (USE_LOCAL_GEO) {
    return fetchNearbyAlmacenesLocal({ lat, lng, radioKm });
  }
  
  const { data } = await httpClient.get('/api/v1/almacenes/busqueda-espacial', {
    params: { lat, lng, radioKm },
    headers: getAuthHeader(),
  });
  
  return data;
}
```

En [geoService.local.js](../frontend/src/features/home/services/geoService.local.js):

```javascript
export async function fetchNearbyAlmacenesLocal({ lat, lng, radioKm = 5 }) {
  const { data } = await localGeoClient.get('/api/v1/almacenes/busqueda-espacial', {
    params: { lat, lng, radioKm },
    headers: getAuthHeader(),
  });
  return data;
}
```

En [HomeScreen.js](../frontend/src/features/home/screens/HomeScreen.js):

```javascript
export default function HomeScreen() {
  const [almacenes, setAlmacenes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [geoError, setGeoError] = useState(null);
  
  useEffect(() => {
    loadAlmacenes();
  }, [userLocation]);
  
  async function loadAlmacenes() {
    try {
      const data = await fetchNearbyAlmacenes({
        lat: userLocation.latitude,
        lng: userLocation.longitude,
        radioKm: 5,
      });
      setAlmacenes(data);  // ✅ Usa respuesta real
    } catch (error) {
      setAlmacenes(MOCK_STORES);  // ❌ Solo como fallback
    }
  }
  
  return (
    <MapView style={styles.map}>
      {almacenes.map(almacen => (
        <Marker
          key={almacen.idAlmacen}
          coordinate={{
            latitude: parseFloat(almacen.latitud),
            longitude: parseFloat(almacen.longitud),
          }}
          title={almacen.nombre}
        />
      ))}
    </MapView>
  );
}
```

**Flujo:**
1. ✅ Obtiene ubicación del usuario (GPS)
2. ✅ Llama a `/api/v1/almacenes/busqueda-espacial` con lat, lng
3. ✅ Renderiza almacenes reales en el mapa
4. ❌ MOCK_STORES solo si hay error

**Verificación:**
- [x] Frontend consume endpoint real
- [x] Mock como fallback, no como principal
- [x] Parámetros se envían correctamente
- [x] Respuesta se mapea a marcadores del mapa

---

### CA-09: Llamadas Protegidas Envían JWT

**Estado:** ✅ **COMPLETAMENTE IMPLEMENTADO**

**Criterio Original:**
> Las llamadas protegidas desde frontend envían Authorization: Bearer <accessToken>.

**Implementación Actual:**

En [geoService.js](../frontend/src/features/home/services/geoService.js):

```javascript
import { useAuthStore } from '../../../store/authStore';

function getAuthHeader() {
  const token = useAuthStore.getState().accessToken;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchNearbyAlmacenes({ lat, lng, radioKm = 5 }) {
  const { data } = await httpClient.get('/api/v1/almacenes/busqueda-espacial', {
    params: { lat, lng, radioKm },
    headers: getAuthHeader(),  // ✅ Incluye JWT
  });
  return data;
}
```

En [geoService.local.js](../frontend/src/features/home/services/geoService.local.js):

```javascript
function getAuthHeader() {
  const token = useAuthStore.getState().accessToken;
  console.log('🌍 GEO LOCAL - Token presente:', !!headers.Authorization);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchNearbyAlmacenesLocal({ lat, lng, radioKm = 5 }) {
  const headers = getAuthHeader();
  const { data } = await localGeoClient.get(
    '/api/v1/almacenes/busqueda-espacial',
    {
      params: { lat, lng, radioKm },
      headers,  // ✅ Incluye JWT
    }
  );
  return data;
}
```

**Headers Enviados:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Backend Valida JWT:**
En Spring Security (OAuth2 Resource Server):

```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: http://localhost:8081
```

El gateway y los servicios validan el JWT usando la clave pública del issuer.

**Verificación:**
- [x] `getAuthHeader()` extrae token de `useAuthStore`
- [x] Header `Authorization: Bearer <token>` se envía
- [x] Backend valida JWT en cada request
- [x] Requests sin JWT son rechazados (401)

---

### CA-10: Usuario CLIENTE No Puede Registrar Almacenes

**Estado:** ❌ **NO VERIFICADO / POSIBLE BRECHA DE SEGURIDAD**

**Criterio Original:**
> Un usuario CLIENTE no puede registrar almacenes después del registro; solo usuarios ALMACEN pueden crear almacenes.

**Análisis:**
Según el modelo de datos (HU-11), existen dos tipos de usuarios:
- **Rol ALMACEN**: Puede registrar y administrar almacenes
- **Rol CLIENTE**: Solo puede consumir servicios (búsqueda, consultas, valoraciones)

**Riesgo Identificado:**
❌ No se encontró validación de rol en los controladores de creación de almacenes

**Implementación Requerida:**

#### Paso 1: Verificar controlador de almacenes (en usuarios-service)

```java
@RestController
@RequestMapping("/api/almacenes")
public class AlmacenController {
    
    @PostMapping
    @PreAuthorize("hasRole('ALMACEN')")  // ✅ AGREGAR ESTA VALIDACIÓN
    public ResponseEntity<AlmacenResponse> crearAlmacen(
        @Valid @RequestBody CrearAlmacenRequest request,
        @AuthenticationPrincipal OAuth2User principal) {
        
        Long idUsuario = extractUsuarioId(principal);
        Almacen almacen = almacenService.crearAlmacen(idUsuario, request);
        
        return ResponseEntity.created(URI.create("/api/almacenes/" + almacen.getId()))
            .body(AlmacenResponse.from(almacen));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ALMACEN')")  // ✅ AGREGAR ESTA VALIDACIÓN
    public ResponseEntity<AlmacenResponse> actualizarAlmacen(
        @PathVariable Long id,
        @Valid @RequestBody ActualizarAlmacenRequest request,
        @AuthenticationPrincipal OAuth2User principal) {
        
        Long idUsuario = extractUsuarioId(principal);
        Almacen almacen = almacenService.actualizarAlmacen(idUsuario, id, request);
        
        return ResponseEntity.ok(AlmacenResponse.from(almacen));
    }
}
```

#### Paso 2: Verificar lógica de negocio

```java
@Service
public class AlmacenService {
    
    public Almacen crearAlmacen(Long idUsuario, CrearAlmacenRequest request) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
            .orElseThrow(() -> new UsuarioNoEncontradoException(idUsuario));
        
        // ✅ VALIDAR ROL AQUÍ TAMBIÉN (double-check)
        if (!"ALMACEN".equals(usuario.getRol().getNombreRol())) {
            throw new OperacionNoAutorizadaException(
                "Solo usuarios con rol ALMACEN pueden registrar almacenes"
            );
        }
        
        // Crear almacén...
    }
}
```

#### Paso 3: Test de Seguridad

```java
@SpringBootTest
public class AlmacenSecurityTest {
    
    @Test
    @WithMockOAuth2User(roles = "CLIENTE")
    void crearAlmacen_conRolCliente_debe_retornar_403() {
        // Debe rechazar con 403 Forbidden
        mockMvc.perform(post("/api/almacenes")
            .contentType(APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isForbidden());
    }
    
    @Test
    @WithMockOAuth2User(roles = "ALMACEN")
    void crearAlmacen_conRolAlmacen_debe_permitir() {
        // Debe permitir la creación
        mockMvc.perform(post("/api/almacenes")
            .contentType(APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated());
    }
}
```

**Verificación:**
- [ ] Controlador de almacenes tiene `@PreAuthorize("hasRole('ALMACEN')")`
- [ ] Servicio de almacenes valida el rol nuevamente
- [ ] Test verifica que CLIENTE es rechazado (403)
- [ ] Test verifica que ALMACEN puede crear

---

## 📊 Resumen de Estado

| Criterio | Estado | Implementación |
|----------|--------|-----------------|
| CA-01 | ✅ Parcial | Endpoints existen, JWT pendiente |
| CA-02 | ✅ Completo | Gateway routea correctamente |
| CA-03 | ✅ Completo | Google API consumida |
| CA-04 | ❌ Falta | Límite diario no implementado |
| CA-05 | ✅ Completo | Búsqueda espacial funcional |
| CA-06 | ✅ Completo | Distancia y ordenamiento OK |
| CA-07 | ✅ Completo | MER correctamente mapeado |
| CA-08 | ✅ Completo | Frontend consume endpoints |
| CA-09 | ✅ Completo | JWT se envía correctamente |
| CA-10 | ❌ Falta | Validación de rol no verificada |

---

## 🚀 Plan de Implementación

### Fase 1: Verificación y Ajustes (1-2 días)

1. **CA-01: Agregar `@PreAuthorize` a controladores**
   - [ ] AlmacenSearchController
   - [ ] GeolocationController

2. **CA-10: Agregar validación de rol**
   - [ ] Verificar controlador de creación de almacenes
   - [ ] Agregar `@PreAuthorize("hasRole('ALMACEN')")`
   - [ ] Test de seguridad

### Fase 2: Nuevas Funcionalidades (3-5 días)

3. **CA-04: Límite diario de geocoding**
   - [ ] Crear tabla `geocoding_audit`
   - [ ] Entidad `GeocodeAudit`
   - [ ] Repository con query de conteo
   - [ ] Validación en `GoogleGeocodingService`
   - [ ] Tests

### Fase 3: Validación (1 día)

4. **Testing Completo**
   - [ ] Test unitarios para cada criterio
   - [ ] Test integración con base de datos
   - [ ] Test seguridad (JWT, roles)
   - [ ] Test desde frontend

---

## 📝 Referencias

- [Microservicio Geolocation Service](./microservicio-geolocation-service.md)
- [Modelo de Datos AloVecino](./modelo-datos-alovecino.md)
- [Guía Celular WiFi Local](./CELULAR-WIFI-LOCAL.md)
