# Pepe Grillo — app Android (prototipo)

APK de prueba que empaqueta la demo web de `../pepe-grillo` con [Capacitor](https://capacitorjs.com/). No duplica la lógica: al compilar, `scripts/copiar-web.js` copia la web a `www/` y agrega el puente de voz nativa.

**Prototipo: no usar con pacientes reales.** Es un APK de depuración, sin firma para Google Play.

## Qué cambia respecto de la web

- **Voz nativa de Android** (`src/voz-nativa.js`). El WebView de Android no tiene reconocimiento de voz, así que el puente reemplaza las APIs del navegador por los complementos `@capacitor-community/speech-recognition` y `@capacitor-community/text-to-speech`, con la misma interfaz. `index.html` no cambia.
- **Reconocimiento en el teléfono primero.** El complemento no permitía pedirlo; `scripts/preferir-offline.js` le agrega la opción `preferOffline` al instalar. Si el teléfono no tiene el español sin conexión, Pepe pasa a reconocimiento en línea y lo avisa en pantalla. Para que el audio no salga del equipo, hay que descargar el español en el reconocimiento de voz sin conexión (Ajustes de Google → Voz; la ruta varía según el teléfono).
- **La pantalla no se apaga** mientras la app está abierta.
- **Sin respaldo automático de Android** (`allowBackup="false"`).

## Limitaciones conocidas

- **Pepe escucha solo con la app en primer plano y la pantalla encendida.** Escuchar con el teléfono en el bolsillo requiere un servicio nativo en segundo plano (opción C, fuera de este prototipo).
- **Android suena un "bip" cada vez que empieza a escuchar.** En modo manos libres, la escucha se reinicia tras cada frase, así que el bip se repite.
- El sistema decide si respeta la preferencia de reconocimiento sin conexión; depende del teléfono y de la app de Google instalada.

## Cómo obtener el APK

Se compila en GitHub Actions (flujo `Pepe Grillo APK`) en cada cambio de `pepe-grillo/` o `pepe-grillo-app/`. El APK queda como artefacto `pepe-grillo-apk-prueba` en la ejecución: se descarga (viene en un .zip), se copia al teléfono y se instala permitiendo "instalar apps de origen desconocido".

## Compilar localmente

Requiere Node 22, Java 21 y el SDK de Android.

```bash
cd pepe-grillo-app
npm ci          # instala y aplica la preferencia de voz sin conexión
npm test        # pruebas del motor de Pepe
npm run sync    # copia la web a www/ y sincroniza android/
cd android && ./gradlew assembleDebug
# APK: android/app/build/outputs/apk/debug/app-debug.apk
```
