# Licenser för Bliss-glosor

Bliss-glosor är fritt och gratis att använda, kopiera och sprida. Appen består
av delar med olika upphovspersoner och licenser. Den som sprider appen eller
bygger vidare på den behöver följa villkoren för varje del – i korthet: **ange
källorna nedan, och dela det som bygger på BCI:s material under samma licens
(CC BY-SA 4.0)**.

| Del | Filer | Upphov | Licens |
|---|---|---|---|
| Blissymbolerna, ordförrådet BCI-AV, de svenska glosorna och härledningarna | `src/vendor/bliss-data.js`, `src/vendor/bliss-derivations.js`, `icons/` | © Blissymbolics Communication International (BCI); Blissymbolics © C.K. Bliss 1949, 1965 | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.sv) |
| Svenska översättningar av härledningarnas förklaringar | `data/forklaringar-sv.json` (inbakad i `src/vendor/bliss-derivations.js`) | Bliss-glosors upphovspersoner, byggt på BCI:s material | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.sv) |
| Ritmotorn (port av WinBliss) | `src/vendor/bliss-shapes.js`, `src/vendor/bliss-engine.js` | © AnyCom AB / P-O Hedvall | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.sv) |
| Ordfrekvenser (ordningen inom en nivå) | inbakade i `src/vendor/bliss-derivations.js` | SUC 3.0-statistik, Språkbanken Text, Göteborgs universitet | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.sv) |
| Typsnittet Atkinson Hyperlegible | `fonts/` | © 2020 Braille Institute of America, Inc. | [SIL Open Font License 1.1](fonts/OFL.txt) |
| Glosprogrammets egen kod | `glosor.html`, `src/glosor.js`, `glosor-sw.js`, `glosor.webmanifest`, `scripts/build-*.js` | Bliss-glosors upphovspersoner | [MIT](LICENSE) |

## BCI:s källhänvisning

BCI ber att material ur BCI-AV anges med följande rad (licensvillkor enligt
[blissymbolics.org → licensiering](https://www.blissymbolics.org/index.php/sv/licensiering)):

> Parts herein © Blissymbolics Communication International (BCI), distributed
> under the Creative Commons BY-SA 4.0 licence.

## Om härledningarna

Vilka delar en symbol består av kommer ur BCI-AV:s egen härledningskolumn.
Delarna kopplas till symboler strikt efter BCI:s data; där BCI:s namn inte
entydigt pekar ut en symbol visas BCI:s text i stället. Kopplingen och de
svenska översättningarna är projektets arbete och inte granskade av BCI.
Rapportera gärna fel till **john.sabom@gmail.com**.
