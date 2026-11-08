/* THE APP'S DRAWN MARKS FOR ROUND 4 OF THE CONSISTENCY LOOK ([UI-CONSISTENCY-LOOK], owner D1703, D1704, D1707, 5 Nov 26 —
   "all as recommended", the page https://claude.ai/artifact/Eg1hSt3b17u2oVL2owKLux, version 4). The typed marks the
   Scheduler Board, the Leave War and the settings buttons carried (⚙ ⇅ ▤ ◧ ↺ 📱 🖥) become line drawings in the app's style
   (a 24-unit box, a 2-wide line, round ends — ui/icons.tsx), each in its button's own colour, so every device draws them
   alike. One source, as the pencil's (ui/pen.ts): each drawing's shapes are here, fed to the React icons (`ui/icons.tsx`)
   and, as markup, to the builders that print a button as text (`glyphSvg` — the waves menu's gear, a section's Auto sort).
   The shapes are the approved drawing's own (`scripts/handpass/cr4-look.mjs` ICON); the Tracker draws the React icons too
   (`tracker/components/Glyphs.jsx` — the copies it kept for a standalone export went with [TRK-KEPT-COPIES], 8 Nov 26,
   D1538). */

/** The one settings gear (D1509 — the Leave War's own; D1707 — in its button's colour, the Leave War's grey as today). */
export const GEAR_INNER = '<circle cx="12" cy="12" r="3"/>'
  + '<path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>'

/** Reorder — two arrows passing, the Tracker's own (D1135): every ⇅ — Sort all, Auto sort, Rearrange the grid, Done (D1703). */
export const REORDER_INNER = '<path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/>'

/** Templates — a page of blocks (D1703, in place of ▤). */
export const TEMPLATES_INNER = '<rect x="3" y="3" width="18" height="7" rx="1.5"/><rect x="3" y="14" width="9" height="7" rx="1.5"/>'
  + '<rect x="16" y="14" width="5" height="7" rx="1.5"/>'

/** Reset — an arrow turning back (D1703: the Leave War's Reset order; D1705: the Tracker's Reset layout). History's mark
 *  without its clock, and it means one thing, "put back" (D1700's reading). */
export const RESET_INNER = '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>'

/** The phone board's layout switch — a phone, and a screen (D1703, in place of 📱 / 🖥, which an iPhone draws in colour). */
export const PHONE_INNER = '<rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M11 18h2"/>'
export const DESKTOP_INNER = '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>'

/** OIL's own mark — a ticket, a day off held (D1704): the board's OIL Earn and the Leave War's OIL tab alike, so a clock
 *  means History only (D1700 — his catch: OIL Earn had been drawn with History's clock beside it). */
export const TICKET_INNER = '<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>'
  + '<path d="M13 5v2M13 17v2M13 11v2"/>'

/** A drawing as markup, for the HTML-string builders. `cls` sizes it where it stands. */
export function glyphSvg(inner: string, cls = 'btnglyph'): string {
  return `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"`
    + ` stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`
}

/** The Inputs calendar's "Show every input" and "Show the month compact" (owner D1792 (b), 8 Nov 26 — the pictures round's
 *  question 13, "All as recommended"; drawn by scripts/handpass/pr-marks.mjs r5b, ICON.expand / ICON.compact): arrows out
 *  to two corners, and arrows in from them, in place of the typed ⤢ / ⤡. A departure named to him with the drawing: the
 *  typed ⤡ pointed OUT on the other slant, saying nothing of "smaller"; the drawn one points in. */
export const EXPAND_INNER = '<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>'
  + '<line x1="21" x2="14" y1="3" y2="10"/><line x1="3" x2="10" y1="21" y2="14"/>'
export const COMPACT_INNER = '<polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/>'
  + '<line x1="14" x2="21" y1="10" y2="3"/><line x1="3" x2="10" y1="21" y2="14"/>'
