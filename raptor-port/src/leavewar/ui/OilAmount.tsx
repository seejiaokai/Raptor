/* GRANT OIL'S ONE AMOUNT CONTROL (his D1392, D1395 H — 26 Oct 26: "for a day that person can also be like granted more than
   1 day of oil", and his ask for a quick select for HO; drawn by scripts/handpass/lw-m3n-draw-ho.mjs, ONLY=h). One Days row:
   two quick picks, "HO · 0.5" and "FO · 1", then a dashed box for any other amount ("other: 1.5, 2…"), then the button naming
   what it gives — "Give HO", "Give FO", "Give FO · 2 days". No morning / afternoon row: which half a granted HO is does not
   matter (D1391); it is drawn in the morning unless the morning is held (store.ts defaultAwardHalf).
   Used by the one-day bid window and the drag window (D1394), so the two cannot drift. */
import { oilAmountText, oilGiveWords, oilNumber, type OilPick } from './oilamountwords'

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
          aria-pressed={lit('0.5')} onClick={() => onPick('0.5')}>HO · 0.5</button>
        <button type="button" className={`pchip${lit('1') ? ' on' : ''}`} data-testid={`${testPrefix}-pick-fo`}
          aria-pressed={lit('1')} onClick={() => onPick('1')}>FO · 1</button>
      </span>
      <input
        type="text" inputMode="decimal" className="oil-num oil-other" maxLength={6}
        data-testid={`${testPrefix}-days`} aria-label="Any other amount, in days" placeholder="other: 1.5, 2…"
        value={other} onChange={e => onOther(e.target.value)}
      />
      <button className="dchip approve" data-testid={`${testPrefix}-give`} onClick={onGive}>{oilGiveWords(n)}</button>
      {err && <span className="note warn" data-testid={`${testPrefix}-err`}>{err}</span>}
    </div>
  )
}
