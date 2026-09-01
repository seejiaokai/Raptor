/* The inputs date picker: ONE calendar that takes a range in two clicks
   (owner, Aug 26) instead of two separate <input type=date> boxes.

   First click sets the start and clears any end. Second click sets the end —
   unless it lands BEFORE the start, which cannot be a range, so that earlier
   date becomes the new start and the picker waits for an end again. A third
   click always begins a fresh range, so the box never gets stuck needing a
   reset. Values stay in the yyyy-mm-dd strings the page already speaks, so
   the add/edit paths are unchanged. */
import { useState } from 'react'
import { TODAY, keyToIso } from './weeknav'

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const iso = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
/* the demo week is Jul 2026, so an untouched picker opens where the data is */
export const DEFAULT_MONTH = { y: 2026, m: 6 }

export function RangeCal({ start, end, onPick, idPrefix }:
  { start: string, end: string, onPick: (s: string, e: string) => void, idPrefix?: string }) {
  const seed = start || end
  const [view, setView] = useState(() => seed
    ? { y: +seed.slice(0, 4), m: +seed.slice(5, 7) - 1 }
    : DEFAULT_MONTH)

  const first = new Date(Date.UTC(view.y, view.m, 1))
  /* the squadron week starts MONDAY, so the grid does too: JS getUTCDay() is
     Sunday-first, and this rotates it (Mon=0 … Sun=6) */
  const lead = (first.getUTCDay() + 6) % 7
  const days = new Date(Date.UTC(view.y, view.m + 1, 0)).getUTCDate()
  const cells: (number | null)[] = []
  for (let i = 0; i < lead; i++) cells.push(null)
  for (let d = 1; d <= days; d++) cells.push(d)
  while (cells.length % 7) cells.push(null)

  const pick = (d: string) => {
    if (!start || (start && end)) return onPick(d, '')   // begin a fresh range
    if (d < start) return onPick(d, '')                  // reversed → it is the new start
    onPick(start, d)
  }
  const step = (n: number) => {
    const m = view.m + n
    setView({ y: view.y + Math.floor(m / 12), m: ((m % 12) + 12) % 12 })
  }
  // The header "today" button pages the view to the month holding the notional
  // today (weeknav.TODAY — the app has no clock) and rings that day. It does NOT
  // pick — this is a range picker, so jumping the view must never wipe a range
  // being built or a consumer's filter; the reader taps the ringed day to pick.
  const todayIso = keyToIso(TODAY)
  const goToday = () => setView({ y: +todayIso.slice(0, 4), m: +todayIso.slice(5, 7) - 1 })

  return (
    <div className="rangecal" id={idPrefix ? idPrefix + 'Cal' : undefined}>
      <div className="rc-h">
        <span className="rc-hpad" aria-hidden="true" />
        <span className="rc-hmid">
          <button type="button" className="rc-nav" aria-label="Previous month" onClick={() => step(-1)}>‹</button>
          <span className="rc-mon">{MON[view.m]} {view.y}</span>
          <button type="button" className="rc-nav" aria-label="Next month" onClick={() => step(1)}>›</button>
        </span>
        <button type="button" className="rc-today" aria-label="Go to today" title="Go to today"
          onClick={goToday}><span className="rc-pg"><span className="rc-n">{+todayIso.slice(8, 10)}</span></span></button>
      </div>
      <div className="rc-dow">{['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => <span key={d}>{d}</span>)}</div>
      <div className="rc-grid">
        {cells.map((d, i) => {
          if (d == null) return <span key={i} className="rc-x" />
          const v = iso(view.y, view.m, d)
          const isS = v === start, isE = v === end
          const mid = !!(start && end && v > start && v < end)
          const wknd = i % 7 >= 5
          const today = v === todayIso
          return (
            <button type="button" key={i} data-cal={v}
              className={'rc-d' + (isS ? ' s' : '') + (isE ? ' e' : '') + (mid ? ' mid' : '') + (wknd ? ' wk' : '') + (today ? ' today' : '')}
              aria-label={`${d} ${MON[view.m]} ${view.y}`} onClick={() => pick(v)}>{d}</button>
          )
        })}
      </div>
    </div>
  )
}
