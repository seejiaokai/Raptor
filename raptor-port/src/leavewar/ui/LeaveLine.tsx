/* THE SHARED ONE-LINE LEAVE ROW (the Leave War overhaul's M3, 6.3 — red-team fix A1; D1217, D1246; his design lessons 20,
   25, 29): puck · the kind's box as the grid draws it (look F: filled approved, hollow dashed pending — D1175) · the dates
   of its run · the days · the state. Built once here; the day panel draws it, and the person window (M5) will. Never a
   remark (D1143). The puck is the schedule's own (`sync.ts puckHtml` — never a look-alike, lesson 25). */

import { boxText, kindOf } from '../engine'
import { puckHtml } from '../sync'
import { spanInYear } from './dates'

/* a run in one month says its month once — "26 – 28 Jan"; across months each day its month; across a year's end, whole */
function runWords(from: string, to: string): string {
  if (from !== to && from.slice(0, 7) === to.slice(0, 7)) return `${Number(from.slice(8, 10))} – ${spanInYear(to, to)}`
  return spanInYear(from, to)
}

const fig = (n: number) => String(Math.round(n * 2) / 2)

export function LeaveLine({ personId, callsign = '', code, state, from, to, days, testid }: {
  personId: string
  /** his callsign, where the roster draws no puck for him */
  callsign?: string
  code: string
  state: 'approved' | 'pending' | 'una'
  from: string
  to: string
  days: number
  testid?: string
}) {
  return (
    <div className="ll-row" data-testid={testid}>
      <span className="ll-puck" aria-hidden="true" dangerouslySetInnerHTML={{ __html: puckHtml(personId, callsign) }} />
      <span className={`c k-${kindOf(code)} s-${state === 'pending' ? 'w' : 'a'} ll-box`}>{boxText(code)}</span>
      <span className="ll-dates">{runWords(from, to)}</span>
      <span className="ll-days">{fig(days)}</span>
      {/* a UNA's box says what it is (D1338); no state word beside it */}
      <span className={`ll-state${state === 'pending' ? ' pend' : ''}`}>{state === 'approved' ? 'Approved' : state === 'pending' ? 'Pending' : ''}</span>
    </div>
  )
}
