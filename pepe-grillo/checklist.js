// ============================================================
// pepe-grillo/checklist.js — Checklist guiado de sí / no.
// Uso actual: contraindicaciones de fibrinólisis.
// Un "sí" a una contraindicación absoluta detiene el checklist.
// "No sé" deja la pregunta como pendiente de verificar.
// ============================================================

(function () {
  const limpiar = (t) => ' ' + String(t || '').toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9ñ\s]/g, ' ').replace(/\s+/g, ' ').trim() + ' ';
  const NO_SE = /\s(no se|no lo se|no sabe|desconoce|sin dato|no hay dato)\s/;
  const SI = /\s(si|positivo|tiene|presente|afirmativo)\s/;
  const NO = /\s(no|negativo|ninguno|ninguna|nada)\s/;
  const CANCELAR = /\s(cancelar|cancela|salir|detener)\s/;
  const REPETIR = /\s(repite|repetir|otra vez|como)\s/;
  const sinSignos = (q) => q.replace(/[¿?]/g, '');

  function detectar(texto) {
    const t = limpiar(texto);
    return /\s(checklist|check list|chequeo|contraindicaciones?)\s/.test(t) &&
      /\s(fibrinolisis|trombolisis|fibrinolitico|trombolitico)\s/.test(t);
  }

  function crear(proto, box) {
    const preguntas = [
      ...proto.contraindicaciones.absolutas.map((q) => ({ q, tipo: 'absoluta' })),
      ...proto.contraindicaciones.relativas.map((q) => ({ q, tipo: 'relativa' })),
    ];
    let i = 0;
    let terminado = false;
    const relativas = [];
    const pendientes = [];
    const donde = box ? ', box ' + box : '';

    function respuesta(hablar, alerta) {
      const items = [
        ...preguntas.slice(0, i).map((p) =>
          (relativas.includes(p.q) ? '⚠ ' : pendientes.includes(p.q) ? '? ' : '✓ ') + sinSignos(p.q)),
      ];
      return {
        clave: 'checklist-fibrinolisis',
        titulo: (box ? 'Box ' + box + ' · ' : '') + 'Checklist de fibrinólisis',
        hablar, intro: '', pasos: [], hitos: [],
        secciones: [
          { titulo: alerta ? 'No fibrinolizar' : terminado ? 'Checklist completo' : 'Revisado hasta ahora',
            items: items.length ? items : ['Recién iniciado'], alerta: !!alerta },
          relativas.length && { titulo: 'Contraindicaciones relativas', items: relativas.map(sinSignos), alerta: true },
          pendientes.length && { titulo: 'Sin verificar', items: pendientes.map(sinSignos), alerta: true },
        ].filter(Boolean),
        esperando: terminado ? null : 'sino',
      };
    }

    function preguntar(prefijo) {
      const p = preguntas[i];
      const cambio = i === proto.contraindicaciones.absolutas.length ? 'Ahora las relativas. ' : '';
      return respuesta((prefijo ? prefijo + ' ' : '') + cambio + p.q);
    }

    function cerrar() {
      terminado = true;
      const partes = ['Checklist completo. Sin contraindicaciones absolutas.'];
      if (relativas.length) partes.push('Relativas: ' + relativas.map(sinSignos).join(', ') + '. El médico decide el riesgo y el beneficio.');
      else partes.push('Tampoco relativas.');
      if (pendientes.length) partes.push('Quedan sin verificar: ' + pendientes.map(sinSignos).join(', ') + '.');
      partes.push('Dime sigue para continuar con la fibrinólisis.');
      const r = respuesta(partes.join(' '));
      r.registro = 'Checklist de contraindicaciones de fibrinólisis: sin absolutas' +
        (relativas.length ? '; relativas: ' + relativas.map(sinSignos).join(', ') : '') +
        (pendientes.length ? '; sin verificar: ' + pendientes.map(sinSignos).join(', ') : '');
      return r;
    }

    function responder(texto) {
      if (terminado) return null;
      const t = limpiar(texto);
      if (CANCELAR.test(t)) { terminado = true; return respuesta('Checklist cancelado. No está completo.', true); }
      if (REPETIR.test(t)) return preguntar();
      const p = preguntas[i];
      if (NO_SE.test(t)) pendientes.push(p.q);
      else if (SI.test(t) && !NO.test(t)) {
        if (p.tipo === 'absoluta') {
          terminado = true;
          const r = respuesta('Contraindicación absoluta: ' + sinSignos(p.q).toLowerCase() +
            '. No se fibrinoliza. Avisa al médico para evaluar el traslado a angioplastía.', true);
          r.registro = 'Checklist de fibrinólisis: contraindicación absoluta (' + sinSignos(p.q).toLowerCase() + '), se informa al médico';
          return r;
        }
        relativas.push(p.q);
      } else if (!NO.test(t)) return preguntar('Respondan sí, no, o no sé.');
      i++;
      return i < preguntas.length ? preguntar() : cerrar();
    }

    return {
      box,
      iniciar: () => preguntar('Checklist de fibrinólisis' + donde + '. Respondan sí, no, o no sé. Contraindicaciones absolutas.'),
      responder,
      get activo() { return !terminado; },
    };
  }

  const API = { detectar, crear };
  if (typeof module !== 'undefined') module.exports = API;
  else window.PepeChecklist = API;
})();
