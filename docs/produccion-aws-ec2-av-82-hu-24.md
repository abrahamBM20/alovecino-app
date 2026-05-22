# Produccion AWS EC2 - AV-82 / HU-24

Esta HU deja preparado el camino de produccion sin Render. El backend se despliega en una unica EC2 free-tier cautious con Docker Compose, la app movil se compila con EAS usando la rama `main`, y la base de datos usa Neon en una rama/conexion separada de QA.

## Alcance

- Rama GitHub de produccion: `main`.
- Backend produccion: EC2 + Docker Compose.
- Frontend movil produccion: EAS Android `prod`.
- Base produccion: Neon branch `production` en el proyecto `alovecino`.
- Render: no se usa en produccion.

## Consideraciones free tier AWS

AWS cambio su Free Tier para cuentas nuevas desde el 15 de julio de 2025: nuevas cuentas pueden recibir hasta USD 200 en creditos y elegir Free Plan por hasta 6 meses. Para EC2, los tipos elegibles dependen de la fecha de creacion de la cuenta. Antes del 15 de julio de 2025, suelen aplicar `t2.micro`/`t3.micro`; desde esa fecha AWS documenta mas tipos elegibles como `t3.micro`, `t3.small`, `t4g.micro`, `t4g.small`, `c7i-flex.large` y `m7i-flex.large`.

Esta configuracion usa por defecto `t3.micro`, 8 GB gp3 y una sola IPv4 publica. AWS incluye 750 horas/mes de IPv4 publica en uso para EC2 bajo Free Tier, pero fuera de Free Tier o sobre ese limite la IPv4 publica puede generar cobro por hora. No se crea Load Balancer para evitar costos adicionales.

## Provisionar EC2 con AWS CLI

Primero autenticar AWS:

```powershell
aws configure
```

o:

```powershell
aws login
```

Luego crear la instancia:

```powershell
.\scripts\setup-aws-ec2-prod.ps1 `
  -Repo abrahamBM20/alovecino-app `
  -Region us-east-1 `
  -InstanceType t3.micro `
  -AllowedSshCidr <tu-ip-publica>/32
```

El script:

- obtiene la AMI Amazon Linux 2023 vigente;
- crea security group para SSH desde tu IP, HTTP 80 y HTTPS 443;
- crea una key pair si no existe;
- lanza la EC2;
- instala Docker;
- crea `/opt/alovecino/prod/current`;
- carga en GitHub los secrets `PROD_EC2_HOST`, `PROD_EC2_USER` y `PROD_EC2_SSH_KEY`;
- define `PROD_API_BASE_URL` como `http://<public-dns>`.

## Preparar Neon produccion

El proyecto Neon detectado para Alo Vecino es `super-poetry-34181860` (`alovecino`) y la rama productiva existente es `production`. El script puede usar la sesion local de `neonctl` o una Neon API Key.

Con sesion local de Neon:

```powershell
.\scripts\setup-neon-prod.ps1 `
  -Repo abrahamBM20/alovecino-app `
  -ProjectId super-poetry-34181860 `
  -Branch production `
  -Database neondb `
  -Role neondb_owner
```

Con Neon API Key para no depender de OAuth local:

```powershell
$env:NEON_API_KEY = "<neon-api-key>"
.\scripts\setup-neon-prod.ps1 `
  -Repo abrahamBM20/alovecino-app `
  -ProjectId super-poetry-34181860 `
  -Branch production `
  -Database neondb `
  -Role neondb_owner
```

El script crea la rama si no existe, obtiene la connection string pooled y configura:

- `PROD_NEON_DATABASE_URL`
- `PROD_NEON_DATABASE_USERNAME`
- `PROD_NEON_DATABASE_PASSWORD`

## Secrets y variables GitHub

Si prefieres cargar todo manualmente:

```powershell
.\scripts\setup-github-prod-secrets.ps1 -Repo abrahamBM20/alovecino-app
```

Secrets requeridos:

- `PROD_EC2_HOST`
- `PROD_EC2_USER`
- `PROD_EC2_SSH_KEY`
- `PROD_NEON_DATABASE_URL`
- `PROD_NEON_DATABASE_USERNAME`
- `PROD_NEON_DATABASE_PASSWORD`
- `PROD_APP_JWT_PRIVATE_KEY`
- `PROD_APP_JWT_PUBLIC_KEY`
- `EXPO_TOKEN`

Variables requeridas:

- `PROD_API_BASE_URL`
- `PROD_CORS_ALLOWED_ORIGINS`

## Pipeline produccion

El workflow `.github/workflows/prod-cd.yml` corre en `push` a `main` o manualmente. Ejecuta:

1. tests backend en `api-gateway`, `auth-service` y `usuarios-service`;
2. tests frontend;
3. package Maven en GitHub Actions;
4. envio de bundle a EC2 por SSH;
5. `docker compose` en EC2 usando `deploy/docker/docker-compose.prod.yml`;
6. health check de `http://<PROD_EC2_HOST>/actuator/health`;
7. build Android produccion en EAS usando `PROD_API_BASE_URL`.

## Notas operativas

- La EC2 expone solo el gateway por puerto 80. `auth-service` y `usuarios-service` quedan internos en la red de Docker.
- Para produccion real con cookies seguras, configurar dominio y HTTPS. El puerto 443 queda reservado, pero esta HU no agrega Load Balancer para mantener costo cero.
- Los JARs se compilan en GitHub Actions, no en EC2, para reducir riesgo de memoria/CPU en `t3.micro`.
- Si se elimina la EC2, eliminar tambien key pairs, security groups no usados y volumenes para evitar recursos huerfanos.
