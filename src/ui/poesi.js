/**
 * Kylskåpspoesi: magneterna, dikten och dra-och-släpp. Orden väljs i src/glosor-poesi.js.
 * Dikten ligger kvar så länge appen är öppen (sparas inte).
 */
(() => {
const {
  card, symbolSVG, esc, poemOptions, poemLabel,
} = window.Glosor;
const UI = window.GlosorUI;
const { tx, app, register, showDetail } = UI;

// Varje magnet får en egen lutning, som följer med när den flyttas – så ser kylskåpsdörren lagom stökig ut.
const poem = { words: [], opts: null, hist: [], done: false, seq: 0 };
const jitter = () => ({ rot: +(Math.random() * 8 - 4).toFixed(1), dy: Math.round(Math.random() * 8 - 4) });
function newOpts(chosenId = null) {
  const old = new Map((poem.opts || []).map((o) => [o.id, o]));
  poem.opts = poemOptions(chosenId, chosenId == null ? [] : poem.opts || [])
    .map((o) => (o.kept && old.has(o.id) ? { ...old.get(o.id), kept: true, fresh: false } : { ...o, ...jitter(), fresh: true }));
}

const magnetHTML = (c, m, attrs, i = 0) =>
  `<button type="button" class="magnet${m.fresh ? ' fresh' : ''}" ${attrs} style="--rot:${m.rot}deg;--dy:${m.dy}px;--i:${i}">${symbolSVG(c, 3.4)}<span>${esc(poemLabel(c))}</span></button>`;

function poesi() {
  if (!poem.opts) newOpts();
  const words = poem.words.map((w, i) => magnetHTML(card(w.id), w, `data-placed="${i}" data-key="${w.key}"`)).join('');
  const opts = poem.opts.map((o, i) => magnetHTML(card(o.id), o, `data-mag="${o.id}"`, i)).join('');
  app.innerHTML = `
    <section class="panel">
      <div class="head"><h2>${tx('Kylskåpspoesi', 'Fridge poetry')}</h2>
        <button type="button" class="ghost" data-act="home">${tx('← Översikt', '← Overview')}</button></div>
      <p class="small muted" style="margin-bottom:12px">${poem.done
        ? tx('Tryck på ett ord för att se symbolen.', 'Tap a word to see the symbol.')
        : tx('Dra eller tryck på en magnet. Dra ut den för att ta bort.', 'Drag or tap a magnet. Drag it out to remove it.')}</p>
      <div class="fridge${poem.done ? ' done' : ''}">
        <div class="poem" id="poem">${words || `<p class="poem-empty">${tx('Dra hit ditt första ord', 'Drag your first word here')}</p>`}</div>
        ${poem.done ? '' : `<div class="pile" id="pile">${opts}</div>`}
      </div>
      <div class="row poem-actions">${poem.done
        ? `<button type="button" class="primary" id="poem-clear">${tx('Rensa och skriv en ny', 'Clear and write a new one')}</button>
           <button type="button" class="ghost" id="poem-edit">${tx('Skriv vidare', 'Keep writing')}</button>`
        : `<button type="button" class="primary" id="poem-done" ${poem.words.length ? '' : 'disabled'}>${tx('Färdig', 'Done')}</button>
           <button type="button" class="ghost" id="poem-undo" ${poem.hist.length ? '' : 'disabled'}>${tx('↶ Ångra', '↶ Undo')}</button>
           <button type="button" class="ghost" id="poem-shuffle">${tx('Nya ord', 'New words')}</button>`}</div>
    </section>`;
  for (const o of poem.opts) o.fresh = false;
  for (const w of poem.words) w.fresh = false;
}

/** Lägg ett ord i dikten (på plats at) och ta fram nästa omgång magneter. Returnerar magnetens nyckel. */
function placeWord(id, at = poem.words.length) {
  const key = ++poem.seq;
  poem.hist.push({ key, opts: poem.opts });
  poem.words.splice(at, 0, { id, key, ...jitter() });
  newOpts(id);
  return key;
}
function removeWord(i) {
  poem.words.splice(i, 1);
  if (!poem.words.length) { poem.hist = []; newOpts(); }   // tom dörr: börja om med helt slumpade ord
}
function undoWord() {
  const h = poem.hist.pop();
  if (!h) return;
  const i = poem.words.findIndex((w) => w.key === h.key);
  if (i >= 0) poem.words.splice(i, 1);
  poem.opts = h.opts.map((o) => ({ ...o, fresh: false }));
}

/** Var i dikten en magnet släpps: före första magneten som ligger efter punkten i läsordning. */
function insertIndex(x, y, skip = -1) {
  let i = 0;
  for (const el of document.querySelectorAll('#poem .magnet')) {
    if (+el.dataset.placed === skip) continue;
    const r = el.getBoundingClientRect();
    if (y < r.top || (y <= r.bottom && x < r.left + r.width / 2)) return i;
    i++;
  }
  return i;
}

// En lös kopia av magneten följer fingret och lutar åt det håll den dras.
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
function makeGhost(el) {
  const r = el.getBoundingClientRect();
  const g = el.cloneNode(true);
  g.classList.remove('fresh', 'settle', 'lifted');
  g.classList.add('mag-ghost');
  g.removeAttribute('data-mag'); g.removeAttribute('data-placed');
  Object.assign(g.style, { width: r.width + 'px', height: r.height + 'px' });
  document.body.appendChild(g);
  return { g, x: r.left, y: r.top, rot: parseFloat(el.style.getPropertyValue('--rot')) || 0, tilt: 0 };
}
const ghostAt = (gh, x, y, rot, scale = 1.08) => { gh.g.style.transform = `translate(${x}px,${y}px) rotate(${rot}deg) scale(${scale})`; };
/** Låt kopian glida till sin plats (eller tillbaka) och ta sedan bort den. */
function glide(gh, x, y, rot, done, fall = false) {
  const ms = reduceMotion.matches ? 0 : fall ? 260 : 220;
  gh.g.style.transition = `transform ${ms}ms cubic-bezier(.2,.9,.3,1.15), opacity ${ms}ms`;
  requestAnimationFrame(() => {
    ghostAt(gh, x, y, rot, fall ? 0.7 : 1);
    if (fall) gh.g.style.opacity = '0';
  });
  setTimeout(() => { gh.g.remove(); done?.(); }, ms + 20);
}
/** Efter omritning: den nya magneten i dikten tar över där kopian landar. */
function landOn(gh, key) {
  const el = document.querySelector(`#poem [data-key="${key}"]`);
  if (!el) { gh.g.remove(); return; }
  el.classList.add('landing');
  const r = el.getBoundingClientRect();
  glide(gh, r.left, r.top, parseFloat(el.style.getPropertyValue('--rot')) || 0, () => {
    el.classList.remove('landing');
    el.classList.add('settle');
  });
}

let drag = null, suppressClick = false;
app.addEventListener('pointerdown', (e) => {
  if (UI.view() !== 'poesi' || poem.done || drag || e.button > 0) return;
  const el = e.target.closest('.magnet');
  if (el) drag = { el, pid: e.pointerId, x0: e.clientX, y0: e.clientY, lx: e.clientX, gh: null };
});
window.addEventListener('pointermove', (e) => {
  if (!drag || e.pointerId !== drag.pid) return;
  if (!drag.gh) {
    if (Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) < 6) return;
    drag.gh = makeGhost(drag.el);
    drag.ox = drag.x0 - drag.gh.x; drag.oy = drag.y0 - drag.gh.y;
    drag.el.classList.add('lifted');
  }
  e.preventDefault();
  const gh = drag.gh;
  gh.tilt = Math.max(-16, Math.min(16, gh.tilt * 0.75 + (e.clientX - drag.lx) * 0.9));
  drag.lx = e.clientX;
  ghostAt(gh, e.clientX - drag.ox, e.clientY - drag.oy, gh.rot + gh.tilt);
  const pr = document.getElementById('poem').getBoundingClientRect();
  drag.over = e.clientX >= pr.left && e.clientX <= pr.right && e.clientY >= pr.top - 10 && e.clientY <= pr.bottom + 10;
  document.getElementById('poem').classList.toggle('over', drag.over);
  // nära skärmkanten: bläddra med, så att dikten nås även när magneterna ligger långt ner
  if (e.clientY < 70) window.scrollBy(0, -14);
  else if (e.clientY > innerHeight - 70) window.scrollBy(0, 14);
}, { passive: false });
function endDrag(e) {
  if (!drag || e.pointerId !== drag.pid) return;
  const { el, gh, over } = drag;
  drag = null;
  if (!gh) return;   // ingen förflyttning: ett vanligt tryck, som klickhanteraren tar
  suppressClick = true;
  setTimeout(() => { suppressClick = false; }, 60);
  const placed = el.dataset.placed != null ? +el.dataset.placed : -1;
  if (e.type === 'pointercancel' || (!over && placed < 0)) {
    // tillbaka till högen
    const r = el.getBoundingClientRect();
    return glide(gh, r.left, r.top, gh.rot, () => el.classList.remove('lifted'));
  }
  if (!over) {
    // dragen ur dikten: magneten faller bort
    removeWord(placed);
    poesi();
    return glide(gh, gh.x, innerHeight + 40, gh.rot + 40, null, true);
  }
  const at = insertIndex(e.clientX, e.clientY, placed);
  let key;
  if (placed >= 0) {
    const [w] = poem.words.splice(placed, 1);
    poem.words.splice(at, 0, w);
    key = w.key;
  } else key = placeWord(+el.dataset.mag, at);
  poesi();
  landOn(gh, key);
}
window.addEventListener('pointerup', endDrag);
window.addEventListener('pointercancel', endDrag);
app.addEventListener('click', (e) => { if (suppressClick) { e.stopPropagation(); e.preventDefault(); suppressClick = false; } }, true);

/** Tryck på en magnet i högen: den flyger upp sist i dikten. */
function tapMagnet(el) {
  const gh = makeGhost(el);
  ghostAt(gh, gh.x, gh.y, gh.rot, 1);
  const key = placeWord(+el.dataset.mag);
  poesi();
  landOn(gh, key);
}

// ---------------------------------------------------------------- händelser
register('poesi', {
  render: poesi,
  top: true,
  click(t) {
    if (UI.view() !== 'poesi') return false;
    if (t.dataset.mag != null) return tapMagnet(t), true;
    if (t.dataset.placed != null) return showDetail(poem.words[+t.dataset.placed].id), true;
    if (t.id === 'poem-done') { poem.done = true; poesi(); return true; }
    if (t.id === 'poem-edit') { poem.done = false; poesi(); return true; }
    if (t.id === 'poem-clear') { Object.assign(poem, { words: [], hist: [], done: false }); newOpts(); poesi(); return true; }
    if (t.id === 'poem-undo') { undoWord(); poesi(); return true; }
    if (t.id === 'poem-shuffle') { poem.opts = []; newOpts(poem.words.length ? poem.words[poem.words.length - 1].id : null); poesi(); return true; }
    return false;
  },
});
})();
