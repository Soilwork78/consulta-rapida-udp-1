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
  L.push('', '### 🗣 Tips por sospecha (lo que Pepe dice al oído; los 3 primeros en voz)', '');
  const vistos = new Set();
  m.diferenciales.forEach((d) => {
    if (!d.id || !kb.tips[d.id] || vistos.has(d.id)) return;
    vistos.add(d.id);
    L.push(`**${d.dx}** — se activa con: _${d.alias.join(', ')}_`, '');
    kb.tips[d.id].forEach((t, j) => L.push(`${j + 1}. ${t}${j < 3 ? ' 🔊' : ''}`));
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

fs.writeFileSync(path.join(__dirname, 'REVISION.md'), L.join('\n'));
console.log('REVISION.md generado');
