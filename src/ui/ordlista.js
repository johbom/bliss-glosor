/**
 * Ordlistan: sök bland alla symboler, påbörjade ord och Mina ord.
 */
(() => {
const {
  S, card, deck, chip, esc, isMine, mineCards,
} = window.Glosor;
const UI = window.GlosorUI;
const { tx, fmtN, app, register } = UI;

// ---------------------------------------------------------------- ordlista
let listQuery = '';
let listTab = 'started';   // 'started' | 'mine'
function list(rebuild = false) {
  const q = listQuery.trim().toLowerCase();
  let items;
  if (q) {
    const rank = (c) => {
      const syns = c.syns.map((s) => s.toLowerCase());
      return syns.includes(q) ? 0 : syns.some((s) => s.startsWith(q)) ? 1 : 2;
    };
    items = [...deck.values()].filter((c) => c.v.sv.toLowerCase().includes(q) || c.v.en.toLowerCase().includes(q)
      || c.synsSv.some((s) => s.toLowerCase().includes(q)))
      .sort((a, b) => rank(a) - rank(b) || b.score - a.score)
      .slice(0, 60);
  } else if (listTab === 'mine') {
    items = mineCards();
  } else {
    items = Object.keys(S.cards).map(card).filter(Boolean).sort((a, b) => S.cards[b.id].t - S.cards[a.id].t);
  }
  // Under ordet: hur väl det sitter (Ny, Övas, Lärd, Kan); stjärnan i hörnet = i Mina ord.
  const star = (c) => (isMine(c.id) ? `<span class="star" role="img" aria-label="${tx('I Mina ord', 'In My words')}">★</span>` : '');
  const html = items.map((c) => chip(c, 3.4).replace('</button>', `${star(c)}${UI.stageHTML(c.id)}</button>`)).join('');
  const box = document.getElementById('listgrid');
  if (box && !rebuild) {
    box.innerHTML = html || emptyList(q);
    document.getElementById('listnote').textContent = listNote(q, items.length);
    return;
  }
  const tab = (k, label) => `<button type="button" data-tab="${k}" aria-pressed="${!q && listTab === k}">${label}</button>`;
  app.innerHTML = `<section class="panel">
    <input class="search" id="q" type="search" placeholder="${tx(`Sök bland ${fmtN(deck.size)} symboler`, `Search ${fmtN(deck.size)} symbols`)}" value="${esc(listQuery)}">
    <div class="tabs">${tab('started', tx('Påbörjade', 'Started'))}${tab('mine', `${tx('Mina ord', 'My words')} (${mineCards().length})`)}</div>
    <p class="small muted" style="margin-bottom:10px" id="listnote" aria-live="polite">${listNote(q, items.length)}</p>
    <div class="grid" id="listgrid">${html || emptyList(q)}</div></section>`;
}
const listNote = (q, n = 0) => (q ? (n >= 60 ? tx('Visar de 60 bästa träffarna.', 'Showing the 60 best matches.') : n ? tx(`${n} träffar.`, `${n} matches.`) : '')
  : listTab === 'mine' ? tx('Tryck på ett ord för att öppna det och ta bort det.', 'Tap a word to open it and remove it.')
  : tx('Senast övade först. Tryck på ett ord för mer.', 'Most recently practised first. Tap a word for more.'));
const emptyList = (q) => `<p class="muted">${q ? tx('Inga träffar.', 'No matches.')
  : listTab === 'mine' ? tx('Inga ord än. Sök upp ett ord och välj ☆.', 'No words yet. Look up a word and choose ☆.')
  : tx('Inget påbörjat än – tryck Börja öva på Start.', 'Nothing started yet – press Start practising on Home.')}</p>`;

register('list', {
  render: () => list(),
  refresh: () => list(true),
  click(t) {
    if (t.dataset.tab) { listTab = t.dataset.tab; listQuery = ''; list(true); return true; }
    return false;
  },
  input(t) {
    if (t.id !== 'q') return;
    listQuery = t.value;
    document.querySelectorAll('[data-tab]').forEach((b) => b.setAttribute('aria-pressed', String(!listQuery.trim() && b.dataset.tab === listTab)));
    list();
  },
});
})();
