/* THE SHARED ONE-LINE LEAVE ROW (the Leave War overhaul's M3, 6.3 — red-team fix A1; D1217, D1246; his design lessons 20,
   25, 29): puck · the kind's box as the grid draws it (look F: filled approved, hollow dashed pending — D1175) · the dates
   of its run · the days · the state. Built once here; the day panel draws it, and the person window does (M5a). Never a
   remark (D1143). The puck is the schedule's own (`sync.ts puckHtml` — never a look-alike, lesson 25).

   IN THE PERSON WINDOW (M5a — D1480, D1327, D1328, D1231; `noPuck`): the line is his own, so it carries no puck — its first
   place holds the cyan dot of a line someone else changed since his last visit, and a muted "who, when" stands under it
   ("approved by Saber · yesterday 08:40"); it shows a refused leave (grey struck box) and one someone else deleted (its
   dates struck, for that visit); a paperclip opens its documents (D1292); a tap on the line takes the grid there. The day
   panel's line is drawn exactly as before. */

import type { ReactNode } from 'react'
import { boxText, kindOf } from '../engine'
import { puckHtml } from '../sync'
import { spanInYear } from './dates'

/* a run in one month says its month once — "26 – 28 Jan"; across months each day its month; across a year's end, whole */
function runWords(from: string, to: string): string {
  if (from !== to && from.slice(0, 7) === to.slice(0, 7)) return `${Number(from.slice(8, 10))} – ${spanInYear(to, to)}`
  return spanInYear(from, to)
}

const fig = (n: number) => String(Math.round(n * 2) / 2)
const STATE_WORD = { approved: 'Approved', pending: 'Pending', refused: 'Refused', deleted: 'Deleted', unav: '' } as const

// eslint-disable-next-line react-doctor/no-high-complexity-react-function -- one line, drawn two ways (the day panel's with its puck, the person window's with its dot, who and clip); its branches are each one optional part of that line
export function LeaveLine({ personId, callsign = '', code, state, from, to, days, testid, noPuck, dates, box, dot, who, clip, onGo }: {
  personId: string
  /** his callsign, where the roster draws no puck for him */
  callsign?: string
  code: string
  state: 'approved' | 'pending' | 'unav' | 'refused' | 'deleted'
  from: string
  to: string
  days: number
  testid?: string
  /** the person window's line: no puck — its first place is the dot's */
  noPuck?: boolean
  /** the dates in the caller's own words (the person window's "Mon 19 – Wed 21 Jan") */
  dates?: string
  /** the box's look where it is not the state's own (a deleted leave keeps the look it had): a approved, w pending, r refused */
  box?: 'a' | 'w' | 'r'
  /** new since his last visit (D1231) */
  dot?: boolean
  /** the muted "who, when" under the line */
  who?: string
  /** the paperclip, beside the dates */
  clip?: ReactNode
  /** a tap on the line takes the grid there */
  onGo?: () => void
}) {
  const look = box ?? (state === 'pending' ? 'w' : state === 'refused' ? 'r' : 'a')
  const words = dates ?? runWords(from, to)
  const stateCls = state === 'pending' ? ' pend' : state === 'refused' || state === 'deleted' ? ' ref' : ''
  if (!noPuck) return (
    <div className="ll-row" data-testid={testid}>
      <span className="ll-puck" aria-hidden="true" dangerouslySetInnerHTML={{ __html: puckHtml(personId, callsign) }} />
      <span className={`c k-${kindOf(code)} s-${look} ll-box`}>{boxText(code)}</span>
      <span className="ll-dates">{words}</span>
      <span className="ll-days">{fig(days)}</span>
      {/* a commitment under Unavailable: its outlined box says what it is (D1357, D1370); no state word beside it */}
      <span className={`ll-state${stateCls}`}>{STATE_WORD[state]}</span>
    </div>
  )
  /* a line that takes the grid there is `ll-tap` — never `go`, the schedule's flying-wave block (scheduler.css `.go`), whose
     rounded card, side margins and cyan bar it wore until his pick of 29 Oct 26 (D1493: flat rows, as drawn) */
  return (
    /* role="presentation": the row only widens the pointer's target — the keyboard's and a screen reader's way in is the
       dates' own button below */
    <div className={`ll-row${state === 'deleted' ? ' gone' : ''}${onGo ? ' ll-tap' : ''}${dot ? ' new' : ''}`} data-testid={testid} role="presentation" onClick={onGo}>
      <span>{dot && <i className="m5-dot" data-testid={testid ? `${testid}-dot` : undefined} aria-label="New since your last visit" />}</span>
      <span className={`c k-${kindOf(code)} s-${look} ll-box`}>{boxText(code)}</span>
      {/* the keyboard's way in is the dates, a button where the line goes somewhere (the row itself takes the pointer) */}
      <span className="ll-dates">
        {onGo
          ? <button type="button" className="ll-go" onClick={e => { e.stopPropagation(); onGo() }}>{words}</button>
          : words}
        {clip}
      </span>
      <span className="ll-days">{fig(days)}</span>
      <span className={`ll-state${stateCls}`}>{STATE_WORD[state]}</span>
      {who && <span className="m5-by" data-testid={testid ? `${testid}-who` : undefined}>{who}</span>}
    </div>
  )
}
