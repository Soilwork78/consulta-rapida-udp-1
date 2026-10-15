/*
 * Generador de Sudoku: usa el módulo WebAssembly compilado desde src/sudoku.c.
 * Si el navegador no puede ejecutar WebAssembly, usa una versión equivalente en JavaScript.
 * Este archivo es una plantilla: tools/build.py reemplaza el marcador por el binario.
 */
(function () {
  "use strict";
  var WASM = "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QQEgAkGWiICAAGotAAB0QQEgAkGViICAAGotAAB0QQEgAkGUiICAAGotAAB0QQEgAkGTiICAAGotAAB0QQEgAkGSiICAAGotAAB0QQEgAkGRiICAAGotAAB0QQEgAkGQiICAAGotAAB0QQEgAUGQiICAAGotAAB0ckEBIABBG21BA2wgAcBBA23AaiICQQNtIgBBG2wgAiAAQQNsa0EDbGoiAkGQiICAAGotAAB0cnJBASABQZmIgIAAai0AAHRyQQEgAkGRiICAAGotAAB0cnJBASABQaKIgIAAai0AAHRyQQEgAkGSiICAAGotAAB0cnJBASABQauIgIAAai0AAHRyQQEgAkGZiICAAGotAAB0cnJBASABQbSIgIAAai0AAHRyQQEgAkGaiICAAGotAAB0cnJBASABQb2IgIAAai0AAHRyQQEgAkGbiICAAGotAAB0cnJBASABQcaIgIAAai0AAHRyQQEgAkGiiICAAGotAAB0cnJBASABQc+IgIAAai0AAHRyQQEgAkGjiICAAGotAAB0cnJBASABQdiIgIAAai0AAHRyQQEgAkGkiICAAGotAAB0ckEBdQsIAEHQiYCAAAsIAEHwiICAAAsLCwEAQYAICwQBAAAA";

  function bytes(b64) {
    var s = atob(b64), u = new Uint8Array(s.length);
    for (var i = 0; i < s.length; i++) u[i] = s.charCodeAt(i);
    return u;
  }

  /* --- Respaldo en JavaScript: mismo algoritmo que sudoku.c --- */
  function generarJS(semilla, pistas) {
    var estado = semilla >>> 0 || 0x9E3779B9;
    function azar() { var x = estado; x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; estado = x; return x; }
    function usados(t, i) {
      var f = Math.floor(i / 9), c = i % 9, b = Math.floor(i / 27) * 3 + Math.floor(c / 3), m = 0;
      for (var k = 0; k < 9; k++) {
        m |= 1 << t[f * 9 + k]; m |= 1 << t[k * 9 + c];
        m |= 1 << t[Math.floor(b / 3) * 27 + (b % 3) * 3 + Math.floor(k / 3) * 9 + (k % 3)];
      }
      return m >> 1;
    }
    function bits(m) { var n = 0; while (m) { m &= m - 1; n++; } return n; }
    function contar(t, tope) {
      var mejor = -1, ml = 10, mask = 0;
      for (var i = 0; i < 81; i++) {
        if (t[i]) continue;
        var l = ~usados(t, i) & 0x1FF, n = bits(l);
        if (!n) return 0;
        if (n < ml) { mejor = i; ml = n; mask = l; if (n === 1) break; }
      }
      if (mejor < 0) return 1;
      var tot = 0;
      for (var d = 0; d < 9 && tot < tope; d++) { if (mask & (1 << d)) { t[mejor] = d + 1; tot += contar(t, tope - tot); } }
      t[mejor] = 0; return tot;
    }
    function llenar(t, i) {
      while (i < 81 && t[i]) i++;
      if (i === 81) return true;
      var l = ~usados(t, i) & 0x1FF, o = [0, 1, 2, 3, 4, 5, 6, 7, 8];
      for (var k = 8; k > 0; k--) { var j = azar() % (k + 1), x = o[k]; o[k] = o[j]; o[j] = x; }
      for (k = 0; k < 9; k++) { if (l & (1 << o[k])) { t[i] = o[k] + 1; if (llenar(t, i + 1)) return true; } }
      t[i] = 0; return false;
    }
    var t = new Array(81).fill(0); llenar(t, 0);
    var sol = t.slice(), puz = t.slice(), ord = [];
    for (var i = 0; i < 81; i++) ord.push(i);
    for (var k = 80; k > 0; k--) { var j = azar() % (k + 1), x = ord[k]; ord[k] = ord[j]; ord[j] = x; }
    var quedan = 81;
    for (k = 0; k < 81 && quedan > pistas; k++) {
      var c = ord[k], v = puz[c]; puz[c] = 0;
      if (contar(puz.slice(), 2) !== 1) puz[c] = v; else quedan--;
    }
    return { puzzle: puz, solucion: sol, motor: "JavaScript" };
  }

  var listo = (typeof WebAssembly === "object"
    ? WebAssembly.instantiate(bytes(WASM)).then(function (r) {
        var ex = r.instance.exports;
        return function (semilla, pistas) {
          ex.sudoku_generar(semilla >>> 0, pistas);
          var mem = new Uint8Array(ex.memory.buffer);
          var p = ex.sudoku_puzzle(), s = ex.sudoku_solucion();
          return { puzzle: Array.from(mem.slice(p, p + 81)), solucion: Array.from(mem.slice(s, s + 81)), motor: "WebAssembly (C)" };
        };
      })
    : Promise.reject(new Error("sin WebAssembly"))
  ).catch(function () { return generarJS; });

  window.SudokuMotor = { listo: listo, respaldo: generarJS };
})();
