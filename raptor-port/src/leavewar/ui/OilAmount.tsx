/* GRANT OIL'S ONE AMOUNT CONTROL (his D1392, D1395 H — 26 Oct 26: "for a day that person can also be like granted more than
   1 day of oil", and his ask for a quick select for HO; drawn by scripts/handpass/lw-m3n-draw-ho.mjs, ONLY=h). One Days row:
   two quick picks, "HO · ½" and "FO · 1", then a dashed box for any other amount ("other: 1½, 2…"), then the button naming
   what it gives — "Give HO", "Give FO", "Give FO · 2 days". No morning / afternoon row: which half a granted HO is does not
   matter (D1391); it is drawn in the morning unless the morning is held (store.ts defaultAwardHalf).
   Used by the one-day bid window and the drag window (D1394), so the two cannot drift. */
/* a figure as the grid writes it: halves .5 (D1246) — the picks' own ½ is the drawing's, approved as drawn (D1395) */
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

export function OilAmount({ pick, other, onPick, onOther, onGive, testPrefix = 'oil', err }: {
  pick: OilPick
  other: string
  onPick: (p: OilPick) => void
  onOther: (s: string) => void
  onGive: () => void
  testPrefix?: string
  err?: string
}) {
  const n = oilNumber(oilAmountText(pick, other))
  const lit = (p: OilPick) => !other.trim() && pick === p
  return (
    <div className="bidsheet-row postout oil-amount">
      {/* "Days", not "How many" — the window's Date row already asks how many DATES */}
      <span className="lab">Days</span>
      <span className="oil-picks" role="group" aria-label="Amount">
        <button type="button" className={`pchip${lit('0.5') ? ' on' : ''}`} data-testid={`${testPrefix}-pick-ho`}
          aria-pressed={lit('0.5')} onClick={() => onPick('0.5')}>HO · ½</button>
        <button type="button" className={`pchip${lit('1') ? ' on' : ''}`} data-testid={`${testPrefix}-pick-fo`}
          aria-pressed={lit('1')} onClick={() => onPick('1')}>FO · 1</button>
      </span>
      <input
        type="text" inputMode="decimal" className="oil-num oil-other" maxLength={6}
        data-testid={`${testPrefix}-days`} aria-label="Any other amount, in days" placeholder="other: 1½, 2…"
        value={other} onChange={e => onOther(e.target.value)}
      />
      <button className="dchip approve" data-testid={`${testPrefix}-give`} onClick={onGive}>{oilGiveWords(n)}</button>
      {err && <span className="note warn" data-testid={`${testPrefix}-err`}>{err}</span>}
    </div>
  )
}
