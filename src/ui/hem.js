/**
 * Startsidan: dagens pass, Mina ord, meningar, kylskåpspoesi, milstolpar och statistik.
 * Inställningarna har en egen flik (installningar.js).
 */
(() => {
const {
  stats, fmtInterval, chip, nextAtom, mineCards, reviewCount, nextDue, sentenceCount, sentenceTotal,
  sentenceDrafts,
} = window.Glosor;
const { tx, app, setView, register, milestoneHTML } = window.GlosorUI;

// ---------------------------------------------------------------- start
function home() {
  const st = stats();
  const atom = nextAtom();
  const pct = (a, b) => (b ? (100 * a / b).toFixed(1) : 0);
  const work = st.due + st.newLeft;
  const learnt = reviewCount(), wait = nextDue();
  app.innerHTML = `
    <section class="panel">
      ${work ? `<p class="small muted" style="margin-bottom:8px">${tx(`${st.due} att repetera nu · ${st.newLeft} nya kvar i dag`, `${st.due} to review now · ${st.newLeft} new left today`)}</p>` : ''}
      ${!work && learnt ? `<p class="small muted" style="margin-bottom:8px">${tx('Klart för i dag!', 'Done for today!')}${wait != null ? tx(` Nästa repetition ${fmtInterval(wait)}.`, ` Next review ${fmtInterval(wait)}.`) : ''}</p>` : ''}
      <div class="row">
        ${work ? `<button type="button" class="primary" id="start">${tx('Börja öva', 'Start practising')}</button>`
          : `<button type="button" class="primary" id="review" ${learnt ? '' : 'disabled'}>${tx('Repetera det du lärt dig', 'Review what you have learned')}</button>`}
        ${work && learnt ? `<button type="button" class="ghost" id="review">${tx('Repetera fritt', 'Free review')}</button>` : ''}
        ${work ? '' : `<button type="button" class="ghost" id="more">${tx('Lär 5 nya till', 'Learn 5 more')}</button>`}
        ${atom ? `<span class="small muted">${tx('Nästa grundtecken:', 'Next basic character:')}</span>${chip(atom, 2.6)}` : ''}
      </div>
    </section>
    ${minePanel()}
    ${sentencesPanel()}
    ${poemPanel()}
    <section class="panel">
      ${milestoneHTML()}
      <div class="stats">
        <div class="stat"><b>${st.due}</b><span>${tx('att repetera nu', 'to review now')}</span></div>
        <div class="stat"><b>${st.newLeft}</b><span>${tx('nya kvar i dag', 'new left today')}</span></div>
        <div class="stat"><b>${st.learned}</b><span>${tx('lärda', 'learned')}</span></div>
        <div class="stat"><b>${st.unlocked}</b><span>${tx('sammansatta ord upplåsta', 'compound words unlocked')}</span></div>
      </div>
      <div class="small muted">${tx(`Grundtecken: ${st.atoms} av ${st.atomTotal}`, `Basic characters: ${st.atoms} of ${st.atomTotal}`)}</div>
      <div class="bar"><i style="width:${pct(st.atoms, st.atomTotal)}%"></i></div>
      <div class="small muted">${tx(`Sammansatta ord: ${st.compounds} av ${st.compoundTotal}`, `Compound words: ${st.compounds} of ${st.compoundTotal}`)}</div>
      <div class="bar"><i style="width:${pct(st.compounds, st.compoundTotal)}%"></i></div>
    </section>`;
}

function minePanel() {
  const mine = mineCards();
  return `<section class="panel">
      <div class="head"><h2>${tx('Mina ord', 'My words')}</h2>
        <button type="button" class="primary" id="focus" ${mine.length ? '' : 'disabled'}>${tx('Öva mina ord', 'Practise my words')}${mine.length ? ` (${mine.length})` : ''}</button></div>
      ${mine.length
        ? `<p class="small muted">${tx('Ord du valt att träna extra. Klicka på ett ord för att ta bort det.', 'Words you chose to practise extra. Click a word to remove it.')}</p>
           <div class="formula">${mine.map((c) => chip(c, 2.6)).join('')}</div>`
        : `<p class="small muted">${tx('Inga ord än. Välj ☆ på ett ord i <button type="button" class="linklike" id="go-list">Ordlista</button>.',
           'No words yet. Choose ☆ on a word in the <button type="button" class="linklike" id="go-list">Word list</button>.')}</p>`}
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
        <button type="button" class="primary" id="sentences" ${n ? '' : 'disabled'}>${tx('Öva meningar', 'Practise sentences')}${n ? ` (${n})` : ''}</button></div>
      <p class="small muted">${tx('Välj ordet som saknas.', 'Choose the missing word.')}${more}${sentenceDrafts ? tx(' <b>Utkast visas</b> (granskningsläge).', ' <b>Drafts shown</b> (review mode).') : ''}</p>
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
    return false;
  },
});
})();
