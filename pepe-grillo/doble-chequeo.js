// ============================================================
// pepe-grillo/doble-chequeo.js — Diálogo guiado de doble chequeo
// independiente para heparina e insulina en BIC.
//
// Una vez iniciado, las enfermeras responden sin decir "Pepe":
// "listo", "sí", "no", un número, "repite" o "cancelar".
// ============================================================

(function () {
  const PALABRAS_NUM = {
    cero: 0, un: 1, uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7,
    ocho: 8, nueve: 9, diez: 10, once: 11, doce: 12, trece: 13, catorce: 14, quince: 15,
    dieciseis: 16, diecisiete: 17, dieciocho: 18, diecinueve: 19, veinte: 20,
  };

  const limpiar = (t) => String(t || '').toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '');

  // "25.000" → 25000 · "0,1" → 0.1 · "cero coma uno" → 0.1 · "25 mil" → 25000
  function leerNumero(texto) {
    let t = limpiar(texto).replace(/\b[a-z]+\b/g, (w) => (w in PALABRAS_NUM ? String(PALABRAS_NUM[w]) : w));
    while (/(\d)\.(\d{3})(?!\d)/.test(t)) t = t.replace(/(\d)\.(\d{3})(?!\d)/, '$1$2');
    t = t.replace(/(\d)\s*(?:,|coma|punto)\s*(\d)/g, '$1.$2');
    const m = t.match(/(\d+(?:\.\d+)?)(\s*mil\b)?/);
    if (!m) return null;
    return Number(m[1]) * (m[2] ? 1000 : 1);
  }

  const es = (t, re) => re.test(' ' + limpiar(t).replace(/[^a-z0-9ñ\s]/g, ' ') + ' ');
  const SI = /\s(si|listo|lista|listas|listos|ok|okay|correcto|correcta|verificado|confirmado|confirmada|dale|ya)\s/;
  const NO = /\s(no|negativo)\s/;
  const CANCELAR = /\s(cancelar|cancela|abortar|detener|salir)\s/;
  const REPETIR = /\s(repite|repetir|de nuevo|otra vez|como)\s/;
  const NO_APLICA = /\sno aplica\s/;

  const fmt = (n, d = 1) => Number(n.toFixed(d)).toLocaleString('es-CL');
  const reloj = (fecha) => fecha.toTimeString().slice(0, 5);

  function detectar(texto, kb) {
    const t = ' ' + limpiar(texto).replace(/[^a-z0-9ñ\s]/g, ' ') + ' ';
    const intencion = /\s(chequeo|check|bic|bomba|infusion|instalar|instalo|iniciar|inicio|preparar|prepare|preparamos|conectar)\s/.test(t);
    if (!intencion) return null;
    return Object.keys(kb.altoRiesgo).find((k) =>
      kb.altoRiesgo[k].alias.some((a) => t.includes(' ' + a + ' '))) || null;
  }

  function crear(medId, kb, inst, box) {
    const med = kb.altoRiesgo[medId];
    const prep = (inst && inst.preparaciones && inst.preparaciones[medId]) || med.preparacionEstandar;
    const d = { prepUI: null, prepML: null };
    const hechos = [];
    let paso = null;
    let terminado = false;
    const donde = box ? ', box ' + box : '';

    const conc = () => d.prepUI / d.prepML;
    const uiHora = () => (d.porKilo ? d.dosis * d.peso : d.dosis);
    const calc = () => Math.round((uiHora() / conc()) * 10) / 10;
    // Read-back: Pepe repite la dosis en unidades por hora antes de seguir.
    const leerDosis = () => 'Entendido: ' + fmt(uiHora(), 0) + ' unidades por hora.';
    const coincide = (a, b) => Math.abs(a - b) <= 0.1 + 1e-9;

    // Cada paso: tipo de respuesta que espera y lo que dice Pepe.
    const PASOS = {
      inicio: { tipo: 'confirmar', decir: () =>
        'Doble chequeo de ' + med.nombre.charAt(0).toLowerCase() + med.nombre.slice(1) + donde + '. Necesito a las dos enfermeras presentes. ' +
        'Verifiquen al paciente con dos identificadores y la orden médica. Digan listo.' },
      frasco: { tipo: 'confirmar', decir: () => med.verificacion },
      potasio: { tipo: 'numero', decir: () => '¿Último potasio? Si no corresponde, digan no aplica.' },
      potasioBajo: { tipo: 'sino', decir: () =>
        'Alto. Potasio de ' + fmt(d.potasio) + ', bajo ' + fmt(med.potasioMinimo) +
        '. La insulina no se inicia hasta reponer potasio. ¿El médico indicó iniciar igual?' },
      peso: { tipo: 'numero', decir: () => '¿Peso del paciente en kilos?' },
      dosis: { tipo: 'numero', decir: () => '¿Dosis indicada? En unidades por hora, o unidades por kilo por hora.' },
      dosisAlta: { tipo: 'sino', decir: () =>
        'Atención: ' + fmt(uiHora(), 0) + ' unidades por hora, ' + fmt(uiHora() / d.peso, 2) +
        ' por kilo, está sobre el rango habitual. ¿El médico confirmó esta dosis?' },
      prep: { tipo: 'sino', decir: () =>
        '¿Prepararon la solución estándar: ' + fmt(prep.ui, 0) + ' unidades en ' + fmt(prep.ml, 0) + ' mL?' },
      prepUI: { tipo: 'numero', decir: () => '¿Cuántas unidades pusieron en total?' },
      prepML: { tipo: 'numero', decir: () => '¿En cuántos mL?' },
      velA: { tipo: 'numero', decir: () =>
        'Concentración: ' + fmt(conc(), 2) + ' unidades por mL. Cada una calcule la velocidad por separado, ' +
        'sin mostrarse el resultado. Enfermera uno: ¿cuántos mL por hora?' },
      velB: { tipo: 'numero', decir: () => 'Enfermera dos: ¿cuántos mL por hora?' },
      bic: { tipo: 'numero', decir: () =>
        'Coinciden los tres cálculos: ' + fmt(calc()) + ' mL por hora. Programen la BIC y léanme la velocidad que muestra la pantalla.' },
      linea: { tipo: 'confirmar', decir: () =>
        'Sigan la línea con la mano desde la bomba hasta el paciente. ¿Conectada a la vía correcta y rotulada? Digan listo.' },
    };

    function ir(id, prefijo) {
      paso = id;
      return respuesta((prefijo ? prefijo + ' ' : '') + PASOS[id].decir());
    }

    function detener(motivo) {
      terminado = true;
      paso = null;
      return respuesta('Chequeo detenido. ' + motivo + ' No inicien la infusión.', { alerta: true });
    }

    function finalizar() {
      terminado = true;
      paso = null;
      const ahora = new Date();
      const registro =
        reloj(ahora) + ' · ' + med.nombre + ' · ' + fmt(uiHora(), 0) + ' UI/h (' + fmt(uiHora() / d.peso, 2) +
        ' UI/kg/h) · ' + fmt(d.prepUI, 0) + ' UI en ' + fmt(d.prepML, 0) + ' mL (' + fmt(conc(), 2) +
        ' UI/mL) · ' + fmt(calc()) + ' mL/h · verificado por dos enfermeras';
      hechos.push('Registro: ' + registro);
      const r = respuesta(
        'Doble chequeo completo. ' + fmt(calc()) + ' mL por hora. ' +
        med.controles.map((c) => c.texto.replace(/^[^:]+:\s*/, '')).join('. ') + '. Te aviso.',
        { hitos: med.controles });
      r.registro = registro;
      return r;
    }

    function respuesta(hablar, extra = {}) {
      return {
        clave: 'doble-chequeo-' + medId,
        titulo: (box ? 'Box ' + box + ' · ' : '') + 'Doble chequeo: ' + med.nombre,
        hablar,
        mas: '',
        secciones: [
          { titulo: extra.alerta ? 'Chequeo detenido' : terminado ? 'Chequeo completo' : 'Verificado hasta ahora',
            items: hechos.length ? hechos.slice() : ['Recién iniciado'], alerta: !!extra.alerta },
          { titulo: 'Fuentes', items: med.fuentes },
        ],
        hitos: extra.hitos || [],
        esperando: terminado ? null : PASOS[paso].tipo,
      };
    }

    // Decide el paso siguiente según lo ya registrado.
    function avanzar(desde, prefijo) {
      const orden = ['inicio', 'frasco', 'potasio', 'peso', 'dosis', 'prep', 'velA', 'velB', 'bic', 'linea'];
      let i = orden.indexOf(desde) + 1;
      if (orden[i] === 'potasio' && med.potasioMinimo == null) i++;
      return orden[i] ? ir(orden[i], prefijo) : finalizar();
    }

    function responder(texto) {
      if (terminado) return null;
      if (es(texto, CANCELAR)) return detener('Cancelado por el equipo.');
      if (es(texto, REPETIR)) return ir(paso);
      const tipo = PASOS[paso].tipo;
      const si = es(texto, SI) && !es(texto, NO);
      const no = es(texto, NO) && !es(texto, NO_APLICA);
      const n = leerNumero(texto);

      if (tipo === 'confirmar') {
        if (!si) return ir(paso, 'Cuando esté listo, digan listo.');
        hechos.push({ inicio: 'Paciente y orden médica verificados', frasco: 'Fármaco y presentación verificados',
          linea: 'Línea trazada hasta el paciente y rotulada' }[paso]);
        return avanzar(paso);
      }

      if (tipo === 'sino') {
        if (!si && !no) return ir(paso, 'Respondan sí o no.');
        if (paso === 'potasioBajo') {
          if (no) return detener('Potasio bajo sin indicación médica de iniciar.');
          hechos.push('Potasio bajo: el médico indicó iniciar');
          return avanzar('potasio');
        }
        if (paso === 'dosisAlta') {
          if (no) return detener('Confirmen la dosis con el médico.');
          hechos.push('Dosis sobre el rango habitual confirmada por el médico');
          return avanzar('dosis', leerDosis());
        }
        if (paso === 'prep') {
          if (si) {
            d.prepUI = prep.ui; d.prepML = prep.ml;
            hechos.push('Solución estándar: ' + fmt(prep.ui, 0) + ' UI en ' + fmt(prep.ml, 0) + ' mL');
            return avanzar('prep');
          }
          return ir('prepUI');
        }
      }

      // tipo numero
      if (paso === 'potasio' && es(texto, NO_APLICA)) { hechos.push('Potasio: no aplica'); return avanzar('potasio'); }
      if (n == null || n <= 0) return ir(paso, 'No entendí el número.');
      switch (paso) {
        case 'potasio':
          d.potasio = n;
          hechos.push('Potasio: ' + fmt(n) + ' mEq/L');
          return n < med.potasioMinimo ? ir('potasioBajo') : avanzar('potasio');
        case 'peso':
          d.peso = n; hechos.push('Peso: ' + fmt(n) + ' kg');
          return avanzar('peso');
        case 'dosis': {
          d.dosis = n;
          d.porKilo = es(texto, /\s(kilo|kilos|kg|kilogramo)\s/);
          hechos.push('Dosis indicada: ' + fmt(n, 2) + (d.porKilo ? ' UI/kg/h = ' + fmt(uiHora(), 0) + ' UI/h' : ' UI/h'));
          const alta = uiHora() / d.peso > med.rango.porKiloMax || uiHora() > med.rango.porHoraMax;
          return alta ? ir('dosisAlta') : avanzar('dosis', leerDosis());
        }
        case 'prepUI':
          d.prepUI = n; return ir('prepML');
        case 'prepML':
          d.prepML = n;
          hechos.push('Solución no estándar: ' + fmt(d.prepUI, 0) + ' UI en ' + fmt(n, 0) + ' mL');
          return avanzar('prep');
        case 'velA':
          d.velA = n; return avanzar('velA');
        case 'velB': {
          d.velB = n;
          if (coincide(d.velA, calc()) && coincide(d.velB, calc())) {
            hechos.push('Velocidad calculada por ambas: ' + fmt(calc()) + ' mL/h');
            return avanzar('velB');
          }
          return ir('velA',
            'Alto, no coinciden. Enfermera uno: ' + fmt(d.velA) + '. Enfermera dos: ' + fmt(d.velB) +
            '. Mi cálculo: ' + fmt(calc()) + ' mL por hora. Revisen juntas la dosis y la concentración.');
        }
        case 'bic':
          if (!coincide(n, calc())) {
            return ir('bic', 'La BIC muestra ' + fmt(n) + ' y debe ser ' + fmt(calc()) + '. Corrijan la programación.');
          }
          hechos.push('BIC programada: ' + fmt(n) + ' mL/h');
          return avanzar('bic');
      }
      return ir(paso);
    }

    return {
      medId,
      iniciar: () => ir('inicio'),
      responder,
      get activo() { return !terminado; },
    };
  }

  const API = { detectar, crear, leerNumero };
  if (typeof module !== 'undefined') module.exports = API;
  else window.PepeDobleChequeo = API;
})();
