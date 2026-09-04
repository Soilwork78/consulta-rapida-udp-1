#!/usr/bin/env node
/*
 * analisis.js — corre el escaner, el replay de la ultima semana y el OMB
 * sobre los snapshots de cripto/datos/.
 *
 *   node cripto/analisis.js
 */
'use strict';

var path = require('path');
var I = require(path.join(__dirname, 'indicadores.js'));

function cargar(nombre) {
  var d = require(path.join(__dirname, 'datos', nombre));
  // los snapshots vienen reciente -> antiguo; los indicadores necesitan
  // antiguo -> reciente
  return { meta: d, velas: d.velas.slice().reverse() };
}

function fmt(x, n) { return x == null ? '  -  ' : Number(x).toFixed(n == null ? 2 : n); }
function linea(t) { console.log('\n' + t + '\n' + '='.repeat(t.length)); }

/* ---------------------------------------------------------------- */
linea('1. UNIVERSO DE FUTUROS BTC EN CRYPTO.COM — LIQUIDEZ REAL');

var uni = require(path.join(__dirname, 'datos', 'universo-btc-futuros.json'));
var perp4h = cargar('BTCUSDPERP-4h.json');
var volPerp = perp4h.velas.reduce(function (a, v) { return a + v[5]; }, 0);

console.log('instrumento      vol 50x4h (BTC)   velas con trades   1 : X vs PERP');
uni.instrumentos.forEach(function (ins) {
  var vol = ins.volumenes_no_cero
    ? ins.volumenes_no_cero.reduce(function (a, b) { return a + b; }, 0)
    : volPerp;
  console.log(
    ins.nombre.padEnd(16) +
    fmt(vol, 4).padStart(12) + '   ' +
    (ins.velas_con_trades + '/50').padStart(14) + '   ' +
    (ins.volumenes_no_cero ? ('1 : ' + Math.round(volPerp / vol).toLocaleString('es-CL')) : '—').padStart(14)
  );
});

/* ---------------------------------------------------------------- */
linea('2. ESCANER ESTRICTO: RSI(14) < 30 Y VOLUMEN >= +200% (ratio 3x)');

[['4h', cargar('BTCUSDPERP-4h.json')],
 ['1D', cargar('BTCUSDPERP-1D.json')],
 ['1h', cargar('BTCUSDPERP-1h.json')]].forEach(function (par) {
  var tf = par[0], d = par[1];
  var r = I.escanear(d.velas, { rsiMax: 30, surgeMin: 3.0, volLookback: 20, volBase: 'mediana' });
  var desde = d.velas[0][0], hasta = d.velas[d.velas.length - 1][0];
  console.log('\n' + tf + '  (' + d.velas.length + ' velas: ' + desde + ' -> ' + hasta + ')');
  console.log('  señales que cumplen AMBAS condiciones: ' + r.senales.length);
  r.senales.forEach(function (s) {
    console.log('   ' + s.ts + '  RSI ' + fmt(s.rsi, 1) + '  surge x' + fmt(s.surge, 2));
  });
  console.log('  RSI minimo del periodo: ' + fmt(Math.min.apply(null, r.series.rsi.filter(function (x) { return x != null; })), 1));
  console.log('  surge maximo del periodo: x' + fmt(Math.max.apply(null, r.series.surge.filter(function (x) { return x != null; })), 2));
  console.log('  las 5 velas mas cerca de cumplir ambas:');
  I.casiSenales(d.velas, { rsiMax: 30, surgeMin: 3.0 }, 5).forEach(function (f) {
    console.log('   ' + f.ts + '  RSI ' + fmt(f.rsi, 1) + '  surge x' + fmt(f.surge, 2));
  });
});

/* ---------------------------------------------------------------- */
linea('3. REPLAY ULTIMA SEMANA (2026-08-28 -> 2026-09-04), 4h');

var d4 = cargar('BTCUSDPERP-4h.json');
var DESDE = '2026-08-28T00:00:00Z', HASTA = '2026-09-04T14:00:00Z';

var variantes = [
  { nombre: 'sistema tal cual (RSI<30, vol x3)', rsiMax: 30, surgeMin: 3.0 },
  { nombre: 'RSI<35, vol x3',                    rsiMax: 35, surgeMin: 3.0 },
  { nombre: 'RSI<40, vol x2.5',                  rsiMax: 40, surgeMin: 2.5 },
  { nombre: 'RSI<45, vol x2',                    rsiMax: 45, surgeMin: 2.0 },
  { nombre: 'solo volumen x3 (sin filtro RSI)',  rsiMax: 100, surgeMin: 3.0 }
];

variantes.forEach(function (v) {
  var r = I.replay(d4.velas, {
    rsiMax: v.rsiMax, surgeMin: v.surgeMin, volLookback: 20, volBase: 'mediana',
    stopATR: 0.5, rr: 2, maxVelas: 12, desde: DESDE, hasta: HASTA
  });
  console.log('\n-- ' + v.nombre + '  ->  ' + r.resumen.n + ' entrada(s)');
  r.operaciones.forEach(function (o) {
    console.log(
      '   señal ' + o.senal + '  RSI ' + fmt(o.rsi, 1) + '  vol x' + fmt(o.surge, 2) +
      '\n     entra ' + o.entradaTs + ' @ ' + fmt(o.entrada, 1) +
      '  stop ' + fmt(o.stop, 1) + '  obj ' + fmt(o.objetivo, 1) +
      '\n     sale  ' + o.salidaTs + ' @ ' + fmt(o.salida, 1) +
      '  (' + o.motivo + ')  ' + fmt(o.R, 2) + 'R  ' + fmt(o.pct, 2) + '%'
    );
  });
  if (r.resumen.n) {
    console.log('   resumen: ' + r.resumen.ganadoras + '/' + r.resumen.n +
      ' ganadoras, suma ' + fmt(r.resumen.sumaR, 2) + 'R, esperanza ' +
      fmt(r.resumen.esperanzaR, 2) + 'R por operacion');
  }
});

/* ---------------------------------------------------------------- */
linea('4. OSCILADOR MOMENTUM-BALLENAS (OMB) — modo velas (proxy)');
console.log('ADVERTENCIA: sin cinta de trades historica, "flujo" es un PROXY de');
console.log('concentracion de volumen firmado, no actividad de ballenas real.\n');

var omb = I.osciladorMomentumBallenas(d4.velas, { modo: 'velas', ventana: 30, umbral: 30 });
console.log('ts                     flujo  tendencia    OMB   diverg.');
d4.velas.forEach(function (v, i) {
  if (omb.series.flujo[i] == null) return;
  if (v[0] < DESDE) return;
  console.log(v[0] + '  ' + fmt(omb.series.flujo[i], 1).padStart(7) +
    fmt(omb.series.tendencia[i], 1).padStart(11) +
    fmt(omb.series.omb[i], 1).padStart(8) +
    fmt(omb.series.divergencia[i], 1).padStart(10));
});
console.log('\nseñales del OMB en la semana:');
var hubo = false;
omb.senales.forEach(function (s) {
  if (s.ts < DESDE) return;
  hubo = true;
  console.log('  ' + s.ts + '  ' + s.tipo.padEnd(20) +
    ' flujo ' + fmt(s.flujo, 1) + '  tend ' + fmt(s.tendencia, 1) +
    '  div ' + fmt(s.divergencia, 1));
});
if (!hubo) console.log('  (ninguna)');
