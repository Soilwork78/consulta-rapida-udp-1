/*
 * indicadores.js — RSI de Wilder, surge de volumen, escaner, replay y
 * Oscilador Momentum-Ballenas (OMB).
 *
 * Sin dependencias. Funciona en Node (require) y en el navegador (<script>).
 *
 * Convencion de datos: una "vela" es un array
 *   [timestampISO, open, high, low, close, volume]
 * ordenado de MAS ANTIGUA a MAS RECIENTE. Las funciones devuelven series
 * alineadas indice a indice con `velas`, usando null donde no hay dato
 * suficiente. Ningun calculo mira hacia adelante (sin look-ahead).
 */

'use strict';

var TS = 0, O = 1, H = 2, L = 3, C = 4, V = 5;

/* ------------------------------------------------------------------ *
 * Utilidades basicas
 * ------------------------------------------------------------------ */

function media(xs) {
  if (!xs.length) return null;
  var s = 0;
  for (var i = 0; i < xs.length; i++) s += xs[i];
  return s / xs.length;
}

function mediana(xs) {
  if (!xs.length) return null;
  var y = xs.slice().sort(function (a, b) { return a - b; });
  var m = Math.floor(y.length / 2);
  return y.length % 2 ? y[m] : (y[m - 1] + y[m]) / 2;
}

function desviacion(xs) {
  if (xs.length < 2) return null;
  var m = media(xs), s = 0;
  for (var i = 0; i < xs.length; i++) s += (xs[i] - m) * (xs[i] - m);
  return Math.sqrt(s / (xs.length - 1));
}

/** Percentil por interpolacion lineal. p en [0,1]. */
function percentil(xs, p) {
  if (!xs.length) return null;
  var y = xs.slice().sort(function (a, b) { return a - b; });
  var idx = (y.length - 1) * p;
  var lo = Math.floor(idx), hi = Math.ceil(idx);
  return lo === hi ? y[lo] : y[lo] + (y[hi] - y[lo]) * (idx - lo);
}

/* ------------------------------------------------------------------ *
 * RSI de Wilder
 * ------------------------------------------------------------------ */

/**
 * RSI clasico de Wilder (suavizado exponencial 1/period), que es el que usan
 * TradingView y la mayoria de las plataformas. Ojo: el "RSI de Cutler"
 * (medias simples) da valores distintos; si su sistema usa otro, cambie aqui.
 *
 * @param {number[]} cierres  serie de cierres, antigua -> reciente
 * @param {number}   period   default 14
 * @returns {(number|null)[]} misma longitud que `cierres`
 */
function rsiWilder(cierres, period) {
  period = period || 14;
  var out = new Array(cierres.length).fill(null);
  if (cierres.length <= period) return out;

  var gan = 0, per = 0;
  for (var i = 1; i <= period; i++) {
    var d = cierres[i] - cierres[i - 1];
    if (d >= 0) gan += d; else per -= d;
  }
  var avgG = gan / period, avgP = per / period;
  out[period] = avgP === 0 ? 100 : 100 - 100 / (1 + avgG / avgP);

  for (var j = period + 1; j < cierres.length; j++) {
    var dd = cierres[j] - cierres[j - 1];
    var g = dd > 0 ? dd : 0, p = dd < 0 ? -dd : 0;
    avgG = (avgG * (period - 1) + g) / period;
    avgP = (avgP * (period - 1) + p) / period;
    out[j] = avgP === 0 ? 100 : 100 - 100 / (1 + avgG / avgP);
  }
  return out;
}

/* ------------------------------------------------------------------ *
 * Surge de volumen
 * ------------------------------------------------------------------ */

/**
 * Razon entre el volumen de la vela y el volumen tipico de las `lookback`
 * velas PREVIAS (la vela actual queda excluida de su propia referencia).
 *
 * ratio = 3.0  <=>  "+200%" respecto de la referencia.
 *
 * @param {number[]} vols
 * @param {object}   opts  {lookback=20, base='mediana'|'media'}
 * @returns {(number|null)[]}
 */
function surgeVolumen(vols, opts) {
  opts = opts || {};
  var lb = opts.lookback || 20;
  var base = opts.base || 'mediana';
  var out = new Array(vols.length).fill(null);
  for (var i = lb; i < vols.length; i++) {
    var prev = vols.slice(i - lb, i);
    var ref = base === 'media' ? media(prev) : mediana(prev);
    out[i] = (ref && ref > 0) ? vols[i] / ref : null;
  }
  return out;
}

/* ------------------------------------------------------------------ *
 * ATR (Wilder) — para dimensionar stops
 * ------------------------------------------------------------------ */

function atrWilder(velas, period) {
  period = period || 14;
  var out = new Array(velas.length).fill(null);
  if (velas.length <= period) return out;
  var trs = [];
  for (var i = 1; i < velas.length; i++) {
    var h = velas[i][H], l = velas[i][L], pc = velas[i - 1][C];
    trs.push(Math.max(h - l, Math.abs(h - pc), Math.abs(l - pc)));
  }
  var a = media(trs.slice(0, period));
  out[period] = a;
  for (var j = period + 1; j < velas.length; j++) {
    a = (a * (period - 1) + trs[j - 1]) / period;
    out[j] = a;
  }
  return out;
}

/* ------------------------------------------------------------------ *
 * Escaner: RSI bajo + volumen explosivo, en la MISMA vela
 * ------------------------------------------------------------------ */

/**
 * @param {Array} velas
 * @param {object} cfg {rsiPeriod=14, rsiMax=30, volLookback=20,
 *                      volBase='mediana', surgeMin=3.0}
 * @returns {{config, series, senales}}
 */
function escanear(velas, cfg) {
  cfg = Object.assign({
    rsiPeriod: 14, rsiMax: 30,
    volLookback: 20, volBase: 'mediana', surgeMin: 3.0
  }, cfg || {});

  var cierres = velas.map(function (v) { return v[C]; });
  var vols = velas.map(function (v) { return v[V]; });
  var rsi = rsiWilder(cierres, cfg.rsiPeriod);
  var surge = surgeVolumen(vols, { lookback: cfg.volLookback, base: cfg.volBase });
  var atr = atrWilder(velas, 14);

  var senales = [];
  for (var i = 0; i < velas.length; i++) {
    if (rsi[i] == null || surge[i] == null) continue;
    if (rsi[i] < cfg.rsiMax && surge[i] >= cfg.surgeMin) {
      senales.push({
        i: i, ts: velas[i][TS], close: velas[i][C],
        rsi: rsi[i], surge: surge[i], atr: atr[i]
      });
    }
  }
  return { config: cfg, series: { rsi: rsi, surge: surge, atr: atr }, senales: senales };
}

/**
 * Cuan cerca estuvo cada vela de cumplir las DOS condiciones. Util cuando el
 * escaner devuelve cero: dice si el filtro esta mal calibrado o si el mercado
 * simplemente no ofrecio el evento.
 */
function casiSenales(velas, cfg, n) {
  var r = escanear(velas, cfg);
  var c = r.config, filas = [];
  for (var i = 0; i < velas.length; i++) {
    var rsi = r.series.rsi[i], su = r.series.surge[i];
    if (rsi == null || su == null) continue;
    // distancia normalizada a cada umbral (0 = cumple)
    var dRsi = Math.max(0, (rsi - c.rsiMax) / c.rsiMax);
    var dVol = Math.max(0, (c.surgeMin - su) / c.surgeMin);
    filas.push({ ts: velas[i][TS], rsi: rsi, surge: su, distancia: dRsi + dVol });
  }
  filas.sort(function (a, b) { return a.distancia - b.distancia; });
  return filas.slice(0, n || 10);
}

/* ------------------------------------------------------------------ *
 * Replay: donde habria entrado el sistema y que habria pasado
 * ------------------------------------------------------------------ */

/**
 * Ejecuta las senales de `escanear` como operaciones largas, con reglas
 * explicitas y sin look-ahead:
 *   - la senal se confirma AL CIERRE de la vela i;
 *   - la entrada ocurre a la APERTURA de la vela i+1;
 *   - stop = low(i) - stopATR * ATR(i);  objetivo = entrada + rr * riesgo;
 *   - si en una misma vela se tocan stop y objetivo, se asume el STOP
 *     (supuesto conservador: sin datos intra-vela no se puede saber el orden);
 *   - cierre por tiempo a las `maxVelas` velas, al cierre.
 *
 * @returns {{config, operaciones, resumen}}
 */
function replay(velas, cfg) {
  cfg = Object.assign({
    rsiPeriod: 14, rsiMax: 30, volLookback: 20, volBase: 'mediana',
    surgeMin: 3.0, stopATR: 0.5, rr: 2, maxVelas: 12,
    desde: null, hasta: null
  }, cfg || {});

  var esc = escanear(velas, cfg);
  var ops = [];

  esc.senales.forEach(function (s) {
    if (cfg.desde && s.ts < cfg.desde) return;
    if (cfg.hasta && s.ts > cfg.hasta) return;
    var e = s.i + 1;
    if (e >= velas.length || s.atr == null) return;

    var entrada = velas[e][O];
    var stop = velas[s.i][L] - cfg.stopATR * s.atr;
    var riesgo = entrada - stop;
    if (riesgo <= 0) return;
    var objetivo = entrada + cfg.rr * riesgo;

    var salida = null, motivo = 'abierta', tsSalida = null;
    for (var k = e; k < Math.min(velas.length, e + cfg.maxVelas); k++) {
      if (velas[k][L] <= stop) { salida = stop; motivo = 'stop'; tsSalida = velas[k][TS]; break; }
      if (velas[k][H] >= objetivo) { salida = objetivo; motivo = 'objetivo'; tsSalida = velas[k][TS]; break; }
    }
    if (salida === null) {
      var last = Math.min(velas.length, e + cfg.maxVelas) - 1;
      salida = velas[last][C]; motivo = 'tiempo'; tsSalida = velas[last][TS];
    }

    ops.push({
      senal: s.ts, rsi: s.rsi, surge: s.surge,
      entradaTs: velas[e][TS], entrada: entrada, stop: stop, objetivo: objetivo,
      salidaTs: tsSalida, salida: salida, motivo: motivo,
      R: (salida - entrada) / riesgo,
      pct: (salida - entrada) / entrada * 100
    });
  });

  var ganadoras = ops.filter(function (o) { return o.R > 0; });
  var sumaR = ops.reduce(function (a, o) { return a + o.R; }, 0);
  return {
    config: cfg,
    operaciones: ops,
    resumen: {
      n: ops.length,
      ganadoras: ganadoras.length,
      aciertoPct: ops.length ? ganadoras.length / ops.length * 100 : null,
      sumaR: sumaR,
      esperanzaR: ops.length ? sumaR / ops.length : null
    }
  };
}

/* ------------------------------------------------------------------ *
 * OMB — Oscilador Momentum-Ballenas
 * ------------------------------------------------------------------ */

/**
 * Cruza DOS series independientes y las mantiene separadas a proposito:
 *
 *   flujo     (-100..+100)  presion neta del dinero grande
 *   tendencia (-100..+100)  momentum del precio normalizado por volatilidad
 *
 * y de ahi:
 *   omb          = (flujo + tendencia) / 2      -> impulso confirmado
 *   divergencia  = flujo - tendencia            -> el dato accionable
 *
 * La logica: el precio y el dinero grande casi siempre van juntos; cuando NO
 * van juntos, uno de los dos miente. Si la tendencia cae pero el flujo grande
 * compra, hay absorcion (acumulacion); al reves, distribucion.
 *
 * MODO 'tape' (recomendado): recibe trades reales
 *   {ts, price, qty, side:'buy'|'sell'}
 * agrupados en buckets del timeframe. "Ballena" = trade cuyo nocional supera
 * el percentil `pct` de una ventana movil de trades. Es un umbral RELATIVO al
 * mercado del momento, no un numero fijo en USD que envejece mal.
 *
 * MODO 'velas' (degradado): sin cinta de trades, aproxima la presion con
 *   CLV = ((c-l)-(h-c))/(h-l)   ->  volumen firmado,
 * y llama "grandes" solo a las velas cuyo volumen supera el percentil `pct`
 * de la ventana. ESTO NO ES ACTIVIDAD DE BALLENAS: es concentracion de
 * volumen. Sirve para historicos, pero no lo confunda con flujo real.
 */

/** Convierte una cinta de trades en presion neta por bucket. */
function flujoDesdeTape(trades, opts) {
  opts = opts || {};
  var bucketMs = opts.bucketMs || 4 * 3600 * 1000;
  var pct = opts.pct == null ? 0.90 : opts.pct;
  var ventana = opts.ventanaTrades || 500;

  var t = trades.slice().sort(function (a, b) {
    return new Date(a.ts) - new Date(b.ts);
  });

  var buckets = new Map();
  var recientes = [];               // nocionales recientes, ventana movil
  for (var i = 0; i < t.length; i++) {
    var tr = t[i];
    var noc = tr.price * tr.qty;
    var umbral = recientes.length >= 30 ? percentil(recientes, pct) : null;

    recientes.push(noc);
    if (recientes.length > ventana) recientes.shift();
    if (umbral == null || noc < umbral) continue;   // no es "grande"

    var k = Math.floor(new Date(tr.ts).getTime() / bucketMs) * bucketMs;
    var b = buckets.get(k) || { neto: 0, bruto: 0, n: 0 };
    b.neto += (tr.side === 'buy' ? noc : -noc);
    b.bruto += noc;
    b.n += 1;
    buckets.set(k, b);
  }

  return Array.from(buckets.entries())
    .sort(function (a, b) { return a[0] - b[0]; })
    .map(function (e) {
      return {
        ts: new Date(e[0]).toISOString(),
        neto: e[1].neto, bruto: e[1].bruto, trades: e[1].n
      };
    });
}

/**
 * Presion aproximada a partir de velas (modo degradado).
 * Devuelve el nocional firmado SOLO en las velas de volumen concentrado y
 * `null` en el resto (no 0: "no hubo dato" no es lo mismo que "hubo cero
 * presion", y meter ceros hunde la mediana de la ventana y deja el flujo con
 * un piso negativo artificial).
 */
function flujoDesdeVelas(velas, opts) {
  opts = opts || {};
  var pct = opts.pct == null ? 0.80 : opts.pct;
  var lb = opts.lookback || 20;
  var out = new Array(velas.length).fill(null);
  for (var i = lb; i < velas.length; i++) {
    var prevVols = velas.slice(i - lb, i).map(function (v) { return v[V]; });
    var umbral = percentil(prevVols, pct);
    var v = velas[i];
    if (v[V] < umbral) continue;
    var rango = v[H] - v[L];
    var clv = rango > 0 ? ((v[C] - v[L]) - (v[H] - v[C])) / rango : 0;
    out[i] = clv * v[V] * v[C];
  }
  return out;
}

/**
 * Rellena los huecos de una serie de presion decayendo el ultimo valor hacia
 * cero. Interpretacion: la huella del dinero grande no desaparece de golpe,
 * pero pierde vigencia si no se renueva.
 */
function decaer(serie, factor) {
  factor = factor == null ? 0.6 : factor;
  var out = new Array(serie.length).fill(null), ultimo = null;
  for (var i = 0; i < serie.length; i++) {
    if (serie[i] != null) { ultimo = serie[i]; out[i] = ultimo; }
    else if (ultimo != null) { ultimo = ultimo * factor; out[i] = ultimo; }
  }
  return out;
}

function zRobusto(serie, i, ventana) {
  var ini = Math.max(0, i - ventana + 1);
  var w = [];
  for (var k = ini; k <= i; k++) if (serie[k] != null) w.push(serie[k]);
  if (w.length < 8) return null;
  var m = mediana(w);
  var desv = w.map(function (x) { return Math.abs(x - m); });
  var mad = mediana(desv) * 1.4826;
  if (!mad) {
    var sd = desviacion(w);
    if (!sd) return 0;
    return (serie[i] - media(w)) / sd;
  }
  return (serie[i] - m) / mad;
}

/**
 * @param {Array}  velas
 * @param {object} opts {
 *    modo:'velas'|'tape', trades:[], ventana=30, emaLen=20, atrLen=14,
 *    pct, umbral=30 }
 * @returns {{series:{flujo,tendencia,omb,divergencia}, senales:[]}}
 */
function osciladorMomentumBallenas(velas, opts) {
  opts = Object.assign({
    modo: 'velas', trades: null, ventana: 30, emaLen: 20,
    atrLen: 14, umbral: 30, decay: 0.6, bucketMs: 4 * 3600 * 1000
  }, opts || {});

  var n = velas.length;

  // --- 1. presion del dinero grande ---------------------------------
  var presion;
  if (opts.modo === 'tape') {
    if (!opts.trades || !opts.trades.length) {
      throw new Error('modo "tape" requiere opts.trades');
    }
    var flujos = flujoDesdeTape(opts.trades, {
      bucketMs: opts.bucketMs, pct: opts.pct == null ? 0.90 : opts.pct
    });
    var porTs = new Map(flujos.map(function (f) { return [f.ts, f.neto]; }));
    presion = velas.map(function (v) {
      var k = new Date(v[TS]).toISOString();
      return porTs.has(k) ? porTs.get(k) : 0;
    });
  } else {
    presion = decaer(flujoDesdeVelas(velas, {
      pct: opts.pct == null ? 0.80 : opts.pct, lookback: 20
    }), opts.decay);
  }

  // --- 2. tendencia del precio normalizada por volatilidad ----------
  var cierres = velas.map(function (v) { return v[C]; });
  var atr = atrWilder(velas, opts.atrLen);
  var k = 2 / (opts.emaLen + 1), ema = [];
  for (var i = 0; i < n; i++) {
    ema[i] = i === 0 ? cierres[0] : cierres[i] * k + ema[i - 1] * (1 - k);
  }

  var flujo = new Array(n).fill(null);
  var tendencia = new Array(n).fill(null);
  var omb = new Array(n).fill(null);
  var divergencia = new Array(n).fill(null);

  for (var j = 0; j < n; j++) {
    var zf = presion[j] == null ? null : zRobusto(presion, j, opts.ventana);
    var t = (atr[j] && atr[j] > 0) ? (cierres[j] - ema[j]) / atr[j] : null;
    if (zf == null || t == null) continue;
    flujo[j] = 100 * Math.tanh(zf / 2);
    tendencia[j] = 100 * Math.tanh(t / 2);
    omb[j] = (flujo[j] + tendencia[j]) / 2;
    divergencia[j] = flujo[j] - tendencia[j];
  }

  // --- 3. lectura ----------------------------------------------------
  var u = opts.umbral, senales = [];
  for (var q = 0; q < n; q++) {
    if (flujo[q] == null) continue;
    var tipo = null;
    if (tendencia[q] < -u && flujo[q] > u) tipo = 'acumulacion_oculta';
    else if (tendencia[q] > u && flujo[q] < -u) tipo = 'distribucion_oculta';
    else if (tendencia[q] > u && flujo[q] > u) tipo = 'impulso_confirmado';
    else if (tendencia[q] < -u && flujo[q] < -u) tipo = 'caida_confirmada';
    if (tipo) {
      senales.push({
        ts: velas[q][TS], tipo: tipo, close: velas[q][C],
        flujo: flujo[q], tendencia: tendencia[q],
        omb: omb[q], divergencia: divergencia[q]
      });
    }
  }

  return {
    modo: opts.modo,
    series: { flujo: flujo, tendencia: tendencia, omb: omb, divergencia: divergencia },
    senales: senales
  };
}

/* ------------------------------------------------------------------ */

var API = {
  IDX: { TS: TS, O: O, H: H, L: L, C: C, V: V },
  media: media, mediana: mediana, percentil: percentil,
  rsiWilder: rsiWilder, surgeVolumen: surgeVolumen, atrWilder: atrWilder,
  escanear: escanear, casiSenales: casiSenales, replay: replay,
  flujoDesdeTape: flujoDesdeTape, flujoDesdeVelas: flujoDesdeVelas,
  decaer: decaer,
  osciladorMomentumBallenas: osciladorMomentumBallenas
};

if (typeof module !== 'undefined' && module.exports) module.exports = API;
if (typeof window !== 'undefined') window.Indicadores = API;
