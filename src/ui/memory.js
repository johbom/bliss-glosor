/**
 * Memory: vänd två kort i taget och hitta paren (logiken i src/glosor-memory.js). Kort som inte är ett par
 * vänds tillbaka efter 2 eller 4 sekunder, eller vid nästa tryck. En spelare (par och drag) eller två som
 * turas om. Kortet som vänds läses upp. Pilarna flyttar mellan korten, Enter/mellanslag vänder.
 * Inställningarna sparas i S.settings.memory (finns först när man ändrat något).
 */
(() => {
const {
  S, save, esc, symbolSVG, pickEntries, makeDeck, newState, turnCard, coverCards, gridFor, memoryPool, ownEntries,
} = window.Glosor;
const UI = window.GlosorUI;
const { tx, app, register, say, canSpeak, stop } = UI;

const DEFAULTS = { pairs: 6, kind: 'same', level: 'latt', players: 1, back: '2000', label: true, speak: true, own: '' };
const opt = () => ({ ...DEFAULTS, ...(S.settings.memory || {}) });
function setOpt(k, v) { S.settings.memory = { ...opt(), [k]: v }; save(); }

let G = null, backT = null, ro = null;
const player = (k) => tx(`Spelare ${k + 1}`, `Player ${k + 1}`);
const speak = (t) => { if (opt().speak && canSpeak && t) say(t, true); };
function msg(t, cls = '') { const m = document.getElementById('mem-msg'); if (m) { m.textContent = t; m.className = `mem-msg ${cls}`; } }

// ---------------------------------------------------------------- spel
function newGame() {
  clearTimeout(backT);
  stop();
  const o = opt();
  let note = '', pool;
  if (o.level === 'egna') {
    const r = ownEntries(o.own);
    pool = r.entries;
    if (r.missing.length) note = tx(`Ingen blissymbol för: ${r.missing.join(', ')}. `, `No Bliss symbol for: ${r.missing.join(', ')}. `);
  } else pool = memoryPool(o.level);
  const entries = pickEntries(pool, +o.pairs);
  if (entries.length < 2) {
    G = null;
    document.getElementById('mem-board').innerHTML = '';
    renderScore();
    msg(note + (o.level === 'egna' ? tx('Skriv minst två ord som har blissymboler.', 'Write at least two words that have Bliss symbols.')
      : o.level === 'larda' ? tx('Öva på några ord först – sedan kan du spela med dem här.', 'Practise some words first – then you can play with them here.')
        : o.level === 'mina' ? tx('Lägg till minst två ord i Mina ord (☆ i Ordlista).', 'Add at least two words to My words (☆ in the Word list).')
          : tx('Det finns inte tillräckligt många ord här.', 'There are not enough words here.')), 'bad');
    return;
  }
  if (entries.length < +o.pairs) note += tx(`Bara ${entries.length} par den här gången. `, `Only ${entries.length} pairs this time. `);
  G = newState(makeDeck(entries, o.kind), +o.players);
  buildBoard();
  msg(note + (G.scores.length > 1 ? tx(`${player(0)} börjar.`, `${player(0)} begins.`) : tx('Vänd två kort.', 'Turn two cards.')), note ? 'bad' : '');
}

function faceHTML(c) {
  if (c.show === 'word') return `<span class="mface"><span class="mword">${esc(c.word)}</span></span>`;
  const label = opt().label;
  // Utsnitt runt mittfältet (samma ritning, mindre luft), så att symbolen blir stor på kortet.
  return `<span class="mface${label ? '' : ' nolabel'}">${symbolSVG(c.c, 4, '', [400, 1750], 90)}${label ? `<span class="mlbl">${esc(c.word)}</span>` : ''}</span>`;
}
function cardLabel(i) {
  const c = G.deck[i], n = i + 1;
  if (!c.found && !G.up.includes(i)) return tx(`Kort ${n}`, `Card ${n}`);
  const what = c.show === 'word' ? tx(`ordet ${c.word}`, `the word ${c.word}`) : c.word;
  return tx(`Kort ${n}: `, `Card ${n}: `) + what + (c.found ? tx(', hittat', ', found') : '');
}
function buildBoard() {
  const b = document.getElementById('mem-board');
  b.classList.remove('won');
  b.innerHTML = G.deck.map((c, i) => `<button type="button" class="mcard" data-mi="${i}"><span class="mback"><span class="mnum" aria-hidden="true">${i + 1}</span></span>${faceHTML(c)}</button>`).join('');
  layout();
  paint();
}
function layout() {
  const b = document.getElementById('mem-board');
  if (!G || !b) return;
  const r = b.getBoundingClientRect();
  const g = gridFor(G.deck.length, r.width || 800, r.height || 500);
  b.style.setProperty('--cols', g.cols);
  b.style.setProperty('--rows', g.rows);
}
function paint(miss = false) {
  const board = document.getElementById('mem-board');
  if (!G || !board) return;   // vyn har lämnats medan ett fel par väntade på att vändas
  const cards = board.children;
  G.deck.forEach((c, i) => {
    const el = cards[i];
    el.classList.toggle('up', G.up.includes(i));
    el.classList.toggle('found', c.found);
    el.classList.toggle('miss', miss && G.up.includes(i));
    el.disabled = c.found;
    el.setAttribute('aria-label', cardLabel(i));
  });
  board.classList.toggle('won', G.over);
  renderScore();
}
function renderScore() {
  const s = document.getElementById('mem-score');
  if (!s) return;
  if (!G) { s.innerHTML = ''; return; }
  const pairs = G.deck.length / 2;
  s.innerHTML = G.scores.length > 1
    ? G.scores.map((v, k) => `<span class="mpl${k === G.turn && !G.over ? ' on' : ''}">${player(k)}: <b>${v}</b></span>`).join('')
      + `<span>${tx('par', 'pairs')} <b>${G.scores[0] + G.scores[1]}</b>/${pairs}</span>`
    : `<span>${tx('par', 'pairs')} <b>${G.scores[0]}</b>/${pairs}</span><span>${tx('drag', 'moves')} <b>${G.moves}</b></span>`;
}
function endText() {
  if (G.scores.length === 1) return tx(`Alla par hittade på ${G.moves} drag!`, `All pairs found in ${G.moves} moves!`);
  const [a, b] = G.scores;
  if (a === b) return tx(`Oavgjort – ${a} par var!`, `A draw – ${a} pairs each!`);
  const w = a > b ? 0 : 1;
  return tx(`${player(w)} vann med ${Math.max(a, b)} par mot ${Math.min(a, b)}!`, `${player(w)} wins, ${Math.max(a, b)} pairs to ${Math.min(a, b)}!`);
}
function onCard(i) {
  if (!G) return;
  clearTimeout(backT);
  const r = turnCard(G, i);
  if (r.what === 'none') return;
  if (r.what === 'cover') { paint(); msg(''); return; }
  paint(r.what === 'miss');
  const c = G.deck[i];
  if (r.what === 'up') { msg(c.word); speak(c.word); return; }
  if (r.what === 'pair') {
    msg(tx(`Ett par: ${c.word}!`, `A pair: ${c.word}!`) + (G.scores.length > 1 ? ' ' + tx(`${player(G.turn)} fortsätter.`, `${player(G.turn)} goes again.`) : ''), 'good');
    speak(c.word);
  } else if (r.what === 'end') {
    const t = endText();
    msg(t, 'good');
    speak([c.word, t].join('. '));
    document.getElementById('mem-new')?.focus();
  } else {
    const manual = opt().back === 'tryck';
    msg(tx('Inte ett par.', 'Not a pair.') + (G.scores.length > 1 ? ' ' + tx(`Nu är det ${player(G.turn)}s tur.`, `Now it is ${player(G.turn)}'s turn.`) : '')
      + (manual ? ' ' + tx('Tryck på ett kort för att fortsätta.', 'Press a card to go on.') : ''), 'bad');
    speak(c.word);
    if (!manual) backT = setTimeout(() => { if (G && coverCards(G)) paint(); }, +opt().back || 2000);
  }
  // Ett hittat kort kan inte ha fokus: nästa kort som är kvar får det.
  const a = document.activeElement;
  if (!G.over && (!a || a === document.body || a.disabled)) {
    const cards = [...document.getElementById('mem-board').children];
    cards.slice(i).concat(cards.slice(0, i)).find((el) => !el.disabled)?.focus();
  }
}

// ---------------------------------------------------------------- sidan
function memory() {
  const o = opt();
  const sel = (id, label, options, value) => `<label class="set-row"><span class="set-text">${label}</span>
      <select id="${id}" class="set-select">${options.map(([v, t]) => `<option value="${v}"${String(v) === String(value) ? ' selected' : ''}>${t}</option>`).join('')}</select></label>`;
  const sw = (id, label, on) => `<label class="set-row"><span class="set-text">${label}</span><input type="checkbox" class="switch" id="${id}" ${on ? 'checked' : ''}></label>`;
  app.innerHTML = `
    <div class="tool-head"><h2 class="page-title">Memory</h2>
      <button type="button" class="ghost back" data-act="home">${tx('← Start', '← Home')}</button></div>
    <section class="panel mem-play">
      <div class="mem-top"><p id="mem-msg" class="mem-msg" aria-live="polite"></p><span id="mem-score" class="mem-score"></span></div>
      <div id="mem-board" class="mem-board" aria-label="${tx('Spelplan', 'Game board')}"></div>
      <div class="tool-actions"><button type="button" class="primary say-main" id="mem-new">${tx('Nytt spel', 'New game')}</button></div>
    </section>
    <section class="set-group mem-settings"><h3>${tx('Inställningar', 'Settings')}</h3><div class="set-card">
      ${sel('mem-level', tx('Ord', 'Words'), [
        ['latt', tx('Lätt · vardagsord', 'Easy · everyday words')], ['larda', tx('Ord du övat på', 'Words you have practised')],
        ['mina', tx('Mina ord', 'My words')], ['gula', tx('Medel · alla saker (gula ord)', 'Medium · all things (yellow words)')],
        ['alla', tx('Svår · hela ordlistan', 'Hard · the whole word list')], ['egna', tx('Egna ord', 'My own words')]], o.level)}
      <div class="set-row mem-own" ${o.level === 'egna' ? '' : 'hidden'}>
        <label class="set-text" for="mem-own-words">${tx('Skriv orden, med komma emellan', 'Write the words, with commas between')}
          <small>${tx('Ett ord utan blissymbol tas inte med.', 'A word without a Bliss symbol is left out.')}</small></label>
        <textarea id="mem-own-words" class="write-in" rows="2" placeholder="${tx('katt, hund, boll, sol …', 'cat, dog, ball, sun …')}">${esc(o.own)}</textarea>
        <button type="button" class="ghost" id="mem-own-play">${tx('Spela med orden', 'Play with these words')}</button>
      </div>
      ${sel('mem-pairs', tx('Antal par', 'Pairs'), [4, 6, 8, 10, 12].map((n) => [n, n]), o.pairs)}
      ${sel('mem-kind', tx('Ett par är', 'A pair is'), [['same', tx('samma symbol två gånger', 'the same symbol twice')], ['word', tx('en symbol och dess ord', 'a symbol and its word')]], o.kind)}
      ${sel('mem-players', tx('Spelare', 'Players'), [[1, tx('En spelare', 'One player')], [2, tx('Två, turas om', 'Two, taking turns')]], o.players)}
      ${sel('mem-back', tx('Fel par vänds tillbaka', 'A wrong pair turns back'), [['2000', tx('efter 2 sekunder', 'after 2 seconds')], ['4000', tx('efter 4 sekunder', 'after 4 seconds')], ['tryck', tx('vid nästa tryck', 'at the next press')]], o.back)}
      ${sw('mem-label', tx('Ordet under symbolen', 'The word under the symbol'), o.label)}
      ${canSpeak ? sw('mem-speak', tx('Läs upp kortet som vänds', 'Read the turned card aloud'), o.speak) : ''}
    </div></section>`;
  ro?.disconnect();
  ro = new ResizeObserver(() => layout());
  ro.observe(document.getElementById('mem-board'));
  newGame();
}

register('memory', {
  render: memory,
  top: true,
  relang() { memory(); },
  click(t) {
    if (t.id === 'memory-open') return UI.setView('memory'), true;
    if (UI.view() !== 'memory') return false;
    if (t.dataset.mi != null) { onCard(+t.dataset.mi); return true; }
    if (t.id === 'mem-new') { newGame(); return true; }
    if (t.id === 'mem-own-play') { setOpt('own', document.getElementById('mem-own-words').value); newGame(); return true; }
    return false;
  },
  change(t) {
    const map = { 'mem-level': 'level', 'mem-pairs': 'pairs', 'mem-kind': 'kind', 'mem-players': 'players', 'mem-back': 'back', 'mem-label': 'label', 'mem-speak': 'speak', 'mem-own-words': 'own' };
    const k = map[t.id];
    if (!k) return;
    setOpt(k, t.type === 'checkbox' ? t.checked : t.value);
    if (k === 'level') {
      const own = document.querySelector('.mem-own');
      own.hidden = t.value !== 'egna';
      if (t.value === 'egna' && !opt().own.trim()) { document.getElementById('mem-own-words').focus(); return; }
    }
    if (['level', 'pairs', 'kind', 'players'].includes(k)) newGame();
    if (k === 'label' && G) buildBoard();
  },
  // Pilarna flyttar mellan korten, rad för rad; hittade kort hoppas över.
  key(e) {
    const b = document.getElementById('mem-board');
    if (!b || !G || !b.contains(document.activeElement)) return;
    const cols = +getComputedStyle(b).getPropertyValue('--cols') || 4;
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -cols, ArrowDown: cols }[e.key];
    if (!step) return;
    e.preventDefault();
    const cards = [...b.children];
    for (let j = cards.indexOf(document.activeElement) + step; j >= 0 && j < cards.length; j += step) {
      if (!cards[j].disabled) { cards[j].focus(); return; }
    }
  },
});
})();
