/*
 * Núcleo compartido de La Tarde · Gimnasio mental.
 * Se compila a assets/comun.js (ver tools/build.py) y expone window.Mente.
 */

type Habilidad = "memoria" | "atencion" | "calculo" | "lenguaje" | "logica";

interface Juego {
  id: string;
  nombre: string;
  href: string;
  habilidad: Habilidad;
  lema: string;
  color: string;
}

interface RegistroJuego { partidas: number; ganadas: number; mejor: number; puntos: number; ultima: string; }

interface Estado {
  puntos: number;
  racha: number;
  mejorRacha: number;
  ultimoDia: string;
  dias: Record<string, number>;
  habilidades: Record<Habilidad, number>;
  juegos: Record<string, RegistroJuego>;
}

interface Resultado { puntos: number; gano: boolean; detalle?: string; }

const CLAVE = "mente.v1";
const CLAVE_TEMA = "mente.tema";

const HABILIDADES: Record<Habilidad, string> = {
  memoria: "Memoria", atencion: "Atención", calculo: "Cálculo", lenguaje: "Lenguaje", logica: "Lógica"
};

const JUEGOS: Juego[] = [
  { id: "crucigrama", nombre: "Crucigrama de la Tarde", href: "crucigrama.html", habilidad: "lenguaje", lema: "Doce temas, definiciones de tres niveles y puzzles de oro.", color: "#e4572e" },
  { id: "sudoku", nombre: "Sudoku", href: "sudoku.html", habilidad: "logica", lema: "Cuatro niveles, cada uno con una sola solución posible.", color: "#2f6fde" },
  { id: "memorice", nombre: "Memorice", href: "memorice.html", habilidad: "memoria", lema: "Da vuelta las cartas y encuentra las parejas.", color: "#8a4fff" },
  { id: "piramide", nombre: "Pirámide 13", href: "piramide.html", habilidad: "calculo", lema: "Solitario de cartas: retira parejas que sumen trece.", color: "#0e9f6e" },
  { id: "colores", nombre: "Colores Traicioneros", href: "colores.html", habilidad: "atencion", lema: "Responde el color de la tinta, no lo que dice la palabra.", color: "#e8a317" },
  { id: "eco", nombre: "Eco de Luces", href: "eco.html", habilidad: "memoria", lema: "Repite la secuencia de luces y sonidos, cada vez más larga.", color: "#d6336c" },
  { id: "palabra", nombre: "Palabra Oculta", href: "palabra.html", habilidad: "lenguaje", lema: "Adivina la palabra de cinco letras en seis intentos.", color: "#0b8bb5" }
];

/* ---------- Fechas ---------- */
function hoy(d: Date = new Date()): string {
  const z = (n: number) => (n < 10 ? "0" : "") + n;
  return d.getFullYear() + "-" + z(d.getMonth() + 1) + "-" + z(d.getDate());
}
function diaAnterior(clave: string): string {
  const [a, m, d] = clave.split("-").map(Number);
  return hoy(new Date(a, m - 1, d - 1));
}

/* ---------- Almacenamiento ---------- */
function vacio(): Estado {
  return {
    puntos: 0, racha: 0, mejorRacha: 0, ultimoDia: "", dias: {},
    habilidades: { memoria: 0, atencion: 0, calculo: 0, lenguaje: 0, logica: 0 },
    juegos: {}
  };
}
function leer(): Estado {
  try {
    const s = JSON.parse(localStorage.getItem(CLAVE) || "null");
    if (s) { const v = vacio(); return { ...v, ...s, habilidades: { ...v.habilidades, ...s.habilidades } }; }
  } catch (e) { /* sin almacenamiento */ }
  return vacio();
}
function guardar(e: Estado): void {
  try { localStorage.setItem(CLAVE, JSON.stringify(e)); } catch (err) { /* sin almacenamiento */ }
}

/* Racha vigente: si el último día jugado no es hoy ni ayer, la racha ya se cortó */
function rachaVigente(e: Estado): number {
  const h = hoy();
  return e.ultimoDia === h || e.ultimoDia === diaAnterior(h) ? e.racha : 0;
}

function registrar(idJuego: string, r: Resultado): Estado {
  const e = leer();
  const juego = JUEGOS.find(j => j.id === idJuego);
  const h = hoy();
  if (e.ultimoDia !== h) {
    e.racha = e.ultimoDia === diaAnterior(h) ? e.racha + 1 : 1;
    e.ultimoDia = h;
  }
  e.mejorRacha = Math.max(e.mejorRacha, e.racha);
  const pts = Math.max(0, Math.round(r.puntos));
  e.puntos += pts;
  e.dias[h] = (e.dias[h] || 0) + pts;
  if (juego) e.habilidades[juego.habilidad] += pts + 25;
  const g = e.juegos[idJuego] || { partidas: 0, ganadas: 0, mejor: 0, puntos: 0, ultima: "" };
  g.partidas++; if (r.gano) g.ganadas++;
  g.mejor = Math.max(g.mejor, pts); g.puntos += pts; g.ultima = h;
  e.juegos[idJuego] = g;
  guardar(e);
  return e;
}

/* Nivel 0..1 de una habilidad: sube rápido al principio y luego se estabiliza */
function nivel(xp: number): number { return 1 - Math.exp(-xp / 1800); }

/* Reto del día: la habilidad menos entrenada; a igualdad decide la fecha */
function retoDelDia(): Juego {
  const e = leer();
  const semilla = hoy().split("-").reduce((a, b) => a * 31 + Number(b), 7);
  const orden = JUEGOS.slice().sort((a, b) => {
    const d = e.habilidades[a.habilidad] - e.habilidades[b.habilidad];
    return d !== 0 ? d : ((semilla + a.id.length * 13) % 7) - ((semilla + b.id.length * 13) % 7);
  });
  return orden[0];
}

/* ---------- Tema claro / oscuro ---------- */
type Tema = "system" | "light" | "dark";
function temaActual(): Tema {
  try { return (localStorage.getItem(CLAVE_TEMA) as Tema) || "system"; } catch (e) { return "system"; }
}
function aplicarTema(t: Tema = temaActual()): void {
  const r = document.documentElement;
  if (t === "system") r.removeAttribute("data-theme"); else r.setAttribute("data-theme", t);
}
function rotarTema(): Tema {
  const orden: Tema[] = ["system", "light", "dark"];
  const t = orden[(orden.indexOf(temaActual()) + 1) % 3];
  try { localStorage.setItem(CLAVE_TEMA, t); } catch (e) { /* nada */ }
  aplicarTema(t);
  return t;
}
const NOMBRE_TEMA: Record<Tema, string> = { system: "Auto", light: "Claro", dark: "Oscuro" };

/* ---------- Íconos ---------- */
const ICONO = {
  llama: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2c1 3.5 5 6 5 11a5 5 0 0 1-10 0c0-2.4 1.2-4 2.6-5.2.2 1.7.9 2.9 2.1 3.4C11 8.6 11.4 5 12 2z"/></svg>',
  estrella: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="m12 2 2.9 6.3 6.9.7-5.2 4.6 1.5 6.8L12 17l-6.1 3.4 1.5-6.8L2.2 9l6.9-.7z"/></svg>',
  casa: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M3 11 12 4l9 7M5 10v10h14V10"/></svg>',
  luna: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>'
};

/* ---------- Barra superior de cada juego ---------- */
function barra(idJuego: string): void {
  const juego = JUEGOS.find(j => j.id === idJuego);
  const host = document.getElementById("mente-bar");
  if (!host || !juego) return;
  document.documentElement.style.setProperty("--juego", juego.color);
  const e = leer();
  host.className = "mbar";
  host.innerHTML =
    '<a class="mbar-inicio" href="index.html">' + ICONO.casa + '<span>Inicio</span></a>' +
    '<div class="mbar-titulo"><b></b><small></small></div>' +
    '<div class="mbar-chips">' +
      '<span class="chip-racha" title="Días seguidos jugando">' + ICONO.llama + '<b id="mbar-racha">' + rachaVigente(e) + '</b></span>' +
      '<span class="chip-pts" title="Puntos totales">' + ICONO.estrella + '<b id="mbar-pts">' + e.puntos.toLocaleString("es-CL") + '</b></span>' +
      '<button type="button" id="mbar-tema" title="Cambiar tema">' + ICONO.luna + '<span></span></button>' +
    '</div>';
  (host.querySelector(".mbar-titulo b") as HTMLElement).textContent = juego.nombre;
  (host.querySelector(".mbar-titulo small") as HTMLElement).textContent = HABILIDADES[juego.habilidad];
  const btn = host.querySelector("#mbar-tema") as HTMLButtonElement;
  const rotulo = () => { (btn.querySelector("span") as HTMLElement).textContent = NOMBRE_TEMA[temaActual()]; };
  rotulo();
  btn.onclick = () => { rotarTema(); rotulo(); };
}
function refrescarBarra(): void {
  const e = leer();
  const r = document.getElementById("mbar-racha"); if (r) r.textContent = String(rachaVigente(e));
  const p = document.getElementById("mbar-pts"); if (p) p.textContent = e.puntos.toLocaleString("es-CL");
}

/* ---------- Celebración ---------- */
function confeti(color: string): void {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const c = document.createElement("canvas");
  c.className = "confeti";
  document.body.appendChild(c);
  const ctx = c.getContext("2d");
  if (!ctx) { c.remove(); return; }
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  c.width = innerWidth * dpr; c.height = innerHeight * dpr;
  ctx.scale(dpr, dpr);
  const colores = [color, "#ffd166", "#06d6a0", "#ef476f", "#118ab2", "#ffffff"];
  const piezas = Array.from({ length: 140 }, () => ({
    x: innerWidth / 2, y: innerHeight * 0.35,
    vx: (Math.random() - 0.5) * 14, vy: -Math.random() * 13 - 4,
    r: Math.random() * 6 + 3, g: Math.random() * Math.PI, vg: (Math.random() - 0.5) * 0.3,
    col: colores[Math.floor(Math.random() * colores.length)]
  }));
  let t = 0;
  const paso = () => {
    t++;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (const p of piezas) {
      p.vy += 0.32; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.g += p.vg;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.g);
      ctx.fillStyle = p.col; ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
      ctx.restore();
    }
    if (t < 170) requestAnimationFrame(paso); else c.remove();
  };
  requestAnimationFrame(paso);
}

function celebrar(idJuego: string, r: Resultado, otra?: () => void): void {
  const juego = JUEGOS.find(j => j.id === idJuego);
  const e = registrar(idJuego, r);
  refrescarBarra();
  if (r.gano) confeti(juego ? juego.color : "#e4572e");
  const v = document.createElement("div");
  v.className = "mfin";
  v.setAttribute("role", "dialog");
  v.innerHTML =
    '<div class="mfin-caja">' +
      '<p class="mfin-eyebrow"></p><h2></h2><p class="mfin-pts"></p><p class="mfin-det"></p>' +
      '<div class="mfin-acc"><a class="mbtn" href="index.html">Volver al inicio</a><button type="button" class="mbtn mbtn-pri">Jugar otra</button></div>' +
    '</div>';
  (v.querySelector(".mfin-eyebrow") as HTMLElement).textContent = juego ? HABILIDADES[juego.habilidad] : "";
  (v.querySelector("h2") as HTMLElement).textContent = r.gano ? "¡Lo lograste!" : "Buen intento";
  (v.querySelector(".mfin-pts") as HTMLElement).textContent = "+" + Math.max(0, Math.round(r.puntos)).toLocaleString("es-CL") + " puntos";
  (v.querySelector(".mfin-det") as HTMLElement).textContent =
    (r.detalle ? r.detalle + " · " : "") + "Racha: " + e.racha + (e.racha === 1 ? " día" : " días");
  const otraBtn = v.querySelector(".mfin-acc button") as HTMLButtonElement;
  otraBtn.onclick = () => { v.remove(); if (otra) otra(); };
  v.addEventListener("click", ev => { if (ev.target === v) v.remove(); });
  document.body.appendChild(v);
  otraBtn.focus();
}

/* ---------- Sonido breve (solo tras interacción) ---------- */
let audio: AudioContext | null = null;
function tono(frecuencia: number, ms = 180, tipo: OscillatorType = "sine", vol = 0.12): void {
  try {
    const W = window as unknown as { AudioContext: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
    audio = audio || new (W.AudioContext || W.webkitAudioContext!)();
    const o = audio.createOscillator(), g = audio.createGain();
    o.type = tipo; o.frequency.value = frecuencia;
    g.gain.setValueAtTime(vol, audio.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + ms / 1000);
    o.connect(g).connect(audio.destination);
    o.start(); o.stop(audio.currentTime + ms / 1000);
  } catch (e) { /* sin audio */ }
}

/* ---------- Utilidades ---------- */
function azar(semilla: number): () => number {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function barajar<T>(arr: T[], r: () => number = Math.random): T[] {
  for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
  return arr;
}
function reloj(s: number): string {
  const m = Math.floor(s / 60), x = s % 60;
  return (m < 10 ? "0" : "") + m + ":" + (x < 10 ? "0" : "") + x;
}
function guardarLocal(clave: string, valor: unknown): void { try { localStorage.setItem(clave, JSON.stringify(valor)); } catch (e) { /* nada */ } }
function leerLocal<T>(clave: string): T | null { try { return JSON.parse(localStorage.getItem(clave) || "null"); } catch (e) { return null; } }

aplicarTema();

(window as unknown as { Mente: unknown }).Mente = {
  JUEGOS, HABILIDADES, leer, registrar, celebrar, barra, refrescarBarra, rachaVigente, nivel,
  retoDelDia, hoy, diaAnterior, aplicarTema, rotarTema, temaActual, NOMBRE_TEMA, ICONO,
  tono, azar, barajar, reloj, guardarLocal, leerLocal
};
