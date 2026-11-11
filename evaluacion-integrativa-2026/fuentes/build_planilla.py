"""Genera la planilla de corrección de la Evaluación Integrativa 2026 (Cuidados II)."""
import sys
from openpyxl import Workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.formatting.rule import CellIsRule, FormulaRule
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.utils import get_column_letter as L

OUT = sys.argv[1]
N_GRUPOS, N_EST = 20, 120
MAX, EXIG = 75, 0.6
APROB = MAX * EXIG  # 45 pts = 4,0

# (código, nombre corto, puntaje máximo)
CRIT = [
    ('A1', 'Valoración integral usuario y familia', 3),
    ('B1', 'Mapa fisiopatológico (×2)', 6),
    ('B2', 'Análisis de exámenes (×2)', 6),
    ('B3', 'Examen físico y SV (×2)', 6),
    ('C1', '3 fármacos del caso (×2)', 6),
    ('C2', 'Fundamentación terapéutica (×2)', 6),
    ('C3', 'Seguridad y administración (×2)', 6),
    ('D1', 'Requisitos de autocuidado', 3),
    ('D2', 'Agencia y sistema de enfermería', 3),
    ('D3', 'Diagnósticos y problemas de colaboración', 3),
    ('D4', 'Priorización de 2 diagnósticos', 3),
    ('D5', 'Objetivos', 3),
    ('D6', 'Intervenciones y actividades', 3),
    ('D7', 'Evaluación de resultados', 3),
    ('E1', 'Organización y uso del tiempo', 3),
    ('E2', 'Lenguaje y dominio del caso', 3),
    ('E3', 'Bibliografía', 3),
]
MAX_GRUPAL = sum(c[2] for c in CRIT)
assert MAX_GRUPAL == 69

NAVY, GREY, LIGHT = '1F3864', 'E7E6E6', 'F2F2F2'
BLOCK = {'A': 'DEEAF6', 'B': 'FCE4D6', 'C': 'E2EFDA', 'D': 'FFF2CC', 'E': 'EDE2F6'}
thin = Side(style='thin', color='A6A6A6')
BOX = Border(top=thin, bottom=thin, left=thin, right=thin)
WRAP_C = Alignment(horizontal='center', vertical='center', wrap_text=True)
WRAP_L = Alignment(horizontal='left', vertical='center', wrap_text=True)
fill = lambda c: PatternFill('solid', fgColor=c)


def title(ws, text, sub, ncols):
    ws.merge_cells(start_row=1, start_column=1, end_row=1, end_column=ncols)
    ws['A1'] = text
    ws['A1'].font = Font(bold=True, size=13, color='FFFFFF')
    ws['A1'].fill = fill(NAVY)
    ws['A1'].alignment = Alignment(horizontal='left', vertical='center', indent=1)
    ws.row_dimensions[1].height = 26
    ws.merge_cells(start_row=2, start_column=1, end_row=2, end_column=ncols)
    ws['A2'] = sub
    ws['A2'].font = Font(italic=True, size=9, color='595959')
    ws['A2'].alignment = WRAP_L
    ws.row_dimensions[2].height = 30


def header(ws, row, labels, fills=None):
    for i, h in enumerate(labels, 1):
        c = ws.cell(row=row, column=i, value=h)
        c.font = Font(bold=True, size=9)
        c.fill = fill((fills or {}).get(i, GREY))
        c.alignment = WRAP_C
        c.border = BOX


wb = Workbook()

# ---------------- Listas (oculta): valores numéricos para los desplegables
li = wb.active
li.title = 'Listas'
li['A1'], li['B1'] = 'Escala 0-3', 'Escala ×2'
for i, (a, b) in enumerate(zip([0, 1, 2, 3], [0, 2, 4, 6]), 2):
    li.cell(row=i, column=1, value=a)
    li.cell(row=i, column=2, value=b)
li.sheet_state = 'hidden'

# ---------------- Grupos
g = wb.create_sheet('Grupos', 0)
first = 4  # columna D = primer criterio
c_tot = first + len(CRIT)          # puntaje grupal
c_pend = c_tot + 1                 # criterios sin puntaje
c_obs = c_pend + 1                 # observaciones / errores críticos
ncols = c_obs
title(g, 'EVALUACIÓN INTEGRATIVA 2026 · CUIDADOS II – FARMACOLOGÍA – FISIOPATOLOGÍA · PLANILLA GRUPAL',
      'Una fila por grupo. Elija el puntaje de cada criterio en la lista. Error crítico = 0 en ese criterio '
      '(regístrelo en Observaciones). La nota de cada estudiante se calcula en la hoja «Estudiantes».', ncols)
labels = ['Grupo', 'Situación N°', 'Docente'] + [f'{c}\n{n}\n(máx. {m})' for c, n, m in CRIT] + \
         [f'Puntaje grupal\n(máx. {MAX_GRUPAL})', 'Criterios sin puntaje', 'Observaciones / errores críticos']
hdr_fill = {first + i: BLOCK[c[0][0]] for i, c in enumerate(CRIT)}
hdr_fill[c_tot] = 'BDD7EE'
header(g, 3, labels, hdr_fill)
g.row_dimensions[3].height = 92

last = 3 + N_GRUPOS
dv03 = DataValidation(type='list', formula1='=Listas!$A$2:$A$5', allow_blank=True,
                      showErrorMessage=True, errorTitle='Puntaje no válido', error='Use 0, 1, 2 o 3.')
dv06 = DataValidation(type='list', formula1='=Listas!$B$2:$B$5', allow_blank=True,
                      showErrorMessage=True, errorTitle='Puntaje no válido', error='Criterio ×2: use 0, 2, 4 o 6.')
dvsit = DataValidation(type='list', formula1='"1,2,3,4"', allow_blank=True)
for dv in (dv03, dv06, dvsit):
    g.add_data_validation(dv)
dvsit.add(f'B4:B{last}')
for i, (_, _, m) in enumerate(CRIT):
    col = L(first + i)
    (dv06 if m == 6 else dv03).add(f'{col}4:{col}{last}')

c1, cN = L(first), L(c_tot - 1)
for r in range(4, last + 1):
    g.cell(row=r, column=1, value=f'Grupo {r - 3}')
    g.cell(row=r, column=c_tot, value=f'=IF(COUNT({c1}{r}:{cN}{r})=0,"",SUM({c1}{r}:{cN}{r}))')
    g.cell(row=r, column=c_pend, value=f'=IF(COUNT({c1}{r}:{cN}{r})=0,"",{len(CRIT)}-COUNT({c1}{r}:{cN}{r}))')
    for col in range(1, ncols + 1):
        cell = g.cell(row=r, column=col)
        cell.border = BOX
        cell.alignment = WRAP_L if col in (3, c_obs) else WRAP_C
        if r % 2 == 0:
            cell.fill = fill(LIGHT)
    g.cell(row=r, column=c_tot).font = Font(bold=True)
    g.row_dimensions[r].height = 22

g.column_dimensions['A'].width = 10
g.column_dimensions['B'].width = 9
g.column_dimensions['C'].width = 16
for i in range(len(CRIT)):
    g.column_dimensions[L(first + i)].width = 11
g.column_dimensions[L(c_tot)].width = 11
g.column_dimensions[L(c_pend)].width = 10
g.column_dimensions[L(c_obs)].width = 40
g.freeze_panes = 'D4'
red = PatternFill('solid', fgColor='F8CBAD')
g.conditional_formatting.add(f'{L(c_pend)}4:{L(c_pend)}{last}',
                             CellIsRule(operator='greaterThan', formula=['0'], fill=red))

# ---------------- Estudiantes
e = wb.create_sheet('Estudiantes', 1)
title(e, 'NOTA INDIVIDUAL · Puntaje grupal + Defensa individual E4 (×2)',
      f'Total máximo {MAX} pts · exigencia {int(EXIG * 100)} % ({int(APROB)} pts = 4,0). '
      'Elija el grupo del estudiante y su puntaje de defensa (0-2-4-6); el resto se calcula solo.', 8)
header(e, 3, ['N°', 'Estudiante', 'Grupo', 'E4 Defensa\n(0-2-4-6)', f'Puntaje grupal\n(máx. {MAX_GRUPAL})',
              f'Total\n(máx. {MAX})', 'Nota', 'Observaciones'], {4: BLOCK['E'], 7: 'BDD7EE'})
e.row_dimensions[3].height = 34
elast = 3 + N_EST
dvg = DataValidation(type='list', formula1=f'=Grupos!$A$4:$A${last}', allow_blank=True)
dve4 = DataValidation(type='list', formula1='=Listas!$B$2:$B$5', allow_blank=True,
                      showErrorMessage=True, errorTitle='Puntaje no válido', error='Use 0, 2, 4 o 6.')
e.add_data_validation(dvg)
e.add_data_validation(dve4)
dvg.add(f'C4:C{elast}')
dve4.add(f'D4:D{elast}')
for r in range(4, elast + 1):
    e.cell(row=r, column=1, value=r - 3)
    # Solo trae el puntaje grupal cuando el grupo tiene los 17 criterios corregidos
    rng = f'Grupos!$A$4:${L(c_pend)}${last}'
    e.cell(row=r, column=5, value=f'=IF(C{r}="","",IFERROR(IF(VLOOKUP(C{r},{rng},{c_pend},FALSE)=0,'
                                  f'VLOOKUP(C{r},{rng},{c_tot},FALSE),"Incompleto"),"Incompleto"))')
    e.cell(row=r, column=6, value=f'=IF(OR(D{r}="",NOT(ISNUMBER(E{r}))),"",D{r}+E{r})')
    e.cell(row=r, column=7, value=f'=IF(F{r}="","",ROUND(IF(F{r}<{APROB:g},1+3*F{r}/{APROB:g},'
                                  f'4+3*(F{r}-{APROB:g})/{MAX - APROB:g}),1))')
    for col in range(1, 9):
        cell = e.cell(row=r, column=col)
        cell.border = BOX
        cell.alignment = WRAP_L if col in (2, 8) else WRAP_C
        if r % 2 == 0:
            cell.fill = fill(LIGHT)
    e.cell(row=r, column=7).number_format = '0.0'
    e.cell(row=r, column=7).font = Font(bold=True)
for col, w in zip('ABCDEFGH', [5, 32, 11, 11, 13, 10, 8, 36]):
    e.column_dimensions[col].width = w
e.freeze_panes = 'C4'
e.conditional_formatting.add(f'G4:G{elast}', FormulaRule(formula=[f'AND(G4<>"",G4<4)'],
                             fill=red, font=Font(bold=True, color='9C0006')))
e.conditional_formatting.add(f'G4:G{elast}', FormulaRule(formula=[f'AND(G4<>"",G4>=4)'],
                             fill=PatternFill('solid', fgColor='C6EFCE'), font=Font(bold=True, color='006100')))

# ---------------- Escala de notas (referencia)
s = wb.create_sheet('Escala', 2)
title(s, 'ESCALA DE NOTAS · 75 puntos · exigencia 60 %', 'Referencia. La hoja «Estudiantes» usa la misma fórmula.', 6)
for k in range(3):
    for j, h in enumerate(['Puntos', 'Nota']):
        c = s.cell(row=3, column=1 + k * 2 + j, value=h)
        c.font = Font(bold=True, size=9)
        c.fill = fill(GREY)
        c.alignment = WRAP_C
        c.border = BOX
for p in range(MAX + 1):
    k, r = divmod(p, 26)
    s.cell(row=4 + r, column=1 + k * 2, value=p).border = BOX
    n = s.cell(row=4 + r, column=2 + k * 2,
               value=f'=ROUND(IF({L(1 + k * 2)}{4 + r}<{APROB:g},1+3*{L(1 + k * 2)}{4 + r}/{APROB:g},'
                     f'4+3*({L(1 + k * 2)}{4 + r}-{APROB:g})/{MAX - APROB:g}),1)')
    n.number_format = '0.0'
    n.border = BOX
    for cc in (s.cell(row=4 + r, column=1 + k * 2), n):
        cc.alignment = WRAP_C
for col in 'ABCDEF':
    s.column_dimensions[col].width = 9

# ---------------- Instrucciones
ins = wb.create_sheet('Instrucciones', 3)
title(ins, 'CÓMO USAR ESTA PLANILLA', 'Evaluación Integrativa 2026 · Cuidados de Enfermería II – Farmacología – Fisiopatología', 2)
pasos = [
    ('1. Hoja «Grupos»', 'Complete una fila por grupo: situación (1 a 4), docente y el puntaje de cada criterio con la lista desplegable. '
     'Los criterios ×2 (B1–B3, C1–C3) solo aceptan 0-2-4-6; el resto 0-1-2-3.'),
    ('2. Niveles', 'Logrado: todos los elementos verificables presentes y correctos. Medianamente logrado: falta 1 o error menor. '
     'Por lograr: faltan 2 o más, o error conceptual. No logrado: no lo presenta o error crítico.'),
    ('3. Error crítico', 'Si el grupo propone algo que compromete la seguridad del paciente, el criterio afectado queda en 0. '
     'Anótelo en «Observaciones / errores críticos» para la retroalimentación.'),
    ('4. Control', 'La columna «Criterios sin puntaje» se marca en rojo mientras falte algún criterio. Debe quedar en 0.'),
    ('5. Hoja «Estudiantes»', 'Escriba el nombre, elija su grupo y el puntaje de la defensa individual E4 (0-2-4-6). '
     'El puntaje grupal, el total y la nota se calculan solos. Si el grupo tiene criterios sin puntaje, aparece «Incompleto» y no se calcula nota.'),
    ('6. Nota', f'Escala 1,0–7,0 con exigencia 60 %: {int(APROB)} de {MAX} puntos = 4,0. '
     f'Bajo {int(APROB)}: nota = 1 + 3·P/{int(APROB)}. Desde {int(APROB)}: nota = 4 + 3·(P−{int(APROB)})/{int(MAX - APROB)}. '
     'Redondeo a un decimal. La hoja «Escala» muestra la tabla completa.'),
    ('7. Clave de corrección', 'Para decidir qué es correcto en cada caso, use la versión docente de la situación asignada '
     '(hallazgos esperados, fármacos prioritarios e incongruencias de la indicación médica para C3).'),
]
for i, (a, b) in enumerate(pasos, 4):
    ins.cell(row=i, column=1, value=a).font = Font(bold=True)
    ins.cell(row=i, column=2, value=b)
    for col in (1, 2):
        ins.cell(row=i, column=col).alignment = WRAP_L
        ins.cell(row=i, column=col).border = BOX
    ins.row_dimensions[i].height = 48
ins.column_dimensions['A'].width = 22
ins.column_dimensions['B'].width = 100

wb.save(OUT)
print('ok', OUT)
