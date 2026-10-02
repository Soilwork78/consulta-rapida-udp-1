// El complemento @capacitor-community/speech-recognition no permite pedir
// reconocimiento en el dispositivo. Este script le agrega la opción
// `preferOffline` (RecognizerIntent.EXTRA_PREFER_OFFLINE), para que el audio
// no salga del teléfono cuando el paquete de español sin conexión está instalado.
// Si el complemento cambia y los anclajes no calzan, la instalación falla:
// mejor un error visible que perder la preferencia sin aviso.
const fs = require('fs');
const path = require('path');

const archivo = path.join(__dirname, '..', 'node_modules', '@capacitor-community', 'speech-recognition',
  'android', 'src', 'main', 'java', 'com', 'getcapacitor', 'community', 'speechrecognition', 'SpeechRecognition.java');

if (!fs.existsSync(archivo)) {
  console.log('preferir-offline: complemento no instalado, nada que hacer');
  process.exit(0);
}

let java = fs.readFileSync(archivo, 'utf8');
if (java.includes('preferirOffline')) {
  console.log('preferir-offline: ya aplicado');
  process.exit(0);
}

const CAMBIOS = [
  [
    'boolean popup = call.getBoolean("popup", false);',
    'boolean popup = call.getBoolean("popup", false);\n        this.preferirOffline = call.getBoolean("preferOffline", false);',
  ],
  [
    'intent.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, partialResults);',
    'intent.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, partialResults);\n        intent.putExtra(RecognizerIntent.EXTRA_PREFER_OFFLINE, this.preferirOffline);',
  ],
];
for (const [ancla, reemplazo] of CAMBIOS) {
  if (java.split(ancla).length !== 2) throw new Error('preferir-offline: el anclaje no calza, revisar el complemento: ' + ancla);
  java = java.replace(ancla, reemplazo);
}
// Campo de la clase, justo después de la declaración de la clase.
java = java.replace(/(public class SpeechRecognition extends Plugin[^{]*\{)/, '$1\n\n    private boolean preferirOffline = false;');
if (!java.includes('private boolean preferirOffline')) throw new Error('preferir-offline: no se pudo declarar el campo');

fs.writeFileSync(archivo, java);
console.log('preferir-offline: aplicado');
