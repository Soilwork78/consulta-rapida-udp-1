// ============================================================
// pepe-grillo/motor.js — Interpreta lo que dice la enfermera y
// arma la respuesta de Pepe Grillo (voz breve + tarjeta completa).
//
// Ejemplos de frases:
//   "Pepe, ingresa box 3, hombre de 58 años con dolor torácico, el médico sospecha SCA"
//   "sigue" / "continúa" / "dale" / "avanza" / "qué más" → siguiente punto (la enfermera marca el ritmo)
//   "detente" / "espera" → Pepe se calla y se queda en ese punto hasta que le digan "sigue"
//   "repite" / "anterior"
//   "Pepe, box 3 confirmado IAM con supradesnivel"
//   "Pepe, box 3 descartado SCA"
//
// Sin dependencias ni efectos secundarios: la UI maneja voz y temporizadores.
// ============================================================

(function () {
  const EN_NODE = typeof module !== 'undefined';
  const DC = EN_NODE ? require('./doble-chequeo.js') : window.PepeDobleChequeo;
  const CL = EN_NODE ? require('./checklist.js') : window.PepeChecklist;
  // Protocolos por patología, desde la mirada de enfermería. Por ahora: SCA.
  const PROTOCOLOS = EN_NODE ? { sca: require('./protocolos/sca.js') } : (window.PEPE_PROTOCOLOS || {});
  // Sospechas o diagnósticos de kb.js que se atienden con un protocolo.
  const USA_PROTOCOLO = { sca: 'sca', iamcest: 'sca' };

  const NUMEROS = {
    uno: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10,
    once: 11, doce: 12, trece: 13, catorce: 14, quince: 15, dieciseis: 16, diecisiete: 17,
    dieciocho: 18, diecinueve: 19, veinte: 20,
  };

  function normalizar(texto) {
    return String(texto || '')
      .toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9ñ\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Coincidencia por palabras completas ("ave" no calza con "grave").
  const contiene = (t, frase) => (' ' + t + ' ').includes(' ' + normalizar(frase) + ' ');

  function extraerDatos(t) {
    const datos = {};
    const box = t.match(/\b(?:box|cama|camilla|sala)\s+(\d+|[a-z]+)\b/);
    if (box) {
      const n = /^\d+$/.test(box[1]) ? Number(box[1]) : NUMEROS[box[1]];
      if (n) datos.box = String(n);
    }
    const edad = t.match(/\b(\d{1,3})\s+anos?\b/);
    if (edad) datos.edad = Number(edad[1]);
    if (/\b(hombre|varon|masculino|caballero|senor)\b/.test(t)) datos.sexo = 'hombre';
    else if (/\b(mujer|femenina|femenino|senora|dama)\b/.test(t)) datos.sexo = 'mujer';
    return datos;
  }

  // Navegación: la enfermera marca el ritmo. Frases cortas, con o sin "Pepe" y box.
  const NAV = [
    ['mas', /^(y )?(que mas|mas|dime mas|algo mas|sigue|siguiente|sigamos|siga|continua|continuar|continuemos|dale|avanza|avanzar|adelante|otro|y ahora|listo|ok)$/],
    ['pausa', /^(detente|detente ahi|detenete|pausa|espera|esperate|un momento|momento|stop|silencio|calla|callate|basta)$/],
    ['repetir', /^(repite|repetir|otra vez|de nuevo|como|que)$/],
    ['anterior', /^(anterior|atras|vuelve|el anterior)$/],
    ['porque', /^(por que|porque|explica|explicame|fundamento|y eso)$/],
  ];
  function navegacion(t) {
    const resto = t.replace(/^pepe\s*/, '').replace(/\b(?:box|cama|camilla|sala)\s+\S+/, '').replace(/\bpepe\b/, '').trim();
    const hit = NAV.find(([, re]) => re.test(resto));
    return hit ? hit[0] : null;
  }

  function detectarIntencion(t) {
    const nav = navegacion(t);
    if (nav) return nav;
    if (/\bdescart/.test(t)) return 'descartado';
    if (/\bconfirm/.test(t)) return 'confirmado';
    return 'ingreso';
  }

  function buscarSospecha(t, kb, intencion, motivoDetectado) {
    const cands = [];
    kb.motivos.forEach((motivo) => {
      motivo.diferenciales.forEach((item) =>
        (item.alias || []).forEach((a) => {
          if (contiene(t, a)) cands.push({ tipo: 'diferencial', item, motivo, largo: a.length });
        }));
      motivo.confirmados.forEach((item) =>
        (item.alias || []).forEach((a) => {
          if (contiene(t, a)) cands.push({ tipo: 'confirmado', item, motivo, largo: a.length });
        }));
    });
    const quiere = intencion === 'confirmado' ? 'confirmado' : 'diferencial';
    let pool = cands.filter((c) => c.tipo === quiere);
    if (!pool.length) pool = cands;
    pool.sort((a, b) =>
      (b.largo - a.largo) ||
      ((b.motivo === motivoDetectado) - (a.motivo === motivoDetectado)));
    return pool[0] || null;
  }

  function buscarFase(t) {
    let mejor = null;
    Object.values(PROTOCOLOS).forEach((proto) => proto.fases.forEach((fase) => fase.activadores.forEach((a) => {
      if (contiene(t, a) && (!mejor || a.length > mejor.largo)) mejor = { proto, fase, largo: a.length };
    })));
    return mejor;
  }

  function interpretar(texto, kb) {
    const t = normalizar(texto);
    const intencion = detectarIntencion(t);
    const datos = extraerDatos(t);
    if (NAV.some(([n]) => n === intencion)) return { intencion, ...datos };
    const motivos = kb.motivos.filter((m) => m.activadores.some((a) => contiene(t, a)));
    const sospecha = buscarSospecha(t, kb, intencion, motivos[0]);
    const motivo = sospecha ? sospecha.motivo : motivos[0] || null;
    // Un protocolo se usa si no hay sospecha de otra patología ("dolor torácico, sospecha de TEP" no es SCA).
    const fase = intencion !== 'descartado' && (!sospecha || USA_PROTOCOLO[sospecha.item.id]) ? buscarFase(t) : null;
    return {
      intencion: motivo || fase ? intencion : 'desconocido',
      fase,
      ...datos,
      motivo,
      otrosMotivos: motivos.filter((m) => m !== motivo),
      sospecha,
    };
  }

  // Texto escrito → texto para voz.
  function paraVoz(s) {
    return s
      .replace(/≤/g, ' menor o igual a ').replace(/≥/g, ' mayor o igual a ')
      .replace(/</g, ' menor de ').replace(/>/g, ' mayor de ')
      .replace(/SpO2/g, 'saturación').replace(/×2/g, ' por dos')
      .replace(/β-hCG/g, 'beta H C G').replace(/→/g, ', ')
      .replace(/\s+/g, ' ').trim();
  }

  // "Síndrome coronario agudo (IAMCEST / SCASEST)" → "Síndrome coronario agudo"
  const nombreVoz = (s) => s.replace(/\s*\([^)]*\)/g, '');

  const unir = (items) => items.map((s) => s.replace(/[.\s]+$/, '')).join('. ');

  function describirPaciente(i) {
    const partes = [];
    if (i.box) partes.push('Box ' + i.box);
    const p = [i.sexo, i.edad ? i.edad + ' años' : ''].filter(Boolean).join(' de ');
    if (p) partes.push(p);
    return partes.join(', ');
  }

  function seccionesExamenes(motivo, inst) {
    const basales = motivo.examenes.basales.map((e) => e.ex);
    if (!inst) return [{ titulo: 'Exámenes basales (según indicación)', items: basales }];
    const porProtocolo = basales.filter((e) => inst.enfermeriaPorProtocolo.includes(e));
    const sugerir = basales.filter((e) => !inst.enfermeriaPorProtocolo.includes(e));
    return [
      { titulo: 'Exámenes: tomar por protocolo', items: porProtocolo },
      { titulo: 'Exámenes: sugerir al médico', items: sugerir },
    ];
  }

  const otrosNoPerder = (motivo, excluirId) =>
    motivo.diferenciales.filter((d) => d.noPerder && d.id !== excluirId).map((d) => d.dx);

  // ── Respuestas por intención ──────────────────────────────
  // Cada respuesta trae `intro` (quién y qué) y `pasos`: la lista que Pepe
  // recorre de a uno, en orden de prioridad clínica. La sesión arma `hablar`.

  const lista = (etiqueta, items) => (items.length ? etiqueta + ': ' + items.join(', ') : '');

  function examenesPasos(m, inst) {
    const basales = m.examenes.basales.map((e) => e.ex);
    if (!inst) return [lista('Exámenes basales, según indicación', basales)];
    return [
      lista('Exámenes que tomas por protocolo', basales.filter((e) => inst.enfermeriaPorProtocolo.includes(e))),
      lista('Exámenes para sugerir al médico', basales.filter((e) => !inst.enfermeriaPorProtocolo.includes(e))),
    ];
  }

  function respIngresoSospecha(i, kb, inst) {
    const d = i.sospecha.item;
    const m = i.motivo;
    const local = (inst && inst.tips[d.id]) || [];
    const tips = kb.tips[d.id] || d.discriminantes.map((x) => 'Busca: ' + x);
    const contacto = inst && inst.contactos[d.id];
    const quien = describirPaciente(i);
    return {
      clave: d.id,
      titulo: (quien ? quien + ' · ' : '') + 'Sospecha: ' + d.dx,
      intro: (quien ? quien + '. ' : '') + 'Sospecha de ' + nombreVoz(d.dx) + '.',
      // Lo más urgente primero; el protocolo local justo después.
      pasos: [
        tips[0],
        ...local.map((t) => 'Protocolo local: ' + t),
        ...tips.slice(1),
        'Banderas rojas: ' + m.banderasRojas.join('; '),
        ...examenesPasos(m, inst),
        lista('No olvides descartar', otrosNoPerder(m, d.id)),
        contacto || '',
      ].filter(Boolean),
      secciones: [
        local.length && { titulo: 'Protocolo institucional', items: local, destacar: true },
        contacto && { titulo: 'Contacto', items: [contacto] },
        { titulo: 'Tips', items: tips },
        { titulo: 'Banderas rojas', items: m.banderasRojas, alerta: true },
        ...seccionesExamenes(m, inst),
        { titulo: 'No olvidar descartar', items: otrosNoPerder(m, d.id) },
      ].filter(Boolean),
      hitos: m.hitos,
    };
  }

  function respIngresoMotivo(i, kb, inst) {
    const m = i.motivo;
    const quien = describirPaciente(i);
    const otros = i.otrosMotivos.map((o) => o.nombre);
    return {
      clave: m.id,
      titulo: (quien ? quien + ' · ' : '') + m.nombre,
      intro: (quien ? quien + '. ' : '') + m.nombre + '.' +
        (otros.length ? ' Ojo, también calza con ' + otros.join(' y ') + '.' : ''),
      pasos: [
        ...m.acciones,
        'Banderas rojas: ' + m.banderasRojas.join('; '),
        ...examenesPasos(m, inst),
        lista('No olvides descartar', otrosNoPerder(m)),
        ...i.otrosMotivos.map((o) => lista('Por ' + o.nombre.toLowerCase() + ', descarta también', otrosNoPerder(o))),
        'Cuando el médico tenga una sospecha, dímela',
      ].filter(Boolean),
      secciones: [
        { titulo: 'Acciones inmediatas', items: m.acciones },
        { titulo: 'Banderas rojas', items: m.banderasRojas, alerta: true },
        ...seccionesExamenes(m, inst),
        { titulo: 'Diferenciales que no se pueden perder', items: otrosNoPerder(m) },
        i.otrosMotivos.length && {
          titulo: 'También calza con', alerta: true,
          items: i.otrosMotivos.map((o) => o.nombre + ': ' + otrosNoPerder(o).join(', ')),
        },
      ].filter(Boolean),
      hitos: m.hitos,
    };
  }

  function respConfirmado(i, kb, inst) {
    const c = i.sospecha.item;
    const local = (inst && inst.tips[c.id]) || [];
    const contacto = inst && inst.contactos[c.id];
    const quien = describirPaciente(i);
    return {
      clave: c.id,
      titulo: (quien ? quien + ' · ' : '') + 'Confirmado: ' + c.nombre,
      intro: (quien ? quien + ': ' : '') + 'confirmado ' + nombreVoz(c.nombre) + '.',
      pasos: [
        c.algoritmo[0],
        ...local.map((t) => 'Protocolo local: ' + t),
        ...c.algoritmo.slice(1),
        ...(c.examenes || []).map((e) => e.ex + ': ' + e.det),
        contacto || '',
      ].filter(Boolean),
      secciones: [
        local.length && { titulo: 'Protocolo institucional', items: local, destacar: true },
        contacto && { titulo: 'Contacto', items: [contacto] },
        { titulo: 'Algoritmo', items: c.algoritmo },
        c.examenes && { titulo: 'Exámenes específicos', items: c.examenes.map((e) => e.ex + ': ' + e.det) },
      ].filter(Boolean),
      hitos: c.hitos,
    };
  }

  function respDescartado(i) {
    const d = i.sospecha.item;
    const nombre = d.dx || d.nombre;
    const pendientes = otrosNoPerder(i.motivo, d.id);
    const quien = describirPaciente(i);
    return {
      clave: null,
      titulo: (quien ? quien + ' · ' : '') + 'Descartado: ' + nombre,
      intro: 'Descartado ' + nombreVoz(nombre) + '. Cancelo sus recordatorios.',
      pasos: [lista('Aún quedan por descartar', pendientes)].filter(Boolean),
      secciones: [{ titulo: 'Aún por descartar', items: pendientes, alerta: true }],
      hitos: [],
      detenerHitos: true,
    };
  }

  function respFase(i, kb, inst) {
    const { proto, fase } = i.fase;
    const clave = fase.claveInstitucional;
    const local = (inst && inst.tips[clave]) || [];
    const contacto = inst && (inst.contactos[clave] || inst.contactos[proto.id]);
    const quien = describirPaciente(i);
    const corte = fase.localDespuesDe || 1;
    const primeros = fase.pasos.slice(0, corte);
    const resto = fase.pasos.slice(corte);
    // En el primer contacto, lo que no se puede perder del dolor torácico.
    const dolor = kb.motivos.find((m) => m.id === 'dolor-toracico');
    const descartar = fase.id === 'primer-contacto' && dolor ? otrosNoPerder(dolor, 'sca') : [];
    const pasos = [
      ...primeros,
      ...local.map((t) => ({ voz: 'Protocolo local: ' + t, porque: 'Es el protocolo vigente de esta institución.' })),
      ...resto,
      descartar.length && { voz: lista('No olvides descartar', descartar),
        porque: 'Comparten el dolor torácico y algunos se agravan con antitrombóticos, como la disección aórtica.' },
      contacto && { voz: contacto, porque: 'Contacto definido por la institución.' },
    ].filter(Boolean);
    return {
      clave: proto.id + ':' + fase.id,
      titulo: (quien ? quien + ' · ' : '') + 'SCA · ' + fase.nombre,
      intro: (quien ? quien + '. ' : '') + fase.intro,
      pasos: pasos.map((p) => p.voz),
      porques: pasos.map((p) => p.porque || ''),
      secciones: [
        local.length && { titulo: 'Protocolo institucional', items: local, destacar: true },
        contacto && { titulo: 'Contacto', items: [contacto] },
        { titulo: 'Pasos de enfermería', items: fase.pasos.map((p) => p.voz + (p.detalle ? ' — ' + p.detalle : '')) },
        descartar.length && { titulo: 'No olvidar descartar', items: descartar, alerta: true },
        fase.id === 'primer-contacto' && {
          titulo: 'Proceso de enfermería',
          items: proto.procesoEnfermeria.map((d) => d.dx + ': ' + d.intervenciones.join('; ') + '. Meta: ' + d.resultado),
        },
      ].filter(Boolean),
      hitos: fase.hitos,
    };
  }

  function responder(i, kb, inst) {
    if (i.intencion === 'desconocido') {
      return {
        clave: null, titulo: 'No entendí',
        intro: 'No te entendí. Dime el motivo de consulta o la sospecha del médico.',
        pasos: [], secciones: [], hitos: [],
      };
    }
    if (i.fase) return respFase(i, kb, inst);
    if (i.intencion === 'confirmado' && i.sospecha && i.sospecha.tipo === 'confirmado') return respConfirmado(i, kb, inst);
    if (i.intencion === 'descartado' && i.sospecha) return respDescartado(i);
    if (i.sospecha && i.sospecha.tipo === 'diferencial') return respIngresoSospecha(i, kb, inst);
    if (i.sospecha) return respConfirmado(i, kb, inst);
    return respIngresoMotivo(i, kb, inst);
  }

  // Texto que Pepe dice para el paso `n` de una respuesta.
  function decirPaso(r, n, box, primeraVez) {
    if (n >= r.pasos.length) {
      const aviso = r.hitos.length ? ' Te aviso al minuto ' + r.hitos[0].min + '.' : '';
      return paraVoz('Eso es todo' + (box && box !== '—' ? ' para el box ' + box : '') + '.' + aviso);
    }
    const texto = n === 0 ? r.intro + ' ' + r.pasos[0] : r.pasos[n];
    const ayuda = primeraVez && r.pasos.length > 1 ? ' Cuando quieras, dime sigue.' : '';
    return paraVoz(texto.replace(/[.\s]+$/, '') + '.' + ayuda);
  }

  // Sesión con varios pacientes: recuerda, por box, la respuesta y en qué
  // paso va, para "sigue"/"repite"/"anterior" y para heredar datos del paciente.
  function crearSesion(kb, inst) {
    const porBox = {};
    let ultimoBox = '—';
    let chequeo = null; // diálogo de doble chequeo en curso
    let yaExplicado = false; // "dime sigue" se explica solo la primera vez
    return {
      get enDialogo() { return !!(chequeo && chequeo.activo); },
      procesar(texto) {
        // 0. "Detente": Pepe se calla y conserva el punto (y el diálogo, si hay uno).
        if (navegacion(normalizar(texto)) === 'pausa') {
          const b = extraerDatos(normalizar(texto)).box || (chequeo && chequeo.activo ? chequeo.box : ultimoBox);
          const previo = porBox[b];
          return { box: b, interpretacion: { intencion: 'pausa' }, respuesta: {
            ...(previo ? previo.respuesta : { clave: null, titulo: 'En pausa', intro: '', pasos: [], secciones: [] }),
            hitos: [], pausa: true, hablar: '',
            paso: previo ? Math.min(previo.cursor + 1, previo.respuesta.pasos.length) : 0,
            total: previo ? previo.respuesta.pasos.length : 0,
          } };
        }
        // 1. Diálogo en curso: la respuesta va directo, sin "Pepe".
        if (chequeo && chequeo.activo) {
          const respuesta = chequeo.responder(texto);
          return { box: chequeo.box, interpretacion: { intencion: 'dialogo' }, respuesta };
        }
        // 2. Checklist de contraindicaciones de fibrinólisis.
        if (CL && PROTOCOLOS.sca && CL.detectar(texto)) {
          const box = extraerDatos(normalizar(texto)).box || ultimoBox;
          ultimoBox = box;
          chequeo = CL.crear(PROTOCOLOS.sca, box === '—' ? null : box);
          return { box, interpretacion: { intencion: 'dialogo' }, respuesta: chequeo.iniciar() };
        }
        // 3. Inicio de doble chequeo: "Pepe, doble chequeo de heparina, box 3".
        const medId = DC && DC.detectar(texto, kb);
        if (medId) {
          const box = extraerDatos(normalizar(texto)).box || ultimoBox;
          ultimoBox = box;
          chequeo = DC.crear(medId, kb, inst, box === '—' ? null : box);
          chequeo.box = box;
          return { box, interpretacion: { intencion: 'dialogo' }, respuesta: chequeo.iniciar() };
        }
        const i = interpretar(texto, kb);
        const box = i.box || ultimoBox;
        ultimoBox = box;
        const previo = porBox[box];

        // Navegación por los pasos: la enfermera marca el ritmo.
        if (['mas', 'repetir', 'anterior', 'porque'].includes(i.intencion)) {
          if (!previo) {
            return { box, interpretacion: i, respuesta: {
              clave: null, titulo: 'Sin paciente', intro: '', pasos: [], secciones: [], hitos: [],
              hablar: 'No tengo un paciente activo' + (box !== '—' ? ' en el box ' + box : '') + '.' } };
          }
          const total = previo.respuesta.pasos.length;
          if (i.intencion === 'mas') previo.cursor = Math.min(previo.cursor + 1, total);
          if (i.intencion === 'anterior') previo.cursor = Math.max(previo.cursor - 1, 0);
          const fundamento = previo.respuesta.porques && previo.respuesta.porques[Math.min(previo.cursor, total - 1)];
          return { box, interpretacion: i, respuesta: {
            ...previo.respuesta, hitos: [],
            paso: Math.min(previo.cursor + 1, total), total,
            hablar: i.intencion === 'porque'
              ? paraVoz(fundamento || 'No tengo el fundamento de este punto todavía.')
              : decirPaso(previo.respuesta, previo.cursor, box, false),
          } };
        }

        // Mismo paciente salvo que la frase diga "ingresa": hereda sus datos.
        if (previo && !/\bingres/.test(normalizar(texto))) {
          if (!i.box) i.box = previo.interpretacion.box;
          if (!i.edad) i.edad = previo.interpretacion.edad;
          if (!i.sexo) i.sexo = previo.interpretacion.sexo;
        }
        const r = responder(i, kb, inst);
        const primeraVez = !yaExplicado && r.pasos.length > 1;
        if (primeraVez) yaExplicado = true;
        const respuesta = { ...r, paso: r.pasos.length ? 1 : 0, total: r.pasos.length,
          hablar: r.pasos.length ? decirPaso(r, 0, box, primeraVez) : paraVoz(r.intro) };
        if (i.intencion !== 'desconocido') porBox[box] = { interpretacion: i, respuesta: r, cursor: 0 };
        return { box, interpretacion: i, respuesta };
      },
    };
  }

  const esNavegacion = (texto) => !!navegacion(normalizar(texto));
  const API = { normalizar, interpretar, responder, crearSesion, paraVoz, esNavegacion, PROTOCOLOS };
  if (typeof module !== 'undefined') module.exports = API;
  else window.PepeMotor = API;
})();
