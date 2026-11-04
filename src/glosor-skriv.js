/**
 * Skrivfältet "Skriv en egen mening": text med bokstäver -> Bliss-ord. Bara logiken; vyn är src/ui/skriv.js.
 *
 * Ärlighetsregeln (som i src/lemmatize.js): ett ord får bara en symbol när ordet är en av BCI:s egna
 * glosor för symbolen, eller en böjd form vars grundform är det (med rätt ordklass). Annars visas ordet
 * som text – hellre en synlig lucka än fel symbol. Inget gissas med likhet eller stavningsförslag.
 *
 * Böjningar skrivs som i de godkända meningarna i övningen (data/meningar.json):
 *   plural (katter), dåtid (åt) och framtid ("ska läsa") får BCI:s indikator,
 *   nutid (leker) och bestämd form (hunden) skrivs utan, och artiklarna en/ett hoppas över.
 * De böjda formerna är ritade i förväg av originalmotorn (scripts/build-former.mjs).
 *
 * Varje ord får en lista med alternativ: symboler med samma ord (man = han/hon, man = karl …),
 * andra tolkningar av böjningen och, för artiklar, att hoppa över ordet. Det första används;
 * i vyn trycker man på symbolen för att välja ett annat.
 */
(() => {
const G = window.Glosor;
const { deck, lang } = G;
const LEMMA = window.BlissLemma;

/** Former med färdiga ritningar, per ordklass (samma som FORMS i scripts/build-former.mjs). */
const FORMS = { RED: ['past_action', 'future_action'], YELLOW: ['plural'], BLUE: ['plural'] };
const formKey = (id, form) => (form ? `f:${id}:${form}` : String(id));
const canForm = (c, form) => !form || (FORMS[c.v.c] || []).includes(form);
const FORM_NAME = {
  past_action: ['dåtid', 'past'], future_action: ['framtid', 'future'], plural: ['plural', 'plural'],
};
const formName = (form) => (FORM_NAME[form] ? FORM_NAME[form][lang() === 'en' ? 1 : 0] : '');

const norm = (s) => String(s).toLowerCase().replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
const bare = (s) => s.replace(/\s*\([^()]*\)\s*$/, '').trim();

// ---- uppslag: ord -> kort, per språk ----
const index = { sv: null, en: null };
function indexFor(l) {
  if (index[l]) return index[l];
  const m = new Map();
  const add = (k, c, rank) => {
    if (!k) return;
    if (!m.has(k)) m.set(k, new Map());
    const byId = m.get(k);
    if (!byId.has(c.id) || byId.get(c.id) > rank) byId.set(c.id, rank);
  };
  for (const c of deck.values()) {
    if (c.v.c === 'GRAY') continue;   // markörer (indikatorer) skrivs inte som egna ord
    const syns = l === 'en' ? c.synsEn : c.synsSv;
    const head = norm(l === 'en' ? c.headEn[0] : c.headSv[0]);
    syns.forEach((s0) => {
      const s = norm(s0);
      // 0: ordet är kortets huvudord, 1: huvudordet utan BCI:s parentes ("jag (fem.)"), 2: en synonym
      const rank = s === head ? 0 : 2;
      add(s, c, rank);
      add(bare(s), c, s === head ? 1 : 3);
      if (l === 'en' && /^to /.test(s)) add(s.slice(3), c, rank);
    });
  }
  index[l] = m;
  return m;
}
/** Korten för ett ord, bäst först: huvudord före synonym, sedan det vanligaste. */
function lookup(word, l = lang()) {
  const hit = indexFor(l).get(norm(word));
  if (!hit) return [];
  return [...hit].map(([id, rank]) => ({ c: deck.get(id), rank }))
    .sort((a, b) => a.rank - b.rank || b.c.freq - a.c.freq).map((x) => x.c);
}

// ---- böjningar ----
// Svenska: projektets morfologi (src/lemmatize.js via src/vendor/bliss-lemma.js), validerad mot korten.
const toForm = (keys) => (keys.includes('past_action') ? 'past_action' : keys.includes('plural') ? 'plural' : null);
const POS = { V: ['RED'], N: ['YELLOW', 'BLUE'], A: ['GREEN', 'WHITE'] };
// Engelska: bara de regelbundna ändelserna och en liten tabell med vanliga oregelbundna former.
const EN_PAST = {
  ate: 'eat', saw: 'see', went: 'go', was: 'be', were: 'be', had: 'have', did: 'do', made: 'make', came: 'come',
  took: 'take', gave: 'give', got: 'get', said: 'say', ran: 'run', sat: 'sit', slept: 'sleep', drank: 'drink',
  wrote: 'write', read: 'read', bought: 'buy', thought: 'think', felt: 'feel', found: 'find', knew: 'know',
  told: 'tell', met: 'meet', left: 'leave', sang: 'sing', swam: 'swim', drove: 'drive', flew: 'fly', fell: 'fall',
  heard: 'hear', held: 'hold', kept: 'keep', lost: 'lose', paid: 'pay', sold: 'sell', sent: 'send', spoke: 'speak',
  stood: 'stand', taught: 'teach', threw: 'throw', understood: 'understand', won: 'win', woke: 'wake', wore: 'wear',
  brought: 'bring', built: 'build', caught: 'catch', chose: 'choose', cut: 'cut', drew: 'draw', fought: 'fight',
  forgot: 'forget', grew: 'grow', hid: 'hide', hit: 'hit', hurt: 'hurt', lay: 'lie', let: 'let', meant: 'mean',
  put: 'put', rode: 'ride', rose: 'rise', shut: 'shut', spent: 'spend', stole: 'steal', struck: 'strike',
};
const EN_PLURAL = {
  men: 'man', women: 'woman', children: 'child', feet: 'foot', teeth: 'tooth', mice: 'mouse', geese: 'goose',
  people: 'person', sheep: 'sheep', fish: 'fish', oxen: 'ox', wives: 'wife', knives: 'knife', leaves: 'leaf',
  wolves: 'wolf', lives: 'life', halves: 'half', loaves: 'loaf', shelves: 'shelf', thieves: 'thief',
};
function analyzeEn(t, senses) {
  const out = [];
  const take = (lemma, keys, pos) => {
    const s = senses(lemma).filter((e) => POS[pos].includes(e.c));
    if (s.length) out.push({ lemma, keys, pos, senses: s });
  };
  if (EN_PAST[t]) { take(EN_PAST[t], ['past_action'], 'V'); out.forEach((a) => { a.rule = 'irr-verb'; }); }
  if (EN_PLURAL[t]) take(EN_PLURAL[t], ['plural'], 'N');
  const m = [
    [/ies$/, ['y'], ['plural'], 'N'], [/(s|x|z|ch|sh)es$/, ['$1'], ['plural'], 'N'], [/([^s])s$/, ['$1'], ['plural'], 'N'],
    [/ied$/, ['y'], ['past_action'], 'V'], [/([^aeiou])\1ed$/, ['$1'], ['past_action'], 'V'],
    [/ed$/, ['', 'e'], ['past_action'], 'V'],
    [/(s|x|z|ch|sh)es$/, ['$1'], [], 'V'], [/ies$/, ['y'], [], 'V'], [/([^s])s$/, ['$1'], [], 'V'],   // he eats
  ];
  for (const [re, adds, keys, pos] of m) {
    if (!re.test(t)) continue;
    for (const a of adds) take(t.replace(re, a), keys, pos);
  }
  return out;
}

const PRONOUNS = new Set(['i', 'me', 'you', 'he', 'she', 'it', 'we', 'they', 'him', 'her', 'us', 'them', 'one']);
const isPronoun = (c) => c.v.c === 'BLUE' && c.synsEn.some((s) => PRONOUNS.has(norm(s)));

/** Tolkningar av ett böjt ord: [{ c, form }], bäst först (ordet före kan avgöra verb/substantiv). */
function inflected(t, prev, l) {
  const senses = (k) => lookup(k, l).map((c) => ({ c: c.v.c, card: c }));
  let analyses = l === 'en' ? analyzeEn(t, senses) : LEMMA ? LEMMA.analyze(t, senses) : [];
  const want = l === 'en' ? null : analyses.length > 1 && LEMMA ? LEMMA.contextPrefers(prev) : null;
  if (want) analyses = [...analyses.filter((a) => a.pos === want), ...analyses.filter((a) => a.pos !== want)];
  const out = [];
  for (const a of analyses) {
    // Ett böjt substantiv (mannen, männen) är inte pronomenet med samma ord (man = han/hon): det sist.
    const senses = a.pos === 'N' ? [...a.senses.filter((s) => !isPronoun(s.card)), ...a.senses.filter((s) => isPronoun(s.card))] : a.senses;
    for (const s of senses) {
      const form = toForm(a.keys);
      out.push({ c: s.card, form: canForm(s.card, form) ? form : null, lemma: a.lemma, irr: a.rule === 'irr-verb' });
    }
  }
  return out;
}

// ---- meningen ----
const ARTICLES = { sv: new Set(['en', 'ett']), en: new Set(['a', 'an', 'the']) };
const FUTURE = { sv: new Set(['ska', 'skall']), en: new Set(['will']) };
const PUNCT = /^[\s"'«»“”‘’.,!?;:()[\]…–—-]+|[\s"'«»“”‘’.,!?;:()[\]…–—-]+$/g;

/** Alternativen för ett ord, utan dubletter: { id, form, key } eller { skip: true }. */
function optionsList(list) {
  const seen = new Set(), out = [];
  for (const o of list) {
    const k = o.skip ? 'skip' : formKey(o.c.id, o.form);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(o.skip ? { skip: true, key: 'skip' } : { id: o.c.id, form: o.form || null, key: k });
  }
  return out;
}

/**
 * Texten som Bliss: [{ text, options }] – ett ord eller en fras ("tycker om") per post, i skriven ordning.
 * options tom = ingen symbol (visas som text). Det första alternativet är förvalt.
 */
function writeWords(text, l = lang()) {
  const raw = String(text || '').split(/\s+/).filter(Boolean);
  const toks = raw.map((r) => ({ raw: r.replace(/["'«»“”‘’)\]]+$/, ''), text: r.replace(PUNCT, '') || r, clean: norm(r.replace(PUNCT, '')) }));
  const out = [];
  let futureNext = false;
  for (let i = 0; i < toks.length; i++) {
    const t = toks[i];
    if (!t.clean) continue;
    const prev = i ? toks[i - 1].clean : '';
    // Fraser först (tre eller två ord): "tycka om", "tycker om" (första ordet får vara böjt).
    let phrase = null;
    for (let n = Math.min(3, toks.length - i); n >= 2 && !phrase; n--) {
      const words = toks.slice(i, i + n).map((x) => x.clean);
      if (words.some((w) => !w)) continue;
      const rest = words.slice(1).join(' ');
      const exact = lookup(words.join(' '), l).map((c) => ({ c }));
      const infl = inflected(words[0], prev, l).filter((x) => x.c)
        .flatMap((x) => lookup(`${x.lemma} ${rest}`, l)
          .map((c) => ({ c, form: canForm(c, x.form) ? x.form : null })));
      const found = [...exact, ...infl];
      if (found.length) phrase = { n, found };
    }
    let found;
    if (phrase) {
      found = phrase.found;
      out.push({ text: toks.slice(i, i + phrase.n).map((x) => x.text).join(' '), options: [] });
      i += phrase.n - 1;
    } else {
      const exact = lookup(t.clean, l).map((c) => ({ c }));
      const infl = inflected(t.clean, prev, l);
      // Oregelbundna verbformer (såg, var, åt) före samma ord som substantiv – utom efter en artikel
      // eller ett räkneord ("en såg"). Det andra finns kvar som alternativ.
      const nounCtx = ARTICLES[l].has(prev) || (l === 'sv' && LEMMA?.contextPrefers(prev) === 'N');
      const irr = nounCtx ? [] : infl.filter((x) => x.irr);
      // BCI:s egennamn ("Himlen" = himmelriket) efter vanliga ord, om man inte själv skrivit stor bokstav mitt i meningen.
      const proper = (c) => /^\p{Lu}/u.test(l === 'en' ? c.headEn[0] : c.headSv[0]);
      const asName = i > 0 && !/[.!?…]$/.test(toks[i - 1].raw) && /^\p{Lu}/u.test(t.text);
      const names = asName ? [] : exact.filter((x) => proper(x.c));
      const plain = exact.filter((x) => !names.includes(x));
      found = exact.length ? [...irr, ...plain, ...infl, ...names] : infl;
      out.push({ text: t.text, options: [] });
    }
    const w = out[out.length - 1];
    const last = i === toks.length - 1;
    if (!phrase && FUTURE[l].has(t.clean) && !last) {
      // "ska läsa": framtid på nästa handlingsord, som i meningsövningen ("Barnet ska läsa en bok").
      w.options = optionsList([{ skip: true }, ...found]);
      w.future = true;
      futureNext = true;
      continue;
    }
    if (!phrase && ARTICLES[l].has(t.clean) && !last) {
      w.options = optionsList([{ skip: true }, ...found]);
      continue;
    }
    if (futureNext) {
      const verbs = found.filter((x) => x.c.v.c === 'RED' && !x.form);
      found = [...verbs.map((x) => ({ c: x.c, form: 'future_action' })), ...found];
      futureNext = false;
    }
    w.options = optionsList(found);
  }
  return out;
}

/** Ordet som ett alternativ står för, för knappar och uppläsning: "katt", med formen bredvid i vyn. */
const optionLabel = (o) => (o.skip ? '' : deck.get(o.id).word);

Object.assign(G, { writeWords, formKey, formName, optionLabel, WRITE_FORMS: FORMS });
})();
