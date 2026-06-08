# AV-93 / HU-34 - Aprobación y visibilidad de almacenes

## Historia de Usuario

Como administrador, quiero aprobar o rechazar almacenes registrados, para controlar qué negocios aparecen públicamente en el mapa y pueden recibir consultas.

## Criterios de Aceptación

- [x] CA-01: Un almacén registrado queda inicialmente en estado `PENDIENTE`.
- [x] CA-02: Un administrador puede cambiar el estado del almacén a `ACTIVO`, `RECHAZADO`, `SUSPENDIDO`, `INACTIVO` o `PENDIENTE`.
- [x] CA-03: Solo almacenes `ACTIVO` aparecen en la búsqueda geográfica del mapa cliente.
- [x] CA-04: El registro público de almacén solicita teléfono y lo persiste como contacto principal.
- [x] CA-05: Región y comuna se normalizan para variantes comunes del entorno dev, como `RM` y `Penalolen`.
- [x] CA-06: Los filtros móviles de 10 km y 100 km son aceptados por `geo-service`.
- [x] CA-07: El mapa prioriza la ubicación actual del dispositivo antes de usar una última ubicación conocida.
- [x] CA-08: El panel del almacenero explica cuando el almacén está pendiente de aprobación.
- [x] CA-09: El formulario de registro permite completar los últimos campos con el teclado abierto sin escribir a ciegas.

## Definition of Done

- [x] Backend `usuarios-service` expone cambio de estado de almacén protegido para administradores.
- [x] Backend `geo-service` filtra almacenes por estado `ACTIVO`.
- [x] Frontend registra teléfono en cuentas tipo almacén.
- [x] Frontend Home actualiza ubicación y maneja radios ofrecidos por UI.
- [x] Contenedor de formularios ajustado para evitar que el teclado tape campos inferiores.
- [x] Pruebas backend ejecutadas en `usuarios-service` y `geo-service`.
- [x] Pruebas frontend dirigidas ejecutadas para registro, mapa y panel almacenero.

## Evidencia de Pruebas

- `mvn -f backend/usuarios-service/pom.xml test`: OK.
- `mvn -f backend/geo-service/pom.xml test`: OK.
- `cd frontend; npm test -- registerService.test.js registerSchema.test.js HomeScreen.test.js AlmaceneroScreens.test.js --runInBand`: OK.

## Notas de QA Manual

- Para que un almacén registrado aparezca en el mapa, debe pasar de `PENDIENTE` a `ACTIVO`.
- En dev, si un almacén no aparece aunque esté `ACTIVO`, validar coordenadas en `direccion.latitud` y `direccion.longitud`.
- El botón de ubicación actualiza la posición del dispositivo; el botón de casa vuelve al inicio del mapa, reinicia radio a 500 m y recarga almacenes.
