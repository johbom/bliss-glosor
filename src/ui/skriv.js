/**
 * Skriv en egen mening: man skriver med bokstäver och ser det i Bliss. Tryck på en symbol för att välja
 * ett annat ord med samma namn eller en annan böjning. Tolkningen görs i src/glosor-skriv.js; texten
 * ligger kvar så länge appen är öppen (sparas inte), som dikten i kylskåpspoesin.
 * De böjda formerna (src/vendor/bliss-former.js, ritade i förväg) laddas första gången vyn öppnas.
 */
(() => {
const {
  card, esc, writeWords, formName, optionLabel, frameSVG, addDrawings, hasDrawing,
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
const chosen = (i) => {
  const w = st.words[i];
  return w.options[Math.min(st.picks.get(pickKey(i, w)) || 0, w.options.length - 1)];
};
/** Ritningen för ett alternativ, eller null medan böjningarna laddas. */
const drawn = (o, unit, spaced = false) => (hasDrawing(o.key) ? frameSVG(o.key, unit, '', spaced) : null);
const loadingBox = () => `<span class="ww-wait">${forms === 'error' ? '?' : '…'}</span>`;

function wordHTML(w, i) {
  const cap = `<figcaption>${esc(w.text)}</figcaption>`;
  if (!w.options.length) {
    return `<figure class="ww txt" data-wi="${i}"><span class="ww-text" title="${tx('Ingen symbol för ordet', 'No symbol for this word')}">${esc(w.text)}</span>${cap}</figure>`;
  }
  const o = chosen(i), open = st.sel === i, many = w.options.length > 1;
  const attrs = `type="button" class="ww${o.skip ? ' skip' : ''}" data-w="${i}" data-wi="${i}" aria-expanded="${open}"`
    + ` aria-label="${esc(w.text)}${many ? ` – ${tx('välj ett annat ord', 'choose another word')}` : ''}"`;
  const body = o.skip ? `<span class="ww-skip">${esc(w.text)}</span>` : drawn(o, 5.4, true) || loadingBox();
  return `<button ${attrs}>${body}${o.skip ? '' : cap}${many ? '<i class="ww-more" aria-hidden="true"></i>' : ''}</button>`;
}

function pickerHTML() {
  const i = st.sel, w = st.words[i];
  if (!w) return '';
  const cur = chosen(i);
  const labels = w.options.map(optionLabel);
  const opts = w.options.map((o, j) => {
    let note = o.form ? formName(o.form) : '';
    // Samma ord på flera symboler: BCI:s övriga glosor skiljer dem åt.
    if (!note && !o.skip && labels.filter((l) => l === labels[j]).length > 1) note = card(o.id).others.slice(0, 2).join(', ');
    const pic = o.skip ? `<span class="ww-none">${tx('utan symbol', 'no symbol')}</span>` : drawn(o, 3.2) || loadingBox();
    const label = o.skip ? tx('Hoppa över', 'Leave out') : labels[j];
    return `<button type="button" class="chip" data-wopt="${j}" aria-pressed="${o.key === cur.key}">${pic}<span>${esc(label)}</span>${note ? `<small class="note">${esc(note)}</small>` : ''}</button>`;
  }).join('');
  const more = cur.skip ? '' : `<button type="button" class="linklike" data-detail="${cur.id}">${tx('Mer om symbolen', 'More about the symbol')}</button>`;
  return `<div class="write-pick" role="group" aria-label="${tx(`Välj för ”${esc(w.text)}”`, `Choose for “${esc(w.text)}”`)}">
      <p class="small muted">${tx(`Välj för ”${esc(w.text)}”:`, `Choose for “${esc(w.text)}”:`)}</p>
      <div class="formula">${opts}</div>${more}</div>`;
}

function outHTML() {
  if (!st.words.length) return `<p class="small muted write-empty">${tx('Det du skriver visas här i Bliss.', 'What you write is shown here in Bliss.')}</p>`;
  const unknown = st.words.filter((w) => !w.options.length).length;
  return `<div class="sentence write">${st.words.map(wordHTML).join('')}</div>
    ${unknown ? `<p class="small muted">${tx('Ord utan symbol visas som text.', 'Words without a symbol are shown as text.')}</p>` : ''}
    ${forms === 'error' ? `<p class="small muted">${tx('Böjningarna kunde inte laddas. Försök igen när du har nät.', 'The inflected forms could not be loaded. Try again when you are online.')}</p>` : ''}
    ${st.sel != null ? pickerHTML() : ''}`;
}
const actionsHTML = () => `${speakOn() && st.words.length ? `<button type="button" class="ghost" id="write-say">${SPEAKER} ${tx('Läs upp', 'Read aloud')}</button>` : ''}
    <button type="button" class="ghost" id="write-clear" ${st.text ? '' : 'disabled'}>${tx('Rensa', 'Clear')}</button>`;

function parse() {
  st.words = writeWords(st.text);
  if (st.sel != null && !st.words[st.sel]?.options.length) st.sel = null;
}
/** Rita om allt utom skrivfältet, så att markören står kvar där man skriver. */
function update() {
  const out = document.getElementById('write-out'), act = document.getElementById('write-actions');
  if (out) out.innerHTML = outHTML();
  if (act) act.innerHTML = actionsHTML();
}

function skriv() {
  loadForms();
  parse();
  app.innerHTML = `
    <section class="panel">
      <div class="head"><h2>${tx('Skriv en mening', 'Write a sentence')}</h2>
        <button type="button" class="ghost" data-act="home">${tx('← Start', '← Home')}</button></div>
      <p class="small muted" style="margin-bottom:10px">${tx('Skriv med bokstäver, så blir det Bliss. Tryck på en symbol för att välja ett annat ord eller en annan form.',
        'Type with letters and it becomes Bliss. Tap a symbol to choose another word or another form.')}</p>
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
  click(t) {
    if (t.id === 'write-open') return UI.setView('skriv'), true;
    if (UI.view() !== 'skriv') return false;
    if (t.dataset.w != null) {
      const i = +t.dataset.w, o = chosen(i);
      st.sel = st.sel === i ? null : i;
      if (!o.skip) say(st.words[i].text);
      update();
      return true;
    }
    if (t.dataset.wopt != null) {
      const i = st.sel, j = +t.dataset.wopt, o = st.words[i].options[j];
      st.picks.set(pickKey(i, st.words[i]), j);
      st.sel = null;
      if (!o.skip) say(optionLabel(o));
      update();
      document.querySelector(`[data-w="${i}"]`)?.focus();
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
