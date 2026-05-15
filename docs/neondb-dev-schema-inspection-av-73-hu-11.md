# Inspeccion NeonDB dev - AV-73 HU-11

Fecha de inspeccion: 2026-05-03

## Conexion

Se inspecciono la branch `dev` del proyecto Neon `alovecino`.

- Proyecto Neon: `super-poetry-34181860`
- Branch dev: `br-plain-sky-aml1hhzm`
- PostgreSQL: 17.8

## Tablas actuales

- `almacen`
- `cliente`
- `consulta`
- `direccion`
- `refresh_token`
- `rol`
- `usuario`
- `valoracion`

## Diferencias relevantes contra el modelo propuesto

- `usuario` no tiene `rut`.
- `usuario.correo` existe, pero actualmente permite `NULL` y no tiene constraint `UNIQUE`.
- `usuario.id_rol` permite `NULL`.
- `usuario` aun mantiene `uuid`.
- `refresh_token` apunta directamente a `usuario`; el nuevo modelo requiere `sesion_usuario -> refresh_token`.
- `cliente` usa ids `integer`, mientras `usuario` usa `bigint`.
- `cliente.fecha_nacimiento`, `cliente.id_usuario` y `cliente.id_direccion` permiten `NULL`.
- `direccion` mantiene `comuna` y `ciudad` como texto libre; el nuevo modelo requiere `region` y `comuna` normalizadas.
- `almacen` mantiene `direccion`, `comuna` y `telefono` como columnas directas; el nuevo modelo mueve direccion/contactos a entidades relacionadas.
- `almacen.id_direccion` existe, pero permite `NULL`.
- `almacen.id_usuario` existe, pero permite `NULL`.
- `consulta` mantiene `descripcion` y `cantidad` en cabecera; el nuevo modelo usa `consulta` + `consulta_detalle`.
- `consulta` no tiene `estado_consulta`, `respuesta` ni `fecha_respuesta`.
- `valoracion` solo referencia `almacen`; falta referencia a `cliente`.
- No existen tablas para configuracion de usuario, sesiones, estados, categorias, horarios, imagenes, ofertas ni preferencias de cliente.

## Recomendacion

No aplicar `docs/ddl-neondb-modelo-alovecino.sql` directamente sobre esta branch sin una estrategia de migracion.

Opciones:

1. Reset controlado de Neon dev y aplicacion completa del DDL nuevo.
   - Mas rapido para desarrollo.
   - Pierde datos actuales de dev.
   - Requiere coordinar con el equipo.

2. Migracion incremental.
   - Conserva datos actuales.
   - Requiere script de migracion con `ALTER TABLE`, backfill y cambios de FKs.
   - Es la opcion correcta si dev ya contiene datos utiles.

Para AV-73 HU-11, se recomienda primero adaptar backend y tests contra el modelo nuevo en H2/PostgreSQL local, luego decidir si Neon dev se resetea o se migra incrementalmente.

## Ejecucion posterior

Se decidio usar la opcion 1: reset controlado de NeonDB dev.

Acciones ejecutadas:

- `DROP SCHEMA IF EXISTS public CASCADE`
- `CREATE SCHEMA public`
- Aplicacion de `docs/ddl-neondb-modelo-alovecino.sql`
- Aplicacion de `docs/seed-neondb-dev-av-73-hu-11.sql`

Resultado:

- DDL aplicado correctamente: 42 sentencias.
- Seed aplicado correctamente: 10 sentencias.
- Tablas resultantes: 25.

Seeds verificados:

- `rol`: 3 registros.
- `estado_cuenta`: 5 registros.
- `estado_consulta`: 4 registros.
- `tipo_contacto`: 4 registros.
- `tipo_imagen`: 3 registros.
- `categoria_almacen`: 5 registros.
- `region`: 16 registros.

Roles base:

- `1:CLIENTE`
- `2:ALMACEN`
- `3:ADMIN`

Nota: tras este reset, los microservicios actuales todavia deben migrarse al nuevo modelo antes de operar correctamente contra NeonDB dev.
