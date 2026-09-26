/* THE POSTING'S FOUR CHIPS — one row, every posting door ([POST-OUT-OUTCOMES], 27 Sep 26).

   Owner D229 (26 Sep 26): a posting out says WHICH it is. D294 (27 Sep): "can use less words and space to have these 4
   options. Change to 'Overseas Sqn', 'Fully delete', 'SANS', 'Transfer to Sqn'"; D298: "Fully delete" reads "Delete".
   D300: each thing said once — the date in its own box, ONE line saying what happens on it, the button just "Post out".
   The approved mock-up is the contract (docs/mock/post-out.html §1). The same row on the three doors: the bid sheet's
   PO, an existing posting's Post out sheet, the drag selection's PO.

   The agent's calls, on his look card: tapping the chosen chip again un-chooses it — "off the manpower, nothing else"
   (the old switch turned off, and the one way to record a transfer until Transfer is built); "Transfer to Sqn" is drawn
   and not pressable ("Comes with the shared database" — D281). */
import type { PostOutcome } from '../engine'

export const OUTCOME_CHIPS: { v: PostOutcome | 'transfer'; l: string }[] = [
  { v: 'overseas', l: 'Overseas Sqn' },
  { v: 'delete', l: 'Delete' },
  { v: 'sans', l: 'SANS' },
  { v: 'transfer', l: 'Transfer to Sqn' },
]
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
/* "14 Oct" — the approved line's own date voice */
export const dayMon = (iso: string): string => (/^\d{4}-\d{2}-\d{2}$/.test(iso) ? `${Number(iso.slice(8, 10))} ${MON[Number(iso.slice(5, 7)) - 1]}` : '')
/* THE ONE LINE — what the chosen outcome does on the date (D300's words, the approved picture); '' with no date */
export function outcomeLine(outcome: PostOutcome, poDate: string, hasAccount: boolean): string {
  const day = dayMon(poDate)
  if (!day) return ''
  switch (outcome) {
    case 'overseas': return `On ${day}: archived on Quals${hasAccount ? ', account suspended' : ''}.`
    case 'delete': return `On ${day}: deleted${hasAccount ? ' with his account' : ''}. Days he flew keep his puck.`
    case 'sans': return `On ${day}: becomes SANS.`
    default: return `On ${day}: off the manpower, nothing else.`
  }
}

export function OutcomeChips({ value, onChange, testid }: {
  value: PostOutcome
  onChange: (o: PostOutcome) => void
  /** the chips' test-id stem — `${testid}-overseas` … */
  testid: string
}) {
  return (
    <div className="bidsheet-row postout po-outcomes" role="group" aria-label="Posting">
      <span className="lab">Posting</span>
      {OUTCOME_CHIPS.map(c => {
        const later = c.v === 'transfer'
        const on = !later && value === c.v
        return (
          <button key={c.v} type="button" className={`pchip${on ? ' on' : ''}`} data-testid={`${testid}-${c.v}`}
            aria-pressed={on} disabled={later} title={later ? 'Comes with the shared database' : undefined}
            onClick={() => { if (!later) onChange(on ? 'none' : (c.v as PostOutcome)) }}>
            {on ? '✓ ' : ''}{c.l}
          </button>
        )
      })}
    </div>
  )
}
