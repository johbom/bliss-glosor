/**
 * Glosprogram för Bliss — öva symboler OCH deras beståndsdelar.
 *
 * Bliss är kompositionellt: "amfibie" ÄR djur + vatten + jord. Därför lärs
 * grundtecknen (BCI-AV:s "Characters" utan egna delar) ut först, i ordningen
 * "flest ord bygger på det", och ett sammansatt ord låses upp först när du
 * kan alla dess delar. Delarna kommer ur BCI:s egen härledningskolumn
 * (src/vendor/bliss-derivations.js, genererad av scripts/build-derivations.js).
 *
 * Repetition: Leitner-lådor 0–7 med växande intervall (10 min → 90 dagar).
 * Rätt svar flyttar kortet en låda upp, fel svar tillbaka till låda 0 (kommer
 * igen om några kort). Framstegen sparas i localStorage.
 *
 * Övningar per kort: symbol → ord, ord → symbol, beståndsdelar (vilka delar
 * ser du i symbolen?) och bygg symbolen (vilka delar behövs för ordet?).
 */

(() => {
// Vanligt skript, inte ES-modul: webbläsare blockerar moduler när sidan öppnas
// direkt från disken (file://). Kräver att bliss-engine.js, bliss-data.js och
// bliss-derivations.js (window.DERIV) laddats före, och exponerar window.Glosor.
const DERIV = window.DERIV;
const BLISS = new Map(window.BLISS_DATA.map((s) => [s.id, s]));
/** Samma sammanslagning som src/vocabulary.js: svensk glosa ur arket, engelska som reserv. */
const getById = (id) => {
  const s = BLISS.get(+id);
  return s ? { id: s.id, en: s.n, sv: (DERIV[s.id] && DERIV[s.id][5]) || s.n, c: s.c, e: s.e } : null;
};

const MIN = 60e3;
const INTERVALS = [0, 10, 1440, 3 * 1440, 7 * 1440, 16 * 1440, 35 * 1440, 90 * 1440].map((m) => m * MIN);
const UNLOCK_BOX = 1;   // en del räknas som känd när den besvarats rätt minst en gång sedan senaste missen
const LEARNED_BOX = 3;  // "lärd" = klarat en repetition efter minst ett dygn
const KEY = 'bm-glosor-v1';

const MODES = { sym: 'Symbol → ord', word: 'Ord → symbol', parts: 'Beståndsdelar', build: 'Bygg symbolen' };
const CLASS = {
  YELLOW: 'sak', RED: 'handling', GREEN: 'beskrivning', BLUE: 'person', WHITE: 'funktionsord', GRAY: 'markör',
};

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const today = () => new Date().toLocaleDateString('sv-SE');

// ---------------------------------------------------------------- kortleken

/** Kommaseparerade synonymer — men inte komman inuti parentes ("operator (handling, infinitiv)"). */
function splitSyns(s) {
  const out = [];
  let depth = 0, cur = '';
  for (const ch of s) {
    if (ch === '(') depth++;
    if (ch === ')') depth = Math.max(0, depth - 1);
    if (ch === ',' && !depth) { out.push(cur); cur = ''; } else cur += ch;
  }
  out.push(cur);
  return out;
}

const deck = new Map();
for (const [k, [raw, expl, isChar, freq, old, , notes]] of Object.entries(DERIV)) {
  const v = getById(+k);
  if (old || !v || !v.e?.length) continue;
  if (/_\((lower|upper)case\)|half_sized|\(OLD\)/i.test(v.en)) continue;
  const syns = splitSyns(v.sv).map((s) => s.replace(/\s*\(etc\)/, '').trim()).filter(Boolean);
  // notes: BCI:s anteckning per del ("halv storlek", "förkortning"), samma ordning som raw.
  deck.set(v.id, { id: v.id, v, raw, notes: (notes || []).slice(), expl, isChar: !!isChar, freq, word: syns[0] || v.sv, syns, users: [] });
}
// "ability_(half_sized)" är samma tecken som "ability" i halv storlek (BCI:s egen variant) —
// räkna det som den delen, men visa att den står i halv storlek.
const byFirstEn = new Map([...deck.values()].map((c) => [c.v.en.split(',')[0], c.id]));
const baseOf = (p) => {
  if (typeof p !== 'number' || deck.has(p)) return p;
  const en = getById(p)?.en || '';
  return /_\(half_sized\)/.test(en) ? byFirstEn.get(en.replace(/_\(half_sized\)/, '').split(',')[0]) ?? p : p;
};
for (const c of deck.values()) {
  c.raw = c.raw.map((p, i) => {
    const b = baseOf(p);
    if (b !== p && !c.notes[i]) c.notes[i] = 'halv storlek';
    return b;
  });
  c.parts = c.raw.filter((p) => typeof p === 'number' && deck.has(p));
  c.complete = c.raw.length >= 2 && c.parts.length === c.raw.length;
}
for (const c of deck.values()) for (const p of new Set(c.parts)) deck.get(p).users.push(c.id);

// Nivå (0 = grundtecken) och hur många ord som bygger på kortet, direkt eller indirekt.
const levelMemo = new Map();
function level(id, seen = new Set()) {
  if (levelMemo.has(id)) return levelMemo.get(id);
  if (seen.has(id)) return 0;
  seen.add(id);
  const c = deck.get(id);
  const l = c.parts.length ? 1 + Math.max(...c.parts.map((p) => level(p, seen))) : 0;
  levelMemo.set(id, l);
  return l;
}
for (const c of deck.values()) {
  c.level = level(c.id);
  let reach = 0;
  if (c.users.length) {
    const seen = new Set(), stack = [...c.users];
    while (stack.length) {
      const u = stack.pop();
      if (seen.has(u)) continue;
      seen.add(u);
      stack.push(...deck.get(u).users);
    }
    reach = seen.size;
  }
  c.reach = reach;
  c.score = c.parts.length
    ? Math.log1p(c.freq) * 2 + Math.log1p(reach) - c.level * 0.3
    : Math.log1p(reach) * 3 + Math.log1p(c.freq) * 0.5;
}
const atomOrder = [...deck.values()].filter((c) => !c.parts.length).sort((a, b) => b.score - a.score);
const compoundCount = deck.size - atomOrder.length;

const card = (id) => deck.get(+id) || null;
const className = (c) => CLASS[c.v.c] || '';

// ---------------------------------------------------------------- framsteg

function defaults() {
  return {
    cards: {},
    settings: { modes: { sym: true, word: true, parts: true, build: true }, newPerDay: 10, staff: true },
    day: { date: today(), n: 0, extra: 0 },
    alt: false,
    mine: [],   // "Mina ord": BCI-id:n som användaren valt att träna särskilt
  };
}
function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (s && s.cards) {
      const d = defaults();
      return { ...d, ...s, settings: { ...d.settings, ...s.settings, modes: { ...d.settings.modes, ...s.settings?.modes } } };
    }
  } catch (_) { /* tom eller blockerad lagring -> börja om */ }
  return defaults();
}
const S = load();
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (_) { /* privat fönster: fortsätt utan att spara */ }
}
/** Nollställer inlärningen men behåller inställningar och listan Mina ord (den är ett val, inte framsteg). */
function resetProgress() {
  const keep = S.settings, mine = S.mine;
  Object.assign(S, defaults(), { settings: keep, mine });
  save();
}

function dayState() {
  if (S.day.date !== today()) S.day = { date: today(), n: 0, extra: 0 };
  return S.day;
}
const newLeft = () => { const d = dayState(); return Math.max(0, S.settings.newPerDay + d.extra - d.n); };
const boxOf = (id) => (S.cards[id] ? S.cards[id].b : -1);
const introduced = () => Object.keys(S.cards).map(Number).filter((id) => deck.has(id));

function dueIds(now = Date.now()) {
  return introduced().filter((id) => S.cards[id].d <= now).sort((a, b) => S.cards[a].d - S.cards[b].d);
}

function unlockedCompounds() {
  const out = [];
  for (const c of deck.values()) {
    if (!c.parts.length || S.cards[c.id]) continue;
    if (c.parts.every((p) => boxOf(p) >= UNLOCK_BOX)) out.push(c);
  }
  return out.sort((a, b) => b.score - a.score);
}
const nextAtom = () => atomOrder.find((c) => !S.cards[c.id]) || null;

// ---- Mina ord ----
const isMine = (id) => S.mine.includes(+id);
const mineCards = () => S.mine.map((id) => deck.get(id)).filter(Boolean);
function toggleMine(id) {
  id = +id;
  const k = S.mine.indexOf(id);
  if (k < 0) S.mine.push(id); else S.mine.splice(k, 1);
  save();
  return k < 0;
}

/**
 * Nästa nya kort: först ord ur Mina ord som inte påbörjats (oavsett om delarna
 * kan), sedan växelvis grundtecken och upplåsta sammansatta ord.
 */
function pickNew() {
  const chosen = mineCards().find((c) => !S.cards[c.id]);
  if (chosen) return chosen;
  const comps = unlockedCompounds();
  const atom = nextAtom();
  if (comps.length && (S.alt || !atom)) { S.alt = false; return comps[0]; }
  if (atom) { S.alt = true; return atom; }
  return null;
}

function stats() {
  const ids = introduced();
  let atoms = 0, learned = 0;
  for (const id of ids) {
    if (!deck.get(id).parts.length) atoms++;
    if (S.cards[id].b >= LEARNED_BOX) learned++;
  }
  return {
    atoms, atomTotal: atomOrder.length,
    compounds: ids.length - atoms, compoundTotal: compoundCount,
    learned, due: dueIds().length, newLeft: newLeft(), unlocked: unlockedCompounds().length,
  };
}

function introduce(id, countToday = true) {
  S.cards[id] = { b: 0, d: Date.now(), n: 0, w: 0, t: Date.now() };
  if (countToday) dayState().n++;
  save();
}

/** @returns {number} ms till nästa repetition */
function grade(id, ok) {
  const s = S.cards[id], now = Date.now();
  s.n++;
  if (ok) s.b = Math.min(s.b + 1, INTERVALS.length - 1);
  else { s.w++; s.b = 0; }
  s.d = now + INTERVALS[s.b];
  save();
  if (focus) {
    // Mina ord-pass: rätt -> klart för det här passet, fel -> sist i kön igen.
    const k = focus.queue.indexOf(+id);
    if (k >= 0) { focus.queue.splice(k, 1); if (!ok) focus.queue.push(+id); }
  }
  return INTERVALS[s.b];
}

function fmtInterval(ms) {
  const m = Math.round(ms / MIN);
  if (m < 1) return 'om en stund';
  if (m < 60) return `om ${m} min`;
  if (m < 1440) return `om ${Math.round(m / 60)} tim`;
  const d = Math.round(m / 1440);
  return d === 1 ? 'i morgon' : `om ${d} dagar`;
}

// ---------------------------------------------------------------- frågor

function pickMode(c) {
  const on = S.settings.modes;
  let m = [];
  if (on.sym) m.push('sym');
  if (on.word) m.push('word');
  if (c.complete && on.parts) m.push('parts', 'parts');
  if (c.complete && !c.isChar && on.build) m.push('build', 'build');
  if (!m.length) m = ['sym'];
  if (S.cards[c.id].b === 0) {
    const easy = m.filter((x) => x === 'sym' || x === 'parts');
    if (easy.length) m = easy;
  }
  return m[Math.floor(Math.random() * m.length)];
}

/** Fel alternativ som liknar målet: delar gemensamma delar, samma ordklass, helst redan kända. */
function distractors(c, n) {
  const mine = new Set(c.parts);
  const words = new Set([c.word]);
  const scored = [];
  for (const id of introduced()) {
    if (id === c.id) continue;
    const o = deck.get(id);
    let s = Math.random() * 1.5;
    for (const p of o.parts) if (mine.has(p)) s += 3;
    if (mine.has(id) || o.parts.includes(c.id)) s += 2;
    if (o.v.c === c.v.c) s += 1;
    scored.push([s, o]);
  }
  scored.sort((a, b) => b[0] - a[0]);
  const out = [];
  const take = (o) => { if (out.length < n && !words.has(o.word)) { words.add(o.word); out.push(o); } };
  for (const [, o] of scored) take(o);
  for (const o of atomOrder) { if (out.length >= n) break; if (o.id !== c.id) take(o); }
  return out;
}

/** Palett för delövningarna: rätt delar + troliga förväxlingar (delar som syskonord använder). */
function palette(c, size = 8) {
  const correct = [...new Set(c.parts)];
  const score = new Map();
  const bump = (id, s) => { if (id !== c.id && !correct.includes(id)) score.set(id, (score.get(id) || 0) + s); };
  for (const p of correct) {
    for (const u of deck.get(p).users.slice(0, 400)) for (const q of deck.get(u).parts) bump(q, boxOf(q) >= 0 ? 0.5 : 0.2);
  }
  for (const id of introduced()) if (deck.get(id).users.length) bump(id, 2);
  const words = new Set(correct.map((id) => deck.get(id).word));
  const extra = [...score.entries()]
    .map(([id, s]) => [s + Math.random() * 2, deck.get(id)])
    .sort((a, b) => b[0] - a[0])
    .map(([, o]) => o)
    .filter((o) => !words.has(o.word) && (words.add(o.word), true))
    .slice(0, Math.max(0, size - correct.length));
  return shuffle([...correct.map((id) => deck.get(id)), ...extra]);
}

const recent = [];
// Mina ord-pass: en kö med de valda orden; varje ord stannar kvar tills det besvarats rätt en gång.
let focus = null;
function startFocus() {
  focus = { queue: shuffle(mineCards().map((c) => c.id)), total: 0 };
  focus.total = focus.queue.length;
  recent.length = 0;
}
const endFocus = () => { focus = null; };
const focusState = () => (focus ? { left: focus.queue.length, total: focus.total } : null);

/** Nästa steg i passet: förfallna repetitioner först, sedan nya kort, null när dagens pass är klart. */
function nextStep() {
  if (focus) return focusStep();
  const due = dueIds();
  let id = due.find((x) => !recent.includes(x));
  let kind = 'quiz';
  if (id == null && newLeft() > 0) {
    const c = pickNew();
    if (c) { id = c.id; kind = 'intro'; introduce(id); }
  }
  if (id == null) id = due[0];
  if (id == null) return null;
  return makeStep(id, kind);
}

/** Mina ord: nästa ord i kön (inte samma som nyss om det går); ej påbörjade ord visas först som introduktion. */
function focusStep() {
  if (!focus.queue.length) return null;
  const id = focus.queue.find((x) => !recent.includes(x)) ?? focus.queue[0];
  let kind = 'quiz';
  if (!S.cards[id]) { introduce(id, false); kind = 'intro'; }
  return makeStep(id, kind);
}

function makeStep(id, kind) {
  recent.push(id);
  if (recent.length > 2) recent.shift();
  const c = deck.get(id);
  if (kind === 'intro') return { kind, c };
  const mode = pickMode(c);
  if (mode === 'sym' || mode === 'word') {
    const options = shuffle([c, ...distractors(c, 3)]);
    return { kind, mode, c, options, answer: options.indexOf(c) };
  }
  return { kind, mode, c, palette: palette(c), sel: [] };
}

/** Rätt om valda delar (som mängd för 'parts', som multimängd för 'build') stämmer. */
function checkParts(step) {
  const want = step.c.parts.slice().sort((a, b) => a - b);
  const got = step.sel.slice().sort((a, b) => a - b);
  if (step.mode === 'parts') {
    const w = [...new Set(want)], g = [...new Set(got)];
    return { ok: w.length === g.length && w.every((x, i) => x === g[i]), order: true };
  }
  const ok = want.length === got.length && want.every((x, i) => x === got[i]);
  return { ok, order: ok && step.sel.every((x, i) => x === step.c.parts[i]) };
}

// ---------------------------------------------------------------- rendering

const bodyCache = new Map();
let meter = null;
function geometry(c) {
  if (bodyCache.has(c.id)) return bodyCache.get(c.id);
  const { body } = window.renderBliss(c.v);
  if (!meter) {
    meter = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    meter.style.cssText = 'position:absolute;left:-9999px;top:-9999px;width:10px;height:10px';
    document.body.appendChild(meter);
  }
  meter.innerHTML = `<g>${body}</g>`;
  let bb = { x: 0, y: 800, width: 800, height: 800 };
  try { const b = meter.firstChild.getBBox(); if (b.width || b.height) bb = b; } catch (_) { /* ej renderbar */ }
  const g = { body, bb };
  bodyCache.set(c.id, g);
  return g;
}

/**
 * Symbolen i en fast ram (samma höjd för alla, med himmels- och jordlinje),
 * så att storlek och läge — som bär betydelse i Bliss — syns.
 * unit = px per åttondels-kvadrat.
 */
function symbolSVG(c, unit = 8, cls = '') {
  const { body, bb } = geometry(c);
  const pad = 140, minW = 800 + 2 * pad;
  let x0 = bb.x - pad, w = bb.width + 2 * pad;
  if (w < minW) { x0 -= (minW - w) / 2; w = minW; }
  const y0 = Math.min(250, bb.y - pad), y1 = Math.max(2050, bb.y + bb.height + pad), h = y1 - y0;
  const staff = S.settings.staff
    ? `<line class="staff" x1="${x0}" x2="${x0 + w}" y1="800" y2="800"/><line class="staff earth" x1="${x0}" x2="${x0 + w}" y1="1600" y2="1600"/>`
    : '';
  return `<svg class="sym ${cls}" xmlns="http://www.w3.org/2000/svg" viewBox="${x0.toFixed(0)} ${y0.toFixed(0)} ${w.toFixed(0)} ${h.toFixed(0)}" ` +
    `width="${(w * unit / 100).toFixed(0)}" height="${(h * unit / 100).toFixed(0)}" stroke="currentColor" stroke-width="38" ` +
    `stroke-linecap="round" stroke-linejoin="round" fill="none" aria-hidden="true">` +
    `<style>.bfill{fill:currentColor}</style>${staff}${body}</svg>`;
}

function classChip(c) {
  const n = className(c);
  return n ? `<span class="cls cls-${c.v.c}">${n}</span>` : '';
}

function chip(c, unit = 3.2, extra = '', note = '') {
  const n = note ? `<small class="note">${esc(note)}</small>` : '';
  return `<button type="button" class="chip" data-detail="${c.id}"${extra}>${symbolSVG(c, unit)}<span>${esc(c.word)}</span>${n}</button>`;
}

/**
 * "djur + vatten + jord", med symbol per del och BCI:s anteckning under
 * ("halv storlek", "förkortning"). En del som BCI-AV:s namn inte entydigt pekar
 * ut visas som BCI:s text, utan symbol — hellre det än en gissning.
 */
function formulaHTML(c, unit = 3.2) {
  if (!c.raw.length) return '';
  const label = (p) => (typeof p === 'number' ? (getById(p)?.sv.split(',')[0] || p) : String(p).replace(/_/g, ' '));
  const parts = c.raw.map((p, i) => {
    const note = c.notes[i] || '';
    if (typeof p === 'number' && deck.has(p)) return chip(deck.get(p), unit, '', note);
    return `<span class="chip txt" title="BCI:s text – ingen entydig symbol">${esc(label(p))}${note ? `<small class="note">${esc(note)}</small>` : ''}</span>`;
  });
  return `<div class="formula">${parts.join('<span class="op">+</span>')}</div>`;
}

window.Glosor = {
  MODES, S, save, resetProgress, stats, nextStep, grade, checkParts, fmtInterval, boxOf, card, className, deck,
  symbolSVG, chip, classChip, formulaHTML, esc, unlockedCompounds, nextAtom, newLeft, dueIds, LEARNED_BOX,
  isMine, mineCards, toggleMine, startFocus, endFocus, focusState,
};
})();
