/* THE BID WINDOWS' LEAVE BUTTONS (the Leave War overhaul's M3, batch 5 — one piece for the one-day window and the
   drag-selection window, D264 / D331's one format):
   · 5.2 — each button reads its code and what is left NOW (D1144, D1153: the figure the grid's balance column shows;
     halves ".5", never "½" — D1246); a kind that spends nothing shows no figure; a negative one in the app's red;
   · 5.3 — each in its kind's colour (D1183, look F — D1175), the grid's own kinds and fills (matrix.css `.c.k-…`), so a
     button looks like the box it places; at 0 or below it keeps its colour, dimmed, and stays pressable;
   · 5.4 — filled (the approved look) while an admin's "Approve what I enter" is ticked, hollow and dashed (the pending
     look) otherwise — a member's always hollow (red-team fix A8);
   · 5.6 — two even rows of four (red-team fix A9; his design lesson 28).
   The tap still writes through the window's own `write` (its below-zero ask stays as built — D418). */

import { displayCell, formatCell, LEAVE_TYPES, type Portion } from '../engine'
import { kindOf } from '../engine/codes'

const fig = (n: number) => String(Math.round(n * 2) / 2).replace('-', '−')

export function LeaveButtons({ portion, onPick, figure, filled, lit = null, testPrefix = 'bid' }: {
  portion: Portion
  onPick: (code: string) => void
  /** what is left of the balance this leave spends, now — null where it spends nothing (or the window names no one man) */
  figure?: (code: string) => number | null
  /** the approved look (an admin placing with "Approve what I enter" ticked) — else the pending look */
  filled: boolean
  /** the leave the day already holds (round 3's change 7, his Q6): its button wears the window's ring, the cyan of a
   *  chosen thing — a ring, so its own colour still says its kind */
  lit?: string | null
  /** the windows' own test names: `bid-LL` on the one-day window, `sel-LL` on the drag-selection window */
  testPrefix?: string
}) {
  return (
    <div className="lv-grid" data-testid="bid-leave-grid">
      {LEAVE_TYPES.map(t => {
        const code = formatCell({ type: t.type, portion })
        const f = figure ? figure(code) : null
        return (
          <button
            key={t.type}
            data-testid={`${testPrefix}-${t.type}`}
            className={`tchip lv k-${kindOf(t.type)} ${filled ? 's-a' : 's-w'}${f !== null && f <= 0 ? ' lv-dim' : ''}${lit === t.type ? ' lit' : ''}`}
            aria-current={lit === t.type ? 'true' : undefined}
            title={t.label}
            onClick={() => onPick(code)}
          >
            {/* the chip says what the BOX will say — `<LL`, `LL>` — while the write still speaks the stored grammar */}
            <span className="lv-code">{displayCell(code)}</span>
            {f !== null && <span className={`lv-fig${f < 0 ? ' lv-neg' : ''}`} data-testid={`${testPrefix}-${t.type}-left`}>{fig(f)}</span>}
          </button>
        )
      })}
    </div>
  )
}

/* ROUND 2 — A COURSE AND AN OVERSEAS DUTY (his D1299, D1318, D1326; drawn by scripts/handpass/lw-round2-odcrs.mjs): the
   first two places of the row under the leaves, UNA the third (an admin's — below), the ⋯ the fourth. Each is filed
   straight as the input it is (`store.ts fileStraight`), so it wears the filled look and no figure — it stands at once
   and spends nothing. A member sees them on his own row too, open for bidding or not (D1318 "it can go anytime"). */
export const DUTY_KINDS: readonly { code: string; title: string }[] = [
  { code: 'CSE', title: 'Course' },
  { code: 'OD', title: 'Overseas duty' },
]
/* UNA — OUT OF THE MANNING (his D1338, 24 Oct 26 — "its admin input only"): the THIRD place of the row, an admin's alone (a
   member's third place is empty), filled deep teal like the box it places, no figure. A tap places it at once — the
   window's Duration (whole day, AM or PM) and Remarks, on the day, the range or every cell picked — as the war's own
   record (`store.ts placeUna`), never an input. */
export function UnaButton({ onPlace, testPrefix = 'bid' }: { onPlace: () => void; testPrefix?: string }) {
  return (
    <button type="button" data-testid={`${testPrefix}-una`} className="tchip lv k-una s-a"
      title="UNA: unavailable, out of the manning — placed at once" onClick={onPlace}>
      <span className="lv-code">UNA</span>
    </button>
  )
}
export function DutyButtons({ onFile, testPrefix = 'bid' }: { onFile: (code: string) => void; testPrefix?: string }) {
  return (
    <>
      {DUTY_KINDS.map(k => (
        <button
          key={k.code}
          type="button"
          data-testid={`${testPrefix}-file-${k.code}`}
          className={`tchip lv k-${kindOf(k.code)} s-a`}
          title={`${k.title}: filed at once, as on the Inputs page`}
          onClick={() => onFile(k.code)}
        >
          <span className="lv-code">{k.code}</span>
        </button>
      ))}
    </>
  )
}
