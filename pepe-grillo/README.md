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

## Archivos

- `kb.js`: la base de conocimiento, que es la fuente única del contenido.
- `REVISION.md`: versión legible para la revisión clínica. Se genera con `node pepe-grillo/generar-revision.js`.

## Motivos de consulta de la versión 0.1

1. Dolor torácico
2. Disnea / dificultad respiratoria
3. Dolor abdominal / lumbar-flanco
4. Déficit neurológico agudo / compromiso de conciencia
5. Fiebre / sospecha de sepsis

Alcance: adultos, urgencias médicas. Quedan fuera trauma, pediatría y obstetricia.
