/**
 * Memory med blisskort (vyn i src/ui/memory.js): vänd två kort i taget och hitta paren. Ett par är samma
 * symbol två gånger, eller en symbol och dess ord. Samma spel som Memory i Blissverktyget (WinBliss²),
 * men med glosprogrammets förritade symboler och egna ordkällor – bara BCI-AV:s symboler och glosor.
 *
 * Spelets kärna (pickEntries, makeDeck, newState, turnCard, coverCards, gridFor) rör ingen sida och testas i Node.
 */
(() => {
const { deck, mineCards, S, lang, hasDrawing, CORE, BOARD, EVERYDAY, shuffle } = window.Glosor;

// ---------------------------------------------------------------- spelets kärna
/** n poster ({c, word}) med olika symboler och olika ord. */
function pickEntries(pool, n, rnd = Math.random) {
  const out = [], ids = new Set(), words = new Set();
  for (const e of shuffleWith(pool.slice(), rnd)) {
    const w = e.word.toLowerCase();
    if (ids.has(e.c.id) || words.has(w)) continue;
    ids.add(e.c.id); words.add(w); out.push(e);
    if (out.length === n) break;
  }
  return out;
}
function shuffleWith(a, rnd) {
  if (rnd === Math.random) return shuffle(a);
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
/** Två kort per post: symbolen två gånger, eller symbolen och ordet. */
function makeDeck(entries, kind, rnd = Math.random) {
  return shuffleWith(entries.flatMap((e, p) => [
    { p, c: e.c, word: e.word, show: 'sym', found: false },
    { p, c: e.c, word: e.word, show: kind === 'word' ? 'word' : 'sym', found: false }]), rnd);
}
function newState(cards, players) {
  return { deck: cards, up: [], moves: 0, turn: 0, scores: players === 2 ? [0, 0] : [0], over: false };
}
/**
 * Ett tryck på kort i. Två kort som inte var ett par ligger kvar uppvända tills tiden gått eller nästa tryck:
 * trycker man på ett av dem vänds de bara tillbaka, trycker man på ett annat kort vänds de tillbaka och det
 * kortet upp – ett tryck, inte två.
 */
function turnCard(G, i) {
  const c = G.deck[i];
  if (!c || G.over || c.found) return { what: 'none' };
  let covered = false;
  if (G.up.length === 2) {
    const was = G.up.includes(i);
    G.up = []; covered = true;
    if (was) return { what: 'cover' };
  }
  if (G.up.includes(i)) return { what: 'none' };
  G.up.push(i);
  if (G.up.length === 1) return { what: 'up', i, covered };
  G.moves++;
  const [a, b] = G.up;
  if (G.deck[a].p === G.deck[b].p) {
    G.deck[a].found = G.deck[b].found = true;
    G.up = [];
    G.scores[G.turn]++;
    if (G.deck.every((d) => d.found)) { G.over = true; return { what: 'end', i, a, b }; }
    return { what: 'pair', i, a, b };
  }
  if (G.scores.length > 1) G.turn = 1 - G.turn;   // miss: den andra spelarens tur
  return { what: 'miss', i, a, b };
}
function coverCards(G) { if (G.up.length !== 2) return false; G.up = []; return true; }
/** Antal kolumner som håller korten närmast kvadratiska i en ruta w × h. */
function gridFor(count, w, h) {
  let best = null;
  for (let cols = 2; cols <= count; cols++) {
    const rows = Math.ceil(count / cols), empty = cols * rows - count;
    const score = Math.abs(Math.log((w / cols) / (h / rows) / 0.85)) + empty * 0.1;
    if (!best || score < best.score) best = { cols, rows, score };
  }
  return best || { cols: count, rows: 1 };
}

// ---------------------------------------------------------------- orden
/** Ordet på kortet: glosan utan BCI:s förtydligande i parentes ("vilja (verb)" -> "vilja"). */
function memoryWord(c) {
  let w = c.word, prev;
  do { prev = w; w = w.replace(/\s*-?\([^()]*\)\s*$/, ''); } while (w !== prev);
  w = w.replace(/_/g, ' ').trim();
  return lang() === 'en' && c.v.c === 'RED' ? w.replace(/^to /, '') : w;
}
const playable = (c) => !!c && hasDrawing(String(c.id)) && !/^indicator_/.test(c.v.en || '') && c.v.c !== 'GRAY' && !!memoryWord(c);
const entry = (c) => ({ c, word: memoryWord(c) });
const EASY = () => [...new Set([...EVERYDAY, ...CORE, ...BOARD.flatMap((g) => g.ids)])];

/**
 * Ordkällorna: 'larda' = ord du övat på, 'mina' = Mina ord, 'latt' = vardagsord (tavlans, kärnorden och
 * vardagsorden), 'gula' = alla saker (BCI:s gula ord), 'alla' = hela ordlistan, 'egna' = own (skrivna ord).
 */
function memoryPool(level, own = []) {
  let cards;
  if (level === 'egna') return own;
  if (level === 'larda') cards = Object.keys(S.cards).map((id) => deck.get(+id));
  else if (level === 'mina') cards = mineCards();
  else if (level === 'latt') cards = EASY().map((id) => deck.get(id));
  else if (level === 'gula') cards = [...deck.values()].filter((c) => c.v.c === 'YELLOW');
  else cards = [...deck.values()];
  return cards.filter(playable).map(entry);
}
/** Ett skrivet ord -> dess symbol: ordet som första glosa först, sedan en sak (gul), sedan det vanligaste. */
function findCard(word) {
  const q = word.trim().toLowerCase();
  let best = null, score = -Infinity;
  for (const c of deck.values()) {
    if (!playable(c)) continue;
    const k = c.syns.map((s) => s.replace(/\s*\([^()]*\)\s*$/, '').toLowerCase()).indexOf(q);
    if (k < 0) continue;
    const sc = (k === 0 ? 4 : 0) + (c.v.c === 'YELLOW' ? 2 : 0) + c.score / 100;
    if (sc > score) { score = sc; best = c; }
  }
  return best;
}
/** Egna ord (komma, semikolon eller ny rad emellan) -> { entries, missing }. */
function ownEntries(text) {
  const typed = [...new Set(String(text || '').split(/[,;\n]+/).map((w) => w.trim()).filter(Boolean))];
  const entries = [], missing = [];
  for (const w of typed) {
    const c = findCard(w);
    if (c) entries.push({ c, word: w }); else missing.push(w);
  }
  return { entries, missing };
}

Object.assign(window.Glosor, {
  pickEntries, makeDeck, newState, turnCard, coverCards, gridFor, memoryPool, memoryWord, findCard, ownEntries,
});
})();
