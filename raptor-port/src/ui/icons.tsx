/* Shared inline-SVG glyphs for the toolbar buttons, so the calendar icon has
   ONE definition (the schedule seg, the mobile bar and the board's #sbCal all
   render the same one) and the board's History toggle reads as history rather
   than as a bare clock (owner, 22 Aug 26 — "the left button doesn't look like a
   calendar. the time button doesn't look like a history button"). Both are
   Lucide-style line glyphs sized by `.btnglyph`. */

/** A day-grid calendar: two binding posts, a header divider, and date dots —
 *  unmistakable at 16–20px where a plain rounded rectangle was not. */
export function CalIcon() {
  return (
    <svg className="btnglyph" viewBox="0 0 24 24" aria-hidden="true" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2v4M16 2v4M3 9.5h18" />
      <rect x="3" y="4.5" width="18" height="17" rx="2.5" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 17.5h.01M12 17.5h.01" />
    </svg>
  )
}

/** The standard "history" glyph — a clock with a counter-clockwise arrow — so
 *  the board's History toggle no longer reads as a plain clock. */
export function HistIcon() {
  return (
    <svg className="btnglyph" viewBox="0 0 24 24" aria-hidden="true" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v5h5" />
      <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  )
}
