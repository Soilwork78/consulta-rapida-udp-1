#!/usr/bin/env python3
"""
Construye los recursos generados de La Tarde · Gimnasio mental.

  1. Compila src/sudoku.c a WebAssembly con clang y lo incrusta en assets/sudoku.js
     (en base64, para no depender de cargar un .wasm aparte).
  2. Compila src/comun.ts a assets/comun.js con tsc.
  3. Extrae del banco del crucigrama las palabras de cinco letras para Palabra Oculta
     y las escribe en assets/palabras.js.

Uso:  python3 mente/tools/build.py
"""
import base64
import json
import pathlib
import re
import subprocess
import sys
import tempfile

RAIZ = pathlib.Path(__file__).resolve().parent.parent
SRC, ASSETS = RAIZ / "src", RAIZ / "assets"


def compilar_sudoku() -> None:
    with tempfile.TemporaryDirectory() as tmp:
        wasm = pathlib.Path(tmp) / "sudoku.wasm"
        subprocess.run([
            "clang", "--target=wasm32", "-O3", "-nostdlib", "-fno-builtin",
            "-Wl,--no-entry", "-Wl,--export=sudoku_generar", "-Wl,--export=sudoku_puzzle",
            "-Wl,--export=sudoku_solucion", "-Wl,--strip-all",
            "-o", str(wasm), str(SRC / "sudoku.c"),
        ], check=True)
        datos = wasm.read_bytes()
    b64 = base64.b64encode(datos).decode()
    plantilla = (SRC / "sudoku-cargador.js").read_text(encoding="utf-8")
    (ASSETS / "sudoku.js").write_text(plantilla.replace("__WASM_BASE64__", b64), encoding="utf-8")
    print(f"sudoku.wasm: {len(datos)} bytes")


def compilar_ts() -> None:
    subprocess.run([
        "tsc", "--target", "ES2019", "--lib", "ES2019,DOM", "--strict", "--removeComments", "false",
        "--outDir", str(ASSETS), str(SRC / "comun.ts"),
    ], check=True)
    print("comun.js listo")


def extraer_palabras() -> None:
    html = (RAIZ / "crucigrama.html").read_text(encoding="utf-8")
    bloque = re.search(r"const BANK = `\n(.*?)`\.trim\(\)", html, re.S).group(1)
    palabras = []
    for linea in bloque.strip().split("\n"):
        partes = linea.split("|")
        if len(partes) >= 4 and len(partes[0]) == 5:
            palabras.append({"p": partes[0], "f": partes[1], "m": partes[2]})
    vistos, unicas = set(), []
    for w in palabras:
        if w["p"] not in vistos:
            vistos.add(w["p"]); unicas.append(w)
    js = "/* Generado por tools/build.py desde el banco del crucigrama. No editar a mano. */\n"
    js += "window.PALABRAS = " + json.dumps(unicas, ensure_ascii=False) + ";\n"
    (ASSETS / "palabras.js").write_text(js, encoding="utf-8")
    print(f"palabras de cinco letras: {len(unicas)}")


if __name__ == "__main__":
    ASSETS.mkdir(exist_ok=True)
    pasos = sys.argv[1:] or ["sudoku", "ts", "palabras"]
    if "sudoku" in pasos: compilar_sudoku()
    if "ts" in pasos: compilar_ts()
    if "palabras" in pasos: extraer_palabras()
