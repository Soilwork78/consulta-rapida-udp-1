// Pruebas del motor. Uso: node --test pepe-grillo/motor.test.js
const test = require('node:test');
const assert = require('node:assert');
const kb = require('./kb.js');
const inst = require('./instituciones/ejemplo.js');
const { interpretar, crearSesion } = require('./motor.js');

test('ingreso con sospecha de SCA: datos del paciente y sospecha', () => {
  const i = interpretar('Pepe, ingresa box 3, hombre de 58 años con dolor torácico, el médico sospecha SCA', kb);
  assert.strictEqual(i.intencion, 'ingreso');
  assert.strictEqual(i.box, '3');
  assert.strictEqual(i.edad, 58);
  assert.strictEqual(i.sexo, 'hombre');
  assert.strictEqual(i.sospecha.item.id, 'sca');
  assert.strictEqual(i.motivo.id, 'dolor-toracico');
});

test('box dicho en palabras', () => {
  assert.strictEqual(interpretar('pepe box cinco sospecha sepsis', kb).box, '5');
});

test('"ave" no calza dentro de "grave"', () => {
  const i = interpretar('paciente grave con fiebre', kb);
  assert.strictEqual(i.sospecha, null);
  assert.strictEqual(i.motivo.id, 'fiebre-sepsis');
});

test('solo motivo de consulta, sin sospecha', () => {
  const i = interpretar('ingresa mujer de 30 años con dolor abdominal', kb);
  assert.strictEqual(i.sospecha, null);
  assert.strictEqual(i.motivo.id, 'dolor-abdominal');
});

test('TEP prefiere el motivo mencionado', () => {
  assert.strictEqual(interpretar('disnea, sospecha de TEP', kb).motivo.id, 'disnea');
  assert.strictEqual(interpretar('dolor torácico, sospecha de TEP', kb).motivo.id, 'dolor-toracico');
});

test('confirmado elige el diagnóstico confirmado', () => {
  const i = interpretar('box 3 confirmado IAM con supradesnivel', kb);
  assert.strictEqual(i.intencion, 'confirmado');
  assert.strictEqual(i.sospecha.item.id, 'iamcest');
});

test('frase incomprensible', () => {
  assert.strictEqual(interpretar('hola qué tal', kb).intencion, 'desconocido');
});

test('SCA: la enfermera marca el ritmo con "sigue" y pregunta "por qué"', () => {
  const s = crearSesion(kb, inst);
  const r1 = s.procesar('Pepe, ingresa box 3, hombre de 58 años, dolor torácico, sospecha SCA').respuesta;
  assert.match(r1.hablar, /^Box 3, hombre de 58 años\. Sospecha de síndrome coronario agudo\. Primer contacto\. ECG de 12 derivaciones/);
  assert.match(r1.hablar, /Cuando quieras, dime sigue\.$/);
  assert.strictEqual(r1.clave, 'sca:primer-contacto');
  assert.strictEqual(r1.hitos[0].min, 5);

  assert.match(s.procesar('por qué').respuesta.hablar, /se diagnostica con el ECG/);
  const banderas = s.procesar('sigue').respuesta;
  assert.match(banderas.hablar, /^Banderas rojas/, 'banderas rojas en segundo lugar');
  assert.match(s.procesar('repite').respuesta.hablar, /^Banderas rojas/);
  assert.match(s.procesar('qué más').respuesta.hablar, /^Protocolo local: En este hospital no hay hemodinamia/);
  assert.match(s.procesar('sigue').respuesta.hablar, /^Protocolo local: La troponina/);
  assert.match(s.procesar('anterior').respuesta.hablar, /^Protocolo local: En este hospital/);

  let r;
  for (let k = 0; k < 30; k++) r = s.procesar('sigue').respuesta;
  assert.match(r.hablar, /^Eso es todo para el box 3\. Te aviso al minuto 5\.$/);
  const pasos = r1.pasos;
  assert.match(pasos[pasos.length - 2], /No olvides descartar: Disección aórtica/);
  assert.match(pasos[pasos.length - 1], /Código IAM: anexo 1111/);

  const r3 = s.procesar('Pepe, el ECG muestra supradesnivel').respuesta;
  assert.strictEqual(r3.clave, 'sca:iamcest');
  assert.match(r3.hablar, /^Box 3, hombre de 58 años\. IAM con supradesnivel confirmado.*Activa el código IAM/);
  assert.ok(!/dime sigue/.test(r3.hablar), 'la ayuda no se repite');

  assert.strictEqual(s.procesar('va a fibrinólisis').respuesta.clave, 'sca:fibrinolisis');
  assert.strictEqual(s.procesar('se traslada a hemodinamia').respuesta.clave, 'sca:traslado');

  const r4 = s.procesar('Pepe, box 3 descartado SCA').respuesta;
  assert.ok(r4.detenerHitos);
  assert.match(r4.hablar, /Disección aórtica/);
});

test('SCA: rutas de entrada a cada fase', () => {
  const f = (t) => crearSesion(kb, inst).procesar(t).respuesta.clave;
  assert.strictEqual(f('ingresa con dolor torácico'), 'sca:primer-contacto');
  assert.strictEqual(f('confirmado IAMCEST'), 'sca:iamcest');
  assert.strictEqual(f('SCA sin supradesnivel'), 'sca:scasest');
  assert.strictEqual(f('troponina positiva, angina inestable'), 'sca:scasest');
  assert.strictEqual(f('dolor torácico, sospecha de TEP'), 'tep', 'otra sospecha no entra al protocolo SCA');
  assert.strictEqual(f('sospecha de disección'), 'diseccion');
});

test('checklist de fibrinólisis: absoluta detiene, relativas y "no sé" se informan', () => {
  const s = crearSesion(kb, inst);
  const r0 = s.procesar('Pepe, checklist de fibrinólisis, box 3').respuesta;
  assert.match(r0.hablar, /ACV hemorrágico/);
  assert.strictEqual(r0.esperando, 'sino');
  const abs = kb && require('./protocolos/sca.js').contraindicaciones;
  let r;
  for (let k = 0; k < abs.absolutas.length; k++) r = s.procesar(k === 2 ? 'no sé' : 'no').respuesta;
  assert.match(r.hablar, /Ahora las relativas/);
  r = s.procesar('sí').respuesta; // TIA en 6 meses
  for (let k = 1; k < abs.relativas.length; k++) r = s.procesar('no').respuesta;
  assert.match(r.hablar, /Sin contraindicaciones absolutas\. Relativas: Crisis isquémica/);
  assert.match(r.hablar, /Quedan sin verificar: Tumor/);
  assert.strictEqual(r.esperando, null);

  const s2 = crearSesion(kb, inst);
  s2.procesar('contraindicaciones de trombolisis');
  s2.procesar('no');
  const stop = s2.procesar('sí').respuesta;
  assert.match(stop.hablar, /Contraindicación absoluta: acv isquémico en los últimos 6 meses\. No se fibrinoliza/);
  assert.ok(!s2.enDialogo);
});

test('"sigue" en otro box y sin paciente', () => {
  const s = crearSesion(kb, inst);
  s.procesar('box 3 sospecha SCA');
  s.procesar('box 5 sospecha sepsis');
  assert.match(s.procesar('Pepe, box 3, sigue').respuesta.hablar, /^Banderas rojas/);
  assert.match(s.procesar('box 9 sigue').respuesta.hablar, /No tengo un paciente activo en el box 9/);
});

test('"sigue" también avanza el doble chequeo', () => {
  const s = crearSesion(kb, null);
  s.procesar('chequeo heparina bic');
  assert.match(s.procesar('sigue').respuesta.hablar, /Verifiquen el frasco/);
});

test('sin institución: exámenes quedan "según indicación"', () => {
  const r = crearSesion(kb, null).procesar('sospecha de ACV').respuesta;
  assert.ok(r.secciones.some((x) => x.titulo === 'Exámenes basales (según indicación)'));
  assert.ok(!r.pasos.some((p) => /Protocolo local/.test(p)));
});

test('toda sospecha y confirmado con alias produce respuesta', () => {
  const s = crearSesion(kb, inst);
  kb.motivos.forEach((m) => [...m.diferenciales, ...m.confirmados].forEach((d) => {
    if (!d.alias) return;
    const r = s.procesar('sospecha de ' + d.alias[0]).respuesta;
    assert.notStrictEqual(r.titulo, 'No entendí', d.alias[0]);
    assert.ok(r.hablar.length > 20);
  }));
});

test('las claves institucionales existen en la base', () => {
  const sca = require('./protocolos/sca.js');
  const ids = new Set([
    ...kb.motivos.flatMap((m) => [...m.diferenciales, ...m.confirmados]).map((d) => d.id),
    sca.id, ...sca.fases.map((f) => f.claveInstitucional),
  ]);
  [...Object.keys(inst.tips), ...Object.keys(inst.contactos)].forEach((k) => assert.ok(ids.has(k), k));
  const exs = new Set(kb.motivos.flatMap((m) => m.examenes.basales.map((e) => e.ex)));
  inst.enfermeriaPorProtocolo.forEach((e) => assert.ok(exs.has(e), e));
});

test('fiebre + confusión avisa que calza con dos motivos', () => {
  const r = crearSesion(kb, inst).procesar('box 4 mujer de 72 años con fiebre y confusión').respuesta;
  assert.match(r.hablar, /también calza con/);
  assert.ok(r.secciones.some((x) => x.titulo === 'También calza con'));
});

// ── Doble chequeo ─────────────────────────────────────────
const DC = require('./doble-chequeo.js');

test('lectura de números dictados', () => {
  assert.strictEqual(DC.leerNumero('25.000 unidades'), 25000);
  assert.strictEqual(DC.leerNumero('0,1 por kilo'), 0.1);
  assert.strictEqual(DC.leerNumero('cero coma uno'), 0.1);
  assert.strictEqual(DC.leerNumero('25 mil'), 25000);
  assert.strictEqual(DC.leerNumero('doce coma seis'), 12.6);
  assert.strictEqual(DC.leerNumero('listo'), null);
});

function dialogo(s, frases) {
  return frases.map((f) => s.procesar(f).respuesta);
}

test('heparina: flujo completo concordante con preparación institucional', () => {
  const s = crearSesion(kb, inst);
  const r = dialogo(s, [
    'Pepe, doble chequeo de heparina en BIC, box 3',
    'listo', 'listo',
    '70', // peso
    '18 unidades por kilo por hora', // 1260 UI/h
    'sí', // 25.000 en 500 → 50 UI/mL → 25,2 mL/h
    '25,2', '25.2', '25,2', 'listo',
  ]);
  assert.match(r[0].hablar, /Doble chequeo de heparina/);
  assert.match(r[4].hablar, /25\.000 unidades en 500 mL/);
  assert.match(r[7].hablar, /Coinciden los tres cálculos: 25,2/);
  const fin = r[9];
  assert.strictEqual(fin.esperando, null);
  assert.match(fin.registro, /1\.260 UI\/h/);
  assert.strictEqual(fin.hitos[0].min, 360);
  assert.ok(!s.enDialogo);
});

test('heparina: cálculos discordantes vuelven a pedir velocidades', () => {
  const s = crearSesion(kb, null);
  const r = dialogo(s, ['chequeo heparina bic', 'listo', 'listo', '70', '1000', 'si', '10', '100']);
  // base: 25.000 en 250 → 100 UI/mL → 10 mL/h; la enfermera dos dijo 100
  assert.match(r[7].hablar, /Alto, no coinciden/);
  assert.strictEqual(r[7].esperando, 'numero');
});

test('BIC mal programada se detecta', () => {
  const s = crearSesion(kb, null);
  const r = dialogo(s, ['chequeo heparina bic', 'listo', 'listo', '70', '1000', 'si', '10', '10', '100']);
  assert.match(r[8].hablar, /La BIC muestra 100 y debe ser 10/);
});

test('insulina: potasio bajo detiene si el médico no indicó iniciar', () => {
  const s = crearSesion(kb, inst);
  const r = dialogo(s, ['Pepe, vamos a instalar insulina en bomba', 'listo', 'listo', '3,1', 'no']);
  assert.match(r[3].hablar, /Potasio de 3,1/);
  assert.match(r[4].hablar, /Chequeo detenido/);
  assert.ok(!s.enDialogo);
});

test('insulina: dosis sobre rango pide confirmación médica', () => {
  const s = crearSesion(kb, null);
  const r = dialogo(s, ['chequeo insulina bic', 'listo', 'listo', 'no aplica', '60', '0,3 por kilo', 'si', 'si']);
  assert.match(r[5].hablar, /sobre el rango habitual/);
  assert.match(r[7].hablar, /cuántos mL por hora/);
});

test('cancelar sale del diálogo y la sesión vuelve a lo clínico', () => {
  const s = crearSesion(kb, inst);
  s.procesar('chequeo de insulina en bic');
  assert.ok(s.enDialogo);
  assert.match(s.procesar('cancelar').respuesta.hablar, /Chequeo detenido/);
  assert.strictEqual(s.procesar('sospecha de ACV').respuesta.clave, 'acv');
});

test('"detente" calla a Pepe, "avanza" retoma, y los recordatorios siguen activos', () => {
  const s = crearSesion(kb, inst);
  s.procesar('box 3 sospecha SCA'); // paso 1: ECG
  const p = s.procesar('Pepe, detente ahí').respuesta;
  assert.ok(p.pausa);
  assert.strictEqual(p.hablar, '');
  assert.strictEqual(p.paso, 1, 'la pausa no avanza');
  assert.match(s.procesar('avanza').respuesta.hablar, /^Banderas rojas/);
  s.procesar('espera');
  assert.match(s.procesar('continúa').respuesta.hablar, /^Protocolo local: En este hospital/);
  s.procesar('pausa');
  assert.match(s.procesar('dale').respuesta.hablar, /^Protocolo local: La troponina/);
});

test('"detente" durante un diálogo no lo cancela', () => {
  const s = crearSesion(kb, null);
  s.procesar('chequeo heparina bic');
  assert.ok(s.procesar('detente').respuesta.pausa);
  assert.ok(s.enDialogo);
  assert.match(s.procesar('listo').respuesta.hablar, /Verifiquen el frasco/);
});

test('las palabras de avance y pausa valen sin decir "Pepe"', () => {
  const { esNavegacion } = require('./motor.js');
  ['sigue', 'Continúa', 'dale', 'avanza', '¿Qué más?', 'Detente ahí', 'espera'].forEach((f) => assert.ok(esNavegacion(f), f));
  assert.ok(!esNavegacion('el paciente para de respirar'));
  assert.ok(!esNavegacion('para'), '"para" se eliminó por falsos positivos');
});
