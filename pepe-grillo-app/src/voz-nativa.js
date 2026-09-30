// ============================================================
// voz-nativa.js — Puente de voz para la app Android (Capacitor).
//
// Dentro de la app, el WebView de Android no tiene reconocimiento de voz
// (webkitSpeechRecognition) y su síntesis de voz no es confiable. Este
// archivo reemplaza ambas APIs del navegador por los complementos nativos,
// con la MISMA interfaz, para que index.html funcione sin cambios.
//
// Reconocimiento: primero pide hacerlo en el dispositivo (sin enviar audio).
// Si el teléfono no tiene el español sin conexión, cae a reconocimiento en
// línea y lo avisa en pantalla.
//
// Fuera de la app (navegador) este archivo no hace nada.
// ============================================================

(function () {
  const C = window.Capacitor;
  if (!C || typeof C.isNativePlatform !== 'function' || !C.isNativePlatform()) return;
  const SR = C.Plugins.SpeechRecognition;
  const TTS = C.Plugins.TextToSpeech;
  if (!SR || !TTS) return;

  let enDispositivo = true; // pasa a false si el reconocimiento sin conexión no está disponible

  function avisar(texto) {
    const nota = document.getElementById('notaMic');
    if (!nota) return;
    nota.hidden = false;
    nota.textContent = texto;
  }

  // Errores del complemento → códigos de la Web Speech API que index.html ya maneja.
  function codigo(mensaje) {
    if (/No match|No speech input/i.test(mensaje)) return 'no-speech';
    if (/permission/i.test(mensaje)) return 'not-allowed';
    if (/Network|server/i.test(mensaje)) return 'network';
    return 'audio-capture';
  }

  // ── Reconocimiento de voz ──────────────────────────────────
  class Reconocedor {
    constructor() {
      this.lang = 'es-CL';
      this.continuous = false;
      this.interimResults = false;
      this.activo = false;
    }

    async start() {
      if (this.activo) return;
      this.activo = true;
      try {
        let permiso = await SR.checkPermissions();
        if (permiso.speechRecognition !== 'granted') permiso = await SR.requestPermissions();
        if (permiso.speechRecognition !== 'granted') {
          this._error('not-allowed');
          setTimeout(() => avisar('Pepe necesita permiso de micrófono. Actívalo en Ajustes → Aplicaciones → Pepe Grillo → Permisos.'), 0);
          return;
        }
        if (this.onstart) this.onstart();
        const texto = await this._escuchar();
        if (texto && this.onresult) this.onresult({ results: [[{ transcript: texto }]] });
      } catch (e) {
        this._error(codigo(String((e && e.message) || e)));
      } finally {
        this.activo = false;
        if (this.onend) this.onend();
      }
    }

    async _escuchar() {
      const opciones = { language: this.lang, maxResults: 1, partialResults: false, popup: false };
      if (enDispositivo) {
        try {
          const r = await SR.start({ ...opciones, preferOffline: true });
          return (r && r.matches && r.matches[0]) || '';
        } catch (e) {
          const m = String((e && e.message) || e);
          if (codigo(m) === 'no-speech' || codigo(m) === 'not-allowed') throw e;
          // Sin paquete de español sin conexión: se sigue en línea y se avisa una vez.
          enDispositivo = false;
          avisar('Reconocimiento de voz en línea: este teléfono no tiene el español sin conexión, así que el audio sale del equipo. ' +
            'Para evitarlo, descarga el español en el reconocimiento de voz sin conexión (Ajustes de Google → Voz).');
        }
      }
      const r = await SR.start(opciones);
      return (r && r.matches && r.matches[0]) || '';
    }

    _error(error) {
      if (this.onerror) this.onerror({ error });
    }

    abort() { SR.stop().catch(() => {}); }
    stop() { SR.stop().catch(() => {}); }
  }

  window.SpeechRecognition = Reconocedor;
  window.webkitSpeechRecognition = Reconocedor;

  // ── Síntesis de voz ────────────────────────────────────────
  class Enunciado {
    constructor(texto) {
      this.text = texto;
      this.lang = 'es-CL';
      this.rate = 1;
      this.voice = null;
    }
  }

  const sintesis = {
    speaking: false,
    pending: false,
    getVoices() { return []; },
    speak(u) {
      sintesis.speaking = true;
      if (u.onstart) u.onstart();
      TTS.speak({ text: u.text, lang: u.lang || 'es-CL', rate: u.rate || 1, category: 'playback' })
        .then(() => { sintesis.speaking = false; if (u.onend) u.onend(); })
        .catch((e) => { sintesis.speaking = false; if (u.onerror) u.onerror(e); });
    },
    cancel() {
      sintesis.speaking = false;
      TTS.stop().catch(() => {});
    },
  };

  Object.defineProperty(window, 'speechSynthesis', { value: sintesis, configurable: true });
  window.SpeechSynthesisUtterance = Enunciado;
  window.PEPE_APP_NATIVA = true;
})();
