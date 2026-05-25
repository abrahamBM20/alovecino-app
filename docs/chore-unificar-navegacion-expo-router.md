# CHORE - Unificar navegación frontend con Expo Router

## Objetivo

Eliminar el uso de navegación paralela basada en `AppStack`/React Navigation clásico y dejar Expo Router como única estrategia de navegación del frontend.

## Contexto

La aplicación entra por `expo-router/entry` y define sus rutas en `frontend/src/app`, pero aún existían adaptadores que simulaban objetos `navigation` y un `AppStack` legacy. Esa mezcla hacía más difícil razonar sobre rutas, pruebas y regresiones de navegación.

## Alcance

- Remover `frontend/src/navigation/AppStack.js`.
- Evitar que pantallas de auth reciban objetos `navigation` fabricados desde route files.
- Usar `useRouter` de `expo-router` en las pantallas/hooks que necesitan navegar.
- Mantener rutas reales en `frontend/src/app`.
- Cubrir navegación crítica con pruebas unitarias.

## Criterios de aceptación

- La pantalla de selección de autenticación navega a `/auth/login` y `/auth/register` usando Expo Router.
- Login y registro resuelven el botón Volver con `router.back()` o fallback a `/auth`.
- Registro exitoso redirige a `/auth/login` usando Expo Router.
- Home navega a `/home/configuracion` al presionar el tab de configuración.
- No quedan imports ni referencias a `AppStack`.
- No se agregan nuevos adaptadores `navigation.navigate` en route files.

## DoD

- `AppStack.js` eliminado.
- Route files de auth solo renderizan sus pantallas.
- Pruebas de `AuthSelectionScreen` actualizadas a rutas Expo Router.
- Prueba de `HomeScreen` cubre navegación al tab configuración.
- Tests focalizados ejecutados correctamente.
