# AV-73 HU-11 - Migracion al nuevo modelo de datos backend

## Objetivo

Aplicar el nuevo modelo de datos de Alo Vecino en NeonDB y adaptar los microservicios backend para operar con el esquema normalizado propuesto.

## Alcance funcional

- Aplicar el DDL del nuevo modelo en la base de datos dev de NeonDB mediante una estrategia controlada.
- Migrar `auth-service` para manejar sesiones de usuario y refresh tokens asociados a una sesion.
- Migrar `usuarios-service` para adoptar:
  - `usuario` con `rut`, `nombre_usuario`, `correo`, `rol`.
  - `cliente` como perfil asociado a usuario.
  - `almacen` como local fisico independiente asociado a usuario.
  - `direccion`, `region`, `comuna`.
  - estados de cuenta.
  - contactos, categorias, horarios e imagenes de almacen.
  - consultas, detalles, valoraciones y ofertas.
- Mantener compatibilidad con el API Gateway usando JWT/JWKS como mecanismo de autenticacion.

## Criterios de aceptacion

- [ ] Existe una migracion o script ejecutable contra NeonDB dev para crear/adaptar el esquema.
- [ ] `auth-service` persiste sesiones de usuario y refresh tokens asociados a esas sesiones.
- [ ] `auth-service` mantiene rotacion y revocacion de refresh tokens.
- [ ] `usuarios-service` usa entidades/repositorios acordes al nuevo modelo.
- [ ] Los endpoints existentes se ajustan o versionan para no romper flujos principales.
- [ ] Los tests backend cubren login, refresh, logout, registro de usuario, registro de cliente y registro de almacen.
- [ ] El despliegue dev queda documentado con variables requeridas.

## Notas tecnicas

- El access token JWT no se persiste; se firma en `auth-service` y se valida mediante JWKS.
- El refresh token se persiste solo como hash.
- Cada `ALMACEN` representa un local fisico independiente. Si un administrador tiene varios locales, se crean varios registros `ALMACEN`.
- No habra catalogo de productos; las consultas mantienen detalle textual.
