/**
 * Skriv en egen mening: man skriver med bokstäver och ser det i Bliss. Håller man in på ett ord visas en
 * ruta intill det med andra ord med samma namn, andra böjningar, synonymer och härledda verb. Tolkningen görs i src/glosor-skriv.js; texten
 * ligger kvar så länge appen är öppen (sparas inte), som dikten i kylskåpspoesin.
 * De böjda formerna (src/vendor/bliss-former.js, ritade i förväg) laddas första gången vyn öppnas.
 */
(() => {
const {
  card, esc, writeWords, chosenOptions, formName, optionLabel, frameSVG, addDrawings, hasDrawing,
} = window.Glosor;
const UI = window.GlosorUI;
const { tx, app, register, say, sayAll, speakOn, stop, SPEAKER } = UI;

// picks: valt alternativ per ord, nyckel "<plats>:<ord>" – byts ordet ut börjar det om från förvalet.
const st = { text: '', picks: new Map(), sel: null, words: [] };
let forms = window.BLISS_FORMER ? 'done' : null;

function loadForms() {
  if (forms) return;
  forms = 'loading';
  const s = document.createElement('script');
  s.src = 'src/vendor/bliss-former.js';
  s.onload = () => { addDrawings(window.BLISS_FORMER); forms = 'done'; if (UI.view() === 'skriv') update(); };
  s.onerror = () => { forms = 'error'; s.remove(); if (UI.view() === 'skriv') update(); };
  document.head.appendChild(s);
}

const pickKey = (i, w) => `${i}:${w.text.toLowerCase()}`;
// Valet för varje ord (räknas om när något ändras: "ska" påverkar verbet efter).
let choice = [];
const recount = () => { choice = chosenOptions(st.words, (i) => st.picks.get(pickKey(i, st.words[i]))); };
const chosen = (i) => choice[i];
/** Ritningen för ett alternativ, eller null medan böjningarna laddas. */
const drawn = (o, unit, spaced = false) => (hasDrawing(o.key) ? frameSVG(o.key, unit, '', spaced) : null);
const loadingBox = () => `<span class="ww-wait">${forms === 'error' ? '?' : '…'}</span>`;

/** Liten rad under ordet när symbolen inte är BCI:s eget ord: "≈ eld" (synonym) eller "härlett". */
const noteOf = (o) => (o?.via ? `≈ ${o.via}` : o?.derived ? tx('härlett', 'derived') : '');

function wordHTML(w, i) {
  const cap = `<figcaption>${esc(w.text)}</figcaption>`;
  if (!w.options.length) {
    return `<figure class="ww txt" data-wi="${i}"><span class="ww-text" title="${tx('Ingen symbol för ordet', 'No symbol for this word')}">${esc(w.text)}</span>${cap}</figure>`;
  }
  const o = chosen(i), open = st.sel === i, many = w.options.length > 1, note = noteOf(o);
  const cls = o.skip ? ' skip' : o.text ? ' txt' : '';
  const body = o.skip ? `<span class="ww-skip">${esc(w.text)}</span>`
    : o.text ? `<span class="ww-text">${esc(w.text)}</span>` : drawn(o, 5.4, true) || loadingBox();
  return `<button type="button" class="ww${cls}" data-w="${i}" data-wi="${i}" aria-haspopup="dialog" aria-expanded="${open}"`
    + ` aria-label="${esc(w.text)}${many ? ` – ${tx('håll in för att byta', 'press and hold to change')}` : ''}">`
    + `${body}${o.skip ? '' : cap}${note ? `<small class="ww-note">${esc(note)}</small>` : ''}`
    + `${many ? '<i class="ww-more" aria-hidden="true"></i>' : ''}</button>`;
}

/** Rutan med alternativen, intill ordet (placePop flyttar den dit). */
function popHTML() {
  const i = st.sel, w = st.words[i];
  if (!w) return '';
  const cur = chosen(i);
  const labels = w.options.map(optionLabel);
  const opts = w.options.map((o, j) => {
    let note = o.via ? tx('synonym', 'synonym') : o.derived ? `${tx('härlett', 'derived')}, ${formName(o.form)}` : o.form ? formName(o.form) : '';
    // Samma ord på flera symboler: BCI:s övriga glosor skiljer dem åt.
    if (!note && o.id != null && labels.filter((l) => l === labels[j]).length > 1) note = card(o.id).others.slice(0, 2).join(', ');
    const pic = o.skip || o.text ? `<span class="ww-none">${tx('utan symbol', 'no symbol')}</span>` : drawn(o, 3) || loadingBox();
    const label = o.skip ? (w.future ? tx('Hoppa över – framtid på verbet', 'Leave out – future on the verb') : tx('Hoppa över', 'Leave out'))
      : o.text ? tx('Som text', 'As text') : labels[j];
    return `<button type="button" class="chip" data-wopt="${j}" aria-pressed="${o.key === cur.key}">${pic}<span>${esc(label)}</span>${note ? `<small class="note">${esc(note)}</small>` : ''}</button>`;
  }).join('');
  const more = cur.id == null ? '' : `<button type="button" class="linklike" data-detail="${cur.id}">${tx('Mer om symbolen', 'More about the symbol')}</button>`;
  const head = w.guess ? tx(`BCI har inte ordet ”${esc(w.text)}”.`, `BCI does not have the word “${esc(w.text)}”.`)
    : tx(`Välj för ”${esc(w.text)}”:`, `Choose for “${esc(w.text)}”:`);
  return `<div class="write-pop" id="write-pop" role="dialog" aria-label="${tx(`Välj för ”${esc(w.text)}”`, `Choose for “${esc(w.text)}”`)}">
      <div class="pop-head"><p class="small muted">${head}</p>
        <button type="button" class="pop-close" id="write-pop-close" aria-label="${tx('Stäng', 'Close')}">×</button></div>
      <div class="pop-opts">${opts}</div>${more}</div>`;
}

function outHTML() {
  if (!st.words.length) return `<p class="small muted write-empty">${tx('Det du skriver visas här i Bliss.', 'What you write is shown here in Bliss.')}</p>`;
  const unknown = st.words.some((w, i) => !w.options.length || chosen(i)?.text);
  return `<div class="sentence write">${st.words.map(wordHTML).join('')}</div>
    ${unknown ? `<p class="small muted">${tx('Ord utan symbol visas som text.', 'Words without a symbol are shown as text.')}</p>` : ''}
    ${forms === 'error' ? `<p class="small muted">${tx('Böjningarna kunde inte laddas. Försök igen när du har nät.', 'The inflected forms could not be loaded. Try again when you are online.')}</p>` : ''}
    ${st.sel != null ? popHTML() : ''}`;
}
const actionsHTML = () => `${speakOn() && st.words.length ? `<button type="button" class="ghost" id="write-say">${SPEAKER} ${tx('Läs upp', 'Read aloud')}</button>` : ''}
    <button type="button" class="ghost" id="write-clear" ${st.text ? '' : 'disabled'}>${tx('Rensa', 'Clear')}</button>`;

function parse() {
  st.words = writeWords(st.text);
  recount();
  if (st.sel != null && !st.words[st.sel]?.options.length) st.sel = null;
}
/** Lägg rutan under ordet (eller över, om den inte ryms under), inom panelen. Pilen pekar på ordet. */
function placePop() {
  const pop = document.getElementById('write-pop'), out = document.getElementById('write-out');
  const btn = out?.querySelector(`[data-w="${st.sel}"]`);
  if (!pop || !btn) return;
  const w = pop.offsetWidth, max = out.clientWidth;
  const mid = btn.offsetLeft + btn.offsetWidth / 2;
  const left = Math.max(0, Math.min(mid - w / 2, max - w));
  let top = btn.offsetTop + btn.offsetHeight + 8, above = false;
  const r = btn.getBoundingClientRect();
  if (r.bottom + pop.offsetHeight + 16 > window.innerHeight && r.top - pop.offsetHeight - 16 > 0) {
    top = btn.offsetTop - pop.offsetHeight - 8;
    above = true;
  }
  pop.classList.toggle('above', above);
  Object.assign(pop.style, { left: `${left}px`, top: `${top}px` });
  pop.style.setProperty('--ax', `${Math.max(16, Math.min(w - 16, mid - left))}px`);
  pop.classList.add('shown');
  const rp = pop.getBoundingClientRect();
  if (rp.bottom > window.innerHeight || rp.top < 0) pop.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}
/** Rita om allt utom skrivfältet, så att markören står kvar där man skriver. */
function update() {
  const out = document.getElementById('write-out'), act = document.getElementById('write-actions');
  if (out) out.innerHTML = outHTML();
  if (act) act.innerHTML = actionsHTML();
  if (st.sel != null) placePop();
}
function openPop(i) {
  if (!st.words[i] || st.words[i].options.length < 2) return;
  st.sel = i;
  update();
  document.querySelector('#write-pop [aria-pressed="true"]')?.focus({ preventScroll: true });
}
function closePop(focusWord = false) {
  if (st.sel == null) return;
  const i = st.sel;
  st.sel = null;
  update();
  if (focusWord) document.querySelector(`#write-out [data-w="${i}"]`)?.focus();
}
/** Kort tryck på ett ord: en liten lapp om att hålla in (och ordet läses upp, om uppläsningen är på). */
function hint(btn) {
  const out = document.getElementById('write-out');
  out.querySelector('.write-hint')?.remove();
  const h = document.createElement('div');
  h.className = 'write-hint';
  h.textContent = tx('Håll in för att byta', 'Press and hold to change');
  out.appendChild(h);
  h.style.left = `${Math.max(0, Math.min(btn.offsetLeft + btn.offsetWidth / 2 - h.offsetWidth / 2, out.clientWidth - h.offsetWidth))}px`;
  h.style.top = `${btn.offsetTop + btn.offsetHeight - 6}px`;
  setTimeout(() => h.remove(), 1600);
}

// ---- håll in ----
// Efter HOLD ms öppnas rutan (pekskärm, mus och penna). Högerklick och tangentbordet (Enter/mellanslag)
// öppnar den också. Flyttar man fingret (rullar sidan) blir det inget.
const HOLD = 450;
let press = null;
app.addEventListener('pointerdown', (e) => {
  const b = e.target.closest?.('.ww[data-w]');
  if (!b || UI.view() !== 'skriv' || e.button > 0) return;
  clearTimeout(press?.timer);
  press = { i: +b.dataset.w, x: e.clientX, y: e.clientY, fired: false };
  press.timer = setTimeout(() => { press.fired = true; navigator.vibrate?.(8); openPop(press.i); }, HOLD);
});
app.addEventListener('pointermove', (e) => {
  if (press && !press.fired && Math.hypot(e.clientX - press.x, e.clientY - press.y) > 10) clearTimeout(press.timer);
});
for (const ev of ['pointerup', 'pointercancel']) app.addEventListener(ev, () => { if (press) clearTimeout(press.timer); });
app.addEventListener('contextmenu', (e) => {
  const b = e.target.closest?.('.ww[data-w]');
  if (!b || UI.view() !== 'skriv') return;
  e.preventDefault();
  if (!press?.fired) openPop(+b.dataset.w);
});
document.addEventListener('pointerdown', (e) => {
  if (st.sel != null && UI.view() === 'skriv' && !e.target.closest?.('#write-pop, .ww[data-w]')) closePop();
});
window.addEventListener('resize', () => { if (st.sel != null && UI.view() === 'skriv') placePop(); });

function skriv() {
  loadForms();
  parse();
  app.innerHTML = `
    <section class="panel">
      <div class="head"><h2>${tx('Skriv en mening', 'Write a sentence')}</h2>
        <button type="button" class="ghost" data-act="home">${tx('← Start', '← Home')}</button></div>
      <p class="small muted" style="margin-bottom:10px">${tx('Skriv med bokstäver, så blir det Bliss. Håll in på ett ord för att byta ord eller form.',
        'Type with letters and it becomes Bliss. Press and hold a word to change the word or form.')}</p>
      <label class="sr-only" for="write-in">${tx('Din mening', 'Your sentence')}</label>
      <textarea id="write-in" class="write-in" rows="2" autocapitalize="sentences" autocomplete="off" spellcheck="false"
        placeholder="${tx('Jag åt ett äpple.', 'I ate an apple.')}">${esc(st.text)}</textarea>
      <div id="write-out" aria-live="polite">${outHTML()}</div>
      <div class="row" id="write-actions">${actionsHTML()}</div>
    </section>`;
}

register('skriv', {
  render: skriv,
  top: true,
  relang() { skriv(); },
  input(t) {
    if (t.id !== 'write-in') return;
    st.text = t.value;
    st.sel = null;
    parse();
    update();
  },
  key(e) {
    if (e.key === 'Escape') closePop(true);
  },
  click(t, e) {
    if (t.id === 'write-open') return UI.setView('skriv'), true;
    if (UI.view() !== 'skriv') return false;
    if (t.dataset.w != null) {
      const i = +t.dataset.w;
      if (press?.fired && press.i === i) { press = null; return true; }   // rutan öppnades av att hålla in
      if (e?.detail === 0) { st.sel === i ? closePop(true) : openPop(i); return true; }   // tangentbordet
      if (st.sel === i) { closePop(); return true; }
      if (!chosen(i).skip) say(st.words[i].text);
      if (st.words[i].options.length > 1) hint(t);
      return true;
    }
    if (t.id === 'write-pop-close') { closePop(true); return true; }
    if (t.dataset.wopt != null) {
      const i = st.sel, j = +t.dataset.wopt, o = st.words[i].options[j];
      st.picks.set(pickKey(i, st.words[i]), j);
      recount();
      if (!o.skip) say(optionLabel(o) || st.words[i].text);
      closePop(true);
      return true;
    }
    if (t.id === 'write-say') {
      sayAll(st.words.map((w, i) => ({ text: w.text, el: () => document.querySelector(`#write-out [data-wi="${i}"]`) })));
      return true;
    }
    if (t.id === 'write-clear') {
      stop();
      Object.assign(st, { text: '', sel: null, words: [] });
      st.picks.clear();
      skriv();
      document.getElementById('write-in')?.focus();
      return true;
    }
    return false;
  },
});
})();
