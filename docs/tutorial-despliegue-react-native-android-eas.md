# Tutorial Completo: Despliegue y Visualizacion en Android Studio con Expo EAS

## 1) Objetivo
Este documento explica, paso a paso y en detalle, como desplegar y visualizar una app React Native (Expo) en el emulador de Android Studio usando EAS Build, Dev Client y herramientas de apoyo como ADB.

Esta guia esta basada en el flujo real que se aplico en este proyecto.

## 2) Que logramos en este proyecto
Se dejo configurado:

- Build profiles EAS para 3 ambientes: `dev`, `qa`, `prod`.
- Config dinamica por ambiente para nombre app y package Android.
- Dev Client Android generado en EAS e instalado en emulador.
- Solucion de errores comunes de bundling JS y modulos nativos.

## 3) Conceptos clave para equipo junior

### 3.1 Build Profile (EAS)
Un profile define como se compila la app (`dev`, `qa`, `prod`), incluyendo variables de entorno, tipo de build y distribucion.

### 3.2 Development Client
No es Expo Go. Es una app nativa compilada para tu proyecto y sus modulos nativos. Si agregas un modulo nativo nuevo, debes recompilar e instalar un nuevo Dev Client.

### 3.3 Metro Bundler
Servidor JS local (`npx expo start ...`). El Dev Client se conecta a Metro para cargar el bundle JS.

### 3.4 ADB
Herramienta Android para instalar APKs y administrar dispositivos/emuladores.

## 4) Prerrequisitos

- Node y npm instalados.
- Android Studio instalado.
- Emulador Android creado y funcionando.
- Cuenta Expo/EAS con login correcto.
- Proyecto abierto en:
  - `frontend/` (Expo app)

## 5) Configuracion de ambientes (dev, qa, prod)

### 5.1 EAS profiles
Archivo: `frontend/eas.json`

Se definieron perfiles:

- `dev`
  - `developmentClient: true`
  - `distribution: internal`
  - `android.buildType: apk`
  - variables `APP_VARIANT=dev`, `EXPO_PUBLIC_APP_ENV=dev`, `EXPO_PUBLIC_API_URL=...`
- `qa`
  - `distribution: internal`
  - `android.buildType: apk`
  - variables QA
- `prod`
  - `android.buildType: app-bundle`
  - canal production
  - variables production

### 5.2 Owner y config dinamica
Archivo: `frontend/app.config.js`

Se configuro:

- `owner: "alovecino"` para evitar ambiguedad de cuentas EAS.
- Nombre y package por variante:
  - dev: `com.alovecino.app.dev`
  - qa: `com.alovecino.app.qa`
  - prod: `com.alovecino.app`

### 5.3 Scripts utiles
Archivo: `frontend/package.json`

Scripts agregados:

- `eas:build:dev`
- `eas:build:qa`
- `eas:build:prod`

## 6) Por que se necesitan PNG en assets (aunque tengas SVG)
Expo prebuild para Android/Web requiere archivos concretos para icon/splash/favicon segun config. Tener solo SVG no basta si el config apunta a PNG.

Archivos requeridos por el config:

- `assets/icon.png`
- `assets/adaptive-icon.png`
- `assets/splash-icon.png`
- `assets/favicon.png`

En este proyecto, se generaron desde `logo.svg` y `logo_2.svg` extrayendo su PNG embebido (base64), para mantener coherencia visual.

## 7) Flujo completo para levantar en emulador

## 7.1 Instalar dependencias
Desde `frontend/`:

```bash
npm install
```

Si usas `LinearGradient`, instalar modulo oficial Expo:

```bash
npx expo install expo-linear-gradient
```

## 7.2 Login y vinculacion EAS

```bash
npx eas whoami
npx eas init --force --non-interactive
```

> Nota: si tienes multiples cuentas, `owner` en app config evita bloqueos.

## 7.3 Generar Dev Build en EAS

```bash
npx eas build --platform android --profile dev --non-interactive --wait --json
```

Al terminar, tomar:

- `id`
- `artifacts.applicationArchiveUrl`

## 7.4 Configurar emulador Android Studio
Recomendado:

- Dispositivo: Pixel 8/10 Pro
- Imagen estable (no Canary/Preview)
- API estable (ej. 35/36.1)
- ABI: x86_64
- Services: Google Play o Google APIs

## 7.5 Verificar emulador conectado por ADB
Si `adb` no esta en PATH, usar ruta completa:

```bash
C:\Users\<tu_usuario>\AppData\Local\Android\Sdk\platform-tools\adb.exe devices
```

Debe aparecer algo como:

- `emulator-5554 device`

## 7.6 Descargar e instalar APK dev en emulador

```powershell
$build = (npx eas build:list --platform android --profile dev --status finished --limit 1 --json | ConvertFrom-Json)[0]
$apkUrl = $build.artifacts.applicationArchiveUrl
$apkPath = Join-Path $PWD "latest-dev.apk"
$adb = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
Invoke-WebRequest -Uri $apkUrl -OutFile $apkPath
& $adb -s emulator-5554 install -r $apkPath
```

Salida esperada:

- `Performing Streamed Install`
- `Success`

## 7.7 Levantar Metro para Dev Client

```bash
npx expo start --dev-client --clear --port 8081
```

Luego abrir la app instalada (`AloVecino Dev`) en el emulador.

## 8) Errores reales y como solucionarlos

## 8.1 Error: No development build installed
Mensaje tipico:

- `No development build (com.alovecino.app.dev) ... is installed`

Solucion:

1. Compilar profile `dev` con EAS.
2. Instalar APK con `adb install -r`.

## 8.2 Error JS: Unable to resolve expo-linear-gradient
Causa:

- Falta dependencia JS en proyecto.

Solucion:

```bash
npx expo install expo-linear-gradient
npx expo start --clear
```

## 8.3 Error nativo: Can't find ViewManagerAdapter_ExpoLinearGradient
Causa:

- El Dev Client instalado fue compilado antes de agregar `expo-linear-gradient`.

Solucion:

1. Recompilar Dev Client (`eas build --profile dev`).
2. Reinstalar APK en emulador.
3. Levantar Metro en modo dev-client.

## 8.4 Error: adaptive-icon.png no existe
Causa:

- Archivo referenciado en Expo config no existe.

Solucion:

- Crear/generar PNG requeridos en `assets/`.

## 8.5 Error: adb no reconocido
Causa:

- `platform-tools` no esta en PATH.

Solucion rapida:

- usar ruta completa `...\platform-tools\adb.exe`

Solucion definitiva:

- agregar `platform-tools` al PATH del sistema.

## 8.6 Puerto 8081 ocupado
Solucion:

```bash
npx expo start --dev-client --clear --port 8082
```

o liberar 8081.

## 9) Flujo por ambiente

## 9.1 Dev

```bash
npm run eas:build:dev
```

- APK interno + dev client.

## 9.2 QA

```bash
npm run eas:build:qa
```

- APK interno QA.

## 9.3 Prod

```bash
npm run eas:build:prod
```

- AAB para Play Store.

## 10) Checklist rapido para juniors

1. Estoy en `frontend/`.
2. Emulador encendido y visible en `adb devices`.
3. Dependencias instaladas (`npm install`).
4. Si agregue modulo nativo, recompilo Dev Client.
5. Instale ultimo APK dev (`adb install -r`).
6. Metro en modo dev-client (`expo start --dev-client`).
7. Abro app instalada en emulador.

## 11) Recomendaciones de equipo

- Mantener PNG requeridos por Expo en repo o generar en CI antes de build.
- Evitar imagenes Android preview para desarrollo diario.
- Documentar cada error nativo y su solucion en este archivo.
- Mantener estandar de perfiles `dev/qa/prod` para todo el equipo.

## 12) Comandos resumen (copiar/pegar)

```bash
# 1) instalar deps
npm install
npx expo install expo-linear-gradient

# 2) login + init
npx eas whoami
npx eas init --force --non-interactive

# 3) build dev
npx eas build --platform android --profile dev --non-interactive --wait --json

# 4) iniciar app en dev-client
npx expo start --dev-client --clear --port 8081
```

```powershell
# 5) instalar ultimo APK dev en emulador
$build = (npx eas build:list --platform android --profile dev --status finished --limit 1 --json | ConvertFrom-Json)[0]
$apkUrl = $build.artifacts.applicationArchiveUrl
$apkPath = Join-Path $PWD "latest-dev.apk"
$adb = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
Invoke-WebRequest -Uri $apkUrl -OutFile $apkPath
& $adb -s emulator-5554 install -r $apkPath
```
