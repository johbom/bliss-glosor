/**
 * Övningspasset: vanligt pass, Mina ord, fri repetition och meningar – introduktion, frågor,
 * svar och slutskärmar.
 */
(() => {
const {
  MODES, S, save, stats, nextStep, grade, checkParts, fmtInterval, card, symbolSVG, classChip,
  formulaHTML, esc, startFocus, focusState, mergedNote, startSentences, sentenceState, nextSentence,
  answerSentence, wordSVG, milestoneState, checkMilestones,
} = window.Glosor;
const { tx, fmtN, app, setView, register, endModes, milestoneHTML, msUnit } = window.GlosorUI;

let step = null, answered = false, sess = null;

// ---------------------------------------------------------------- pass
/** kind: undefined = vanligt pass, 'mine' = Mina ord, 'sentences' = meningar. */
function startSession(kind) {
  endModes();
  if (kind === 'mine' || kind === 'review') startFocus(kind);
  if (kind === 'sentences') startSentences();
  sess = { right: 0, wrong: 0, fresh: 0, mine: kind === 'mine', review: kind === 'review', sentences: kind === 'sentences' };
  setView('session');
  advance();
}

function advance() {
  step = sess.sentences ? nextSentence() : nextStep();
  answered = false;
  if (step?.kind === 'intro') sess.fresh++;
  renderStep();
  window.scrollTo(0, 0);   // nästa kort börjar överst, även om man bläddrat ner i förra
}

function progressBar() {
  const st = stats(), f = focusState(), m = sentenceState();
  const left = m ? tx(`Meningar · ${m.left} av ${m.total} kvar`, `Sentences · ${m.left} of ${m.total} left`)
    : f?.review ? tx(`Repetition · ${f.left} av ${f.total} kvar`, `Review · ${f.left} of ${f.total} left`)
    : f ? tx(`Mina ord · ${f.left} av ${f.total} kvar`, `My words · ${f.left} of ${f.total} left`)
      : tx(`${st.due} att repetera · ${st.newLeft} nya kvar`, `${st.due} to review · ${st.newLeft} new left`);
  return `<div class="progress"><span>${left}</span>
    <span>${sess.right} ${tx('rätt', 'right')} · ${sess.wrong} ${tx('fel', 'wrong')} <button type="button" class="ghost" id="quit" style="padding:4px 10px;margin-left:8px">${tx('Avsluta', 'Quit')}</button></span></div>`;
}

function introHTML(c) {
  const kind = c.parts.length ? tx('Nytt ord', 'New word') : tx('Nytt grundtecken', 'New basic character');
  const users = c.users.length ? `<p class="small muted" style="margin-top:8px">${tx(`Ingår i ${c.users.length} andra ord.`, `Part of ${c.users.length} other words.`)}</p>` : '';
  return `<div class="kicker">${kind}</div>
    <div class="stage">${symbolSVG(c, 9)}</div>
    <div class="word">${esc(c.word)}</div>
    ${c.others.length ? `<div class="syns">${esc(c.others.join(', '))}</div>` : ''}
    <div style="margin-top:6px">${classChip(c)}</div>
    ${c.raw.length ? `<p class="small muted" style="margin-top:12px">${tx('Byggs av:', 'Built from:')}</p>${formulaHTML(c)}` : formulaHTML(c)}
    ${c.expl ? `<p class="expl">${esc(c.expl)}</p>` : ''}
    ${users}
    <div class="actions"><span class="hint">${tx('Enter = fortsätt', 'Enter = continue')}</span><button type="button" class="primary" data-act="next">${tx('Jag har tittat på den →', 'Got it →')}</button></div>`;
}

/** "Markera alla delar …" – säger till när samma del förekommer flera gånger (arbete = aktivitet + aktivitet). */
function partsCountText(c) {
  const distinct = new Set(c.parts).size, total = c.parts.length;
  if (c.optInd) {
    const n = `${distinct - c.optInd.length}–${distinct}`;
    return tx(`Markera delarna (${n} st, operatorn valfri).`, `Select the parts (${n}, indicator optional).`);
  }
  if (total > distinct) {
    return tx(`Markera delarna (${distinct} ${distinct === 1 ? 'del' : 'olika'} – någon finns flera gånger).`,
      `Select the parts (${distinct} ${distinct === 1 ? 'part' : 'different'} – one appears more than once).`);
  }
  return tx(`Markera delarna (${distinct} st).`, `Select the parts (${distinct}).`);
}

function quizHTML() {
  const { c, mode } = step;
  if (mode === 'sym') {
    return `<div class="kicker">${MODES.sym}</div><p class="prompt">${tx('Vad betyder symbolen?', 'What does the symbol mean?')}</p>
      <div class="stage">${symbolSVG(c, 9)}</div>
      <div class="opts">${step.options.map((o, i) => `<button type="button" class="opt" data-opt="${i}"><span class="k">${i + 1}</span>${esc(o.word)}</button>`).join('')}</div>
      <div class="hint">${tx('Tangent 1–4 väljer', 'Keys 1–4 choose')}</div>`;
  }
  if (mode === 'word') {
    return `<div class="kicker">${MODES.word}</div><p class="prompt">${tx('Vilken symbol betyder', 'Which symbol means')}</p>
      <div class="word">${esc(c.word)}</div><div style="margin-top:4px">${classChip(c)}</div>
      <div class="opts">${step.options.map((o, i) => `<button type="button" class="opt" data-opt="${i}" aria-label="${tx('Alternativ', 'Option')} ${i + 1}"><span class="k">${i + 1}</span>${symbolSVG(o, 4.5)}</button>`).join('')}</div>
      <div class="hint">${tx('Tangent 1–4 väljer', 'Keys 1–4 choose')}</div>`;
  }
  const pal = step.palette.map((o, i) =>
    `<button type="button" class="chip pal${step.mode === 'parts' && step.sel.includes(o.id) ? ' on' : ''}" data-pal="${i}">${i < 9 ? `<span class="k">${i + 1}</span>` : ''}${symbolSVG(o, 3.4)}<span>${esc(o.word)}</span></button>`).join('');
  if (mode === 'parts') {
    return `<div class="kicker">${MODES.parts}</div><p class="prompt">${tx(`Vilka delar består <b>${esc(c.word)}</b> av?`, `Which parts is <b>${esc(c.word)}</b> made of?`)}</p>
      <div class="stage">${symbolSVG(c, 9)}</div>
      <p class="small muted">${partsCountText(c)}</p>
      ${mergedNote(c)}
      <div class="palette">${pal}</div>
      <div class="actions"><span class="hint">${tx('Siffror markerar · Enter kontrollerar', 'Numbers select · Enter checks')}</span><button type="button" class="primary" data-act="check">${tx('Kontrollera', 'Check')}</button></div>`;
  }
  return `<div class="kicker">${MODES.build}</div><p class="prompt">${tx('Bygg symbolen för', 'Build the symbol for')}</p>
    <div class="word">${esc(c.word)}</div><div style="margin-top:4px">${classChip(c)}</div>
    <div class="strip" id="strip" data-empty="${tx('Välj delar nedan', 'Choose parts below')}">${step.sel.map((id, i) => `<button type="button" class="chip" data-unsel="${i}" title="${tx('Ta bort', 'Remove')}">${symbolSVG(card(id), 3.4)}<span>${esc(card(id).word)}</span></button>`).join('')}</div>
    <p class="small muted" style="margin-top:6px">${c.optInd ? tx(`${c.parts.length} delar (operatorn valfri).`, `${c.parts.length} parts (indicator optional).`) : tx(`${c.parts.length} delar.`, `${c.parts.length} parts.`)}</p>
    <div class="palette">${pal}</div>
    <div class="actions"><span class="hint">${tx('Siffror lägger till · Backsteg tar bort · Enter kontrollerar', 'Numbers add · Backspace removes · Enter checks')}</span><button type="button" class="ghost" data-act="clear">${tx('Rensa', 'Clear')}</button><button type="button" class="primary" data-act="check">${tx('Kontrollera', 'Check')}</button></div>`;
}

/** Meningen i Bliss; luckan som streckad ruta (eller ifylld efter svaret). */
function sentenceRow(m, filled = false, glossed = false) {
  return `<div class="sentence${glossed ? ' glossed' : ''}">${m.ord.map((w, i) => {
    if (i === m.lucka && !filled) return `<span class="blank" aria-label="${tx('ordet som saknas', 'the missing word')}">?</span>`;
    const svg = wordSVG(`${m.nr}-${i}`, w.e, glossed ? 4.6 : 6.4);
    return `<figure class="sw${i === m.lucka ? ' hit' : ''}">${svg}${glossed ? `<figcaption>${esc(tx(w.sv, w.en || w.sv))}</figcaption>` : ''}</figure>`;
  }).join('')}</div>`;
}

function sentenceHTML() {
  const { m } = step;
  return `<div class="kicker">${tx('Färdigställ meningen', 'Complete the sentence')}</div><p class="prompt">${tx('Vilket ord saknas?', 'Which word is missing?')}</p>
    ${sentenceRow(m)}
    <div class="opts">${step.options.map((o, i) => `<button type="button" class="opt" data-opt="${i}" aria-label="${tx('Alternativ', 'Option')} ${i + 1}"><span class="k">${i + 1}</span>${wordSVG(`${m.nr}-a${o.id}`, o.e, 4.5)}</button>`).join('')}</div>
    <div class="hint">${tx('Tangent 1–4 väljer', 'Keys 1–4 choose')}</div>`;
}

function sentenceFeedbackHTML(ok, note) {
  const { m } = step;
  return `<div class="feedback ${ok ? 'good' : 'wrong'}">
    <h3>${ok ? tx('Rätt!', 'Correct!') : tx('Inte riktigt', 'Not quite')}</h3>
    <p class="word" style="font-size:20px">${esc(tx(m.sv, m.en || m.sv))}</p>
    ${note ? `<p class="small" style="margin-top:4px">${note}</p>` : ''}
    ${sentenceRow(m, true, true)}
  </div>
  <div class="actions result ${ok ? 'good' : 'wrong'}"><span class="verdict" aria-hidden="true">${ok ? tx('Rätt!', 'Correct!') : tx('Inte riktigt', 'Not quite')}</span>
    <span class="hint">${tx('Enter = fortsätt', 'Enter = continue')}</span><button type="button" class="primary" data-act="next">${tx('Fortsätt →', 'Continue →')}</button></div>`;
}

function renderStep() {
  if (!step && sess.sentences) {
    const tot = sentenceState()?.total ?? '';
    app.innerHTML = `<section class="panel"><div class="kicker">${tx('Meningar – klart', 'Sentences – done')}</div>
      <p class="prompt">${tx(`Du har färdigställt alla ${tot} meningar${sess.wrong ? `, efter ${sess.wrong} fel på vägen` : ' direkt'}.`,
        `You have completed all ${tot} sentences${sess.wrong ? `, after ${sess.wrong} mistakes along the way` : ' straight away'}.`)}</p>
      <div class="actions"><button type="button" class="ghost" data-act="home">${tx('Till översikten', 'Back to overview')}</button><button type="button" class="primary" data-act="sentences">${tx('Öva meningarna igen', 'Practise the sentences again')}</button></div></section>`;
    return;
  }
  if (!step && sess.review) {
    const tot = focusState()?.total ?? '';
    app.innerHTML = `<section class="panel"><div class="kicker">${tx('Repetition – klart', 'Review – done')}</div>
      <p class="prompt">${tx(`Du har svarat rätt på alla ${tot} ord${sess.wrong ? `, efter ${sess.wrong} fel på vägen` : ' direkt'}.`,
        `You have answered all ${tot} words correctly${sess.wrong ? `, after ${sess.wrong} mistakes along the way` : ' straight away'}.`)}</p>
      <p class="muted">${tx('Fri repetition flyttar inte orden i schemat.', 'Free review does not move words in the schedule.')}</p>
      ${milestoneHTML()}
      <div class="actions"><button type="button" class="ghost" data-act="home">${tx('Till översikten', 'Back to overview')}</button><button type="button" class="primary" data-act="review">${tx('Repetera fler', 'Review more')}</button></div></section>`;
    return;
  }
  if (!step && sess.mine) {
    const tot = focusState()?.total ?? '';
    app.innerHTML = `<section class="panel"><div class="kicker">${tx('Mina ord – klart', 'My words – done')}</div>
      <p class="prompt">${tx(`Du har svarat rätt på alla ${tot} ord${sess.wrong ? `, efter ${sess.wrong} fel på vägen` : ' direkt'}.`,
        `You have answered all ${tot} words correctly${sess.wrong ? `, after ${sess.wrong} mistakes along the way` : ' straight away'}.`)}</p>
      <div class="actions"><button type="button" class="ghost" data-act="home">${tx('Till översikten', 'Back to overview')}</button><button type="button" class="primary" data-act="focus">${tx('Öva mina ord igen', 'Practise my words again')}</button></div></section>`;
    return;
  }
  if (!step) {
    const st = stats();
    const n = sess.right + sess.wrong;
    app.innerHTML = `<section class="panel"><div class="kicker">${tx('Klart', 'Done')}</div>
      <p class="prompt">${n ? tx(`Du svarade rätt på ${sess.right} av ${n}`, `You answered ${sess.right} of ${n} correctly`) : tx('Inget kvar att öva just nu', 'Nothing left to practise right now')}${sess.fresh ? tx(` och lärde dig ${sess.fresh} nya symboler`, ` and learned ${sess.fresh} new symbols`) : ''}.</p>
      <p class="muted">${st.unlocked ? tx(`${st.unlocked} sammansatta ord är upplåsta och väntar.`, `${st.unlocked} compound words are unlocked and waiting.`) : ''}</p>
      ${milestoneHTML()}
      <div class="actions"><button type="button" class="ghost" data-act="home">${tx('Till översikten', 'Back to overview')}</button><button type="button" class="primary" data-act="more">${tx('Lär 5 nya till', 'Learn 5 more')}</button></div></section>`;
    return;
  }
  const body = step.kind === 'intro' ? introHTML(step.c) : step.kind === 'sentence' ? sentenceHTML() : quizHTML();
  app.innerHTML = progressBar() + `<section class="panel" id="card">${body}</section>`;
}

function feedbackHTML(ok, ms, note = '') {
  const { c } = step;
  return `<div class="feedback ${ok ? 'good' : 'wrong'}">
    <h3>${ok ? tx('Rätt!', 'Correct!') : tx('Inte riktigt', 'Not quite')}</h3>
    <div class="row" style="align-items:flex-end">${step.mode === 'sym' ? '' : symbolSVG(c, 5)}<div><div class="word" style="font-size:22px">${esc(c.word)}</div>${classChip(c)}</div></div>
    ${note ? `<p class="small" style="margin-top:6px">${note}</p>` : ''}
    ${formulaHTML(c, 2.8)}
    ${c.expl ? `<p class="expl">${esc(c.expl)}</p>` : ''}
    <p class="small muted" style="margin-top:6px">${tx('Kommer igen', 'Comes back')} ${fmtInterval(ms)}.</p>
  </div>
  <div class="actions result ${ok ? 'good' : 'wrong'}"><span class="verdict" aria-hidden="true">${ok ? tx('Rätt!', 'Correct!') : tx('Inte riktigt', 'Not quite')}</span>
    <span class="hint">${tx('Enter = fortsätt', 'Enter = continue')}</span><button type="button" class="primary" data-act="next">${tx('Fortsätt →', 'Continue →')}</button></div>`;
}

function finish(ok, note) {
  answered = true;
  ok ? sess.right++ : sess.wrong++;
  const card$ = document.getElementById('card');
  card$.querySelectorAll('.actions,.hint').forEach((n) => n.remove());
  if (step.kind === 'sentence') {
    answerSentence(step.m.nr, ok);
    card$.querySelector('.sentence').outerHTML = sentenceRow(step.m, true);   // luckan fylls i
    card$.insertAdjacentHTML('beforeend', sentenceFeedbackHTML(ok, note));
  } else {
    const ms = grade(step.c.id, ok);
    card$.insertAdjacentHTML('beforeend', feedbackHTML(ok, ms, note));
    for (const { track, n, rank } of checkMilestones().reverse()) {
      const m = milestoneState(track);
      const what = `${n === m.total ? tx('alla ', 'all ') : ''}${fmtN(n)} ${msUnit(track)}`;
      card$.querySelector('.feedback').insertAdjacentHTML('afterbegin',
        `<div class="ms-hit" role="status">${rank ? `<span class="ms-hit-sym">${symbolSVG(card(rank.id), 3.2)}</span>` : ''}
          <span><b>${tx('Milstolpe nådd', 'Milestone reached')}: ${what}!</b>${rank ? tx(` Du är nu <b>${esc(rank.name)}</b>.`, ` You are now <b>${esc(rank.name)}</b>.`) : ''}${m.next ? tx(` Nästa: ${esc(m.rankNext?.name || '')} vid ${fmtN(m.next)}.`, ` Next: ${esc(m.rankNext?.name || '')} at ${fmtN(m.next)}.`) : ''}</span></div>`);
    }
  }
  card$.querySelector('[data-act="next"]').focus({ preventScroll: true });
  document.querySelector('.progress').outerHTML = progressBar();
}

function chooseOption(i) {
  if (answered || !step.options || i >= step.options.length) return;
  const btns = [...document.querySelectorAll('.opt')];
  btns.forEach((b) => { b.disabled = true; });
  const ok = i === step.answer;
  btns[i].classList.add(ok ? 'ok' : 'bad');
  if (!ok) btns[step.answer].classList.add('miss');
  const chosen = step.kind === 'sentence' ? (card(step.options[i].id)?.word || '') : step.options[i].word;
  finish(ok, ok ? '' : tx(`Du valde <b>${esc(chosen)}</b>.`, `You chose <b>${esc(chosen)}</b>.`));
}

function togglePal(i) {
  if (answered || !step.palette || i >= step.palette.length) return;
  const id = step.palette[i].id;
  if (step.mode === 'parts') {
    const k = step.sel.indexOf(id);
    k < 0 ? step.sel.push(id) : step.sel.splice(k, 1);
  } else step.sel.push(id);
  renderStep();
}

function checkStep() {
  if (answered) return;
  if (!step.sel.length) return;
  const { ok, order, skipped } = checkParts(step);
  const want = new Set(step.c.parts);
  if (ok && skipped) step.c.optInd.forEach((id) => want.delete(id));   // frivillig operator utelämnad – inte "missad"
  document.querySelectorAll('.pal').forEach((b, i) => {
    const id = step.palette[i].id, picked = step.sel.includes(id);
    b.disabled = true;
    b.classList.remove('on');   // annars döljer markeringen "vald" färgen för rätt/fel
    if (picked) b.classList.add(want.has(id) ? 'ok' : 'bad');
    else if (want.has(id)) b.classList.add('miss');
  });
  document.querySelectorAll('[data-unsel]').forEach((b) => { b.disabled = true; });
  let note = '';
  if (!ok) note = tx('Streckat = missad del, rött = ingår inte.', 'Dashed = missed part, red = not included.');
  else if (step.mode === 'build' && !order) note = tx('Rätt delar! BCI:s ordning:', 'Right parts! BCI order:');
  if (ok && skipped) note = (note ? note + ' ' : '') + tx('BCI tar även med operatorn.', 'BCI also includes the indicator.');
  finish(ok, note);
}

// ---------------------------------------------------------------- händelser
register('session', {
  // Ritas av advance(); vid språkbyte: ett visat svar går vidare till nästa kort, annars ritas kortet om.
  relang: () => (answered ? advance() : renderStep()),
  // Delar/ord-chips öppnar detaljer – men inte mitt i en fråga (det skulle avslöja svaret).
  peek: () => answered || step?.kind === 'intro' || !step,
  click(t) {
    if (t.id === 'start') return startSession(), true;
    if (t.id === 'focus' || t.dataset.act === 'focus') return startSession('mine'), true;
    if (t.id === 'review' || t.dataset.act === 'review') return startSession('review'), true;
    if (t.id === 'sentences' || t.dataset.act === 'sentences') return startSession('sentences'), true;
    if (t.id === 'more' || t.dataset.act === 'more') { S.day.extra += 5; save(); startSession(); return true; }
    if (t.dataset.act === 'next') return advance(), true;
    if (t.dataset.act === 'check') return checkStep(), true;
    if (t.dataset.act === 'clear') { if (!answered) { step.sel = []; renderStep(); } return true; }
    if (t.dataset.opt != null) return chooseOption(+t.dataset.opt), true;
    if (t.dataset.pal != null) return togglePal(+t.dataset.pal), true;
    if (t.dataset.unsel != null) { if (!answered) { step.sel.splice(+t.dataset.unsel, 1); renderStep(); } return true; }
    return false;
  },
  key(e) {
    if (e.key === 'Enter') {
      const btn = document.querySelector('#card .actions .primary, .panel .actions .primary');
      if (btn) { e.preventDefault(); btn.click(); }
      return;
    }
    if (e.key === 'Escape') return setView('home');
    if (!step || answered) return;
    if (/^[1-9]$/.test(e.key)) {
      const i = +e.key - 1;
      if (step.options) chooseOption(i);
      else if (step.palette) togglePal(i);
    }
    if (e.key === 'Backspace' && step.mode === 'build' && step.sel.length) { e.preventDefault(); step.sel.pop(); renderStep(); }
  },
});
})();
