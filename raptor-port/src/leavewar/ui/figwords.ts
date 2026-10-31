// How a figure is written — the two-line figure box (ui/FigureCell.tsx) and every other surface that writes one. Kept out
// of FigureCell.tsx so that file exports only components (React Doctor's only-export-components, D1534). It imports
// nothing, so any screen can read it without pulling another in.

// The rows' own title-tooltip text (MatrixRows.tsx PersonRow) reads a figure's top number the same way as the box, and
// a second copy of this rounding rule would be a drift seam waiting to happen.
export const show = (n: number) => String(Math.round(n * 10) / 10)

/** A FIGURE AS EVERY SURFACE WRITES IT: halves .5 (D1246), a minus sign, never a hyphen. The one helper — the Balances page,
 *  the person window, the grid's figure beside a name and the below-zero ask all write a figure through it (walker D's
 *  FAIL 5, 29 Oct 26: the grid's figure and the ask drew "-2" where every other surface drew "−2"). It lives in this small
 *  module, which imports no screen, so the bid windows' ask can read it without pulling the Balances page in. */
export const figWords = (n: number) => { const r = Math.round(n * 2) / 2; return (r < 0 ? '−' : '') + String(Math.abs(r)) }
