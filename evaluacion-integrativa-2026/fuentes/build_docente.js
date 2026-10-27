const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, Header, ImageRun,
  WidthType, AlignmentType, ShadingType, BorderStyle, LevelFormat, VerticalAlign,
} = require('docx');

const [, , DATA, LOGO, OUT_DOCX, OUT_HTML] = process.argv;
const casos = require(DATA);
const FONT = 'Calibri';
const W = 9360;
const GREY = 'E7E6E6';
const b = { style: BorderStyle.SINGLE, size: 4, color: '808080' };
const borders = { top: b, bottom: b, left: b, right: b };
const TITLE = 'EVALUACIÓN INTEGRATIVA: FISIOPATOLOGÍA, FARMACOLOGÍA Y CUIDADOS DE ENFERMERÍA II 2026';

// **negrita** en línea
const runs = (text, o = {}) => String(text).split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map(s =>
  new TextRun({ text: s.startsWith('**') ? s.slice(2, -2) : s, bold: o.bold || s.startsWith('**'), font: FONT, size: o.size || 22 }));
const para = (text, o = {}) => new Paragraph({
  children: runs(text, o), alignment: o.align ?? AlignmentType.JUSTIFIED,
  spacing: { before: 0, after: o.after ?? 120, line: 276 }, keepNext: o.keepNext,
  numbering: o.num ? { reference: o.num, level: 0, instance: o.instance } : undefined,
});
const heading = (text) => new Paragraph({
  children: [new TextRun({ text, bold: true, size: 23, font: FONT })], spacing: { before: 240, after: 120 }, keepNext: true, keepLines: true,
  border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'A6A6A6', space: 2 } },
});
const cell = (text, width, o = {}) => new TableCell({
  children: [new Paragraph({ children: runs(text, { bold: o.bold, size: o.size || 20 }), spacing: { before: 0, after: 0 }, keepNext: !o.last })],
  width: { size: width, type: WidthType.DXA }, borders, verticalAlign: VerticalAlign.CENTER,
  shading: o.fill ? { fill: o.fill, type: ShadingType.CLEAR, color: 'auto' } : undefined,
  margins: { top: 60, bottom: 60, left: 100, right: 100 },
});
const COLS = { 2: [3700, W - 3700], 3: [2600, 3000, W - 5600] };
function table({ head, rows }) {
  const C = COLS[head.length];
  const keep = rows.length <= 10;
  return new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: C, rows: [
    new TableRow({ tableHeader: true, children: head.map((h, i) => cell(h, C[i], { bold: true, fill: GREY })) }),
    ...rows.map((r, j) => new TableRow({ cantSplit: true, children: r.map((v, i) => cell(v, C[i], { bold: i === 0, last: !keep || j === rows.length - 1 })) })),
  ] });
}
const note = (text) => new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [W], rows: [new TableRow({ children: [
  new TableCell({ children: [new Paragraph({ children: runs(text, { size: 20, bold: true }), spacing: { before: 0, after: 0 } })],
    width: { size: W, type: WidthType.DXA }, borders, shading: { fill: 'FCE4E4', type: ShadingType.CLEAR, color: 'auto' },
    margins: { top: 100, bottom: 100, left: 140, right: 140 } })] })] });
const spacer = () => new Paragraph({ children: [], spacing: { before: 0, after: 120 } });

function docxFor(c, logo) {
  let inst = 0;
  const ch = [
    para(TITLE, { bold: true, align: AlignmentType.CENTER, size: 21 }),
    para(`Situación de Enfermería N°${c.n} · VERSIÓN DOCENTE`, { bold: true, align: AlignmentType.CENTER, size: 26, after: 40 }),
    para(c.tema, { align: AlignmentType.CENTER, size: 22, after: 200 }),
  ];
  for (const bl of c.blocks) {
    if (bl.h) ch.push(heading(bl.h));
    else if (bl.p) ch.push(para(bl.p, { keepNext: bl.p.trim().endsWith(':') }));
    else if (bl.note) { ch.push(note(bl.note)); ch.push(spacer()); }
    else if (bl.t) { ch.push(table(bl.t)); ch.push(spacer()); }
    else if (bl.ul) bl.ul.forEach(x => ch.push(para(x, { num: 'bullets', after: 60 })));
    else if (bl.ol) { inst++; bl.ol.forEach(x => ch.push(para(x, { num: 'numbers', instance: inst, after: 80 }))); }
  }
  return new Document({
    creator: 'Escuela de Enfermería UDP', title: `Situación de Enfermería N°${c.n} – Versión docente 2026`,
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

// ---------- HTML para Google Docs
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
const T = 'border="1" cellpadding="5" style="border-collapse:collapse;width:100%"';
function htmlFor(c) {
  let h = `<p style="text-align:center"><b>${TITLE}</b></p><p style="text-align:center"><b>Situación de Enfermería N°${c.n} · VERSIÓN DOCENTE</b></p><p style="text-align:center">${esc(c.tema)}</p>`;
  for (const bl of c.blocks) {
    if (bl.h) h += `<h3>${esc(bl.h)}</h3>`;
    else if (bl.p) h += `<p style="text-align:justify">${esc(bl.p)}</p>`;
    else if (bl.note) h += `<table ${T}><tr><td style="background:#fce4e4"><b>${esc(bl.note)}</b></td></tr></table>`;
    else if (bl.t) h += `<table ${T}><tr>${bl.t.head.map(x => `<td style="background:#e7e6e6"><b>${esc(x)}</b></td>`).join('')}</tr>` +
      bl.t.rows.map(r => '<tr>' + r.map((v, i) => `<td>${i === 0 ? '<b>' + esc(v) + '</b>' : esc(v)}</td>`).join('') + '</tr>').join('') + '</table>';
    else if (bl.ul) h += '<ul>' + bl.ul.map(x => `<li>${esc(x)}</li>`).join('') + '</ul>';
    else if (bl.ol) h += '<ol>' + bl.ol.map(x => `<li>${esc(x)}</li>`).join('') + '</ol>';
  }
  return h;
}

(async () => {
  const logo = fs.readFileSync(LOGO);
  fs.mkdirSync(OUT_DOCX, { recursive: true }); fs.mkdirSync(OUT_HTML, { recursive: true });
  for (const c of casos) {
    fs.writeFileSync(path.join(OUT_DOCX, `2026_Situacion_de_Enfermeria_N${c.n}_Version_Docente.docx`), await Packer.toBuffer(docxFor(c, logo)));
    fs.writeFileSync(path.join(OUT_HTML, `docente${c.n}.html`), htmlFor(c));
  }
  console.log('ok');
})();
