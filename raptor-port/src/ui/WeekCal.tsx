/* THE DATE JUMP (owner, 22 Aug 26). A DAY picker — the user picks a day and
   goes to it; the WEEK it belongs to is transparent, because navigation is a
   continuous run of days (swipe/arrows flow across week boundaries), so "which
   week" is not a thing the user should have to think about.

   Under the hood the app still loads a week at a time (that is the data unit),
   but a pick lands the view exactly on the tapped day: on the schedule the
   carousel scrolls to it (via view.WEEKJUMP, consumed in the week's own
   repaint); on the board that day opens (boardTab).

   Same look as the app's own date picker — the `.rc-*` styles RangeCal.tsx
   uses (Monday-first grid, `‹ month ›` header). The current day is highlighted,
   and the notional today wears a ring.

   Opened from the schedule seg, the mobile calendar icon, and the board's
   top-left #sbCal — via the WEEKCAL flag (pops.ts). */
import { useEffect, useRef, useState } from 'react'
import { CURWEEK } from '../engine/waves'
import { loadWeek, notify } from '../state/store'
import { boardTab } from './board'
import { SBDAY, weekLeftDay, setWeekJump } from '../state/view'
import { WEEKCAL, setWeekCal } from './pops'
import { useVersion } from './useStore'
import { mondayOf, keyToIso, dayIndexInWeek, TODAY } from './weeknav'

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const iso = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`

/** The day the user is currently looking at, as `yyyy-mm-dd`: the board's open
 *  day, else the schedule carousel's left-most visible day, else the loaded
 *  week's Monday. Used to light the one current day in the grid. */
function currentDayIso(): string {
  const monKey = mondayOf(CURWEEK)
  const [d, m, y] = monKey.split('/').map(n => parseInt(n, 10))
  let di = 0
  if (SBDAY != null) di = SBDAY
  else {
    const el = document.getElementById('vWeek') || document.getElementById('eWeek')
    const left = el ? weekLeftDay(el) : null
    if (left != null) di = left
  }
  return new Date(Date.UTC(y, m - 1, d) + di * 86_400_000).toISOString().slice(0, 10)
}

export function WeekCal() {
  useVersion()
  const boxRef = useRef<HTMLDivElement>(null)
  const openerRef = useRef<Element | null>(null)
  const open = WEEKCAL !== false
  const context = WEEKCAL

  // Opens on the current day's month. Recomputed only when it opens (keyed on
  // WEEKCAL), so paging months during a session is remembered until it closes.
  const seed = currentDayIso()
  const [view, setView] = useState(() => ({ y: +seed.slice(0, 4), m: +seed.slice(5, 7) - 1 }))

  useEffect(() => {
    if (!open) return
    openerRef.current = document.activeElement
    const s = currentDayIso()
    setView({ y: +s.slice(0, 4), m: +s.slice(5, 7) - 1 })
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
    const di = dayIndexInWeek(mon, v)
    if (context === 'board') {
      setWeekCal(false)
      loadWeek(mon)          // closes the board as it swaps the week…
      boardTab(di)           // …so reopen it on the tapped day (after loadWeek)
    } else {
      setWeekJump(di)        // land the carousel on this exact day, same repaint
      setWeekCal(false)
      loadWeek(mon)
    }
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

  const curIso = currentDayIso()
  const todayIso = keyToIso(TODAY)

  return (
    <div className="airpop" id="weekCal" role="dialog" aria-label="Jump to a date"
      onKeyDown={e => { if (e.key === 'Escape') { e.stopPropagation(); close() } }}
      onClick={e => { if ((e.target as HTMLElement).id === 'weekCal') close() }}>
      <div className="airpop-box weekcal-box" ref={boxRef}>
        <div className="airpop-head"><b>Jump to a date</b><button className="x" aria-label="Close" onClick={close}>✕</button></div>
        <div className="airpop-body weekcal-body">
          <div className="rangecal weekcal">
            <div className="rc-h">
              <button type="button" className="rc-nav" aria-label="Previous month" onClick={() => step(-1)}>‹</button>
              <span className="rc-mon">{MON[view.m]} {view.y}</span>
              <button type="button" className="rc-nav" aria-label="Next month" onClick={() => step(1)}>›</button>
            </div>
            <div className="rc-dow">{['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => <span key={d}>{d}</span>)}</div>
            <div className="rc-grid">
              {cells.map((d, i) => {
                if (d == null) return <span key={i} className="rc-x" />
                const v = iso(view.y, view.m, d)
                const wknd = i % 7 >= 5
                const cls = 'rc-d'
                  + (v === curIso ? ' sel' : '')
                  + (v === todayIso ? ' today' : '')
                  + (wknd ? ' wk' : '')
                return (
                  <button type="button" key={i} data-wcal={v} className={cls}
                    aria-current={v === curIso ? 'date' : undefined}
                    aria-label={`${d} ${MON[view.m]} ${view.y}`}
                    onClick={() => pick(v)}>{d}</button>
                )
              })}
            </div>
          </div>
          <div className="weekcal-hint">Tap any day to go to it.</div>
        </div>
      </div>
    </div>
  )
}
