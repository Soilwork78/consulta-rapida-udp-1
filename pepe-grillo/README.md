# Pepe Grillo — copiloto clínico por audio (prototipo)

Pepe Grillo es una **herramienta para el turno, dirigida a enfermeras y enfermeros profesionales** (no a estudiantes): un asistente que la enfermera de urgencia escucha por un audífono y que le recuerda las tareas de cada paciente según el contexto clínico. Pepe no enseña: da la señal breve para que no se escape nada, y solo dice lo que cambia el resultado del paciente. El resto queda en la tarjeta, y el fundamento se entrega solo si se pide ("fundamento" o "por qué"). **Es un prototipo: no usar con pacientes reales hasta validar el contenido y cumplir los requisitos regulatorios.**

## Modelo de capas

| Capa | Se activa cuando | Contenido |
|---|---|---|
| 0. General | Ingresa el paciente | Flujograma de atención, identificación, categorización y comunicación ISBAR |
| 1. Motivo de consulta | Triage o motivo de consulta (sin esperar al médico) | Acciones inmediatas y banderas rojas |
| 2. Diferenciales | Durante la evaluación | Hipótesis ordenadas con las graves primero y los hallazgos que las distinguen |
| 3. Diagnóstico confirmado | El médico confirma el diagnóstico (y puede cambiarlo o descartarlo) | Algoritmo específico con hitos de tiempo |

Principios:
- Pepe Grillo habla solo cuando la enfermera se lo pide o en los **hitos de tiempo**. No recita.
- **Las banderas rojas van primero.** Nunca entrega un "diagnóstico probable" único.
- Enfermería **comunica hallazgos y pregunta** por la hipótesis médica. No diagnostica.
- Cada recomendación lleva su fuente.

## Cómo se usa

La enfermera le habla a Pepe (o escribe la frase en la demo):

| Frase | Qué hace Pepe |
|---|---|
| "Pepe, ingresa box 3, hombre de 58 años con dolor torácico, el médico sospecha SCA" | Dice quién es y el punto más urgente (ECG en 10 min), y programa los recordatorios |
| "sigue" / "continúa" / "dale" / "avanza" / "qué más" | Dice el siguiente punto del protocolo. Pepe avanza solo cuando la enfermera lo pide |
| "detente" / "detente ahí" / "espera" / "pausa" | Pepe se calla de inmediato, incluso a mitad de frase, y se queda en ese punto hasta que le digan "sigue". Los recordatorios de tiempo siguen activos |
| "repite" / "anterior" | Repite el punto actual o vuelve al anterior |
| "Pepe, box 3 confirmado IAM con supradesnivel" | Dice el algoritmo del diagnóstico confirmado y sus hitos |
| "Pepe, box 3 descartado SCA" | Cancela los recordatorios y dice lo que aún falta descartar |

| "Pepe, doble chequeo de heparina en BIC, box 3" | Guía el doble chequeo paso a paso; se responde sin decir "Pepe": "listo", "sí", "no", un número, "repite" o "cancelar" |

**La enfermera marca el ritmo.** Pepe dice un punto a la vez, en orden de prioridad: primero lo más urgente, luego el protocolo local, los demás tips, las banderas rojas, los exámenes, lo que falta descartar y el contacto. "Sigue" funciona también con otro box ("box 5, sigue"). Los recordatorios de tiempo son la única excepción: suenan aunque nadie pregunte.

Si la frase calza con dos motivos de consulta (por ejemplo fiebre y confusión), Pepe lo advierte.

## Registro y evolución de enfermería

Durante la atención, la enfermera dicta y Pepe anota con la hora:

| Frase | Queda en |
|---|---|
| "refiere dolor opresivo desde las 12:30…" / "anamnesis próxima: …" | Anamnesis próxima |
| "antecedentes: hipertenso, diabético…" | Anamnesis remota |
| "fármacos: …" / "alergias: niega" | Fármacos habituales / alergias |
| "signos vitales: presión 158 sobre 94, FC 102…" | Signos vitales (Pepe los repite para confirmar) |
| "ECG tomado", "aspirina 300 administrada", "vía venosa 18 instalada" | Procedimientos, con hora |
| "examen físico: …" / "hallazgos: …" | O |
| "análisis: …" | A |
| "plan: …" | P |
| "evaluación: dolor disminuye…" | E |
| "anota: …" | Observaciones |

Pepe agrega solo los hitos que ya conoce: la sospecha médica, los cambios de fase y el resultado del doble chequeo y del checklist de fibrinólisis. Con **"redacta la evolución"** entrega un borrador editable en formato **SOAPIE, sin diagnósticos de enfermería**:

- **Encabezado:** fecha, hora y turno ("Evolución de enfermería jueves 01/10/2026 a las 21:30 hrs, turno nocturno, box 4"), identificación (sexo y edad; nombre y RUT se completan en la ficha) y **diagnóstico médico actual**.
- **Contexto clínico** (antes de la S): los hitos del equipo médico que Pepe registró (sospecha, fases, decisiones).
- **S:** anamnesis próxima y remota, fármacos habituales, alergias y **EVA** (la reporta el paciente).
- **O:** valoración en el orden de la visita de enfermería: **neurológico** (conciencia, orientación, Glasgow) → **hemodinámico** → **ventilatorio** → **alimentación y metabólico** → **examen físico céfalo-caudal** (Pepe ordena los hallazgos dictados por segmento: piel, cabeza, cuello, tórax, abdomen, genitourinario, extremidades, dorso) → respuesta emocional y familia. Cada signo vital va con su **valor exacto, hora e interpretación** ("bradicárdica (FC 54 lpm, 21:30)", "taquipneica", "saturando 89%, con hipoxemia", "afebril"), en masculino o femenino según el paciente.
- **A:** solo el análisis de enfermería dictado.
- **P:** solo el plan dictado. Pepe no lo propone.
- **I:** intervenciones agrupadas en el orden en que se leen, de la evaluación inicial a la salida del paciente: monitorización y ECG → accesos venosos y exámenes → fármacos → preparación, educación y confort → coordinación y traslado. Dentro de cada grupo van por hora. Al final, los tiempos de atención.
- Lo que la enfermera dice en primera persona queda **impersonal**: "avisé a hemodinamia" → "Se avisa a hemodinamia"; "le di aspirina" → "Se administra aspirina". Pepe reconoce acciones como tomé, instalé, administré, avisé, activé, coordiné, preparé, marqué, eduqué, entregué, trasladé o suspendí. Lo que no reconoce no lo guarda: pide empezar con "anota".
- **E:** la evaluación dictada y, además, la evolución objetiva de los parámetros medidos más de una vez (por ejemplo, EVA 8/10 → 3/10), sin interpretar.
- **Cierre:** dispositivos invasivos (los dictados y los que salen de los procedimientos, como la VVP), **evaluación de riesgos** (caídas, LPP: "riesgo de caída alto, Braden 16") y exámenes pendientes ("pendiente: troponina de control").
- **Firma** y nombre y título profesional al final.
- Criterios tomados de la guía *Visita de Enfermería* (Cuidados de Enfermería II, 2026), Potter-Perry y Kozier: basada en hechos, precisa, completa, oportuna y organizada. Sin indicaciones médicas. Si se dicta una frase vacía ("sin cambios", "sin novedad"), Pepe avisa que se describa lo valorado.

**Horas automáticas.** Todo lo dictado queda con su hora, sin decirla. Además:
- Si la enfermera **dice la hora** ("tomé ECG a las 10:05", "vía instalada hace 20 minutos"), queda esa hora y no la del dictado. Se toma la más reciente dentro de las últimas 12 horas ("a las 10" dicho a las 22:30 es 22:00). Una hora futura no se usa.
- La **hora de inicio del dolor** se toma de la anamnesis ("desde las 12:30", "a las 8", "hace 2 horas").
- Los **recordatorios registran**: a "¿ECG ya tomado?" basta responder "sí" y queda anotado con la hora de la confirmación (marcado como "confirmado al recordatorio", porque el hecho pudo ser antes). "No" o "todavía no" lo deja pendiente.
- **Pepe no pregunta lo que ya está anotado**: si el ECG se dictó antes del minuto 5, ese recordatorio no suena.
- **Tiempos con las metas del GES** (garantías de oportunidad del problema de salud n.º 5, [auge.minsal.cl](https://auge.minsal.cl/problemasdesalud/index/5)), en pantalla, en la evolución y en voz ("Pepe, tiempos"):
  - **Sospecha → ECG: ≤ 30 min.** La sospecha es cuando la enfermera informa "sospecha SCA" o "dolor torácico"; si no se informa, se cuenta desde el ingreso.
  - **Confirmación diagnóstica → trombólisis: ≤ 30 min.** La confirmación es cuando la enfermera informa "el ECG muestra supradesnivel".
  - **Decisión:** en la voz Pepe dice "ECG, meta 10 minutos" (meta clínica de las guías); el registro audita contra 30 minutos (garantía legal GES). Son dos cosas distintas a propósito.
  - Sin meta GES, solo informativos: inicio del dolor → llegada, puerta-aguja, inicio del dolor → trombólisis, diagnóstico → aviso a hemodinamia y diagnóstico → salida a pabellón.
- **Metas de la estrategia invasiva (ESC 2023)**, marcadas como "ESC" para no confundirlas con el GES:
  - **Diagnóstico → paso de la guía: ≤ 60 min** si el centro tiene hemodinamia (`hemodinamia: true` en la institución); **≤ 90 min** si hay que trasladar (`hemodinamia: false`). Sobre 120 min, la fibrinólisis habría sido mejor opción.
  - **Puerta de entrada → salida del centro: ≤ 30 min** si hay traslado a otro centro.
  - Recordatorios en voz contados **desde el diagnóstico**, no desde que se activa la fase: ¿hemodinamia avisada? (10 min), ¿ya pasó la guía? (60 y 90 min), dos horas sin guía: avisa al médico (120 min). Si el paciente se fibrinolizó, estos recordatorios no suenan ("no aplica").
  - Tras la fibrinólisis: ECG de control a los 60–90 min, rescate si no reperfunde y coronariografía entre 2 y 24 h si reperfunde (recordatorio a los 120 min).
  - "Pasó la guía" o "sale a pabellón" quedan en el registro con su hora.

**Pepe no inventa:** lo esencial que no se dictó aparece como "[falta registrar]", y Pepe lo dice en voz alta (por ejemplo "Falta registrar: alergias"). La enfermera revisa, completa y firma.

## Doble chequeo de heparina e insulina en BIC

Pepe elimina la fricción inútil (anotar, calcular de memoria, recordar los pasos) y conserva la que protege:
- Las dos enfermeras calculan la velocidad **por separado**. Pepe compara los dos resultados con su propio cálculo y, si no coinciden, detiene el chequeo.
- Pepe repite la dosis en UI/h (read-back) y compara la velocidad que muestra la pantalla de la BIC.
- Límites blandos: una dosis fuera del rango habitual, o un potasio bajo antes de iniciar insulina, obligan a confirmar con el médico.
- Al terminar deja el registro con hora y programa los controles (TTPA a las 6 h; HGT horario).

**Pepe no reemplaza a la segunda enfermera.** Si una de ellas deja de calcular porque "Pepe ya lo hace", el chequeo deja de ser independiente.

## Manos libres

En Chrome o Edge, con la página abierta desde el repositorio, el modo manos libres escucha de forma continua. Actúa cuando la frase dice "Pepe", cuando es "sigue", "qué más", "repite" o "anterior", o cuando hay un diálogo en curso, y mientras Pepe habla sigue escuchando solo órdenes cortas ("detente", "sigue", "repite"), para que la enfermera pueda interrumpirlo. Ojo: el reconocimiento de voz de Chrome envía el audio a servidores de Google. Sirve para probar el prototipo, pero no para datos reales de pacientes.

## Protocolo institucional

Cada centro tiene su archivo en `instituciones/`. `ejemplo.js` es una plantilla **ficticia** con:
- `preparaciones`: las soluciones estándar de BIC del centro.
- `tips` por sospecha o diagnóstico: van justo después del punto más urgente de la base.
- `contactos`: anexos de los códigos IAM, ACV, etc.
- `enfermeriaPorProtocolo`: los exámenes que enfermería toma por protocolo firmado. El resto aparece como "sugerir al médico".

Lo institucional complementa la base: nunca oculta las banderas rojas.

## Archivos

- `kb.js`: la base de conocimiento, que es la fuente única del contenido (incluye los tips por sospecha y los alias de voz).
- `motor.js`: interpreta la frase y arma la respuesta.
- `doble-chequeo.js`: diálogo guiado del doble chequeo en BIC.
- `checklist.js`: checklist guiado de sí / no (contraindicaciones de fibrinólisis).
- `registro.js`: registro de lo dictado y borrador de la evolución de enfermería.
- `protocolos/sca.js`: protocolo de enfermería del SCA por fases. Pruebas: `node --test pepe-grillo/motor.test.js`.
- `index.html`: demo con voz (Chrome o Edge para el micrófono). El reloj va en tiempo real; hay un modo de prueba rápida (1 min = 1 s).
- `instituciones/`: protocolos por centro.
- `REVISION.md`: versión legible para la revisión clínica. Se genera con `node pepe-grillo/generar-revision.js`.

## Foco actual: síndrome coronario agudo

Por ahora el desarrollo se concentra en **una sola patología, SCA, desde la mirada de enfermería** (`protocolos/sca.js`, revisión en `REVISION-SCA.md`). El protocolo tiene cinco fases, y Pepe cambia de fase cuando la enfermera informa lo que pasa:

| Fase | Se activa con, por ejemplo |
|---|---|
| Primer contacto (0–10 min) | "dolor torácico", "sospecha SCA" |
| IAM con supradesnivel | "el ECG muestra supradesnivel", "IAMCEST", "código IAM" |
| **Pabellón de hemodinamia** (coronariografía / ACTP) | "hemodinamia", "pabellón", "ACTP", "angioplastía", "coronariografía" |
| Fibrinólisis (antes, durante y después) | "va a fibrinólisis", "tenecteplasa" |
| SCA sin supradesnivel | "sin supradesnivel", "troponina positiva" |

**Hemodinamia primero.** En el IAMCEST, Pepe propone el pabellón de hemodinamia (angioplastía primaria) como primera opción y la fibrinólisis solo si hemodinamia no llega antes de 120 minutos (ESC 2023). Después de la fibrinólisis y en el SCASEST de alto riesgo, el camino también termina en hemodinamia (rescate, farmacoinvasiva, < 2 h o < 24 h). Si un centro no tiene hemodinamia de turno, debe decirlo en su archivo institucional: Pepe lo antepone como protocolo local.

Además:
- **"Fundamento"** o **"por qué"**: Pepe da el fundamento del paso actual, solo si se lo piden.
- **"Checklist de fibrinólisis"**: Pepe pregunta las contraindicaciones una a una. Un "sí" a una absoluta detiene el checklist; "no sé" queda como pendiente.

Los otros cuatro motivos de consulta siguen en `kb.js`, sin desarrollo nuevo.

## Motivos de consulta de la versión 0.1

1. Dolor torácico
2. Disnea / dificultad respiratoria
3. Dolor abdominal / lumbar-flanco
4. Déficit neurológico agudo / compromiso de conciencia
5. Fiebre / sospecha de sepsis

Alcance: adultos, urgencias médicas. Quedan fuera trauma, pediatría y obstetricia.
