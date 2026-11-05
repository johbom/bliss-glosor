/**
 * Kommunikationstavlan (src/ui/tavla.js): man pekar på Bliss-symboler och får en svensk (eller engelsk)
 * mening som kan läsas upp – så som Bliss-användare själva kommunicerar. Här finns tavlans ord och
 * texten som meningen blir. Bara BCI-AV:s egna symboler och glosor; inget böjs eller hittas på –
 * texten är glosorna i den ordning man valt dem ("jag vilja äta").
 */
(() => {
const { deck, mineCards, lang } = window.Glosor;
const L = (sv, en) => (lang() === 'en' ? en : sv);

// Grupperna på tavlan, med BCI-id. Ordningen inom en grupp är den som visas.
const BOARD = [
  { key: 'viktigt', name: ['Viktigt', 'Important'], ids: [
    14916, 18465, 18035, 15733, 15654, 17268, 14704, 18294, 15722, 17533, 14702, 24844, 14463, 12615, 15210, 12639, 13114, 15702] },
  { key: 'gora', name: ['Göra', 'Do'], ids: [
    13906, 13882, 17009, 18031, 13383, 16747, 14692, 16728, 13860, 14685, 13131, 14440, 16200, 15922, 15400, 16465, 13873,
    18285, 16990, 13631, 16699, 16995, 17249, 16496, 13099, 18038, 16969, 12913, 16509, 17772] },
  { key: 'personer', name: ['Personer', 'People'], ids: [14916, 18465, 15662, 14157, 12909, 16994, 14401, 13166] },
  { key: 'kanslor', name: ['Känslor', 'Feelings'], ids: [14676, 16702, 12377, 12347, 27146, 15955, 16973, 14912, 17719, 14463, 12615] },
  { key: 'mat', name: ['Mat', 'Food'], ids: [
    14377, 18209, 15468, 12895, 23196, 14405, 12405, 12623, 13373, 17511, 14406, 14921, 22376, 13157, 16726, 16192, 17218,
    16230, 15444, 14189, 22371, 20526, 12898, 15405, 17468, 14442, 22578, 13690, 17233, 14389] },
  { key: 'saker', name: ['Saker och platser', 'Things and places'], ids: [
    14885, 16734, 17747, 12637, 12649, 13366, 13371, 15961, 28080, 16959, 12621, 17763, 12875, 17518, 15679, 17519, 23447,
    23223, 18273, 15942, 13121, 13089, 17767, 12834, 12357] },
  { key: 'fragor', name: ['Frågor och småord', 'Questions and little words'], ids: [
    18231, 18244, 18237, 18235, 14907, 18249, 14708, 17707, 14932, 15918, 17739, 14403, 18267, 12374, 17983, 13869, 12350,
    12835, 15221, 24011] },
];

/** Orden i en grupp (Mina ord: de egna orden). Ord som saknas i kortleken hoppas över. */
function boardWords(key) {
  if (key === 'mina') return mineCards();
  return (BOARD.find((g) => g.key === key)?.ids || []).map((id) => deck.get(id)).filter(Boolean);
}
/** Etiketten under symbolen: ordet utan BCI:s förtydligande i parentes ("vad (fråga)" -> "vad"). */
function boardLabel(c) {
  let w = c.word, prev;
  do { prev = w; w = w.replace(/\s*-?\([^()]*\)\s*$/, ''); } while (w !== prev);
  return lang() === 'en' && c.v.c === 'RED' ? w.replace(/^to /, '') : w;
}
/** Meningen som text: orden i vald ordning, stor bokstav först, frågetecken om en frågesymbol ingår. */
function boardText(ids) {
  const cs = ids.map((id) => deck.get(+id)).filter(Boolean);
  if (!cs.length) return '';
  const t = cs.map(boardLabel).join(' ');
  const q = cs.some((c) => /-\(question\)/.test(c.v.en));
  return t.charAt(0).toUpperCase() + t.slice(1) + (q ? '?' : '.');
}
const boardGroups = () => [...BOARD.map((g) => ({ key: g.key, name: L(...g.name) })), { key: 'mina', name: L('Mina ord', 'My words') }];

Object.assign(window.Glosor, { BOARD, boardWords, boardLabel, boardText, boardGroups });
})();
