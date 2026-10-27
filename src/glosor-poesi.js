/**
 * Kylskåpspoesi för Bliss-glosor: väljer ordmagneterna. Ritningen och dra-och-släpp finns i
 * src/ui/poesi.js. Läser kortleken ur window.Glosor (src/glosor.js, laddas före) och lägger till
 * poemOptions och poemLabel där.
 *
 * Ordmagneter: först helt slumpade ord, sedan mest ord som grammatiskt kan följa det valda
 * (efter ett substantiv: verb, prepositioner …) – men meningen behöver inte bli rimlig.
 * Ordklass: BCI:s färg (sak/handling/beskrivning/person); funktionsorden (vita) och pronomenen
 * är handplockade, eftersom färgen inte skiljer prepositioner från konjunktioner.
 */

(() => {
const { deck, lang, shuffle } = window.Glosor;

const POEM_IDS = {
  pron: [14687, 14916, 16949, 14688, 18212, 18465, 18302, 17712, 17713, 12399, 15723, 12400, 23907, 14117, 14960],
  det: [12321, 17700, 17720, 17723, 17711, 13893, 12360, 16762, 12879, 24011, 15686, 15941, 14715, 14707, 17701, 14962,
    14716, 18473, 8498, 8499, 8500, 8501, 8502, 8503, 8504, 8505],
  prep: [14932, 15918, 12324, 13100, 14381, 18267, 17739, 14403, 12591, 17969, 12348, 15948, 12351, 14952, 17724, 15474,
    12669, 25653, 12656, 12580, 17982],
  conj: [12374, 24309, 16482, 13094, 15929, 17708, 14927, 18234, 12647, 13892, 12367, 14382],
  q: [18231, 18237, 18249, 14907, 18244, 18235, 18239],
  adv: [15733, 15736, 14708, 17707, 12350, 12613, 25522, 17983, 13869, 15943, 14390, 17705, 12352, 29036, 15942, 12402],
  desc: [18242, 12849, 16474, 14641, 12864, 18291, 12910, 14639, 16184],
  interj: [18294, 15722, 17533, 17214, 14702, 14454],
};
// Ordförrådet: de vanligaste orden (BCI-AV:s frekvens), funktionsorden ovan och favoriterna nedan.
const POEM_COMMON = 350;
// Favoriter som kommer oftare: vardagliga och filosofiska/romantiska substantiv (fis, himmel),
// känslor, färger och andra adjektiv, roliga verb. Alla är BCI-AV-ord; ordklass ur BCI:s färg.
const POEM_FAV = new Set([
  // person
  15662, 14157, 13166, 14439, 12888, 18269, 15416, 23559, 23626, 23623, 23622, 23616, 17513, 14401, 15705,
  14630, 14626, 23695, 23712, 23521, 16217, 13861, 23443, 17481, 22907, 23683, 25746, 12603,
  // sak
  14905, 12380, 12383, 13121, 12649, 13148, 17493, 13866, 18256, 13373, 17511, 15468, 12895, 13157, 12405,
  12623, 14921, 22905, 14682, 17518, 23447, 12621, 12875, 12834, 13089, 17767, 12869, 15144, 17200, 17747, 25060,
  12884, 17990, 27130, 15732, 17265, 14667, 14379, 13894, 14660, 15152, 24848, 16177, 12854, 17233, 14389, 15159,
  13690, 22578, 16230, 16726, 16192, 23603, 22121, 22376, 14188, 12837, 14897, 12379, 16175, 15665, 12395, 17229,
  17188, 14402, 17189, 13923, 12643, 15485, 15217, 17966, 12622, 23879, 17519, 20527, 13919, 13419, 24809, 13124,
  17749, 16221, 13095, 14965, 15484, 14437, 17763, 13862, 17006, 17252, 15651, 17462, 13367, 16455, 17192, 18255,
  15909, 15168, 14386, 15663, 14205, 22611, 17775, 15719, 21045, 14695, 15399, 17732, 26001, 15206, 14926, 17786,
  14396, 23534, 15208, 25858, 14183, 18209, 13901, 12356, 24520, 18278, 14451, 23520, 23589, 16981, 17210, 15679,
  24853, 14417, 25750, 15396, 23933, 17727, 14374, 14958, 21350, 13096, 14160, 18259, 29515, 21297, 24746, 16745,
  15980, 18036, 22903, 23894, 14675, 16703, 22912, 16937, 25553, 24908, 23460, 15954, 12397, 13097, 13645, 13911,
  16959, 23960, 25953, 29508, 17485,
  // beskrivning
  12835, 15221, 14900, 13375, 17203, 20530, 17477, 16944, 26235, 12645, 17964, 15710, 15916, 16446, 24268,
  14698, 23861, 18226, 23857, 23844, 16693, 15229, 16227, 26003, 17716, 14676, 16702, 12377, 12347, 24815, 27146,
  26000, 14395, 23863, 14413, 17274, 14414, 24295, 14912, 17719, 25373, 23418, 15228, 13633, 15439, 17444, 18213,
  14463, 13683, 24062, 14711, 13652, 16982, 15397, 16973, 27097, 24173, 25909, 12398, 16422, 29558, 12848, 17015,
  21083, 15694,
  // handling
  13631, 16990, 15139, 14372, 17482, 16699, 13603, 23640, 17759, 15178, 13618, 15153, 14909, 13906, 13882,
  17009, 13875, 17191, 13420, 12925, 18288, 16965, 18240, 16200, 18038, 13360, 15146, 17725, 14200, 17699, 12922,
  14131, 14387, 15400, 23883, 14710, 16742, 17718, 21832, 13408, 12619, 25905, 12847, 13163, 18260, 29563, 24507,
  25749, 15478, 21081, 14649, 14142, 16995, 15205, 16747, 14692, 17018, 17507, 17761, 15957, 18285, 16465, 23200,
  23537, 14175, 15426, 18030, 21348, 12901, 17021, 24029, 14397, 17474, 17989, 15668, 18022, 13357, 13099, 22904,
  17486, 16934, 13385, 23961
]);
const POEM_FAV_SHARE = 0.55;   // andel av orden i en ordklass som tas ur favoriterna
// Vad som kan följa på vad (vikter). ANY: helt slumpat – vid start och som inslag i varje omgång.
const POEM_NEXT = {
  pron: { verb: 6, adv: 2, conj: 0.5 },
  person: { verb: 5, prep: 2, conj: 1.5, adv: 1 },
  noun: { verb: 5, prep: 2.5, conj: 1.5, adv: 1 },
  det: { noun: 5, desc: 2.5, person: 2 },
  desc: { noun: 4, person: 2, conj: 1, prep: 1, desc: 0.5 },
  verb: { det: 2.5, noun: 2, person: 1.5, pron: 1.5, prep: 2, desc: 1.5, adv: 2, verb: 1, conj: 0.5 },
  adv: { verb: 2.5, desc: 2, prep: 1.5, det: 1, noun: 1, pron: 0.5 },
  prep: { det: 3, noun: 3, person: 1.5, pron: 1.5, desc: 1 },
  conj: { pron: 3, det: 2, noun: 2, person: 1.5, desc: 1, verb: 1, adv: 1 },
  q: { verb: 5, pron: 1, desc: 1, adv: 0.5 },
  interj: { pron: 2, det: 2, noun: 1.5, person: 1.5, desc: 1, q: 1 },
};
const POEM_ANY = { noun: 3, verb: 2.5, desc: 2, person: 1.5, pron: 1.5, det: 1, prep: 1, adv: 1, conj: 0.7, q: 0.5, interj: 0.4 };
const POEM_RARE = { noun: 3, verb: 1.5, desc: 1, person: 0.5 };   // ordklass för omgångens ovanliga ord
const POEM_NOISE = 0.15;   // andel helt slumpade ord även efter ett val

const posMemo = new Map();
for (const [pos, ids] of Object.entries(POEM_IDS)) for (const id of ids) if (deck.has(id)) posMemo.set(id, pos);
function poemPos(c) {
  if (posMemo.has(c.id)) return posMemo.get(c.id);
  // Varianter ("jag (fem.)") och egennamn ("Sverige") hör inte hemma bland magneterna.
  if (/[()]/.test(c.synsSv[0] || '') || /^[A-Z]/.test(c.v.en)) return null;
  return { YELLOW: 'noun', RED: 'verb', GREEN: 'desc', BLUE: 'person' }[c.v.c] || null;
}
/** Texten på magneten: utan BCI:s parentes ("vad (fråga)" → "vad") och utan "to" före engelska verb. */
const poemLabel = (c) => {
  let w = c.word, prev;
  do { prev = w; w = w.replace(/\s*-?\([^()]*\)$/, ''); } while (w !== prev);
  return lang() === 'en' && c.v.c === 'RED' ? w.replace(/^to /, '') : w;
};

let poemPool = null;
function poemPoolNow() {
  if (poemPool) return poemPool;
  const byPos = {}, favByPos = {}, rareByPos = {};
  let common = 0;
  for (const c of [...deck.values()].sort((a, b) => b.freq - a.freq)) {
    const pos = poemPos(c);
    if (!pos) continue;
    const fav = POEM_FAV.has(c.id);
    if (!fav && !posMemo.has(c.id) && common >= POEM_COMMON) { (rareByPos[pos] ||= []).push(c); continue; }
    if (!fav && !posMemo.has(c.id)) common++;
    (byPos[pos] ||= []).push(c);
    if (fav) (favByPos[pos] ||= []).push(c);
  }
  return (poemPool = { byPos, favByPos, rareByPos });
}
const weighted = (w) => {
  const e = Object.entries(w);
  let r = Math.random() * e.reduce((s, [, v]) => s + v, 0);
  for (const [k, v] of e) if ((r -= v) < 0) return k;
  return e[e.length - 1][0];
};

/**
 * Nästa omgång magneter (8–12). chosenId: ordet som just lades (null = börja om, helt slumpat).
 * prev: förra omgångens [{id, kept}] – ett par av dem får stanna en omgång, men aldrig två i rad.
 */
function poemOptions(chosenId = null, prev = []) {
  const pool = poemPoolNow();
  const n = 8 + Math.floor(Math.random() * 5);
  const out = [], labels = new Set();
  const add = (c, kept = false) => {
    const l = poemLabel(c).toLowerCase();
    if (labels.has(l) || c.id === chosenId) return false;
    labels.add(l);
    out.push({ id: c.id, kept });
    return true;
  };
  if (chosenId != null) {
    const stay = shuffle(prev.filter((o) => !o.kept && o.id !== chosenId)).slice(0, 1 + Math.floor(Math.random() * 2));
    for (const o of stay) add(deck.get(o.id), true);
  }
  const chosen = chosenId != null && deck.get(chosenId);
  const next = chosen && POEM_NEXT[poemPos(chosen)];
  const pick = (pos) => {
    const fav = pool.favByPos[pos], list = pool.byPos[pos];
    const from = fav?.length && Math.random() < POEM_FAV_SHARE ? fav : list;
    return from?.length ? from[Math.floor(Math.random() * from.length)] : null;
  };
  // Ett ovanligt ord per omgång, ur resten av BCI-AV – något att undra över.
  for (let tries = 0; tries < 10; tries++) {
    const list = pool.rareByPos[weighted(POEM_RARE)];
    if (list?.length && add(list[Math.floor(Math.random() * list.length)])) break;
  }
  // Alltid ett par ord som inte passar grammatiskt – det ska gå att skriva "fel".
  if (next) {
    const wrong = Object.fromEntries(Object.entries(POEM_ANY).filter(([k]) => !next[k]));
    for (let k = 1 + Math.floor(Math.random() * 2), tries = 0; k > 0 && tries < 20; tries++) {
      const c = pick(weighted(wrong));
      if (c && add(c)) k--;
    }
  }
  for (let tries = 0; out.length < n && tries < 200; tries++) {
    const c = pick(!next || Math.random() < POEM_NOISE ? weighted(POEM_ANY) : weighted(next));
    if (c) add(c);
  }
  return out;
}

Object.assign(window.Glosor, { poemOptions, poemLabel });
})();
