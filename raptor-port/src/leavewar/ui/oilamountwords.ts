/* GRANT OIL'S AMOUNT, READ AND SAID — the plain helpers of the one amount control (OilAmount.tsx, whose head comment says
   what the row is and why), moved here so that file exports only its component (React's quick reload keeps a component's
   state only in a file of components). */

/* a figure as the grid writes it: halves .5 (D1246); the half-day pick reads "HO · 0.5", never ½ (his D1397) */
const halfFigure = (n: number) => String(n)   // never rounded: the button says exactly what is typed

export type OilPick = '0.5' | '1' | ''

/** a typed amount read as a number — "1½" and "1.5" alike; NaN where it is not a number */
export function oilNumber(s: string): number {
  const t = s.trim().replace(/\s+/g, '').replace(/½$/, '.5').replace(/^\.5$/, '0.5')
  return t ? Number(t) : NaN
}
/** the amount the row stands for: the typed box when it holds anything, else the lit pick */
export function oilAmountText(pick: OilPick, other: string): string {
  return other.trim() ? other : pick
}
/** where a row opens for a stored amount: half a day and a day as their picks, any other amount in the box */
export function oilStart(days: number | null | undefined): { pick: OilPick; other: string } {
  if (days == null || days === 1) return { pick: '1', other: '' }
  if (days === 0.5) return { pick: '0.5', other: '' }
  return { pick: '', other: halfFigure(days) }
}
/** what the button says before it is pressed: under a day an HO, a day an FO, more than a day the FO and its days */
export function oilGiveWords(n: number): string {
  if (Number.isFinite(n) && n > 0 && n < 1) return 'Give HO'
  if (Number.isFinite(n) && n > 1) return `Give FO · ${halfFigure(n)} days`
  return 'Give FO'
}
