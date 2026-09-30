// ============================================================
// instituciones/ejemplo.js — PLANTILLA de protocolo institucional
//
// FICTICIO: anexos, recursos y fármacos son de ejemplo.
// Para un centro real: copiar este archivo, completarlo con el
// protocolo vigente del servicio y que lo valide su comité.
//
// Regla de precedencia: lo institucional se dice PRIMERO y
// complementa a la base; la base (banderas rojas, tips) nunca se oculta.
// Las claves de `tips` y `contactos` son ids de sospecha o de
// diagnóstico confirmado de kb.js (ej.: 'sca', 'iamcest', 'acv').
// ============================================================

(function () {
  const INSTITUCION = {
    id: 'ejemplo',
    nombre: 'Hospital de ejemplo (FICTICIO)',
    version: '0.1.0',
    vigencia: 'Plantilla sin validar',

    // Exámenes que enfermería toma por protocolo institucional firmado.
    // El resto, Pepe Grillo los presenta como "sugerir al médico".
    // Los nombres deben coincidir con `ex` en kb.js.
    enfermeriaPorProtocolo: [
      'ECG 12 derivaciones',
      'HGT capilar',
      'Troponina ultrasensible',
      'Hemocultivos ×2',
      'Lactato',
      'β-hCG (orina o sangre)',
      'Orina completa con sedimento',
    ],

    // Preparaciones estándar de BIC en este centro (reemplazan las de kb.js).
    preparaciones: {
      heparina: { ui: 25000, ml: 500 },
      insulina: { ui: 100, ml: 100 },
    },

    // Se dicen ANTES de los tips generales.
    tips: {
      sca: [
        'Hemodinamia de turno 24/7: si se confirma IAMCEST, el código IAM activa el pabellón de hemodinamia',
        'La troponina aquí va en tubo verde, con algoritmo de 0 y 3 horas',
      ],
      iamcest: [
        'Aquí la estrategia es angioplastía primaria. Fibrinólisis solo si hemodinamia no está disponible',
      ],
      fibrinolisis: [
        'Fibrinolítico en el carro de la sala de reanimación: tenecteplasa',
      ],
      hemodinamia: [
        'Pabellón de hemodinamia en el tercer piso: la enfermera acompaña con TENS y monitor desfibrilador',
      ],
      acv: [
        'Sin trombectomía en este centro: con oclusión de gran vaso, se coordina traslado con la red',
      ],
      sepsis: [
        'Kit de sepsis en la bodega de reanimación; antibiótico empírico según el protocolo local de antimicrobianos',
      ],
    },

    contactos: {
      sca: 'Código IAM: anexo 1111',
      iamcest: 'Código IAM: anexo 1111. Hemodinamia: anexo 5555',
      fibrinolisis: 'Código IAM: anexo 1111',
      hemodinamia: 'Pabellón de hemodinamia: anexo 5555',
      acv: 'Código ACV: anexo 2222',
      'acv-trombolisis': 'Código ACV: anexo 2222',
      aaa: 'Cirugía vascular: central telefónica',
      'aaa-roto': 'Cirugía vascular: central telefónica',
      sepsis: 'Médico residente UPC: anexo 3333',
    },
  };

  if (typeof module !== 'undefined') module.exports = INSTITUCION;
  else (window.PEPE_INSTITUCIONES = window.PEPE_INSTITUCIONES || {})[INSTITUCION.id] = INSTITUCION;
})();
