# Pepe Grillo — Base de conocimiento (revisión clínica)

> **BORRADOR — pendiente validación clínica (panel Delphi)** · v0.1.0 · 2026-09-30
> Generado desde `kb.js`. No editar a mano: editar `kb.js` y regenerar.

**Alcance:** Adulto, urgencias médicas no traumáticas, no obstétricas

**Criterio de selección:** Motivos de consulta frecuentes en urgencia de adultos que además concentran cuadros tiempo-dependientes (donde un recordatorio oportuno cambia el resultado).

**Capas:** 0 General → 1 Motivo de consulta → 2 Diferenciales → 3 Diagnóstico confirmado

## Capa 0 — General (todo paciente)

- Higiene de manos y presentarse (nombre y rol)
- Identificar al paciente con 2 identificadores y verificar brazalete
- Categorizar (ESI / categorización local C1–C5)
- Signos vitales completos + EVA de dolor; HGT si compromiso de conciencia o diabetes
- Alergias, fármacos habituales (preguntar dirigidamente por anticoagulantes/antiagregantes), antecedentes
- Explicar al paciente y acompañante qué se hará; resguardar privacidad
- Evaluar riesgo de caída y de lesión por presión
- Registrar y reevaluar según tiempo de la categoría asignada

**Comunicación (ISBAR):** Identificación: [paciente, box]. Situación: [motivo, hora inicio]. Antecedentes: [relevantes, fármacos]. Evaluación: [SV, hallazgos discriminantes]. Recomendación/pregunta: [¿evaluamos X? ¿qué hipótesis maneja?]

_Enfermería comunica hallazgos y pregunta por la hipótesis médica; no emite diagnóstico médico._

- ⏱ **min 0:** ¿Paciente identificado y categorizado?
- ⏱ **min 15:** ¿Signos vitales completos registrados?

### Muestras

> ⚠️ Colores de tubo según nomenclatura habitual: **verificar con el laboratorio local**.

- Frascos de hemocultivo aerobio + anaerobio
- Tapa celeste (citrato): coagulación
- Tapa roja/amarilla (suero con gel): bioquímica
- Tapa verde (heparina de litio): bioquímica urgente en algunos laboratorios
- Tapa lila (EDTA): hemograma, banco de sangre
- Tapa gris (fluoruro): glicemia y lactato si hay demora en el procesamiento
- Jeringa heparinizada para gases (arterial o venosa), procesar < 15 min
- Frasco estéril (orina completa / urocultivo)
- Imagen o procedimiento

**Orden de llenado (CLSI GP41): hemocultivos → celeste → roja/amarilla → verde → lila → gris. Rotular junto al paciente, con fecha y hora.**

## 1. Dolor torácico

**Se activa con:** dolor torácico, dolor de pecho, opresión torácica, dolor precordial

### Capa 1 — Acciones inmediatas

- ECG de 12 derivaciones dentro de 10 min desde la llegada y mostrar al médico
- Registrar hora de inicio del dolor
- Monitor cardíaco, SpO2; O2 solo si SpO2 < 90%
- Vía venosa periférica; muestra de troponina (alta sensibilidad) según protocolo
- Presión arterial en AMBOS brazos
- Desfibrilador disponible
- No administrar antiagregante sin indicación médica (descartar disección)

### 🧪 Exámenes basales (al ingreso)

| Examen | Muestra | Detalle |
|---|---|---|
| **ECG 12 derivaciones** | — | ≤ 10 min desde la llegada; repetir si cambia el dolor. Si hay IAM inferior: V3R–V4R (VD) y V7–V9 (posterior) |
| **Troponina ultrasensible** | 🔴 Roja/amarilla | Tiempo 0 y control a 1–3 h según el algoritmo del laboratorio (ESC 0/1 h o 0/2 h). Registrar la hora exacta de cada muestra |
| **Hemograma con plaquetas** | 🟣 Lila | Anemia como causa o agravante; plaquetas antes de antitrombóticos |
| **Electrolitos plasmáticos (Na, K) y magnesio** | 🔴 Roja/amarilla | K y Mg: riesgo de arritmias |
| **Creatinina y BUN** | 🔴 Roja/amarilla | Antes de contraste (angiografía/angioTC) y para ajustar dosis |
| **Glicemia** | 🔴 Roja/amarilla |  |
| **TP/INR y TTPA** | 🔵 Celeste | Antes de anticoagular o trombolizar; clave si usa anticoagulantes |
| **Rx de tórax** | — | Portátil si está inestable; no debe retrasar la reperfusión |

### 🧪 Exámenes según evaluación

| Examen | Muestra | Cuándo / para qué |
|---|---|---|
| **Dímero D** | 🔵 Celeste | Solo con probabilidad baja/intermedia de TEP (Wells/PERC) o disección de bajo riesgo (ADD-RS ≤ 1) |
| **AngioTC de tórax / aorta** | — | Sospecha de disección o TEP. Verificar creatinina y alergia al contraste |
| **Gasometría arterial** | Jeringa gases | Hipoxemia o sospecha de TEP |
| **Ecocardiograma / POCUS** | — | Derrame pericárdico, motilidad segmentaria, dilatación del VD, aorta |
| **Lipasa** | 🔴 Roja/amarilla | Dolor epigástrico |
| **Grupo y Rh + pruebas cruzadas** | 🟣 Lila | Disección aórtica (probable cirugía) |

### 🚩 Banderas rojas

- Supradesnivel ST u otro patrón de oclusión coronaria en ECG
- Hipotensión, shock o arritmia
- Dolor desgarrante irradiado a dorso; diferencia de PAS entre brazos > 20 mmHg
- Disnea súbita con taquicardia e hipoxemia
- Síncope o déficit neurológico asociado

### Capa 2 — Diferenciales

| Diagnóstico | No perder | Hallazgos discriminantes |
|---|:-:|---|
| Síndrome coronario agudo (IAMCEST / SCASEST) | 🔴 | ECG seriado; Troponina seriada (0/1 h o 0/2 h); Dolor opresivo irradiado, diaforesis; HEART score |
| Disección aórtica | 🔴 | Dolor súbito desgarrante a dorso; Asimetría de pulsos/PA; Soplo de insuficiencia aórtica; ADD-RS |
| Tromboembolismo pulmonar | 🔴 | Disnea súbita, taquicardia, hipoxemia; Factores de riesgo TVP; Wells / PERC; Dímero D según probabilidad |
| Neumotórax a tensión | 🔴 | MP abolido unilateral; Desviación traqueal; Hipotensión + ingurgitación yugular |
| Taponamiento cardíaco | 🔴 | Tríada de Beck; Pulso paradójico; POCUS |
| Pericarditis |  | Dolor pleurítico que alivia al inclinarse adelante; Frote pericárdico; Supradesnivel ST difuso + infradesnivel PR |
| Dolor musculoesquelético / ERGE / ansiedad |  | Diagnóstico de exclusión: solo tras descartar los anteriores |

### Hitos de la capa 1

- ⏱ **min 5:** Dolor torácico: ¿ECG ya tomado?
- ⏱ **min 10:** Minuto 10: ¿el médico ya vio el ECG?
- ⏱ **min 60:** ¿Segunda troponina programada según protocolo?

### Capa 3 — IAM con supradesnivel ST (IAMCEST)

1. Activar estrategia de reperfusión: angioplastía primaria si es alcanzable ≤ 120 min desde el diagnóstico; si no, fibrinólisis dentro de 10 min del diagnóstico
2. Si fibrinólisis: aplicar checklist de contraindicaciones antes de administrar
3. AAS 150–325 mg masticable (según indicación médica y guía local)
4. Segundo antiagregante y anticoagulación según indicación médica
5. Nitrato SL solo si PAS > 90 mmHg, sin sospecha de IAM de VD y sin uso de inhibidores de PDE5
6. Opioide solo si dolor refractario
7. Monitorización continua: arritmias de reperfusión, PA, dolor, ECG post-reperfusión

**Exámenes específicos:**

| Examen | Muestra | Detalle |
|---|---|---|
| **Checklist pre-fibrinólisis** | — | Hemograma con plaquetas, TP/INR, TTPA, grupo y Rh (riesgo hemorrágico) |
| **ECG post-reperfusión** | — | 60–90 min tras la fibrinólisis o después de la angioplastía; buscar resolución del ST ≥ 50% |
| **Troponina seriada** | 🔴 Roja/amarilla | Curva según protocolo (tamaño del infarto, reinfarto) |
| **Perfil lipídico y HbA1c** | 🔴 Roja/amarilla | Dentro de 24 h (prevención secundaria); HbA1c en tubo lila |
| **Ecocardiograma** | — | Función del VI y complicaciones mecánicas |

- ⏱ **min 10:** Si va a fibrinólisis: ¿checklist de contraindicaciones listo?
- ⏱ **min 30:** ¿Reperfusión en curso o traslado a hemodinamia confirmado?
- ⏱ **min 90:** ECG de control: ¿resolución de ST ≥ 50%?

**Fuentes:**

- 2025 ACC/AHA/ACEP/NAEMSP/SCAI Guideline for the Management of Acute Coronary Syndromes
- 2023 ESC Guidelines for the management of acute coronary syndromes
- 2024 ESC Guidelines for peripheral arterial and aortic diseases
- 2019 ESC Guidelines on acute pulmonary embolism
- Guía Clínica GES Infarto Agudo del Miocardio — MINSAL

---

## 2. Disnea / dificultad respiratoria

**Se activa con:** disnea, falta de aire, dificultad respiratoria, ahogo

### Capa 1 — Acciones inmediatas

- Posición semisentada (salvo contraindicación)
- FR, SpO2, trabajo respiratorio: ¿puede hablar frases completas?
- O2 titulado: meta SpO2 94–98%; 88–92% si riesgo de hipercapnia (EPOC)
- Monitor, vía venosa, ECG

### 🧪 Exámenes basales (al ingreso)

| Examen | Muestra | Detalle |
|---|---|---|
| **Gasometría arterial** | Jeringa gases | pH, PaO2, PaCO2, HCO3, lactato. Registrar la FiO2 al momento de la muestra. La venosa sirve para pH/PCO2 si no hay hipoxemia grave |
| **ECG 12 derivaciones** | — | SCA, arritmia (FA), sobrecarga del VD |
| **Rx de tórax** | — | Neumonía, edema, neumotórax, derrame |
| **Hemograma** | 🟣 Lila | Leucocitosis, anemia |
| **PCR (proteína C reactiva)** | 🔴 Roja/amarilla |  |
| **Electrolitos, creatinina, BUN, glicemia** | 🔴 Roja/amarilla |  |

### 🧪 Exámenes según evaluación

| Examen | Muestra | Cuándo / para qué |
|---|---|---|
| **NT-proBNP / BNP** | 🔴 Roja/amarilla | Sospecha de IC aguda (un valor bajo la hace improbable) |
| **Troponina ultrasensible** | 🔴 Roja/amarilla | Sospecha de SCA, TEP o miocarditis |
| **Dímero D** | 🔵 Celeste | Probabilidad de TEP baja/intermedia |
| **AngioTC de tórax** | — | Probabilidad alta de TEP o dímero D positivo |
| **Hemocultivos ×2 + cultivo de expectoración** | Frascos HC | Neumonía grave o criterios de sepsis, antes del antibiótico |
| **Antígenos urinarios de neumococo y Legionella** | Frasco estéril | Neumonía grave (CURB-65 ≥ 3) |
| **Panel viral respiratorio (PCR: influenza, SARS-CoV-2, VRS)** | — | Temporada de virus o para decidir aislamiento. Hisopado nasofaríngeo |
| **PEF (flujo espiratorio máximo)** | — | Asma: antes y 15–20 min después del broncodilatador |
| **POCUS pulmonar** | — | Líneas B (edema), ausencia de deslizamiento pleural (neumotórax), derrame |

### 🚩 Banderas rojas

- SpO2 < 90% pese a O2, FR > 30 o < 8
- Uso de musculatura accesoria, tórax silente, cianosis
- Estridor, angioedema o urticaria (vía aérea / anafilaxia)
- Compromiso de conciencia o agotamiento
- Hipotensión

### Capa 2 — Diferenciales

| Diagnóstico | No perder | Hallazgos discriminantes |
|---|:-:|---|
| Anafilaxia / obstrucción de vía aérea | 🔴 | Exposición a alérgeno; Urticaria, angioedema, estridor; Hipotensión |
| Neumotórax a tensión | 🔴 | MP abolido unilateral; Hipotensión, ingurgitación yugular |
| Tromboembolismo pulmonar | 🔴 | Inicio súbito, taquicardia; Pulmón "limpio" con hipoxemia; Wells |
| Edema pulmonar agudo / IC aguda | 🔴 | Ortopnea, crepitaciones bibasales; Edema EEII, ingurgitación yugular; BNP / NT-proBNP |
| SCA con equivalente anginoso | 🔴 | ECG; Troponina; Diabético o adulto mayor |
| Crisis asmática grave | 🔴 | Sibilancias o tórax silente; PEF < 50% del predicho |
| Exacerbación de EPOC |  | Antecedente de EPOC; Aumento de disnea y expectoración purulenta; Gasometría: hipercapnia |
| Neumonía |  | Fiebre, crepitaciones focales; Rx tórax; CURB-65 |

### Hitos de la capa 1

- ⏱ **min 5:** Disnea: ¿SpO2 en meta?
- ⏱ **min 15:** ¿ECG tomado?

### Capa 3 — Anafilaxia

1. Adrenalina IM 0,01 mg/kg (máx 0,5 mg) en cara anterolateral del muslo — sin retraso
2. Repetir cada 5 min si no hay respuesta
3. Retirar alérgeno; posición supina con EEII elevadas (semisentado si predomina disnea)
4. O2 alto flujo, 2 vías venosas, bolo de cristaloides si hipotensión
5. Observación por riesgo de reacción bifásica

**Exámenes específicos:**

| Examen | Muestra | Detalle |
|---|---|---|
| **Triptasa sérica** | 🔴 Roja/amarilla | Entre 1 y 2 h desde el inicio (máx. 4 h); una basal a las 24 h confirma el diagnóstico. NO retrasa la adrenalina |

- ⏱ **min 0:** Anafilaxia: ¿adrenalina IM administrada?
- ⏱ **min 5:** Minuto 5: ¿respuesta? Si no, evaluar segunda dosis de adrenalina

### Capa 3 — Exacerbación de EPOC

1. O2 controlado: meta SpO2 88–92%
2. Broncodilatadores de acción corta según indicación
3. Corticoide sistémico y antibiótico según indicación médica
4. Gasometría: si pH < 7,35 y PaCO2 > 45 mmHg, evaluar VMNI

**Exámenes específicos:**

| Examen | Muestra | Detalle |
|---|---|---|
| **Gasometría arterial de control** | Jeringa gases | 30–60 min después de ajustar el O2 o iniciar VMNI |
| **Rx de tórax** | — | Neumonía o neumotórax como gatillantes |
| **Cultivo de expectoración** | — | Si la expectoración es purulenta o hay exacerbaciones frecuentes |

- ⏱ **min 30:** EPOC: ¿gasometría de control tomada? Evaluar indicación de VMNI

**Fuentes:**

- GINA 2025 — Global Strategy for Asthma Management and Prevention
- GOLD 2025 Report
- 2021 ESC Heart Failure Guidelines + 2023 Focused Update
- World Allergy Organization Anaphylaxis Guidance 2020
- BTS Guideline for oxygen use in adults 2017

---

## 3. Dolor abdominal / lumbar-flanco

**Se activa con:** dolor abdominal, dolor de estómago, dolor lumbar, dolor de flanco, dolor de espalda baja

### Capa 1 — Acciones inmediatas

- Signos vitales, EVA, HGT
- Test de embarazo en toda mujer en edad fértil
- Régimen cero hasta evaluación médica
- Vía venosa
- Analgesia según indicación médica: no retrasarla, no enmascara el diagnóstico

### 🧪 Exámenes basales (al ingreso)

| Examen | Muestra | Detalle |
|---|---|---|
| **β-hCG (orina o sangre)** | Frasco estéril | Toda mujer en edad fértil, ANTES de imágenes con radiación |
| **Hemograma** | 🟣 Lila | Leucocitosis, anemia (sangrado) |
| **PCR (proteína C reactiva)** | 🔴 Roja/amarilla |  |
| **Electrolitos, creatinina, BUN, glicemia** | 🔴 Roja/amarilla | Deshidratación, IRA, antes de contraste |
| **Perfil hepático** | 🔴 Roja/amarilla | Bilirrubina total y directa, GOT, GPT, FA, GGT (vía biliar) |
| **Lipasa** | 🔴 Roja/amarilla | Más específica que la amilasa (pancreatitis: > 3 veces el valor normal) |
| **Orina completa con sedimento** | Frasco estéril | Leucocitos/nitritos (ITU), hematíes (cólico renal) |
| **ECG 12 derivaciones** | — | Mayor de 50 años, diabético o dolor epigástrico (IAM inferior) |

### 🧪 Exámenes según evaluación

| Examen | Muestra | Cuándo / para qué |
|---|---|---|
| **Urocultivo** | Frasco estéril | Sospecha de ITU alta, ANTES del antibiótico |
| **Hemocultivos ×2** | Frascos HC | Fiebre con criterios de sepsis, colangitis |
| **Lactato** | Jeringa gases | Sospecha de isquemia mesentérica o sepsis (un valor normal NO descarta isquemia) |
| **TP/INR, TTPA, fibrinógeno** | 🔵 Celeste | Sangrado, probable cirugía, hepatopatía |
| **Grupo y Rh + pruebas cruzadas** | 🟣 Lila | AAA, embarazo ectópico, hemorragia digestiva, probable cirugía |
| **POCUS / eFAST** | — | Paciente inestable: aorta, líquido libre, hidronefrosis |
| **Ecografía abdominal** | — | Vía biliar, apendicitis (joven/embarazada), riñón (obstrucción) |
| **Ecografía transvaginal** | — | β-hCG positiva con dolor o sangrado (ectópico) |
| **TC de abdomen y pelvis con contraste** | — | Apendicitis en adulto, isquemia, perforación, obstrucción |
| **PieloTC (TC sin contraste)** | — | Cólico renal: tamaño y ubicación del cálculo |

### 🚩 Banderas rojas

- Hipotensión o shock
- Abdomen en tabla / signos peritoneales
- Dolor desproporcionado al examen físico (isquemia mesentérica)
- > 60 años con dolor lumbar o de flanco súbito, masa pulsátil (aneurisma aórtico)
- Mujer en edad fértil con dolor + sangrado o hipotensión (embarazo ectópico)
- Hematemesis / melena
- Fiebre + ictericia + dolor (colangitis)

### Capa 2 — Diferenciales

| Diagnóstico | No perder | Hallazgos discriminantes |
|---|:-:|---|
| Aneurisma aórtico abdominal roto | 🔴 | Edad, tabaquismo, HTA; Masa pulsátil; Hipotensión; POCUS aorta |
| Embarazo ectópico roto | 🔴 | β-hCG positiva; Amenorrea, sangrado; Hipotensión |
| Isquemia mesentérica | 🔴 | Fibrilación auricular; Dolor desproporcionado; Lactato |
| Perforación / obstrucción intestinal | 🔴 | Vómitos, distensión, sin deposiciones ni gases; Peritonismo |
| IAM de pared inferior | 🔴 | Dolor epigástrico en diabético o adulto mayor; ECG |
| Pielonefritis (± obstrucción) | 🔴 | Fiebre; Puño percusión (+); Disuria; Sedimento urinario |
| Apendicitis aguda |  | Migración periumbilical → FID; McBurney / Blumberg; Score de Alvarado |
| Colecistitis / cólico biliar |  | Dolor en HD posprandial; Murphy (+); Ecografía |
| Cólico renal |  | Dolor cólico lumbar irradiado a genitales; Hematuria; Sin fiebre |
| Lumbago mecánico |  | Relación con movimiento; Sin fiebre ni alteraciones urinarias; Sin banderas rojas neurológicas (cauda equina) |

### Hitos de la capa 1

- ⏱ **min 5:** Dolor abdominal: ¿test de embarazo solicitado si corresponde?
- ⏱ **min 30:** ¿Analgesia administrada y dolor reevaluado?

### Capa 3 — Pielonefritis aguda

1. Urocultivo (y hemocultivos si hay criterios de sepsis) ANTES del antibiótico, sin retrasarlo
2. Antibiótico según indicación médica y epidemiología local
3. Tamizaje de sepsis (ver motivo "Fiebre / sospecha de sepsis")
4. Descartar obstrucción (ecografía): pielonefritis obstructiva = urgencia urológica

**Exámenes específicos:**

| Examen | Muestra | Detalle |
|---|---|---|
| **Orina completa + urocultivo** | Frasco estéril | Segundo chorro con aseo previo, o por sondeo si no es posible. Antes del antibiótico |
| **Hemocultivos ×2** | Frascos HC | Si hay sepsis, hospitalización o inmunosupresión |
| **Hemograma, PCR, creatinina, ELP** | 🔴 Roja/amarilla | Hemograma en tubo lila |
| **Ecografía renal y vesical** | — | Hidronefrosis o absceso |
| **TC con contraste** | — | Si no mejora a las 48–72 h, hay sepsis grave o sospecha de absceso |

- ⏱ **min 60:** Pielonefritis: ¿antibiótico administrado? ¿cultivos tomados antes?

### Capa 3 — Aneurisma aórtico abdominal roto

1. Activar cirugía vascular de inmediato
2. 2 vías venosas gruesas, pruebas cruzadas, protocolo de transfusión masiva
3. Hipotensión permisiva según indicación médica (paciente consciente)
4. No retrasar el traslado a pabellón por imágenes si está inestable

**Exámenes específicos:**

| Examen | Muestra | Detalle |
|---|---|---|
| **Grupo y Rh + pruebas cruzadas** | 🟣 Lila | Reserva según el protocolo de transfusión masiva. Es la PRIMERA muestra |
| **Hemograma, TP/INR, TTPA, fibrinógeno** | 🔵 Celeste | Hemograma en tubo lila. Coagulopatía asociada a la transfusión masiva |
| **Gasometría con lactato y calcio iónico** | Jeringa gases | Acidosis; hipocalcemia por citrato durante la transfusión |
| **Electrolitos, creatinina** | 🔴 Roja/amarilla |  |
| **POCUS de aorta** | — | Si está inestable. AngioTC SOLO si está hemodinámicamente estable |

- ⏱ **min 0:** AAA roto: ¿cirujano vascular avisado?
- ⏱ **min 15:** ¿Hemoderivados disponibles?

**Fuentes:**

- EAU Guidelines on Urological Infections 2025
- ESVS 2024 Clinical Practice Guidelines on Abdominal Aorto-Iliac Artery Aneurysms
- WSES Jerusalem Guidelines on acute appendicitis 2020
- Tokyo Guidelines 2018 (colangitis / colecistitis)

---

## 4. Déficit neurológico agudo / compromiso de conciencia

**Se activa con:** debilidad de un lado, no puede hablar, boca chueca, confusión, compromiso de conciencia, convulsión

### Capa 1 — Acciones inmediatas

- HGT INMEDIATO (la hipoglicemia simula un ACV)
- Hora de inicio / última vez visto normal
- BE-FAST y Glasgow; activar código ACV si es positivo
- Signos vitales; vía venosa
- Régimen cero hasta test de deglución
- Preguntar por anticoagulantes y hora de la última dosis

### 🧪 Exámenes basales (al ingreso)

| Examen | Muestra | Detalle |
|---|---|---|
| **HGT capilar** | — | INMEDIATO. Es el único examen obligatorio antes de trombolizar |
| **TC de cerebro sin contraste** | — | Puerta-TC ≤ 20–25 min. Descarta hemorragia |
| **AngioTC de vasos intra- y extracraneales** | — | En la misma sesión si puede ser candidato a trombectomía; no esperar la creatinina |
| **Hemograma con plaquetas** | 🟣 Lila |  |
| **TP/INR y TTPA** | 🔵 Celeste | No esperar el resultado para trombolizar, SALVO que use anticoagulantes o se sospeche coagulopatía |
| **Electrolitos (Na), creatinina, glicemia** | 🔴 Roja/amarilla | La hiponatremia causa compromiso de conciencia |
| **Troponina** | 🔴 Roja/amarilla | Sin retrasar la trombólisis |
| **ECG 12 derivaciones** | — | FA como fuente embólica |

### 🧪 Exámenes según evaluación

| Examen | Muestra | Cuándo / para qué |
|---|---|---|
| **TC de perfusión / RM con difusión** | — | Hora de inicio desconocida o ventana de 6–24 h |
| **Anti-Xa / tiempo de trombina** | 🔵 Celeste | Usuario de anticoagulante oral directo (apixabán, rivaroxabán, dabigatrán) |
| **Gasometría, calcio, magnesio, perfil hepático** | Jeringa gases | Compromiso de conciencia sin focalidad (Ca iónico en la gasometría; Mg y perfil hepático en tubo rojo/amarillo) |
| **Amonio** | 🟣 Lila | Hepatópata. Tubo lila o verde según el laboratorio, en hielo, y procesar de inmediato |
| **Screening de drogas en orina y alcoholemia** | Frasco estéril | Sospecha de intoxicación (alcoholemia en tubo gris) |
| **Niveles plasmáticos de antiepilépticos** | 🔴 Roja/amarilla | Epiléptico conocido con crisis (fenitoína, ácido valproico) |
| **Hemocultivos ×2 → punción lumbar** | Frascos HC | Sospecha de meningitis: hemocultivos y antibiótico SIN esperar la punción; PL después de la TC (citoquímico, Gram, cultivo, panel PCR) |
| **EEG** | — | Sospecha de status no convulsivo (no despierta tras la crisis) |

### 🚩 Banderas rojas

- Glasgow ≤ 8 (proteger vía aérea)
- Inicio < 4,5 h (ventana de trombólisis) o < 24 h (evaluar trombectomía)
- Cefalea explosiva, "la peor de mi vida" (HSA)
- Convulsión persistente > 5 min
- Anisocoria, bradicardia + HTA (hipertensión intracraneal)
- Fiebre + rigidez de nuca

### Capa 2 — Diferenciales

| Diagnóstico | No perder | Hallazgos discriminantes |
|---|:-:|---|
| Hipoglicemia | 🔴 | HGT < 70 mg/dL; Diabético con insulina o sulfonilurea |
| ACV isquémico | 🔴 | Déficit focal de inicio súbito; NIHSS; TC sin sangrado |
| Hemorragia intracraneal / HSA | 🔴 | Cefalea intensa, vómitos; Anticoagulación; TC |
| Status epiléptico | 🔴 | Convulsión > 5 min o sin recuperación entre crisis |
| Meningitis / encefalitis | 🔴 | Fiebre, rigidez de nuca; Petequias |
| Intoxicación | 🔴 | Fármacos disponibles; Pupilas; Toxíndromes |
| Estado postictal / parálisis de Todd |  | Convulsión presenciada; Mordedura de lengua; Recuperación progresiva |
| Delirium por causa sistémica (sepsis, hiponatremia) |  | Adulto mayor; Curso fluctuante; Sin focalidad |

### Hitos de la capa 1

- ⏱ **min 0:** ¿HGT tomado?
- ⏱ **min 10:** ¿Hora de inicio registrada? ¿Código ACV activado si corresponde?

### Capa 3 — ACV isquémico candidato a trombólisis

1. Meta: puerta-aguja ≤ 60 min (ideal ≤ 45)
2. PA < 185/110 mmHg antes de trombolizar; < 180/105 las 24 h siguientes
3. Alteplasa 0,9 mg/kg (máx 90 mg; 10% en bolo en 1 min, resto en 60 min) o tenecteplasa 0,25 mg/kg (máx 25 mg) en bolo, según protocolo local
4. Control neurológico y de PA: cada 15 min por 2 h, cada 30 min por 6 h, luego cada 1 h hasta las 24 h
5. Sin antiagregantes ni anticoagulantes por 24 h; evitar SNG, sonda vesical y punciones arteriales si es posible
6. Deterioro neurológico, cefalea o vómitos: suspender la infusión y avisar de inmediato

**Exámenes específicos:**

| Examen | Muestra | Detalle |
|---|---|---|
| **Glicemia antes de trombolizar** | — | Obligatoria (HGT) |
| **TC de cerebro de control** | — | A las 24 h, ANTES de iniciar antiagregantes; urgente si hay deterioro |
| **Estudio etiológico** | 🔴 Roja/amarilla | Perfil lipídico, HbA1c (tubo lila); ECG/Holter (FA), ecocardiograma, estudio de vasos de cuello |

- ⏱ **min 20:** Código ACV: ¿TC realizado?
- ⏱ **min 45:** Minuto 45: ¿trombolítico administrado o decisión tomada?

### Capa 3 — Hipoglicemia sintomática

1. Glucosa hipertónica EV según protocolo local; si no hay acceso venoso, glucagón 1 mg IM
2. Si está consciente y deglute: 15–20 g de glucosa oral
3. HGT de control a los 15 min; repetir si sigue < 70 mg/dL
4. Si usa sulfonilurea o insulina de acción prolongada: riesgo de recurrencia, observación prolongada

**Exámenes específicos:**

| Examen | Muestra | Detalle |
|---|---|---|
| **Glicemia venosa confirmatoria** | ⚪ Gris | Tomarla junto con la vía venosa, SIN retrasar el tratamiento |
| **HGT seriado** | — | A los 15 min y luego cada 1–2 h según el fármaco causante |
| **Creatinina y ELP** | 🔴 Roja/amarilla | La ERC prolonga el efecto de sulfonilureas e insulina |
| **Insulina, péptido C, β-hidroxibutirato** | 🔴 Roja/amarilla | Solo en hipoglicemia sin causa clara (no diabético), con muestra tomada DURANTE la hipoglicemia |

- ⏱ **min 15:** Hipoglicemia: ¿HGT de control?

**Fuentes:**

- AHA/ASA Guidelines for the Early Management of Acute Ischemic Stroke (2019 y actualización vigente — verificar)
- European Stroke Organisation (ESO) guidelines on intravenous thrombolysis 2021 + tenecteplase 2023
- Guía Clínica GES Accidente Cerebrovascular Isquémico — MINSAL
- ADA Standards of Care in Diabetes 2025 — Hipoglicemia
- Neurocritical Care Society / AES guideline on status epilepticus

---

## 5. Fiebre / sospecha de sepsis

**Se activa con:** fiebre, calofríos, infección, decaimiento con fiebre

### Capa 1 — Acciones inmediatas

- Tamizaje con NEWS2 (no usar qSOFA como única herramienta)
- Buscar el foco: respiratorio, urinario, abdominal, piel/partes blandas, SNC, catéter
- Vía venosa; balance hídrico / diuresis
- Preguntar por quimioterapia o inmunosupresión

### 🧪 Exámenes basales (al ingreso)

| Examen | Muestra | Detalle |
|---|---|---|
| **Hemocultivos ×2** | Frascos HC | 2 punciones en sitios distintos, frasco aerobio + anaerobio, 8–10 mL por frasco (adulto). Si tiene catéter: 1 set por el catéter y 1 periférico. ANTES del antibiótico, sin retrasarlo |
| **Lactato** | Jeringa gases | Arterial o venoso. ≥ 2 mmol/L = hipoperfusión; ≥ 4 = alto riesgo |
| **Hemograma con recuento diferencial** | 🟣 Lila | Leucocitos, neutropenia, plaquetas (SOFA) |
| **PCR y procalcitonina** | 🔴 Roja/amarilla | Procalcitonina según disponibilidad |
| **Creatinina, BUN, electrolitos, glicemia** | 🔴 Roja/amarilla | Creatinina: componente renal del SOFA |
| **Perfil hepático con bilirrubina** | 🔴 Roja/amarilla | Bilirrubina: componente hepático del SOFA |
| **TP/INR y TTPA** | 🔵 Celeste | Coagulopatía / CID |
| **Gasometría arterial** | Jeringa gases | PaO2/FiO2 (componente respiratorio del SOFA); registrar la FiO2 |
| **Orina completa + urocultivo** | Frasco estéril | Foco urinario: la causa más frecuente en adultos mayores |
| **Rx de tórax** | — | Foco respiratorio |

### 🧪 Exámenes según evaluación

| Examen | Muestra | Cuándo / para qué |
|---|---|---|
| **Cultivos dirigidos al foco** | — | Expectoración, herida, líquido pleural o ascítico, LCR, punta de catéter (solo si se retira) |
| **Fibrinógeno y dímero D** | 🔵 Celeste | Sospecha de CID (petequias, sangrado, plaquetas en descenso) |
| **CK** | 🔴 Roja/amarilla | Fascitis necrotizante, rabdomiólisis, síndrome neuroléptico maligno |
| **TSH y T4 libre** | 🔴 Roja/amarilla | Sospecha de tormenta tiroidea |
| **Panel viral respiratorio** | — | Foco respiratorio o decisión de aislamiento |
| **Ecografía o TC según foco** | — | Foco abdominal, obstrucción urinaria, absceso |

### 🚩 Banderas rojas

- PAS < 90 mmHg o PAM < 65 mmHg
- Lactato ≥ 2 mmol/L (≥ 4: alto riesgo)
- Compromiso de conciencia; FR ≥ 22
- Piel moteada, llene capilar > 3 s, diuresis < 0,5 mL/kg/h
- Neutropenia (quimioterapia reciente)
- Petequias o púrpura (meningococcemia)
- Dolor desproporcionado o crepitación en piel (fascitis necrotizante)

### Capa 2 — Diferenciales

| Diagnóstico | No perder | Hallazgos discriminantes |
|---|:-:|---|
| Shock séptico | 🔴 | Hipotensión que requiere vasopresor; Lactato > 2 pese a volumen |
| Neutropenia febril | 🔴 | Quimioterapia reciente; RAN < 500/mm³ |
| Meningococcemia / meningitis | 🔴 | Petequias/púrpura; Rigidez de nuca; Cefalea, fotofobia |
| Fascitis necrotizante | 🔴 | Dolor desproporcionado; Crepitación, bulas; Toxicidad sistémica |
| Simuladores no infecciosos | 🔴 | Golpe de calor; Síndrome serotoninérgico / neuroléptico maligno; Tormenta tiroidea; Reacción transfusional; Pancreatitis |
| Infección localizada sin disfunción orgánica |  | NEWS2 bajo; Lactato normal; Foco claro |

### Hitos de la capa 1

- ⏱ **min 15:** Fiebre: ¿NEWS2 calculado? ¿lactato solicitado?

### Capa 3 — Sepsis / shock séptico — paquete de la hora 1

1. Lactato (repetir si inicial > 2 mmol/L)
2. Hemocultivos antes del antibiótico
3. Antibiótico de amplio espectro dentro de 1 h (shock o sepsis probable); dentro de 3 h si sepsis posible sin shock
4. Cristaloides 30 mL/kg si hay hipotensión o lactato ≥ 4 mmol/L, reevaluando la respuesta
5. Noradrenalina si PAM < 65 mmHg durante o después del volumen (vía periférica transitoria aceptable)
6. Control del foco

**Exámenes específicos:**

| Examen | Muestra | Detalle |
|---|---|---|
| **Lactato de control** | Jeringa gases | A las 2–4 h si el inicial fue > 2 mmol/L; meta: normalización |
| **Diuresis horaria** | — | Sonda Foley; meta ≥ 0,5 mL/kg/h |
| **Gasometría, creatinina, ELP, hemograma de control** | Jeringa gases | Evolución de la disfunción orgánica (creatinina/ELP en tubo rojo/amarillo, hemograma en lila) |

- ⏱ **min 30:** Sepsis: ¿hemocultivos tomados? ¿antibiótico preparado?
- ⏱ **min 60:** Hora 1: ¿antibiótico administrado?
- ⏱ **min 120:** ¿Lactato de control?

**Fuentes:**

- Surviving Sepsis Campaign: International Guidelines 2021
- Surviving Sepsis Campaign 2026 (citada en guias-clinicas-2024-2025.md — verificar cambios)
- Royal College of Physicians — NEWS2 (2017)
- IDSA/ASCO — Outpatient Management of Fever and Neutropenia

---
