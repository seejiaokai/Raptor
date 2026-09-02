/**
 * The marker colour of a QUALIFICATION group — its swatch beside the heading,
 * and the pill it shows as in a person's quals popover.
 *
 * The seven built-in groups and SANS wear CAT-palette colours painted in CSS
 * (`.grp.g-sxo .gsw`, …), so a colour means the same thing here as on the
 * Quals page. A qualification group an admin adds has no CAT colour to borrow,
 * so the admin PICKS one from this palette when they add it (owner, 3 Sep 26 —
 * "allow me to pick the colour i want"); the pick is stored per group id
 * (`groupColors`, store.ts). Until they pick — and for any stored group with no
 * pick — the group is handed a palette colour deterministically by its id, so
 * the list never shows the dark, broken-looking default square it once did
 * ("its all black now").
 *
 * Twelve mid-tone colours that read apart from each other and from every CAT
 * colour on the dark grid. Hex, not CSS vars: the pill's TEXT colour is chosen
 * by luminance (`inkFor`), which needs the number.
 */
export const PALETTE: readonly string[] = [
  '#E672A6', '#7BC043', '#E8823B', '#6C7BE0', '#B056C9', '#4FBFB0',
  '#F2C14E', '#5AA9E6', '#D95F5F', '#9BC53D', '#C08BE0', '#8FD3C2',
]

/** Only qualification groups take a picked colour: their ids are prefixed
 *  `q:` (see `qualGroupId`). Everything else is painted by class in the
 *  stylesheet and has no swatch to pick. */
export function isColourable(id: string): boolean {
  return id.startsWith('q:')
}

/** The FALLBACK colour for a qualification group with no pick — the same one
 *  every time for a given id. `undefined` for a built-in / SANS / Everyone-else
 *  group, whose colour the stylesheet owns. */
export function qualSwatch(id: string): string | undefined {
  if (!isColourable(id)) return undefined
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return PALETTE[h % PALETTE.length]
}

/** The colour a qualification group shows: the admin's pick when there is
 *  one, else the fallback. `stored` is the store's `groupColors`. */
export function groupColorOf(id: string, stored: Readonly<Record<string, string>>): string | undefined {
  if (!isColourable(id)) return undefined
  return stored[id] ?? qualSwatch(id)
}

/** Dark or light text over a colour, so a pale pill (yellow) carries dark
 *  words and a deep one (indigo) carries light — plain relative luminance,
 *  the same cut the CAT chips use by hand in the stylesheet. */
export function inkFor(hex: string): string {
  const m = /^#([0-9a-f]{6})$/i.exec(hex)
  if (!m) return '#F1F4F7'
  const n = parseInt(m[1], 16)
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
  return lum > 0.6 ? '#12161b' : '#F1F4F7'
}
