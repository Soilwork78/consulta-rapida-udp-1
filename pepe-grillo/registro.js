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
//   "redacta la evolución"                     → borrador de la visita de enfermería (sin diagnósticos de enfermería;
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
  // Minúscula inicial salvo siglas (ECG, RHA).
  const minuscula = (s) => (/^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]/.test(s) ? s.charAt(0).toLowerCase() + s.slice(1) : s);
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
    ['riesgos', /^(braden|downton|norton|riesgo\s+de)\b/i, 'todo'],
    ['riesgos', /^(evaluaci[oó]n\s+de\s+riesgos?|riesgos?)\s*[:,.]?\s*/i, 'resto'],
    ['pendientes', /^(queda(n)?\s+pendientes?|pendientes?)\s*[:,.]?\s*/i, 'resto'],
    ['dispositivos', /^dispositivos?(\s+invasivos?)?\s*[:,.]?\s*/i, 'resto'],
    ['neuro', /^(neurol[oó]gico|estado\s+de\s+conciencia|nivel\s+de\s+conciencia|conciencia)\s*[:,.]?\s*/i, 'resto'],
    ['neuro', /^(l[uú]cid|vigil|somnolient|soporos|desorientad|orientad|consciente|conciente|glasgow)/i, 'todo'],
    ['metabolico', /^(alimentaci[oó]n|metab[oó]lico|nutrici[oó]n)\s*[:,.]?\s*/i, 'resto'],
    ['metabolico', /^(r[eé]gimen|ayuno)\b/i, 'todo'],
    ['objetivo', /^(diuresis|deposiciones|eliminaci[oó]n|piel\b)/i, 'todo'],
    ['psicosocial', /^(psicosocial|estado\s+emocional)\s*[:,.]?\s*/i, 'resto'],
    ['psicosocial', /^(an[ií]micamente|emocionalmente|ansios|angustiad|tranquil|familia\b)/i, 'todo'],
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
    ['Monitorización y ECG', /\becg\b|electrocardiograma|monitor|desfibrilador|pulsos?\b|\bv3r|\bv4r|marcapaso/],
    ['Accesos venosos y exámenes', /\bvia\b|vvp|cateter|\bbic\b|troponina|examen|examenes|muestra|hemograma|creatinina|gases|\bhgt\b|glicemia|orina/],
    ['Preparación, educación y confort', /educa|familia|reposo|confort|protesis|joyas|consentimiento|posicion|contencion/],
  ];
  const grupoDe = (texto) => (GRUPOS_I.find(([, re]) => re.test(sinTildes(texto))) || ['Otras intervenciones'])[0];

  // Hora dicha en la frase ("tomé ECG a las 10:05", "hace 10 minutos"): la más reciente que no sea futura,
  // dentro de las últimas 12 horas. Devuelve { hora, texto sin la hora } o null.
  function horaDictada(texto, cuando) {
    const t = sinTildes(texto);
    const m = t.match(/\ba las (\d{1,2})(?:\s*(?::|\.|h)\s*(\d{2}))?(?:\s*(?:hrs?|horas))?\b/);
    let hora = null;
    if (m && Number(m[1]) < 24 && Number(m[2] || 0) < 60) {
      const candidatos = [];
      [0, -1].forEach((dia) => [Number(m[1]), Number(m[1]) + 12].filter((h) => h < 24).forEach((h) => {
        const d = new Date(cuando); d.setDate(d.getDate() + dia); d.setHours(h, Number(m[2] || 0), 0, 0);
        candidatos.push(d.getTime());
      }));
      const validos = candidatos.filter((c) => c <= cuando && cuando - c <= 12 * 3600000);
      if (validos.length) hora = Math.max(...validos);
    }
    const h = t.match(/\bhace\s+(\d+|un|una|media)\s*(minutos?|min|horas?)\b/);
    if (hora == null && h) {
      const n = h[1] === 'media' ? 0.5 : /^un/.test(h[1]) ? 1 : Number(h[1]);
      const ms = n * (/^h/.test(h[2]) ? 3600000 : 60000);
      if (ms <= 12 * 3600000) hora = cuando - ms;
    }
    if (hora == null) return null;
    // Se quita la hora del texto (va al inicio de la línea); la frase se busca sin tildes, con el mismo largo.
    const re = m && hora != null && !h ? /\s*,?\s*\ba las \d{1,2}(?:\s*(?::|\.|h)\s*\d{2})?(?:\s*(?:hrs?|horas))?\b/i
      : /\s*,?\s*\bhace\s+(?:\d+|un|una|media)\s*(?:minutos?|min|horas?)\b/i;
    const i = sinTildes(texto).search(re);
    const largo = i < 0 ? 0 : sinTildes(texto).slice(i).match(re)[0].length;
    return { hora, texto: i < 0 ? texto : (texto.slice(0, i) + texto.slice(i + largo)).trim() };
  }

  // ── Interpretación de signos vitales (adulto) ──
  // Valor exacto + interpretación, como pide la pauta: "taquicárdico (FC 102 lpm)".
  const adjetivo = (sexo) => (sexo === 'mujer' ? 'a' : sexo === 'hombre' ? 'o' : 'o/a');
  const num = (v) => parseFloat(String(v).replace(',', '.'));
  function interpretar1(k, medicion, o) {
    const v = medicion.sv[k];
    const h = ', ' + hhmm(medicion.hora);
    if (k === 'fc') {
      const n = num(v);
      return (n < 60 ? 'bradicárdic' + o : n > 100 ? 'taquicárdic' + o : 'normocárdic' + o) + ' (FC ' + v + h + ')';
    }
    if (k === 'pa') {
      const [pas, pad] = v.split(/[/ ]/).map(Number);
      return (pas < 90 ? 'hipotens' + o : pas >= 140 || pad >= 90 ? 'hipertens' + o : 'normotens' + o) + ' (PA ' + v + h + ')';
    }
    if (k === 'fr') {
      const n = num(v);
      return (n < 12 ? 'bradipneic' + o : n > 20 ? 'taquipneic' + o : 'eupneic' + o) + ' (FR ' + v + h + ')';
    }
    if (k === 'sat') {
      const n = num(v);
      return 'saturando ' + v + ' (' + hhmm(medicion.hora) + ')' + (n < 90 ? ', con hipoxemia' : '');
    }
    if (k === 't') {
      const n = num(v);
      return (n < 36 ? 'hipotérmic' + o : n >= 38 ? 'febril' : n >= 37.5 ? 'subfebril' : 'afebril') + ' (T° ' + v + h + ')';
    }
    if (k === 'hgt') {
      const n = num(v);
      return 'HGT ' + v + ' (' + hhmm(medicion.hora) + ')' + (n < 70 ? ', hipoglicemia' : n > 180 ? ', hiperglicemia' : '');
    }
    return '';
  }

  // ── Examen físico en orden céfalo-caudal ──
  // Cada hallazgo dictado se ubica por segmento; los que no calzan van al final.
  const SEGMENTOS = [
    /piel|mucosa|diafor|palid|cianosi|sudor|hidratad|llene capilar|llenado capilar|perfusi|ictericia|marmore/,
    /cabeza|pupil|isocor|craneo|ojo|conjuntiv|boca|labio|facie/,
    /cuello|yugular|ingurgit|tiroide|traquea/,
    /torax|murmullo|crepit|sibil|roncus|ruidos cardiacos|soplo|pulmon|mama|tiraje/,
    /abdomen|rha|hidroaereo|blando|depresible|distendid|globo vesical/,
    /diuresis|orina|sonda|genital|deposicion/,
    /extremidad|edema|pulso|pedio|radial|eeii|eess|medias|\bmae\b/,
    /dorso|sacro|\blpp\b|talon|lesion por presion/,
  ];
  function cefaloCaudal(entradas) {
    const partes = [];
    entradas.forEach((x) => x.split(/\s*[.;]\s+|\s*,\s+/).map(sinPunto).filter(Boolean).forEach((h) => partes.push(h)));
    const seg = (h) => { const k = SEGMENTOS.findIndex((re) => re.test(sinTildes(h))); return k < 0 ? SEGMENTOS.length : k; };
    return partes.map((h, i) => ({ h, i, s: seg(h) })).sort((a, b) => a.s - b.s || a.i - b.i)
      .map((x, i) => (i === 0 ? mayuscula(x.h) : minuscula(x.h))).join(', ') + '.';
  }

  // Dispositivos invasivos que salen de los procedimientos dictados.
  const DISPOSITIVO = /\bvia venosa|\bvvp\b|cateter|\bcvc\b|linea arterial|sonda|\bbic\b/;

  const hhmm = (ms) => new Date(ms).toTimeString().slice(0, 5);
  const minutos = (a, b) => Math.round((b - a) / 60000);

  // opciones.hemodinamia: true si el centro tiene hemodinamia de turno (meta ESC 60 min al paso de la guía);
  // false si hay que trasladar (meta 90 min, y puerta de entrada → salida ≤ 30 min). Sin dato: se muestran ambas.
  function crear(ahora, opciones = {}) {
    const r = {
      ingreso: ahora, paciente: {}, clinico: [], proxima: [], remota: [], farmacos: [],
      alergias: [], signos: [], procedimientos: [], notas: [],
      neuro: [], metabolico: [], psicosocial: [], riesgos: [], pendientes: [], dispositivos: [],
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
        const dicha = horaDictada(texto, cuando);
        const hora = dicha ? dicha.hora : cuando;
        r.procedimientos.push({ hora, texto: impersonal(dicha ? dicha.texto : texto), tags, horaDicha: !!dicha });
        return 'Anotado, ' + hhmm(hora) + '.';
      }
      if (tipo === 'proxima') {
        r.proxima.push(texto);
        if (r.inicioDolor == null) r.inicioDolor = leerInicio(texto, r.ingreso);
        const sv = leerSignos(texto);
        if (sv.eva) r.signos.push({ hora: cuando, sv: { eva: sv.eva } });
        return 'Anotado en anamnesis próxima.';
      }
      const destino = { remota: 'remota', alergias: 'alergias', farmacos: 'farmacos', nota: 'notas',
        objetivo: 'objetivo', analisis: 'analisis', plan: 'plan', evaluacion: 'evaluacion', neuro: 'neuro',
        metabolico: 'metabolico', psicosocial: 'psicosocial', riesgos: 'riesgos', pendientes: 'pendientes',
        dispositivos: 'dispositivos' }[tipo];
      r[destino].push(texto);
      return { remota: 'Anotado en anamnesis remota.', alergias: 'Alergias anotadas.',
        farmacos: 'Fármacos anotados.', notas: 'Nota anotada.', objetivo: 'Anotado en examen físico.',
        analisis: 'Anotado en análisis.', plan: 'Anotado en plan.', evaluacion: 'Anotado en evaluación.',
        neuro: 'Anotado en estado neurológico.', metabolico: 'Anotado en alimentación y metabólico.',
        psicosocial: 'Anotado en respuesta emocional y familia.', riesgos: 'Riesgos anotados.',
        pendientes: 'Pendiente anotado.', dispositivos: 'Dispositivo anotado.' }[destino];
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
      if (!r.neuro.length) f.push('estado neurológico');
      if (!r.riesgos.length) f.push('evaluación de riesgos');
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

    // Borrador de la evolución (visita de enfermería), sin diagnósticos de enfermería.
    // Criterios transversales (Potter-Perry; Kozier; guía Visita de Enfermería, Cuidados de Enfermería II 2026):
    // inicia con fecha, hora y turno; identifica al paciente y su diagnóstico médico actual; la valoración sigue
    // el orden neurológico → hemodinamia → ventilación → dolor → alimentación/metabólico → examen físico
    // céfalo-caudal; los signos vitales van con su valor exacto y su interpretación; describe las intervenciones
    // y la respuesta del paciente; cierra con dispositivos invasivos, evaluación de riesgos y pendientes, y
    // termina con firma y nombre del autor. No incluye indicaciones médicas. Pepe no inventa: lo que falta
    // queda como [falta registrar].
    function evolucion(cuando) {
      const p = r.paciente;
      const falta = '[falta registrar]';
      const frases = (xs) => xs.map(sinPunto).map(mayuscula).join('. ') + '.';
      const L = [];
      const d = new Date(cuando);
      const dia = d.toLocaleDateString('es-CL', { weekday: 'long' });
      const fecha = [d.getDate(), d.getMonth() + 1].map((n) => String(n).padStart(2, '0')).join('/') + '/' + d.getFullYear();
      const turno = d.getHours() >= 8 && d.getHours() < 20 ? 'diurno' : 'nocturno';
      L.push('EVOLUCIÓN DE ENFERMERÍA — URGENCIA');
      L.push('Evolución de enfermería ' + dia + ' ' + fecha + ' a las ' + hhmm(cuando) + ' hrs, turno ' + turno +
        (p.box ? ', box ' + p.box : '') + '.');
      const quien = [p.sexo ? mayuscula(p.sexo) : 'Paciente', p.edad ? p.edad + ' años' : ''].filter(Boolean).join(', ');
      L.push(quien + '. Nombre y RUT: [completar en ficha]. Ingreso ' + hhmm(r.ingreso) + ' hrs.');
      L.push('Diagnóstico médico actual: ' + (r.diagnostico || falta) + '.');
      // Hitos del equipo médico, en orden: contexto de la atención.
      if (r.clinico.length) {
        L.push('', 'Contexto clínico:');
        r.clinico.forEach((e) => L.push('- ' + hhmm(e.hora) + ' ' + sinPunto(e.texto) + '.'));
      }

      L.push('', 'Anamnesis:');
      L.push('Anamnesis próxima: ' + (r.proxima.length ? frases(r.proxima) : falta));
      L.push('Antecedentes: ' + (r.remota.length ? frases(r.remota) : falta));
      L.push('Fármacos habituales: ' + (r.farmacos.length ? frases(r.farmacos) : falta));
      L.push('Alergias: ' + (r.alergias.length ? frases(r.alergias) : falta));

      // Valoración en el orden de la visita de enfermería.
      L.push('', 'Valoración:');
      const ultimo = (k) => [...r.signos].reverse().find((s) => s.sv[k]);
      const o = adjetivo(p.sexo);
      L.push('Neurológico: ' + (r.neuro.length ? frases(r.neuro) : falta));
      const hemo = ['pa', 'fc'].map((k) => ultimo(k) && interpretar1(k, ultimo(k), o)).filter(Boolean);
      const temp = ultimo('t');
      if (temp) hemo.push(interpretar1('t', temp, o));
      L.push('Hemodinámico: ' + (hemo.length ? mayuscula(hemo.join(', ')) + '.' : falta));
      const vent = ['fr', 'sat'].map((k) => ultimo(k) && interpretar1(k, ultimo(k), o)).filter(Boolean);
      L.push('Ventilatorio: ' + (vent.length ? mayuscula(vent.join(', ')) + '.' : falta));
      const evas = r.signos.filter((s) => s.sv.eva);
      L.push('Dolor: ' + (evas.length ? 'EVA ' + evas.map((s) => s.sv.eva + ' (' + hhmm(s.hora) + ')').join(', ') + '.' : falta));
      const hgt = ultimo('hgt');
      const meta = [...(hgt ? [interpretar1('hgt', hgt, o)] : []), ...r.metabolico.map(sinPunto)];
      L.push('Alimentación y metabólico: ' + (meta.length ? mayuscula(meta.join('. ')) + '.' : falta));
      L.push('Examen físico (céfalo-caudal): ' + (r.objetivo.length ? cefaloCaudal(r.objetivo) : falta));
      if (r.psicosocial.length) L.push('Respuesta emocional y familia: ' + frases(r.psicosocial));

      L.push('', 'Intervenciones de enfermería:');
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

      // Respuesta del paciente: lo dictado y la evolución objetiva de lo medido más de una vez.
      L.push('', 'Respuesta y evolución:');
      r.evaluacion.forEach((x) => L.push(mayuscula(sinPunto(x)) + '.'));
      tendencias().forEach((x) => L.push(x + '.'));
      if (!r.evaluacion.length && !tendencias().length) L.push(falta);

      // Pensamiento crítico de enfermería: solo lo dictado.
      L.push('', 'Análisis y plan de enfermería:');
      L.push(r.analisis.length ? frases(r.analisis) : 'Análisis: ' + falta);
      L.push(r.plan.length ? frases(r.plan) : 'Plan: ' + falta);

      // Cierre de la visita: dispositivos invasivos, riesgos y pendientes.
      L.push('', 'Cierre:');
      const disp = [...r.dispositivos.map(sinPunto),
        ...r.procedimientos.filter((x) => DISPOSITIVO.test(sinTildes(x.texto))).map((x) => sinPunto(x.texto) + ' (' + hhmm(x.hora) + ')')];
      L.push('Dispositivos invasivos: ' + (disp.length ? disp.map(mayuscula).join('; ') + '.' : falta));
      L.push('Evaluación de riesgos: ' + (r.riesgos.length ? frases(r.riesgos) : falta));
      L.push('Exámenes y pendientes: ' + (r.pendientes.length ? frases(r.pendientes) : 'sin pendientes registrados.'));

      if (r.notas.length) { L.push('', 'Observaciones:'); r.notas.forEach((n) => L.push('- ' + mayuscula(sinPunto(n)) + '.')); }
      L.push('', 'Firma: ____________________   Nombre y título profesional: ____________________');
      L.push('Borrador generado a partir de lo dictado. Revisar, completar y firmar.');
      const avisos = vacias();
      return { texto: L.join('\n'), faltantes: faltantes(), avisos };
    }

    // Frases generales y vacías que la guía pide evitar.
    function vacias() {
      const todo = [...r.neuro, ...r.objetivo, ...r.evaluacion, ...r.analisis, ...r.notas, ...r.psicosocial];
      return todo.some((x) => /\b(sin cambios|sin novedad(es)?|buen dia|buena tarde|buena noche|igual que antes)\b/.test(sinTildes(x)))
        ? ['Evita frases generales como "sin cambios": describe lo que valoraste.'] : [];
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
