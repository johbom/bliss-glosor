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
/** Om-sidan på engelska (samma innehåll som den svenska). */
function aboutEn(lic) {
  return `<section class="panel prose">
    <h2>About Bliss Vocabulary</h2>
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
      use <i>Backup</i> under Overview to move it.</p>

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
    <h2>Om Bliss-glosor</h2>
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
      flytta dem med <i>Säkerhetskopia</i> under Översikt.</p>

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

register('about', {
  render: about,
  top: true,
  click(t) {
    if (t.id !== 'copy-contact') return false;
    // Urklipp kan nekas (vissa inbäddade vyer) – markera då adressen så att den kan kopieras för hand.
    const done = () => { t.textContent = tx('Kopierad', 'Copied'); setTimeout(() => { t.textContent = tx('Kopiera adressen', 'Copy the address'); }, 2000); };
    const select = () => { const r = document.createRange(); r.selectNodeContents(document.getElementById('contact-addr')); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); };
    try { navigator.clipboard.writeText(CONTACT).then(done, select); } catch (_) { select(); }
    return true;
  },
});
})();
