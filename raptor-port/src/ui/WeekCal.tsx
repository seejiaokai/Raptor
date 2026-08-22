/* THE WEEK-JUMP CALENDAR (owner, Aug 26). One month grid; tap any day and the
   schedule loads the WEEK that day belongs to (Mon–Sun), because the app plans
   a week at a time and keys each loaded week by its Monday (CURWEEK).

   Same look as the app's own date picker — the `.rc-*` styles RangeCal.tsx
   already uses (Monday-first grid, `‹ month ›` header). The one thing added
   over RangeCal is the WHOLE-WEEK highlight: the loaded week's row is always
   lit, and on a mouse the row under the cursor lights too, so "this tap loads
   this whole week" is visible before you commit.

   Opened from three places via the WEEKCAL flag (pops.ts): the schedule seg,
   the mobile calendar icon, and the scheduler board's top-left icon. From the
   board, the pick also opens the tapped day on the board (boardTab). */
import { useEffect, useRef, useState } from 'react'
import { CURWEEK } from '../engine/waves'
import { loadWeek, notify } from '../state/store'
import { boardTab } from './board'
import { WEEKCAL, setWeekCal } from './pops'
import { useVersion } from './useStore'
import { mondayOf, keyToIso, isoToKey, dayIndexInWeek, TODAY } from './weeknav'

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const iso = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`

export function WeekCal() {
  useVersion()
  const boxRef = useRef<HTMLDivElement>(null)
  const openerRef = useRef<Element | null>(null)
  const open = WEEKCAL !== false
  const context = WEEKCAL

  // Opens on the loaded week's month. Recomputed only when it opens (the key is
  // WEEKCAL), so paging months during a session is remembered until it closes.
  const seed = keyToIso(mondayOf(CURWEEK))
  const [view, setView] = useState(() => ({ y: +seed.slice(0, 4), m: +seed.slice(5, 7) - 1 }))
  const [hover, setHover] = useState<string | null>(null)

  // Re-seed the visible month each time it opens, and remember who opened it so
  // focus can return there on close (keyboard reach — owner product bar).
  useEffect(() => {
    if (!open) return
    openerRef.current = document.activeElement
    const s = keyToIso(mondayOf(CURWEEK))
    setView({ y: +s.slice(0, 4), m: +s.slice(5, 7) - 1 })
    setHover(null)
    // move focus into the dialog so Escape/Tab work from here
    const t = setTimeout(() => boxRef.current?.querySelector<HTMLElement>('.rc-nav')?.focus(), 0)
    return () => clearTimeout(t)
  }, [open])

  if (!open) return <div className="airpop" id="weekCal" hidden />

  const close = () => {
    setWeekCal(false)
    ;(openerRef.current as HTMLElement | null)?.focus?.()
    notify()
  }
  const pick = (v: string) => {
    const mon = mondayOf(v)
    loadWeek(mon)                                   // snap to that day's week
    if (context === 'board') boardTab(dayIndexInWeek(mon, v))  // AFTER loadWeek (it closes the board)
    setWeekCal(false)
    notify()
  }
  const step = (n: number) => {
    const m = view.m + n
    setView({ y: view.y + Math.floor(m / 12), m: ((m % 12) + 12) % 12 })
  }

  const first = new Date(Date.UTC(view.y, view.m, 1))
  const lead = (first.getUTCDay() + 6) % 7          // Mon=0 … Sun=6
  const dim = new Date(Date.UTC(view.y, view.m + 1, 0)).getUTCDate()
  const cells: (number | null)[] = []
  for (let i = 0; i < lead; i++) cells.push(null)
  for (let d = 1; d <= dim; d++) cells.push(d)
  while (cells.length % 7) cells.push(null)

  const curMon = mondayOf(CURWEEK)
  const hoverMon = hover ? mondayOf(hover) : null
  const todayIso = keyToIso(TODAY)

  return (
    <div className="airpop" id="weekCal" role="dialog" aria-label="Jump to a week"
      onKeyDown={e => { if (e.key === 'Escape') { e.stopPropagation(); close() } }}
      onClick={e => { if ((e.target as HTMLElement).id === 'weekCal') close() }}>
      <div className="airpop-box weekcal-box" ref={boxRef}>
        <div className="airpop-head"><b>Jump to a week</b><button className="x" aria-label="Close" onClick={close}>✕</button></div>
        <div className="airpop-body weekcal-body">
          <div className="rangecal weekcal">
            <div className="rc-h">
              <button type="button" className="rc-nav" aria-label="Previous month" onClick={() => step(-1)}>‹</button>
              <span className="rc-mon">{MON[view.m]} {view.y}</span>
              <button type="button" className="rc-nav" aria-label="Next month" onClick={() => step(1)}>›</button>
            </div>
            <div className="rc-dow">{['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => <span key={d}>{d}</span>)}</div>
            <div className="rc-grid" onMouseLeave={() => setHover(null)}>
              {cells.map((d, i) => {
                if (d == null) return <span key={i} className="rc-x" />
                const v = iso(view.y, view.m, d)
                const mon = mondayOf(v)
                const inCur = mon === curMon
                const inHover = hoverMon === mon
                const wknd = i % 7 >= 5
                const cls = 'rc-d'
                  + (inCur ? ' cur' : '')
                  + (inHover ? ' inwk' : '')
                  + (v === todayIso ? ' today' : '')
                  + (wknd ? ' wk' : '')
                return (
                  <button type="button" key={i} data-wcal={v} className={cls}
                    aria-label={`Week of ${new Date(Date.UTC(+mon.slice(6), +mon.slice(3, 5) - 1, +mon.slice(0, 2))).getUTCDate()} ${MON[view.m]} — ${d} ${MON[view.m]} ${view.y}`}
                    onMouseEnter={() => setHover(v)}
                    onClick={() => pick(v)}>{d}</button>
                )
              })}
            </div>
          </div>
          <div className="weekcal-hint">Tap any day to load its week.</div>
        </div>
      </div>
    </div>
  )
}
