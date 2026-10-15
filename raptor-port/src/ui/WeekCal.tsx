/* THE DATE JUMP (owner, 22 Aug 26). A DAY picker — the user picks a day and
   goes to it; the WEEK it belongs to is transparent, because navigation is a
   continuous run of days (swipe/arrows flow across week boundaries), so "which
   week" is not a thing the user should have to think about.

   Under the hood the app still loads a week at a time (that is the data unit),
   but a pick lands the view exactly on the tapped day: on the schedule the
   carousel scrolls to it (via view.WEEKJUMP, consumed in the week's own
   repaint); on the board that day opens (boardTab).

   SINCE STEP TWO OF THE APP'S ONE DATE CALENDAR (owner D901, 15 Oct 26) its
   month is that calendar (ui/DateCal.tsx — D796): the day being looked at is
   the picked date, the notional today (weeknav.TODAY — the app has no clock)
   on its soft disc. It keeps its own window, as it was (D797). Its Today icon
   is the calendar's own, right of the year — the one this window had in its
   head, which the calendar was given — and here it still PICKS today: the
   window closes and the view lands there at once (D901: kept as it was). One
   Today icon, not two.

   Opened from the schedule seg, the mobile calendar icon, and the board's
   top-left #sbCal — via the WEEKCAL flag (pops.ts). */
import { useEffect, useRef } from 'react'
import { CURWEEK } from '../engine/waves'
import { loadWeek, notify } from '../state/store'
import { boardTab } from './board'
import { SBDAY, weekLeftDay, setWeekJump } from '../state/view'
import { WEEKCAL, setWeekCal } from './pops'
import { useVersion } from './useStore'
import { mondayOf, keyToIso, dayIndexInWeek, TODAY } from './weeknav'
import { clickedOutside } from './outside'
import { DateCal } from './DateCal'

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

  /* The calendar opens on the current day's month: it is drawn afresh each time the window opens (closed, it is not
     drawn at all), and reads the day once as it is drawn — so paging months while it is up is kept until it closes,
     and the day is not measured on every store tick with the window closed (3 Sep 26, the slow-computer cut: that
     re-measured all seven day boxes per drop). */
  useEffect(() => {
    if (!open) return
    openerRef.current = document.activeElement
    const t = setTimeout(() => boxRef.current?.querySelector<HTMLElement>('.dcal-nav')?.focus(), 0)
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
  const todayIso = keyToIso(TODAY)

  return (
    <div className="airpop" id="weekCal" role="dialog" aria-label="Jump to a date"
      onKeyDown={e => { if (e.key === 'Escape') { e.stopPropagation(); close() } }}
      onClick={e => { if (clickedOutside(e, 'weekCal')) close() }}>
      <div className="airpop-box weekcal-box" ref={boxRef}>
        <div className="airpop-head"><b>Jump to a date</b>
          <button className="x" aria-label="Close" onClick={close}>✕</button></div>
        <div className="airpop-body weekcal-body">
          <DateCal tid="wcal" value={currentDayIso()} today={todayIso} onPick={pick} onToday={() => pick(todayIso)} />
          <div className="weekcal-hint">Tap any day to go to it.</div>
        </div>
      </div>
    </div>
  )
}
