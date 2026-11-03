/**
 * Bliss-glosors gränssnitt: grunden som vyerna i src/ui/ bygger på.
 *
 * Vanliga skript, inga ES-moduler: då fungerar sidan även när den öppnas direkt från disken
 * (file://), där webbläsare blockerar moduler. Ordningen i glosor.html: logiken (src/glosor.js,
 * src/glosor-poesi.js), sedan den här filen, sedan de delar som vyerna delar (tal.js,
 * milstolpar.js, detalj.js) och sist en fil per vy. Allt gemensamt nås via window.GlosorUI.
 *
 * En vy registrerar sig med register(namn, vy). Alla fält är valfria:
 *   render()      ritar vyn (setView)
 *   top           true: sidan börjar överst när vyn visas
 *   click(t, e)   klick på en knapp i #app; returnerar true när klicket är omhändertaget.
 *                 Alla vyers click anropas, oavsett vilken vy som visas – knappar på startsidan
 *                 kan starta andra vyer. Kontrollera UI.view() om knappen bara finns i den egna vyn.
 *   change(t), input(t), key(e)   bara för vyn som visas
 *   relang()      efter språkbyte (annars ritas vyn om)
 *   refresh()     efter att Mina ord ändrats i detaljrutan
 *   peek()        false: ord-chips öppnar inte detaljrutan just nu (mitt i en fråga)
 */
(() => {
const { lang, setLang, endFocus, endSentences } = window.Glosor;

/** Text på valt språk: tx('svenska', 'English'). */
const tx = (sv, en) => (lang() === 'en' ? en : sv);
const fmtN = (n) => n.toLocaleString(lang() === 'en' ? 'en-GB' : 'sv-SE');
/** Avsluta Mina ord- och meningspass (vid byte av vy). */
const endModes = () => { endFocus(); endSentences(); };

const app = document.getElementById('app');
const dlg = document.getElementById('detail');
const views = {};
let current = 'home';

function register(name, v) { views[name] = v; }

function setView(v) {
  current = v;
  document.querySelectorAll('header nav button').forEach((b) => b.setAttribute('aria-current', String(b.dataset.view === v)));
  views[v]?.render?.();
  if (views[v]?.top) window.scrollTo(0, 0);
}

// ---------------------------------------------------------------- språk
const NAV = { home: ['Start', 'Home'], list: ['Ordlista', 'Word list'], settings: ['Inställningar', 'Settings'], about: ['Om', 'About'] };
/** Sidhuvud och dokumentspråk efter valt språk; knappen erbjuder alltid det andra språket. */
const APP_NAME = ['Bliss-glosor', 'Bliss Vocabulary'];
function applyLang() {
  document.documentElement.lang = lang();
  document.getElementById('app-title').textContent = document.title = tx(...APP_NAME);
  document.querySelectorAll('header nav button').forEach((b) => { b.textContent = tx(...NAV[b.dataset.view]); });
  const t = document.getElementById('lang-toggle');
  t.textContent = tx('EN', 'SV');
  t.lang = tx('en', 'sv');
  t.setAttribute('aria-label', tx('Switch to English', 'Byt till svenska'));
  document.getElementById('fund-top').alt = FUND_ALT();
}
function switchLang(l) {
  setLang(l);
  applyLang();
  const v = views[current];
  if (v?.relang) v.relang();
  else setView(current);
}
document.getElementById('lang-toggle').addEventListener('click', () => switchLang(lang() === 'en' ? 'sv' : 'en'));

// ---------------------------------------------------------------- händelser
document.querySelector('header nav').addEventListener('click', (e) => {
  const b = e.target.closest('[data-view]');
  if (b) { endModes(); setView(b.dataset.view); }
});

app.addEventListener('click', (e) => {
  const t = e.target.closest('button');
  if (!t) return;
  for (const v of Object.values(views)) if (v.click?.(t, e)) return;
  if (t.id === 'quit' || t.dataset.act === 'home') { endModes(); return setView('home'); }
  if (t.dataset.detail != null && views[current]?.peek?.() !== false) window.GlosorUI.showDetail(t.dataset.detail);
});
app.addEventListener('change', (e) => views[current]?.change?.(e.target));
app.addEventListener('input', (e) => views[current]?.input?.(e.target));
document.addEventListener('keydown', (e) => {
  if (dlg.open || e.metaKey || e.ctrlKey || e.altKey || e.target.matches?.('input,textarea')) return;
  views[current]?.key?.(e);
});

/**
 * Allmänna arvsfondens logotyp för projekt (logo/, hämtad från arvsfonden.se, oförändrad i färg och form).
 * Svart text på ljus bakgrund, vit text i mörkt läge. Luften runt den (.fund-logo) är minst en halv logotyp,
 * som Arvsfonden kräver.
 */
const FUND_ALT = () => tx('Med stöd från Allmänna arvsfonden', 'Supported by the Swedish Inheritance Fund (Allmänna arvsfonden)');
const fundLogo = () => `<div class="fund-logo"><picture>
    <source srcset="logo/arvsfonden-negativ.png" media="(prefers-color-scheme: dark)">
    <img src="logo/arvsfonden-positiv.png" width="1200" height="289" alt="${FUND_ALT()}">
  </picture></div>`;

window.GlosorUI = { tx, fmtN, endModes, app, dlg, views, view: () => current, register, setView, applyLang, switchLang, fundLogo };

// Start när alla vyer har registrerat sig (skripten i slutet av <body> körs före DOMContentLoaded).
// Har dokumentet redan laddats (sidan infogad i efterhand): starta direkt efter de övriga skripten.
const start = () => { applyLang(); setView('home'); };
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
else setTimeout(start);
})();
