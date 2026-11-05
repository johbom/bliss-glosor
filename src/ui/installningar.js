/**
 * Inställningar: språk, uppläsning, övningar, ordning, takt, visning, säkerhetskopia och nollställning.
 */
(() => {
const {
  MODES, S, save, resetProgress, esc, exportBackup, readBackup, importBackup, lang,
} = window.Glosor;
const { tx, app, register, applyLang, switchLang, canSpeak, say } = window.GlosorUI;

/**
 * Inställningarna som grupperade kort. Kryssrutorna är riktiga kryssrutor (skärmläsare, tangentbord), ritade
 * som strömbrytare (.switch); hela raden är tryckyta. Antalet nya ord per dag ändras med − och +.
 */
function settings() {
  const sw = (attrs, label, help = '') => `<label class="set-row"><span class="set-text">${label}${help ? `<small>${help}</small>` : ''}</span>
      <input type="checkbox" class="switch" ${attrs}></label>`;
  const radio = (name, value, on, label, help = '') => `<label class="set-row"><span class="set-text">${label}${help ? `<small>${help}</small>` : ''}</span>
      <input type="radio" name="${name}" value="${value}" ${on ? 'checked' : ''}></label>`;
  const modes = Object.entries(MODES).map(([k, label]) => sw(`data-mode="${k}" ${S.settings.modes[k] ? 'checked' : ''}`, label)).join('');
  const group = (title, body, help = '') => `<section class="set-group"><h3>${title}</h3><div class="set-card">${body}</div>${help ? `<p class="set-help">${help}</p>` : ''}</section>`;
  app.innerHTML = `
    <div class="settings">
      <h2 class="page-title">${tx('Inställningar', 'Settings')}</h2>
      ${group(tx('Språk', 'Language'), `<div class="set-row seg" role="radiogroup" aria-label="${tx('Språk', 'Language')}">
          <label><input type="radio" name="lang" value="sv" ${lang() === 'sv' ? 'checked' : ''}><span>Svenska</span></label>
          <label><input type="radio" name="lang" value="en" ${lang() === 'en' ? 'checked' : ''}><span>English</span></label></div>`)}
      ${canSpeak ? group(tx('Uppläsning', 'Read aloud'), sw(`id="speak" ${S.settings.speak ? 'checked' : ''}`, tx('Läs upp ord och dikter', 'Read words and poems aloud')),
        tx('Enhetens egen röst. På iPhone finns bättre röster under Inställningar → Hjälpmedel → Uppläst innehåll → Röster.',
          'Uses the device’s own voice. On iPhone, better voices are under Settings → Accessibility → Spoken Content → Voices.')) : ''}
      ${group(tx('Övningar', 'Exercises'), modes, tx('Minst en övning är alltid påslagen.', 'At least one exercise is always on.'))}
      ${group(tx('Ordning', 'Order'),
        radio('track', 'core', S.settings.track === 'core', tx('Vardagsord först', 'Everyday words first'), tx('Jag, vilja, mer, hjälp … – grundtecknen när ett ord behöver dem', 'I, want, more, help … – basic characters when a word needs them'))
        + radio('track', 'basics', S.settings.track !== 'core', tx('Från grunden', 'From the basics'), tx('Grundtecknen först, sedan orden som byggs av dem', 'Basic characters first, then the words built from them')),
        tx('Gäller nya ord. Det du redan lärt dig finns kvar.', 'Applies to new words. What you have already learned stays.'))}
      ${group(tx('Takt', 'Pace'), `<div class="set-row"><label class="set-text" for="npd">${tx('Nya ord per dag', 'New words per day')}</label>
          <span class="stepper"><button type="button" data-step="-1" aria-label="${tx('Färre', 'Fewer')}">−</button>
            <input type="number" id="npd" min="1" max="100" inputmode="numeric" value="${S.settings.newPerDay}">
            <button type="button" data-step="1" aria-label="${tx('Fler', 'More')}">+</button></span></div>`,
        tx('Ett sammansatt ord låses upp när du kan dess delar. Rätt svar ger längre mellanrum (10 min → 1 dag → … → 90 dagar), fel svar börjar om.',
          'A compound word unlocks when you know its parts. Right answers give longer intervals (10 min → 1 day → … → 90 days); a wrong answer starts over.'))}
      ${group(tx('Visning', 'Display'), sw(`id="staff" ${S.settings.staff ? 'checked' : ''}`, tx('Visa himmels- och jordlinje', 'Show sky and earth lines'), tx('Hjälplinjerna som visar symbolernas storlek och läge', 'The guide lines that show the symbols’ size and position')))}
      <section class="set-group backup"><h3>${tx('Säkerhetskopia', 'Backup')}</h3>
        <div class="set-card set-pad">
          <p class="small muted">${tx('Framstegen finns bara på den här enheten (på iPhone raderas de med appen). Spara en kopia då och då.',
            'Progress is stored only on this device (on iPhone it is deleted with the app). Save a copy now and then.')}</p>
          <div class="row">
            <button type="button" class="ghost" id="backup-save">${tx('Spara säkerhetskopia', 'Save backup')}</button>
            <button type="button" class="ghost" id="backup-load">${tx('Läs in säkerhetskopia', 'Load backup')}</button>
            <input type="file" id="backup-file" accept=".json,application/json" hidden>
          </div>
          <div class="backup-msg small" id="backupmsg" role="status"></div>
        </div></section>
      <section class="set-group"><h3>${tx('Börja om', 'Start over')}</h3>
        <div class="set-card set-pad" id="resetbox">
          <p class="small muted">${tx('Tar bort allt du lärt dig. Inställningarna och Mina ord finns kvar.', 'Removes everything you have learned. Settings and My words stay.')}</p>
          <button type="button" class="danger-btn" id="reset">${tx('Nollställ framsteg', 'Reset progress')}</button>
        </div></section>
    </div>`;
}

// ---------------------------------------------------------------- säkerhetskopia
let pendingBackup = null;   // inläst fil som väntar på bekräftelse
function backupMsg(html, kind = '') {
  const box = document.getElementById('backupmsg');
  if (!box) return;
  box.className = `backup-msg small ${kind}`;
  box.innerHTML = html;
  if (html) box.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}
/** Dela-menyn där den kan ta emot filer (iPhone: Spara i Filer, AirDrop, Mail …), annars en vanlig nedladdning. */
async function saveBackup() {
  const name = `bliss-glosor-${new Date().toISOString().slice(0, 10)}.json`;
  const file = new File([exportBackup()], name, { type: 'application/json' });
  const words = Object.keys(S.cards).length;
  const done = () => backupMsg(tx(`Säkerhetskopian (${words} ord) är sparad som <b>${esc(name)}</b>.`, `The backup (${words} words) is saved as <b>${esc(name)}</b>.`), 'good');
  try {
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: name });
      return done();
    }
  } catch (err) {
    if (err && err.name === 'AbortError') return;   // användaren stängde dela-menyn
  }
  try {
    const url = URL.createObjectURL(file);
    const a = Object.assign(document.createElement('a'), { href: url, download: name });
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    done();
  } catch (_) {
    backupMsg(tx('Det gick inte att spara filen här. Öppna appen i webbläsaren och försök igen.', 'The file could not be saved here. Open the app in the browser and try again.'), 'bad');
  }
}
function loadBackupFile(input) {
  const f = input.files && input.files[0];
  input.value = '';
  if (!f) return;
  f.text().then((text) => {
    const b = readBackup(text);
    if (!b) return backupMsg(tx('Filen är ingen säkerhetskopia från Bliss-glosor.', 'The file is not a Bliss Vocabulary backup.'), 'bad');
    pendingBackup = text;
    const when = b.saved ? new Date(b.saved).toLocaleString(lang() === 'en' ? 'en-GB' : 'sv-SE', { dateStyle: 'medium', timeStyle: 'short' }) : '';
    backupMsg(`<div class="confirm"><span>${tx(`Ersätta dina nuvarande framsteg med säkerhetskopian${when ? ` från ${when}` : ''} (${b.words} ord)?`,
      `Replace your current progress with the backup${when ? ` from ${when}` : ''} (${b.words} words)?`)}</span>
      <button type="button" class="yes" id="backup-yes">${tx('Läs in', 'Load')}</button><button type="button" class="ghost" id="backup-no">${tx('Avbryt', 'Cancel')}</button></div>`);
  }, () => backupMsg(tx('Filen kunde inte läsas.', 'The file could not be read.'), 'bad'));
}

// ---------------------------------------------------------------- händelser
register('settings', {
  render: settings,
  top: true,
  click(t) {
    if (t.id === 'backup-save') return saveBackup(), true;
    if (t.id === 'backup-load') return document.getElementById('backup-file').click(), true;
    if (t.id === 'backup-yes') {
      if (!pendingBackup || !importBackup(pendingBackup)) return backupMsg(tx('Säkerhetskopian kunde inte läsas in.', 'The backup could not be loaded.'), 'bad'), true;
      pendingBackup = null;
      applyLang();
      settings();
      return backupMsg(tx('Säkerhetskopian är inläst.', 'The backup has been loaded.'), 'good'), true;
    }
    if (t.id === 'backup-no') { pendingBackup = null; backupMsg(''); return true; }
    // Bekräftelse i sidan: confirm() fungerar inte i alla miljöer (t.ex. inbäddad som Artifact).
    if (t.id === 'reset') {
      document.getElementById('resetbox').innerHTML = `<div class="confirm"><span>${tx('Nollställa alla framsteg? Det går inte att ångra.', 'Reset all progress? This cannot be undone.')}</span>
        <button type="button" class="yes" id="reset-yes">${tx('Nollställ', 'Reset')}</button><button type="button" class="ghost" id="reset-no">${tx('Avbryt', 'Cancel')}</button></div>`;
      document.getElementById('reset-no').focus();
      return true;
    }
    if (t.id === 'reset-yes') { resetProgress(); settings(); return true; }
    if (t.id === 'reset-no') { settings(); return true; }
    if (t.dataset.step) {
      const inp = document.getElementById('npd');
      inp.value = Math.max(1, Math.min(100, (parseInt(inp.value, 10) || 10) + +t.dataset.step));
      S.settings.newPerDay = +inp.value;
      save();
      return true;
    }
    return false;
  },
  change(t) {
    if (t.id === 'backup-file') return loadBackupFile(t);
    if (t.name === 'lang') return switchLang(t.value);
    if (t.name === 'track') S.settings.track = t.value;
    if (t.dataset.mode) {
      S.settings.modes[t.dataset.mode] = t.checked;
      if (!Object.values(S.settings.modes).some(Boolean)) { S.settings.modes[t.dataset.mode] = true; t.checked = true; }
    }
    if (t.id === 'npd') S.settings.newPerDay = Math.max(1, Math.min(100, parseInt(t.value, 10) || 10));
    if (t.id === 'staff') S.settings.staff = t.checked;
    if (t.id === 'speak') {
      S.settings.speak = t.checked;
      if (t.checked) say(tx('Uppläsningen är på.', 'Read aloud is on.'));   // provar rösten direkt, i trycket
    }
    save();
  },
});
})();
