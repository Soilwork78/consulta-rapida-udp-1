# Pepe Grillo — copiloto clínico por audio (prototipo)

Pepe Grillo es un asistente que la enfermera de urgencia escucha por un audífono y que le recuerda las tareas de cada paciente según el contexto clínico. **Por ahora es un prototipo para simulación y docencia. No es un dispositivo médico.**

## Modelo de capas

| Capa | Se activa cuando | Contenido |
|---|---|---|
| 0. General | Ingresa el paciente | Flujograma de atención, identificación, categorización y comunicación ISBAR |
| 1. Motivo de consulta | Triage o motivo de consulta (sin esperar al médico) | Acciones inmediatas y banderas rojas |
| 2. Diferenciales | Durante la evaluación | Hipótesis ordenadas con las graves primero y los hallazgos que las distinguen |
| 3. Diagnóstico confirmado | El médico confirma el diagnóstico (y puede cambiarlo o descartarlo) | Algoritmo específico con hitos de tiempo |

Principios:
- Pepe Grillo habla solo en los **hitos de tiempo** o cuando se le pregunta. No recita.
- **Las banderas rojas van primero.** Nunca entrega un "diagnóstico probable" único.
- Enfermería **comunica hallazgos y pregunta** por la hipótesis médica. No diagnostica.
- Cada recomendación lleva su fuente.

## Cómo se usa

La enfermera le habla a Pepe (o escribe la frase en la demo):

| Frase | Qué hace Pepe |
|---|---|
| "Pepe, ingresa box 3, hombre de 58 años con dolor torácico, el médico sospecha SCA" | Dice primero el protocolo local, después los 3 tips más importantes, y programa los recordatorios |
| "Pepe, más" | Dice el resto de los tips, los diagnósticos que falta descartar y el contacto |
| "Pepe, box 3 confirmado IAM con supradesnivel" | Dice el algoritmo del diagnóstico confirmado y sus hitos |
| "Pepe, box 3 descartado SCA" | Cancela los recordatorios y dice lo que aún falta descartar |

Si la frase calza con dos motivos de consulta (por ejemplo fiebre y confusión), Pepe lo advierte.

## Protocolo institucional

Cada centro tiene su archivo en `instituciones/`. `ejemplo.js` es una plantilla **ficticia** con:
- `tips` por sospecha o diagnóstico: se dicen **antes** que los tips generales.
- `contactos`: anexos de los códigos IAM, ACV, etc.
- `enfermeriaPorProtocolo`: los exámenes que enfermería toma por protocolo firmado. El resto aparece como "sugerir al médico".

Lo institucional complementa la base: nunca oculta las banderas rojas.

## Archivos

- `kb.js`: la base de conocimiento, que es la fuente única del contenido (incluye los tips por sospecha y los alias de voz).
- `motor.js`: interpreta la frase y arma la respuesta. Pruebas: `node --test pepe-grillo/motor.test.js`.
- `index.html`: demo con voz (Chrome o Edge para el micrófono) y reloj de simulación (1 min = 1 s).
- `instituciones/`: protocolos por centro.
- `REVISION.md`: versión legible para la revisión clínica. Se genera con `node pepe-grillo/generar-revision.js`.

## Motivos de consulta de la versión 0.1

1. Dolor torácico
2. Disnea / dificultad respiratoria
3. Dolor abdominal / lumbar-flanco
4. Déficit neurológico agudo / compromiso de conciencia
5. Fiebre / sospecha de sepsis

Alcance: adultos, urgencias médicas. Quedan fuera trauma, pediatría y obstetricia.
