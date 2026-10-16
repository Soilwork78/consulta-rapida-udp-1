const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, Header, ImageRun,
  WidthType, AlignmentType, ShadingType, BorderStyle, LevelFormat, VerticalAlign,
} = require('docx');

const [, , DATA, LOGO, OUT_DOCX, OUT_HTML] = process.argv;
const casos = require(DATA);
const FONT = 'Calibri';
const W = 9360; // carta, márgenes 1,25"/0,75" → ancho útil
const GREY = 'E7E6E6';
const b = { style: BorderStyle.SINGLE, size: 4, color: '808080' };
const borders = { top: b, bottom: b, left: b, right: b };
const YEAR = '2026';
const TITLE = `EVALUACIÓN INTEGRATIVA: FISIOPATOLOGÍA, FARMACOLOGÍA Y CUIDADOS DE ENFERMERÍA II ${YEAR}`;

const SECCIONES = (c) => [
  ['1. Identificación del usuario', 'identificacion'],
  ['2. Antecedentes mórbidos, farmacológicos y hábitos', 'antecedentes'],
  ['3. Antecedentes familiares y sociales', 'familia'],
  ['4. Historia de la enfermedad actual', 'hea'],
  ['5. Examen físico general', 'efGeneral'],
  ['6. Examen físico segmentario', 'efSegmentario'],
  ['7. Exámenes de laboratorio e imágenes', 'examenes'],
  ['8. Diagnósticos médicos', 'diagnosticos'],
  ['9. Indicaciones médicas', 'indicaciones'],
  ...(c.evolucion ? [['10. Evolución', 'evolucion']] : []),
];

// ---------- DOCX
const run = (text, o = {}) => new TextRun({ text, font: FONT, size: o.size || 22, bold: o.bold, italics: o.italics });
const para = (text, o = {}) => new Paragraph({
  children: [run(text, o)], alignment: o.align ?? AlignmentType.JUSTIFIED,
  spacing: { before: o.before ?? 0, after: o.after ?? 120, line: 276 },
  numbering: o.num ? { reference: o.num, level: 0, instance: o.instance } : undefined,
  keepNext: o.keepNext,
});
const heading = (text) => new Paragraph({
  children: [run(text, { bold: true, size: 23 })], spacing: { before: 240, after: 120 }, keepNext: true, keepLines: true,
  border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'A6A6A6', space: 2 } },
});
const cell = (text, width, o = {}) => new TableCell({
  children: [new Paragraph({ children: [run(text, { bold: o.bold, size: 21 })], spacing: { before: 0, after: 0 }, keepNext: !o.last })],
  width: { size: width, type: WidthType.DXA }, borders, verticalAlign: VerticalAlign.CENTER,
  shading: o.fill ? { fill: o.fill, type: ShadingType.CLEAR, color: 'auto' } : undefined,
  margins: { top: 60, bottom: 60, left: 100, right: 100 },
});
const kvTable = (rows, head) => {
  const C = [3000, W - 3000];
  const out = [];
  if (head) out.push(new TableRow({ children: [cell(head[0], C[0], { bold: true, fill: GREY, last: false }), cell(head[1], C[1], { bold: true, fill: GREY, last: false })], tableHeader: true }));
  const keep = rows.length <= 16;
  rows.forEach(([k, v], i) => { const last = !keep || i === rows.length - 1;
    out.push(new TableRow({ children: [cell(k, C[0], { bold: true, fill: head ? undefined : 'F2F2F2', last }), cell(v, C[1], { last })], cantSplit: true })); });
  return new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: C, rows: out });
};
const spacer = () => new Paragraph({ children: [], spacing: { before: 0, after: 120 } });

function docxFor(c, logo) {
  const ch = [
    para(TITLE, { bold: true, align: AlignmentType.CENTER, size: 21, after: 120 }),
    para(`Situación de Enfermería N°${c.n}`, { bold: true, align: AlignmentType.CENTER, size: 26, after: 200 }),
    para('Integrantes del grupo: ______________________________________________________________', { align: AlignmentType.LEFT, after: 60 }),
    para('_____________________________________________________________________________________', { align: AlignmentType.LEFT, after: 120 }),
  ];
  for (const [t, key] of SECCIONES(c)) {
    ch.push(heading(t));
    if (key === 'identificacion') ch.push(kvTable(c.identificacion));
    else if (key === 'efGeneral') {
      ch.push(para('Signos vitales al ingreso:', { bold: true, after: 80, keepNext: true }));
      ch.push(kvTable(c.sv)); ch.push(spacer());
      c.efGeneral.forEach(p => ch.push(para(p)));
      if (c.escalas) c.escalas.forEach(e => ch.push(para(e, { num: 'bullets' })));
    } else if (key === 'efSegmentario') ch.push(kvTable(c.efSegmentario));
    else if (key === 'examenes') ch.push(kvTable(c.examenes, ['Parámetro', 'Resultado']));
    else if (key === 'diagnosticos') c.diagnosticos.forEach((d, i) => ch.push(para(d, { num: 'bullets', after: 60, keepNext: i < c.diagnosticos.length - 1 })));
    else if (key === 'indicaciones') c.indicaciones.forEach(d => ch.push(para(d, { num: 'numbers', after: 60 })));
    else c[key].forEach(p => ch.push(para(p)));
  }
  return new Document({
    creator: 'Escuela de Enfermería UDP',
    title: `Situación de Enfermería N°${c.n} – ${YEAR}`,
    styles: { default: { document: { run: { font: FONT, size: 22 } } } },
    numbering: { config: [
      { reference: 'bullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 270 } } } }] },
      { reference: 'numbers', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 360 } } } }] },
    ] },
    sections: [{
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1300, bottom: 1080, left: 1440, right: 1440, header: 500 } } },
      headers: { default: new Header({ children: [new Paragraph({ children: [new ImageRun({ type: 'png', data: logo, transformation: { width: 200, height: 54 } })] })] }) },
      children: ch,
    }],
  });
}

// ---------- HTML (para Google Docs)
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const T = 'border="1" cellpadding="5" style="border-collapse:collapse;width:100%"';
const kvHtml = (rows, head) => `<table ${T}>` +
  (head ? `<tr><td style="background:#e7e6e6;width:32%"><b>${head[0]}</b></td><td style="background:#e7e6e6"><b>${head[1]}</b></td></tr>` : '') +
  rows.map(([k, v]) => `<tr><td style="width:32%${head ? '' : ';background:#f2f2f2'}"><b>${esc(k)}</b></td><td>${esc(v)}</td></tr>`).join('') + '</table>';
const P = s => `<p style="text-align:justify">${esc(s)}</p>`;
function htmlFor(c) {
  let h = `<p style="text-align:center"><b>${TITLE}</b></p><p style="text-align:center"><b>Situación de Enfermería N°${c.n}</b></p>` +
    `<p>Integrantes del grupo: ____________________________________________________________</p>`;
  for (const [t, key] of SECCIONES(c)) {
    h += `<h3>${t}</h3>`;
    if (key === 'identificacion') h += kvHtml(c.identificacion);
    else if (key === 'efGeneral') {
      h += `<p><b>Signos vitales al ingreso:</b></p>` + kvHtml(c.sv) + c.efGeneral.map(P).join('');
      if (c.escalas) h += '<ul>' + c.escalas.map(e => `<li>${esc(e)}</li>`).join('') + '</ul>';
    } else if (key === 'efSegmentario') h += kvHtml(c.efSegmentario);
    else if (key === 'examenes') h += kvHtml(c.examenes, ['Parámetro', 'Resultado']);
    else if (key === 'diagnosticos') h += '<ul>' + c.diagnosticos.map(e => `<li>${esc(e)}</li>`).join('') + '</ul>';
    else if (key === 'indicaciones') h += '<ol>' + c.indicaciones.map(e => `<li>${esc(e)}</li>`).join('') + '</ol>';
    else h += c[key].map(P).join('');
  }
  return h;
}

(async () => {
  const logo = fs.readFileSync(LOGO);
  fs.mkdirSync(OUT_DOCX, { recursive: true }); fs.mkdirSync(OUT_HTML, { recursive: true });
  for (const c of casos) {
    fs.writeFileSync(path.join(OUT_DOCX, `2026_Situacion_de_Enfermeria_N${c.n}.docx`), await Packer.toBuffer(docxFor(c, logo)));
    fs.writeFileSync(path.join(OUT_HTML, `caso${c.n}.html`), htmlFor(c));
  }
  console.log('ok');
})();
