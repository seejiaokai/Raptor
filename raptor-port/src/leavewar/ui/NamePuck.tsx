/* THE LEAVE WAR'S NAME, DRAWN AS THE SCHEDULE'S OWN PUCK (his D1468–D1471, D1476 — 28 Oct 26, [LW-NAME-PUCKS]).
   The name and its chip are one puck, in the markup and classes the schedule's puck uses (`ui/html.ts puck()`, the one
   the Approvals list draws): `.puck` (`.r` for a WSO, `.pers` for ground personnel — D1476, the schedule's colours, not
   the darker bars of 4 Sep 26) holding `.nm` and the chip as its square `.role` end. The chip keeps the war's own colour
   (`catClass` — an SXO's gold, an instructor's purple, D1468) and its hover / tap that lists the qualifications on the
   page; an OCU man's chip reads the schedule's "O" (D1469, from the schedule's own chip table — one source), ground
   personnel's "G" (D1470 — the schedule's ground-crew puck has no chip, so this one is the Leave War's addition).
   ONE drawer for both places the grid draws a name — the row (`MatrixRows.tsx`) and the phone's frozen copy of it
   (`Matrix.tsx`) — so the two cannot drift. The OIL tracker's name list keeps its own badge: his ruling covers the grid. */
import { QCHIP } from '../../engine/people'
import { catClass, catText, type Person } from '../engine'

/** The chip's words: the schedule's own letter where it has one ("O" for OCU), "G" for ground personnel (D1470). */
export function chipText(p: Person): string {
  if (p.pers || p.seat === 'gnd') return 'G'
  const t = catText(p)
  return (QCHIP as Record<string, string>)[t] ?? t
}

export function NamePuck({ p, quals, testid, onChipEnter, onChipLeave, onChipClick }: {
  p: Person
  /** the displayed qualifications he holds; none makes the chip inert */
  quals: { label: string }[]
  testid?: string
  onChipEnter: (el: HTMLElement) => void
  onChipLeave: () => void
  onChipClick: (el: HTMLElement) => void
}) {
  const has = quals.length > 0
  const gnd = !!p.pers || p.seat === 'gnd'
  const cls = 'puck' + (p.seat === 'wso' ? ' r' : '') + (gnd ? ' pers' : '')
  return (
    <span className={cls}>
      <span className="nm">{p.callsign}</span>
      <span
        className={`role lw-chip ${catClass(p)}${has ? ' has-quals' : ''}`}
        data-testid={testid}
        aria-label={has ? `${p.callsign} qualifications: ${quals.map(q => q.label).join(', ')}` : undefined}
        onPointerEnter={has ? e => { if (e.pointerType === 'mouse') onChipEnter(e.currentTarget) } : undefined}
        onPointerLeave={has ? e => { if (e.pointerType === 'mouse') onChipLeave() } : undefined}
        // the click is swallowed so it never also opens the window the name owns; a second tap on the same chip closes
        // the list (a phone has no pointer to leave with), a tap on another chip moves it there
        onClick={has ? e => { e.stopPropagation(); onChipClick(e.currentTarget) } : undefined}
      >{chipText(p)}</span>
    </span>
  )
}
