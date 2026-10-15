# La Tarde · Gimnasio mental

Sitio estático con siete juegos para ejercitar memoria, atención, cálculo, lenguaje y lógica.
Se publica en Vercel con `mente/` como directorio raíz.

| Página | Juego | Habilidad |
|---|---|---|
| `index.html` | Portada: racha, reto del día, mapa de habilidades, semana | — |
| `crucigrama.html` | Crucigrama de la Tarde (12 temas, puzzles de oro) | Lenguaje |
| `sudoku.html` | Sudoku de cuatro niveles con solución única | Lógica |
| `memorice.html` | Memorice de 6, 8 o 12 parejas | Memoria |
| `piramide.html` | Pirámide 13, solitario de cartas | Cálculo |
| `colores.html` | Colores Traicioneros (efecto Stroop) | Atención |
| `eco.html` | Eco de Luces (secuencias) | Memoria |
| `palabra.html` | Palabra Oculta (cinco letras, seis intentos) | Lenguaje |

## Lenguajes

- **C → WebAssembly** (`src/sudoku.c`): generador de Sudoku que garantiza una sola solución.
  `src/sudoku-cargador.js` lo carga y trae un respaldo en JavaScript con el mismo algoritmo.
- **TypeScript** (`src/comun.ts` → `assets/comun.js`): puntaje, racha, habilidades, barra superior, celebración.
- **GLSL** (en `index.html`): shader del cielo animado de la portada.
- **Python** (`tools/build.py`): compila lo anterior y extrae las palabras de cinco letras del banco del crucigrama.

## Construir

```
python3 mente/tools/build.py          # requiere clang (con destino wasm32) y tsc
```

Los archivos de `assets/` generados (`comun.js`, `sudoku.js`, `palabras.js`) se versionan para que el sitio
funcione sin paso de compilación en Vercel.

El avance de cada persona se guarda en `localStorage` de su navegador.
