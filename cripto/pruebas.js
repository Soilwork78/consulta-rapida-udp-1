#!/usr/bin/env node
/* pruebas.js — verificaciones minimas de indicadores.js.  node cripto/pruebas.js */
'use strict';
var I = require(require('path').join(__dirname, 'indicadores.js'));

var fallos = 0, total = 0;
function ok(nombre, cond, detalle) {
  total++;
  if (cond) { console.log('  OK   ' + nombre); }
  else { fallos++; console.log('  FALLA ' + nombre + (detalle ? '  -> ' + detalle : '')); }
}
function cerca(a, b, tol) { return Math.abs(a - b) <= (tol == null ? 1e-9 : tol); }

console.log('\nRSI');
var sube = []; for (var i = 0; i < 40; i++) sube.push(100 + i);
var r1 = I.rsiWilder(sube, 14);
ok('serie estrictamente alcista -> RSI 100', cerca(r1[39], 100, 1e-9));
var baja = []; for (var j = 0; j < 40; j++) baja.push(100 - j);
ok('serie estrictamente bajista -> RSI 0', cerca(I.rsiWilder(baja, 14)[39], 0, 1e-9));
ok('null antes de tener period velas', r1[13] === null && r1[14] !== null);
// caso canonico de Wilder: alterna +1/-1 -> RSI tiende a 50
var alt = [100]; for (var k = 1; k < 60; k++) alt.push(alt[k - 1] + (k % 2 ? 1 : -1));
ok('serie alternante -> RSI ~50', Math.abs(I.rsiWilder(alt, 14)[59] - 50) < 5);

console.log('\nSurge de volumen');
var vols = []; for (var m = 0; m < 20; m++) vols.push(100);
vols.push(300);
var s = I.surgeVolumen(vols, { lookback: 20, base: 'mediana' });
ok('300 sobre base 100 -> x3 (=+200%)', cerca(s[20], 3));
ok('null mientras no hay lookback completo', s[19] === null);

console.log('\nPercentil');
ok('p50 de 1..5 = 3', cerca(I.percentil([1, 2, 3, 4, 5], 0.5), 3));
ok('p90 de 1..11 = 10', cerca(I.percentil([1,2,3,4,5,6,7,8,9,10,11], 0.9), 10));

console.log('\nSin look-ahead');
var velas = [];
for (var n = 0; n < 60; n++) {
  var base = 100 + Math.sin(n / 3) * 5;
  velas.push(['2026-01-' + String(n + 1).padStart(2, '0') + 'T00:00:00Z',
    base, base + 2, base - 2, base + Math.cos(n / 4), 100 + (n % 7) * 50]);
}
var completo = I.escanear(velas, { rsiMax: 45, surgeMin: 1.5 });
var prefijo = I.escanear(velas.slice(0, 40), { rsiMax: 45, surgeMin: 1.5 });
var mismos = prefijo.senales.every(function (p) {
  return completo.senales.some(function (c) { return c.ts === p.ts && cerca(c.rsi, p.rsi, 1e-9); });
});
ok('las señales del prefijo son identicas en la serie completa', mismos);

console.log('\nReplay');
var rep = I.replay(velas, { rsiMax: 45, surgeMin: 1.5, rr: 2, maxVelas: 5 });
var coherente = rep.operaciones.every(function (o) {
  var idx = velas.findIndex(function (v) { return v[0] === o.senal; });
  return velas[idx + 1] && cerca(o.entrada, velas[idx + 1][1]) && o.stop < o.entrada && o.objetivo > o.entrada;
});
ok('entra en la apertura de la vela siguiente a la señal', coherente);
ok('R de una operacion a objetivo es +2', rep.operaciones
  .filter(function (o) { return o.motivo === 'objetivo'; })
  .every(function (o) { return cerca(o.R, 2, 1e-9); }));

console.log('\nOMB');
var omb = I.osciladorMomentumBallenas(velas, { modo: 'velas' });
ok('flujo y tendencia acotados en [-100,100]', omb.series.flujo.concat(omb.series.tendencia)
  .every(function (x) { return x == null || (x >= -100.0001 && x <= 100.0001); }));
var tape = [];
for (var q = 0; q < 400; q++) {
  tape.push({ ts: new Date(Date.UTC(2026, 0, 1, Math.floor(q / 100)) ).toISOString(),
    price: 100, qty: q % 50 === 0 ? 10 : 0.01, side: q % 100 < 50 ? 'buy' : 'sell' });
}
var f = I.flujoDesdeTape(tape, { bucketMs: 3600 * 1000, pct: 0.9 });
ok('modo tape produce buckets con trades grandes', f.length > 0 && f.every(function (b) { return b.trades > 0; }));

console.log('\n' + (total - fallos) + '/' + total + ' pruebas OK');
process.exit(fallos ? 1 : 0);
