// ============================================================
// pepe-grillo/registro.js — Registro de lo que la enfermera dicta
// y borrador de la evolución de enfermería.
//
// Regla: Pepe NO inventa. Solo ordena lo dictado; lo esencial que no
// se dictó aparece como "falta registrar". La enfermera revisa y firma.
//
// Frases que entiende (con o sin "Pepe"):
//   "refiere dolor opresivo desde las 8:30…"   → anamnesis próxima
//   "anamnesis próxima: …" / "historia actual: …"
//   "antecedentes: hipertenso, diabético…"     → anamnesis remota
//   "fármacos: losartán…" / "alergias: niega"
//   "signos vitales: presión 158 sobre 94, FC 102, saturación 95…"
//   "ECG tomado" / "vía venosa 18 instalada" / "aspirina administrada" → procedimiento con hora
//   "anota: …"                                 → nota libre
//   "redacta la evolución"                     → borrador
// ============================================================

(function () {
  const sinTildes = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  // Quita "Pepe," y "box 3," del inicio de la frase, conservando tildes y mayúsculas.
  function limpiarFrase(texto) {
    return String(texto || '')
      .replace(/^\s*pepe\b[\s,.:;]*/i, '')
      .replace(/\b(box|cama|camilla)\s+\S+?[\s,.:;]+/i, '')
      .replace(/^\s*pepe\b[\s,.:;]*/i, '')
      .trim();
  }
  const mayuscula = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const sinPunto = (s) => s.replace(/[\s.;,]+$/, '');

  // ── Signos vitales dictados ──
  const SV = [
    ['pa', /(?:presion(?: arterial)?|\bpa)\s*(?:de\s*)?(\d{2,3})\s*(?:\/|sobre|con)\s*(\d{2,3})/, (m) => m[1] + '/' + m[2] + ' mmHg', 'PA'],
    ['fc', /(?:frecuencia cardiaca|\bfc|pulso)\s*(?:de\s*)?(\d{2,3})/, (m) => m[1] + ' lpm', 'FC'],
    ['fr', /(?:frecuencia respiratoria|\bfr)\s*(?:de\s*)?(\d{1,2})\b/, (m) => m[1] + ' rpm', 'FR'],
    ['sat', /(?:saturacion|saturando|satura|\bsat|spo2)\s*(?:de\s*)?(\d{2,3})/, (m) => m[1] + '%', 'SatO2'],
    ['t', /(?:temperatura|\btemp)\s*(?:de\s*)?(\d{2}(?:[.,]\d)?)/, (m) => m[1].replace('.', ',') + ' °C', 'T°'],
    ['eva', /(?:\beva|dolor)\s*(?:de\s*)?(\d{1,2})(?:\s*(?:de|sobre|\/)\s*10)?\b/, (m) => m[1] + '/10', 'EVA'],
    ['hgt', /(?:\bhgt|glicemia|hemoglucotest)\s*(?:de\s*)?(\d{2,3})/, (m) => m[1] + ' mg/dL', 'HGT'],
  ];
  function leerSignos(texto) {
    const t = sinTildes(texto);
    const r = {};
    SV.forEach(([k, re, f]) => { const m = t.match(re); if (m) r[k] = f(m); });
    return r;
  }
  const describirSignos = (sv) => SV.filter(([k]) => sv[k]).map(([k, , , et]) => et + ' ' + sv[k]).join(', ');

  // ── Procedimientos: verbo de acción cumplida ──
  const HECHO = /\b(tomad[oa]s?|tome|realizad[oa]s?|realice|administrad[oa]s?|administre|instalad[oa]s?|instale|colocad[oa]s?|coloque|puest[oa]s?|puse|conectad[oa]s?|conecte|enviad[oa]s?|envie|iniciad[oa]s?|inicie|dad[oa]s?|le di|retirad[oa]s?|retire|listo|lista)\b|\bse (tomo|administro|instalo|realizo|coloco|inicio|envio|dio|conecto|retiro)\b/;
  const ETIQUETAS = [
    ['ecg', /\becg\b|electrocardiograma/],
    ['fibrinolitico', /tenecteplasa|estreptoquinasa|alteplasa|fibrinolitico|trombolitico|fibrinolisis|trombolisis/],
    ['aas', /aspirina|\baas\b/],
  ];

  const REGLAS = [
    ['evolucion', /^((redacta|redactar|genera|arma|prepara|dame|hazme)\b.*\bevoluci[oó]n|evoluci[oó]n)\s*$/i, 'todo'],
    ['nota', /^(anota|anotar|registra|nota|observaci[oó]n)\b\s*[:,.]?\s*(que\s+)?/i, 'resto'],
    ['proxima', /^(anamnesis\s+pr[oó]xima|anamnesis\s+actual|historia\s+actual)\s*[:,.]?\s*/i, 'resto'],
    ['remota', /^(anamnesis\s+remota|antecedentes?(\s+m[oó]rbidos)?)\s*[:,.]?\s*/i, 'resto'],
    ['alergias', /^(sin alergias|niega alergias|no tiene alergias|no es al[eé]rgic[oa])/i, 'niega'],
    ['alergias', /^(alergias?|al[eé]rgic[oa]s?\s+a)\s*[:,.]?\s*/i, 'resto'],
    ['farmacos', /^(f[aá]rmacos(\s+habituales)?|medicamentos(\s+habituales)?|tratamiento\s+habitual)\s*[:,.]?\s*/i, 'resto'],
    ['signos', /^signos\s+vitales\s*[:,.]?\s*/i, 'resto'],
    ['procedimiento', /^procedimiento\s*[:,.]?\s*/i, 'resto'],
    ['proxima', /^(refiere|relata|cuenta que|consulta por)\b/i, 'todo'],
  ];

  // Devuelve { tipo, texto } si la frase es para el registro; si no, null.
  function interpretar(texto) {
    const o = limpiarFrase(texto);
    const t = sinTildes(o);
    if (!o || /\bingres/.test(t)) return null;
    for (const [tipo, re, modo] of REGLAS) {
      const m = o.match(re);
      if (!m) continue;
      if (modo === 'niega') return { tipo, texto: 'Niega alergias' };
      const contenido = modo === 'resto' ? o.slice(m[0].length) : o;
      return { tipo, texto: mayuscula(sinPunto(contenido.trim())) };
    }
    if (HECHO.test(t)) {
      const sustantivo = t.replace(HECHO, ' ').replace(/[^a-z0-9ñ\s]/g, ' ').trim();
      if (sustantivo) return { tipo: 'procedimiento', texto: mayuscula(sinPunto(o)) };
    }
    const sv = Object.keys(leerSignos(o)).length;
    if (sv >= 2 || (sv === 1 && o.split(/\s+/).length <= 6)) return { tipo: 'signos', texto: o };
    return null;
  }

  const hhmm = (ms) => new Date(ms).toTimeString().slice(0, 5);
  const minutos = (a, b) => Math.round((b - a) / 60000);

  function crear(ahora) {
    const r = {
      ingreso: ahora, paciente: {}, clinico: [], proxima: [], remota: [], farmacos: [],
      alergias: [], signos: [], procedimientos: [], notas: [],
    };

    function agregar(entrada, cuando) {
      const { tipo, texto } = entrada;
      if (tipo === 'signos') {
        const sv = leerSignos(texto);
        if (!Object.keys(sv).length) return 'No reconocí signos vitales. Díctalos como: presión 150 sobre 90, FC 98.';
        r.signos.push({ hora: cuando, sv });
        return 'Anotado: ' + describirSignos(sv) + '.';
      }
      if (tipo === 'procedimiento') {
        const tags = ETIQUETAS.filter(([, re]) => re.test(sinTildes(texto))).map(([k]) => k);
        r.procedimientos.push({ hora: cuando, texto, tags });
        return 'Anotado, ' + hhmm(cuando) + '.';
      }
      if (tipo === 'proxima') {
        r.proxima.push(texto);
        const sv = leerSignos(texto);
        if (sv.eva) r.signos.push({ hora: cuando, sv: { eva: sv.eva } });
        return 'Anotado en anamnesis próxima.';
      }
      const destino = { remota: 'remota', alergias: 'alergias', farmacos: 'farmacos', nota: 'notas' }[tipo];
      r[destino].push(texto);
      return { remota: 'Anotado en anamnesis remota.', alergias: 'Alergias anotadas.',
        farmacos: 'Fármacos anotados.', notas: 'Nota anotada.' }[destino];
    }

    // Eventos clínicos que Pepe ya conoce (sospecha, fases, doble chequeo…).
    function evento(texto, cuando, tipo) {
      const lista = tipo === 'procedimiento' ? r.procedimientos : r.clinico;
      lista.push(tipo === 'procedimiento' ? { hora: cuando, texto, tags: [] } : { hora: cuando, texto });
    }

    // Lo esencial en SCA que debería estar en la evolución.
    function faltantes() {
      const prox = sinTildes(r.proxima.join(' '));
      const ultimo = Object.assign({}, ...r.signos.map((s) => s.sv));
      const f = [];
      if (!r.proxima.length) f.push('anamnesis próxima');
      else if (!/\b(desde|inicio|inicia|comenz|empez|hace|a las)\b/.test(prox)) f.push('hora de inicio del dolor');
      if (!ultimo.eva) f.push('EVA');
      if (!r.remota.length) f.push('antecedentes');
      if (!r.farmacos.length) f.push('fármacos habituales');
      if (!r.alergias.length) f.push('alergias');
      ['pa', 'fc', 'sat'].forEach((k) => { if (!ultimo[k]) f.push({ pa: 'PA', fc: 'FC', sat: 'SatO2' }[k]); });
      if (!r.procedimientos.some((p) => p.tags.includes('ecg'))) f.push('hora del ECG');
      return f;
    }

    function tiempos() {
      const t = [];
      const ecg = r.procedimientos.find((p) => p.tags.includes('ecg'));
      const fib = r.procedimientos.find((p) => p.tags.includes('fibrinolitico'));
      if (ecg) t.push('Puerta-ECG: ' + minutos(r.ingreso, ecg.hora) + ' min');
      if (fib) t.push('Puerta-aguja: ' + minutos(r.ingreso, fib.hora) + ' min');
      return t;
    }

    function evolucion(cuando) {
      const p = r.paciente;
      const quien = [p.sexo ? mayuscula(p.sexo) : 'Paciente', p.edad ? p.edad + ' años' : ''].filter(Boolean).join(', ');
      const fecha = new Date(cuando).toLocaleDateString('es-CL');
      const falta = '[falta registrar]';
      const L = [];
      L.push('EVOLUCIÓN DE ENFERMERÍA — URGENCIA');
      L.push(fecha + ' · ' + hhmm(cuando) + (p.box ? ' · Box ' + p.box : ''));
      L.push(quien + '. Ingreso ' + hhmm(r.ingreso) + '.');
      if (r.clinico.length) {
        L.push('', 'Contexto clínico:');
        r.clinico.forEach((e) => L.push('- ' + hhmm(e.hora) + ' ' + e.texto + '.'));
      }
      L.push('', 'S:');
      L.push('Anamnesis próxima: ' + (r.proxima.length ? r.proxima.map(sinPunto).join('. ') + '.' : falta));
      L.push('Anamnesis remota: ' + (r.remota.length ? r.remota.map(sinPunto).join('. ') + '.' : falta));
      L.push('Fármacos habituales: ' + (r.farmacos.length ? r.farmacos.map(sinPunto).join('. ') + '.' : falta));
      L.push('Alergias: ' + (r.alergias.length ? r.alergias.map(sinPunto).join('. ') + '.' : falta));
      L.push('', 'O:');
      if (r.signos.length) r.signos.forEach((s) => L.push('Signos vitales ' + hhmm(s.hora) + ': ' + describirSignos(s.sv) + '.'));
      else L.push('Signos vitales: ' + falta);
      L.push('', 'Procedimientos e intervenciones:');
      if (r.procedimientos.length) {
        [...r.procedimientos].sort((a, b) => a.hora - b.hora)
          .forEach((x) => L.push('- ' + hhmm(x.hora) + ' ' + sinPunto(x.texto) + '.'));
      } else L.push('- ' + falta);
      const t = tiempos();
      if (t.length) L.push('', 'Tiempos: ' + t.join(' · ') + '.');
      if (r.notas.length) { L.push('', 'Observaciones:'); r.notas.forEach((n) => L.push('- ' + sinPunto(n) + '.')); }
      const f = faltantes();
      L.push('', 'Borrador generado a partir de lo dictado. Revisar, completar y firmar.');
      return { texto: L.join('\n'), faltantes: f };
    }

    // Líneas para mostrar el registro en vivo.
    function resumen() {
      const lin = [];
      r.clinico.forEach((e) => lin.push({ hora: e.hora, texto: e.texto }));
      r.procedimientos.forEach((x) => lin.push({ hora: x.hora, texto: x.texto }));
      r.signos.forEach((s) => lin.push({ hora: s.hora, texto: describirSignos(s.sv) }));
      return lin.sort((a, b) => a.hora - b.hora).map((x) => hhmm(x.hora) + ' · ' + x.texto)
        .concat(r.proxima.map((x) => 'Anamnesis próxima · ' + x))
        .concat(r.remota.map((x) => 'Antecedentes · ' + x))
        .concat(r.farmacos.map((x) => 'Fármacos · ' + x))
        .concat(r.alergias.map((x) => 'Alergias · ' + x))
        .concat(r.notas.map((x) => 'Nota · ' + x));
    }

    return { datos: r, agregar, evento, evolucion, faltantes, resumen };
  }

  const API = { interpretar, crear, leerSignos };
  if (typeof module !== 'undefined') module.exports = API;
  else window.PepeRegistro = API;
})();
