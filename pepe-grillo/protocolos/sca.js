// ============================================================
// protocolos/sca.js — Síndrome coronario agudo desde la mirada de ENFERMERÍA
//
// ESTADO: BORRADOR — requiere validación clínica. Uso en simulación y docencia.
//
// Fases (Pepe cambia de fase cuando la enfermera informa un hallazgo o decisión):
//   primer-contacto → iamcest → fibrinolisis → traslado
//                   ↘ scasest ↗
// Cada paso: `voz` (lo que Pepe dice), `detalle` (tarjeta) y `porque`
// (fundamento, lo que responde a "Pepe, ¿por qué?").
// El protocolo institucional se intercala después de los primeros
// `localDespuesDe` pasos (1 si no se indica).
// HERRAMIENTA DE TURNO PARA PROFESIONALES: Pepe no enseña, da la señal breve
// para que no se escape nada. Solo dice lo que cambia el resultado del paciente.
// `porque` es el fundamento que se entrega solo si la enfermera lo pide.
// Los pasos con `hablado: false` quedan solo en la tarjeta.
// ============================================================

(function () {
  const SCA = {
    id: 'sca',
    nombre: 'Síndrome coronario agudo',
    version: '0.1.0',
    estado: 'BORRADOR — pendiente validación clínica',

    fases: [
      // ════════════════════════════════════════════════════
      {
        id: 'primer-contacto',
        evento: 'Sospecha médica de síndrome coronario agudo', // cómo queda en la evolución
        nombre: 'Primer contacto (minutos 0 a 10)',
        intro: 'Sospecha de SCA.',
        claveInstitucional: 'sca',
        localDespuesDe: 3, // el protocolo local va después del ECG, las banderas rojas y el monitor
        activadores: ['sca', 'sindrome coronario', 'sindrome coronario agudo', 'coronario agudo', 'infarto', 'iam',
          'dolor toracico', 'dolor de pecho', 'opresion toracica', 'dolor precordial', 'dolor anginoso'],
        pasos: [
          { voz: 'ECG de 12 derivaciones, meta 10 minutos, y al médico en el acto',
            porque: 'El IAM con supradesnivel se diagnostica con el ECG, no con la troponina. Desde ese momento corre el reloj de reperfusión: el tiempo es miocardio.' },
          { voz: 'Banderas rojas: hipotensión, arritmia, dolor a dorso, disnea, síncope',
            detalle: 'Shock o hipotensión · arritmia ventricular o bloqueo AV · dolor desgarrante a dorso o asimetría de pulsos (disección) · disnea o crepitaciones (edema pulmonar) · síncope',
            porque: 'Indican shock cardiogénico, arritmia maligna, complicación mecánica o un diagnóstico alternativo grave como la disección aórtica, donde los antitrombóticos pueden ser letales.' },
          { voz: 'Monitor continuo; desfibrilador y carro de paro al lado',
            porque: 'La fibrilación ventricular es más frecuente en las primeras horas del infarto. Desfibrilar en menos de 3 minutos cambia la sobrevida.' },
          { voz: 'Signos vitales con PA en ambos brazos. Oxígeno solo si satura bajo 90',
            detalle: 'PA en ambos brazos, FC, FR, SpO2, T°. Diferencia de PAS > 20 mmHg entre brazos: sospechar disección.',
            porque: 'El oxígeno en pacientes sin hipoxemia no reduce la mortalidad y puede aumentar el daño por vasoconstricción coronaria. La asimetría de presión orienta a disección.' },
          { voz: 'Hora de inicio del dolor y EVA',
            detalle: 'Además: carácter (opresivo), irradiación (brazo, mandíbula, dorso), diaforesis, náuseas, disnea. En mujeres, diabéticos y adultos mayores: disnea, fatiga o dolor epigástrico sin dolor típico.',
            porque: 'La hora de inicio define si el paciente está en ventana de reperfusión. La escala de 0 a 10 permite saber si el dolor cede con el tratamiento o si la isquemia progresa.' },
          { voz: 'Vía venosa, sin punciones arteriales ni IM. Troponina con hora exacta y basales',
            detalle: 'Vía idealmente 18 G, en un sitio que no interfiera con el acceso radial. Exámenes: hemograma, electrolitos con magnesio, creatinina, glicemia, TP/INR y TTPA.',
            porque: 'Si el paciente recibe fibrinolítico o anticoagulantes, cada punción no compresible es un sitio de sangrado. La curva de troponina se interpreta por intervalos exactos.' },
          { voz: 'Pregunta: alergia a aspirina, anticoagulantes, sildenafil o tadalafil, sangrado, cirugía o ACV recientes',
            porque: 'Anticipa contraindicaciones de fármacos y de fibrinólisis. Los nitratos con sildenafil o tadalafil pueden producir hipotensión grave.' },
          // Solo en la tarjeta: buena práctica, pero Pepe no lo dice en el turno.
          { hablado: false, voz: 'Reposo; informar al paciente y a la familia',
            porque: 'El dolor y la ansiedad elevan la frecuencia cardíaca y el consumo de oxígeno del miocardio.' },
          { hablado: false, voz: 'Registrar hora de inicio del dolor, de llegada y del ECG',
            porque: 'Son los indicadores de calidad del GES de infarto y permiten auditar los tiempos de reperfusión.' },
        ],
        hitos: [
          { min: 5, texto: 'SCA: ¿ECG ya tomado?' },
          { min: 10, texto: 'Minuto 10: ¿el médico ya vio el ECG?' },
          { min: 15, texto: '¿Dolor reevaluado con la escala de 0 a 10?' },
        ],
      },

      // ════════════════════════════════════════════════════
      {
        id: 'iamcest',
        evento: 'ECG con supradesnivel ST: IAM con supradesnivel, se activa código IAM', // cómo queda en la evolución
        nombre: 'IAM con supradesnivel ST confirmado',
        intro: 'IAM con supradesnivel. Corre el reloj de reperfusión.',
        claveInstitucional: 'iamcest',
        activadores: ['iamcest', 'supradesnivel', 'supra desnivel', 'con supra', 'con supradesnivel', 'stemi', 'codigo iam',
          'iam con supradesnivel', 'iam con supra', 'elevacion del st', 'supradesnivel del st'],
        pasos: [
          { voz: 'Código IAM; hora del diagnóstico',
            porque: 'La hora del diagnóstico por ECG es el tiempo cero para medir las metas de reperfusión.' },
          { voz: 'Estrategia: angioplastía si es posible antes de 120 minutos; si no, fibrinólisis antes de 10. Prepara ambas',
            porque: 'La angioplastía primaria es superior solo si se realiza a tiempo. Si el traslado supera los 120 minutos, la fibrinólisis precoz salva más miocardio.' },
          { voz: 'Aspirina 150 a 300 masticada, según indicación',
            detalle: 'Masticada y no entera: absorción más rápida.',
            porque: 'La aspirina reduce la mortalidad del infarto. Masticada, alcanza su efecto antiplaquetario en minutos.' },
          { voz: 'Segundo antiagregante y anticoagulante: ojo con el ajuste por edad y función renal',
            detalle: 'Con fibrinólisis (ESC 2023): clopidogrel carga 300 mg si ≤ 75 años; 75 mg sin carga si > 75 años. Enoxaparina < 75 años: 30 mg EV en bolo + 1 mg/kg SC cada 12 h; ≥ 75 años: sin bolo, 0,75 mg/kg SC cada 12 h. Ajustar si hay insuficiencia renal.',
            porque: 'Los adultos mayores y los pacientes con insuficiencia renal tienen más riesgo de sangrado con dosis estándar. Es un punto clásico de error de medicación.' },
          { voz: 'Si es inferior: V3R y V4R antes de nitratos',
            porque: 'El infarto de ventrículo derecho depende de la precarga: los nitratos y los diuréticos pueden producir hipotensión grave.' },
          { voz: 'Nitrato solo con PAS sobre 90, sin VD y sin sildenafil. Opioide solo si persiste el dolor',
            porque: 'Los nitratos alivian el dolor pero no reducen la mortalidad. La morfina puede retrasar la absorción de los antiagregantes orales.' },
          { voz: 'Inferior: atropina y marcapaso transcutáneo listos por bradicardia o BAV',
            porque: 'La arteria coronaria derecha irriga el nodo AV en la mayoría de las personas: el infarto inferior se asocia a bradiarritmias.' },
          { voz: 'Si va a hemodinamia, dime traslado. Si se fibrinoliza, dime fibrinólisis',
            porque: 'Pepe cambia a la fase que corresponda.' },
        ],
        hitos: [
          { min: 10, texto: 'IAMCEST: ¿decisión de reperfusión tomada?' },
          { min: 30, texto: '¿Fibrinolítico administrado o paciente en camino a hemodinamia?' },
        ],
      },

      // ════════════════════════════════════════════════════
      {
        id: 'fibrinolisis',
        evento: 'Se indica fibrinólisis', // cómo queda en la evolución
        nombre: 'Fibrinólisis: antes, durante y después',
        intro: 'Fibrinólisis.',
        claveInstitucional: 'fibrinolisis',
        activadores: ['fibrinolisis', 'trombolisis', 'fibrinolitico', 'trombolitico', 'tenecteplasa', 'estreptoquinasa',
          'alteplasa', 'trombolizar', 'fibrinolizar', 'se tromboliza', 'se fibrinoliza', 'va a fibrinolisis'],
        pasos: [
          { voz: 'Contraindicaciones con el médico. Para revisarlas una a una: checklist de fibrinólisis',
            porque: 'El riesgo más grave de la fibrinólisis es la hemorragia intracraneal. Una contraindicación absoluta obliga a buscar otra estrategia.' },
          { voz: 'Dos vías; una exclusiva para el fibrinolítico',
            porque: 'Evita incompatibilidades y permite suspender el fibrinolítico sin perder el acceso para otros fármacos.' },
          { voz: 'Peso para la dosis. Tenecteplasa: mitad de dosis sobre 75 años, según indicación',
            detalle: 'Tenecteplasa: bolo único en 5 a 10 segundos, dosis por tramos de peso. Estreptoquinasa: 1.500.000 UI en 30 a 60 minutos.',
            porque: 'El estudio STREAM mostró más hemorragia intracraneal en los mayores de 75 años con la dosis completa.' },
          { voz: 'Estreptoquinasa: hipotensión o alergia; si baja la PA, baja la velocidad y avisa',
            porque: 'La estreptoquinasa es una proteína bacteriana: produce hipotensión por liberación de bradicinina y puede generar alergia.' },
          { voz: 'PA y ritmo cada 15 minutos. Sin punciones, sondas ni IM',
            porque: 'Durante la fibrinólisis cualquier procedimiento invasivo puede sangrar sin control.' },
          { voz: 'Cefalea, vómitos o compromiso de conciencia: suspende y avisa',
            porque: 'Es la forma de presentación de la hemorragia intracraneal, la complicación más temida.' },
          { voz: 'ECG a los 60 a 90 minutos: reperfusión si el ST baja 50% o más y cede el dolor',
            detalle: 'Criterios de reperfusión: resolución del ST ≥ 50%, alivio del dolor, arritmias de reperfusión (ritmo idioventricular acelerado, que no se trata).',
            porque: 'Si no hay criterios de reperfusión, la fibrinólisis fracasó y el paciente necesita una angioplastía de rescate urgente.' },
          { voz: 'Sin reperfusión: rescate, avisa ya. Con reperfusión: coronariografía antes de 24 horas',
            porque: 'Es la estrategia farmacoinvasiva: la fibrinólisis abre la arteria, pero después hay que estudiarla y tratarla.' },
          { voz: 'Sangrado: punciones, encías, orina, deposiciones',
            porque: 'El riesgo de sangrado dura mientras dure el efecto de los antitrombóticos.' },
        ],
        hitos: [
          { min: 15, texto: 'Fibrinólisis: presión y ritmo de control' },
          { min: 60, texto: 'ECG de control: ¿bajó el supradesnivel 50% o más?' },
          { min: 90, texto: 'Si no hay reperfusión: ¿angioplastía de rescate coordinada?' },
        ],
      },

      // ════════════════════════════════════════════════════
      {
        id: 'scasest',
        evento: 'SCA sin supradesnivel ST', // cómo queda en la evolución
        nombre: 'SCA sin supradesnivel ST',
        intro: 'SCA sin supradesnivel.',
        claveInstitucional: 'scasest',
        activadores: ['scasest', 'sin supradesnivel', 'sin supra', 'iamsest', 'nstemi', 'angina inestable',
          'infradesnivel', 'troponina positiva', 'sin supradesnivel del st'],
        pasos: [
          { voz: 'ECG seriado; repetir si el dolor vuelve o cambia',
            porque: 'Un SCA sin supradesnivel puede evolucionar a una oclusión: el ECG inicial normal no descarta el infarto.' },
          { voz: 'Troponina seriada con hora exacta',
            porque: 'El diagnóstico de infarto sin supradesnivel depende de la curva de troponina, no de un valor aislado.' },
          { voz: 'Muy alto riesgo: dolor refractario, hipotensión, arritmia, insuficiencia cardíaca o cambios del ST. Si aparece uno, avisa',
            porque: 'Estos criterios de muy alto riesgo indican coronariografía en menos de 2 horas, igual que un infarto con supradesnivel.' },
          { voz: 'Antitrombóticos según indicación. Heparina en BIC: doble chequeo de heparina',
            porque: 'La heparina en infusión es un medicamento de alto riesgo: requiere doble chequeo independiente.' },
          { voz: 'Reposo, analgesia y monitorización continua',
            porque: 'Reducen el consumo de oxígeno del miocardio mientras se define la estrategia.' },
        ],
        hitos: [
          { min: 60, texto: 'SCASEST: ¿segunda troponina tomada?' },
          { min: 120, texto: '¿ECG de control y reevaluación del dolor?' },
        ],
      },

      // ════════════════════════════════════════════════════
      {
        id: 'traslado',
        evento: 'Traslado a hemodinamia', // cómo queda en la evolución
        nombre: 'Traslado a hemodinamia',
        intro: 'Traslado a hemodinamia.',
        claveInstitucional: 'traslado',
        activadores: ['traslado', 'trasladar', 'hemodinamia', 'angioplastia', 'coronariografia', 'cateterismo',
          'angioplastia primaria', 'angioplastia de rescate', 'va a hemodinamia'],
        pasos: [
          { voz: 'Monitor desfibrilador de transporte cargado',
            porque: 'El traslado es un período de alto riesgo de arritmia y con menos recursos a mano.' },
          { voz: 'Dos vías permeables; fármacos con su hora',
            porque: 'El equipo receptor necesita saber qué antitrombóticos y en qué dosis recibió el paciente para decidir el procedimiento.' },
          { voz: 'ECG, exámenes, consentimiento y ficha',
            porque: 'El ECG inicial es la referencia para comparar después de la reperfusión.' },
          { voz: 'Pulsos distales marcados; retirar prótesis y joyas',
            porque: 'Los pulsos basales permiten detectar complicaciones vasculares del acceso arterial.' },
          { voz: 'Entrega ISBAR: inicio del dolor, hora del ECG, fármacos y estado actual',
            porque: 'Una entrega estructurada reduce los errores de comunicación, una de las principales causas de eventos adversos.' },
        ],
        hitos: [
          { min: 20, texto: 'Traslado: ¿el paciente ya salió a hemodinamia?' },
        ],
      },
    ],

    // Checklist de contraindicaciones de fibrinólisis (ESC 2017, vigente en ESC 2023).
    // Pepe pregunta una por una; responder "sí" a una absoluta detiene el checklist.
    contraindicaciones: {
      absolutas: [
        '¿Antecedente de ACV hemorrágico, o de ACV de causa desconocida?',
        '¿ACV isquémico en los últimos 6 meses?',
        '¿Tumor, malformación o daño del sistema nervioso central?',
        '¿Trauma mayor, cirugía o traumatismo craneal en el último mes?',
        '¿Hemorragia digestiva en el último mes?',
        '¿Trastorno de la coagulación conocido, o sangrado activo? No cuenta la menstruación',
        '¿Sospecha de disección aórtica?',
        '¿Punciones no compresibles en las últimas 24 horas, como biopsia hepática o punción lumbar?',
      ],
      relativas: [
        '¿Crisis isquémica transitoria en los últimos 6 meses?',
        '¿Usa anticoagulantes orales?',
        '¿Embarazo, o primera semana posparto?',
        '¿Presión sistólica sobre 180 o diastólica sobre 110 que no cede?',
        '¿Enfermedad hepática avanzada?',
        '¿Endocarditis infecciosa?',
        '¿Úlcera péptica activa?',
        '¿Reanimación prolongada o traumática?',
      ],
    },

    // Proceso de enfermería (docencia). Etiquetas NANDA-I: verificar con la edición vigente.
    procesoEnfermeria: [
      { dx: 'Dolor agudo relacionado con isquemia miocárdica',
        intervenciones: ['Valoración del dolor con escala en cada control', 'Administración de analgesia y nitratos según indicación', 'Reposo y ambiente tranquilo'],
        resultado: 'Dolor ≤ 3/10 y sin signos de isquemia progresiva' },
      { dx: 'Disminución del gasto cardíaco',
        intervenciones: ['Monitorización hemodinámica y del ritmo', 'Detección precoz de arritmias y de insuficiencia cardíaca', 'Balance hídrico'],
        resultado: 'PAS > 90 mmHg, sin arritmias malignas, diuresis conservada' },
      { dx: 'Ansiedad relacionada con amenaza a la vida',
        intervenciones: ['Información clara y breve al paciente y a la familia', 'Acompañamiento', 'Resolver dudas antes de procedimientos'],
        resultado: 'Paciente verbaliza comprensión de lo que ocurre y disminuye la ansiedad' },
      { dx: 'Riesgo de sangrado (antitrombóticos y fibrinolíticos)',
        intervenciones: ['Evitar punciones no compresibles e intramusculares', 'Vigilancia de sitios de punción, orina, deposiciones y estado neurológico', 'Verificación de dosis ajustadas por edad y función renal'],
        resultado: 'Sin sangrado mayor durante la hospitalización' },
    ],

    fuentes: [
      '2023 ESC Guidelines for the management of acute coronary syndromes (Byrne RA et al.)',
      '2025 ACC/AHA/ACEP/NAEMSP/SCAI Guideline for the Management of Patients With Acute Coronary Syndromes',
      '2017 ESC Guidelines for the management of acute myocardial infarction with ST-segment elevation (contraindicaciones de fibrinólisis)',
      'Armstrong PW et al. STREAM: fibrinolysis or primary PCI in STEMI. NEJM 2013',
      'Guía Clínica AUGE Infarto Agudo del Miocardio con supradesnivel del segmento ST — MINSAL 2018',
    ],
  };

  if (typeof module !== 'undefined') module.exports = SCA;
  else (window.PEPE_PROTOCOLOS = window.PEPE_PROTOCOLOS || {})[SCA.id] = SCA;
})();
