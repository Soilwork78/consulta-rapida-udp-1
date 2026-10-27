// Versión docente de las 4 situaciones de enfermería (2026).
// Bloques: {h} título, {p} párrafo, {ul}/{ol} listas, {t:{head, rows}} tabla, {note} recuadro.
const COMUN_INICIO = (n, tema) => [
  { note: 'USO EXCLUSIVO DOCENTE. No entregar a estudiantes. Este documento orienta la corrección con la pauta 2026 (criterios A1 a E4). Las respuestas son referenciales: se acepta todo razonamiento bien fundamentado y coherente con los datos del caso.' },
  { h: '1. Resumen del caso' },
];

module.exports = [
// =====================================================================
{
  n: 1, tema: 'Insuficiencia cardíaca descompensada',
  blocks: [
    ...COMUN_INICIO(),
    { p: 'Hombre de 67 años, hipertenso hace 20 años con tratamiento irregular, fumador y con obesidad (IMC 32,9). Lleva seis meses con fatiga y ahogo progresivo; la última semana empeora con ahogo al acostarse, crisis de ahogo nocturno y más edema. Se hospitaliza por insuficiencia cardíaca descompensada con fracción de eyección reducida (FEVI 35 %).' },
    { p: 'Es el paciente típico del Programa de Salud Cardiovascular (PSCV) del CESFAM que llega al hospital por mala adherencia: el corazón, después de años trabajando contra una presión alta, se agrandó y dejó de bombear bien.' },

    { h: '2. Fisiopatología esperada (Bloque B)' },
    { p: 'Idea central que el grupo debe explicar con sus palabras: la hipertensión mantenida engrosa y luego debilita el ventrículo izquierdo. Al bombear menos, la sangre se acumula "hacia atrás" (pulmones: ahogo, crépitos, congestión en la radiografía) y el riñón, al recibir menos flujo, retiene sal y agua (edema, aumento de peso). Esa retención sobrecarga aún más al corazón: es un círculo vicioso.' },
    { t: { head: ['Dato del caso', 'Qué significa', 'Por qué ocurre'], rows: [
      ['NT-proBNP 1.890 pg/mL', 'Corazón sobrecargado', 'El ventrículo dilatado libera esta hormona cuando se estira.'],
      ['Creatinina 1,9 mg/dL · BUN 38 mg/dL', 'Función renal disminuida (VFG ≈ 38 mL/min)', 'El riñón recibe menos sangre por la falla cardíaca (síndrome cardiorrenal).'],
      ['Sodio 132 mEq/L', 'Sodio bajo por dilución', 'Se retiene más agua que sal.'],
      ['Potasio 3,4 mEq/L', 'Potasio bajo', 'Pérdida por diuréticos (tiazida en casa, furosemida en el hospital).'],
      ['Hemoglobina 11,8 g/dL', 'Anemia leve', 'Frecuente en IC y ERC; empeora la fatiga.'],
      ['Ortopnea, ahogo nocturno, crépitos en bases', 'Congestión pulmonar', 'Al acostarse vuelve más sangre al pulmón y el corazón no la alcanza a mover.'],
      ['Edema (++) con fóvea, nicturia', 'Retención de líquido', 'De noche, acostado, el riñón recibe más flujo y elimina el líquido acumulado.'],
    ] } },

    { h: '3. Fármacos prioritarios y rol de enfermería (Bloque C)' },
    { t: { head: ['Fármaco', 'Para qué se usa aquí', 'Qué debe vigilar enfermería'], rows: [
      ['Furosemida 20 mg c/12 h EV', 'Eliminar el exceso de líquido.', 'Diuresis y balance, peso diario, potasio y creatinina, presión arterial (hipotensión).'],
      ['Enalapril 10 mg/día', 'Bajar la carga del corazón y proteger el riñón a largo plazo.', 'PA antes de administrar, potasio, creatinina, tos seca.'],
      ['Espironolactona 25 mg/día', 'Ayuda a eliminar líquido y mejora la sobrevida en IC.', 'Potasio (sube), función renal.'],
      ['Bisoprolol 10 mg/día', 'Proteger el corazón a largo plazo.', 'FC y PA antes de cada dosis; no administrar si FC < 55–60 lpm o PA baja sin consultar.'],
      ['Empagliflozina 10 mg/día', 'Disminuye hospitalizaciones por IC.', 'Hidratación, infecciones urinarias/genitales; disponibilidad limitada en APS.'],
    ] } },
    { p: 'Se aceptan otros tres fármacos si el grupo justifica su relación con el cuadro. Lansoprazol o heparina, solos, no cumplen el criterio C1 (no tratan el problema principal).' },

    { h: '4. Errores intencionales que el grupo debiera detectar (criterio C3)' },
    { t: { head: ['Indicación', 'Problema', 'Respuesta esperada'], rows: [
      ['Bisoprolol 10 mg/día de inicio', 'Es la dosis máxima. En un paciente descompensado y sin betabloqueo previo puede empeorar la falla.', 'Iniciar con dosis baja (1,25 mg/día) cuando esté compensado y subir de a poco.'],
      ['Sin peso diario ni restricción hídrica', 'Son las dos medidas básicas de control de una IC.', 'Peso diario en ayunas, misma balanza; restricción de líquidos según indicación médica.'],
      ['Potasio 3,4 sin reposición', 'Con furosemida seguirá bajando; riesgo de arritmias.', 'Avisar al médico, proponer reposición y control de electrolitos.'],
      ['Sonda Foley "para diuresis estricta"', 'Paciente vigil y cooperador: la sonda aumenta el riesgo de infección urinaria (IAAS).', 'Medir diuresis con recolector o pato; retirar la sonda lo antes posible (norma MINSAL de IAAS).'],
      ['Lansoprazol sin indicación clara', 'No hay factores de riesgo de sangrado digestivo descritos.', 'Cuestionar su necesidad.'],
    ] } },

    { h: '5. Proceso de enfermería según Orem (Bloques A y D)' },
    { p: '**Requisitos de autocuidado alterados:** aire (disnea, congestión), agua (exceso de volumen), actividad y reposo (fatiga), eliminación (nicturia, sonda), interacción social (dejó su trabajo). Del desarrollo: adulto mayor que pierde su rol de proveedor. Desviación de la salud: no sabe manejar su enfermedad (adherencia irregular a fármacos y dieta).' },
    { p: '**Sistema de enfermería:** parcialmente compensatorio durante la hospitalización; de apoyo-educativo hacia el alta, con la esposa como apoyo.' },
    { p: '**Diagnósticos prioritarios (ejemplos válidos):**' },
    { ol: [
      'Exceso de volumen de líquidos r/c falla de los mecanismos reguladores (corazón que bombea poco) m/p edema (++) en extremidades inferiores, ortopnea, crépitos en bases y NT-proBNP elevado.',
      'Intolerancia a la actividad r/c desequilibrio entre el aporte y la demanda de oxígeno m/p fatiga, disnea de pequeños esfuerzos y abandono de su trabajo.',
    ] },
    { p: 'También son válidos: disminución del gasto cardíaco; autogestión ineficaz de la salud. Problemas de colaboración esperables: CP edema pulmonar agudo, CP arritmia por hipokalemia.' },
    { p: '**Objetivo ejemplo (Dx 1):** "El usuario disminuirá los signos de sobrecarga de líquido en 72 horas, con balance hídrico negativo, baja de peso de 0,5 a 1 kg diario y edema de (+) o menos."' },
    { p: '**Actividades clave:** peso diario en ayunas; balance hídrico estricto; posición semisentado; control de PA y FC antes de los fármacos; control de potasio y creatinina; educación en dieta con poca sal, autocontrol de peso y signos de alarma (subir más de 2 kg en 3 días, más ahogo, más edema).' },
    { p: '**Criterios de evaluación:** peso, balance hídrico, grado de edema, frecuencia respiratoria y saturación, capacidad de caminar en sala sin ahogo.' },

    { h: '6. Contexto chileno que el grupo puede incorporar' },
    { ul: [
      'La HTA es una patología GES; el paciente debiera estar en control en el PSCV de su CESFAM (a tres cuadras de su casa).',
      'Al alta: contrarreferencia al CESFAM, control precoz con enfermera del PSCV y médico, retiro de fármacos en la farmacia del CESFAM.',
      'Programa de cesación tabáquica disponible en APS.',
      'Trabajo informal sin licencia médica: impacto económico real en la familia.',
    ] },

    { h: '7. Preguntas sugeridas para la defensa individual (E4)' },
    { t: { head: ['Pregunta', 'Respuesta esperada (resumen)'], rows: [
      ['¿Por qué el paciente necesita dormir con 3 almohadas?', 'Al acostarse vuelve más sangre al pulmón; sentado disminuye la congestión.'],
      ['¿Qué controla antes de administrar bisoprolol?', 'FC y PA; no administrar si hay bradicardia o hipotensión sin consultar.'],
      ['¿Por qué es importante el peso diario?', 'Es el mejor indicador de retención de líquido; 1 kg ≈ 1 litro.'],
      ['¿Qué riesgo tiene el potasio de 3,4 con furosemida?', 'Seguirá bajando; riesgo de arritmias.'],
      ['¿Qué le enseñaría a la familia antes del alta?', 'Dieta con poca sal, peso diario, adherencia a fármacos, signos de alarma y controles en el CESFAM.'],
    ] } },
  ],
},
// =====================================================================
{
  n: 2, tema: 'Enfermedad renal crónica con daño renal agudo por AINE',
  blocks: [
    ...COMUN_INICIO(),
    { p: 'Mujer de 58 años, con HTA, diabetes tipo 2 y enfermedad renal crónica etapa 4 (creatinina basal 2,0 mg/dL). Por una lumbalgia compra ibuprofeno en la farmacia y lo toma 4 días sin indicación. Llega deshidratada, hipotensa, con poca orina, potasio alto y la creatinina subió a 3,0 mg/dL: daño renal agudo sobre su enfermedad crónica.' },
    { p: 'Es un caso muy frecuente en Chile: automedicación con antiinflamatorios de venta libre en una persona con riñones ya enfermos.' },

    { h: '2. Fisiopatología esperada (Bloque B)' },
    { p: 'Idea central: un riñón enfermo depende de que le llegue suficiente sangre. Tres cosas se sumaron para cortarle el flujo: la deshidratación (menos volumen), el ibuprofeno (cierra la "llave de entrada" de sangre al riñón al bloquear las prostaglandinas) y el losartán (que en esta situación impide que el riñón compense). Resultado: el riñón filtra aún menos, retiene potasio y ácidos, y aparece la oliguria.' },
    { t: { head: ['Dato del caso', 'Qué significa', 'Por qué ocurre'], rows: [
      ['Creatinina 3,0 (basal 2,0 mg/dL)', 'Daño renal agudo (subió 1,5 veces)', 'Menor flujo de sangre al riñón.'],
      ['BUN 72 mg/dL (BUN/creatinina 24)', 'Patrón "prerrenal"', 'La deshidratación eleva más el BUN que la creatinina.'],
      ['Potasio 5,8 mEq/L', 'Potasio alto', 'El riñón no lo elimina; el losartán lo retiene más.'],
      ['pH 7,34 · HCO₃ 19', 'Acidosis metabólica compensada', 'El riñón no elimina ácidos; la respiración compensa (PCO₂ 37).'],
      ['Calcio 8,1 con albúmina 3,0', 'Calcio corregido ≈ 8,9 (normal)', 'Parece bajo porque falta albúmina.'],
      ['Fósforo 5,2 · Hb 10,2', 'Fósforo alto y anemia', 'Propios de la ERC avanzada.'],
      ['PA 92/58 · FC 112 · mucosas secas', 'Deshidratación', 'Pérdida de volumen; el corazón compensa acelerándose.'],
      ['Glasgow 14 (desorientada)', 'Compromiso de conciencia leve', 'Deshidratación y acumulación de toxinas (uremia).'],
    ] } },

    { h: '3. Fármacos prioritarios y rol de enfermería (Bloque C)' },
    { t: { head: ['Fármaco', 'Relevancia en el caso', 'Qué debe vigilar enfermería'], rows: [
      ['Ibuprofeno (causa)', 'Desencadenó el daño renal.', 'Educar: en ERC no se usan AINE; preferir paracetamol.'],
      ['Losartán', 'Útil a largo plazo, pero dañino con deshidratación y potasio alto.', 'PA, potasio, creatinina; consultar antes de administrar.'],
      ['Metformina / glibenclamida', 'Contraindicadas con esta función renal.', 'Riesgo de acidosis (metformina) e hipoglicemia (glibenclamida).'],
      ['Suero fisiológico', 'Recuperar el volumen.', 'PA, FC, diuresis, crépitos y edema (riesgo de sobrecarga en ERC).'],
      ['Paracetamol', 'Analgesia segura en ERC.', 'Dosis máxima diaria.'],
    ] } },

    { h: '4. Errores intencionales que el grupo debiera detectar (criterio C3)' },
    { t: { head: ['Indicación', 'Problema', 'Respuesta esperada'], rows: [
      ['"Continuar losartán y amlodipino"', 'Con PA 92/58, potasio 5,8 y daño renal agudo empeoran la situación.', 'Suspender ambos hasta recuperar la PA y la función renal; consultar al médico.'],
      ['"Suspender metformina temporalmente"', 'Con VFG < 30 está contraindicada en forma definitiva. La glibenclamida ni se menciona y también está contraindicada.', 'Suspender ambas y manejar la glicemia con insulina según esquema.'],
      ['Suero a 50 mL/h', 'Poco volumen para una paciente hipotensa y taquicárdica.', 'Punto de discusión: bolo inicial con reevaluación vs. cautela por la ERC. Se valora que el grupo argumente.'],
    ] } },

    { h: '5. Proceso de enfermería según Orem (Bloques A y D)' },
    { p: '**Requisitos de autocuidado alterados:** agua (deshidratación), alimentación (no sigue dieta, inapetencia), eliminación (oliguria), actividad y reposo (fatiga), prevención de riesgos (automedicación). Del desarrollo: mujer de 58 años, separada, con trabajo físico y presión económica. Desviación de la salud: no comprende ni maneja su ERC; temor a la diálisis.' },
    { p: '**Sistema de enfermería:** parcialmente compensatorio al ingreso; de apoyo-educativo hacia el alta, incorporando a la hija (con su sobrecarga académica).' },
    { p: '**Diagnósticos prioritarios (ejemplos válidos):**' },
    { ol: [
      'Déficit de volumen de líquidos r/c pérdida de líquidos e ingesta insuficiente m/p PA 92/58, FC 112, mucosas secas, llene capilar enlentecido y oliguria.',
      'Autogestión ineficaz de la salud r/c conocimiento insuficiente del tratamiento y dificultades económicas m/p automedicación con ibuprofeno e incumplimiento de la dieta.',
    ] },
    { p: 'Problemas de colaboración esperables: CP hiperkalemia (arritmias), CP progresión de la ERC, CP sobrecarga de volumen con la hidratación.' },
    { p: '**Objetivo ejemplo (Dx 1):** "La usuaria recuperará un volumen adecuado en 48 horas, con PA sistólica ≥ 100 mmHg, FC < 100 lpm y diuresis ≥ 0,5 mL/kg/h."' },
    { p: '**Actividades clave:** control de signos vitales y diuresis horaria; balance hídrico; vigilar crépitos y edema durante la hidratación; control de potasio y aviso precoz; monitorización ECG si el potasio sube; educación sobre fármacos prohibidos en ERC, dieta y cuándo consultar.' },
    { p: '**Criterios de evaluación:** PA, FC, diuresis, potasio y creatinina en descenso, estado de conciencia, capacidad de la usuaria para nombrar los medicamentos que debe evitar.' },

    { h: '6. Contexto chileno que el grupo puede incorporar' },
    { ul: [
      'En Chile el ibuprofeno se compra sin receta: la educación sobre automedicación es responsabilidad de todo el equipo, incluido el químico farmacéutico del CESFAM.',
      'HTA y diabetes tipo 2 son patologías GES; la ERC se controla en el PSCV del CESFAM y en nefrología. La diálisis (ERC terminal) también es GES.',
      'FONASA B: copago cero en la red pública; el problema económico es el ingreso, no el costo de la atención.',
      'Hija universitaria como cuidadora parcial: evaluar sobrecarga y apoyos de la red (hermana).',
    ] },

    { h: '7. Preguntas sugeridas para la defensa individual (E4)' },
    { t: { head: ['Pregunta', 'Respuesta esperada (resumen)'], rows: [
      ['¿Por qué el ibuprofeno dañó el riñón?', 'Disminuye el flujo de sangre que entra al riñón; con deshidratación el efecto es mayor.'],
      ['¿Qué haría antes de administrar losartán?', 'Controlar PA, potasio y creatinina; con estos valores consultar para suspenderlo.'],
      ['¿Qué riesgo tiene un potasio de 5,8?', 'Arritmias; vigilar ECG, avisar y evitar alimentos ricos en potasio.'],
      ['¿Por qué el calcio de 8,1 no es realmente bajo?', 'Hay que corregirlo por la albúmina baja: queda en ≈ 8,9.'],
      ['¿Qué le enseñaría al alta?', 'Evitar AINE, dieta indicada, no automedicarse, asistir a controles y consultar si orina menos.'],
    ] } },
  ],
},
// =====================================================================
{
  n: 3, tema: 'Neumonía adquirida en la comunidad',
  blocks: [
    ...COMUN_INICIO(),
    { p: 'Hombre de 66 años, hipertenso, obeso (IMC 35) y fumador intenso (IPA 49), jubilado hace un año con síntomas depresivos. Consulta por 6 días de fiebre, tos con expectoración y ahogo que llega a ser de reposo. Ingresa con saturación de 85 %, frecuencia respiratoria de 30 y gases con retención de CO₂: neumonía neumocócica grave.' },
    { p: 'La esposa es su única cuidadora y está sobrecargada. El tabaquismo hace muy probable una EPOC que nunca se ha diagnosticado.' },

    { h: '2. Fisiopatología esperada (Bloque B)' },
    { p: 'Idea central: el neumococo llena los alvéolos de la base derecha con pus y líquido (condensación). Esa zona no recibe aire, por lo que baja el oxígeno. Además, el paciente está agotado de respirar rápido y probablemente tiene pulmones dañados por el cigarro: ya no logra eliminar el CO₂ y este se acumula (acidosis respiratoria). La infección provoca fiebre, aumento de los glóbulos blancos y de la PCR.' },
    { t: { head: ['Dato del caso', 'Qué significa', 'Por qué ocurre'], rows: [
      ['SpO₂ 85 % · PaO₂ 52 mmHg', 'Falta de oxígeno (hipoxemia)', 'Alvéolos ocupados que no intercambian gases.'],
      ['PaCO₂ 54 · pH 7,30 · HCO₃ 26', 'Acidosis respiratoria aguda', 'Agotamiento y probable EPOC: no elimina el CO₂.'],
      ['Leucocitos 21.800 · PCR 108 · T 38,7 °C', 'Infección bacteriana importante', 'Respuesta del organismo al neumococo.'],
      ['FR 30 · FC 122', 'Respuesta sistémica a la infección', 'Compensación de la hipoxemia y la fiebre.'],
      ['BUN 26 · diuresis 150 mL · pliegue (+)', 'Deshidratación', 'Fiebre, respiración rápida y poca ingesta.'],
      ['Glucosa 170 sin diabetes', 'Hiperglicemia de estrés', 'Hormonas del estrés durante la infección.'],
      ['CURB-65 = 3', 'Neumonía grave', 'Urea elevada, FR ≥ 30 y edad ≥ 65 años.'],
    ] } },

    { h: '3. Fármacos prioritarios y rol de enfermería (Bloque C)' },
    { t: { head: ['Fármaco', 'Para qué se usa aquí', 'Qué debe vigilar enfermería'], rows: [
      ['Ceftriaxona', 'Antibiótico contra el neumococo.', 'Tomar cultivos ANTES de la primera dosis; alergias; respuesta (fiebre, PCR).'],
      ['Oxígeno', 'Corregir la hipoxemia.', 'Saturación objetivo y signos de retención de CO₂ (somnolencia).'],
      ['Berodual (fenoterol + ipratropio)', 'Abrir la vía aérea.', 'FC (el fenoterol taquicardiza), temblor, técnica de nebulización.'],
      ['Enoxaparina', 'Prevenir trombosis por reposo.', 'Dosis, sitio de punción, sangrado, plaquetas.'],
      ['Paracetamol', 'Fiebre y dolor pleurítico.', 'Temperatura, dolor; dosis máxima diaria.'],
    ] } },

    { h: '4. Errores intencionales que el grupo debiera detectar (criterio C3)' },
    { t: { head: ['Indicación', 'Problema', 'Respuesta esperada'], rows: [
      ['O₂ para saturación > 92 %', 'Retiene CO₂: con demasiado oxígeno puede respirar menos y acumular más CO₂.', 'Objetivo de saturación 88–92 %; vigilar conciencia y control de gases.'],
      ['Manejo en sala sin evaluar gravedad', 'CURB-65 de 3 es neumonía grave.', 'Plantear evaluación por UPC y monitorización estrecha.'],
      ['Enoxaparina 40 mg c/12 h', 'La dosis preventiva habitual es 40 mg cada 24 h.', 'Cuestionar la frecuencia.'],
      ['Ceftriaxona sola', 'En neumonía grave hospitalizada las guías suelen agregar un macrólido.', 'Consultar el esquema según guía local.'],
    ] } },

    { h: '5. Proceso de enfermería según Orem (Bloques A y D)' },
    { p: '**Requisitos de autocuidado alterados:** aire (hipoxemia, secreciones), agua (deshidratación), alimentación (régimen líquido), eliminación (oliguria, sin deposiciones), actividad y reposo (adinamia), interacción social (aislamiento, ánimo depresivo). Del desarrollo: jubilación mal adaptada. Desviación de la salud: tabaquismo y baja adherencia.' },
    { p: '**Sistema de enfermería:** parcialmente compensatorio (cercano a totalmente compensatorio por su gravedad); de apoyo-educativo hacia el alta, incluyendo a la esposa.' },
    { p: '**Diagnósticos prioritarios (ejemplos válidos):**' },
    { ol: [
      'Deterioro del intercambio de gases r/c ocupación de los alvéolos por la infección m/p SpO₂ 85 %, PaO₂ 52, PaCO₂ 54, somnolencia y uso de musculatura accesoria.',
      'Limpieza ineficaz de las vías aéreas r/c secreciones abundantes y espesas m/p tos con expectoración mucopurulenta, roncus y crépitos.',
    ] },
    { p: 'También son válidos: hipertermia; dolor agudo (pleurítico); cansancio del rol de cuidador (esposa); afrontamiento ineficaz. Problemas de colaboración: CP insuficiencia respiratoria, CP sepsis.' },
    { p: '**Objetivo ejemplo (Dx 1):** "El usuario mejorará su oxigenación en 48 horas, manteniendo saturación entre 88 y 92 %, FR < 24 y sin compromiso de conciencia."' },
    { p: '**Actividades clave:** posición semisentado; oxigenoterapia con Venturi y control de saturación; control de gases; kinesioterapia y estímulo de la tos; hidratación y balance; control de temperatura; cultivos antes del antibiótico; vigilar conciencia; apoyo y evaluación de la esposa como cuidadora.' },
    { p: '**Criterios de evaluación:** saturación, FR, conciencia, temperatura, características de la expectoración, PCR y leucocitos en descenso.' },

    { h: '6. Contexto chileno que el grupo puede incorporar' },
    { ul: [
      'La neumonía de manejo ambulatorio en personas de 65 años y más es GES; este caso es grave y requiere hospitalización.',
      'Vacunas del Programa Nacional de Inmunizaciones para mayores de 65 años: antineumocócica e influenza anual.',
      'En el CESFAM: programa ERA (enfermedades respiratorias del adulto) para estudiar la probable EPOC y programa de cesación tabáquica.',
      'La depresión en personas de 15 años y más es GES; derivar a salud mental en APS.',
      'Esposa cuidadora: aplicar escala de Zarit y conectar con la red local de apoyos y cuidados.',
    ] },

    { h: '7. Preguntas sugeridas para la defensa individual (E4)' },
    { t: { head: ['Pregunta', 'Respuesta esperada (resumen)'], rows: [
      ['¿Por qué no conviene saturarlo sobre 92 %?', 'Retiene CO₂; el exceso de oxígeno puede empeorar la hipercapnia.'],
      ['¿Qué hace antes de la primera dosis de antibiótico?', 'Tomar hemocultivos y cultivo de expectoración.'],
      ['Interprete los gases del caso.', 'Acidosis respiratoria aguda con hipoxemia.'],
      ['¿Qué signo le haría avisar de inmediato?', 'Más somnolencia, saturación < 88 %, FR > 30, hipotensión.'],
      ['¿Qué hace por la esposa?', 'Evaluar sobrecarga (Zarit), educar y activar la red de apoyo.'],
    ] } },
  ],
},
// =====================================================================
{
  n: 4, tema: 'Hipoglicemia severa en adulta mayor',
  blocks: [
    ...COMUN_INICIO(),
    { p: 'Mujer de 73 años, viuda hace un año, vive sola en Pudahuel; sus hijos y nietos viven en Antofagasta. Es diabética usuaria de insulina NPH y metformina, hipertensa e hipotiroidea. Por su ánimo bajo come y bebe poco, y ella misma ha ido cambiando su dosis de insulina. Una vecina la encuentra confundida y sudorosa: llega con glicemia de 53 mg/dL, deshidratada y desorientada.' },
    { p: 'El fondo del caso es la soledad y el duelo, que alteran el autocuidado de una paciente que antes era adherente.' },

    { h: '2. Fisiopatología esperada (Bloque B)' },
    { p: 'Idea central: la insulina NPH sigue actuando 12 a 18 horas aunque la paciente no coma. Si come poco y se inyecta igual (o más), el azúcar baja. El cerebro depende casi solo de la glucosa, por eso aparecen confusión y desorientación. Al mismo tiempo el cuerpo libera adrenalina, que causa sudor, temblor y taquicardia. Su función renal está algo disminuida (VFG ≈ 43 mL/min), por lo que la insulina se elimina más lento y su efecto dura más.' },
    { t: { head: ['Dato del caso', 'Qué significa', 'Por qué ocurre'], rows: [
      ['Glicemia 52–53 mg/dL con confusión', 'Hipoglicemia severa', 'Insulina sin ingesta suficiente.'],
      ['Sudoración, temblor, FC 113', 'Respuesta de alarma (adrenalina)', 'El cuerpo intenta subir la glucosa.'],
      ['Glasgow 14, desorientada', 'Falta de glucosa en el cerebro', 'El cerebro no tiene reserva de energía.'],
      ['PA 98/62 · llene capilar 6 s · mucosas secas', 'Deshidratación con mala perfusión', 'Baja ingesta de líquidos.'],
      ['Hematocrito 43 %', 'Sangre concentrada', 'Por la deshidratación.'],
      ['Creatinina 1,3 mg/dL', 'Función renal disminuida', 'Edad y diabetes; prolonga el efecto de la insulina.'],
      ['Cuerpos cetónicos negativos · gases normales', 'Sin cetoacidosis ni acidosis', 'Descarta otras causas metabólicas.'],
      ['TSH 3,2', 'Tiroides controlada', 'El hipotiroidismo no explica el cuadro.'],
    ] } },

    { h: '3. Fármacos prioritarios y rol de enfermería (Bloque C)' },
    { t: { head: ['Fármaco', 'Relevancia en el caso', 'Qué debe vigilar enfermería'], rows: [
      ['Glucosa al 30 % (4 ampollas = 24 g)', 'Corregir la hipoglicemia de inmediato.', 'Vía venosa permeable (es irritante), glicemia a los 15 minutos, conciencia.'],
      ['Insulina NPH (causa)', 'Su efecto prolongado explica el riesgo de nueva hipoglicemia.', 'Suspender o ajustar según indicación; no autoajustar en casa.'],
      ['Metformina', 'Con VFG ≈ 43 requiere ajuste de dosis.', 'Función renal, tolerancia oral.'],
      ['Ondansetrón', 'Controlar náuseas para que pueda comer.', 'En adulta mayor: mareo, estreñimiento, alteraciones del ECG.'],
      ['Suero fisiológico', 'Corregir la deshidratación.', 'PA, FC, diuresis y crépitos (riesgo de sobrecarga a su edad).'],
    ] } },

    { h: '4. Errores intencionales que el grupo debiera detectar (criterio C3)' },
    { t: { head: ['Indicación', 'Problema', 'Respuesta esperada'], rows: [
      ['HGT después de la carga y luego cada 6 horas, sin suero glucosado', 'La NPH sigue actuando: alto riesgo de nueva hipoglicemia en esas 6 horas.', 'Suero glucosado al 10 % de mantención, HGT cada 1 hora hasta estabilizar y luego cada 2–4 horas; suspender NPH.'],
      ['Clexane 60 mg c/24 h', 'No corresponde a dosis preventiva (40 mg) ni de tratamiento (1 mg/kg c/12 h).', 'Cuestionar la dosis.'],
      ['Reposo absoluto', 'En adulta mayor favorece el deterioro funcional y las caídas al levantarse.', 'Reposo relativo asistido una vez estable.'],
      ['Bolo de 1.000 mL', 'Volumen alto de una vez a los 73 años.', 'Punto de discusión: bolos más pequeños y reevaluación.'],
    ] } },

    { h: '5. Proceso de enfermería según Orem (Bloques A y D)' },
    { p: '**Requisitos de autocuidado alterados:** agua y alimentación (ingesta insuficiente), actividad y reposo (debilidad), soledad e interacción social (aislamiento), prevención de riesgos (autoajuste de insulina, vive sola). Del desarrollo: adulta mayor en duelo por viudez y lejos de su familia. Desviación de la salud: maneja mal la insulina cuando come poco.' },
    { p: '**Sistema de enfermería:** totalmente compensatorio al ingreso (confusión); parcialmente compensatorio al recuperarse; de apoyo-educativo hacia el alta, con la familia a distancia y la red local (vecina, CESFAM).' },
    { p: '**Diagnósticos prioritarios (ejemplos válidos):**' },
    { ol: [
      'Riesgo de nivel de glucemia inestable r/c manejo inadecuado de la insulina e ingesta alimentaria insuficiente (diagnóstico de riesgo: sin "m/p").',
      'Déficit de volumen de líquidos r/c ingesta insuficiente de líquidos m/p PA 98/62, FC 113, mucosas secas y llene capilar de 6 segundos.',
    ] },
    { p: 'También son válidos: aislamiento social; duelo; riesgo de caídas. Problema de colaboración: CP hipoglicemia recurrente.' },
    { p: '**Objetivo ejemplo (Dx 1):** "La usuaria mantendrá glicemias entre 100 y 180 mg/dL durante las próximas 24 horas, sin nuevos episodios de hipoglicemia."' },
    { p: '**Actividades clave:** glicemia capilar frecuente; vía venosa permeable; protocolo de hipoglicemia a mano; alimentación asistida apenas tolere; control de conciencia; prevención de caídas; escucha activa y pesquisa de depresión; contacto con la familia; educación sobre qué hacer si come poco (no inyectarse la dosis completa sin consultar, regla del 15/15).' },
    { p: '**Criterios de evaluación:** glicemias en rango, conciencia normal (Glasgow 15), hidratación, ingesta, capacidad de explicar cómo reconocer y tratar una hipoglicemia.' },

    { h: '6. Contexto chileno que el grupo puede incorporar' },
    { ul: [
      'Diabetes tipo 2, HTA e hipotiroidismo (desde los 15 años) son patologías GES; la paciente está en el PSCV de su CESFAM.',
      'Las personas usuarias de insulina reciben en APS glucómetro y cintas: verificar que sepa usarlo y registrar.',
      'EMPAM (examen anual del adulto mayor) y programa Más Adultos Mayores Autovalentes en el CESFAM.',
      'Pesquisa de depresión (GES) y derivación a salud mental en APS; considerar visita domiciliaria.',
      'Red de apoyo: vecina, junta de vecinos, familia a distancia (videollamadas, contacto diario).',
    ] },

    { h: '7. Preguntas sugeridas para la defensa individual (E4)' },
    { t: { head: ['Pregunta', 'Respuesta esperada (resumen)'], rows: [
      ['¿Por qué la paciente puede volver a hacer una hipoglicemia?', 'La NPH sigue actuando muchas horas; por eso se necesita suero glucosado y controles frecuentes.'],
      ['¿Qué síntomas de hipoglicemia presentó?', 'Sudoración, temblor y taquicardia (alarma) y confusión (falta de glucosa en el cerebro).'],
      ['¿Qué le enseñaría para la casa?', 'Comer aunque tenga poco apetito, no autoajustar la insulina sin consultar, regla del 15/15, uso del glucómetro.'],
      ['¿Por qué el reposo absoluto no es adecuado?', 'Deterioro funcional y caídas en adulta mayor.'],
      ['¿Qué rol tiene el duelo en este caso?', 'Es la causa de fondo: altera la ingesta y el autocuidado; requiere apoyo y derivación.'],
    ] } },
  ],
},
];
