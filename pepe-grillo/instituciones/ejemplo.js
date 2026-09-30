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

    // Se dicen ANTES de los tips generales.
    tips: {
      sca: [
        'En este hospital no hay hemodinamia de turno: si se confirma IAMCEST, prepara el checklist de fibrinólisis',
        'La troponina aquí va en tubo verde, con algoritmo de 0 y 3 horas',
      ],
      iamcest: [
        'Fibrinolítico en el carro de la sala de reanimación',
        'Coordinar traslado a centro con hemodinamia después de la fibrinólisis',
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
      iamcest: 'Código IAM: anexo 1111',
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
