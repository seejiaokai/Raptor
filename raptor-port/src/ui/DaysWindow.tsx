/* DAYS — what kind of day each date is (the Inputs / SANS calendar job; the build plan
   docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.4).

   Owner, D633 (7 Oct 26): "the month carries a select button on every day — day, night or no fly, chosen right on the
   date, as in his reference — so there is no separate normal-week view." D638: "on the Days month a phone date carries
   one button that steps day, night, no fly and a desktop date three buttons; three choices are enough." D642: a
   Saturday and a Sunday start with no flying set. D631: a day is day flying unless something else is chosen.

   ONE WINDOW, admins only, on the windows shell (ui/FloatWindow.tsx): it can be dragged about and the page behind it
   still works (D641) — so the Leave War's rows, or a calendar, repaint under it as he presses. Mounted once in the
   shell (ui/App.tsx) and opened by ui/pops.ts DAYSWIN — the date whose month to open on.

   THE MONTH. A date shows its number and EITHER the tag the Leave War gives it — the holiday's short form: PH, OFF, ND; a holiday carries no class,
   so it gets no control — OR its class control. Each press is one `fly.day.set` command and one Undo step
   (state/flyplan.ts setFlyDays, which writes nothing when nothing would change). A date whose class is set for the
   date itself — apart from what its weekday would give it — wears a small dot.

   IT WORKS NOTHING OUT. What a day is comes from the ONE join, leavewar/sync.ts flyMonth → state/flyplan-model.ts
   planFor — the same answer the Leave War's rows and the calendars draw — so this window and they cannot disagree. It
   repaints on the scheduler's signal (a plan row moved) and on the war's (`useWarFacts` — a holiday declared, a period
   added).

   A WEEKDAY'S HEADING opens "Every <weekday>" (ui/EveryWeekday.tsx — D631, D638): a second window, beside this one,
   that sets every such day from a date onward. It lives and dies with Days: closing Days closes it.

   TWO PARTS — the Month and the year's Holidays (ui/HolidaysPanel.tsx — D631, D638): side by side on a screen wide
   enough for both AND for a form window beside them (1510px and over), two tabs under that (the plan §3.4: "two parts
   side by side on a desktop, two tabs on a phone"). The holiday form is a second window too, and ONE side window is up at a time: opening the holiday
   form takes the place of "Every <weekday>", and the other way round — two forms stacked in one corner would hide
   each other. */
import { useEffect, useState } from 'react'
/* ON SCREEN IT IS CALLED "CALENDAR" (owner, D675, 8 Oct 26 — "The terms days seems abit weird … Change it to Calendar
   instead of days"): the window's title and its line in the settings that open it. "Days" stays the name in the code
   and the working records — nothing he sees. */
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
import { dayFacts, flyMonth, useWarFacts } from '../leavewar/sync'
import { type HolidayLine } from '../leavewar/sync'
import { EveryWeekday } from './EveryWeekday'
import { HolidayForm, HolidaysPanel } from './HolidaysPanel'
import { MONTHS, SAY, WD, WD_LONG, firstWeekdayFrom, isoToday, sayDate } from './daysfmt'

const KEYS: Array<{ k: 'd' | 'n' | 'nf'; cls: FlyCls; text: string }> = [
  { k: 'd', cls: 'day', text: 'D' }, { k: 'n', cls: 'night', text: 'N' }, { k: 'nf', cls: 'nf', text: 'NF' },
]

/* ONE BUTTON OR THREE is asked of the browser, as the windows' own phone layout is (floatwin.ts) — at the app's phone
   width (820px), not the windows' (620px): seven dates across a window narrower than that leave no room for three
   buttons on each (D638). TABS OR SIDE BY SIDE likewise: the two parts beside each other make a window 1094px wide, and
   a form window ("Every <weekday>", the holiday form — 380px, at the left of the screen) must not open over the month
   it is about — under 1510px there is no room for both, so the parts become tabs and the window stays 880px. */
const NARROW = '(max-width:820px)'
const TABBED = '(max-width:1509px)'
function useMedia(query: string): boolean {
  const read = () => typeof window !== 'undefined' && !!window.matchMedia && !!window.matchMedia(query).matches
  const [hit, setHit] = useState(read)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia(query)
    const on = () => setHit(!!mq.matches)
    on()
    if (mq.addEventListener) mq.addEventListener('change', on); else if (mq.addListener) mq.addListener(on)
    return () => { if (mq.removeEventListener) mq.removeEventListener('change', on); else if (mq.removeListener) mq.removeListener(on) }
  }, [query])
  return hit
}
/* the ONE side window that is up, if any: a weekday's "Every …" (0 = Monday), or the holiday form (a line to change,
   null to add; `n` counts the opens, so each "+ Add" is a fresh form) */
type Side = { k: 'every'; wd: number } | { k: 'hol'; line: HolidayLine | null; n: number } | null

/** the phone button's face: the sun, the moon, NF, or a dash for "no flying set" (D577 — sun is day, moon is night) */
function Face({ cls }: { cls: FlyCls }) {
  if (cls === 'day') return <SunIcon />
  if (cls === 'night') return <MoonIcon />
  return <>{cls === 'nf' ? 'NF' : '–'}</>
}

/* A HOLIDAY'S TAG IS ITS SHORT FORM, in the kind's colour - "PH", "OFF", or the squadron's own "ND" (the build plan
   section 3.12; D645, D652): the word the Leave War's Event row prints and the SANS and Inputs months print, from the ONE
   answer (leavewar/sync.ts dayFacts). This month once printed the fixed words "PH" / "OFF", so a National Day read "ND"
   on the other three and "PH" here (the calendar job's bug check, roll-call row A5 - 8 Oct 26). The title carries the
   full name, as an opened day does on the calendars. */
function holidayTitle(iso: string, kind: 'ph' | 'off'): string {
  const word = kind === 'ph' ? 'public holiday' : 'Off day'
  const name = dayFacts(iso).name
  return name && name.toLowerCase() !== (kind === 'ph' ? 'ph' : 'off day') ? `${name} - ${word}` : kind === 'ph' ? 'Public holiday' : 'Off day'
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
  const narrow = useMedia(NARROW)
  const tabbed = useMedia(TABBED)
  const [ym, setYm] = useState(() => ({ y: +at.slice(0, 4), m: +at.slice(5, 7) }))
  const [err, setErr] = useState('')
  const [tab, setTab] = useState<'month' | 'holidays'>('month')
  /* the Holidays list's own year — it starts on the year Days opened on, then moves by its own ‹ › */
  const [holYear, setHolYear] = useState(() => +at.slice(0, 4))
  const [side, setSide] = useState<Side>(null)
  const every = side && side.k === 'every' ? side.wd : null
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

  /* WHERE "EVERY <WEEKDAY>" STARTS: the first such day on screen that is not in the past — on the month today is in,
     the next such day (today counts); on a later month, its first such day; never a day gone by (the plan: "the next
     such day by default"; the fourth mock-up: November on screen, "Thu 5 Nov"). */
  const everyFrom = (wd: number) => firstWeekdayFrom(wd, dates[0] > today ? dates[0] : today)

  return (
    <>
    <FloatWin id="days" title="Calendar" sub="admins only" testid="win-days" className={'dayswin' + (tabbed ? '' : ' two')} onClose={close}>
      {tabbed && (
        <div className="days-tabs" role="tablist" aria-label="Calendar" data-testid="days-tabs">
          {(['month', 'holidays'] as const).map(k => (
            <button key={k} type="button" role="tab" className={'days-tab' + (tab === k ? ' lit' : '')} data-testid={`days-tab-${k}`}
              aria-selected={tab === k} onClick={() => setTab(k)}>{k === 'month' ? 'Month' : 'Holidays'}</button>
          ))}
        </div>
      )}
      <div className="days-parts">
      {(!tabbed || tab === 'month') && (
      <div className="days-part" data-testid="days-part-month">
      <div className="days-head">
        <button type="button" className="abtn" data-testid="days-prev" aria-label="Previous month" onClick={() => step(-1)}>&#8249;</button>
        <span className="days-month" data-testid="days-month" aria-live="polite">{MONTHS[ym.m - 1]} {ym.y}</span>
        <button type="button" className="abtn" data-testid="days-next" aria-label="Next month" onClick={() => step(1)}>&#8250;</button>
        <button type="button" className="abtn" data-testid="days-today" onClick={() => setYm({ y: +today.slice(0, 4), m: +today.slice(5, 7) })}>Today</button>
      </div>
      <p className="days-hint">
        {narrow
          ? 'Tap a date’s button to step: day, night, no fly. Tap a weekday’s heading for every such day.'
          : 'Click D, N or NF on a date. Click a weekday’s heading to set every such day from a date onward.'}
      </p>
      {err && <p className="days-err" data-testid="days-err" role="alert">{err}</p>}
      <div className={'days-grid' + (narrow ? ' narrow' : '')} data-testid="days-grid">
        {WD.map((w, i) => (
          <button
            key={w}
            type="button"
            className={'days-wd' + (i >= 5 ? ' is-we' : '') + (every === i ? ' lit' : '')}
            data-testid={`days-wd-${i}`}
            aria-label={`Every ${WD_LONG[i]}…`}
            aria-haspopup="dialog"
            aria-expanded={every === i}
            onClick={() => setSide({ k: 'every', wd: i })}
          >{w}<span className="days-wd-v" aria-hidden="true">&#9662;</span></button>
        ))}
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
                <span className={'days-tag t-' + a.kind} data-testid={`days-tag-${iso}`} title={holidayTitle(iso, a.kind)}>
                  {dayFacts(iso).short || (a.kind === 'ph' ? 'PH' : 'OFF')}
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
      </div>
      )}
      {(!tabbed || tab === 'holidays') && (
        <HolidaysPanel year={holYear} setYear={setHolYear} onOpen={line => setSide(s => ({ k: 'hol', line, n: (s && s.k === 'hol' ? s.n : 0) + 1 }))} />
      )}
      </div>
    </FloatWin>
    {/* keyed by the weekday, so another heading starts a fresh form */}
    {every !== null && <EveryWeekday key={every} wd={every} from={everyFrom(every)} onClose={() => setSide(null)} />}
    {side && side.k === 'hol' && <HolidayForm key={side.n} line={side.line} year={holYear} onClose={() => setSide(null)} />}
    </>
  )
}
