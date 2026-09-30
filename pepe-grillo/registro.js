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
//   "examen físico: …" / "hallazgos: …"        → O
//   "análisis: …"                              → A
//   "plan: …"                                  → P
//   "evaluación: dolor disminuye a EVA 3…"     → E
//   "anota: …"                                 → nota libre
//   "tiempos"                                  → Pepe dice los tiempos y si cumplen el GES
//   "redacta la evolución"                     → borrador SOAPIE (sin diagnósticos de enfermería;
//                                                 EVA en S; A solo con análisis de enfermería)
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
  const HECHO = new RegExp('\\b(tomad[oa]s?|tome|realizad[oa]s?|realice|administrad[oa]s?|administre|instalad[oa]s?|instale|' +
    'colocad[oa]s?|coloque|puest[oa]s?|puse|conectad[oa]s?|conecte|enviad[oa]s?|envie|iniciad[oa]s?|inicie|dad[oa]s?|le di|' +
    'retirad[oa]s?|retire|listo|lista|avisad[oa]s?|avise|activad[oa]s?|active|llame|coordinad[oa]s?|coordine|informad[oa]s?|informe|' +
    'comunique|preparad[oa]s?|prepare|entregad[oa]s?|entregue|trasladad[oa]s?|traslade|marcad[oa]s?|marque|educad[oa]s?|eduque|' +
    'controlad[oa]s?|controle|suspendid[oa]s?|suspendi|' +
    'sal(e|io) a (pabellon|hemodinamia)|paso (de )?la guia|cruzo la guia)\\b|' +
    '\\bse (tomo|administro|instalo|realizo|coloco|inicio|envio|dio|conecto|retiro|aviso|activo|coordino|informo|preparo|' +
    'entrego|traslado|marco|educo|controlo|suspendio)\\b');
  const ETIQUETAS = [
    ['ecg-control', /\becg\b.*\bcontrol\b|\bcontrol\b.*\becg\b/],
    ['ecg', /\becg\b|electrocardiograma/],
    ['salida', /\bsal(e|io)\b.*(hemodinamia|pabellon)|trasladad[oa]\b|\btraslade\b|\bse traslado\b/],
    ['guia', /paso (de )?la guia|cruz(a|o) la guia|guia (pasada|cruzada)/],
    ['aviso-hemodinamia', /(avis|activ|llam|coordin|inform|comuni)\w*\b.*hemodinamia/],
    ['troponina-2', /(segunda|control).*troponina|troponina.*(segunda|control)/],
    ['fibrinolitico', /tenecteplasa|estreptoquinasa|alteplasa|fibrinolitico|trombolitico|fibrinolisis|trombolisis/],
    ['aas', /aspirina|\baas\b/],
  ];

  const REGLAS = [
    ['evolucion', /^((redacta|redactar|genera|arma|prepara|dame|hazme)\b.*\bevoluci[oó]n|evoluci[oó]n)\s*$/i, 'todo'],
    ['tiempos', /^((dime |dame |c[oó]mo (vamos|van|estamos) (con )?)?(los )?(tiempos|indicadores))\s*[?¿]*$/i, 'todo'],
    ['nota', /^(anota|anotar|registra|nota|observaci[oó]n)\b\s*[:,.]?\s*(que\s+)?/i, 'resto'],
    ['objetivo', /^(examen\s+f[ií]sico|hallazgos?|al\s+examen)\s*[:,.]?\s*/i, 'resto'],
    ['analisis', /^(an[aá]lisis|apreciaci[oó]n)\s*[:,.]?\s*/i, 'resto'],
    ['plan', /^plan\b\s*[:,.]?\s*/i, 'resto'],
    ['evaluacion', /^(evaluaci[oó]n|eval[uú]o)\b\s*[:,.]?\s*/i, 'resto'],
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
      if (sustantivo || /guia|pabellon|hemodinamia/.test(t)) return { tipo: 'procedimiento', texto: mayuscula(sinPunto(o)) };
    }
    const sv = Object.keys(leerSignos(o)).length;
    if (sv >= 2 || (sv === 1 && o.split(/\s+/).length <= 6)) return { tipo: 'signos', texto: o };
    return null;
  }

  // Hora de inicio del dolor dicha en la anamnesis: "desde las 12:30", "a las 8", "hace 2 horas".
  function leerInicio(texto, referencia) {
    const t = sinTildes(texto);
    const hora = t.match(/\b(?:desde|a las|a eso de las|cerca de las|comenzo a las|empezo a las|inicio a las)\s+(?:las\s+)?(\d{1,2})(?:\s*(?::|\.|h|y)\s*(\d{2}))?\b/);
    if (hora) {
      const d = new Date(referencia);
      d.setHours(Number(hora[1]), Number(hora[2] || 0), 0, 0);
      if (d.getTime() > referencia) d.setDate(d.getDate() - 1); // fue ayer
      return d.getTime();
    }
    const hace = t.match(/\bhace\s+(\d+|una|un|media)\s*(horas?|minutos?|min)\b/);
    if (hace) {
      const n = hace[1] === 'media' ? 0.5 : /^un/.test(hace[1]) ? 1 : Number(hace[1]);
      const factor = /^h/.test(hace[2]) ? 60 : 1;
      return referencia - n * factor * 60000;
    }
    return null;
  }

  // Registro clínico en forma impersonal: "tomé ECG" → "Se toma ECG".
  const IMPERSONAL = [
    [/\ble di\b/i, 'se administra'], [/\ble (puse|coloque|coloqué)\b/i, 'se coloca'],
    ...[['tome', 'toma'], ['realice', 'realiza'], ['administre', 'administra'], ['instale', 'instala'], ['coloque', 'coloca'],
      ['puse', 'coloca'], ['conecte', 'conecta'], ['envie', 'envía'], ['inicie', 'inicia'], ['retire', 'retira'],
      ['avise', 'avisa'], ['active', 'activa'], ['llame', 'llama'], ['coordine', 'coordina'], ['informe', 'informa'],
      ['comunique', 'comunica'], ['prepare', 'prepara'], ['entregue', 'entrega'], ['traslade', 'traslada'],
      ['marque', 'marca'], ['eduque', 'educa'], ['controle', 'controla'], ['suspendi', 'suspende']]
      .map(([yo, se]) => [new RegExp('(?<![\\wáéíóúñ])' + yo.replace(/e$/, '[eé]').replace(/i$/, '[ií]') + '(?![\\wáéíóúñ])', 'i'), 'se ' + se]),
    [/\b(ya|oye|bueno|entonces)\b[\s,]*/gi, ''],
  ];
  function impersonal(texto) {
    let t = texto;
    IMPERSONAL.forEach(([re, por]) => { t = t.replace(re, por); });
    return mayuscula(t.replace(/\s{2,}/g, ' ').trim());
  }

  // Intervenciones agrupadas para que la I se lea ordenada; dentro de cada grupo, por hora.
  // El orden de esta lista es el de clasificación (la primera que calza), no el de lectura.
  const GRUPOS_I = [
    ['Coordinación y traslado', /hemodinamia|pabellon|traslad|entrega|isbar|\bguia\b|codigo iam|\bavis|\bllam|\binform|\bcomunic|\bsale\b/],
    ['Fármacos', /aspirina|\baas\b|clopidogrel|ticagrelor|prasugrel|heparina|enoxaparina|nitro|morfina|fentanilo|opioide|tenecteplasa|estreptoquinasa|alteplasa|fibrinolitico|trombolitico|atropina|insulina|oxigeno|doble chequeo|\bmg\b|administra/],
    ['Monitorización y ECG', /\becg\b|electrocardiograma|monitor|desfibrilador|pulsos|\bv3r|\bv4r|marcapaso/],
    ['Accesos venosos y exámenes', /\bvia\b|vvp|cateter|\bbic\b|troponina|examen|examenes|muestra|hemograma|creatinina|gases|\bhgt\b|glicemia|orina/],
    ['Preparación, educación y confort', /educa|familia|reposo|confort|protesis|joyas|consentimiento|posicion|contencion/],
  ];
  const grupoDe = (texto) => (GRUPOS_I.find(([, re]) => re.test(sinTildes(texto))) || ['Otras intervenciones'])[0];

  const hhmm = (ms) => new Date(ms).toTimeString().slice(0, 5);
  const minutos = (a, b) => Math.round((b - a) / 60000);

  // opciones.hemodinamia: true si el centro tiene hemodinamia de turno (meta ESC 60 min al paso de la guía);
  // false si hay que trasladar (meta 90 min, y puerta de entrada → salida ≤ 30 min). Sin dato: se muestran ambas.
  function crear(ahora, opciones = {}) {
    const r = {
      ingreso: ahora, paciente: {}, clinico: [], proxima: [], remota: [], farmacos: [],
      alergias: [], signos: [], procedimientos: [], notas: [],
      objetivo: [], analisis: [], plan: [], evaluacion: [],
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
        let tags = ETIQUETAS.filter(([, re]) => re.test(sinTildes(texto))).map(([k]) => k);
        if (tags.includes('ecg-control')) tags = tags.filter((k) => k !== 'ecg'); // no cuenta para puerta-ECG
        r.procedimientos.push({ hora: cuando, texto: impersonal(texto), tags });
        return 'Anotado, ' + hhmm(cuando) + '.';
      }
      if (tipo === 'proxima') {
        r.proxima.push(texto);
        if (r.inicioDolor == null) r.inicioDolor = leerInicio(texto, r.ingreso);
        const sv = leerSignos(texto);
        if (sv.eva) r.signos.push({ hora: cuando, sv: { eva: sv.eva } });
        return 'Anotado en anamnesis próxima.';
      }
      const destino = { remota: 'remota', alergias: 'alergias', farmacos: 'farmacos', nota: 'notas',
        objetivo: 'objetivo', analisis: 'analisis', plan: 'plan', evaluacion: 'evaluacion' }[tipo];
      r[destino].push(texto);
      return { remota: 'Anotado en anamnesis remota.', alergias: 'Alergias anotadas.',
        farmacos: 'Fármacos anotados.', notas: 'Nota anotada.', objetivo: 'Anotado en objetivo.',
        analisis: 'Anotado en análisis.', plan: 'Anotado en plan.', evaluacion: 'Anotado en evaluación.' }[destino];
    }

    // Eventos clínicos que Pepe ya conoce (sospecha, fases, doble chequeo…).
    function evento(texto, cuando, tipo, marca) {
      const lista = tipo === 'procedimiento' ? r.procedimientos : r.clinico;
      lista.push(tipo === 'procedimiento' ? { hora: cuando, texto, tags: marca ? [marca] : [] } : { hora: cuando, texto, marca });
    }

    // ¿Ya está anotado? (para que Pepe no pregunte lo que ya sabe)
    const tiene = (marca) => marca === 'eva'
      ? r.signos.filter((s) => s.sv.eva).length >= 2
      : r.procedimientos.some((p) => p.tags.includes(marca)) || r.clinico.some((e) => e.marca === marca);

    // Respuesta "sí" a un recordatorio: la hora real fue antes o igual a la confirmación.
    function confirmar(registra, cuando) {
      r.procedimientos.push({ hora: cuando, texto: registra.texto + ' (confirmado al recordatorio)', tags: [registra.marca], aprox: true });
    }

    // Lo esencial en SCA que debería estar en la evolución.
    function faltantes() {
      const prox = sinTildes(r.proxima.join(' '));
      const ultimo = Object.assign({}, ...r.signos.map((s) => s.sv));
      const f = [];
      if (!r.proxima.length) f.push('anamnesis próxima');
      else if (r.inicioDolor == null) f.push('hora de inicio del dolor');
      if (!ultimo.eva) f.push('EVA');
      if (!r.remota.length) f.push('antecedentes');
      if (!r.farmacos.length) f.push('fármacos habituales');
      if (!r.alergias.length) f.push('alergias');
      ['pa', 'fc', 'sat'].forEach((k) => { if (!ultimo[k]) f.push({ pa: 'PA', fc: 'FC', sat: 'SatO2' }[k]); });
      if (!r.procedimientos.some((p) => p.tags.includes('ecg'))) f.push('hora del ECG');
      if (!r.analisis.length) f.push('análisis');
      if (!r.plan.length) f.push('plan');
      if (!r.evaluacion.length && !tendencias().length) f.push('evaluación');
      return f;
    }

    // E objetiva: cómo cambió cada parámetro medido más de una vez (solo datos, sin interpretar).
    function tendencias() {
      return SV.filter(([k]) => r.signos.filter((s) => s.sv[k]).length >= 2).map(([k, , , et]) => {
        const serie = r.signos.filter((s) => s.sv[k]);
        return et + ' ' + serie.map((s) => s.sv[k] + ' (' + hhmm(s.hora) + ')').join(' → ');
      });
    }

    // Tiempos del SCA. Metas = garantías de oportunidad GES, problema de salud n.º 5 (auge.minsal.cl):
    //   ECG dentro de 30 min desde la sospecha; trombólisis dentro de 30 min desde la
    //   confirmación diagnóstica de supradesnivel ST. El resto se muestra sin meta (informativo).
    // `aprox`: la hora es la de confirmación al recordatorio (el hecho fue antes o igual).
    function tiemposDetalle() {
      const proc = (m) => r.procedimientos.filter((p) => p.tags.includes(m)).sort((a, b) => a.hora - b.hora)[0];
      const ecg = proc('ecg');
      const fib = proc('fibrinolitico');
      const salida = proc('salida');
      const aviso = proc('aviso-hemodinamia');
      const guia = proc('guia');
      const sospecha = r.clinico.find((e) => e.marca === 'sospecha');
      const dx = r.clinico.find((e) => e.marca === 'diagnostico');
      const t = [];
      const add = (nombre, desde, hasta, meta, aprox, fuente = 'GES') => {
        const min = minutos(desde, hasta);
        t.push({ nombre, min, meta, fuente, aprox: !!aprox, ok: meta == null ? null : min <= meta });
      };
      const hd = opciones.hemodinamia;
      if (r.inicioDolor != null) add('Inicio del dolor → llegada', r.inicioDolor, r.ingreso, null);
      if (ecg) add('Sospecha → ECG', sospecha ? sospecha.hora : r.ingreso, ecg.hora, 30, ecg.aprox);
      if (dx && fib) add('Confirmación diagnóstica → trombólisis', dx.hora, fib.hora, 30, fib.aprox);
      if (fib) add('Puerta-aguja', r.ingreso, fib.hora, null, fib.aprox);
      if (fib && r.inicioDolor != null) add('Inicio del dolor → trombólisis', r.inicioDolor, fib.hora, null);
      // Estrategia invasiva (ESC 2023): no son garantías GES, son metas de guía clínica.
      if (dx && aviso) add('Diagnóstico → aviso a hemodinamia', dx.hora, aviso.hora, null, aviso.aprox);
      if (dx && salida) add('Diagnóstico → salida a pabellón de hemodinamia', dx.hora, salida.hora, null, salida.aprox);
      if (hd === false && salida) add('Puerta de entrada → salida del centro', r.ingreso, salida.hora, 30, salida.aprox, 'ESC');
      if (dx && guia) add('Diagnóstico → paso de la guía', dx.hora, guia.hora, hd === false ? 90 : 60, guia.aprox, 'ESC');
      return t;
    }

    const describirTiempo = (x) => x.nombre + ': ' + (x.aprox ? '≤ ' : '') + x.min + ' min' +
      (x.meta == null ? '' : ' (' + x.fuente + ' ≤ ' + x.meta + ')' + (x.ok ? ' ✓' : ' ✗'));
    const tiempos = () => tiemposDetalle().map(describirTiempo);

    function tiemposVoz() {
      const t = tiemposDetalle().filter((x) => x.meta != null);
      if (!t.length) return r.procedimientos.some((p) => p.tags.includes('ecg'))
        ? 'Sin tiempos con meta todavía.' : 'Aún no tengo la hora del ECG.';
      return t.map((x) => x.nombre.replace(' → ', ' a ') + ', ' + (x.aprox ? 'hasta ' : '') + x.min + ' minutos, ' +
        (x.ok ? 'dentro de' : 'fuera de') + (x.fuente === 'GES' ? 'l GES' : ' la meta')).join('. ') + '.';
    }

    // Borrador en formato SOAPIE, sin diagnósticos de enfermería.
    // Contexto clínico (hitos del equipo médico) va antes de la S; la A es solo análisis de enfermería.
    function evolucion(cuando) {
      const p = r.paciente;
      const quien = [p.sexo ? mayuscula(p.sexo) : 'Paciente', p.edad ? p.edad + ' años' : ''].filter(Boolean).join(', ');
      const fecha = new Date(cuando).toLocaleDateString('es-CL');
      const falta = '[falta registrar]';
      const frases = (xs) => xs.map(sinPunto).join('. ') + '.';
      const L = [];
      L.push('EVOLUCIÓN DE ENFERMERÍA — URGENCIA');
      L.push(fecha + ' · ' + hhmm(cuando) + (p.box ? ' · Box ' + p.box : ''));
      L.push(quien + '. Ingreso ' + hhmm(r.ingreso) + '.');
      // Hitos del equipo médico: contexto, fuera del SOAPIE de enfermería.
      if (r.clinico.length) {
        L.push('', 'Contexto clínico:');
        r.clinico.forEach((e) => L.push('- ' + hhmm(e.hora) + ' ' + sinPunto(e.texto) + '.'));
      }

      L.push('', 'S:');
      L.push('Anamnesis próxima: ' + (r.proxima.length ? frases(r.proxima) : falta));
      L.push('Anamnesis remota: ' + (r.remota.length ? frases(r.remota) : falta));
      L.push('Fármacos habituales: ' + (r.farmacos.length ? frases(r.farmacos) : falta));
      L.push('Alergias: ' + (r.alergias.length ? frases(r.alergias) : falta));
      // La EVA la reporta el paciente: va en S.
      const evas = r.signos.filter((s) => s.sv.eva);
      L.push('Dolor (EVA): ' + (evas.length ? evas.map((s) => s.sv.eva + ' (' + hhmm(s.hora) + ')').join(', ') + '.' : falta));

      L.push('', 'O:');
      const objetivos = r.signos.map((s) => ({ hora: s.hora, sv: Object.fromEntries(Object.entries(s.sv).filter(([k]) => k !== 'eva')) }))
        .filter((s) => Object.keys(s.sv).length);
      if (objetivos.length) objetivos.forEach((s) => L.push('Signos vitales ' + hhmm(s.hora) + ': ' + describirSignos(s.sv) + '.'));
      else L.push('Signos vitales: ' + falta);
      r.objetivo.forEach((x) => L.push(sinPunto(x) + '.'));

      // A: solo el análisis de enfermería dictado.
      L.push('', 'A:');
      L.push(r.analisis.length ? frases(r.analisis) : falta);

      L.push('', 'P:');
      L.push(r.plan.length ? frases(r.plan) : falta);

      L.push('', 'I:');
      if (r.procedimientos.length) {
        // Orden de lectura: de la evaluación inicial a la salida del paciente.
        const orden = ['Monitorización y ECG', 'Accesos venosos y exámenes', 'Fármacos',
          'Preparación, educación y confort', 'Otras intervenciones', 'Coordinación y traslado'];
        const porGrupo = {};
        [...r.procedimientos].sort((a, b) => a.hora - b.hora)
          .forEach((x) => (porGrupo[grupoDe(x.texto)] = porGrupo[grupoDe(x.texto)] || []).push(x));
        orden.filter((g) => porGrupo[g]).forEach((g) => {
          L.push(g + ':');
          porGrupo[g].forEach((x) => L.push('- ' + hhmm(x.hora) + ' ' + sinPunto(x.texto) + '.'));
        });
      } else L.push(falta);
      const t = tiempos();
      if (r.inicioDolor != null) L.push('Inicio del dolor: ' + hhmm(r.inicioDolor) + ' (según anamnesis).');
      if (t.length) { L.push('Tiempos de atención:'); t.forEach((x) => L.push('- ' + x + '.')); }

      L.push('', 'E:');
      r.evaluacion.forEach((x) => L.push(sinPunto(x) + '.'));
      tendencias().forEach((x) => L.push(x + '.'));
      if (!r.evaluacion.length && !tendencias().length) L.push(falta);

      if (r.notas.length) { L.push('', 'Observaciones:'); r.notas.forEach((n) => L.push('- ' + sinPunto(n) + '.')); }
      L.push('', 'Borrador generado a partir de lo dictado. Revisar, completar y firmar.');
      return { texto: L.join('\n'), faltantes: faltantes() };
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
        .concat(r.objetivo.map((x) => 'Objetivo · ' + x))
        .concat(r.analisis.map((x) => 'Análisis · ' + x))
        .concat(r.plan.map((x) => 'Plan · ' + x))
        .concat(r.evaluacion.map((x) => 'Evaluación · ' + x))
        .concat(r.notas.map((x) => 'Nota · ' + x));
    }

    return { datos: r, agregar, evento, evolucion, faltantes, resumen, tiene, confirmar, tiemposDetalle, tiempos, tiemposVoz };
  }

  const API = { interpretar, crear, leerSignos, leerInicio };
  if (typeof module !== 'undefined') module.exports = API;
  else window.PepeRegistro = API;
})();
