/**
 * Milstolpar: lärda ord och lärda grundtecken, med titlar ur BCI-AV. Visas på översikten och
 * när ett pass är klart.
 */
(() => {
const {
  card, symbolSVG, esc, milestoneState, rankOf,
} = window.Glosor;
const { tx, fmtN } = window.GlosorUI;

const MS_UNIT_T = { words: ['lärda ord', 'learned words'], atoms: ['lärda grundtecken', 'learned basic characters'] };
const MS_TITLE_T = { words: ['Ord', 'Words'], atoms: ['Grundtecken', 'Basic characters'] };
const MS_UNIT = { get words() { return tx(...MS_UNIT_T.words); }, get atoms() { return tx(...MS_UNIT_T.atoms); } };
const MS_TITLE = { get words() { return tx(...MS_TITLE_T.words); }, get atoms() { return tx(...MS_TITLE_T.atoms); } };
/** En titel: Blissymbolen (ur BCI-AV) och namnet. */
function rankHTML(r, unit = 3.4) {
  if (!r) return '';
  const c = card(r.id);
  return `<span class="rank">${c ? symbolSVG(c, unit) : ''}<span class="rank-name">${esc(r.name)}</span></span>`;
}
function milestoneTrackHTML(track) {
  const m = milestoneState(track);
  const fmt = fmtN;
  if (!m.next) {
    return `<div class="ms-track"><div class="ms-top"><span class="ms-title">${MS_TITLE[track]}</span>
      <span class="ms-count">${tx(`Alla ${fmt(m.total)} ${MS_UNIT[track]} – grattis!`, `All ${fmt(m.total)} ${MS_UNIT[track]} – congratulations!`)}</span></div>
      <div class="ms-ranks"><div class="ms-rank"><span class="ms-lbl">${tx('Du är', 'You are')}</span>${rankHTML(m.rankNow)}</div></div></div>`;
  }
  const pct = Math.min(100, (100 * m.learned) / m.next);
  const i = m.steps.indexOf(m.next);
  const chips = m.steps.slice(Math.max(0, i - 3), i + 3)
    .map((n) => `<span class="ms-chip${n <= m.prev ? ' done' : n === m.next ? ' next' : ''}" title="${esc(rankOf(track, n)?.name || '')}">${n === m.total ? tx('alla ', 'all ') : ''}${fmt(n)}</span>`).join('');
  return `<div class="ms-track">
      <div class="ms-top"><span class="ms-title">${MS_TITLE[track]}</span>
        <span class="ms-count"><b>${fmt(m.learned)}</b> ${tx('av', 'of')} ${fmt(m.next)} ${MS_UNIT[track]}</span></div>
      <div class="ms-ranks">
        <div class="ms-rank"><span class="ms-lbl">${tx('Du är', 'You are')}</span>${m.rankNow ? rankHTML(m.rankNow) : `<span class="rank-name muted">${tx('på väg', 'on your way')}</span>`}</div>
        <span class="ms-arrow" aria-hidden="true">→</span>
        <div class="ms-rank next"><span class="ms-lbl">${tx('Nästa vid', 'Next at')} ${fmt(m.next)}</span>${rankHTML(m.rankNext)}</div>
      </div>
      <div class="ms-bar" role="progressbar" aria-label="${MS_TITLE[track]}: ${MS_UNIT[track]} ${tx('mot nästa milstolpe', 'towards the next milestone')}" aria-valuemin="0" aria-valuemax="${m.next}" aria-valuenow="${m.learned}"><i style="width:${pct.toFixed(1)}%"></i></div>
      <div class="ms-chips">${chips}</div>
    </div>`;
}
function milestoneHTML() {
  return `<div class="milestone">
      <span class="kicker">${tx('Nästa milstolpe', 'Next milestone')}</span>
      ${milestoneTrackHTML('words')}
      ${milestoneTrackHTML('atoms')}
      <p class="ms-note">${tx('Lärt = rätt igen efter minst ett dygn.', 'Learned = right again after at least a day.')}</p>
    </div>`;
}

Object.assign(window.GlosorUI, { milestoneHTML, msUnit: (track) => MS_UNIT[track] });
})();
