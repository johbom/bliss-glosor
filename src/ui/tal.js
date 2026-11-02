/**
 * Uppläsning (Inställningar → Läs upp ord och dikter): webbläsarens egen talsyntes på appens språk.
 * Fungerar utan nät och skickar inget någonstans. Rösten väljs inte här – enheten tar den röst som
 * är vald för språket (på iPhone: Hjälpmedel → Uppläst innehåll → Röster).
 * Saknar webbläsaren talsyntes finns varken inställningen eller högtalarknapparna.
 */
(() => {
const { S, lang, speechText, esc } = window.Glosor;
const UI = window.GlosorUI;

const synth = window.speechSynthesis;
const canSpeak = !!(synth && window.SpeechSynthesisUtterance);
// S.settings.speak finns först när man slagit på uppläsningen (som S.settings.fridge).
const speakOn = () => canSpeak && !!S.settings.speak;

function utter(text) {
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang() === 'en' ? 'en-GB' : 'sv-SE';
  return u;
}
function stop() {
  if (!canSpeak) return;
  // Safari tappar ibland nästa yttrande om cancel() körs när inget läses.
  if (synth.speaking || synth.pending) synth.cancel();
  document.querySelectorAll('.saying').forEach((el) => el.classList.remove('saying'));
}
/** Läs upp en text (avbryter det som läses). Anropas helst direkt i ett tryck: iPhone kräver det första gången. */
function say(text, force = false) {
  const t = speechText(text);
  if (!t || !(force || speakOn())) return;
  stop();
  synth.speak(utter(t));
}
/** Läs upp ord för ord; elementet för ordet som läses får klassen saying. items: [{ text, el: () => Element }]. */
function sayAll(items) {
  if (!speakOn()) return;
  stop();
  for (const it of items) {
    const t = speechText(it.text);
    if (!t) continue;
    const u = utter(t);
    u.onstart = () => it.el()?.classList.add('saying');
    u.onend = u.onerror = () => it.el()?.classList.remove('saying');
    synth.speak(u);
  }
}
const SPEAKER = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
/** Högtalarknapp efter ordet (bara när uppläsningen är på). */
const sayBtn = (word) => (speakOn()
  ? `<button type="button" class="say" data-say="${esc(word)}" aria-label="${UI.tx('Lyssna', 'Listen')}">${SPEAKER}</button>` : '');

// Fångas före vyernas klickhantering, så att knappen fungerar överallt (även i detaljrutan).
document.addEventListener('click', (e) => {
  const b = e.target.closest?.('[data-say]');
  if (!b) return;
  e.stopPropagation();
  say(b.dataset.say);
}, true);
// Byte av vy tystar uppläsningen.
document.querySelector('header nav').addEventListener('click', stop);

Object.assign(UI, { canSpeak, speakOn, say, sayAll, stop, sayBtn, SPEAKER });
})();
