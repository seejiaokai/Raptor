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
import { catClass, catText, outcomeOf, type Person } from '../engine'

/** The chip's words: the schedule's own letter where it has one ("O" for OCU), "G" for ground personnel (D1470). */
function chipText(p: Person): string {
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
  /* EVERY SANS MAN WEARS THE SANS PURPLE LINE (his D1697, D1698, 5 Nov 26 — the drawing docs/mock/2026-11-05-taken-back-sans/,
     pictures 1–4): the schedule's own SANS class (`.puck.san` — the purple line on the right, over the chip's last points,
     D651), for a SANS man in the SANS group and for a man posted out as SANS, from when the posting is set — in his old
     place with SANS off the war (D283), where the separate "SANS" tag it replaces squeezed his callsign to one letter on a
     phone (D1692). One drawer, so the row and the phone's frozen copy cannot differ. */
  const san = !!p.san || (p.to !== null && outcomeOf(p) === 'sans')
  const cls = 'puck' + (p.seat === 'wso' ? ' r' : '') + (gnd ? ' pers' : '') + (san ? ' san' : '')
  return (
    <span className={cls}>
      <span className="nm">{p.callsign}</span>
      {/* the line is drawing only: a screen reader hears "SANS" with the name, as it heard the old tag (the code read's 3) */}
      {san && <span className="lw-sr"> SANS</span>}
      {/* eslint-disable-next-line react-doctor/click-events-have-key-events, react-doctor/no-static-element-interactions -- the chip sits inside the name's own button (the row's one Tab stop, which opens his person window), where a control of its own is not allowed; the qualifications it lists are read out as part of that button's name, from the chip's label */}
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
