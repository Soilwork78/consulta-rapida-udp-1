// Contenido estandarizado de las 4 situaciones de enfermería (versión 2026).
// Misma estructura en todos los casos; el texto clínico se conserva del original corregido.
module.exports = [
{
  n: 1,
  identificacion: [
    ['Sexo', 'Masculino'], ['Edad', '67 años'], ['Previsión', 'FONASA'],
    ['Ocupación', 'Jardinero (trabajo esporádico) y pensionado'],
  ],
  antecedentes: [
    'Fumador desde los 15 años (promedio 12 cigarrillos/día). Hipertensión arterial diagnosticada hace 20 años, con tratamiento irregular en base a dieta hiposódica, losartán 50 mg al día e hidroclorotiazida 25 mg al día. Refiere asistir a sus controles en CESFAM gran parte de las veces que es citado para poder recibir sus medicamentos.',
    'Alergias (-). Alcohol ocasional (1 vez a la semana, "un vaso de vino"). Antecedentes quirúrgicos: apendicectomía en la infancia (no recuerda la edad). Peso 95 kg, estatura 1,70 m, IMC 32,9 kg/m².',
  ],
  familia: [
    'Vive con su esposa y sus 2 hijos. Trabaja de manera esporádica como jardinero en un edificio cercano a su domicilio. Refiere que ha dejado de asistir a sus turnos por "sentirse muy fatigado" y ha preferido quedarse en casa. No realiza actividad física frecuente, sólo las caminatas a su trabajo cuando asiste y/o a comprar cerca del barrio. Vive de su pensión más el sueldo esporádico de su trabajo de jardinero.',
    'Su esposa es jubilada, trabaja cuidando niños de forma esporádica y es hipertensa en tratamiento, con buena adherencia a controles en CESFAM. Uno de sus hijos cursa estudios universitarios autofinanciados y el otro cursa segundo medio en un colegio municipal cercano a la vivienda. Refiere que son una familia unida y se dan apoyo en las situaciones difíciles. Vive en casa sólida con servicios básicos de luz, agua y gas. El CESFAM queda a tres cuadras de su domicilio.',
  ],
  hea: [
    'Refiere presentar desde hace 6 meses sensación de fatiga y disnea progresiva, actualmente con dificultad para realizar sus labores domésticas, agregándose en el último mes edema vespertino de extremidades inferiores y nicturia.',
    'Consulta porque hace 1 semana nota mayor compromiso del estado general (CEG), disnea de pequeño esfuerzo, debe dormir con 3 almohadas en su cabecera y presenta mayor edema en extremidades inferiores. Ha tenido algunos episodios de disnea brusca en la noche, por lo cual ha tenido que levantarse de la cama para que ceda. Consulta en servicio de urgencias, donde es evaluado y se ingresa para estudio y manejo, sospechando de insuficiencia cardíaca descompensada.',
  ],
  sv: [
    ['Presión arterial', '145/82 mmHg'], ['Frecuencia cardíaca', '89 lpm'], ['Frecuencia respiratoria', '21 rpm'],
    ['Temperatura', '36,4 °C'], ['Saturación O₂', '94 % con O₂ 1 L/min por naricera'], ['HGT', '78 mg/dL'], ['Dolor (EVA)', '0/10'],
  ],
  efGeneral: [
    'Se recibe en servicio de medicina vigil, cooperador, orientado en tiempo y espacio, obedece órdenes simples, Glasgow 15/15. No refiere dolor ni molestias, sin vómitos ni náuseas, régimen alimenticio bien tolerado. Se mantiene con taquipnea leve; refiere disnea menor que al ingreso.',
    'Mucosas hidratadas e indemnes, piel tibia y pálida. Llene capilar conservado. Vía venosa periférica #20 en extremidad superior derecha, sellada, sin signos de flebitis, con apósito protector. Se instala sonda Foley #14 para control de diuresis estricta, con salida de orina clara, 1.000 mL en 12 horas. Refiere deposiciones el día de ayer. No se observan lesiones por presión.',
  ],
  escalas: ['Riesgo de caídas: alto riesgo (escala de Downton: 3 puntos).', 'Riesgo de lesiones por presión: riesgo bajo (escala de Braden: 15 puntos).'],
  efSegmentario: [
    ['Cabeza', 'Pupilas isocóricas, reactivas a la luz.'],
    ['Tórax', 'Simétrico, apremio ventilatorio sin uso de musculatura accesoria. Murmullo pulmonar (+) disminuido en bases, con leves estertores. Tos (+) húmeda, productiva.'],
    ['Abdomen', 'Blando, depresible e indoloro a la palpación, RHA (+).'],
    ['Región dorsal', 'Sin alteraciones, puntos de apoyo sanos.'],
    ['Extremidades superiores', 'Moviliza, pulsos radiales (+) bilaterales, conserva fuerza, sin lesiones.'],
    ['Extremidades inferiores', 'Movilidad y fuerza conservadas. Edema (++) con fóvea (+), bien perfundidas, sin lesiones.'],
  ],
  examenes: [
    ['Creatinina plasmática', '1,9 mg/dL'], ['BUN', '38 mg/dL'], ['Sodio plasmático', '132 mEq/L'], ['Potasio plasmático', '3,4 mEq/L'],
    ['Hemoglobina', '11,8 g/dL'], ['NT-proBNP', '1.890 pg/mL'], ['CK-MB total y troponina T', 'Dentro de rangos normales'],
    ['Radiografía de tórax', 'Cardiomegalia principalmente a expensas de cavidades izquierdas, signos de congestión pulmonar. Aorta dilatada y calcificada.'],
    ['Electrocardiograma', 'Signos de hipertrofia ventricular izquierda.'],
    ['Ecocardiograma', 'FEVI 35 %.'],
  ],
  diagnosticos: ['Insuficiencia cardíaca descompensada.', 'Insuficiencia cardíaca con fracción de eyección reducida, estadio C.', 'Hipertensión arterial.'],
  indicaciones: [
    'Reposo relativo asistido.', 'Régimen hiposódico.', 'Control de signos vitales cada 4 horas.', 'Control de HGT cada 12 horas.',
    'Kinesioterapia respiratoria 2 veces al día y SOS.', 'Balance hídrico estricto cada 12 horas.',
    'Enalapril 10 mg al día VO.', 'Bisoprolol 10 mg al día VO.', 'Espironolactona 25 mg al día VO.', 'Empagliflozina 10 mg cada 24 horas VO.',
    'Furosemida 20 mg cada 12 horas EV, para balance hídrico negativo.', 'Heparina no fraccionada 5.000 U cada 12 horas SC.',
    'Lansoprazol 30 mg al día VO.', 'Control de exámenes AM.', 'ECG diario.',
  ],
},
{
  n: 2,
  identificacion: [
    ['Nombre', 'María Soledad Arancibia Torres'], ['Sexo', 'Femenino'], ['Edad', '58 años'], ['Previsión', 'FONASA B'],
    ['Comuna', 'Peñalolén, Región Metropolitana'], ['Ocupación', 'Empleada de aseo en colegio particular subvencionado (jornada parcial)'],
    ['Estado civil', 'Separada hace 8 años, buena relación con ex marido'], ['Escolaridad', 'Enseñanza media completa'],
  ],
  antecedentes: [
    'Hipertensión arterial diagnosticada hace 15 años, tratada irregularmente con losartán 50 mg cada 12 horas y amlodipino 5 mg al día. Diabetes mellitus tipo 2 diagnosticada hace 10 años, en tratamiento con metformina 850 mg cada 12 horas y glibenclamida 5 mg al día. No presenta alergias medicamentosas conocidas; no fuma, no consume alcohol ni drogas.',
    'El año 2022 fue diagnosticada con enfermedad renal crónica estadio 4, secundaria a nefropatía diabética e hipertensiva, actualmente en control trimestral con nefrología; en su último control, hace 3 meses, presentaba creatinina plasmática de 2,0 mg/dL. Tiene indicaciones de restricción moderada de sal y líquidos, pero reconoce que "no siempre sigue la dieta", sobre todo cuando come fuera de casa.',
  ],
  familia: [
    'Vive en un departamento arrendado con su hija universitaria de 21 años, quien suele apoyarla en el cuidado y acompañamiento a controles médicos, pero últimamente, por la alta demanda de su carga académica, no ha podido acompañarla como quisiera. La hija, además, refiere que su madre "casi no hace caso" a lo que le dicen, por lo que ya dejó de insistirle.',
    'Refiere que su situación económica es ajustada, por lo que ocasionalmente acepta trabajos extras de aseo los fines de semana. Su red de apoyo es limitada al núcleo familiar cercano (una hermana que vive en otra comuna).',
    'Durante la entrevista se muestra colaboradora, pero preocupada por su salud y por la posibilidad de necesitar diálisis en el futuro. Comenta sentirse "cansada y con poca energía últimamente", lo que ha afectado su ánimo y asistencia laboral.',
  ],
  hea: [
    'Refiere que hace una semana presentó cuadro de lumbalgia leve tras realizar labores domésticas intensas. Consultó en una farmacia del barrio donde vive y comenzó automedicación con ibuprofeno 600 mg cada 8 horas por 4 días, sin indicación médica. Posteriormente, presentó disminución progresiva de la diuresis, sensación de fatiga generalizada, cefalea, náuseas y pérdida del apetito.',
    'En los últimos tres días notó sequedad bucal, debilidad muscular, mareos al levantarse y menor frecuencia urinaria. Asiste a control en CESFAM, donde se constata hipotensión y signos de deshidratación, motivo por el cual es derivada al servicio de urgencias para evaluación médica, exámenes y tratamiento.',
  ],
  sv: [
    ['Presión arterial', '92/58 mmHg'], ['Frecuencia cardíaca', '112 lpm'], ['Frecuencia respiratoria', '22 rpm'],
    ['Temperatura', '36,4 °C'], ['Saturación O₂', '93 % ambiental'], ['HGT', '178 mg/dL'], ['Peso actual', '64 kg'],
  ],
  efGeneral: [
    'Paciente consciente, orientada parcialmente en tiempo, somnolienta pero cooperadora. Facie cansada, mucosas secas. Piel tibia, pálida, deshidratada.',
  ],
  efSegmentario: [
    ['Cabeza y cuello', 'Pupilas isocóricas, reactivas. Sin ingurgitación yugular. Cavidad oral seca.'],
    ['Tórax', 'Simétrico. Murmullo vesicular conservado, sin crépitos. Ruidos cardíacos rítmicos, taquicárdicos.'],
    ['Abdomen', 'Blando, depresible, leve dolor en flanco derecho a la palpación profunda. RHA presentes. Sin masas palpables.'],
    ['Extremidades', 'Pulsos periféricos presentes, llene capilar enlentecido. Leve edema (+) en ambos tobillos.'],
    ['Neurológico', 'Glasgow 14/15 (V4), reflejos conservados. Refiere mareos ocasionales.'],
  ],
  examenes: [
    ['Hematocrito', '32 %'], ['Hemoglobina', '10,2 g/dL'], ['BUN', '72 mg/dL'], ['Creatinina plasmática', '3,0 mg/dL'],
    ['Sodio plasmático', '133 mEq/L'], ['Potasio plasmático', '5,8 mEq/L'], ['Cloro plasmático', '96 mEq/L'],
    ['Calcio total', '8,1 mg/dL'], ['Fósforo', '5,2 mg/dL'], ['Albúmina sérica', '3,0 g/dL'],
    ['Gases arteriales', 'pH 7,34 – PCO₂ 37 mmHg – PO₂ 88 mmHg – HCO₃⁻ 19 mEq/L'],
    ['Orina completa', 'Densidad 1.015; proteínas (+); glucosa (+); cuerpos cetónicos (+); cilindros hialinos escasos.'],
    ['Electrocardiograma', 'Taquicardia sinusal, sin alteraciones agudas.'],
  ],
  diagnosticos: ['Enfermedad renal crónica estadio 4 descompensada por deshidratación y uso de AINE.', 'Lesión renal aguda prerrenal sobre enfermedad renal crónica.', 'Hiperkalemia leve.', 'Deshidratación moderada.'],
  indicaciones: [
    'Ingreso a Unidad de Medicina Aguda.', 'Régimen hipoproteico, hiposódico, pobre en potasio.',
    'Hidratación controlada con suero fisiológico 0,9 % a 50 mL/hora.', 'Control de signos vitales cada 4 horas.',
    'Balance hídrico estricto cada 8 horas.', 'Glicemia capilar cada 6 horas.', 'Suspender AINE.',
    'Paracetamol 500 mg cada 8 horas VO si dolor.', 'Continuar con losartán 50 mg cada 12 horas y amlodipino 5 mg al día.',
    'Suspender metformina temporalmente hasta reevaluación de función renal.', 'Control de función renal y electrolitos diarios.',
    'Educación a paciente y familia sobre adherencia farmacológica, hidratación y riesgos del uso de medicamentos sin indicación médica.',
    'Reevaluación por nefrología en 48 horas.',
  ],
  evolucion: [
    'Durante su primera noche de hospitalización evoluciona favorablemente, con leve mejoría del estado general tras la hidratación inicial. Se mantiene oligúrica, pero con tendencia a la normotensión. Se programa control de función renal, reevaluación por nefrología e inicio de la educación de autocuidado para el alta.',
  ],
},
{
  n: 3,
  identificacion: [
    ['Sexo', 'Masculino'], ['Edad', '66 años'], ['Ocupación', 'Jubilado hace un año (ex conductor de transporte público)'],
    ['Estado civil', 'Casado'],
  ],
  antecedentes: [
    'Hipertensión arterial, obesidad grado II y tabaquismo crónico severo (IPA 49). Tratamiento habitual con losartán 50 mg cada 12 horas y amlodipino 10 mg al día, con adherencia irregular. Peso 100 kg, talla 1,69 m, IMC 35 kg/m².',
  ],
  familia: [
    'Jubilado desde hace un año como conductor de transporte público, presenta una adaptación disfuncional al cese laboral, con una red de apoyo limitada a su cónyuge.',
    'La esposa, visiblemente sobrecargada, refiere una adherencia terapéutica y nutricional casi nula, agravada desde la jubilación. Describe un cambio conductual severo, con marcado ánimo depresivo, irritabilidad y un aislamiento social progresivo que él maneja incrementando su consumo de tabaco. Ella notó síntomas insidiosos semanas antes del cuadro agudo, como fatiga y tos, que el paciente minimizó. Finalmente, relata la tensión económica que dificulta el tratamiento y la fragilidad de su red de apoyo, situándola a ella como única cuidadora.',
  ],
  hea: [
    'Consulta por un cuadro de 6 días de evolución caracterizado por compromiso del estado general, fiebre, tos con expectoración mucopurulenta y disnea progresiva hasta hacerse de reposo. El cuadro se agrava en las últimas 24 horas por la aparición de dolor torácico de tipo pleurítico en hemitórax derecho, diaforesis profusa y adinamia marcada.',
  ],
  sv: [
    ['Presión arterial', '170/95 mmHg'], ['Frecuencia cardíaca', '122 lpm'], ['Frecuencia respiratoria', '30 rpm'],
    ['Temperatura', '38,7 °C'], ['Saturación O₂', '85 % ambiental; 91 % con máscara Venturi al 35 %'], ['HGT', '179 mg/dL'],
  ],
  efGeneral: [
    'Al ingreso se presenta en mal estado general, somnoliento pero reactivo, orientado en tiempo, espacio y persona. Por la saturación de 85 % ambiental se inicia oxigenoterapia con máscara Venturi al 35 %, logrando saturación de 91 %. Se evidencia fatigabilidad al hablar y disnea de reposo con uso de musculatura accesoria.',
    'Piel caliente y enrojecida, mucosas orales secas y signo del pliegue cutáneo positivo. Llene capilar < 2 segundos. Usa lentes ópticos y prótesis dental superior. Diuresis escasa (150 mL al ingreso), concentrada. Refiere ausencia de deposiciones en los últimos dos días.',
  ],
  efSegmentario: [
    ['Tórax', 'Refiere dolor torácico tipo punzante en base pulmonar derecha, que aumenta con la inspiración profunda. Tos efectiva, con expectoración mucopurulenta de moderada cantidad. A la auscultación, crépitos bilaterales y roncus en base pulmonar derecha, con murmullo pulmonar disminuido y dolor pleurítico persistente al tope inspiratorio.'],
    ['Abdomen', 'Globuloso, distendido, RHA presentes, sin dolor a la palpación.'],
    ['Región dorsal', 'Sin lesiones ni dolor a la puñopercusión.'],
    ['Extremidades inferiores', 'Sin hallazgos patológicos, pulsos periféricos palpables, pies fríos al tacto.'],
  ],
  examenes: [
    ['Leucocitos', '21.800/mm³ (neutrófilos 90 %)'], ['PCR', '108 mg/L'], ['Procalcitonina', '0,9 ng/mL'],
    ['Sodio plasmático', '132 mEq/L'], ['Potasio plasmático', '4,7 mEq/L'], ['Creatinina plasmática', '1,2 mg/dL'], ['BUN', '26 mg/dL'],
    ['Glucosa', '170 mg/dL'], ['Albúmina sérica', '3,2 g/dL'],
    ['Gases arteriales (FiO₂ 0,21)', 'pH 7,30 – PaCO₂ 54 mmHg – PaO₂ 52 mmHg – HCO₃⁻ 26 mEq/L – SatO₂ 85 %'],
    ['Antígeno urinario para neumococo', 'Positivo'],
    ['Radiografía de tórax', 'Condensación en base pulmonar derecha con patrón alveolar bilateral, compatible con NAC.'],
  ],
  diagnosticos: ['Neumonía adquirida en la comunidad (NAC).', 'Deshidratación leve.', 'Hipertensión arterial.', 'Obesidad.'],
  indicaciones: [
    'Control de signos vitales cada 4 horas.', 'Reposo en posición semi-Fowler.', 'Oxígeno suplementario para mantener SatO₂ > 92 %.',
    'Régimen líquido a tolerancia.', 'Nebulización con Berodual 1 mL + 3 mL de SF cada 4 horas.', 'Suero fisiológico 2.000 mL/24 horas EV.',
    'Tomar cultivo de expectoración y hemocultivos.', 'Iniciar antibiótico posterior a cultivos: ceftriaxona 1 g EV cada 12 horas.',
    'Paracetamol 1 g EV cada 8 horas.', 'Enoxaparina 40 mg SC cada 12 horas.', 'Kinesioterapia respiratoria diaria.',
    'Control de gases arteriales matinal.', 'Control de glicemia capilar cada 6 horas.',
  ],
},
{
  n: 4,
  identificacion: [
    ['Sexo', 'Femenino'], ['Edad', '73 años'], ['Comuna', 'Pudahuel'], ['Estado civil', 'Viuda (hace 1 año)'],
  ],
  antecedentes: [
    'Hipertensión arterial en tratamiento con losartán 50 mg. Diabetes mellitus tipo 2 en tratamiento con insulina NPH 14 UI y metformina 750 mg una vez al día (hora de almuerzo). Hipotiroidismo en tratamiento con levotiroxina 75 mcg en ayunas. Controla todas sus patologías con buena adherencia al tratamiento en el CESFAM de su comuna. Peso 70 kg, talla 1,58 m, IMC 28 kg/m².',
  ],
  familia: [
    'Vive sola en su casa de la comuna de Pudahuel, luego de enviudar hace 1 año. Durante los últimos 3 meses ha experimentado sentimientos de aislamiento y soledad, debido a que extraña a su marido y a sus dos hijos (de 48 y 45 años) y sus cuatro nietos, que viven en Antofagasta, con quienes se comunica por vía telefónica y WhatsApp.',
  ],
  hea: [
    'Su estado de ánimo ha afectado su ingesta de líquidos y alimentos; las glicemias se han comportado de manera inestable y ella misma ha ido ajustando las dosis de insulina NPH.',
    'Durante la tarde previa a su consulta, mientras cuidaba las plantas de su jardín, una vecina que se acerca a saludarla la nota algo desorientada y letárgica, por lo que la invita a sentarse. Al intentar comunicarse con ella, se nota confundida y con incapacidad de comunicarse de manera clara, además de sensación de debilidad y sudoración. Su vecina, asustada, llama a una ambulancia para su traslado al hospital más cercano.',
  ],
  sv: [
    ['Presión arterial', '98/62 mmHg'], ['Frecuencia cardíaca', '113 lpm'], ['Frecuencia respiratoria', '22 rpm'],
    ['Temperatura', '36,5 °C'], ['Saturación O₂', '96 % ambiental'], ['HGT', '53 mg/dL'],
  ],
  efGeneral: [
    'Al llegar al hospital se encuentra consciente pero confundida y desorientada; cree estar en el norte, en casa de sus hijos. Glasgow 14/15. Sin disnea, nauseosa.',
    'Piel pálida y sudorosa, mucosas secas, clínicamente deshidratada. Llene capilar de 6 segundos. Dado el cuadro clínico y sus antecedentes, se decide hospitalizar e iniciar terapia de su estado agudo.',
  ],
  efSegmentario: [
    ['Abdomen', 'Blando, depresible, indoloro.'],
    ['Extremidades superiores', 'Algo temblorosas.'],
    ['Extremidades inferiores', 'Sin alteraciones de la movilidad, sin edema, pulsos periféricos distales presentes aunque débiles.'],
    ['Piel y prominencias óseas', 'Indemnes.'],
  ],
  examenes: [
    ['Hematocrito', '43 %'], ['Hemoglobina', '14 g/dL'], ['Leucocitos', '8.500/mm³'], ['Plaquetas', '300.000/mm³'],
    ['Sodio plasmático', '132 mEq/L'], ['Potasio plasmático', '3,5 mEq/L'], ['Cloro plasmático', '102 mEq/L'],
    ['Creatinina plasmática', '1,3 mg/dL'], ['BUN', '28 mg/dL'], ['Glicemia', '52 mg/dL'], ['Cuerpos cetónicos en sangre', 'Negativos'],
    ['Ácido láctico', '7 mg/dL'], ['TSH', '3,2 µUI/mL'],
    ['Gases venosos', 'pH 7,40 – PCO₂ 42 mmHg – PO₂ 45 mmHg – HCO₃⁻ 25 mEq/L – SatO₂ 65 % – BE +1'],
  ],
  diagnosticos: ['Hipoglicemia severa.', 'Deshidratación.', 'Diabetes mellitus insulinorrequirente.'],
  indicaciones: [
    'Monitorización continua.', 'Reposo absoluto.', 'Instalar acceso venoso periférico.',
    'Administrar 4 ampollas de glucosa al 30 % (20 mL) vía endovenosa.',
    'Control de glicemia capilar posterior a la carga de glucosa y luego cada 6 horas.',
    'Suero fisiológico 1.000 mL en bolo y reevaluar.', 'Régimen diabético a tolerancia, asistido.',
    'Ondansetrón 8 mg EV cada 8 horas.', 'Omeprazol 20 mg EV cada 24 horas.', 'Clexane 60 mg cada 24 horas.',
  ],
},
];
