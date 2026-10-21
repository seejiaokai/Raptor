/* THE APP'S ONE PENCIL (owner D1134, 21 Oct 26 — "can u make sure u use the same icon designs i like this pencil
   better", sent with a picture of the typed ✎ as his PC draws it). Every pencil a person presses is this one drawing:
   solid, the eraser cap at the top left, the tip at the bottom right (D1133's direction). It is DRAWN, never the typed
   ✎ (each device's font draws its own, so his iPhone would differ) and never ✏ (an iPhone draws it as a coloured
   emoji). One source: `PEN_INNER` feeds the React icon (`ui/icons.tsx PenIcon`) and the string the dense builders
   print (`penSvg`); the Tracker keeps its own copy (`tracker/components/Glyphs.jsx PenGlyph`) so a standalone export
   carries it. Drawn as an upright pencil — cap, body, tip, each a little apart — then turned 45° so it lies as the ✎
   does. Sized by `.pen-ic` (02-shell.css): 1.05em, a small gap before a following word; `.pen-ic.solo` drops the gap
   where the pencil is the button's only mark. */
export const PEN_INNER = '<g transform="rotate(-45 12 12)" fill="currentColor">'
  + '<rect x="9" y="1" width="6" height="4.2" rx="1.6"/>'
  + '<rect x="9" y="6.3" width="6" height="11.2" rx=".4"/>'
  + '<path d="M9 18.7h6l-2.4 3.7a.7.7 0 0 1-1.2 0Z"/>'
  + '</g>'

/** The pencil as markup, for the HTML-string builders. `solo` when it is the button's only mark. */
export function penSvg(solo = false): string {
  return `<svg class="pen-ic${solo ? ' solo' : ''}" viewBox="0 0 24 24" aria-hidden="true">${PEN_INNER}</svg>`
}
