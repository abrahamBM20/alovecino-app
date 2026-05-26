# Despliegue Docker - usuarios-service

Este servicio puede ejecutarse con Docker usando PostgreSQL local o una base externa como Neon.

## 1. Configurar variables

Copia el archivo de ejemplo:

```bash
cp .env.example .env
```

En Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Edita `.env` y completa las credenciales de Cloudinary.

## 2. Construir imagen

```bash
docker build -t alovecino/usuarios-service:local .
```

## 3. Ejecutar con Docker Compose

```bash
docker compose up --build
```

El servicio queda disponible en:

```text
http://localhost:8080
```

Healthcheck:

```text
http://localhost:8080/actuator/health
```

## 4. Ejecutar usando Neon/PostgreSQL externo

Edita `.env` y cambia estas variables:

```env
SPRING_DATASOURCE_URL=jdbc:postgresql://HOST/DB?sslmode=require
SPRING_DATASOURCE_USERNAME=USUARIO
SPRING_DATASOURCE_PASSWORD=PASSWORD
```

Luego ejecuta:

```bash
docker compose up --build usuarios-service
```

## 5. Ejecutar tests

```bash
./mvnw test
```

En Windows PowerShell:

```powershell
.\mvnw.cmd test
```

Los tests usan perfil `test` y base H2 en memoria. No requieren PostgreSQL ni credenciales reales de Cloudinary.
