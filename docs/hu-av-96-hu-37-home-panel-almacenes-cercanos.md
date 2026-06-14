# AV-96 / HU-37 - Home Como Panel Informativo De Cliente

## Historia De Usuario

Como cliente, necesito que la pantalla Home sea un panel informativo con almacenes cercanos, perfiles y señales de ofertas, para entrar al flujo de consulta o revisar el perfil del negocio sin volver a ver el mapa como pantalla principal.

## Criterios De Aceptación

- CA-01: `/home` muestra un panel informativo y no renderiza `MapView`.
- CA-02: El primer botón de navegación abre el mapa en `/home/ubicacion`.
- CA-03: El panel carga almacenes cercanos desde `geo-service` usando ubicación actual y `configuracion_usuario.radio_ofertas_km` cuando está disponible.
- CA-04: Cada almacén cercano permite abrir el perfil público existente en `/home/negocio/[id]`.
- CA-05: Cada almacén cercano permite iniciar una consulta estructurada en `/home/consultas/nueva/[id]`.
- CA-06: El panel muestra señales basadas en el MER actual: almacenes activos, radio de ofertas y estado de ofertas publicadas.
- CA-07: El panel permite acceder al historial de consultas en `/home/consultas/mis`.
- CA-08: El historial de consultas permite abrir el perfil del almacén o crear una nueva consulta para el mismo almacén.

## Definition Of Done

- `HomeScreen` queda desacoplado del mapa.
- `MapScreen` conserva el comportamiento anterior del mapa y filtros de radio.
- Las rutas Expo Router incluyen `/home/ubicacion`.
- Los tabs de cliente en home, configuración y perfil diferencian ubicación e inicio.
- Tests frontend cubren panel, navegación a mapa, perfil, consulta y preservación del mapa.
- Tests frontend cubren acceso a historial y acciones desde consultas históricas.

## Pruebas Por Código

- `cd frontend; npm test -- HomeScreen.test.js MapScreen.test.js --runInBand`
- `cd frontend; npm test -- HomeScreen.test.js ConsultasClienteScreens.test.js consultasClienteService.test.js --runInBand`
