/* DAYS — what kind of day each date is (the Inputs / SANS calendar job; the build plan
   docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.4).

   Owner, D633 (7 Oct 26): "the month carries a select button on every day — day, night or no fly, chosen right on the
   date, as in his reference — so there is no separate normal-week view." D638: "on the Days month a phone date carries
   one button that steps day, night, no fly and a desktop date three buttons; three choices are enough." D642: a
   Saturday and a Sunday start with no flying set. D631: a day is day flying unless something else is chosen.

   ONE WINDOW, admins only, on the windows shell (ui/FloatWindow.tsx): it can be dragged about and the page behind it
   still works (D641) — so the Leave War's rows, or a calendar, repaint under it as he presses. Mounted once in the
   shell (ui/App.tsx) and opened by ui/pops.ts DAYSWIN — the date whose month to open on.

   THE MONTH. A date shows its number and EITHER the tag the Leave War gives it — PH, OFF; a holiday carries no class,
   so it gets no control — OR its class control. Each press is one `fly.day.set` command and one Undo step
   (state/flyplan.ts setFlyDays, which writes nothing when nothing would change). A date whose class is set for the
   date itself — apart from what its weekday would give it — wears a small dot.

   IT WORKS NOTHING OUT. What a day is comes from the ONE join, leavewar/sync.ts flyMonth → state/flyplan-model.ts
   planFor — the same answer the Leave War's rows and the calendars draw — so this window and they cannot disagree. It
   repaints on the scheduler's signal (a plan row moved) and on the war's (`useWarFacts` — a holiday declared, a period
   added).

   NOT HERE YET (the plan's next pieces): a weekday's heading opening "Every <weekday>", and the year's Holidays list —
   so the headings are plain words and there are no tabs. */
import { useEffect, useState } from 'react'
/* CLASS NAMES here are prefixed (`is-`, `c-`, `t-`, `lit`): the scheduler's stylesheet is one global sheet, and its
   week already owns `.day` — a date button classed `day` grew as tall as a day card (seen in the first look). */
import { FloatWin } from './FloatWindow'
import { MoonIcon, SunIcon } from './icons'
import { DAYSWIN, setDaysWin } from './pops'
import { useVersion } from './useStore'
import { notify } from '../state/store'
import { isAdmin } from '../state/perms'
import { setFlyDays, type FlySave } from '../state/flyplan'
import { monthDates, nextCls, weekdayOf, type DayAnswer, type FlyCls } from '../state/flyplan-model'
import { flyMonth, useWarFacts } from '../leavewar/sync'

const WD = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
/* the words a class is said in — to a screen reader, and in the phone button's "tap for …" */
const SAY: Record<FlyCls, string> = { day: 'day flying', night: 'night flying', nf: 'no fly', none: 'no flying set' }
const KEYS: Array<{ k: 'd' | 'n' | 'nf'; cls: FlyCls; text: string }> = [
  { k: 'd', cls: 'day', text: 'D' }, { k: 'n', cls: 'night', text: 'N' }, { k: 'nf', cls: 'nf', text: 'NF' },
]

/** today's own date, local time — the viewer's day, as the Inputs calendar's Today has it */
const isoToday = (): string => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
/** "Mon 2 Nov" */
const sayDate = (iso: string): string => `${WD[weekdayOf(iso)]} ${+iso.slice(8, 10)} ${MONTHS[+iso.slice(5, 7) - 1].slice(0, 3)}`

/* ONE BUTTON OR THREE is asked of the browser, as the windows' own phone layout is (floatwin.ts) — at the app's phone
   width (820px), not the windows' (620px): seven dates across a window narrower than that leave no room for three
   buttons on each (D638). */
const NARROW = '(max-width:820px)'
function useNarrow(): boolean {
  const read = () => typeof window !== 'undefined' && !!window.matchMedia && !!window.matchMedia(NARROW).matches
  const [narrow, setNarrow] = useState(read)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia(NARROW)
    const on = () => setNarrow(!!mq.matches)
    on()
    if (mq.addEventListener) mq.addEventListener('change', on); else if (mq.addListener) mq.addListener(on)
    return () => { if (mq.removeEventListener) mq.removeEventListener('change', on); else if (mq.removeListener) mq.removeListener(on) }
  }, [])
  return narrow
}

/** the phone button's face: the sun, the moon, NF, or a dash for "no flying set" (D577 — sun is day, moon is night) */
function Face({ cls }: { cls: FlyCls }) {
  if (cls === 'day') return <SunIcon />
  if (cls === 'night') return <MoonIcon />
  return <>{cls === 'nf' ? 'NF' : '–'}</>
}

export function DaysWindow() {
  useVersion()
  /* the page is the gate, as Admin's is: a member has no door to this window, and one asked for anyway draws nothing —
     and is not left asked for, or an admin who looks at the member view (D292) would find it back up on his return */
  const refused = !!DAYSWIN && !isAdmin()
  useEffect(() => { if (refused) setDaysWin(null) }, [refused])
  if (!DAYSWIN || refused) return null
  /* keyed by the date it was asked for, so asking again for another month (the Leave War's settings, on the month the
     war is showing) opens on that month */
  return <DaysBody key={DAYSWIN} at={DAYSWIN} />
}

function DaysBody({ at }: { at: string }) {
  useVersion()
  useWarFacts()
  const narrow = useNarrow()
  const [ym, setYm] = useState(() => ({ y: +at.slice(0, 4), m: +at.slice(5, 7) }))
  const [err, setErr] = useState('')
  const dates = monthDates(ym.y, ym.m)
  const answers = flyMonth(ym.y, ym.m)
  const today = isoToday()

  const close = () => { setDaysWin(null); notify() }
  const step = (by: number) => setYm(({ y, m }) => {
    const n = y * 12 + (m - 1) + by
    return { y: Math.floor(n / 12), m: (n % 12) + 1 }
  })
  const set = (iso: string, cls: FlyCls) => {
    const r = setFlyDays([{ iso, cls }])
    const done = (x: FlySave) => setErr(x.ok ? '' : x.message || 'This change could not be saved.')
    if (r.pending) void r.pending.then(done); else done(r)
  }
  /* a desktop press: the lit one again changes nothing on a weekday, and on a Saturday or Sunday unsets it (§3.4) */
  const press = (a: DayAnswer, cls: FlyCls) => {
    if (a.cls !== cls) set(a.iso, cls)
    else if (a.weekend) set(a.iso, 'none')
  }

  return (
    <FloatWin id="days" title="Days" sub="admins only" testid="win-days" className="dayswin" onClose={close}>
      <div className="days-head">
        <button type="button" className="abtn" data-testid="days-prev" aria-label="Previous month" onClick={() => step(-1)}>&#8249;</button>
        <span className="days-month" data-testid="days-month" aria-live="polite">{MONTHS[ym.m - 1]} {ym.y}</span>
        <button type="button" className="abtn" data-testid="days-next" aria-label="Next month" onClick={() => step(1)}>&#8250;</button>
        <button type="button" className="abtn" data-testid="days-today" onClick={() => setYm({ y: +today.slice(0, 4), m: +today.slice(5, 7) })}>Today</button>
      </div>
      <p className="days-hint">
        {narrow ? 'Tap a date’s button to step: day, night, no fly.' : 'Click D, N or NF on a date. A day is day flying unless you choose otherwise.'}
      </p>
      {err && <p className="days-err" data-testid="days-err" role="alert">{err}</p>}
      <div className={'days-grid' + (narrow ? ' narrow' : '')} data-testid="days-grid">
        {WD.map((w, i) => <div key={w} className={'days-wd' + (i >= 5 ? ' is-we' : '')}>{w}</div>)}
        {Array.from({ length: weekdayOf(dates[0]) }, (_, i) => <div key={'b' + i} className="days-blank" aria-hidden="true" />)}
        {dates.map(iso => {
          const a = answers[iso]
          const cur: FlyCls = a.cls ?? 'none'
          return (
            <div
              key={iso}
              className={'days-cell' + (a.weekend ? ' is-we' : '') + (a.kind ? ' is-' + a.kind : '') + (iso === today ? ' is-today' : '')}
              data-iso={iso}
              data-testid={`days-cell-${iso}`}
            >
              <div className="days-top">
                <span className="days-num">{+iso.slice(8, 10)}</span>
                {a.clsFrom === 'date' && <span className="days-dot" data-testid={`days-dot-${iso}`} title="Set for this date" aria-label="Set for this date" />}
              </div>
              {a.kind ? (
                <span className={'days-tag t-' + a.kind} data-testid={`days-tag-${iso}`} title={a.kind === 'ph' ? 'Public holiday' : 'Off day'}>
                  {a.kind === 'ph' ? 'PH' : 'OFF'}
                </span>
              ) : narrow ? (
                <button
                  type="button"
                  className={'days-step c-' + cur}
                  data-testid={`days-step-${iso}`}
                  data-cls={cur}
                  aria-label={`${sayDate(iso)}: ${SAY[cur]}. Tap for ${SAY[nextCls(cur, a.weekend)]}`}
                  onClick={() => set(iso, nextCls(cur, a.weekend))}
                ><Face cls={cur} /></button>
              ) : (
                <div className="days-keys" role="group" aria-label={sayDate(iso)}>
                  {KEYS.map(b => (
                    <button
                      key={b.k}
                      type="button"
                      className={'days-key c-' + b.cls + (cur === b.cls ? ' lit' : '')}
                      data-testid={`days-${b.k}-${iso}`}
                      aria-pressed={cur === b.cls}
                      aria-label={`${sayDate(iso)}: ${SAY[b.cls]}`}
                      onClick={() => press(a, b.cls)}
                    >{b.text}</button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
        {/* the last week's empty places, so the month's foot is drawn like its head */}
        {Array.from({ length: (7 - ((weekdayOf(dates[0]) + dates.length) % 7)) % 7 }, (_, i) => <div key={'f' + i} className="days-fill" aria-hidden="true" />)}
      </div>
    </FloatWin>
  )
}
