# AV-80 HU-23 - Configurar ambiente QA

## Historia de usuario

Como equipo de desarrollo de AloVecino, quiero contar con un ambiente QA independiente para backend y frontend, de modo que podamos validar la promocion de cambios desde `dev` antes de preparar una liberacion productiva.

## Objetivo

Configurar el ambiente QA con servicios backend en Render, base de datos NeonDB en branch `qa`, build Android de Expo/EAS con perfil `qa`, y un pipeline CI/CD ejecutado durante la promocion `dev -> qa`.

## Alcance

- Crear servicios Render QA para `api-gateway`, `auth-service` y `usuarios-service`.
- Conectar los servicios QA a la branch NeonDB `qa`.
- Configurar el perfil EAS `qa` para consumir el gateway QA.
- Agregar workflow GitHub Actions para pruebas, analisis SonarQube opcional, deploy Render QA y build Android QA.
- Documentar secretos requeridos para operar el pipeline.

## Criterios de aceptacion

- [ ] Existe ambiente Render `qa` con los tres servicios backend.
- [ ] Los servicios QA despliegan desde branch Git `qa`.
- [ ] Los servicios QA usan NeonDB branch `qa`.
- [ ] El perfil EAS `qa` apunta a `https://alovecino-api-gateway-qa.onrender.com`.
- [ ] El workflow `QA CI/CD` corre al abrir PR hacia `qa` y al hacer push en `qa`.
- [ ] En PR hacia `qa`, el workflow ejecuta tests backend y frontend.
- [ ] En push a `qa`, el workflow gatilla deploy Render QA y build Android EAS `qa`.
- [ ] SonarQube se ejecuta si `vars.SONAR_ENABLED` esta configurado en `true`.

## Secretos y variables requeridas

- `EXPO_TOKEN`: token de Expo/EAS para ejecutar builds no interactivos.
- `RENDER_API_KEY`: API key de Render para gatillar deploys por API.
- `SONAR_TOKEN`: token de SonarQube o SonarQube Cloud.
- `SONAR_HOST_URL`: URL del servidor SonarQube.
- `SONAR_ENABLED`: variable de repositorio. Usar `true` para activar SonarQube.

## Servicios Render QA

- `alovecino-auth-service-qa`
- `alovecino-usuarios-service-qa`
- `alovecino-api-gateway-qa`

## URLs QA

- Gateway: `https://alovecino-api-gateway-qa.onrender.com`
- Auth service: `https://alovecino-auth-service-qa.onrender.com`
- Usuarios service: `https://alovecino-usuarios-service-qa.onrender.com`
