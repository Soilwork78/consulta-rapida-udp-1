# Pepe Grillo — copiloto clínico por audio (prototipo)

Pepe Grillo es una **herramienta para el turno**: un asistente que la enfermera de urgencia escucha por un audífono y que le recuerda las tareas de cada paciente según el contexto clínico. Pepe solo dice lo que cambia el resultado del paciente; el resto queda en la tarjeta o se explica con "por qué". **Es un prototipo: no usar con pacientes reales hasta validar el contenido y cumplir los requisitos regulatorios.**

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
| Fibrinólisis (antes, durante y después) | "va a fibrinólisis", "tenecteplasa" |
| SCA sin supradesnivel | "sin supradesnivel", "troponina positiva" |
| Traslado a hemodinamia | "traslado", "angioplastía" |

Además:
- **"Por qué"**: Pepe explica el fundamento del paso actual (uso docente).
- **"Checklist de fibrinólisis"**: Pepe pregunta las contraindicaciones una a una. Un "sí" a una absoluta detiene el checklist; "no sé" queda como pendiente.

Los otros cuatro motivos de consulta siguen en `kb.js`, sin desarrollo nuevo.

## Motivos de consulta de la versión 0.1

1. Dolor torácico
2. Disnea / dificultad respiratoria
3. Dolor abdominal / lumbar-flanco
4. Déficit neurológico agudo / compromiso de conciencia
5. Fiebre / sospecha de sepsis

Alcance: adultos, urgencias médicas. Quedan fuera trauma, pediatría y obstetricia.
