// ============================================================
// pepe-grillo/kb.js — Base de conocimiento "Pepe Grillo"
// Copiloto clínico por audio para enfermería de urgencia
// Consulta Rápida ENF — UDP
//
// ESTADO: BORRADOR — requiere validación clínica antes de cualquier uso.
// Uso exclusivo en simulación / docencia. No es un dispositivo médico.
//
// Modelo de capas:
//   0. general      → flujograma de atención, todo paciente, desde el ingreso
//   1. motivo       → sospecha por motivo de consulta/triage (sin esperar al médico)
//   2. diferenciales→ hipótesis con hallazgos discriminantes; banderas rojas primero
//   3. confirmado   → algoritmo específico una vez que el médico confirma el diagnóstico
//
// Hitos: { min, texto } → recordatorio por tiempo transcurrido desde la activación
// de la capa. Pepe Grillo solo habla en hitos o cuando se le pregunta.
// ============================================================

const PEPE_GRILLO_KB = {
  meta: {
    version: '0.1.0',
    fecha: '2026-09-30',
    estado: 'BORRADOR — pendiente validación clínica (panel Delphi)',
    alcance: 'Adulto, urgencias médicas no traumáticas, no obstétricas',
    criterioSeleccion:
      'Motivos de consulta frecuentes en urgencia de adultos que además concentran ' +
      'cuadros tiempo-dependientes (donde un recordatorio oportuno cambia el resultado).',
  },

  // ──────────────────────────────────────────────────────────
  // CAPA 0 — GENERAL (todo paciente)
  // ──────────────────────────────────────────────────────────
  general: {
    pasos: [
      'Higiene de manos y presentarse (nombre y rol)',
      'Identificar al paciente con 2 identificadores y verificar brazalete',
      'Categorizar (ESI / categorización local C1–C5)',
      'Signos vitales completos + EVA de dolor; HGT si compromiso de conciencia o diabetes',
      'Alergias, fármacos habituales (preguntar dirigidamente por anticoagulantes/antiagregantes), antecedentes',
      'Explicar al paciente y acompañante qué se hará; resguardar privacidad',
      'Evaluar riesgo de caída y de lesión por presión',
      'Registrar y reevaluar según tiempo de la categoría asignada',
    ],
    comunicacion: {
      formato: 'ISBAR',
      plantilla:
        'Identificación: [paciente, box]. Situación: [motivo, hora inicio]. ' +
        'Antecedentes: [relevantes, fármacos]. Evaluación: [SV, hallazgos discriminantes]. ' +
        'Recomendación/pregunta: [¿evaluamos X? ¿qué hipótesis maneja?]',
      nota: 'Enfermería comunica hallazgos y pregunta por la hipótesis médica; no emite diagnóstico médico.',
    },
    // Tubos: nomenclatura BD/Vacutainer habitual en Chile. VERIFICAR con el laboratorio local.
    tubos: {
      hemocultivo: 'Frascos de hemocultivo aerobio + anaerobio',
      celeste: 'Tapa celeste (citrato): coagulación',
      suero: 'Tapa roja/amarilla (suero con gel): bioquímica',
      verde: 'Tapa verde (heparina de litio): bioquímica urgente en algunos laboratorios',
      lila: 'Tapa lila (EDTA): hemograma, banco de sangre',
      gris: 'Tapa gris (fluoruro): glicemia y lactato si hay demora en el procesamiento',
      gases: 'Jeringa heparinizada para gases (arterial o venosa), procesar < 15 min',
      orina: 'Frasco estéril (orina completa / urocultivo)',
      otro: 'Imagen o procedimiento',
    },
    ordenExtraccion:
      'Orden de llenado (CLSI GP41): hemocultivos → celeste → roja/amarilla → verde → lila → gris. ' +
      'Rotular junto al paciente, con fecha y hora.',
    hitos: [
      { min: 0, texto: '¿Paciente identificado y categorizado?' },
      { min: 15, texto: '¿Signos vitales completos registrados?' },
    ],
  },

  // ──────────────────────────────────────────────────────────
  // CAPAS 1–3 — POR MOTIVO DE CONSULTA
  // ──────────────────────────────────────────────────────────
  // ──────────────────────────────────────────────────────────
  // TIPS POR SOSPECHA — lo que Pepe Grillo dice al oído.
  // Ordenados por prioridad: se hablan los 3 primeros; el resto con "Pepe, más".
  // Frases cortas, pensadas para escucharse, no para leerse.
  // ──────────────────────────────────────────────────────────
  tips: {
    sca: [
      'ECG de 12 derivaciones antes de 10 minutos, y que el médico lo vea de inmediato',
      'Si el ECG muestra supradesnivel, corre el reloj de reperfusión: activa el código IAM',
      'Troponina a tiempo cero; anota la hora exacta para la segunda muestra',
      'Oxígeno solo si la saturación es menor de 90%',
      'Antes de nitratos: PAS mayor de 90, sin infarto de ventrículo derecho y sin sildenafil',
      'Desfibrilador a mano: la fibrilación ventricular es más frecuente en la primera hora',
    ],
    diseccion: [
      'Nada de antiagregantes ni anticoagulantes hasta descartar disección',
      'Presión en ambos brazos y pulsos en las cuatro extremidades',
      'Dos vías gruesas; grupo, Rh y pruebas cruzadas',
      'Meta habitual: frecuencia menor de 60 y PAS entre 100 y 120, según indicación médica',
      'Controla el dolor: el dolor sube la presión',
    ],
    tep: [
      'Hipotensión o shock significa TEP de alto riesgo: avisa de inmediato',
      'Vigila saturación y signos de falla del ventrículo derecho, como ingurgitación yugular',
      'Antes de anticoagular: pregunta por sangrado activo, cirugía reciente y anticoagulantes',
      'Cuidado con el volumen: el ventrículo derecho dilatado tolera mal la sobrecarga',
    ],
    neumotorax: [
      'Murmullo abolido de un lado con hipotensión: neumotórax a tensión, avisa ya',
      'Prepara material de descompresión con aguja y pleurostomía',
      'Oxígeno a alto flujo',
    ],
    taponamiento: [
      'Hipotensión, ingurgitación yugular y ruidos apagados: avisa de inmediato',
      'Prepara pericardiocentesis y ecografía',
      'Volumen según indicación; evita la sedación que baje la precarga',
    ],
    anafilaxia: [
      'Adrenalina intramuscular en el muslo es lo primero; no la retrases por antihistamínicos ni corticoides',
      'Adulto: 0,5 miligramos de la ampolla de 1 mg por mL; repetir a los 5 minutos si no responde',
      'Retira el alérgeno: suspende la infusión sospechosa',
      'Voz ronca o estridor: la vía aérea se está cerrando, avisa',
      'Observación posterior por riesgo de reacción bifásica',
    ],
    'ic-aguda': [
      'Siéntalo con las piernas colgando, si la presión lo permite',
      'Oxígeno para saturar 90% o más; prepara ventilación no invasiva si hay trabajo respiratorio',
      'Nitratos si la PAS es mayor de 110, según indicación; furosemida EV y medir diuresis',
      'Balance hídrico estricto',
      'ECG y troponina: busca el gatillante, sea SCA, arritmia o crisis hipertensiva',
    ],
    asma: [
      'No completa frases, tórax silente o confusión: crisis de riesgo vital',
      'Salbutamol con bromuro de ipratropio, según indicación',
      'Corticoide sistémico dentro de la primera hora',
      'PEF antes y después del broncodilatador',
      'PaCO2 normal o alta en crisis asmática es signo de agotamiento',
    ],
    epoc: [
      'Meta de saturación entre 88 y 92%: el exceso de oxígeno produce hipercapnia',
      'Gasometría precoz: pH menor de 7,35 con PaCO2 sobre 45 obliga a evaluar ventilación no invasiva',
      'Broncodilatadores de acción corta y corticoide, según indicación',
      'Busca el gatillante: infección, neumotórax, TEP o insuficiencia cardíaca',
    ],
    neumonia: [
      'Calcula CURB-65 para orientar la gravedad',
      'Si es grave: hemocultivos y expectoración antes del antibiótico, sin retrasarlo',
      'Antibiótico precoz; si hay sepsis, dentro de la primera hora',
      'Aislamiento respiratorio si se sospecha influenza o COVID',
    ],
    aaa: [
      'Avisa a cirugía vascular de inmediato',
      'Dos vías gruesas; grupo, Rh y pruebas cruzadas es la primera muestra',
      'Hipotensión permisiva: no busques una presión normal con volumen, según indicación',
      'Si está inestable no va al TC: va a pabellón',
    ],
    ectopico: [
      'β-hCG a toda mujer en edad fértil con dolor abdominal',
      'Hipotensión con β-hCG positiva: ectópico roto hasta demostrar lo contrario; avisa a ginecología',
      'Dos vías gruesas; grupo, Rh y pruebas cruzadas',
      'Si es Rh negativo, recuerda la inmunoglobulina anti-D, según indicación',
    ],
    'isquemia-mesenterica': [
      'Dolor desproporcionado al examen, sobre todo con fibrilación auricular: avisa',
      'Lactato normal NO la descarta',
      'Régimen cero, vía venosa, y prepara angioTC',
    ],
    'abdomen-quirurgico': [
      'Régimen cero y vía venosa',
      'Sonda nasogástrica si hay vómitos por obstrucción, según indicación',
      'Signos de peritonitis o shock: avisa a cirugía',
    ],
    pielonefritis: [
      'Urocultivo antes del antibiótico',
      'Busca criterios de sepsis: NEWS2 y lactato',
      'Pielonefritis con obstrucción es urgencia urológica: ecografía',
      'Si está embarazada: hospitalización y evaluación obstétrica',
    ],
    apendicitis: [
      'Régimen cero y vía venosa',
      'La analgesia no enmascara el diagnóstico: no la retrases',
      'β-hCG en mujer en edad fértil antes de imágenes',
      'Fiebre alta, peritonitis difusa o shock sugieren perforación: avisa',
    ],
    colecistitis: [
      'Fiebre con ictericia: sospecha colangitis, busca criterios de sepsis',
      'Régimen cero, analgesia según indicación',
      'Perfil hepático y lipasa',
    ],
    'colico-renal': [
      'Analgesia precoz según indicación',
      'Fiebre con cólico renal: sospecha obstrucción infectada, es urgencia',
      'Mayor de 60 años con primer cólico renal: descarta aneurisma aórtico',
    ],
    lumbago: [
      'Descarta banderas rojas: fiebre, déficit neurológico, retención urinaria o anestesia en silla de montar',
      'Mayor de 60 años con dolor lumbar súbito: descarta aneurisma',
      'Analgesia y reevaluación del dolor',
    ],
    hipoglicemia: [
      'Trata sin esperar la confirmación del laboratorio',
      'Si está consciente y traga, glucosa oral; si no, glucosa EV o glucagón IM',
      'HGT de control a los 15 minutos',
      'Con sulfonilureas o insulina lenta la hipoglicemia vuelve: observa más tiempo',
    ],
    acv: [
      'HGT inmediato: la hipoglicemia simula un ACV',
      'La hora que importa es la última vez que lo vieron normal',
      'Activa el código ACV y lleva al paciente al TC: meta de 20 minutos',
      'Régimen cero hasta el test de deglución',
      'Pregunta por anticoagulantes y la hora de la última dosis',
      'No bajes la presión de rutina: si va a trombólisis, la meta es menor de 185 sobre 110',
    ],
    hic: [
      'Controles neurológicos seriados: Glasgow y pupilas',
      'Si usa anticoagulantes, avisa: puede requerir reversión urgente',
      'Glasgow 8 o menos: prepara manejo de vía aérea',
      'Cabecera a 30 grados; manejo del dolor y los vómitos',
      'Control de presión según la meta indicada',
    ],
    status: [
      'Mide el tiempo: más de 5 minutos es status',
      'Protege de lesiones y lateraliza; nada en la boca',
      'Benzodiacepina de primera línea según indicación, IM o EV',
      'HGT inmediato',
      'Si no despierta después de la crisis, sospecha status no convulsivo',
    ],
    meningitis: [
      'Hemocultivos y antibiótico sin esperar la punción lumbar',
      'Aislamiento por gotitas hasta descartar meningococo',
      'Con compromiso de conciencia o focalidad, TC antes de la punción',
      'Registra las petequias: pueden progresar en horas',
    ],
    intoxicacion: [
      'Pregunta qué tomó, cuánto y a qué hora',
      'Guarda envases y blísteres',
      'Glasgow 8 o menos: protege la vía aérea',
      'HGT y ECG: busca QT largo o QRS ancho',
      'Consulta al centro de información toxicológica según protocolo',
    ],
    postictal: [
      'Si no recupera la conciencia progresivamente, sospecha status no convulsivo',
      'HGT y busca lesiones por la caída',
    ],
    delirium: [
      'Delirium en adulto mayor: busca infección, fármacos, retención urinaria y electrolitos',
      'HGT y sodio',
      'Evita contenciones; acompañante si es posible',
    ],
    sepsis: [
      'Hemocultivos antes del antibiótico, pero sin retrasarlo',
      'Antibiótico dentro de la primera hora si hay shock o sepsis probable',
      'Lactato ahora; si es mayor de 2, se repite en 2 a 4 horas',
      'Hipotensión o lactato de 4 o más: cristaloides 30 mL por kilo, reevaluando',
      'PAM menor de 65 pese al volumen: noradrenalina, puede partir por vía periférica',
      'Diuresis horaria',
    ],
    'neutropenia-febril': [
      'Antibiótico dentro de 60 minutos desde el ingreso',
      'Aislamiento protector',
      'Hemocultivos periféricos, y del catéter si tiene',
      'Nada rectal: ni temperatura ni supositorios',
    ],
    meningococcemia: [
      'Antibiótico de inmediato: es de las sepsis más rápidas',
      'Aislamiento por gotitas; notificación inmediata y quimioprofilaxis de contactos',
      'Marca el borde de las petequias con la hora, para ver la progresión',
      'Vigila el shock: puede requerir volumen y vasopresores precoces',
    ],
    fascitis: [
      'Dolor desproporcionado es la clave precoz',
      'Marca los bordes del eritema con la hora',
      'Avisa a cirugía: el tratamiento es quirúrgico y urgente',
      'Antibiótico precoz de amplio espectro, según indicación',
    ],
  },

  motivos: [
    // ════════════════════════════════════════════════════════
    {
      id: 'dolor-toracico',
      nombre: 'Dolor torácico',
      activadores: ['dolor torácico', 'dolor de pecho', 'opresión torácica', 'dolor precordial'],
      acciones: [
        'ECG de 12 derivaciones dentro de 10 min desde la llegada y mostrar al médico',
        'Registrar hora de inicio del dolor',
        'Monitor cardíaco, SpO2; O2 solo si SpO2 < 90%',
        'Vía venosa periférica; muestra de troponina (alta sensibilidad) según protocolo',
        'Presión arterial en AMBOS brazos',
        'Desfibrilador disponible',
        'No administrar antiagregante sin indicación médica (descartar disección)',
      ],
      examenes: {
        basales: [
          { ex: 'ECG 12 derivaciones', tubo: 'otro', det: '≤ 10 min desde la llegada; repetir si cambia el dolor. Si hay IAM inferior: V3R–V4R (VD) y V7–V9 (posterior)' },
          { ex: 'Troponina ultrasensible', tubo: 'suero', det: 'Tiempo 0 y control a 1–3 h según el algoritmo del laboratorio (ESC 0/1 h o 0/2 h). Registrar la hora exacta de cada muestra' },
          { ex: 'Hemograma con plaquetas', tubo: 'lila', det: 'Anemia como causa o agravante; plaquetas antes de antitrombóticos' },
          { ex: 'Electrolitos plasmáticos (Na, K) y magnesio', tubo: 'suero', det: 'K y Mg: riesgo de arritmias' },
          { ex: 'Creatinina y BUN', tubo: 'suero', det: 'Antes de contraste (angiografía/angioTC) y para ajustar dosis' },
          { ex: 'Glicemia', tubo: 'suero', det: '' },
          { ex: 'TP/INR y TTPA', tubo: 'celeste', det: 'Antes de anticoagular o trombolizar; clave si usa anticoagulantes' },
          { ex: 'Rx de tórax', tubo: 'otro', det: 'Portátil si está inestable; no debe retrasar la reperfusión' },
        ],
        segunEvaluacion: [
          { ex: 'Dímero D', tubo: 'celeste', ind: 'Solo con probabilidad baja/intermedia de TEP (Wells/PERC) o disección de bajo riesgo (ADD-RS ≤ 1)' },
          { ex: 'AngioTC de tórax / aorta', tubo: 'otro', ind: 'Sospecha de disección o TEP. Verificar creatinina y alergia al contraste' },
          { ex: 'Gasometría arterial', tubo: 'gases', ind: 'Hipoxemia o sospecha de TEP' },
          { ex: 'Ecocardiograma / POCUS', tubo: 'otro', ind: 'Derrame pericárdico, motilidad segmentaria, dilatación del VD, aorta' },
          { ex: 'Lipasa', tubo: 'suero', ind: 'Dolor epigástrico' },
          { ex: 'Grupo y Rh + pruebas cruzadas', tubo: 'lila', ind: 'Disección aórtica (probable cirugía)' },
        ],
      },
      banderasRojas: [
        'Supradesnivel ST u otro patrón de oclusión coronaria en ECG',
        'Hipotensión, shock o arritmia',
        'Dolor desgarrante irradiado a dorso; diferencia de PAS entre brazos > 20 mmHg',
        'Disnea súbita con taquicardia e hipoxemia',
        'Síncope o déficit neurológico asociado',
      ],
      diferenciales: [
        { id: 'sca', alias: ['sca', 'sindrome coronario', 'sindrome coronario agudo', 'coronario agudo', 'iam', 'infarto', 'angina inestable', 'scasest', 'iamsest'], dx: 'Síndrome coronario agudo (IAMCEST / SCASEST)', noPerder: true,
          discriminantes: ['ECG seriado', 'Troponina seriada (0/1 h o 0/2 h)', 'Dolor opresivo irradiado, diaforesis', 'HEART score'] },
        { id: 'diseccion', alias: ['diseccion', 'diseccion aortica', 'sindrome aortico'], dx: 'Disección aórtica', noPerder: true,
          discriminantes: ['Dolor súbito desgarrante a dorso', 'Asimetría de pulsos/PA', 'Soplo de insuficiencia aórtica', 'ADD-RS'] },
        { id: 'tep', alias: ['tep', 'tromboembolismo', 'tromboembolismo pulmonar', 'embolia pulmonar'], dx: 'Tromboembolismo pulmonar', noPerder: true,
          discriminantes: ['Disnea súbita, taquicardia, hipoxemia', 'Factores de riesgo TVP', 'Wells / PERC', 'Dímero D según probabilidad'] },
        { id: 'neumotorax', alias: ['neumotorax', 'neumotorax a tension'], dx: 'Neumotórax a tensión', noPerder: true,
          discriminantes: ['MP abolido unilateral', 'Desviación traqueal', 'Hipotensión + ingurgitación yugular'] },
        { id: 'taponamiento', alias: ['taponamiento', 'taponamiento cardiaco'], dx: 'Taponamiento cardíaco', noPerder: true,
          discriminantes: ['Tríada de Beck', 'Pulso paradójico', 'POCUS'] },
        { id: 'pericarditis', alias: ['pericarditis'], dx: 'Pericarditis', noPerder: false,
          discriminantes: ['Dolor pleurítico que alivia al inclinarse adelante', 'Frote pericárdico', 'Supradesnivel ST difuso + infradesnivel PR'] },
        { dx: 'Dolor musculoesquelético / ERGE / ansiedad', noPerder: false,
          discriminantes: ['Diagnóstico de exclusión: solo tras descartar los anteriores'] },
      ],
      confirmados: [
        {
          id: 'iamcest',
          alias: ['iamcest', 'iam con supra', 'iam con supradesnivel', 'supradesnivel', 'stemi'],
          nombre: 'IAM con supradesnivel ST (IAMCEST)',
          algoritmo: [
            'Activar estrategia de reperfusión: angioplastía primaria si es alcanzable ≤ 120 min desde el diagnóstico; si no, fibrinólisis dentro de 10 min del diagnóstico',
            'Si fibrinólisis: aplicar checklist de contraindicaciones antes de administrar',
            'AAS 150–325 mg masticable (según indicación médica y guía local)',
            'Segundo antiagregante y anticoagulación según indicación médica',
            'Nitrato SL solo si PAS > 90 mmHg, sin sospecha de IAM de VD y sin uso de inhibidores de PDE5',
            'Opioide solo si dolor refractario',
            'Monitorización continua: arritmias de reperfusión, PA, dolor, ECG post-reperfusión',
          ],
          examenes: [
            { ex: 'Checklist pre-fibrinólisis', tubo: 'otro', det: 'Hemograma con plaquetas, TP/INR, TTPA, grupo y Rh (riesgo hemorrágico)' },
            { ex: 'ECG post-reperfusión', tubo: 'otro', det: '60–90 min tras la fibrinólisis o después de la angioplastía; buscar resolución del ST ≥ 50%' },
            { ex: 'Troponina seriada', tubo: 'suero', det: 'Curva según protocolo (tamaño del infarto, reinfarto)' },
            { ex: 'Perfil lipídico y HbA1c', tubo: 'suero', det: 'Dentro de 24 h (prevención secundaria); HbA1c en tubo lila' },
            { ex: 'Ecocardiograma', tubo: 'otro', det: 'Función del VI y complicaciones mecánicas' },
          ],
          hitos: [
            { min: 10, texto: 'Si va a fibrinólisis: ¿checklist de contraindicaciones listo?' },
            { min: 30, texto: '¿Reperfusión en curso o traslado a hemodinamia confirmado?' },
            { min: 90, texto: 'ECG de control: ¿resolución de ST ≥ 50%?' },
          ],
        },
      ],
      hitos: [
        { min: 5, texto: 'Dolor torácico: ¿ECG ya tomado?' },
        { min: 10, texto: 'Minuto 10: ¿el médico ya vio el ECG?' },
        { min: 60, texto: '¿Segunda troponina programada según protocolo?' },
      ],
      fuentes: [
        '2025 ACC/AHA/ACEP/NAEMSP/SCAI Guideline for the Management of Acute Coronary Syndromes',
        '2023 ESC Guidelines for the management of acute coronary syndromes',
        '2024 ESC Guidelines for peripheral arterial and aortic diseases',
        '2019 ESC Guidelines on acute pulmonary embolism',
        'Guía Clínica GES Infarto Agudo del Miocardio — MINSAL',
      ],
    },

    // ════════════════════════════════════════════════════════
    {
      id: 'disnea',
      nombre: 'Disnea / dificultad respiratoria',
      activadores: ['disnea', 'falta de aire', 'dificultad respiratoria', 'ahogo'],
      acciones: [
        'Posición semisentada (salvo contraindicación)',
        'FR, SpO2, trabajo respiratorio: ¿puede hablar frases completas?',
        'O2 titulado: meta SpO2 94–98%; 88–92% si riesgo de hipercapnia (EPOC)',
        'Monitor, vía venosa, ECG',
      ],
      examenes: {
        basales: [
          { ex: 'Gasometría arterial', tubo: 'gases', det: 'pH, PaO2, PaCO2, HCO3, lactato. Registrar la FiO2 al momento de la muestra. La venosa sirve para pH/PCO2 si no hay hipoxemia grave' },
          { ex: 'ECG 12 derivaciones', tubo: 'otro', det: 'SCA, arritmia (FA), sobrecarga del VD' },
          { ex: 'Rx de tórax', tubo: 'otro', det: 'Neumonía, edema, neumotórax, derrame' },
          { ex: 'Hemograma', tubo: 'lila', det: 'Leucocitosis, anemia' },
          { ex: 'PCR (proteína C reactiva)', tubo: 'suero', det: '' },
          { ex: 'Electrolitos, creatinina, BUN, glicemia', tubo: 'suero', det: '' },
        ],
        segunEvaluacion: [
          { ex: 'NT-proBNP / BNP', tubo: 'suero', ind: 'Sospecha de IC aguda (un valor bajo la hace improbable)' },
          { ex: 'Troponina ultrasensible', tubo: 'suero', ind: 'Sospecha de SCA, TEP o miocarditis' },
          { ex: 'Dímero D', tubo: 'celeste', ind: 'Probabilidad de TEP baja/intermedia' },
          { ex: 'AngioTC de tórax', tubo: 'otro', ind: 'Probabilidad alta de TEP o dímero D positivo' },
          { ex: 'Hemocultivos ×2 + cultivo de expectoración', tubo: 'hemocultivo', ind: 'Neumonía grave o criterios de sepsis, antes del antibiótico' },
          { ex: 'Antígenos urinarios de neumococo y Legionella', tubo: 'orina', ind: 'Neumonía grave (CURB-65 ≥ 3)' },
          { ex: 'Panel viral respiratorio (PCR: influenza, SARS-CoV-2, VRS)', tubo: 'otro', ind: 'Temporada de virus o para decidir aislamiento. Hisopado nasofaríngeo' },
          { ex: 'PEF (flujo espiratorio máximo)', tubo: 'otro', ind: 'Asma: antes y 15–20 min después del broncodilatador' },
          { ex: 'POCUS pulmonar', tubo: 'otro', ind: 'Líneas B (edema), ausencia de deslizamiento pleural (neumotórax), derrame' },
        ],
      },
      banderasRojas: [
        'SpO2 < 90% pese a O2, FR > 30 o < 8',
        'Uso de musculatura accesoria, tórax silente, cianosis',
        'Estridor, angioedema o urticaria (vía aérea / anafilaxia)',
        'Compromiso de conciencia o agotamiento',
        'Hipotensión',
      ],
      diferenciales: [
        { id: 'anafilaxia', alias: ['anafilaxia', 'shock anafilactico', 'reaccion alergica grave'], dx: 'Anafilaxia / obstrucción de vía aérea', noPerder: true,
          discriminantes: ['Exposición a alérgeno', 'Urticaria, angioedema, estridor', 'Hipotensión'] },
        { id: 'neumotorax', alias: ['neumotorax', 'neumotorax a tension'], dx: 'Neumotórax a tensión', noPerder: true,
          discriminantes: ['MP abolido unilateral', 'Hipotensión, ingurgitación yugular'] },
        { id: 'tep', alias: ['tep', 'tromboembolismo', 'tromboembolismo pulmonar', 'embolia pulmonar'], dx: 'Tromboembolismo pulmonar', noPerder: true,
          discriminantes: ['Inicio súbito, taquicardia', 'Pulmón "limpio" con hipoxemia', 'Wells'] },
        { id: 'ic-aguda', alias: ['edema pulmonar', 'edema pulmonar agudo', 'epa', 'insuficiencia cardiaca', 'ic descompensada', 'falla cardiaca'], dx: 'Edema pulmonar agudo / IC aguda', noPerder: true,
          discriminantes: ['Ortopnea, crepitaciones bibasales', 'Edema EEII, ingurgitación yugular', 'BNP / NT-proBNP'] },
        { id: 'sca', alias: ['sca', 'sindrome coronario', 'equivalente anginoso'], dx: 'SCA con equivalente anginoso', noPerder: true,
          discriminantes: ['ECG', 'Troponina', 'Diabético o adulto mayor'] },
        { id: 'asma', alias: ['asma', 'crisis asmatica', 'crisis de asma'], dx: 'Crisis asmática grave', noPerder: true,
          discriminantes: ['Sibilancias o tórax silente', 'PEF < 50% del predicho'] },
        { id: 'epoc', alias: ['epoc', 'exacerbacion epoc', 'epoc descompensado', 'epoc exacerbado'], dx: 'Exacerbación de EPOC', noPerder: false,
          discriminantes: ['Antecedente de EPOC', 'Aumento de disnea y expectoración purulenta', 'Gasometría: hipercapnia'] },
        { id: 'neumonia', alias: ['neumonia', 'nac'], dx: 'Neumonía', noPerder: false,
          discriminantes: ['Fiebre, crepitaciones focales', 'Rx tórax', 'CURB-65'] },
      ],
      confirmados: [
        {
          id: 'anafilaxia',
          alias: ['anafilaxia', 'shock anafilactico'],
          nombre: 'Anafilaxia',
          algoritmo: [
            'Adrenalina IM 0,01 mg/kg (máx 0,5 mg) en cara anterolateral del muslo — sin retraso',
            'Repetir cada 5 min si no hay respuesta',
            'Retirar alérgeno; posición supina con EEII elevadas (semisentado si predomina disnea)',
            'O2 alto flujo, 2 vías venosas, bolo de cristaloides si hipotensión',
            'Observación por riesgo de reacción bifásica',
          ],
          examenes: [
            { ex: 'Triptasa sérica', tubo: 'suero', det: 'Entre 1 y 2 h desde el inicio (máx. 4 h); una basal a las 24 h confirma el diagnóstico. NO retrasa la adrenalina' },
          ],
          hitos: [
            { min: 0, texto: 'Anafilaxia: ¿adrenalina IM administrada?' },
            { min: 5, texto: 'Minuto 5: ¿respuesta? Si no, evaluar segunda dosis de adrenalina' },
          ],
        },
        {
          id: 'epoc-exacerbacion',
          alias: ['epoc', 'exacerbacion epoc'],
          nombre: 'Exacerbación de EPOC',
          algoritmo: [
            'O2 controlado: meta SpO2 88–92%',
            'Broncodilatadores de acción corta según indicación',
            'Corticoide sistémico y antibiótico según indicación médica',
            'Gasometría: si pH < 7,35 y PaCO2 > 45 mmHg, evaluar VMNI',
          ],
          examenes: [
            { ex: 'Gasometría arterial de control', tubo: 'gases', det: '30–60 min después de ajustar el O2 o iniciar VMNI' },
            { ex: 'Rx de tórax', tubo: 'otro', det: 'Neumonía o neumotórax como gatillantes' },
            { ex: 'Cultivo de expectoración', tubo: 'otro', det: 'Si la expectoración es purulenta o hay exacerbaciones frecuentes' },
          ],
          hitos: [
            { min: 30, texto: 'EPOC: ¿gasometría de control tomada? Evaluar indicación de VMNI' },
          ],
        },
      ],
      hitos: [
        { min: 5, texto: 'Disnea: ¿SpO2 en meta?' },
        { min: 15, texto: '¿ECG tomado?' },
      ],
      fuentes: [
        'GINA 2025 — Global Strategy for Asthma Management and Prevention',
        'GOLD 2025 Report',
        '2021 ESC Heart Failure Guidelines + 2023 Focused Update',
        'World Allergy Organization Anaphylaxis Guidance 2020',
        'BTS Guideline for oxygen use in adults 2017',
      ],
    },

    // ════════════════════════════════════════════════════════
    {
      id: 'dolor-abdominal',
      nombre: 'Dolor abdominal / lumbar-flanco',
      activadores: ['dolor abdominal', 'dolor de estómago', 'dolor lumbar', 'dolor de flanco', 'dolor de espalda baja'],
      acciones: [
        'Signos vitales, EVA, HGT',
        'Test de embarazo en toda mujer en edad fértil',
        'Régimen cero hasta evaluación médica',
        'Vía venosa',
        'Analgesia según indicación médica: no retrasarla, no enmascara el diagnóstico',
      ],
      examenes: {
        basales: [
          { ex: 'β-hCG (orina o sangre)', tubo: 'orina', det: 'Toda mujer en edad fértil, ANTES de imágenes con radiación' },
          { ex: 'Hemograma', tubo: 'lila', det: 'Leucocitosis, anemia (sangrado)' },
          { ex: 'PCR (proteína C reactiva)', tubo: 'suero', det: '' },
          { ex: 'Electrolitos, creatinina, BUN, glicemia', tubo: 'suero', det: 'Deshidratación, IRA, antes de contraste' },
          { ex: 'Perfil hepático', tubo: 'suero', det: 'Bilirrubina total y directa, GOT, GPT, FA, GGT (vía biliar)' },
          { ex: 'Lipasa', tubo: 'suero', det: 'Más específica que la amilasa (pancreatitis: > 3 veces el valor normal)' },
          { ex: 'Orina completa con sedimento', tubo: 'orina', det: 'Leucocitos/nitritos (ITU), hematíes (cólico renal)' },
          { ex: 'ECG 12 derivaciones', tubo: 'otro', det: 'Mayor de 50 años, diabético o dolor epigástrico (IAM inferior)' },
        ],
        segunEvaluacion: [
          { ex: 'Urocultivo', tubo: 'orina', ind: 'Sospecha de ITU alta, ANTES del antibiótico' },
          { ex: 'Hemocultivos ×2', tubo: 'hemocultivo', ind: 'Fiebre con criterios de sepsis, colangitis' },
          { ex: 'Lactato', tubo: 'gases', ind: 'Sospecha de isquemia mesentérica o sepsis (un valor normal NO descarta isquemia)' },
          { ex: 'TP/INR, TTPA, fibrinógeno', tubo: 'celeste', ind: 'Sangrado, probable cirugía, hepatopatía' },
          { ex: 'Grupo y Rh + pruebas cruzadas', tubo: 'lila', ind: 'AAA, embarazo ectópico, hemorragia digestiva, probable cirugía' },
          { ex: 'POCUS / eFAST', tubo: 'otro', ind: 'Paciente inestable: aorta, líquido libre, hidronefrosis' },
          { ex: 'Ecografía abdominal', tubo: 'otro', ind: 'Vía biliar, apendicitis (joven/embarazada), riñón (obstrucción)' },
          { ex: 'Ecografía transvaginal', tubo: 'otro', ind: 'β-hCG positiva con dolor o sangrado (ectópico)' },
          { ex: 'TC de abdomen y pelvis con contraste', tubo: 'otro', ind: 'Apendicitis en adulto, isquemia, perforación, obstrucción' },
          { ex: 'PieloTC (TC sin contraste)', tubo: 'otro', ind: 'Cólico renal: tamaño y ubicación del cálculo' },
        ],
      },
      banderasRojas: [
        'Hipotensión o shock',
        'Abdomen en tabla / signos peritoneales',
        'Dolor desproporcionado al examen físico (isquemia mesentérica)',
        '> 60 años con dolor lumbar o de flanco súbito, masa pulsátil (aneurisma aórtico)',
        'Mujer en edad fértil con dolor + sangrado o hipotensión (embarazo ectópico)',
        'Hematemesis / melena',
        'Fiebre + ictericia + dolor (colangitis)',
      ],
      diferenciales: [
        { id: 'aaa', alias: ['aneurisma', 'aaa', 'aneurisma roto', 'aneurisma aortico', 'aaa roto'], dx: 'Aneurisma aórtico abdominal roto', noPerder: true,
          discriminantes: ['Edad, tabaquismo, HTA', 'Masa pulsátil', 'Hipotensión', 'POCUS aorta'] },
        { id: 'ectopico', alias: ['embarazo ectopico', 'ectopico'], dx: 'Embarazo ectópico roto', noPerder: true,
          discriminantes: ['β-hCG positiva', 'Amenorrea, sangrado', 'Hipotensión'] },
        { id: 'isquemia-mesenterica', alias: ['isquemia mesenterica'], dx: 'Isquemia mesentérica', noPerder: true,
          discriminantes: ['Fibrilación auricular', 'Dolor desproporcionado', 'Lactato'] },
        { id: 'abdomen-quirurgico', alias: ['perforacion', 'obstruccion intestinal', 'abdomen agudo'], dx: 'Perforación / obstrucción intestinal', noPerder: true,
          discriminantes: ['Vómitos, distensión, sin deposiciones ni gases', 'Peritonismo'] },
        { id: 'sca', alias: ['iam inferior', 'infarto inferior'], dx: 'IAM de pared inferior', noPerder: true,
          discriminantes: ['Dolor epigástrico en diabético o adulto mayor', 'ECG'] },
        { id: 'pielonefritis', alias: ['pielonefritis', 'itu alta', 'infeccion urinaria alta'], dx: 'Pielonefritis (± obstrucción)', noPerder: true,
          discriminantes: ['Fiebre', 'Puño percusión (+)', 'Disuria', 'Sedimento urinario'] },
        { id: 'apendicitis', alias: ['apendicitis'], dx: 'Apendicitis aguda', noPerder: false,
          discriminantes: ['Migración periumbilical → FID', 'McBurney / Blumberg', 'Score de Alvarado'] },
        { id: 'colecistitis', alias: ['colecistitis', 'colico biliar'], dx: 'Colecistitis / cólico biliar', noPerder: false,
          discriminantes: ['Dolor en HD posprandial', 'Murphy (+)', 'Ecografía'] },
        { id: 'colico-renal', alias: ['colico renal', 'litiasis renal', 'urolitiasis'], dx: 'Cólico renal', noPerder: false,
          discriminantes: ['Dolor cólico lumbar irradiado a genitales', 'Hematuria', 'Sin fiebre'] },
        { id: 'lumbago', alias: ['lumbago', 'lumbalgia'], dx: 'Lumbago mecánico', noPerder: false,
          discriminantes: ['Relación con movimiento', 'Sin fiebre ni alteraciones urinarias', 'Sin banderas rojas neurológicas (cauda equina)'] },
      ],
      confirmados: [
        {
          id: 'pielonefritis',
          alias: ['pielonefritis'],
          nombre: 'Pielonefritis aguda',
          algoritmo: [
            'Urocultivo (y hemocultivos si hay criterios de sepsis) ANTES del antibiótico, sin retrasarlo',
            'Antibiótico según indicación médica y epidemiología local',
            'Tamizaje de sepsis (ver motivo "Fiebre / sospecha de sepsis")',
            'Descartar obstrucción (ecografía): pielonefritis obstructiva = urgencia urológica',
          ],
          examenes: [
            { ex: 'Orina completa + urocultivo', tubo: 'orina', det: 'Segundo chorro con aseo previo, o por sondeo si no es posible. Antes del antibiótico' },
            { ex: 'Hemocultivos ×2', tubo: 'hemocultivo', det: 'Si hay sepsis, hospitalización o inmunosupresión' },
            { ex: 'Hemograma, PCR, creatinina, ELP', tubo: 'suero', det: 'Hemograma en tubo lila' },
            { ex: 'Ecografía renal y vesical', tubo: 'otro', det: 'Hidronefrosis o absceso' },
            { ex: 'TC con contraste', tubo: 'otro', det: 'Si no mejora a las 48–72 h, hay sepsis grave o sospecha de absceso' },
          ],
          hitos: [
            { min: 60, texto: 'Pielonefritis: ¿antibiótico administrado? ¿cultivos tomados antes?' },
          ],
        },
        {
          id: 'aaa-roto',
          alias: ['aneurisma roto', 'aaa roto', 'aaa', 'aneurisma'],
          nombre: 'Aneurisma aórtico abdominal roto',
          algoritmo: [
            'Activar cirugía vascular de inmediato',
            '2 vías venosas gruesas, pruebas cruzadas, protocolo de transfusión masiva',
            'Hipotensión permisiva según indicación médica (paciente consciente)',
            'No retrasar el traslado a pabellón por imágenes si está inestable',
          ],
          examenes: [
            { ex: 'Grupo y Rh + pruebas cruzadas', tubo: 'lila', det: 'Reserva según el protocolo de transfusión masiva. Es la PRIMERA muestra' },
            { ex: 'Hemograma, TP/INR, TTPA, fibrinógeno', tubo: 'celeste', det: 'Hemograma en tubo lila. Coagulopatía asociada a la transfusión masiva' },
            { ex: 'Gasometría con lactato y calcio iónico', tubo: 'gases', det: 'Acidosis; hipocalcemia por citrato durante la transfusión' },
            { ex: 'Electrolitos, creatinina', tubo: 'suero', det: '' },
            { ex: 'POCUS de aorta', tubo: 'otro', det: 'Si está inestable. AngioTC SOLO si está hemodinámicamente estable' },
          ],
          hitos: [
            { min: 0, texto: 'AAA roto: ¿cirujano vascular avisado?' },
            { min: 15, texto: '¿Hemoderivados disponibles?' },
          ],
        },
      ],
      hitos: [
        { min: 5, texto: 'Dolor abdominal: ¿test de embarazo solicitado si corresponde?' },
        { min: 30, texto: '¿Analgesia administrada y dolor reevaluado?' },
      ],
      fuentes: [
        'EAU Guidelines on Urological Infections 2025',
        'ESVS 2024 Clinical Practice Guidelines on Abdominal Aorto-Iliac Artery Aneurysms',
        'WSES Jerusalem Guidelines on acute appendicitis 2020',
        'Tokyo Guidelines 2018 (colangitis / colecistitis)',
      ],
    },

    // ════════════════════════════════════════════════════════
    {
      id: 'deficit-neurologico',
      nombre: 'Déficit neurológico agudo / compromiso de conciencia',
      activadores: ['debilidad de un lado', 'no puede hablar', 'boca chueca', 'confusión', 'compromiso de conciencia', 'convulsión'],
      acciones: [
        'HGT INMEDIATO (la hipoglicemia simula un ACV)',
        'Hora de inicio / última vez visto normal',
        'BE-FAST y Glasgow; activar código ACV si es positivo',
        'Signos vitales; vía venosa',
        'Régimen cero hasta test de deglución',
        'Preguntar por anticoagulantes y hora de la última dosis',
      ],
      examenes: {
        basales: [
          { ex: 'HGT capilar', tubo: 'otro', det: 'INMEDIATO. Es el único examen obligatorio antes de trombolizar' },
          { ex: 'TC de cerebro sin contraste', tubo: 'otro', det: 'Puerta-TC ≤ 20–25 min. Descarta hemorragia' },
          { ex: 'AngioTC de vasos intra- y extracraneales', tubo: 'otro', det: 'En la misma sesión si puede ser candidato a trombectomía; no esperar la creatinina' },
          { ex: 'Hemograma con plaquetas', tubo: 'lila', det: '' },
          { ex: 'TP/INR y TTPA', tubo: 'celeste', det: 'No esperar el resultado para trombolizar, SALVO que use anticoagulantes o se sospeche coagulopatía' },
          { ex: 'Electrolitos (Na), creatinina, glicemia', tubo: 'suero', det: 'La hiponatremia causa compromiso de conciencia' },
          { ex: 'Troponina', tubo: 'suero', det: 'Sin retrasar la trombólisis' },
          { ex: 'ECG 12 derivaciones', tubo: 'otro', det: 'FA como fuente embólica' },
        ],
        segunEvaluacion: [
          { ex: 'TC de perfusión / RM con difusión', tubo: 'otro', ind: 'Hora de inicio desconocida o ventana de 6–24 h' },
          { ex: 'Anti-Xa / tiempo de trombina', tubo: 'celeste', ind: 'Usuario de anticoagulante oral directo (apixabán, rivaroxabán, dabigatrán)' },
          { ex: 'Gasometría, calcio, magnesio, perfil hepático', tubo: 'gases', ind: 'Compromiso de conciencia sin focalidad (Ca iónico en la gasometría; Mg y perfil hepático en tubo rojo/amarillo)' },
          { ex: 'Amonio', tubo: 'lila', ind: 'Hepatópata. Tubo lila o verde según el laboratorio, en hielo, y procesar de inmediato' },
          { ex: 'Screening de drogas en orina y alcoholemia', tubo: 'orina', ind: 'Sospecha de intoxicación (alcoholemia en tubo gris)' },
          { ex: 'Niveles plasmáticos de antiepilépticos', tubo: 'suero', ind: 'Epiléptico conocido con crisis (fenitoína, ácido valproico)' },
          { ex: 'Hemocultivos ×2 → punción lumbar', tubo: 'hemocultivo', ind: 'Sospecha de meningitis: hemocultivos y antibiótico SIN esperar la punción; PL después de la TC (citoquímico, Gram, cultivo, panel PCR)' },
          { ex: 'EEG', tubo: 'otro', ind: 'Sospecha de status no convulsivo (no despierta tras la crisis)' },
        ],
      },
      banderasRojas: [
        'Glasgow ≤ 8 (proteger vía aérea)',
        'Inicio < 4,5 h (ventana de trombólisis) o < 24 h (evaluar trombectomía)',
        'Cefalea explosiva, "la peor de mi vida" (HSA)',
        'Convulsión persistente > 5 min',
        'Anisocoria, bradicardia + HTA (hipertensión intracraneal)',
        'Fiebre + rigidez de nuca',
      ],
      diferenciales: [
        { id: 'hipoglicemia', alias: ['hipoglicemia', 'hipoglucemia'], dx: 'Hipoglicemia', noPerder: true,
          discriminantes: ['HGT < 70 mg/dL', 'Diabético con insulina o sulfonilurea'] },
        { id: 'acv', alias: ['acv', 'ave', 'ataque cerebrovascular', 'accidente cerebrovascular', 'accidente vascular', 'ictus', 'stroke', 'acv isquemico'], dx: 'ACV isquémico', noPerder: true,
          discriminantes: ['Déficit focal de inicio súbito', 'NIHSS', 'TC sin sangrado'] },
        { id: 'hic', alias: ['hemorragia intracraneal', 'hsa', 'hemorragia subaracnoidea', 'hemorragia cerebral', 'acv hemorragico'], dx: 'Hemorragia intracraneal / HSA', noPerder: true,
          discriminantes: ['Cefalea intensa, vómitos', 'Anticoagulación', 'TC'] },
        { id: 'status', alias: ['status', 'status epileptico', 'estado epileptico', 'convulsion', 'crisis convulsiva'], dx: 'Status epiléptico', noPerder: true,
          discriminantes: ['Convulsión > 5 min o sin recuperación entre crisis'] },
        { id: 'meningitis', alias: ['meningitis', 'encefalitis'], dx: 'Meningitis / encefalitis', noPerder: true,
          discriminantes: ['Fiebre, rigidez de nuca', 'Petequias'] },
        { id: 'intoxicacion', alias: ['intoxicacion', 'sobredosis'], dx: 'Intoxicación', noPerder: true,
          discriminantes: ['Fármacos disponibles', 'Pupilas', 'Toxíndromes'] },
        { id: 'postictal', alias: ['postictal', 'paralisis de todd'], dx: 'Estado postictal / parálisis de Todd', noPerder: false,
          discriminantes: ['Convulsión presenciada', 'Mordedura de lengua', 'Recuperación progresiva'] },
        { id: 'delirium', alias: ['delirium', 'sindrome confusional'], dx: 'Delirium por causa sistémica (sepsis, hiponatremia)', noPerder: false,
          discriminantes: ['Adulto mayor', 'Curso fluctuante', 'Sin focalidad'] },
      ],
      confirmados: [
        {
          id: 'acv-trombolisis',
          alias: ['acv', 'ave', 'ictus', 'trombolisis', 'candidato a trombolisis', 'acv isquemico'],
          nombre: 'ACV isquémico candidato a trombólisis',
          algoritmo: [
            'Meta: puerta-aguja ≤ 60 min (ideal ≤ 45)',
            'PA < 185/110 mmHg antes de trombolizar; < 180/105 las 24 h siguientes',
            'Alteplasa 0,9 mg/kg (máx 90 mg; 10% en bolo en 1 min, resto en 60 min) o tenecteplasa 0,25 mg/kg (máx 25 mg) en bolo, según protocolo local',
            'Control neurológico y de PA: cada 15 min por 2 h, cada 30 min por 6 h, luego cada 1 h hasta las 24 h',
            'Sin antiagregantes ni anticoagulantes por 24 h; evitar SNG, sonda vesical y punciones arteriales si es posible',
            'Deterioro neurológico, cefalea o vómitos: suspender la infusión y avisar de inmediato',
          ],
          examenes: [
            { ex: 'Glicemia antes de trombolizar', tubo: 'otro', det: 'Obligatoria (HGT)' },
            { ex: 'TC de cerebro de control', tubo: 'otro', det: 'A las 24 h, ANTES de iniciar antiagregantes; urgente si hay deterioro' },
            { ex: 'Estudio etiológico', tubo: 'suero', det: 'Perfil lipídico, HbA1c (tubo lila); ECG/Holter (FA), ecocardiograma, estudio de vasos de cuello' },
          ],
          hitos: [
            { min: 20, texto: 'Código ACV: ¿TC realizado?' },
            { min: 45, texto: 'Minuto 45: ¿trombolítico administrado o decisión tomada?' },
          ],
        },
        {
          id: 'hipoglicemia',
          alias: ['hipoglicemia', 'hipoglucemia'],
          nombre: 'Hipoglicemia sintomática',
          algoritmo: [
            'Glucosa hipertónica EV según protocolo local; si no hay acceso venoso, glucagón 1 mg IM',
            'Si está consciente y deglute: 15–20 g de glucosa oral',
            'HGT de control a los 15 min; repetir si sigue < 70 mg/dL',
            'Si usa sulfonilurea o insulina de acción prolongada: riesgo de recurrencia, observación prolongada',
          ],
          examenes: [
            { ex: 'Glicemia venosa confirmatoria', tubo: 'gris', det: 'Tomarla junto con la vía venosa, SIN retrasar el tratamiento' },
            { ex: 'HGT seriado', tubo: 'otro', det: 'A los 15 min y luego cada 1–2 h según el fármaco causante' },
            { ex: 'Creatinina y ELP', tubo: 'suero', det: 'La ERC prolonga el efecto de sulfonilureas e insulina' },
            { ex: 'Insulina, péptido C, β-hidroxibutirato', tubo: 'suero', det: 'Solo en hipoglicemia sin causa clara (no diabético), con muestra tomada DURANTE la hipoglicemia' },
          ],
          hitos: [
            { min: 15, texto: 'Hipoglicemia: ¿HGT de control?' },
          ],
        },
      ],
      hitos: [
        { min: 0, texto: '¿HGT tomado?' },
        { min: 10, texto: '¿Hora de inicio registrada? ¿Código ACV activado si corresponde?' },
      ],
      fuentes: [
        'AHA/ASA Guidelines for the Early Management of Acute Ischemic Stroke (2019 y actualización vigente — verificar)',
        'European Stroke Organisation (ESO) guidelines on intravenous thrombolysis 2021 + tenecteplase 2023',
        'Guía Clínica GES Accidente Cerebrovascular Isquémico — MINSAL',
        'ADA Standards of Care in Diabetes 2025 — Hipoglicemia',
        'Neurocritical Care Society / AES guideline on status epilepticus',
      ],
    },

    // ════════════════════════════════════════════════════════
    {
      id: 'fiebre-sepsis',
      nombre: 'Fiebre / sospecha de sepsis',
      activadores: ['fiebre', 'calofríos', 'infección', 'decaimiento con fiebre'],
      acciones: [
        'Tamizaje con NEWS2 (no usar qSOFA como única herramienta)',
        'Buscar el foco: respiratorio, urinario, abdominal, piel/partes blandas, SNC, catéter',
        'Vía venosa; balance hídrico / diuresis',
        'Preguntar por quimioterapia o inmunosupresión',
      ],
      examenes: {
        basales: [
          { ex: 'Hemocultivos ×2', tubo: 'hemocultivo', det: '2 punciones en sitios distintos, frasco aerobio + anaerobio, 8–10 mL por frasco (adulto). Si tiene catéter: 1 set por el catéter y 1 periférico. ANTES del antibiótico, sin retrasarlo' },
          { ex: 'Lactato', tubo: 'gases', det: 'Arterial o venoso. ≥ 2 mmol/L = hipoperfusión; ≥ 4 = alto riesgo' },
          { ex: 'Hemograma con recuento diferencial', tubo: 'lila', det: 'Leucocitos, neutropenia, plaquetas (SOFA)' },
          { ex: 'PCR y procalcitonina', tubo: 'suero', det: 'Procalcitonina según disponibilidad' },
          { ex: 'Creatinina, BUN, electrolitos, glicemia', tubo: 'suero', det: 'Creatinina: componente renal del SOFA' },
          { ex: 'Perfil hepático con bilirrubina', tubo: 'suero', det: 'Bilirrubina: componente hepático del SOFA' },
          { ex: 'TP/INR y TTPA', tubo: 'celeste', det: 'Coagulopatía / CID' },
          { ex: 'Gasometría arterial', tubo: 'gases', det: 'PaO2/FiO2 (componente respiratorio del SOFA); registrar la FiO2' },
          { ex: 'Orina completa + urocultivo', tubo: 'orina', det: 'Foco urinario: la causa más frecuente en adultos mayores' },
          { ex: 'Rx de tórax', tubo: 'otro', det: 'Foco respiratorio' },
        ],
        segunEvaluacion: [
          { ex: 'Cultivos dirigidos al foco', tubo: 'otro', ind: 'Expectoración, herida, líquido pleural o ascítico, LCR, punta de catéter (solo si se retira)' },
          { ex: 'Fibrinógeno y dímero D', tubo: 'celeste', ind: 'Sospecha de CID (petequias, sangrado, plaquetas en descenso)' },
          { ex: 'CK', tubo: 'suero', ind: 'Fascitis necrotizante, rabdomiólisis, síndrome neuroléptico maligno' },
          { ex: 'TSH y T4 libre', tubo: 'suero', ind: 'Sospecha de tormenta tiroidea' },
          { ex: 'Panel viral respiratorio', tubo: 'otro', ind: 'Foco respiratorio o decisión de aislamiento' },
          { ex: 'Ecografía o TC según foco', tubo: 'otro', ind: 'Foco abdominal, obstrucción urinaria, absceso' },
        ],
      },
      banderasRojas: [
        'PAS < 90 mmHg o PAM < 65 mmHg',
        'Lactato ≥ 2 mmol/L (≥ 4: alto riesgo)',
        'Compromiso de conciencia; FR ≥ 22',
        'Piel moteada, llene capilar > 3 s, diuresis < 0,5 mL/kg/h',
        'Neutropenia (quimioterapia reciente)',
        'Petequias o púrpura (meningococcemia)',
        'Dolor desproporcionado o crepitación en piel (fascitis necrotizante)',
      ],
      diferenciales: [
        { id: 'sepsis', alias: ['sepsis', 'shock septico', 'septico', 'sepsis grave'], dx: 'Shock séptico', noPerder: true,
          discriminantes: ['Hipotensión que requiere vasopresor', 'Lactato > 2 pese a volumen'] },
        { id: 'neutropenia-febril', alias: ['neutropenia febril', 'neutropenico', 'neutropenica'], dx: 'Neutropenia febril', noPerder: true,
          discriminantes: ['Quimioterapia reciente', 'RAN < 500/mm³'] },
        { id: 'meningococcemia', alias: ['meningococcemia', 'meningococo', 'purpura fulminante'], dx: 'Meningococcemia / meningitis', noPerder: true,
          discriminantes: ['Petequias/púrpura', 'Rigidez de nuca', 'Cefalea, fotofobia'] },
        { id: 'fascitis', alias: ['fascitis', 'fascitis necrotizante'], dx: 'Fascitis necrotizante', noPerder: true,
          discriminantes: ['Dolor desproporcionado', 'Crepitación, bulas', 'Toxicidad sistémica'] },
        { dx: 'Simuladores no infecciosos', noPerder: true,
          discriminantes: ['Golpe de calor', 'Síndrome serotoninérgico / neuroléptico maligno', 'Tormenta tiroidea', 'Reacción transfusional', 'Pancreatitis'] },
        { dx: 'Infección localizada sin disfunción orgánica', noPerder: false,
          discriminantes: ['NEWS2 bajo', 'Lactato normal', 'Foco claro'] },
      ],
      confirmados: [
        {
          id: 'shock-septico',
          alias: ['shock septico', 'sepsis'],
          nombre: 'Sepsis / shock séptico — paquete de la hora 1',
          algoritmo: [
            'Lactato (repetir si inicial > 2 mmol/L)',
            'Hemocultivos antes del antibiótico',
            'Antibiótico de amplio espectro dentro de 1 h (shock o sepsis probable); dentro de 3 h si sepsis posible sin shock',
            'Cristaloides 30 mL/kg si hay hipotensión o lactato ≥ 4 mmol/L, reevaluando la respuesta',
            'Noradrenalina si PAM < 65 mmHg durante o después del volumen (vía periférica transitoria aceptable)',
            'Control del foco',
          ],
          examenes: [
            { ex: 'Lactato de control', tubo: 'gases', det: 'A las 2–4 h si el inicial fue > 2 mmol/L; meta: normalización' },
            { ex: 'Diuresis horaria', tubo: 'otro', det: 'Sonda Foley; meta ≥ 0,5 mL/kg/h' },
            { ex: 'Gasometría, creatinina, ELP, hemograma de control', tubo: 'gases', det: 'Evolución de la disfunción orgánica (creatinina/ELP en tubo rojo/amarillo, hemograma en lila)' },
          ],
          hitos: [
            { min: 30, texto: 'Sepsis: ¿hemocultivos tomados? ¿antibiótico preparado?' },
            { min: 60, texto: 'Hora 1: ¿antibiótico administrado?' },
            { min: 120, texto: '¿Lactato de control?' },
          ],
        },
      ],
      hitos: [
        { min: 15, texto: 'Fiebre: ¿NEWS2 calculado? ¿lactato solicitado?' },
      ],
      fuentes: [
        'Surviving Sepsis Campaign: International Guidelines 2021',
        'Surviving Sepsis Campaign 2026 (citada en guias-clinicas-2024-2025.md — verificar cambios)',
        'Royal College of Physicians — NEWS2 (2017)',
        'IDSA/ASCO — Outpatient Management of Fever and Neutropenia',
      ],
    },
  ],
};

if (typeof module !== 'undefined') module.exports = PEPE_GRILLO_KB;
