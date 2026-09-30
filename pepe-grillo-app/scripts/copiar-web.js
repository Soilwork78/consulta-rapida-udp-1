// Copia la demo web (../pepe-grillo) a www/ y agrega el puente de voz nativa.
// La lógica de Pepe vive en un solo lugar: la app no duplica código.
const fs = require('fs');
const path = require('path');

const origen = path.join(__dirname, '..', '..', 'pepe-grillo');
const destino = path.join(__dirname, '..', 'www');

const ARCHIVOS = [
  'index.html', 'kb.js', 'motor.js', 'doble-chequeo.js', 'checklist.js', 'registro.js',
  'protocolos/sca.js', 'instituciones/ejemplo.js',
];

fs.rmSync(destino, { recursive: true, force: true });
for (const rel of ARCHIVOS) {
  const de = path.join(origen, rel);
  if (!fs.existsSync(de)) throw new Error('Falta ' + de);
  const a = path.join(destino, rel);
  fs.mkdirSync(path.dirname(a), { recursive: true });
  fs.copyFileSync(de, a);
}
fs.copyFileSync(path.join(__dirname, '..', 'src', 'voz-nativa.js'), path.join(destino, 'voz-nativa.js'));

// El puente de voz debe cargarse antes que cualquier script de la página.
const indice = path.join(destino, 'index.html');
let html = fs.readFileSync(indice, 'utf8');
const ancla = '<script src="kb.js"></script>';
if (!html.includes(ancla)) throw new Error('No encontré ' + ancla + ' en index.html');
html = html.replace(ancla, '<script src="voz-nativa.js"></script>\n' + ancla);
// La página se publica como fragmento (el visor agrega el esqueleto); en la app va completa.
if (!/^\s*<!doctype/i.test(html)) html = '<!doctype html>\n<html lang="es">\n' + html + '\n</html>\n';
fs.writeFileSync(indice, html);

console.log('www/ listo:', ARCHIVOS.length + 1, 'archivos');
