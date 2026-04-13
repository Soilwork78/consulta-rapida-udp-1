
(function(){
  const storeKey = 'crEnfUltraState';
  const noteKey = 'crEnfSessionNotes';
  const sessionCount = () => Object.values(APP_DATA).reduce((sum, subject) => sum + subject.units.reduce((s,u)=>s+u.sessions.length,0),0);

  function getBaseProgress(){
    try { return JSON.parse(localStorage.getItem('crEnfProgress') || '{}'); } catch(e){ return {}; }
  }
  function setBaseProgress(v){
    localStorage.setItem('crEnfProgress', JSON.stringify(v));
  }
  function getUltra(){
    try { return JSON.parse(localStorage.getItem(storeKey) || '{}'); } catch(e){ return {}; }
  }
  function setUltra(v){
    localStorage.setItem(storeKey, JSON.stringify(v));
  }
  function getNotes(){
    try { return JSON.parse(localStorage.getItem(noteKey) || '{}'); } catch(e){ return {}; }
  }
  function setNotes(v){
    localStorage.setItem(noteKey, JSON.stringify(v));
  }
  function toast(msg){
    const el = document.getElementById('ultra-toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('active');
    clearTimeout(window.__ultraToast);
    window.__ultraToast = setTimeout(()=>el.classList.remove('active'), 2200);
  }
  function flattenSessions(){
    const arr = [];
    Object.entries(APP_DATA).forEach(([subject, data])=>{
      data.units.forEach(unit=>{
        unit.sessions.forEach(session=>{
          arr.push({
            subject,
            unitTitle: unit.title,
            id: session.id,
            title: session.title,
            alerts: (session.alerts||[]).length,
            topics: (session.topics||[]).length
          });
        });
      });
    });
    return arr;
  }
  const allSessions = flattenSessions();

  function ensureHomeDashboard(){
    const home = document.getElementById('home');
    if (!home || document.getElementById('ultra-dashboard')) return;
    const hero = home.querySelector('.home-hero-section');
    const dash = document.createElement('section');
    dash.id = 'ultra-dashboard';
    dash.className = 'ultra-dashboard';
    dash.innerHTML = `
      <article class="ultra-card">
        <div class="ultra-label">Cobertura</div>
        <div class="ultra-metric" id="ultra-metric-sessions">0</div>
        <div class="ultra-sub">Sesiones mapeadas con navegación, búsqueda, quiz y visor.</div>
      </article>
      <article class="ultra-card">
        <div class="ultra-label">Progreso real</div>
        <div class="ultra-metric" id="ultra-metric-progress">0%</div>
        <div class="ultra-sub">Avance del estudiante considerando revisión, mastery y uso del material.</div>
        <div class="ultra-progress"><span id="ultra-progress-bar" style="width:0%"></span></div>
      </article>
      <article class="ultra-card">
        <div class="ultra-label">Ritmo</div>
        <div class="ultra-metric" id="ultra-metric-streak">0</div>
        <div class="ultra-sub">Días activos registrados en este dispositivo. Diseñado para sostener hábito.</div>
      </article>
      <article class="ultra-card">
        <div class="ultra-label">Logros</div>
        <div class="ultra-metric" id="ultra-metric-mastered">0</div>
        <div class="ultra-sub">Sesiones marcadas como dominadas o finalizadas con intención académica.</div>
      </article>
      <article class="ultra-card wide">
        <div class="ultra-label">Ruta de estudio inteligente</div>
        <div class="ultra-sub">Entrar más rápido, retomar donde quedó el alumno y transformar la plataforma en entrenamiento activo.</div>
        <div class="ultra-chips">
          <button class="ultra-chip" id="ultra-continue-btn">Continuar donde quedé</button>
          <button class="ultra-chip" id="ultra-random-btn">Sesión aleatoria</button>
          <button class="ultra-chip" id="ultra-cmd-btn">Buscador avanzado</button>
          <button class="ultra-chip" id="ultra-export-btn">Exportar progreso</button>
        </div>
        <div class="ultra-kpi-grid">
          <div class="ultra-kpi"><strong id="ultra-kpi-quiz">0</strong> intentos de quiz guardados</div>
          <div class="ultra-kpi"><strong id="ultra-kpi-notes">0</strong> notas de estudio creadas</div>
          <div class="ultra-kpi"><strong id="ultra-kpi-slides">0</strong> aperturas del visor de slides</div>
        </div>
      </article>
    `;
    hero.insertAdjacentElement('afterend', dash);
  }

  function dayDiff(a,b){
    return Math.floor((new Date(a).setHours(0,0,0,0)-new Date(b).setHours(0,0,0,0))/86400000);
  }
  function computeStreak(days){
    if (!days || !days.length) return 0;
    const unique = [...new Set(days)].sort().reverse();
    let streak = 0;
    let cursor = new Date();
    cursor.setHours(0,0,0,0);
    for (const ds of unique){
      const d = new Date(ds); d.setHours(0,0,0,0);
      const delta = dayDiff(cursor, d);
      if (delta === 0 || (streak > 0 && delta === 1)){
        streak++;
        cursor = new Date(d.getTime()-86400000);
      } else if (streak === 0 && delta === 1) {
        streak++;
        cursor = new Date(d.getTime()-86400000);
      } else if (streak === 0 && delta > 1){
        break;
      } else {
        break;
      }
    }
    return streak;
  }

  function updateDashboard(){
    ensureHomeDashboard();
    const base = getBaseProgress();
    const ultra = getUltra();
    const notes = getNotes();

    const visits = Object.keys(base.visits || {});
    const mastered = Object.keys(ultra.mastered || {});
    const slides = Object.keys(ultra.slides || {}).reduce((s,k)=>s+(ultra.slides[k]||0),0);
    const quizAttempts = Object.keys(base.quizzes || {}).reduce((s,k)=>s+(base.quizzes[k]||[]).length,0);
    const progressPct = Math.min(100, Math.round(((visits.length * 0.6) + (mastered.length * 1.2)) / sessionCount() * 100));
    const streak = computeStreak(ultra.activeDays || []);

    const set = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };
    set('ultra-metric-sessions', sessionCount());
    set('ultra-metric-progress', progressPct + '%');
    set('ultra-metric-streak', streak);
    set('ultra-metric-mastered', mastered.length);
    set('ultra-kpi-quiz', quizAttempts);
    set('ultra-kpi-notes', Object.keys(notes).length);
    set('ultra-kpi-slides', slides);
    const bar = document.getElementById('ultra-progress-bar');
    if (bar) bar.style.width = progressPct + '%';

    const continueBtn = document.getElementById('ultra-continue-btn');
    if (continueBtn) continueBtn.onclick = continueLastSession;
    const randomBtn = document.getElementById('ultra-random-btn');
    if (randomBtn) randomBtn.onclick = openRandomSession;
    const cmdBtn = document.getElementById('ultra-cmd-btn');
    if (cmdBtn) cmdBtn.onclick = openCommand;
    const exportBtn = document.getElementById('ultra-export-btn');
    if (exportBtn) exportBtn.onclick = exportProgress;
  }

  function recordActiveDay(){
    const ultra = getUltra();
    const today = new Date().toISOString().slice(0,10);
    ultra.activeDays = ultra.activeDays || [];
    if (!ultra.activeDays.includes(today)) ultra.activeDays.push(today);
    setUltra(ultra);
  }

  function continueLastSession(){
    const base = getBaseProgress();
    const visits = base.visits || {};
    const entries = Object.entries(visits).sort((a,b)=> new Date(b[1].last||b[1].first||0) - new Date(a[1].last||a[1].first||0));
    if (!entries.length) { toast('Aún no hay sesiones registradas'); return; }
    const [id] = entries[0];
    const found = findSession(id);
    if (found) loadSession(id, found.subject);
  }

  function openRandomSession(){
    const item = allSessions[Math.floor(Math.random()*allSessions.length)];
    loadSession(item.id, item.subject);
  }

  function exportProgress(){
    const payload = {
      base: getBaseProgress(),
      ultra: getUltra(),
      notes: getNotes(),
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {type:'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'consulta-rapida-progreso.json';
    a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href), 1000);
    toast('Progreso exportado');
  }

  function ensureCommandPalette(){
    if (document.getElementById('ultra-command')) return;
    const wrap = document.createElement('div');
    wrap.id = 'ultra-command';
    wrap.className = 'ultra-command';
    wrap.innerHTML = `
      <div class="ultra-command-panel">
        <div class="ultra-command-head">
          <input id="ultra-command-input" type="text" placeholder="Buscar sesión, tema o unidad...">
        </div>
        <div id="ultra-command-results" class="ultra-command-results"></div>
      </div>`;
    document.body.appendChild(wrap);
    wrap.addEventListener('click', e => { if (e.target === wrap) closeCommand(); });
    const input = document.getElementById('ultra-command-input');
    input.addEventListener('input', () => renderCommandResults(input.value));
    input.addEventListener('keydown', e => { if (e.key === 'Escape') closeCommand(); });
  }

  function renderCommandResults(query=''){
    const target = document.getElementById('ultra-command-results');
    if (!target) return;
    const q = (query || '').toLowerCase().trim();
    const base = getBaseProgress();
    let results = allSessions.slice();
    if (q) {
      results = results.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.unitTitle.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q)
      );
    } else {
      results = results.sort((a,b)=>{
        const va = base.visits?.[a.id]?.last || '';
        const vb = base.visits?.[b.id]?.last || '';
        return vb.localeCompare(va);
      }).slice(0, 18);
    }
    target.innerHTML = results.slice(0, 24).map(s => `
      <div class="ultra-command-item" data-id="${s.id}" data-subject="${s.subject}">
        <strong>${s.title}</strong><br>
        <span style="color:#9db6d6">${s.unitTitle} · ${labelSubject(s.subject)} · ${s.topics} temas · ${s.alerts} alertas</span>
      </div>
    `).join('') || `<div class="ultra-command-item">Sin resultados</div>`;
    target.querySelectorAll('.ultra-command-item[data-id]').forEach(el=>{
      el.onclick = ()=>{ closeCommand(); loadSession(el.dataset.id, el.dataset.subject); };
    });
  }

  function openCommand(){
    ensureCommandPalette();
    const wrap = document.getElementById('ultra-command');
    wrap.classList.add('active');
    const input = document.getElementById('ultra-command-input');
    input.value = '';
    renderCommandResults('');
    setTimeout(()=>input.focus(), 30);
  }
  function closeCommand(){
    const wrap = document.getElementById('ultra-command');
    if (wrap) wrap.classList.remove('active');
  }

  function labelSubject(subject){
    return subject === 'farm' ? 'Farmacología' : subject === 'fisio' ? 'Fisiopatología' : 'Cuidados';
  }

  function refreshSidebarProgress(){
    const base = getBaseProgress();
    const ultra = getUltra();

    Object.entries(APP_DATA).forEach(([subject, data])=>{
      data.units.forEach(unit => {
        const ids = unit.sessions.map(s=>s.id);
        const visited = ids.filter(id => base.visits?.[id]).length;
        const mastered = ids.filter(id => ultra.mastered?.[id]).length;
        const pct = Math.round(((visited*0.55)+(mastered*0.45))/ids.length*100);
        const header = [...document.querySelectorAll('.unit-header')].find(h => h.textContent.includes(unit.title));
        if (header) {
          let meter = header.querySelector('.unit-meter');
          if (!meter) {
            meter = document.createElement('div');
            meter.className = 'unit-meter';
            meter.innerHTML = '<span></span>';
            header.appendChild(meter);
          }
          meter.querySelector('span').style.width = pct + '%';
        }
        unit.sessions.forEach(s=>{
          const el = document.getElementById('nav-' + s.id);
          if (!el) return;
          el.classList.remove('ultra-complete', 'ultra-inprogress');
          if (ultra.mastered?.[s.id]) el.classList.add('ultra-complete');
          else if (base.visits?.[s.id]) el.classList.add('ultra-inprogress');
        });
      });
    });
  }

  function ensureFloatingActions(){
    if (document.getElementById('ultra-floating')) return;
    const div = document.createElement('div');
    div.id = 'ultra-floating';
    div.className = 'ultra-floating';
    div.innerHTML = `
      <button class="ultra-fab" title="Buscador avanzado" id="ultra-fab-search">⌘</button>
      <button class="ultra-fab" title="Sesión aleatoria" id="ultra-fab-random">⚡</button>
      <button class="ultra-fab" title="Ir arriba" id="ultra-fab-top">↑</button>
    `;
    document.body.appendChild(div);
    document.getElementById('ultra-fab-search').onclick = openCommand;
    document.getElementById('ultra-fab-random').onclick = openRandomSession;
    document.getElementById('ultra-fab-top').onclick = ()=>window.scrollTo({top:0, behavior:'smooth'});
  }

  function ensureToast(){
    if (!document.getElementById('ultra-toast')) {
      const div = document.createElement('div');
      div.id = 'ultra-toast';
      div.className = 'ultra-toast';
      document.body.appendChild(div);
    }
  }

  function markMastered(sessionId, state=true){
    const ultra = getUltra();
    ultra.mastered = ultra.mastered || {};
    if (state) ultra.mastered[sessionId] = { date: new Date().toISOString() };
    else delete ultra.mastered[sessionId];
    setUltra(ultra);
    refreshSidebarProgress();
    updateDashboard();
  }

  function recordSlideView(sessionId){
    const ultra = getUltra();
    ultra.slides = ultra.slides || {};
    ultra.slides[sessionId] = (ultra.slides[sessionId] || 0) + 1;
    setUltra(ultra);
    updateDashboard();
  }

  function enhanceSessionView(){
    if (!window.currentSessionId) return;
    const header = document.querySelector('#content-view .cv-header');
    if (!header) return;

    let tools = document.getElementById('ultra-session-tools');
    if (!tools) {
      tools = document.createElement('div');
      tools.id = 'ultra-session-tools';
      tools.className = 'ultra-session-tools';
      tools.innerHTML = `
        <button class="ultra-btn success" id="ultra-mark-mastered">Marcar dominada</button>
        <button class="ultra-btn" id="ultra-open-slides">Abrir slides</button>
        <button class="ultra-btn warn" id="ultra-toggle-notes">Notas de estudio</button>
      `;
      header.appendChild(tools);
    }
    const ultra = getUltra();
    const isMastered = !!ultra.mastered?.[window.currentSessionId];
    const masteredBtn = document.getElementById('ultra-mark-mastered');
    masteredBtn.textContent = isMastered ? 'Quitar dominada' : 'Marcar dominada';
    masteredBtn.onclick = () => {
      markMastered(window.currentSessionId, !isMastered);
      enhanceSessionView();
      toast(!isMastered ? 'Sesión marcada como dominada' : 'Marca eliminada');
    };
    document.getElementById('ultra-open-slides').onclick = () => {
      const btn = [...document.querySelectorAll('.content-tab')].find(el => /Slides/i.test(el.textContent || ''));
      if (btn) btn.click();
      else if (typeof showSlidesForSession === 'function') showSlidesForSession(window.currentSessionId);
      else toast('Slides no disponibles para esta sesión');
    };
    document.getElementById('ultra-toggle-notes').onclick = () => toggleNotes(window.currentSessionId);

    let insight = document.getElementById('ultra-insight');
    if (!insight) {
      insight = document.createElement('div');
      insight.id = 'ultra-insight';
      insight.className = 'ultra-insight';
      header.appendChild(insight);
    }
    const found = findSession(window.currentSessionId);
    const alerts = found?.session?.alerts?.length || 0;
    const topics = found?.session?.topics?.length || 0;
    const quizzes = (getBaseProgress().quizzes?.[window.currentSessionId] || []).length;
    insight.innerHTML = `
      <h4>Ruta sugerida para esta sesión</h4>
      <div>Revisa <strong>${topics}</strong> conceptos troncales, prioriza <strong>${alerts}</strong> alertas clínicas y consolida con quiz${quizzes ? ` · intentos guardados: <strong>${quizzes}</strong>` : ''}.</div>
    `;
  }

  function toggleNotes(sessionId){
    const container = document.getElementById('tab-contenido') || document.getElementById('content-view');
    let box = document.getElementById('ultra-notes');
    if (box && box.dataset.sessionId !== sessionId) box.remove();
    if (!box) {
      box = document.createElement('div');
      box.id = 'ultra-notes';
      box.className = 'ultra-notes';
      box.dataset.sessionId = sessionId;
      box.innerHTML = `
        <strong style="display:block;margin-bottom:10px">Notas privadas de estudio</strong>
        <textarea id="ultra-notes-text" placeholder="Escribe aquí tus anclas de memoria, errores frecuentes, fórmulas, perlas clínicas..."></textarea>
        <div style="display:flex;gap:10px;margin-top:10px">
          <button class="ultra-btn success" id="ultra-notes-save">Guardar nota</button>
          <button class="ultra-btn" id="ultra-notes-close">Cerrar</button>
        </div>`;
      container.prepend(box);
      const notes = getNotes();
      const area = document.getElementById('ultra-notes-text');
      area.value = notes[sessionId] || '';
      document.getElementById('ultra-notes-save').onclick = ()=>{
        const all = getNotes();
        all[sessionId] = area.value.trim();
        if (!all[sessionId]) delete all[sessionId];
        setNotes(all);
        updateDashboard();
        toast('Nota guardada');
      };
      document.getElementById('ultra-notes-close').onclick = ()=>box.remove();
    } else {
      box.remove();
    }
  }

  function patchLifecycle(){
    if (window.__ultraPatched) return;
    window.__ultraPatched = true;

    if (typeof loadSession === 'function') {
      const originalLoadSession = loadSession;
      window.loadSession = function(id, subject){
        const result = originalLoadSession(id, subject);
        recordActiveDay();
        setTimeout(()=>{
          refreshSidebarProgress();
          updateDashboard();
          enhanceSessionView();
        }, 20);
        return result;
      };
    }

    if (typeof showHome === 'function') {
      const originalShowHome = showHome;
      window.showHome = function(){
        const r = originalShowHome();
        setTimeout(updateDashboard, 20);
        return r;
      };
    }

    // detect slide open links / iframe mode
    if (typeof backToSession === 'function') {
      const originalBack = backToSession;
      window.backToSession = function(){
        const r = originalBack();
        setTimeout(()=>{ enhanceSessionView(); }, 20);
        return r;
      };
    }

    // best-effort hook when slides-view becomes visible
    const observer = new MutationObserver(()=>{
      const slidesView = document.getElementById('slides-view');
      if (slidesView && slidesView.style.display !== 'none' && window.currentSessionId) {
        recordSlideView(window.currentSessionId);
      }
      if (document.getElementById('content-view')?.style.display !== 'none' && window.currentSessionId) {
        enhanceSessionView();
      }
    });
    observer.observe(document.body, { attributes:true, childList:true, subtree:true });
  }

  function installKeyboard(){
    document.addEventListener('keydown', e=>{
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openCommand();
      }
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        openCommand();
      }
      if (e.key === 'Escape') closeCommand();
    });
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    recordActiveDay();
    ensureToast();
    ensureHomeDashboard();
    ensureFloatingActions();
    ensureCommandPalette();
    patchLifecycle();
    refreshSidebarProgress();
    updateDashboard();
    installKeyboard();
    setTimeout(()=>{ refreshSidebarProgress(); updateDashboard(); }, 120);
  });
})();
