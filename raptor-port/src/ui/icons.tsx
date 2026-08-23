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

/** A spreadsheet file: the folded-corner document with a small table inside —
 *  the grid says "Excel" at 16px where lettering would blur to noise. */
export function XlsIcon() {
  return (
    <svg className="btnglyph" viewBox="0 0 24 24" aria-hidden="true" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <rect x="7.5" y="12" width="9" height="6.5" />
      <path d="M7.5 15.25h9M12 12v6.5" />
    </svg>
  )
}

/** A document file with text lines and a download arrow — "get this page as a
 *  document", no lettering for the same at-16px reason as XlsIcon. */
export function PdfIcon() {
  return (
    <svg className="btnglyph" viewBox="0 0 24 24" aria-hidden="true" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M8 12h8M8 15h8" />
      <path d="M12 17v3.5M10 18.5l2 2 2-2" />
    </svg>
  )
}

/** A highlighter marker — the angled chisel-tip pen over a short baseline
 *  stroke (the Lucide "highlighter" shape) — for the Highlight filter's label
 *  and its phone fold toggle: a pen that MARKS things, not a search or an
 *  edit, which is exactly what the chips do to the pucks. */
export function HlIcon() {
  return (
    <svg className="btnglyph" viewBox="0 0 24 24" aria-hidden="true" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 11-6 6v3h9l3-3" />
      <path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4" />
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
