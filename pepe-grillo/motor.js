// ============================================================
// pepe-grillo/motor.js — Interpreta lo que dice la enfermera y
// arma la respuesta de Pepe Grillo (voz breve + tarjeta completa).
//
// Ejemplos de frases:
//   "Pepe, ingresa box 3, hombre de 58 años con dolor torácico, el médico sospecha SCA"
//   "Pepe, más"
//   "Pepe, box 3 confirmado IAM con supradesnivel"
//   "Pepe, box 3 descartado SCA"
//
// Sin dependencias ni efectos secundarios: la UI maneja voz y temporizadores.
// ============================================================

(function () {
  const TIPS_HABLADOS = 3;

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

  function detectarIntencion(t) {
    const sinPepe = t.replace(/^pepe\s*/, '');
    if (/^(dime |que |algo )?mas\b/.test(sinPepe) && sinPepe.split(' ').length <= 4) return 'mas';
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

  function interpretar(texto, kb) {
    const t = normalizar(texto);
    const intencion = detectarIntencion(t);
    const datos = extraerDatos(t);
    if (intencion === 'mas') return { intencion, ...datos };
    const motivos = kb.motivos.filter((m) => m.activadores.some((a) => contiene(t, a)));
    const sospecha = buscarSospecha(t, kb, intencion, motivos[0]);
    const motivo = sospecha ? sospecha.motivo : motivos[0] || null;
    return {
      intencion: motivo ? intencion : 'desconocido',
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

  function respIngresoSospecha(i, kb, inst) {
    const d = i.sospecha.item;
    const m = i.motivo;
    const local = (inst && inst.tips[d.id]) || [];
    const tips = kb.tips[d.id] || d.discriminantes.map((x) => 'Busca: ' + x);
    const contacto = inst && inst.contactos[d.id];
    const quien = describirPaciente(i);
    const hablar = [
      (quien ? quien + '. ' : '') + 'Sospecha de ' + nombreVoz(d.dx),
      local.length ? 'Protocolo local: ' + unir(local) : '',
      'Recuerda: ' + unir(tips.slice(0, TIPS_HABLADOS)),
      m.hitos.length ? 'Te aviso al minuto ' + m.hitos[0].min : '',
      tips.length > TIPS_HABLADOS ? 'Di Pepe, más, para el resto' : '',
    ].filter(Boolean);
    return {
      clave: d.id,
      titulo: (quien ? quien + ' · ' : '') + 'Sospecha: ' + d.dx,
      hablar: paraVoz(unir(hablar) + '.'),
      mas: paraVoz(unir([
        tips.length > TIPS_HABLADOS ? 'Además: ' + unir(tips.slice(TIPS_HABLADOS)) : '',
        'No olvides descartar: ' + otrosNoPerder(m, d.id).join(', '),
        contacto || '',
      ].filter(Boolean)) + '.'),
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
    const hablar = [
      (quien ? quien + '. ' : '') + m.nombre,
      i.otrosMotivos.length ? 'Ojo, también calza con ' + i.otrosMotivos.map((o) => o.nombre).join(' y ') : '',
      'Recuerda: ' + unir(m.acciones.slice(0, TIPS_HABLADOS)),
      'Banderas rojas: ' + unir(m.banderasRojas.slice(0, 2)),
      'Cuando el médico tenga una sospecha, dímela',
    ].filter(Boolean);
    return {
      clave: m.id,
      titulo: (quien ? quien + ' · ' : '') + m.nombre,
      hablar: paraVoz(unir(hablar) + '.'),
      mas: paraVoz(unir([
        'Además: ' + unir(m.acciones.slice(TIPS_HABLADOS)),
        'No olvides descartar: ' + otrosNoPerder(m).join(', '),
      ]) + '.'),
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
    const hablar = [
      (quien ? quien + ': ' : '') + 'confirmado ' + nombreVoz(c.nombre),
      local.length ? 'Protocolo local: ' + unir(local) : '',
      'Pasos: ' + unir(c.algoritmo.slice(0, TIPS_HABLADOS)),
      c.hitos.length ? 'Te aviso al minuto ' + c.hitos[0].min : '',
    ].filter(Boolean);
    return {
      clave: c.id,
      titulo: (quien ? quien + ' · ' : '') + 'Confirmado: ' + c.nombre,
      hablar: paraVoz(unir(hablar) + '.'),
      mas: paraVoz(unir([
        'Además: ' + unir(c.algoritmo.slice(TIPS_HABLADOS)),
        contacto || '',
      ].filter(Boolean)) + '.'),
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
      hablar: paraVoz('Descartado ' + nombreVoz(nombre) + '. Aún quedan por descartar: ' + pendientes.join(', ') + '.'),
      mas: '',
      secciones: [{ titulo: 'Aún por descartar', items: pendientes, alerta: true }],
      hitos: [],
      detenerHitos: true,
    };
  }

  function responder(i, kb, inst) {
    if (i.intencion === 'desconocido') {
      return {
        clave: null, titulo: 'No entendí',
        hablar: 'No te entendí. Dime el motivo de consulta o la sospecha del médico.',
        mas: '', secciones: [], hitos: [],
      };
    }
    if (i.intencion === 'confirmado' && i.sospecha && i.sospecha.tipo === 'confirmado') return respConfirmado(i, kb, inst);
    if (i.intencion === 'descartado' && i.sospecha) return respDescartado(i);
    if (i.sospecha && i.sospecha.tipo === 'diferencial') return respIngresoSospecha(i, kb, inst);
    if (i.sospecha) return respConfirmado(i, kb, inst);
    return respIngresoMotivo(i, kb, inst);
  }

  // Sesión con varios pacientes: recuerda el contexto de cada box
  // para "Pepe, más" y para heredar el motivo en "confirmado"/"descartado".
  function crearSesion(kb, inst) {
    const porBox = {};
    let ultimoBox = '—';
    return {
      procesar(texto) {
        const i = interpretar(texto, kb);
        const box = i.box || ultimoBox;
        ultimoBox = box;
        const previo = porBox[box];
        if (i.intencion === 'mas') {
          const r = previo && previo.respuesta;
          return {
            box, interpretacion: i,
            respuesta: r && r.mas
              ? { ...r, hablar: r.mas, mas: '', hitos: [] }
              : { clave: null, titulo: 'Sin contexto', hablar: 'No tengo más para este paciente.', mas: '', secciones: [], hitos: [] },
          };
        }
        if (previo && i.intencion !== 'ingreso') {
          if (!i.box) i.box = previo.interpretacion.box;
          if (!i.edad) i.edad = previo.interpretacion.edad;
          if (!i.sexo) i.sexo = previo.interpretacion.sexo;
        }
        const respuesta = responder(i, kb, inst);
        if (i.intencion !== 'desconocido') porBox[box] = { interpretacion: i, respuesta };
        return { box, interpretacion: i, respuesta };
      },
    };
  }

  const API = { normalizar, interpretar, responder, crearSesion, paraVoz };
  if (typeof module !== 'undefined') module.exports = API;
  else window.PepeMotor = API;
})();
