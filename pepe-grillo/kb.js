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
    hitos: [
      { min: 0, texto: '¿Paciente identificado y categorizado?' },
      { min: 15, texto: '¿Signos vitales completos registrados?' },
    ],
  },

  // ──────────────────────────────────────────────────────────
  // CAPAS 1–3 — POR MOTIVO DE CONSULTA
  // ──────────────────────────────────────────────────────────
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
      banderasRojas: [
        'Supradesnivel ST u otro patrón de oclusión coronaria en ECG',
        'Hipotensión, shock o arritmia',
        'Dolor desgarrante irradiado a dorso; diferencia de PAS entre brazos > 20 mmHg',
        'Disnea súbita con taquicardia e hipoxemia',
        'Síncope o déficit neurológico asociado',
      ],
      diferenciales: [
        { dx: 'Síndrome coronario agudo (IAMCEST / SCASEST)', noPerder: true,
          discriminantes: ['ECG seriado', 'Troponina seriada (0/1 h o 0/2 h)', 'Dolor opresivo irradiado, diaforesis', 'HEART score'] },
        { dx: 'Disección aórtica', noPerder: true,
          discriminantes: ['Dolor súbito desgarrante a dorso', 'Asimetría de pulsos/PA', 'Soplo de insuficiencia aórtica', 'ADD-RS'] },
        { dx: 'Tromboembolismo pulmonar', noPerder: true,
          discriminantes: ['Disnea súbita, taquicardia, hipoxemia', 'Factores de riesgo TVP', 'Wells / PERC', 'Dímero D según probabilidad'] },
        { dx: 'Neumotórax a tensión', noPerder: true,
          discriminantes: ['MP abolido unilateral', 'Desviación traqueal', 'Hipotensión + ingurgitación yugular'] },
        { dx: 'Taponamiento cardíaco', noPerder: true,
          discriminantes: ['Tríada de Beck', 'Pulso paradójico', 'POCUS'] },
        { dx: 'Pericarditis', noPerder: false,
          discriminantes: ['Dolor pleurítico que alivia al inclinarse adelante', 'Frote pericárdico', 'Supradesnivel ST difuso + infradesnivel PR'] },
        { dx: 'Dolor musculoesquelético / ERGE / ansiedad', noPerder: false,
          discriminantes: ['Diagnóstico de exclusión: solo tras descartar los anteriores'] },
      ],
      confirmados: [
        {
          id: 'iamcest',
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
        'Preparar gasometría y Rx tórax según indicación',
      ],
      banderasRojas: [
        'SpO2 < 90% pese a O2, FR > 30 o < 8',
        'Uso de musculatura accesoria, tórax silente, cianosis',
        'Estridor, angioedema o urticaria (vía aérea / anafilaxia)',
        'Compromiso de conciencia o agotamiento',
        'Hipotensión',
      ],
      diferenciales: [
        { dx: 'Anafilaxia / obstrucción de vía aérea', noPerder: true,
          discriminantes: ['Exposición a alérgeno', 'Urticaria, angioedema, estridor', 'Hipotensión'] },
        { dx: 'Neumotórax a tensión', noPerder: true,
          discriminantes: ['MP abolido unilateral', 'Hipotensión, ingurgitación yugular'] },
        { dx: 'Tromboembolismo pulmonar', noPerder: true,
          discriminantes: ['Inicio súbito, taquicardia', 'Pulmón "limpio" con hipoxemia', 'Wells'] },
        { dx: 'Edema pulmonar agudo / IC aguda', noPerder: true,
          discriminantes: ['Ortopnea, crepitaciones bibasales', 'Edema EEII, ingurgitación yugular', 'BNP / NT-proBNP'] },
        { dx: 'SCA con equivalente anginoso', noPerder: true,
          discriminantes: ['ECG', 'Troponina', 'Diabético o adulto mayor'] },
        { dx: 'Crisis asmática grave', noPerder: true,
          discriminantes: ['Sibilancias o tórax silente', 'PEF < 50% del predicho'] },
        { dx: 'Exacerbación de EPOC', noPerder: false,
          discriminantes: ['Antecedente de EPOC', 'Aumento de disnea y expectoración purulenta', 'Gasometría: hipercapnia'] },
        { dx: 'Neumonía', noPerder: false,
          discriminantes: ['Fiebre, crepitaciones focales', 'Rx tórax', 'CURB-65'] },
      ],
      confirmados: [
        {
          id: 'anafilaxia',
          nombre: 'Anafilaxia',
          algoritmo: [
            'Adrenalina IM 0,01 mg/kg (máx 0,5 mg) en cara anterolateral del muslo — sin retraso',
            'Repetir cada 5 min si no hay respuesta',
            'Retirar alérgeno; posición supina con EEII elevadas (semisentado si predomina disnea)',
            'O2 alto flujo, 2 vías venosas, bolo de cristaloides si hipotensión',
            'Observación por riesgo de reacción bifásica',
          ],
          hitos: [
            { min: 0, texto: 'Anafilaxia: ¿adrenalina IM administrada?' },
            { min: 5, texto: 'Minuto 5: ¿respuesta? Si no, evaluar segunda dosis de adrenalina' },
          ],
        },
        {
          id: 'epoc-exacerbacion',
          nombre: 'Exacerbación de EPOC',
          algoritmo: [
            'O2 controlado: meta SpO2 88–92%',
            'Broncodilatadores de acción corta según indicación',
            'Corticoide sistémico y antibiótico según indicación médica',
            'Gasometría: si pH < 7,35 y PaCO2 > 45 mmHg, evaluar VMNI',
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
        'Vía venosa; exámenes según indicación (incluye orina completa)',
        'ECG si > 50 años o dolor epigástrico',
        'Analgesia según indicación médica: no retrasarla, no enmascara el diagnóstico',
      ],
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
        { dx: 'Aneurisma aórtico abdominal roto', noPerder: true,
          discriminantes: ['Edad, tabaquismo, HTA', 'Masa pulsátil', 'Hipotensión', 'POCUS aorta'] },
        { dx: 'Embarazo ectópico roto', noPerder: true,
          discriminantes: ['β-hCG positiva', 'Amenorrea, sangrado', 'Hipotensión'] },
        { dx: 'Isquemia mesentérica', noPerder: true,
          discriminantes: ['Fibrilación auricular', 'Dolor desproporcionado', 'Lactato'] },
        { dx: 'Perforación / obstrucción intestinal', noPerder: true,
          discriminantes: ['Vómitos, distensión, sin deposiciones ni gases', 'Peritonismo'] },
        { dx: 'IAM de pared inferior', noPerder: true,
          discriminantes: ['Dolor epigástrico en diabético o adulto mayor', 'ECG'] },
        { dx: 'Pielonefritis (± obstrucción)', noPerder: true,
          discriminantes: ['Fiebre', 'Puño percusión (+)', 'Disuria', 'Sedimento urinario'] },
        { dx: 'Apendicitis aguda', noPerder: false,
          discriminantes: ['Migración periumbilical → FID', 'McBurney / Blumberg', 'Score de Alvarado'] },
        { dx: 'Colecistitis / cólico biliar', noPerder: false,
          discriminantes: ['Dolor en HD posprandial', 'Murphy (+)', 'Ecografía'] },
        { dx: 'Cólico renal', noPerder: false,
          discriminantes: ['Dolor cólico lumbar irradiado a genitales', 'Hematuria', 'Sin fiebre'] },
        { dx: 'Lumbago mecánico', noPerder: false,
          discriminantes: ['Relación con movimiento', 'Sin fiebre ni alteraciones urinarias', 'Sin banderas rojas neurológicas (cauda equina)'] },
      ],
      confirmados: [
        {
          id: 'pielonefritis',
          nombre: 'Pielonefritis aguda',
          algoritmo: [
            'Urocultivo (y hemocultivos si hay criterios de sepsis) ANTES del antibiótico, sin retrasarlo',
            'Antibiótico según indicación médica y epidemiología local',
            'Tamizaje de sepsis (ver motivo "Fiebre / sospecha de sepsis")',
            'Descartar obstrucción (ecografía): pielonefritis obstructiva = urgencia urológica',
          ],
          hitos: [
            { min: 60, texto: 'Pielonefritis: ¿antibiótico administrado? ¿cultivos tomados antes?' },
          ],
        },
        {
          id: 'aaa-roto',
          nombre: 'Aneurisma aórtico abdominal roto',
          algoritmo: [
            'Activar cirugía vascular de inmediato',
            '2 vías venosas gruesas, pruebas cruzadas, protocolo de transfusión masiva',
            'Hipotensión permisiva según indicación médica (paciente consciente)',
            'No retrasar el traslado a pabellón por imágenes si está inestable',
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
        'Signos vitales; vía venosa; exámenes según protocolo',
        'Régimen cero hasta test de deglución',
        'Preguntar por anticoagulantes y hora de la última dosis',
        'Coordinar TC cerebral urgente',
      ],
      banderasRojas: [
        'Glasgow ≤ 8 (proteger vía aérea)',
        'Inicio < 4,5 h (ventana de trombólisis) o < 24 h (evaluar trombectomía)',
        'Cefalea explosiva, "la peor de mi vida" (HSA)',
        'Convulsión persistente > 5 min',
        'Anisocoria, bradicardia + HTA (hipertensión intracraneal)',
        'Fiebre + rigidez de nuca',
      ],
      diferenciales: [
        { dx: 'Hipoglicemia', noPerder: true,
          discriminantes: ['HGT < 70 mg/dL', 'Diabético con insulina o sulfonilurea'] },
        { dx: 'ACV isquémico', noPerder: true,
          discriminantes: ['Déficit focal de inicio súbito', 'NIHSS', 'TC sin sangrado'] },
        { dx: 'Hemorragia intracraneal / HSA', noPerder: true,
          discriminantes: ['Cefalea intensa, vómitos', 'Anticoagulación', 'TC'] },
        { dx: 'Status epiléptico', noPerder: true,
          discriminantes: ['Convulsión > 5 min o sin recuperación entre crisis'] },
        { dx: 'Meningitis / encefalitis', noPerder: true,
          discriminantes: ['Fiebre, rigidez de nuca', 'Petequias'] },
        { dx: 'Intoxicación', noPerder: true,
          discriminantes: ['Fármacos disponibles', 'Pupilas', 'Toxíndromes'] },
        { dx: 'Estado postictal / parálisis de Todd', noPerder: false,
          discriminantes: ['Convulsión presenciada', 'Mordedura de lengua', 'Recuperación progresiva'] },
        { dx: 'Delirium por causa sistémica (sepsis, hiponatremia)', noPerder: false,
          discriminantes: ['Adulto mayor', 'Curso fluctuante', 'Sin focalidad'] },
      ],
      confirmados: [
        {
          id: 'acv-trombolisis',
          nombre: 'ACV isquémico candidato a trombólisis',
          algoritmo: [
            'Meta: puerta-aguja ≤ 60 min (ideal ≤ 45)',
            'PA < 185/110 mmHg antes de trombolizar; < 180/105 las 24 h siguientes',
            'Alteplasa 0,9 mg/kg (máx 90 mg; 10% en bolo en 1 min, resto en 60 min) o tenecteplasa 0,25 mg/kg (máx 25 mg) en bolo, según protocolo local',
            'Control neurológico y de PA: cada 15 min por 2 h, cada 30 min por 6 h, luego cada 1 h hasta las 24 h',
            'Sin antiagregantes ni anticoagulantes por 24 h; evitar SNG, sonda vesical y punciones arteriales si es posible',
            'Deterioro neurológico, cefalea o vómitos: suspender la infusión y avisar de inmediato',
          ],
          hitos: [
            { min: 20, texto: 'Código ACV: ¿TC realizado?' },
            { min: 45, texto: 'Minuto 45: ¿trombolítico administrado o decisión tomada?' },
          ],
        },
        {
          id: 'hipoglicemia',
          nombre: 'Hipoglicemia sintomática',
          algoritmo: [
            'Glucosa hipertónica EV según protocolo local; si no hay acceso venoso, glucagón 1 mg IM',
            'Si está consciente y deglute: 15–20 g de glucosa oral',
            'HGT de control a los 15 min; repetir si sigue < 70 mg/dL',
            'Si usa sulfonilurea o insulina de acción prolongada: riesgo de recurrencia, observación prolongada',
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
        'Lactato',
        'Hemocultivos ×2 antes del antibiótico, sin retrasarlo',
        'Buscar el foco: respiratorio, urinario, abdominal, piel/partes blandas, SNC, catéter',
        'Vía venosa; balance hídrico / diuresis',
        'Preguntar por quimioterapia o inmunosupresión',
      ],
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
        { dx: 'Shock séptico', noPerder: true,
          discriminantes: ['Hipotensión que requiere vasopresor', 'Lactato > 2 pese a volumen'] },
        { dx: 'Neutropenia febril', noPerder: true,
          discriminantes: ['Quimioterapia reciente', 'RAN < 500/mm³'] },
        { dx: 'Meningococcemia / meningitis', noPerder: true,
          discriminantes: ['Petequias/púrpura', 'Rigidez de nuca', 'Cefalea, fotofobia'] },
        { dx: 'Fascitis necrotizante', noPerder: true,
          discriminantes: ['Dolor desproporcionado', 'Crepitación, bulas', 'Toxicidad sistémica'] },
        { dx: 'Simuladores no infecciosos', noPerder: true,
          discriminantes: ['Golpe de calor', 'Síndrome serotoninérgico / neuroléptico maligno', 'Tormenta tiroidea', 'Reacción transfusional', 'Pancreatitis'] },
        { dx: 'Infección localizada sin disfunción orgánica', noPerder: false,
          discriminantes: ['NEWS2 bajo', 'Lactato normal', 'Foco claro'] },
      ],
      confirmados: [
        {
          id: 'shock-septico',
          nombre: 'Sepsis / shock séptico — paquete de la hora 1',
          algoritmo: [
            'Lactato (repetir si inicial > 2 mmol/L)',
            'Hemocultivos antes del antibiótico',
            'Antibiótico de amplio espectro dentro de 1 h (shock o sepsis probable); dentro de 3 h si sepsis posible sin shock',
            'Cristaloides 30 mL/kg si hay hipotensión o lactato ≥ 4 mmol/L, reevaluando la respuesta',
            'Noradrenalina si PAM < 65 mmHg durante o después del volumen (vía periférica transitoria aceptable)',
            'Control del foco',
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
