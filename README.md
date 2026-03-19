# LearnJapanese (Pixel 9)

Aplicación móvil minimalista para aprender y usar en el día a día **100 frases/palabras japonesas** útiles en Japón (restaurantes, calle, transporte, hotel, emergencias y conversación).

## Estructura del proyecto

- `learn-japanese-app/` → app móvil en Expo + React Native (TypeScript)

## Funcionalidades principales

- 100 frases y palabras reales de uso frecuente
- Audio en japonés con TTS (voz `ja-JP`)
- Búsqueda por japonés, romaji y español
- Filtro por categorías de situación real
- Frase del día (dinámica por fecha)
- Favoritos con persistencia local (offline)
- Quiz tipo flashcards con progreso y rachas guardadas
- Interfaz minimalista, optimizada para móvil

## Instalar en Android sin Expo Go (APK)

Este es el flujo recomendado para instalar la app **directamente como APK** en tu Pixel 9 (sin depender de Expo Go).

### 1) Comprobaciones previas

Desde `learn-japanese-app/`:

```bash
npm install
npm run typecheck
```

Si `typecheck` termina sin errores, el código TypeScript está correcto para build.

### 2) Configurar EAS una sola vez

> Necesario solo la primera vez en este proyecto.

```bash
npx eas-cli login
npx eas-cli init
npx eas-cli build:configure
```

Nota: si intentas build en modo no interactivo sin `eas init`, aparece el error:
`EAS project not configured. Must configure EAS project by running 'eas init'.`

### 3) Generar APK instalable

```bash
npm run build:android:apk
```

Este comando usa el perfil `preview` de `eas.json` con `buildType: "apk"`.

### 4) Verificar que el build terminó bien

```bash
npx eas-cli build:list --platform android --limit 1
```

El último build debe aparecer como `finished` y con URL de descarga del `.apk`.

### 5) Instalar en el Pixel 9

- Descarga el `.apk` desde la URL del build.
- Pásalo al teléfono y ábrelo para instalar.
- Si Android lo solicita, habilita "instalar apps desconocidas" para la app desde la que abres el APK.

## Build de producción (AAB para Play Store)

```bash
npm run build:android:aab
```

Este comando usa el perfil `production` de `eas.json` con `buildType: "app-bundle"`.

## Desarrollo rápido (opcional)

Si quieres iterar rápido en desarrollo, puedes usar Expo Go:

```bash
npm run android
```

## Notas

- La app funciona sin backend para el aprendizaje base.
- Se añadió `eas.json` con perfiles `preview` (APK) y `production` (AAB).
- Si después quieres sincronización avanzada con servidor (Railway), se puede añadir en una siguiente iteración.