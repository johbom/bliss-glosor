/**
 * Startsidan i tre delar: Dagens övning (en huvudknapp), brickor för det man kan göra (Mina ord, Meningar,
 * Skriv en mening, Kommunikationstavla, Kylskåpspoesi) och framstegen (siffror och milstolpar).
 * Inställningarna har en egen flik (installningar.js).
 * Det som inte går att använda än är inte avstängt: ett tryck säger vad som behövs (WHY).
 */
(() => {
const {
  stats, streak, bestStreak, chip, nextAtom, mineCards, reviewCount, sentenceCount, sentenceTotal, sentenceDrafts, confusedPairs,
  S, save, nextGoal, card, symbolSVG, esc,
} = window.Glosor;
const { tx, fmtN, app, dlg, setView, register, milestoneHTML } = window.GlosorUI;

const whyBox = (key) => `<p class="why small" id="why-${key}" role="status"></p>`;
const WHY = {
  review: () => tx('Det finns inget att repetera än. Lär dig några ord först.', 'There is nothing to review yet. Learn some words first.'),
  focus: () => tx('Lägg först till ord: tryck ☆ på ett ord i Ordlista.', 'Add words first: tap ☆ on a word in the Word list.'),
  sentences: () => tx('Meningarna låses upp när du har mött deras ord. Tryck Börja öva och lär dig några ord först.',
    'The sentences unlock when you have met their words. Press Start practising and learn some words first.'),
};

// ---------------------------------------------------------------- start
/** Första gången: hur vill man börja? Valet kan ändras under Inställningar → Takt. */
function trackChoice() {
  const opt = (k, title, text) => `<button type="button" class="track-opt" data-track="${k}"><b>${title}</b><span>${text}</span></button>`;
  return `<section class="panel">
      <div class="head"><h2>${tx('Hur vill du börja?', 'How do you want to start?')}</h2></div>
      <div class="track-opts">
        ${opt('core', tx('Vardagsord först', 'Everyday words first'),
          tx('Ord som jag, vill, mer och hjälp. Grundtecknen lärs in när ett ord behöver dem.', 'Words like I, want, more and help. The basic characters are learned when a word needs them.'))}
        ${opt('basics', tx('Från grunden', 'From the basics'),
          tx('Grundtecknen först, sedan orden som byggs av dem.', 'The basic characters first, then the words built from them.'))}
      </div>
      <p class="small muted" style="margin-top:8px">${tx('Du kan byta under Inställningar.', 'You can change this in Settings.')}</p>
    </section>`;
}

/** Brickornas ikoner: BCI:s egna symboler (ord, mening, skriva, kommunicera, dikt, blanda). */
const ICON = { mine: 18272, sentences: 16760, write: 18285, board: 13389, poem: 16210, pairs: 15481 };
// Utsnitt runt mittfältet (himmels- till jordlinjen, med plats för indikatorer ovanför): samma ritning, mindre luft.
const ICON_FRAME = [400, 1750];
const icon = (k) => { const c = card(ICON[k]); return `<span class="tile-ic" aria-hidden="true">${c ? symbolSVG(c, 2.4, '', ICON_FRAME, 70) : ''}</span>`; };
/** En bricka: hela brickan är knappen. Låst: trycket säger vad som behövs (WHY). */
function tile(k, id, title, sub, { why = null, badge = '' } = {}) {
  const attrs = why ? `class="tile locked" data-why="${why}" aria-describedby="why-${why}"` : `class="tile" id="${id}"`;
  return `<button type="button" ${attrs}>${icon(k)}<span class="tile-t">${title}${badge ? ` <span class="badge">${badge}</span>` : ''}</span><span class="tile-s">${sub}</span></button>`;
}

function home() {
  if (!reviewCount() && !S.settings.track) { app.innerHTML = trackChoice(); return; }
  app.innerHTML = heroHTML() + tilesHTML() + installHTML() + progressHTML();
}

// ---------------------------------------------------------------- installera som app
// Chrome, Edge och Android: webbläsarens egen installationsruta (beforeinstallprompt), sparad tills man trycker.
// iPhone och iPad (och andra webbläsare utan den rutan): en ruta som visar hur man gör.
// Redan installerad (öppnad från hemskärmen): kortet syns inte. Som Artifact (utan manifest) leder knappen
// till appens adress, där den går att installera. "Dölj" sparas (S.settings.hideInstall).
const APP_URL = 'https://johbom.github.io/bliss-glosor/';
const UI = window.GlosorUI;
let installPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  installPrompt = e;
  if (UI.view() === 'home') home();
});
window.addEventListener('appinstalled', () => { installPrompt = null; if (UI.view() === 'home') home(); });
const installed = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const canInstallHere = () => !!document.querySelector('link[rel="manifest"]');
const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

function installHTML() {
  if (installed() || S.settings.hideInstall) return '';
  return `<section class="install-card">
      <img src="icons/icon.svg" alt="" width="56" height="56">
      <div class="install-text"><b>${tx('Installera som app', 'Install as an app')}</b>
        <span>${tx('Ligger på hemskärmen och fungerar utan internet.', 'Sits on your home screen and works offline.')}</span></div>
      <div class="install-btns">
        <button type="button" class="ghost" id="install-app">${tx('Installera', 'Install')}</button>
        <button type="button" class="linklike" id="install-hide">${tx('Dölj', 'Hide')}</button>
      </div>
    </section>`;
}
/** Hur man installerar, när webbläsaren inte har en egen ruta för det. */
function installHelp() {
  const share = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" style="vertical-align:-5px"><path d="M12 3v12M8 7l4-4 4 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 11H5v10h14V11h-1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  const steps = isIOS()
    ? [tx('Öppna appen i <b>Safari</b>.', 'Open the app in <b>Safari</b>.'),
      tx(`Tryck på <b>Dela</b> ${share} (längst ner eller uppe till höger).`, `Tap <b>Share</b> ${share} (at the bottom or top right).`),
      tx('Välj <b>Lägg till på hemskärmen</b> och tryck <b>Lägg till</b>.', 'Choose <b>Add to Home Screen</b> and tap <b>Add</b>.')]
    : [tx('Öppna appen i <b>Chrome</b> eller <b>Edge</b>.', 'Open the app in <b>Chrome</b> or <b>Edge</b>.'),
      tx('Välj <b>Installera</b> i menyn eller klicka på installationsikonen i adressfältet.', 'Choose <b>Install</b> in the menu or click the install icon in the address bar.'),
      tx('I Safari på Mac: <b>Arkiv → Lägg till i Dock</b>.', 'In Safari on a Mac: <b>File → Add to Dock</b>.')];
  dlg.innerHTML = `<div class="dlg-bar"><button type="button" class="close" data-act="close" aria-label="${tx('Stäng', 'Close')}">×</button></div>
    <h2 style="margin-top:4px">${tx('Installera som app', 'Install as an app')}</h2>
    <ol class="install-steps">${steps.map((x) => `<li>${x}</li>`).join('')}</ol>
    <p class="small muted">${tx('Sedan öppnar du Bliss-glosor från hemskärmen, och den fungerar även utan internet.', 'Then open Bliss Vocabulary from the home screen – it also works offline.')}</p>`;
  dlg.dataset.id = '';
  if (!dlg.open) dlg.showModal();
}
async function install() {
  if (!canInstallHere()) { window.open(APP_URL, '_blank', 'noopener'); return; }   // Artifact-versionen
  if (!installPrompt) { installHelp(); return; }
  const p = installPrompt;
  installPrompt = null;
  p.prompt();
  try { await p.userChoice; } catch (_) { /* rutan stängdes */ }
  home();
}

/** Dagens övning: en tydlig huvudknapp, vad som väntar och nästa ord. */
function heroHTML() {
  const st = stats(), learnt = reviewCount(), days = streak();
  const work = st.due + st.newLeft;
  const atom = nextAtom(), goal = nextGoal(), next = goal || atom;
  const pairs = confusedPairs().length;
  const title = work ? tx('Dagens övning', 'Today’s practice') : tx('Klart för i dag!', 'Done for today!');
  const sub = work ? [st.due ? tx(`${st.due} att repetera`, `${st.due} to review`) : '', st.newLeft ? tx(`${st.newLeft} nya ord`, `${st.newLeft} new words`) : ''].filter(Boolean).join(' · ')
    : learnt ? tx('Du kan repetera fritt eller lära dig fler ord.', 'You can review freely or learn more words.') : '';
  const main = work ? `<button type="button" class="primary big" id="start">${tx('Börja öva', 'Start practising')}</button>`
    : learnt ? `<button type="button" class="primary big" id="review">${tx('Repetera fritt', 'Free review')}</button>`
      : `<button type="button" class="primary big locked" data-why="review" aria-describedby="why-review">${tx('Repetera fritt', 'Free review')}</button>`;
  const second = work && learnt ? `<button type="button" class="hero-btn" id="review">${tx('Repetera fritt', 'Free review')}</button>`
    : work ? '' : `<button type="button" class="hero-btn" id="more">${tx('Lär 5 nya till', 'Learn 5 more')}</button>`;
  return `<section class="hero">
      <div class="hero-top">
        <div><h2>${title}</h2>${sub ? `<p class="hero-sub">${sub}</p>` : ''}</div>
        ${days ? `<span class="streak">${days} ${days === 1 ? tx('dag i rad', 'day in a row') : tx('dagar i rad', 'days in a row')}</span>` : ''}
      </div>
      <div class="hero-row">${main}${second}
        </div>
      ${next && work ? `<p class="hero-next">${goal ? tx('Nästa ord:', 'Next word:') : tx('Nästa grundtecken:', 'Next basic character:')}
        <button type="button" class="next-pill" data-detail="${next.id}">${symbolSVG(next, 2.2, '', ICON_FRAME, 60)}<span>${esc(next.word)}</span></button></p>` : ''}
      ${whyBox('review')}
      ${pairs ? `<button type="button" class="hero-link" id="pairs">${icon('pairs')}<span>${tx(`Öva ord du blandat ihop (${pairs})`, `Practise words you mixed up (${pairs})`)}</span></button>` : ''}
    </section>`;
}

/** Allt annat man kan göra, som brickor. */
function tilesHTML() {
  const mine = mineCards().length, n = sentenceCount(), total = sentenceTotal();
  return `<h2 class="sec-title">${tx('Öva och använd', 'Practise and use')}</h2>
    <div class="tiles">
      ${mine ? tile('mine', 'focus', tx('Mina ord', 'My words'), tx('Ord du valt att träna extra', 'Words you chose to practise extra'), { badge: mine })
        : tile('mine', 'focus', tx('Mina ord', 'My words'), tx('Välj ☆ på ett ord i Ordlista', 'Choose ☆ on a word in the Word list'), { why: 'focus' })}
      ${total ? (n ? tile('sentences', 'sentences', tx('Meningar', 'Sentences'), tx('Välj ordet som saknas', 'Choose the missing word'), { badge: n < total ? `${n}/${total}` : n })
        : tile('sentences', 'sentences', tx('Meningar', 'Sentences'), tx('Låses upp när du lärt dig ord', 'Unlock as you learn words'), { why: 'sentences' })) : ''}
      ${tile('write', 'write-open', tx('Skriv en mening', 'Write a sentence'), tx('Bokstäver blir Bliss', 'Letters become Bliss'))}
      ${tile('board', 'board-open', tx('Kommunikationstavla', 'Communication board'), tx('Peka på symboler – få tal', 'Point at symbols – hear speech'))}
      ${tile('poem', 'poem-open', tx('Kylskåpspoesi', 'Fridge poetry'), tx('Dikta med ordmagneter', 'Write with word magnets'))}
    </div>
    ${whyBox('focus')}${whyBox('sentences')}
    ${sentenceDrafts ? `<p class="small muted" style="margin:8px 4px 0">${tx('<b>Utkast visas</b> (granskningsläge).', '<b>Drafts shown</b> (review mode).')}</p>` : ''}`;
}

/** Framstegen: fyra siffror och milstolparna. */
function progressHTML() {
  const st = stats(), days = streak();
  const pct = (a, b) => (b ? Math.min(100, 100 * a / b).toFixed(1) : 0);
  const kpi = (big, label, bar = null) => `<div class="kpi"><b>${big}</b><span>${label}</span>${bar == null ? '' : `<i class="kpi-bar"><i style="width:${bar}%"></i></i>`}</div>`;
  return `<h2 class="sec-title">${tx('Dina framsteg', 'Your progress')}</h2>
    <section class="panel">
      <div class="kpis">
        ${kpi(fmtN(st.learned), tx('lärda ord', 'learned words'))}
        ${kpi(`${days}<small> · ${tx('rekord', 'record')} ${bestStreak()}</small>`, days === 1 ? tx('dag i rad', 'day in a row') : tx('dagar i rad', 'days in a row'))}
        ${kpi(`${fmtN(st.atoms)}<small> / ${fmtN(st.atomTotal)}</small>`, tx('grundtecken', 'basic characters'), pct(st.atoms, st.atomTotal))}
        ${kpi(`${fmtN(st.compounds)}<small> / ${fmtN(st.compoundTotal)}</small>`, tx('sammansatta ord', 'compound words'), pct(st.compounds, st.compoundTotal))}
      </div>
      ${milestoneHTML()}
    </section>`;
}

// ---------------------------------------------------------------- händelser
register('home', {
  render: home,
  refresh: home,
  click(t) {
    if (t.id === 'poem-open') return setView('poesi'), true;
    if (t.id === 'install-app') return install(), true;
    if (t.id === 'install-hide') { S.settings.hideInstall = true; save(); home(); return true; }
    if (t.dataset.track) {
      S.settings.track = t.dataset.track;
      save();
      document.getElementById('start') || home();
      document.getElementById('start')?.click();   // valet startar första passet direkt
      return true;
    }
    if (t.dataset.why && WHY[t.dataset.why]) {
      const box = document.getElementById(`why-${t.dataset.why}`);
      if (box) box.textContent = WHY[t.dataset.why]();
      return true;
    }
    return false;
  },
});
})();
