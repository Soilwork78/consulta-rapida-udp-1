// Genera REVISION.md a partir de kb.js para revisión clínica.
// Uso: node pepe-grillo/generar-revision.js
const fs = require('fs');
const path = require('path');
const kb = require('./kb.js');

const L = [];
const lista = (items) => items.forEach((t) => L.push(`- ${t}`));
const hitos = (hs) => hs.forEach((h) => L.push(`- ⏱ **min ${h.min}:** ${h.texto}`));
const TUBO = {
  hemocultivo: 'Frascos HC', celeste: '🔵 Celeste', suero: '🔴 Roja/amarilla', verde: '🟢 Verde',
  lila: '🟣 Lila', gris: '⚪ Gris', gases: 'Jeringa gases', orina: 'Frasco estéril', otro: '—',
};
const tablaEx = (exs, col) => {
  L.push(`| Examen | Muestra | ${col === 'ind' ? 'Cuándo / para qué' : 'Detalle'} |`, '|---|---|---|');
  exs.forEach((e) => L.push(`| **${e.ex}** | ${TUBO[e.tubo]} | ${e[col] || ''} |`));
};

L.push('# Pepe Grillo — Base de conocimiento (revisión clínica)', '');
L.push(`> **${kb.meta.estado}** · v${kb.meta.version} · ${kb.meta.fecha}`);
L.push('> Generado desde `kb.js`. No editar a mano: editar `kb.js` y regenerar.', '');
L.push(`**Alcance:** ${kb.meta.alcance}`, '');
L.push(`**Criterio de selección:** ${kb.meta.criterioSeleccion}`, '');
L.push('**Capas:** 0 General → 1 Motivo de consulta → 2 Diferenciales → 3 Diagnóstico confirmado', '');

L.push('## Capa 0 — General (todo paciente)', '');
lista(kb.general.pasos);
L.push('', `**Comunicación (${kb.general.comunicacion.formato}):** ${kb.general.comunicacion.plantilla}`, '');
L.push(`_${kb.general.comunicacion.nota}_`, '');
hitos(kb.general.hitos);
L.push('', '### Muestras', '', '> ⚠️ Colores de tubo según nomenclatura habitual: **verificar con el laboratorio local**.', '');
Object.values(kb.general.tubos).forEach((t) => L.push(`- ${t}`));
L.push('', `**${kb.general.ordenExtraccion}**`, '');

kb.motivos.forEach((m, i) => {
  L.push(`## ${i + 1}. ${m.nombre}`, '');
  L.push(`**Se activa con:** ${m.activadores.join(', ')}`, '');
  L.push('### Capa 1 — Acciones inmediatas', '');
  lista(m.acciones);
  L.push('', '### 🧪 Exámenes basales (al ingreso)', '');
  tablaEx(m.examenes.basales, 'det');
  L.push('', '### 🧪 Exámenes según evaluación', '');
  tablaEx(m.examenes.segunEvaluacion, 'ind');
  L.push('', '### 🚩 Banderas rojas', '');
  lista(m.banderasRojas);
  L.push('', '### Capa 2 — Diferenciales', '');
  L.push('| Diagnóstico | No perder | Hallazgos discriminantes |', '|---|:-:|---|');
  m.diferenciales.forEach((d) =>
    L.push(`| ${d.dx} | ${d.noPerder ? '🔴' : ''} | ${d.discriminantes.join('; ')} |`));
  L.push('', '### 🗣 Tips por sospecha (en orden: Pepe dice uno por vez cuando la enfermera dice "sigue"; 🔊 = el que dice al ingreso)', '');
  const vistos = new Set();
  m.diferenciales.forEach((d) => {
    if (!d.id || !kb.tips[d.id] || vistos.has(d.id)) return;
    vistos.add(d.id);
    L.push(`**${d.dx}** — se activa con: _${d.alias.join(', ')}_`, '');
    kb.tips[d.id].forEach((t, j) => L.push(`${j + 1}. ${t}${j === 0 ? ' 🔊' : ''}`));
    L.push('');
  });
  L.push('### Hitos de la capa 1', '');
  hitos(m.hitos);
  m.confirmados.forEach((c) => {
    L.push('', `### Capa 3 — ${c.nombre}`, '');
    c.algoritmo.forEach((p, j) => L.push(`${j + 1}. ${p}`));
    if (c.examenes) { L.push('', '**Exámenes específicos:**', ''); tablaEx(c.examenes, 'det'); }
    L.push('');
    hitos(c.hitos);
  });
  L.push('', '**Fuentes:**', '');
  lista(m.fuentes);
  L.push('', '---', '');
});

L.push('## Doble chequeo de medicamentos de alto riesgo en BIC', '');
L.push('Pepe guía y calcula, pero no reemplaza a la segunda enfermera: cada una calcula por separado y Pepe compara los tres resultados.', '');
L.push('Pasos: paciente y orden → fármaco y presentación → (potasio, solo insulina) → peso → dosis (Pepe la repite en UI/h) → preparación → velocidad de enfermera 1 → velocidad de enfermera 2 → lectura de la BIC → trazado de la línea → registro.', '');
Object.values(kb.altoRiesgo).forEach((m) => {
  L.push(`### ${m.nombre}`, '');
  L.push(`- Preparación estándar (base): ${m.preparacionEstandar.ui.toLocaleString('es-CL')} UI en ${m.preparacionEstandar.ml} mL`);
  L.push(`- Límite blando: > ${m.rango.porKiloMax} UI/kg/h o > ${m.rango.porHoraMax} UI/h → confirmar con el médico`);
  if (m.potasioMinimo != null) L.push(`- Potasio < ${m.potasioMinimo} mEq/L → no iniciar sin indicación médica`);
  L.push(`- Verificación: ${m.verificacion}`);
  m.controles.forEach((c) => L.push(`- ⏱ **min ${c.min}:** ${c.texto}`));
  L.push('', '**Fuentes:**', '');
  lista(m.fuentes);
  L.push('');
});

fs.writeFileSync(path.join(__dirname, 'REVISION.md'), L.join('\n'));
console.log('REVISION.md generado');

// ── Documento del protocolo SCA ─────────────────────────────
const sca = require('./protocolos/sca.js');
const S = [];
S.push(`# Pepe Grillo — Protocolo de enfermería: ${sca.nombre}`, '');
S.push(`> **${sca.estado}** · v${sca.version}`, '> Generado desde `protocolos/sca.js`. No editar a mano.', '');
S.push('Pepe dice un paso a la vez. La enfermera avanza con **"sigue"** o **"qué más"**, pide el fundamento con **"por qué"**, y cambia de fase informando lo que pasa ("el ECG muestra supradesnivel", "va a fibrinólisis", "sin supradesnivel", "traslado a hemodinamia").', '');
S.push('```', 'primer contacto → IAMCEST → fibrinólisis → traslado', '               ↘ SCASEST ↗', '```', '');
sca.fases.forEach((f, n) => {
  S.push(`## ${n + 1}. ${f.nombre}`, '');
  S.push(`**Se activa con:** _${f.activadores.join(', ')}_`, '');
  f.pasos.forEach((p, j) => {
    S.push(`${j + 1}. **${p.voz}**${j === 0 ? ' 🔊' : ''}${p.hablado === false ? ' _(solo en la tarjeta, Pepe no lo dice)_' : ''}`);
    if (p.detalle) S.push(`   - _Detalle:_ ${p.detalle}`);
    S.push(`   - _Por qué:_ ${p.porque}`);
  });
  S.push('', '**Recordatorios:**', '');
  f.hitos.forEach((h) => S.push(`- ⏱ min ${h.min}: ${h.texto}`));
  S.push('');
});
S.push('## Checklist de contraindicaciones de fibrinólisis', '');
S.push('Pepe las pregunta una a una ("Pepe, checklist de fibrinólisis"). Un "sí" a una absoluta detiene el checklist; "no sé" queda como pendiente.', '');
S.push('**Absolutas**', '');
sca.contraindicaciones.absolutas.forEach((q) => S.push(`- ${q}`));
S.push('', '**Relativas**', '');
sca.contraindicaciones.relativas.forEach((q) => S.push(`- ${q}`));
S.push('', '## Proceso de enfermería', '', '_Etiquetas NANDA-I: verificar con la edición vigente._', '');
S.push('| Diagnóstico | Intervenciones | Resultado esperado |', '|---|---|---|');
sca.procesoEnfermeria.forEach((d) => S.push(`| ${d.dx} | ${d.intervenciones.join('; ')} | ${d.resultado} |`));
S.push('', '## Fuentes', '');
sca.fuentes.forEach((f) => S.push(`- ${f}`));
fs.writeFileSync(path.join(__dirname, 'REVISION-SCA.md'), S.join('\n'));
console.log('REVISION-SCA.md generado');
