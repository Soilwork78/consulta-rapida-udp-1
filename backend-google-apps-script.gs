/*
  Backend opcional para Google Apps Script + Google Sheets.
  1. Crea una planilla en Google Sheets.
  2. Extensiones > Apps Script, pega este archivo como Code.gs.
  3. Cambia TEACHER_TOKEN por una clave privada.
  4. Implementa como Web App y copia la URL /exec.
  5. En el panel docente de la app, pega:
     https://script.google.com/macros/s/.../exec?teacherToken=TU_CLAVE
*/

const SHEET_NAME = 'respuestas';
const TEACHER_TOKEN = 'cambia-esta-clave';

function doPost(e) {
  const event = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  return json_(saveEvent_(JSON.stringify(event)));
}

function doGet(e) {
  const params = (e && e.parameter) || {};
  if (params.teacherToken !== TEACHER_TOKEN) return output_(params, { ok: false, error: 'unauthorized' });
  if (params.event) return output_(params, saveEvent_(params.event));
  if (params.mode !== 'summary') return output_(params, { ok: true, message: 'backend activo' });

  const rows = getSheet_().getDataRange().getValues().slice(1);
  const byStudent = {};
  const responses = [];
  let completedUnits = 0;
  rows.forEach(row => {
    const type = row[2];
    const email = row[6] || row[4] || 'sin-id';
    if (!byStudent[email]) {
      byStudent[email] = { name: row[5] || '', email, group: row[7] || '', responses: 0, sessions: 0, units: 0 };
    }
    if (type === 'question_answered') byStudent[email].responses++;
    if (type === 'question_answered') {
      const payload = safeJson_(row[8]);
      responses.push({
        date: row[0],
        student: byStudent[email],
        sessionId: payload.sessionId || '',
        questionIndex: payload.questionIndex,
        question: payload.answer && payload.answer.question,
        selectedText: payload.answer && payload.answer.selectedText,
        correctText: payload.answer && payload.answer.correctText,
        isCorrect: payload.answer && payload.answer.isCorrect
      });
    }
    if (type === 'session_completed') byStudent[email].sessions++;
    if (type === 'unit_completed') {
      byStudent[email].units++;
      completedUnits++;
    }
  });
  return output_(params, {
    ok: true,
    totalEvents: rows.length,
    completedUnits,
    students: Object.values(byStudent),
    responses: responses.slice(-200).reverse()
  });
}

function saveEvent_(rawEvent) {
  const event = safeJson_(rawEvent);
  if (!event || !event.id) return { ok: false, error: 'evento invalido' };
  const sheet = getSheet_();
  sheet.appendRow([
    new Date(),
    event.id || '',
    event.type || '',
    event.createdAt || '',
    (event.profile && event.profile.id) || '',
    (event.profile && event.profile.name) || '',
    (event.profile && event.profile.email) || '',
    (event.profile && event.profile.group) || '',
    JSON.stringify(event.payload || {})
  ]);
  return { ok: true, eventId: event.id };
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['serverDate', 'eventId', 'type', 'clientDate', 'studentId', 'name', 'email', 'group', 'payload']);
  }
  return sheet;
}

function json_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function output_(params, data) {
  if (params && params.callback) {
    return ContentService
      .createTextOutput(params.callback + '(' + JSON.stringify(data) + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return json_(data);
}

function safeJson_(value) {
  try {
    return JSON.parse(value || '{}');
  } catch (err) {
    return {};
  }
}
