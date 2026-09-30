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
        nombre: 'Primer contacto (minutos 0 a 10)',
        intro: 'Sospecha de síndrome coronario agudo. Primer contacto.',
        claveInstitucional: 'sca',
        localDespuesDe: 2, // el protocolo local va después del ECG y de las banderas rojas
        activadores: ['sca', 'sindrome coronario', 'sindrome coronario agudo', 'coronario agudo', 'infarto', 'iam',
          'dolor toracico', 'dolor de pecho', 'opresion toracica', 'dolor precordial', 'dolor anginoso'],
        pasos: [
          { voz: 'ECG de 12 derivaciones antes de 10 minutos desde la llegada, y que el médico lo vea en el acto',
            porque: 'El IAM con supradesnivel se diagnostica con el ECG, no con la troponina. Desde ese momento corre el reloj de reperfusión: el tiempo es miocardio.' },
          { voz: 'Banderas rojas: hipotensión, arritmia, dolor desgarrante hacia la espalda, disnea o síncope. Si aparece una, avisa de inmediato',
            detalle: 'Shock o hipotensión · arritmia ventricular o bloqueo AV · dolor desgarrante a dorso o asimetría de pulsos (disección) · disnea o crepitaciones (edema pulmonar) · síncope',
            porque: 'Indican shock cardiogénico, arritmia maligna, complicación mecánica o un diagnóstico alternativo grave como la disección aórtica, donde los antitrombóticos pueden ser letales.' },
          { voz: 'Monitor cardíaco continuo, y el desfibrilador y el carro de paro al lado del paciente',
            porque: 'La fibrilación ventricular es más frecuente en las primeras horas del infarto. Desfibrilar en menos de 3 minutos cambia la sobrevida.' },
          { voz: 'Signos vitales completos, con presión en ambos brazos. Oxígeno solo si la saturación es menor de 90%',
            detalle: 'PA en ambos brazos, FC, FR, SpO2, T°. Diferencia de PAS > 20 mmHg entre brazos: sospechar disección.',
            porque: 'El oxígeno en pacientes sin hipoxemia no reduce la mortalidad y puede aumentar el daño por vasoconstricción coronaria. La asimetría de presión orienta a disección.' },
          { voz: 'Valora el dolor: hora exacta de inicio, carácter, irradiación, intensidad de 0 a 10 y síntomas acompañantes',
            detalle: 'Inicio (hora) · Tipo (opresivo) · Irradiación (brazo, mandíbula, dorso) · EVA · Diaforesis, náuseas, disnea. En mujeres, diabéticos y adultos mayores: disnea, fatiga o dolor epigástrico sin dolor típico.',
            porque: 'La hora de inicio define si el paciente está en ventana de reperfusión. Los equivalentes anginosos explican por qué a mujeres, diabéticos y adultos mayores se les diagnostica más tarde.' },
          { voz: 'Vía venosa periférica, sin punciones arteriales ni intramusculares',
            detalle: 'Idealmente 18 G. Preferir sitios que no interfieran con el acceso radial para coronariografía.',
            porque: 'Si el paciente recibe fibrinolítico o anticoagulantes, cada punción no compresible es un sitio de sangrado.' },
          { voz: 'Muestras: troponina ultrasensible anotando la hora exacta, hemograma, electrolitos con magnesio, creatinina, glicemia y coagulación',
            porque: 'La curva de troponina se interpreta por intervalos exactos (0/1 h o 0/2 h). El potasio y el magnesio bajos favorecen arritmias. La creatinina condiciona el contraste y las dosis.' },
          { voz: 'Pregunta dirigida: alergia a aspirina, uso de anticoagulantes, sildenafil o tadalafil en los últimos días, sangrados, cirugías o ACV recientes',
            porque: 'Anticipa contraindicaciones de fármacos y de fibrinólisis. Los nitratos con sildenafil o tadalafil pueden producir hipotensión grave.' },
          { voz: 'Reposo absoluto, posición cómoda, y explícale al paciente y a su familia qué está pasando',
            porque: 'El dolor y la ansiedad elevan la frecuencia cardíaca y el consumo de oxígeno del miocardio. Una información clara reduce la ansiedad.' },
          { voz: 'Registra tres horas: inicio del dolor, llegada y toma del ECG',
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
        nombre: 'IAM con supradesnivel ST confirmado',
        intro: 'IAM con supradesnivel confirmado. El reloj de reperfusión corre desde ahora.',
        claveInstitucional: 'iamcest',
        activadores: ['iamcest', 'supradesnivel', 'supra desnivel', 'con supra', 'con supradesnivel', 'stemi', 'codigo iam',
          'iam con supradesnivel', 'iam con supra', 'elevacion del st', 'supradesnivel del st'],
        pasos: [
          { voz: 'Activa el código IAM y registra la hora del diagnóstico',
            porque: 'La hora del diagnóstico por ECG es el tiempo cero para medir las metas de reperfusión.' },
          { voz: 'Pregunta al médico la estrategia: angioplastía primaria si es posible antes de 120 minutos; si no, fibrinólisis antes de 10 minutos. Prepara ambas',
            porque: 'La angioplastía primaria es superior solo si se realiza a tiempo. Si el traslado supera los 120 minutos, la fibrinólisis precoz salva más miocardio.' },
          { voz: 'Aspirina 150 a 300 miligramos masticada, según indicación. Verifica que no sea alérgico',
            detalle: 'Masticada y no entera: absorción más rápida.',
            porque: 'La aspirina reduce la mortalidad del infarto. Masticada, alcanza su efecto antiplaquetario en minutos.' },
          { voz: 'Segundo antiagregante y anticoagulante según indicación. Verifica la dosis ajustada por edad y función renal',
            detalle: 'Con fibrinólisis (ESC 2023): clopidogrel carga 300 mg si ≤ 75 años; 75 mg sin carga si > 75 años. Enoxaparina < 75 años: 30 mg EV en bolo + 1 mg/kg SC cada 12 h; ≥ 75 años: sin bolo, 0,75 mg/kg SC cada 12 h. Ajustar si hay insuficiencia renal.',
            porque: 'Los adultos mayores y los pacientes con insuficiencia renal tienen más riesgo de sangrado con dosis estándar. Es un punto clásico de error de medicación.' },
          { voz: 'Si el infarto es inferior, toma derivaciones derechas V3R y V4R antes de dar nitratos',
            porque: 'El infarto de ventrículo derecho depende de la precarga: los nitratos y los diuréticos pueden producir hipotensión grave.' },
          { voz: 'Nitrato sublingual solo si la PAS es mayor de 90, sin infarto de ventrículo derecho y sin sildenafil. Opioide solo si el dolor persiste',
            porque: 'Los nitratos alivian el dolor pero no reducen la mortalidad. La morfina puede retrasar la absorción de los antiagregantes orales.' },
          { voz: 'Vigila arritmias: fibrilación ventricular, se desfibrila; en el infarto inferior, bradicardia o bloqueo AV, ten atropina y marcapaso transcutáneo',
            porque: 'La arteria coronaria derecha irriga el nodo AV en la mayoría de las personas: el infarto inferior se asocia a bradiarritmias.' },
          { voz: 'Si va a hemodinamia, prepara el traslado. Si se fibrinoliza, dime fibrinólisis',
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
        nombre: 'Fibrinólisis: antes, durante y después',
        intro: 'Fibrinólisis.',
        claveInstitucional: 'fibrinolisis',
        activadores: ['fibrinolisis', 'trombolisis', 'fibrinolitico', 'trombolitico', 'tenecteplasa', 'estreptoquinasa',
          'alteplasa', 'trombolizar', 'fibrinolizar', 'se tromboliza', 'se fibrinoliza', 'va a fibrinolisis'],
        pasos: [
          { voz: 'Revisa con el médico las contraindicaciones. Si quieres, dime checklist de fibrinólisis y te las pregunto una por una',
            porque: 'El riesgo más grave de la fibrinólisis es la hemorragia intracraneal. Una contraindicación absoluta obliga a buscar otra estrategia.' },
          { voz: 'Dos vías venosas: una exclusiva para el fibrinolítico',
            porque: 'Evita incompatibilidades y permite suspender el fibrinolítico sin perder el acceso para otros fármacos.' },
          { voz: 'Peso del paciente para la dosis. La tenecteplasa se dosifica por peso, y en mayores de 75 años se usa la mitad, según indicación',
            detalle: 'Tenecteplasa: bolo único en 5 a 10 segundos, dosis por tramos de peso. Estreptoquinasa: 1.500.000 UI en 30 a 60 minutos.',
            porque: 'El estudio STREAM mostró más hemorragia intracraneal en los mayores de 75 años con la dosis completa.' },
          { voz: 'Con estreptoquinasa, vigila hipotensión y reacción alérgica. Si baja la presión, disminuye la velocidad y avisa',
            porque: 'La estreptoquinasa es una proteína bacteriana: produce hipotensión por liberación de bradicinina y puede generar alergia.' },
          { voz: 'Presión y ritmo cada 15 minutos. Evita punciones, sondas e inyecciones intramusculares',
            porque: 'Durante la fibrinólisis cualquier procedimiento invasivo puede sangrar sin control.' },
          { voz: 'Cefalea, vómitos o compromiso de conciencia: suspende la infusión y avisa de inmediato',
            porque: 'Es la forma de presentación de la hemorragia intracraneal, la complicación más temida.' },
          { voz: 'A los 60 a 90 minutos, ECG de control. Busca reperfusión: el supradesnivel baja 50% o más y el dolor cede',
            detalle: 'Criterios de reperfusión: resolución del ST ≥ 50%, alivio del dolor, arritmias de reperfusión (ritmo idioventricular acelerado, que no se trata).',
            porque: 'Si no hay criterios de reperfusión, la fibrinólisis fracasó y el paciente necesita una angioplastía de rescate urgente.' },
          { voz: 'Sin criterios de reperfusión, avisa ya: angioplastía de rescate. Con criterios, coordina el traslado para coronariografía dentro de las 24 horas',
            porque: 'Es la estrategia farmacoinvasiva: la fibrinólisis abre la arteria, pero después hay que estudiarla y tratarla.' },
          { voz: 'Vigila sangrado en sitios de punción, encías, orina y deposiciones',
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
        nombre: 'SCA sin supradesnivel ST',
        intro: 'Síndrome coronario sin supradesnivel.',
        claveInstitucional: 'scasest',
        activadores: ['scasest', 'sin supradesnivel', 'sin supra', 'iamsest', 'nstemi', 'angina inestable',
          'infradesnivel', 'troponina positiva', 'sin supradesnivel del st'],
        pasos: [
          { voz: 'Repite el ECG si el dolor vuelve o cambia, y según el protocolo',
            porque: 'Un SCA sin supradesnivel puede evolucionar a una oclusión: el ECG inicial normal no descarta el infarto.' },
          { voz: 'Troponina seriada con hora exacta, a la hora o a las 2 horas según el laboratorio',
            porque: 'El diagnóstico de infarto sin supradesnivel depende de la curva de troponina, no de un valor aislado.' },
          { voz: 'Alto riesgo inmediato: dolor que no cede, hipotensión, arritmia, insuficiencia cardíaca o cambios del ST. Si aparece uno, avisa: cambia la urgencia de la coronariografía',
            porque: 'Estos criterios de muy alto riesgo indican coronariografía en menos de 2 horas, igual que un infarto con supradesnivel.' },
          { voz: 'Antiagregantes y anticoagulante según indicación. Si es heparina en BIC, dime doble chequeo de heparina',
            porque: 'La heparina en infusión es un medicamento de alto riesgo: requiere doble chequeo independiente.' },
          { voz: 'Reposo, manejo del dolor y de la ansiedad, y monitorización continua',
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
        nombre: 'Traslado a hemodinamia',
        intro: 'Traslado a hemodinamia.',
        claveInstitucional: 'traslado',
        activadores: ['traslado', 'trasladar', 'hemodinamia', 'angioplastia', 'coronariografia', 'cateterismo',
          'angioplastia primaria', 'angioplastia de rescate', 'va a hemodinamia'],
        pasos: [
          { voz: 'Monitor desfibrilador de transporte cargado y encendido',
            porque: 'El traslado es un período de alto riesgo de arritmia y con menos recursos a mano.' },
          { voz: 'Dos vías permeables, y los fármacos administrados con su hora anotados',
            porque: 'El equipo receptor necesita saber qué antitrombóticos y en qué dosis recibió el paciente para decidir el procedimiento.' },
          { voz: 'Copia del ECG, exámenes, consentimiento firmado y ficha',
            porque: 'El ECG inicial es la referencia para comparar después de la reperfusión.' },
          { voz: 'Marca los pulsos distales y retira prótesis dentales y joyas',
            porque: 'Los pulsos basales permiten detectar complicaciones vasculares del acceso arterial.' },
          { voz: 'Entrega al equipo receptor con formato ISBAR: hora de inicio del dolor, hora del ECG, fármacos y estado actual',
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
