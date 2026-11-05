/**
 * Kommunikationstavlan: tryck på symboler, så byggs en mening som visas som text och kan läsas upp
 * ("Säg") eller sparas som bild. Orden och texten kommer från src/glosor-tavla.js.
 * Meningen ligger kvar så länge appen är öppen (sparas inte), som i skrivfältet.
 * Utan mus: Tabb flyttar mellan symbolerna, Enter/mellanslag väljer, Backsteg tar bort det sista ordet.
 */
(() => {
const {
  card, deck, symbolSVG, esc, boardWords, boardLabel, boardText, boardGroups,
} = window.Glosor;
const UI = window.GlosorUI;
const { tx, app, register, say, speakOn, canSpeak, stop, SPEAKER } = UI;

const st = { ids: [], group: 'viktigt', q: '' };

const keyHTML = (c) => `<button type="button" class="bkey cls-b-${c.v.c}" data-bid="${c.id}">${symbolSVG(c, 4)}<span>${esc(boardLabel(c))}</span></button>`;

function searchWords(q) {
  q = q.trim().toLowerCase();
  if (!q) return [];
  const rank = (c) => (c.syns.some((s) => s.toLowerCase() === q) ? 0 : c.syns.some((s) => s.toLowerCase().startsWith(q)) ? 1 : 2);
  return [...deck.values()].filter((c) => c.syns.some((s) => s.toLowerCase().includes(q)))
    .sort((a, b) => rank(a) - rank(b) || b.score - a.score).slice(0, 40);
}

function gridHTML() {
  if (st.group === 'sok') {
    const hits = searchWords(st.q);
    return hits.length ? hits.map(keyHTML).join('')
      : `<p class="small muted">${st.q.trim() ? tx('Inga träffar.', 'No matches.') : tx('Skriv för att söka bland alla symboler.', 'Type to search all symbols.')}</p>`;
  }
  const words = boardWords(st.group);
  if (!words.length) return `<p class="small muted">${tx('Inga ord än. Välj ☆ på ett ord i Ordlista.', 'No words yet. Choose ☆ on a word in the Word list.')}</p>`;
  return words.map(keyHTML).join('');
}

function outHTML() {
  if (!st.ids.length) return `<p class="small muted board-empty">${tx('Din mening visas här.', 'Your sentence appears here.')}</p>`;
  return `<div class="board-sent">${st.ids.map((id, i) => {
    const c = card(id);
    return `<figure class="bw" data-bi="${i}">${symbolSVG(c, 3.6)}<figcaption>${esc(boardLabel(c))}</figcaption></figure>`;
  }).join('')}</div>`;
}
const textHTML = () => esc(boardText(st.ids));
const actionsHTML = () => {
  const none = st.ids.length ? '' : 'disabled';
  return `${canSpeak ? `<button type="button" class="primary" id="board-say" ${none}>${SPEAKER} ${tx('Säg', 'Say')}</button>` : ''}
    <button type="button" class="ghost" id="board-back" ${none} aria-label="${tx('Ta bort sista ordet', 'Remove the last word')}">⌫ ${tx('Sista', 'Last')}</button>
    <button type="button" class="ghost" id="board-clear" ${none}>${tx('Rensa', 'Clear')}</button>
    <button type="button" class="ghost" id="board-image" ${none}>${tx('Spara som bild', 'Save as image')}</button>`;
};

function tavla() {
  const tabs = [...boardGroups(), { key: 'sok', name: tx('Sök', 'Search') }]
    .map((g) => `<button type="button" data-bgroup="${g.key}" aria-pressed="${st.group === g.key}">${esc(g.name)}</button>`).join('');
  app.innerHTML = `
    <section class="panel board-top">
      <div class="head"><h2>${tx('Kommunikationstavla', 'Communication board')}</h2>
        <button type="button" class="ghost" data-act="home">${tx('← Start', '← Home')}</button></div>
      <div id="board-out" aria-live="polite">${outHTML()}</div>
      <p class="board-text" id="board-text">${textHTML()}</p>
      <div class="row" id="board-actions">${actionsHTML()}</div>
    </section>
    <section class="panel">
      <p class="small muted" style="margin-bottom:8px">${tx('Tryck på symbolerna i den ordning du vill säga dem.', 'Tap the symbols in the order you want to say them.')}</p>
      <div class="tabs board-tabs">${tabs}</div>
      ${st.group === 'sok' ? `<input class="search" id="board-q" type="search" placeholder="${tx('Sök symbol', 'Search symbol')}" value="${esc(st.q)}" style="margin-bottom:10px">` : ''}
      <div class="board-grid" id="board-grid">${gridHTML()}</div>
    </section>`;
}
/** Rita om meningen (inte rutnätet, så att fokus står kvar på symbolen man tryckte på). */
function update() {
  const focused = document.activeElement?.closest?.('#board-actions') ? document.activeElement.id : null;
  document.getElementById('board-out').innerHTML = outHTML();
  document.getElementById('board-text').innerHTML = textHTML();
  document.getElementById('board-actions').innerHTML = actionsHTML();
  // Knapparna ritas om: fokus stannar på samma knapp (eller går till tavlan när den knappen inte går att använda längre).
  const again = focused && document.getElementById(focused);
  if (again && !again.disabled) again.focus();
  else if (focused) document.querySelector('#board-grid .bkey')?.focus();
}

// ---------------------------------------------------------------- spara som bild
const PX = 2;
function symbolImage(c) {
  // Utan appens stilmall skulle himmels- och jordlinjen få symbolens färg och tjocklek.
  const svg = symbolSVG(c, 6 * PX).replace(/currentColor/g, '#1B1B1D')
    .replace('<style>', '<style>.staff{stroke:#D9D5CA;stroke-width:10}.staff.earth{stroke-width:16}');
  return new Promise((ok, fail) => {
    const im = new Image();
    im.onload = () => ok(im);
    im.onerror = fail;
    im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  });
}
async function sentenceImage() {
  await document.fonts?.ready;
  const font = getComputedStyle(document.body).fontFamily;
  const cs = st.ids.map(card);
  const ims = await Promise.all(cs.map(symbolImage));
  const cv = document.createElement('canvas'), ctx = cv.getContext('2d');
  ctx.font = `${15 * PX}px ${font}`;
  const cells = cs.map((c, i) => ({ c, im: ims[i], label: boardLabel(c), w: Math.max(ims[i].width, ctx.measureText(boardLabel(c)).width) + 12 * PX }));
  const maxW = 1400, pad = 28 * PX, gapY = 14 * PX, labelH = 22 * PX;
  const rows = [];
  let row = [], rw = 0;
  for (const m of cells) {
    if (row.length && rw + m.w > maxW) { rows.push(row); row = []; rw = 0; }
    rw += m.w; row.push(m);
  }
  rows.push(row);
  const rowW = (r) => r.reduce((a, m) => a + m.w, 0);
  const rowH = (r) => Math.max(...r.map((m) => m.im.height)) + labelH;
  const text = boardText(st.ids);
  ctx.font = `600 ${20 * PX}px ${font}`;
  const W = Math.ceil(Math.max(...rows.map(rowW), ctx.measureText(text).width, 360 * PX) + 2 * pad);
  const H = Math.ceil(pad + rows.reduce((a, r) => a + rowH(r), 0) + gapY * (rows.length - 1) + 20 * PX + 30 * PX + 28 * PX + pad);
  cv.width = W; cv.height = H;
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, W, H);
  let y = pad;
  for (const r of rows) {
    let x = (W - rowW(r)) / 2;
    for (const m of r) {
      ctx.drawImage(m.im, x + (m.w - m.im.width) / 2, y);
      ctx.fillStyle = '#4A4A48'; ctx.font = `${15 * PX}px ${font}`; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText(m.label, x + m.w / 2, y + m.im.height + 2 * PX);
      x += m.w;
    }
    y += rowH(r) + gapY;
  }
  y += 6 * PX;
  ctx.fillStyle = '#1B1B1D'; ctx.font = `600 ${20 * PX}px ${font}`; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  ctx.fillText(text, W / 2, y);
  ctx.fillStyle = '#8A8A86'; ctx.font = `${12 * PX}px ${font}`; ctx.textBaseline = 'alphabetic';
  ctx.fillText(tx('Blissymboler (BCI) · Bliss-glosor', 'Blissymbols (BCI) · Bliss Vocabulary'), W / 2, H - pad / 2);
  return new Promise((ok) => cv.toBlob(ok, 'image/png'));
}
async function saveImage() {
  let blob;
  try { blob = await sentenceImage(); } catch (_) { return; }
  const file = new File([blob], `${tx('mening', 'sentence')}.png`, { type: 'image/png' });
  const url = URL.createObjectURL(file);
  // Bilden visas också i en ruta, så att den alltid går att spara för hand (håll in eller högerklicka).
  const { dlg } = UI;
  dlg.innerHTML = `<button type="button" class="close" data-act="close" aria-label="${tx('Stäng', 'Close')}">×</button>
    <img class="board-img" src="${url}" alt="${esc(boardText(st.ids))}">
    <p class="small muted" style="margin-top:8px">${tx('Håll in på bilden (eller högerklicka) för att spara eller dela den.', 'Press and hold the image (or right-click) to save or share it.')}</p>`;
  dlg.dataset.id = '';
  if (!dlg.open) dlg.showModal();
  dlg.addEventListener('close', () => URL.revokeObjectURL(url), { once: true });
  if (matchMedia('(pointer: coarse)').matches && navigator.canShare?.({ files: [file] })) {
    navigator.share({ files: [file] }).catch(() => {});
    return;
  }
  const a = Object.assign(document.createElement('a'), { href: url, download: file.name });   // dator: hämta filen
  document.body.appendChild(a); a.click(); a.remove();
}

// ---------------------------------------------------------------- händelser
register('tavla', {
  render: tavla,
  top: true,
  relang() { tavla(); },
  input(t) {
    if (t.id !== 'board-q') return;
    st.q = t.value;
    document.getElementById('board-grid').innerHTML = gridHTML();
  },
  key(e) {
    if (e.key === 'Backspace' && st.ids.length) { e.preventDefault(); st.ids.pop(); update(); }
  },
  click(t) {
    if (t.id === 'board-open') return UI.setView('tavla'), true;
    if (UI.view() !== 'tavla') return false;
    if (t.dataset.bid) {
      st.ids.push(+t.dataset.bid);
      update();
      if (speakOn()) say(boardLabel(card(t.dataset.bid)));
      return true;
    }
    if (t.dataset.bgroup) { st.group = t.dataset.bgroup; tavla(); document.getElementById('board-q')?.focus(); return true; }
    if (t.id === 'board-say') { say(boardText(st.ids), true); return true; }
    if (t.id === 'board-back') { st.ids.pop(); update(); return true; }
    if (t.id === 'board-clear') { stop(); st.ids = []; update(); return true; }
    if (t.id === 'board-image') { saveImage(); return true; }
    return false;
  },
});
})();
