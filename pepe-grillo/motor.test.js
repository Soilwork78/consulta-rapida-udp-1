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

test('sesión completa: ingreso, más, confirmado, descartado', () => {
  const s = crearSesion(kb, inst);
  const r1 = s.procesar('Pepe, ingresa box 3, hombre de 58 años, dolor torácico, sospecha SCA').respuesta;
  assert.match(r1.hablar, /Protocolo local: En este hospital no hay hemodinamia/);
  assert.match(r1.hablar, /ECG de 12 derivaciones antes de 10 minutos/);
  assert.ok(!/Desfibrilador/.test(r1.hablar), 'solo 3 tips hablados');
  assert.strictEqual(r1.hitos[0].min, 5);
  const porProtocolo = r1.secciones.find((x) => x.titulo === 'Exámenes: tomar por protocolo').items;
  assert.ok(porProtocolo.includes('Troponina ultrasensible'));
  assert.ok(!porProtocolo.includes('Rx de tórax'));

  const r2 = s.procesar('Pepe, más').respuesta;
  assert.match(r2.hablar, /Desfibrilador/);
  assert.match(r2.hablar, /No olvides descartar: Disección aórtica/);

  const r3 = s.procesar('Pepe, confirmado IAMCEST').respuesta;
  assert.match(r3.titulo, /Box 3, hombre de 58 años · Confirmado: IAM con supradesnivel/);
  assert.match(r3.hablar, /Fibrinolítico en el carro/);

  const r4 = s.procesar('Pepe, box 3 descartado SCA').respuesta;
  assert.ok(r4.detenerHitos);
  assert.match(r4.hablar, /Disección aórtica/);
});

test('sin institución: exámenes quedan "según indicación"', () => {
  const r = crearSesion(kb, null).procesar('sospecha de ACV').respuesta;
  assert.ok(r.secciones.some((x) => x.titulo === 'Exámenes basales (según indicación)'));
  assert.ok(!/Protocolo local/.test(r.hablar));
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
  const ids = new Set(kb.motivos.flatMap((m) => [...m.diferenciales, ...m.confirmados]).map((d) => d.id));
  [...Object.keys(inst.tips), ...Object.keys(inst.contactos)].forEach((k) => assert.ok(ids.has(k), k));
  const exs = new Set(kb.motivos.flatMap((m) => m.examenes.basales.map((e) => e.ex)));
  inst.enfermeriaPorProtocolo.forEach((e) => assert.ok(exs.has(e), e));
});

test('fiebre + confusión avisa que calza con dos motivos', () => {
  const r = crearSesion(kb, inst).procesar('box 4 mujer de 72 años con fiebre y confusión').respuesta;
  assert.match(r.hablar, /también calza con/);
  assert.ok(r.secciones.some((x) => x.titulo === 'También calza con'));
});
