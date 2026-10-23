/* THE DAY PANEL (owner D1143, D1198; the Leave War overhaul's M3, batch 6). A tap on a date's heading — on a phone and a
   desktop — opens that day, as the Inputs and SANS calendars' day does: the app's own window (`ui/FloatWindow.tsx` with
   `rests`, as the SANS day's), up from the foot on a phone, floating on a desktop; the grid behind it keeps working
   (D641). ‹ › step a day, across months and periods — every figure read from the period HOLDING that date. Top to bottom:
   whether the day is open for bidding; its events; the Required and Available rows, then every Manning row with that
   day's figure in its amber or red (names in one column, figures in another — his lessons 20, 29; halves .5 — D1246);
   then "Away · N", one line a person (LeaveLine.tsx). Never a remark (D1143). Read only in M3.

   ITS OPEN STATE IS ITS OWN (performance.md §E): a small listener set here, never a field of the store the grid's rows
   read — opening it, stepping it, or a bid placed with it open repaints no month of the grid. */

import { useSyncExternalStore } from 'react'
import { addDays } from '../engine'
import { availRowNames, availVerdictAt, dayFacts, flyAnswer, reqRowNames, useWarFacts } from '../sync'
import { dayPanelData } from '../state/daypanel'
import { useVersion } from './useStore'
import { FloatWin } from '../../ui/FloatWindow'
import { dayLabel } from './dates'
import { LeaveLine } from './LeaveLine'

/* ── the open day: one listener set ── */
let OPEN: string | null = null
const subs = new Set<() => void>()
const emit = () => { for (const f of subs) f() }
export function openDayPanel(iso: string): void { OPEN = iso; emit() }
export function closeDayPanel(): void { if (OPEN) { OPEN = null; emit() } }
export const dayPanelDate = (): string | null => OPEN
const subscribe = (f: () => void) => { subs.add(f); return () => { subs.delete(f) } }

const fig = (n: number | null) => (n === null ? '–' : String(Math.round(n * 2) / 2))

/** Drawn once beside the grid; renders the panel only while a day is open */
export function DayPanelHost() {
  const iso = useSyncExternalStore(subscribe, dayPanelDate, dayPanelDate)
  return iso ? <DayPanel iso={iso} /> : null
}

function DayPanel({ iso }: { iso: string }) {
  useVersion()      // a bid placed, an Undo — the figures follow the store
  useWarFacts()     // the scheduler's half: the Required figures, the Available rows' names and points
  const d = dayPanelData(iso)
  const a = flyAnswer(iso), f = dayFacts(iso)
  const rn = reqRowNames(), an = availRowNames()
  const req = (s: 'p' | 'w') => (a.reqFrom[s] === 'nf' ? 0 : a.req[s])
  const fixed: Array<{ id: string; label: string; value: string; level: '' | 'amber' | 'red' }> = [
    { id: 'reqp', label: rn.p, value: fig(f.covered ? req('p') : null), level: '' },
    { id: 'availp', label: an.p, value: fig(f.availP), level: f.covered ? availVerdictAt(iso, 'p', a) : '' },
    { id: 'reqw', label: rn.w, value: fig(f.covered ? req('w') : null), level: '' },
    { id: 'availw', label: an.w, value: fig(f.availW), level: f.covered ? availVerdictAt(iso, 'w', a) : '' },
  ]
  const step = (n: number) => openDayPanel(addDays(iso, n))
  return (
    <FloatWin id="lwday" title={dayLabel(iso)} testid="win-lwday" className="lwday" rests tallFirst onClose={closeDayPanel}
      tools={<>
        <button type="button" className="win-step" data-testid="lwday-prev" aria-label="The day before" onClick={() => step(-1)}>‹</button>
        <button type="button" className="win-step" data-testid="lwday-next" aria-label="The day after" onClick={() => step(1)}>›</button>
      </>}>
      <div className="lwday-body" data-testid="lwday-body" data-iso={iso}>
        {!d.covered && <p className="lwday-note" data-testid="lwday-nocover">No leave period covers this date</p>}
        {d.covered && !d.open && <p className="lwday-note" data-testid="lwday-closed">Not open for bidding</p>}
        {d.events.length > 0 && (
          <ul className="lwday-events" data-testid="lwday-events">
            {d.events.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        )}
        <div className="lwday-figs" data-testid="lwday-figs">
          {[...fixed, ...d.manning.map(m => ({ id: m.id, label: m.label, value: fig(m.have), level: m.level }))].map(r => (
            <div key={r.id} className={`dl-row${r.level ? ` dl-${r.level}` : ''}`} data-testid={`lwday-fig-${r.id}`}>
              <span className="dl-name">{r.label}</span>
              <span className="dl-fig">{r.value}</span>
            </div>
          ))}
        </div>
        {d.covered && (
          <section className="lwday-away">
            <h3 className="lwday-h" data-testid="lwday-away-h">Away · {d.away.length}</h3>
            {d.away.map(l => <LeaveLine key={l.personId} testid={`lwday-away-${l.personId}`} {...l} />)}
          </section>
        )}
      </div>
    </FloatWin>
  )
}
