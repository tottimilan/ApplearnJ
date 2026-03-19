# Nihongo Pocket 100 (Pixel 9)

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

## Ejecutar en tu Pixel 9 (rápido)

1. Instala **Expo Go** desde Play Store en tu Pixel.
2. En tu ordenador:
   ```bash
   cd learn-japanese-app
   npm install
   npm run android
   ```
3. Se abrirá la app en Android/emulador o te mostrará QR para Expo Go.

## Build instalable (APK/AAB)

Si quieres instalar sin Expo Go:

1. Instala EAS CLI:
   ```bash
   npm install -g eas-cli
   ```
2. Desde `learn-japanese-app/`:
   ```bash
   eas login
   eas build:configure
   ```
3. Build directo APK (instalación rápida en Pixel):
   ```bash
   npm run build:android:apk
   ```
4. Build de producción AAB (Play Store):
   ```bash
   npm run build:android:aab
   ```
5. Descarga el artefacto generado e instálalo en tu Pixel 9.

## Notas

- La app funciona sin backend para el aprendizaje base.
- Se añadió `eas.json` con perfiles `preview` (APK) y `production` (AAB).
- Si después quieres sincronización avanzada con servidor (Railway), se puede añadir en una siguiente iteración.