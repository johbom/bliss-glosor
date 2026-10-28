/**
 * Ordlistan: sök bland alla symboler, påbörjade ord och Mina ord.
 */
(() => {
const {
  S, boxOf, card, deck, chip, esc, isMine, mineCards,
} = window.Glosor;
const { tx, fmtN, app, register } = window.GlosorUI;

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
  const dots = (c) => {
    const b = boxOf(c.id);
    if (b < 0) return `<div class="dots small muted">${tx('ej påbörjad', 'not started')}</div>`;
    return `<div class="dots" title="${tx(`Låda ${b} av 7`, `Box ${b} of 7`)}">${Array.from({ length: 7 }, (_, i) => `<i class="${i < b ? 'f' : ''}"></i>`).join('')}</div>`;
  };
  const star = (c) => (isMine(c.id) ? `<span class="star" title="${tx('I Mina ord', 'In My words')}">★</span>` : '');
  const html = items.map((c) => chip(c, 3.4).replace('</button>', `${star(c)}${dots(c)}</button>`)).join('');
  const box = document.getElementById('listgrid');
  if (box && !rebuild) { box.innerHTML = html || emptyList(q); return; }
  const tab = (k, label) => `<button type="button" data-tab="${k}" aria-pressed="${!q && listTab === k}">${label}</button>`;
  app.innerHTML = `<section class="panel">
    <input class="search" id="q" type="search" placeholder="${tx(`Sök bland ${fmtN(deck.size)} symboler`, `Search ${fmtN(deck.size)} symbols`)}" value="${esc(listQuery)}">
    <div class="tabs">${tab('started', tx('Påbörjade', 'Started'))}${tab('mine', `${tx('Mina ord', 'My words')} (${mineCards().length})`)}</div>
    <p class="small muted" style="margin-bottom:10px" id="listnote">${listNote(q)}</p>
    <div class="grid" id="listgrid">${html || emptyList(q)}</div></section>`;
}
const listNote = (q) => (q ? ''
  : listTab === 'mine' ? tx('Klicka på ett ord för att ta bort det.', 'Click a word to remove it.')
  : tx('Senaste först. Klicka för detaljer.', 'Most recent first. Click for details.'));
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
    document.getElementById('listnote').textContent = listNote(listQuery.trim());
    document.querySelectorAll('[data-tab]').forEach((b) => b.setAttribute('aria-pressed', String(!listQuery.trim() && b.dataset.tab === listTab)));
    list();
  },
});
})();
