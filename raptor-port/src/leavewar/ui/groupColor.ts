/**
 * The marker colour for a group's swatch (the little square beside a heading).
 *
 * The seven built-in groups and SANS wear CAT-palette colours painted in CSS
 * (`.grp.g-sxo .gsw`, …), so a colour means the same thing here as on the Quals
 * page. A QUALIFICATION group an admin adds has no CAT colour to borrow — left
 * to the CSS default it renders as a dark, broken-looking square (owner, 3 Sep
 * 26 — "its all black now"). Rather than ask the admin to pick a colour (the
 * swatch is only a marker; the heading names the group), we hand each custom
 * group a tidy colour of its own, deterministically, so the list always looks
 * finished and the same qualification keeps the same colour across reloads.
 *
 * Returns a CSS value for a custom group's swatch, or `undefined` for a
 * built-in / SANS / Everyone-else group (whose colour the stylesheet owns).
 * The palette (`--gq-1`…) is defined in matrix.css, so it themes with the rest.
 */
const GQ_COUNT = 6

export function qualSwatch(id: string): string | undefined {
  // Only qualification groups need one: their ids are prefixed `q:` (see
  // `qualGroupId`). Everything else is painted by class in the stylesheet.
  if (!id.startsWith('q:')) return undefined
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return `var(--gq-${(h % GQ_COUNT) + 1})`
}
