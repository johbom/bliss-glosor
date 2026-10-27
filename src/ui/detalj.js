/**
 * Detaljrutan för ett ord: symbolen, delarna, orden den ingår i och knappen för Mina ord.
 * Öppnas från alla vyer (window.GlosorUI.showDetail).
 */
(() => {
const {
  S, fmtInterval, boxOf, card, symbolSVG, chip, classChip, formulaHTML, esc, isMine, toggleMine,
  lang,
} = window.Glosor;
const { tx, dlg } = window.GlosorUI;

function showDetail(id) {
  const c = card(id);
  if (!c) return;
  const s = S.cards[c.id];
  const users = c.users.map(card).sort((a, b) => (boxOf(b.id) >= 0) - (boxOf(a.id) >= 0) || b.score - a.score);
  dlg.innerHTML = `<button type="button" class="close" data-act="close" aria-label="${tx('Stäng', 'Close')}">×</button>
    <div class="stage">${symbolSVG(c, 8)}</div>
    <div class="word">${esc(c.word)}</div>
    ${c.others.length ? `<div class="syns">${esc(c.others.join(', '))}</div>` : ''}
    <div class="row" style="margin-top:6px">${classChip(c)}<span class="small muted">BCI-AV ${c.id} · ${lang() === 'en' ? `Swedish: ${esc(c.wordSv)}` : esc(c.v.en.replace(/_/g, ' '))}</span></div>
    <p style="margin-top:10px"><button type="button" class="ghost" data-mine="${c.id}" aria-pressed="${isMine(c.id)}">${isMine(c.id) ? tx('★ I Mina ord – ta bort', '★ In My words – remove') : tx('☆ Lägg till i Mina ord', '☆ Add to My words')}</button></p>
    ${c.raw.length ? `<p class="small muted" style="margin-top:12px">${tx('Byggs av:', 'Built from:')}</p>${formulaHTML(c)}` : `<p class="small muted" style="margin-top:12px">${tx('Grundtecken — har inga mindre delar.', 'Basic character — has no smaller parts.')}</p>`}
    ${c.expl ? `<p class="expl">${esc(c.expl)}</p>` : ''}
    <p class="small" style="margin-top:10px">${s ? tx(`Låda ${s.b} av 7 · ${s.n} svar, ${s.w} fel · `, `Box ${s.b} of 7 · ${s.n} answers, ${s.w} wrong · `) + (s.d <= Date.now() ? tx('att repetera nu', 'to review now') : tx('nästa repetition ', 'next review ') + fmtInterval(s.d - Date.now())) : tx('Inte påbörjad än.', 'Not started yet.')}</p>
    ${users.length ? `<p class="small muted" style="margin-top:12px">${tx(`Ingår i ${users.length} ord${users.length > 24 ? ' (visar 24)' : ''}:`, `Part of ${users.length} words${users.length > 24 ? ' (showing 24)' : ''}:`)}</p>
      <div class="formula">${users.slice(0, 24).map((u) => chip(u, 2.6)).join('')}</div>` : ''}`;
  if (!dlg.open) dlg.showModal();
  dlg.scrollTop = 0;
}

dlg.addEventListener('click', (e) => {
  if (e.target === dlg || e.target.closest('[data-act="close"]')) return dlg.close();
  const m = e.target.closest('[data-mine]');
  if (m) {
    toggleMine(m.dataset.mine);
    showDetail(m.dataset.mine);
    window.GlosorUI.views[window.GlosorUI.view()].refresh?.();   // startsidan och ordlistan visar Mina ord
    return;
  }
  const t = e.target.closest('[data-detail]');
  if (t) showDetail(t.dataset.detail);
});

window.GlosorUI.showDetail = showDetail;
})();
