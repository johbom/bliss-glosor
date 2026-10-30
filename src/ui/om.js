/**
 * Om-sidan, på svenska och engelska.
 */
(() => {
const { lang } = window.Glosor;
const { tx, app, register } = window.GlosorUI;

// ---------------------------------------------------------------- om
const APP_VERSION = '1.0 · BCI-AV 2026-07-25';
const CONTACT = 'john.s@tfhuk.com';   // felrapporter och förslag
// Informationsbladet (scripts/build-informationsblad.py). Fast adress på GitHub Pages, så att länken
// fungerar överallt – även i inbäddade vyer där nedladdningslänkar blockeras.
const FLYER_URL = 'https://johbom.github.io/bliss-glosor/informationsblad/Bliss-glosor-informationsblad.pdf';
// QR-koden till appen – genererad av scripts/build-qr.py (samma adress som på informationsbladet).
const QR = { url: 'https://johbom.github.io/bliss-glosor/', size: 37, d: 'M4 4h7v1h-7zM12 4h3v1h-3zM17 4h1v1h-1zM22 4h1v1h-1zM26 4h7v1h-7zM4 5h1v1h-1zM10 5h1v1h-1zM13 5h5v1h-5zM20 5h1v1h-1zM26 5h1v1h-1zM32 5h1v1h-1zM4 6h1v1h-1zM6 6h3v1h-3zM10 6h1v1h-1zM12 6h2v1h-2zM16 6h3v1h-3zM21 6h1v1h-1zM26 6h1v1h-1zM28 6h3v1h-3zM32 6h1v1h-1zM4 7h1v1h-1zM6 7h3v1h-3zM10 7h1v1h-1zM13 7h5v1h-5zM19 7h1v1h-1zM21 7h3v1h-3zM26 7h1v1h-1zM28 7h3v1h-3zM32 7h1v1h-1zM4 8h1v1h-1zM6 8h3v1h-3zM10 8h1v1h-1zM14 8h1v1h-1zM16 8h1v1h-1zM18 8h1v1h-1zM22 8h1v1h-1zM24 8h1v1h-1zM26 8h1v1h-1zM28 8h3v1h-3zM32 8h1v1h-1zM4 9h1v1h-1zM10 9h1v1h-1zM12 9h1v1h-1zM17 9h2v1h-2zM20 9h3v1h-3zM26 9h1v1h-1zM32 9h1v1h-1zM4 10h7v1h-7zM12 10h1v1h-1zM14 10h1v1h-1zM16 10h1v1h-1zM18 10h1v1h-1zM20 10h1v1h-1zM22 10h1v1h-1zM24 10h1v1h-1zM26 10h7v1h-7zM13 11h2v1h-2zM18 11h2v1h-2zM22 11h2v1h-2zM4 12h1v1h-1zM6 12h1v1h-1zM10 12h2v1h-2zM13 12h1v1h-1zM16 12h4v1h-4zM22 12h3v1h-3zM27 12h1v1h-1zM30 12h1v1h-1zM32 12h1v1h-1zM6 13h2v1h-2zM12 13h2v1h-2zM15 13h3v1h-3zM19 13h3v1h-3zM23 13h2v1h-2zM26 13h2v1h-2zM31 13h2v1h-2zM4 14h2v1h-2zM8 14h1v1h-1zM10 14h2v1h-2zM13 14h4v1h-4zM19 14h1v1h-1zM23 14h1v1h-1zM27 14h1v1h-1zM29 14h2v1h-2zM32 14h1v1h-1zM5 15h1v1h-1zM8 15h1v1h-1zM12 15h6v1h-6zM19 15h2v1h-2zM22 15h1v1h-1zM24 15h3v1h-3zM29 15h1v1h-1zM4 16h3v1h-3zM10 16h2v1h-2zM14 16h2v1h-2zM17 16h1v1h-1zM20 16h1v1h-1zM23 16h1v1h-1zM26 16h2v1h-2zM32 16h1v1h-1zM4 17h1v1h-1zM6 17h1v1h-1zM8 17h1v1h-1zM11 17h1v1h-1zM15 17h2v1h-2zM19 17h2v1h-2zM23 17h2v1h-2zM26 17h2v1h-2zM31 17h2v1h-2zM4 18h3v1h-3zM9 18h3v1h-3zM13 18h1v1h-1zM15 18h1v1h-1zM17 18h4v1h-4zM22 18h3v1h-3zM27 18h2v1h-2zM32 18h1v1h-1zM5 19h2v1h-2zM9 19h1v1h-1zM11 19h3v1h-3zM16 19h1v1h-1zM18 19h1v1h-1zM20 19h1v1h-1zM25 19h1v1h-1zM28 19h1v1h-1zM6 20h2v1h-2zM10 20h4v1h-4zM16 20h3v1h-3zM20 20h1v1h-1zM24 20h4v1h-4zM32 20h1v1h-1zM6 21h1v1h-1zM9 21h1v1h-1zM11 21h1v1h-1zM13 21h9v1h-9zM23 21h2v1h-2zM26 21h2v1h-2zM30 21h3v1h-3zM4 22h2v1h-2zM7 22h1v1h-1zM10 22h3v1h-3zM19 22h1v1h-1zM21 22h1v1h-1zM23 22h2v1h-2zM29 22h1v1h-1zM32 22h1v1h-1zM6 23h1v1h-1zM9 23h1v1h-1zM12 23h2v1h-2zM17 23h1v1h-1zM19 23h2v1h-2zM24 23h1v1h-1zM26 23h3v1h-3zM4 24h3v1h-3zM8 24h1v1h-1zM10 24h1v1h-1zM12 24h1v1h-1zM15 24h1v1h-1zM17 24h1v1h-1zM19 24h2v1h-2zM23 24h7v1h-7zM31 24h1v1h-1zM12 25h5v1h-5zM19 25h3v1h-3zM23 25h2v1h-2zM28 25h3v1h-3zM32 25h1v1h-1zM4 26h7v1h-7zM12 26h4v1h-4zM17 26h3v1h-3zM21 26h2v1h-2zM24 26h1v1h-1zM26 26h1v1h-1zM28 26h1v1h-1zM32 26h1v1h-1zM4 27h1v1h-1zM10 27h1v1h-1zM14 27h1v1h-1zM18 27h1v1h-1zM20 27h1v1h-1zM22 27h3v1h-3zM28 27h1v1h-1zM32 27h1v1h-1zM4 28h1v1h-1zM6 28h3v1h-3zM10 28h1v1h-1zM13 28h1v1h-1zM16 28h3v1h-3zM20 28h1v1h-1zM23 28h7v1h-7zM32 28h1v1h-1zM4 29h1v1h-1zM6 29h3v1h-3zM10 29h1v1h-1zM14 29h1v1h-1zM18 29h2v1h-2zM22 29h2v1h-2zM25 29h1v1h-1zM28 29h3v1h-3zM32 29h1v1h-1zM4 30h1v1h-1zM6 30h3v1h-3zM10 30h1v1h-1zM12 30h2v1h-2zM15 30h1v1h-1zM17 30h1v1h-1zM19 30h1v1h-1zM22 30h2v1h-2zM25 30h1v1h-1zM28 30h1v1h-1zM31 30h2v1h-2zM4 31h1v1h-1zM10 31h1v1h-1zM15 31h3v1h-3zM19 31h1v1h-1zM22 31h1v1h-1zM24 31h2v1h-2zM28 31h2v1h-2zM4 32h7v1h-7zM12 32h2v1h-2zM15 32h1v1h-1zM17 32h1v1h-1zM19 32h1v1h-1zM24 32h1v1h-1zM27 32h1v1h-1zM29 32h1v1h-1zM32 32h1v1h-1z' };
/** Överst på Om-sidan: QR-kod och en knapp som delar länken till appen. */
function shareHTML() {
  const short = QR.url.replace(/^https:\/\//, '').replace(/\/$/, '');
  return `<div class="share">
      <svg class="qr" viewBox="0 0 ${QR.size} ${QR.size}" role="img" aria-label="${tx('QR-kod till Bliss-glosor', 'QR code for Bliss Vocabulary')}"><rect width="100%" height="100%" fill="#fff"/><path d="${QR.d}" fill="#000"/></svg>
      <div>
        <p class="share-title">${tx('Dela appen', 'Share the app')}</p>
        <p class="small muted">${tx('Skanna koden med mobilkameran.', 'Scan the code with a phone camera.')}</p>
        <p class="share-url">${short}</p>
        <button type="button" class="primary" id="share-app">${tx('Dela länken', 'Share the link')}</button>
      </div>
    </div>`;
}
/** Om-sidan på engelska (samma innehåll som den svenska). */
function aboutEn(lic) {
  return `<section class="panel prose">
    ${shareHTML()}
    <h2>About Bliss Vocabulary</h2>
    <p>Bliss Vocabulary was developed in BlissmAiker, a project funded by the Swedish Inheritance Fund (Allmänna arvsfonden).</p>
    <p>Bliss Vocabulary (Bliss-glosor in Swedish) is a free vocabulary trainer for Blissymbolics. You learn the basic characters first,
      then the words built from them, and review them at ever longer intervals. The English words and explanations are BCI's own.</p>
    <p>Made by John Säbom. The symbols are drawn with BlissEngine by P-O Hedvall and Jonas Paulsson – the drawing engine
      from WinBliss, which BCI has used to standardise the Blissymbols. BlissEngine was created at Furuboda folkhögskola in a project funded by the Swedish Inheritance Fund (Allmänna arvsfonden).</p>
    <p>A big thank you to Håkan Larsson (<a href="mailto:logopedhakan@gmail.com">logopedhakan@gmail.com</a>), who works so hard in the
      Bliss projects and on spreading and developing Bliss.</p>

    <aside class="promo" aria-labelledby="promo-title">
      <div class="promo-kicker">Tip</div>
      <h3 id="promo-title">Blisshuset – Sunderby folkhögskola</h3>
      <p>The Blisshuset association is based at <a href="https://sunderbyfolkhogskola.se" target="_blank" rel="noopener">Sunderby folkhögskola</a>, which also runs Blisskursen – a folk high school course.
        Sunderby folkhögskola also runs the BlissmAiker project together with Furuboda folkhögskola and
        the RISE research institute.</p>
      <p>Blisshuset also offers products with Blissymbols – bracelets, chopping boards, pictures and much more.</p>
      <a class="promo-link" href="https://blisshuset.com" target="_blank" rel="noopener">Visit blisshuset.com</a>
    </aside>

    <h3>Links</h3>
    <div class="links">
      <a class="link-card" href="https://specialneedstoys.com" target="_blank" rel="noopener">
        <b>TFH Special Needs Toys</b>
        <span>Sensory toys and products for people with special needs, for school, care and the home.</span>
        <span class="link-url">specialneedstoys.com</span>
      </a>
      <a class="link-card" href="https://sunderbyfolkhogskola.se" target="_blank" rel="noopener">
        <b>Sunderby folkhögskola</b>
        <span>Home of the Blisshuset association. The school runs Blisskursen and the BlissmAiker project.</span>
        <span class="link-url">sunderbyfolkhogskola.se</span>
      </a>
      <a class="link-card" href="https://furuboda.org" target="_blank" rel="noopener">
        <b>Föreningen Furuboda</b>
        <span>The organisation behind Furuboda folkhögskola, where BlissEngine was created.</span>
        <span class="link-url">furuboda.org</span>
      </a>
    </div>

    <h3>Install as an app</h3>
    <ul>
      <li><b>iPhone and iPad:</b> open the app's web address in Safari, tap the Share button and choose <i>Add to Home Screen</i>.</li>
      <li><b>Android:</b> open the address in Chrome and choose <i>Install app</i> in the menu.</li>
      <li><b>Computer:</b> in Chrome or Edge, click the install icon in the address bar.</li>
    </ul>
    <p>Installed, it also works offline.</p>

    <h3>Information sheet</h3>
    <div class="flyer">
      <div class="flyer-doc" aria-hidden="true"><span>PDF</span></div>
      <div>
        <p>An A4 page with a QR code to the app – to print or pass on. In Swedish.</p>
        <a class="promo-link" href="${FLYER_URL}" target="_blank" rel="noopener">Download the information sheet (PDF, 47 kB, Swedish)</a>
      </div>
    </div>

    <h3>Privacy</h3>
    <p>No data collection, accounts, statistics, ads or cookies. Your progress is stored only on your device –
      use <i>Backup</i> under Settings to move it.</p>

    <h3>The parts of the symbols</h3>
    <p>The parts come from BCI's vocabulary BCI-AV, for example <i>amphibian</i> = animal + water + land. Where BCI's text
      is ambiguous, the text is shown instead of a symbol. The linking has not been reviewed by BCI.</p>

    <h3>Mistakes and suggestions</h3>
    <p>Found a mistake or have a suggestion? Write to</p>
    <p class="contact"><a href="mailto:${CONTACT}?subject=Bliss-glosor" id="contact-addr">${CONTACT}</a>
      <button type="button" class="ghost" id="copy-contact">Copy the address</button></p>
    <p class="small muted">Say which word it concerns.</p>

    <h3>Sources and licences</h3>
    <div class="lic">
      ${lic('The Blissymbols, the BCI-AV vocabulary, glosses and derivations', '© Blissymbolics Communication International (BCI); Blissymbolics © C.K. Bliss', 'CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/')}
      ${lic('Swedish translations of the explanations', 'John Säbom, based on BCI material', 'CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/')}
      ${lic('The BlissEngine drawing engine', '© AnyCom AB – BlissEngine by P-O Hedvall and Jonas Paulsson – the drawing engine from WinBliss (1997–2007), brought to the web in 2026', 'CC BY 4.0', 'https://creativecommons.org/licenses/by/4.0/')}
      ${lic('Word frequencies', 'SUC 3.0 statistics, Språkbanken Text, University of Gothenburg', 'CC BY 4.0', 'https://creativecommons.org/licenses/by/4.0/')}
      ${lic('The Atkinson Hyperlegible typeface', '© 2020 Braille Institute of America', 'SIL Open Font License 1.1', 'https://openfontlicense.org')}
      ${lic('The app’s own code', '© 2026 John Säbom', 'MIT', 'https://opensource.org/license/mit')}
    </div>
    <p style="margin-top:10px">Free to use and share. Anyone building on BCI's material must credit it and share under CC BY-SA 4.0:</p>
    <blockquote>Parts herein © Blissymbolics Communication International (BCI), distributed under the Creative Commons BY-SA 4.0 licence.</blockquote>
    <p class="small muted">More at <a href="https://www.blissymbolics.org" target="_blank" rel="noopener">blissymbolics.org</a>.
      Version ${APP_VERSION}.</p>
  </section>`;
}
function about() {
  const lic = (what, who, name, url) => `<div><b>${what}</b><span class="who">${who}</span> ·
    <a href="${url}" target="_blank" rel="noopener">${name}</a></div>`;
  if (lang() === 'en') { app.innerHTML = aboutEn(lic); return; }
  app.innerHTML = `<section class="panel prose">
    ${shareHTML()}
    <h2>Om Bliss-glosor</h2>
    <p>Bliss-glosor är utvecklat i Allmänna arvsfondens projekt BlissmAiker.</p>
    <p>Bliss-glosor är ett gratis glosprogram för Blissymbolik. Du lär dig först grundtecknen, sedan orden som byggs av dem,
      och repeterar dem med allt längre mellanrum.</p>
    <p>Gjort av John Säbom. Symbolerna ritas med BlissEngine av P-O Hedvall och Jonas Paulsson – ritmotorn ur WinBliss,
      som BCI har använt för att standardisera Blissymbolerna. BlissEngine skapades på Furuboda folkhögskola inom ett projekt med stöd från Allmänna arvsfonden.</p>
    <p>Ett stort tack till Håkan Larsson (<a href="mailto:logopedhakan@gmail.com">logopedhakan@gmail.com</a>), som arbetar så hårt
      i Blissprojekten och med att sprida och utveckla Bliss.</p>

    <aside class="promo" aria-labelledby="promo-title">
      <div class="promo-kicker">Tips</div>
      <h3 id="promo-title">Blisshuset – Sunderby folkhögskola</h3>
      <p>Föreningen Blisshuset finns på <a href="https://sunderbyfolkhogskola.se" target="_blank" rel="noopener">Sunderby folkhögskola</a>, som också driver Blisskursen – en folkhögskolekurs.
        Sunderby folkhögskola driver också projektet BlissmAiker tillsammans med Furuboda folkhögskola och
        forskningsinstitutet RISE.</p>
      <p>Hos Blisshuset finns också produkter med Blissymboler – armband, skärbrädor, tavlor och mycket mer.</p>
      <a class="promo-link" href="https://blisshuset.com" target="_blank" rel="noopener">Besök blisshuset.com</a>
    </aside>

    <h3>Länkar</h3>
    <div class="links">
      <a class="link-card" href="https://tfhsensory.se" target="_blank" rel="noopener">
        <b>TFH Sensory – Sinnesupplevelser för alla</b>
        <span>Sinnesstimulerande produkter för vård, skola, äldreomsorg och hemmet.</span>
        <span class="link-url">tfhsensory.se</span>
      </a>
      <a class="link-card" href="https://sunderbyfolkhogskola.se" target="_blank" rel="noopener">
        <b>Sunderby folkhögskola</b>
        <span>Här finns Föreningen Blisshuset. Skolan driver Blisskursen och projektet BlissmAiker.</span>
        <span class="link-url">sunderbyfolkhogskola.se</span>
      </a>
      <a class="link-card" href="https://furuboda.org" target="_blank" rel="noopener">
        <b>Föreningen Furuboda</b>
        <span>Huvudman för Furuboda folkhögskola, där BlissEngine skapades.</span>
        <span class="link-url">furuboda.org</span>
      </a>
    </div>

    <h3>Installera som app</h3>
    <ul>
      <li><b>iPhone och iPad:</b> öppna appens webbadress i Safari, tryck på Dela-knappen och välj <i>Lägg till på hemskärmen</i>.</li>
      <li><b>Android:</b> öppna adressen i Chrome och välj <i>Installera app</i> i menyn.</li>
      <li><b>Dator:</b> i Chrome eller Edge, klicka på installationsikonen i adressfältet.</li>
    </ul>
    <p>Installerad fungerar den även utan internet.</p>

    <h3>Informationsblad</h3>
    <div class="flyer">
      <div class="flyer-doc" aria-hidden="true"><span>PDF</span></div>
      <div>
        <p>Ett A4 med QR-kod till appen – att skriva ut eller skicka vidare.</p>
        <a class="promo-link" href="${FLYER_URL}" target="_blank" rel="noopener">Ladda ner informationsbladet (PDF, 47 kB)</a>
      </div>
    </div>

    <h3>Integritet</h3>
    <p>Inga uppgifter samlas in – inga konton, ingen statistik, ingen reklam, inga cookies. Framstegen sparas bara på din enhet;
      flytta dem med <i>Säkerhetskopia</i> under Inställningar.</p>

    <h3>Symbolernas delar</h3>
    <p>Delarna kommer ur BCI:s ordförråd BCI-AV, till exempel <i>amfibie</i> = djur + vatten + mark. Där BCI:s text är
      tvetydig visas texten i stället för en symbol. Kopplingen och de svenska översättningarna är inte granskade av BCI.</p>

    <h3>Fel och förslag</h3>
    <p>Hittat ett fel eller har ett förslag? Skriv till</p>
    <p class="contact"><a href="mailto:${CONTACT}?subject=Bliss-glosor" id="contact-addr">${CONTACT}</a>
      <button type="button" class="ghost" id="copy-contact">Kopiera adressen</button></p>
    <p class="small muted">Ange vilket ord det gäller.</p>

    <h3>Källor och licenser</h3>
    <div class="lic">
      ${lic('Blissymbolerna, ordförrådet BCI-AV, glosor och härledningar', '© Blissymbolics Communication International (BCI); Blissymbolics © C.K. Bliss', 'CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/deed.sv')}
      ${lic('Svenska översättningar av förklaringarna', 'John Säbom, byggt på BCI:s material', 'CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/deed.sv')}
      ${lic('Ritmotorn BlissEngine', '© AnyCom AB – BlissEngine av P-O Hedvall och Jonas Paulsson – ritmotorn ur WinBliss (1997–2007), överförd till webben 2026', 'CC BY 4.0', 'https://creativecommons.org/licenses/by/4.0/deed.sv')}
      ${lic('Ordfrekvenser', 'SUC 3.0-statistik, Språkbanken Text, Göteborgs universitet', 'CC BY 4.0', 'https://creativecommons.org/licenses/by/4.0/deed.sv')}
      ${lic('Typsnittet Atkinson Hyperlegible', '© 2020 Braille Institute of America', 'SIL Open Font License 1.1', 'https://openfontlicense.org')}
      ${lic('Glosprogrammets egen kod', '© 2026 John Säbom', 'MIT', 'https://opensource.org/license/mit')}
    </div>
    <p style="margin-top:10px">Fri att använda och sprida. Den som bygger vidare på BCI:s material ska ange källan och dela under CC BY-SA 4.0:</p>
    <blockquote>Parts herein © Blissymbolics Communication International (BCI), distributed under the Creative Commons BY-SA 4.0 licence.</blockquote>
    <p class="small muted">Mer på <a href="https://www.blissymbolics.org/index.php/sv/licensiering" target="_blank" rel="noopener">blissymbolics.org</a>.
      Version ${APP_VERSION}.</p>
  </section>`;
}

/** Dela-menyn där den finns (mobil), annars kopiera länken. */
async function shareApp(t) {
  const title = tx('Bliss-glosor', 'Bliss Vocabulary');
  try {
    if (navigator.share) return await navigator.share({ title, url: QR.url });
  } catch (err) {
    if (err && err.name === 'AbortError') return;   // användaren stängde dela-menyn
  }
  const label = t.textContent;
  try {
    await navigator.clipboard.writeText(QR.url);
    t.textContent = tx('Länken är kopierad', 'Link copied');
  } catch (_) {
    t.textContent = QR.url;   // urklipp nekat: visa adressen så att den kan skrivas av
  }
  setTimeout(() => { t.textContent = label; }, 2500);
}

register('about', {
  render: about,
  top: true,
  click(t) {
    if (t.id === 'share-app') return shareApp(t), true;
    if (t.id !== 'copy-contact') return false;
    // Urklipp kan nekas (vissa inbäddade vyer) – markera då adressen så att den kan kopieras för hand.
    const done = () => { t.textContent = tx('Kopierad', 'Copied'); setTimeout(() => { t.textContent = tx('Kopiera adressen', 'Copy the address'); }, 2000); };
    const select = () => { const r = document.createRange(); r.selectNodeContents(document.getElementById('contact-addr')); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); };
    try { navigator.clipboard.writeText(CONTACT).then(done, select); } catch (_) { select(); }
    return true;
  },
});
})();
