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
  assert.match(r1.hablar, /^Box 3, hombre de 58 años\. Sospecha de SCA\. ECG de 12 derivaciones, meta 10 minutos/);
  assert.match(r1.hablar, /Cuando quieras, dime sigue\.$/);
  assert.strictEqual(r1.clave, 'sca:primer-contacto');
  assert.strictEqual(r1.hitos[0].min, 5);

  assert.match(s.procesar('por qué').respuesta.hablar, /se diagnostica con el ECG/);
  const banderas = s.procesar('sigue').respuesta;
  assert.match(banderas.hablar, /^Banderas rojas/, 'banderas rojas en segundo lugar');
  assert.match(s.procesar('repite').respuesta.hablar, /^Banderas rojas/);
  assert.match(s.procesar('qué más').respuesta.hablar, /^Monitor continuo/);
  assert.match(s.procesar('sigue').respuesta.hablar, /^Protocolo local: En este hospital no hay hemodinamia/);
  assert.match(s.procesar('anterior').respuesta.hablar, /^Monitor continuo/);

  let r;
  for (let k = 0; k < 30; k++) r = s.procesar('sigue').respuesta;
  assert.match(r.hablar, /^Eso es todo para el box 3\. Te aviso al minuto 5\.$/);
  const pasos = r1.pasos;
  assert.match(pasos[pasos.length - 2], /^Descartar: Disección aórtica/);
  assert.match(pasos[pasos.length - 1], /Código IAM: anexo 1111/);

  const r3 = s.procesar('Pepe, el ECG muestra supradesnivel').respuesta;
  assert.strictEqual(r3.clave, 'sca:iamcest');
  assert.match(r3.hablar, /^Box 3, hombre de 58 años\. IAM con supradesnivel\. Corre el reloj de reperfusión\. Código IAM; hora del diagnóstico/);
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
  assert.match(s.procesar('continúa').respuesta.hablar, /^Monitor continuo/);
  s.procesar('pausa');
  assert.match(s.procesar('dale').respuesta.hablar, /^Protocolo local: En este hospital/);
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

test('herramienta de turno: el primer contacto solo dice lo esencial', () => {
  const r = crearSesion(kb, null).procesar('sospecha SCA').respuesta;
  assert.ok(r.pasos.length <= 9, 'sin protocolo local: ' + r.pasos.length + ' pasos');
  assert.ok(!r.pasos.some((p) => /Reposo absoluto|Registra tres horas/.test(p)), 'lo no esencial queda solo en la tarjeta');
  assert.ok(r.secciones.some((x) => x.titulo === 'También'));
});

test('profesionales: las señales habladas son breves', () => {
  const sca = require('./protocolos/sca.js');
  sca.fases.forEach((f) => f.pasos.forEach((p) =>
    assert.ok(p.voz.split(' ').length <= 20, f.id + ': "' + p.voz + '" tiene ' + p.voz.split(' ').length + ' palabras')));
});

// ── Registro y evolución ──────────────────────────────────
const RG = require('./registro.js');

test('interpretación de lo dictado', () => {
  const t = (f) => (RG.interpretar(f) || {}).tipo || null;
  assert.strictEqual(t('Pepe, refiere dolor opresivo desde las 8:30'), 'proxima');
  assert.strictEqual(t('anamnesis próxima: dolor de 2 horas'), 'proxima');
  assert.strictEqual(t('Pepe, antecedentes: hipertenso'), 'remota');
  assert.strictEqual(t('alergias: niega'), 'alergias');
  assert.strictEqual(t('sin alergias'), 'alergias');
  assert.strictEqual(t('fármacos: losartán'), 'farmacos');
  assert.strictEqual(t('presión 158 sobre 94, FC 102'), 'signos');
  assert.strictEqual(t('saturación 95'), 'signos');
  assert.strictEqual(t('Pepe, ECG tomado'), 'procedimiento');
  assert.strictEqual(t('box 3, se administró aspirina 300'), 'procedimiento');
  assert.strictEqual(t('anota: familia informada'), 'nota');
  assert.strictEqual(t('Pepe, redacta la evolución'), 'evolucion');
  assert.strictEqual(t('examen físico: diaforético, sin crepitaciones'), 'objetivo');
  assert.strictEqual(t('análisis: IAM con supradesnivel en ventana de reperfusión'), 'analisis');
  assert.strictEqual(t('plan: ECG de control a los 90 minutos'), 'plan');
  assert.strictEqual(t('evaluación: dolor disminuye'), 'evaluacion');
  // No debe capturar órdenes clínicas ni de navegación
  ['sigue', 'listo', 'Pepe, el ECG muestra supradesnivel', 'va a fibrinólisis', 'sospecha SCA',
    'Pepe, ingresa box 3, hombre de 58 años con dolor torácico', 'checklist de fibrinólisis',
    'doble chequeo de heparina en BIC'].forEach((f) => assert.strictEqual(t(f), null, f));
});

test('signos vitales dictados, con read-back', () => {
  const sv = RG.leerSignos('presión 158 sobre 94, FC 102, FR 22, saturación 95, temperatura 36,4, EVA 8');
  assert.deepStrictEqual(sv, { pa: '158/94 mmHg', fc: '102 lpm', fr: '22 rpm', sat: '95%', t: '36,4 °C', eva: '8/10' });
});

test('caso SCA completo: la evolución solo contiene lo dictado, con horas y tiempos GES', () => {
  let t = Date.parse('2026-09-30T14:00:00');
  const reloj = () => t;
  const s = crearSesion(kb, inst, { ahora: reloj });
  const di = (f, min) => { t += (min || 0) * 60000; return s.procesar(f).respuesta; };
  di('Pepe, ingresa box 3, hombre de 58 años con dolor torácico, el médico sospecha SCA');
  di('refiere dolor opresivo desde las 12:30, irradiado a brazo izquierdo, con sudoración, EVA 8', 1);
  assert.strictEqual(di('ECG tomado', 3).hablar, 'Anotado, 14:04.');
  di('antecedentes: hipertenso, diabético tipo 2, fumador', 1);
  di('fármacos: losartán y metformina, niega anticoagulantes');
  assert.match(di('signos vitales: presión 158 sobre 94, FC 102, FR 22, saturación 95').hablar,
    /^Anotado: PA 158\/94 mmHg, FC 102 lpm, FR 22 rpm, SatO2 95%\.$/);
  di('Pepe, el ECG muestra supradesnivel', 2);
  di('aspirina 300 masticada administrada', 2);
  di('tenecteplasa administrada', 20);
  const falta = di('Pepe, redacta la evolución', 5);
  assert.match(falta.hablar, /Falta registrar: alergias, análisis, plan, evaluación\.$/);
  const ev = falta.evolucion;
  assert.match(ev, /Box 3/);
  assert.match(ev, /Hombre, 58 años\. Ingreso 14:00\./);
  assert.match(ev, /14:00 Sospecha médica de síndrome coronario agudo\./);
  assert.match(ev, /14:07 ECG con supradesnivel ST/);
  assert.match(ev, /Anamnesis próxima: Refiere dolor opresivo desde las 12:30/);
  assert.match(ev, /Alergias: \[falta registrar\]/);
  assert.match(ev, /- 14:04 ECG tomado\./);
  assert.match(ev, /Inicio del dolor: 12:30 \(según anamnesis\)\./);
  assert.match(ev, /- Inicio del dolor → llegada: 90 min\./);
  assert.match(ev, /- Sospecha → ECG: 4 min \(GES ≤ 30\) ✓\./);
  assert.match(ev, /- Confirmación diagnóstica → trombólisis: 22 min \(GES ≤ 30\) ✓\./);
  assert.match(ev, /- Puerta-aguja: 29 min\./, 'sin meta GES: informativo');
  assert.match(ev, /Revisar, completar y firmar/);
  assert.ok(!/sin alergias|niega alergias/i.test(ev), 'no inventa lo que no se dictó');
  assert.ok(falta.registroBox.length > 5);
});

test('el doble chequeo queda en la evolución como procedimiento', () => {
  const s = crearSesion(kb, inst);
  s.procesar('ingresa box 5, SCA sin supradesnivel');
  ['doble chequeo de heparina en BIC, box 5', 'listo', 'listo', '70', '18 por kilo', 'sí', '25,2', '25,2', '25,2', 'listo']
    .forEach((f) => s.procesar(f));
  const ev = s.procesar('box 5 redacta la evolución').respuesta.evolucion;
  assert.match(ev, /Heparina sódica en BIC · 1\.260 UI\/h .* verificado por dos enfermeras\./);
  assert.match(ev, /SCA sin supradesnivel ST/);
});

test('evolución en formato SOAPIE, sin diagnósticos de enfermería', () => {
  let t = Date.parse('2026-09-30T14:00:00');
  const s = crearSesion(kb, inst, { ahora: () => t });
  const di = (f, min) => { t += (min || 0) * 60000; return s.procesar(f).respuesta; };
  di('Pepe, ingresa box 3, hombre de 58 años, sospecha SCA');
  di('refiere dolor opresivo desde las 12:30, EVA 8', 1);
  di('examen físico: diaforético, sin crepitaciones');
  di('análisis: IAM con supradesnivel en ventana de reperfusión');
  di('plan: ECG de control a los 90 minutos y preparar traslado');
  di('nitroglicerina sublingual administrada', 5);
  di('EVA 3', 15);
  di('evaluación: sin arritmias');
  const ev = di('redacta la evolución').evolucion;
  const orden = ['\nS:', '\nO:', '\nA:', '\nP:', '\nI:', '\nE:'].map((x) => ev.indexOf(x));
  assert.ok(orden.every((x, k) => x > 0 && (k === 0 || x > orden[k - 1])), 'secciones S, O, A, P, I, E en orden');
  assert.match(ev, /O:\n[\s\S]*Diaforético, sin crepitaciones\./);
  assert.match(ev, /Contexto clínico:\n- 14:00 Sospecha médica de síndrome coronario agudo\.\n\nS:/);
  assert.match(ev, /A:\nIAM con supradesnivel en ventana de reperfusión\.\n\nP:/, 'A solo con análisis de enfermería');
  assert.match(ev, /S:\n[\s\S]*Dolor \(EVA\): 8\/10 \(14:01\), 3\/10 \(14:21\)\.\n\nO:/, 'EVA en S');
  assert.ok(!/O:[\s\S]*Signos vitales[^\n]*EVA[\s\S]*A:/.test(ev), 'EVA fuera de O');
  assert.match(ev, /P:\nECG de control a los 90 minutos y preparar traslado\./);
  assert.match(ev, /I:\n- 14:06 Nitroglicerina sublingual administrada\./);
  assert.match(ev, /E:\nSin arritmias\.\nEVA 8\/10 \(14:01\) → 3\/10 \(14:21\)\./);
  assert.ok(!/diagn[oó]stico de enfermer|NANDA/i.test(ev));
});

// ── Registro automático de horas ─────────────────────────
test('hora de inicio del dolor desde la anamnesis', () => {
  const base = Date.parse('2026-09-30T14:00:00');
  const h = (f) => new Date(RG.leerInicio(f, base)).toTimeString().slice(0, 5);
  assert.strictEqual(h('refiere dolor desde las 12:30'), '12:30');
  assert.strictEqual(h('dolor que comenzó a las 9'), '09:00');
  assert.strictEqual(h('hace 2 horas'), '12:00');
  assert.strictEqual(h('hace media hora'), '13:30');
  assert.strictEqual(new Date(RG.leerInicio('desde las 22', base)).getDate(), 29, 'una hora posterior al ingreso es de ayer');
  assert.strictEqual(RG.leerInicio('dolor opresivo', base), null);
});

test('recordatorio que registra: "¿ECG ya tomado?" → "sí" anota la hora', () => {
  let t = Date.parse('2026-09-30T14:00:00');
  const s = crearSesion(kb, inst, { ahora: () => t });
  const hitos = s.procesar('ingresa box 3, sospecha SCA').respuesta.hitos;
  t += 5 * 60000;
  assert.deepStrictEqual(s.hitoDisparado('3', hitos[0]), { omitir: false });
  const r = s.procesar('sí').respuesta;
  assert.strictEqual(r.hablar, 'Anotado, 14:05.');
  const pe = r.tiempos.find((x) => x.nombre === 'Sospecha → ECG');
  assert.deepStrictEqual([pe.min, pe.aprox, pe.ok, pe.meta], [5, true, true, 30]);
  assert.match(s.procesar('tiempos').respuesta.hablar, /^Sospecha a ECG, hasta 5 minutos, dentro del GES\.$/);
  assert.match(s.procesar('redacta la evolución').respuesta.evolucion, /- 14:05 ECG de 12 derivaciones tomado \(confirmado al recordatorio\)\.[\s\S]*Sospecha → ECG: ≤ 5 min \(GES ≤ 30\) ✓/);
});

test('Pepe no pregunta lo que ya está registrado', () => {
  let t = Date.parse('2026-09-30T14:00:00');
  const s = crearSesion(kb, inst, { ahora: () => t });
  const hitos = s.procesar('ingresa box 3, sospecha SCA').respuesta.hitos;
  t += 3 * 60000;
  s.procesar('ECG tomado');
  t += 2 * 60000;
  assert.deepStrictEqual(s.hitoDisparado('3', hitos[0]), { omitir: true });
  assert.deepStrictEqual(s.hitoDisparado('3', hitos[1]), { omitir: false }, 'sin "registra", se dice igual');
});

test('"no" deja pendiente; si la enfermera dice otra cosa, la pregunta se descarta', () => {
  let t = Date.parse('2026-09-30T14:00:00');
  const s = crearSesion(kb, inst, { ahora: () => t });
  const hitos = s.procesar('ingresa box 3, sospecha SCA').respuesta.hitos;
  s.hitoDisparado('3', hitos[0]);
  assert.strictEqual(s.procesar('todavía no').respuesta.hablar, 'Queda pendiente.');
  s.hitoDisparado('3', hitos[0]);
  assert.match(s.procesar('sigue').respuesta.hablar, /^Banderas rojas/);
  assert.notStrictEqual(s.procesar('sí').respuesta.hablar, 'Anotado, 14:00.', 'la pregunta ya se descartó');
});

test('ECG de control no cuenta para puerta-ECG', () => {
  let t = Date.parse('2026-09-30T14:00:00');
  const s = crearSesion(kb, inst, { ahora: () => t });
  s.procesar('ingresa box 3, sospecha SCA');
  t += 90 * 60000;
  const r = s.procesar('ECG de control tomado').respuesta;
  assert.ok(!r.tiempos.some((x) => x.nombre === 'Sospecha → ECG'));
});

test('metas GES: 30 min sospecha → ECG y 30 min confirmación → trombólisis; se cuentan desde el hito correcto', () => {
  let t = Date.parse('2026-09-30T14:00:00');
  const s = crearSesion(kb, inst, { ahora: () => t });
  s.procesar('ingresa box 3, hombre de 70 años, dolor abdominal');   // ingreso 14:00, sin sospecha de SCA aún
  t += 20 * 60000; s.procesar('el médico sospecha SCA');             // sospecha 14:20
  t += 25 * 60000; s.procesar('ECG tomado');                         // 14:45 → 25 min desde la sospecha
  t += 5 * 60000; s.procesar('el ECG muestra supradesnivel');        // diagnóstico 14:50
  t += 35 * 60000;
  const r = s.procesar('tenecteplasa administrada').respuesta;      // 15:25 → 35 min
  const x = Object.fromEntries(r.tiempos.map((k) => [k.nombre, k]));
  assert.deepStrictEqual([x['Sospecha → ECG'].min, x['Sospecha → ECG'].ok], [25, true]);
  assert.deepStrictEqual([x['Confirmación diagnóstica → trombólisis'].min, x['Confirmación diagnóstica → trombólisis'].ok], [35, false]);
  assert.strictEqual(x['Puerta-aguja'].meta, null);
  assert.match(s.procesar('tiempos').respuesta.hablar, /Confirmación diagnóstica a trombólisis, 35 minutos, fuera del GES\./);
});

test('decisión: 10 minutos en la voz (meta clínica) y 30 en el registro (garantía GES)', () => {
  let t = Date.parse('2026-09-30T14:00:00');
  const s = crearSesion(kb, inst, { ahora: () => t });
  const r = s.procesar('ingresa box 3, sospecha SCA').respuesta;
  assert.match(r.hablar, /meta 10 minutos/);
  t += 25 * 60000;
  const ecg = s.procesar('ECG tomado').respuesta.tiempos.find((x) => x.nombre === 'Sospecha → ECG');
  assert.deepStrictEqual([ecg.meta, ecg.ok], [30, true]);
});
