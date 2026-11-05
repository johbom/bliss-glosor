/**
 * Startsidan: dagens pass, Mina ord, meningar (med skrivfältet), kylskåpspoesi, milstolpar och statistik (med dagar i rad).
 * Inställningarna har en egen flik (installningar.js).
 * Knappar som inte går att använda än är inte avstängda: ett tryck säger vad som behövs (locked()).
 */
(() => {
const {
  stats, streak, bestStreak, chip, nextAtom, mineCards, reviewCount, sentenceCount, sentenceTotal, sentenceDrafts, confusedPairs,
  S, save, nextGoal,
} = window.Glosor;
const { tx, app, setView, register, milestoneHTML, fundLogo } = window.GlosorUI;

/** En knapp som inte går att använda än. Den kan ändå väljas: trycket visar varför och vad som behövs. */
const locked = (key, label) => `<button type="button" class="primary locked" data-why="${key}" aria-describedby="why-${key}">${label}</button>`;
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

function home() {
  if (!reviewCount() && !S.settings.track) { app.innerHTML = trackChoice(); return; }
  const st = stats();
  const atom = nextAtom(), goal = nextGoal();
  const pct = (a, b) => (b ? (100 * a / b).toFixed(1) : 0);
  const work = st.due + st.newLeft;
  const learnt = reviewCount();
  const days = streak();
  app.innerHTML = `
    <section class="panel">
      <div class="head"><h2>${tx('Glosor', 'Vocabulary')}</h2></div>
      ${work ? `<p class="small muted" style="margin-bottom:8px">${tx(`${st.due} att repetera nu · ${st.newLeft} nya kvar i dag`, `${st.due} to review now · ${st.newLeft} new left today`)}</p>` : ''}
      <div class="row">
        ${work ? `<button type="button" class="primary" id="start">${tx('Börja öva', 'Start practising')}</button>`
          : learnt ? `<button type="button" class="primary" id="review">${tx('Repetera det du lärt dig', 'Review what you have learned')}</button>`
            : locked('review', tx('Repetera det du lärt dig', 'Review what you have learned'))}
        ${work && learnt ? `<button type="button" class="ghost" id="review">${tx('Repetera fritt', 'Free review')}</button>` : ''}
        ${work ? '' : `<button type="button" class="ghost" id="more">${tx('Lär 5 nya till', 'Learn 5 more')}</button>`}
        ${goal ? `<span class="small muted">${tx('Nästa ord:', 'Next word:')}</span>${chip(goal, 2.6)}`
          : atom ? `<span class="small muted">${tx('Nästa grundtecken:', 'Next basic character:')}</span>${chip(atom, 2.6)}` : ''}
      </div>
      ${work || learnt ? '' : whyBox('review')}
      ${pairsRow()}
    </section>
    ${minePanel()}
    ${sentencesPanel()}
    ${boardPanel()}
    ${poemPanel()}
    <section class="panel">
      ${milestoneHTML()}
      <div class="stats">
        <div class="stat"><b>${days}</b><span>${days === 1 ? tx('dag i rad', 'day in a row') : tx('dagar i rad', 'days in a row')} · ${tx('rekord', 'record')} ${bestStreak()}</span></div>
        <div class="stat"><b>${st.due}</b><span>${tx('att repetera nu', 'to review now')}</span></div>
        <div class="stat"><b>${st.newLeft}</b><span>${tx('nya kvar i dag', 'new left today')}</span></div>
        <div class="stat"><b>${st.learned}</b><span>${tx('lärda', 'learned')}</span></div>
        <div class="stat"><b>${st.unlocked}</b><span>${tx('sammansatta ord upplåsta', 'compound words unlocked')}</span></div>
      </div>
      <div class="small muted">${tx(`Grundtecken: ${st.atoms} av ${st.atomTotal}`, `Basic characters: ${st.atoms} of ${st.atomTotal}`)}</div>
      <div class="bar"><i style="width:${pct(st.atoms, st.atomTotal)}%"></i></div>
      <div class="small muted">${tx(`Sammansatta ord: ${st.compounds} av ${st.compoundTotal}`, `Compound words: ${st.compounds} of ${st.compoundTotal}`)}</div>
      <div class="bar"><i style="width:${pct(st.compounds, st.compoundTotal)}%"></i></div>
    </section>
    <section class="panel">${fundLogo()}</section>`;
}

/** Förväxlade ord: syns bara när det finns par att öva (fel svar sparar dem). */
function pairsRow() {
  const n = confusedPairs().length;
  if (!n) return '';
  return `<div class="row" style="margin-top:12px"><button type="button" class="ghost" id="pairs">${tx('Öva förväxlade ord', 'Practise mixed-up words')} (${n})</button>
      <span class="small muted">${tx('Ord du har blandat ihop.', 'Words you have mixed up.')}</span></div>`;
}

function minePanel() {
  const mine = mineCards();
  return `<section class="panel">
      <div class="head"><h2>${tx('Mina ord', 'My words')}</h2>
        ${mine.length ? `<button type="button" class="primary" id="focus">${tx('Öva mina ord', 'Practise my words')} (${mine.length})</button>`
          : locked('focus', tx('Öva mina ord', 'Practise my words'))}</div>
      ${mine.length
        ? `<p class="small muted">${tx('Ord du valt att träna extra. Klicka på ett ord för att ta bort det.', 'Words you chose to practise extra. Click a word to remove it.')}</p>
           <div class="formula">${mine.map((c) => chip(c, 2.6)).join('')}</div>`
        : `<p class="small muted">${tx('Inga ord än. Välj ☆ på ett ord i <button type="button" class="linklike" id="go-list">Ordlista</button>.',
           'No words yet. Choose ☆ on a word in the <button type="button" class="linklike" id="go-list">Word list</button>.')}</p>${whyBox('focus')}`}
    </section>`;
}

function sentencesPanel() {
  const n = sentenceCount(), total = sentenceTotal();
  if (!total) return '';   // syns först när det finns godkända meningar
  const more = n < total
    ? tx(` ${n} av ${total} upplåsta.`, ` ${n} of ${total} unlocked.`)
    : '';
  return `<section class="panel">
      <div class="head"><h2>${tx('Meningar', 'Sentences')}</h2>
        ${n ? `<button type="button" class="primary" id="sentences">${tx('Öva meningar', 'Practise sentences')} (${n})</button>`
          : locked('sentences', tx('Öva meningar', 'Practise sentences'))}</div>
      <p class="small muted">${tx('Välj ordet som saknas.', 'Choose the missing word.')}${more}${sentenceDrafts ? tx(' <b>Utkast visas</b> (granskningsläge).', ' <b>Drafts shown</b> (review mode).') : ''}</p>
      ${n ? '' : whyBox('sentences')}
      <div class="row" style="margin-top:10px"><button type="button" class="ghost" id="write-open">${tx('Skriv en egen mening', 'Write your own sentence')}</button>
        <span class="small muted">${tx('Skriv med bokstäver – det blir Bliss.', 'Type with letters – it becomes Bliss.')}</span></div>
    </section>`;
}

function boardPanel() {
  return `<section class="panel">
      <div class="head"><h2>${tx('Kommunikationstavla', 'Communication board')}</h2>
        <button type="button" class="primary" id="board-open">${tx('Öppna tavlan', 'Open the board')}</button></div>
      <p class="small muted">${tx('Peka på symboler – det blir en mening som kan läsas upp.', 'Point at symbols – they become a sentence that can be read aloud.')}</p>
    </section>`;
}

function poemPanel() {
  return `<section class="panel">
      <div class="head"><h2>${tx('Kylskåpspoesi', 'Fridge poetry')}</h2>
        <button type="button" class="primary" id="poem-open">${tx('Börja dikta', 'Start writing')}</button></div>
      <p class="small muted">${tx('Bygg fria dikter med ordmagneter.', 'Build free poems with word magnets.')}</p>
    </section>`;
}

// ---------------------------------------------------------------- händelser
register('home', {
  render: home,
  refresh: home,
  click(t) {
    if (t.id === 'go-list') return setView('list'), true;
    if (t.id === 'poem-open') return setView('poesi'), true;
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
