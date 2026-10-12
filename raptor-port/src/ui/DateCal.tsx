/* THE APP'S ONE DATE CALENDAR — [ONE-DATE-CALENDAR] (the design of record:
   docs/superpowers/specs/2026-10-13-one-date-calendar.md; the pictures he approved: docs/mock/cal-swipe-fit.html).

   Owner, D796 (13 Oct 26), with a photo of his iPhone's own date calendar: "why don't u design the calendar the app
   uses something like this? But instead of reset, we have a today's icon on the right of the year. And there isn't a
   need for the tick arrow at the bottom right. But the style is raptor app style" — and, with a second photo: "Same
   like Apple where u can scroll to the month and year as well". D797: its weeks start on Monday. D795: any date may be
   picked, the weekday standing out.

   WHAT IT IS: a head — the month and year as a title that opens two SCROLLED lists (months beside years), the Today
   icon right of the year, two arrows at the far right; MON … SUN; the dates as round discs in SIX rows always. A tap on
   a date picks it: there is no tick, no Reset and no Clear.
   TWO MODES: one date (`value` / `onPick`), or a run of dates (`from` / `to` / `onRun`) — two taps make a run, a tap on
   a new day starts a finished run over, and a second tap BEFORE the first starts over there (the Leave War's range
   calendar has both rules — leavewar/ui/RangePicker.tsx — and step two of this job folds that calendar into this one).
   WHERE IT SITS is not its business: ui/DateBox.tsx floats it over a form; a form whose dates are what it is for draws
   it as its own body (D797).

   IT KEEPS NOTHING BUT THE MONTH ON SCREEN. The date is its form's — a "yyyy-mm-dd" string, the shape every writer of
   the app already takes — so no stored shape changes with it.

   "TODAY" is the real date (ui/daysfmt.ts isoToday), as the Calendar window's is; the icon goes to today's MONTH and
   picks nothing (the agent's reading, told to him — a tap on today's date picks it).

   Its look: ui/scheduler/26-date-calendar.css. Its class names are prefixed (`dcal-`, `is-`): the scheduler's sheet is
   one global sheet, and its week already owns `.day` (23-days.css says how that was found). */
import { useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { addDays, monthDates, validIso, weekdayOf } from '../state/flyplan-model'
import { MONTHS, isoToday, sayDateY } from './daysfmt'

const DOW = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
/** a row of a month-and-year list is a finger tall */
const ROW = 44
/** how many rows a list holds either side of the one it was last centred on; past half of it, it re-centres */
const SPAN = 60

const ymOf = (iso: string) => ({ y: +iso.slice(0, 4), m: +iso.slice(5, 7) })
const mod12 = (i: number) => ((i % 12) + 12) % 12

/* ONE SCROLLED LIST of the month-and-year chooser. Its rows are whole numbers with no end either way — a year is its
   own number; a month's number goes round (… 10 = November, 11 = December, 12 = January …) — so "the years have no end"
   (a posting may be years back or ahead — owner, 19 Aug 26) and December is followed by January, as on his phone.
   Only a window of them is drawn (`SPAN` either side of `base`), re-centred as it is walked.
   THE CHOSEN ROW is the one in the band across the middle: a finger or a mouse wheel scrolls the list and the row that
   comes to rest there is chosen (the browser's own scroll snapping lands it; `settle` reads it once the scrolling has
   stopped); a tap on a row, or an arrow key, chooses it and the list scrolls it into the band. */
function Wheel({ value, label, onChange, name, tid }: {
  value: number
  label: (i: number) => string
  onChange: (i: number) => void
  name: string
  tid: string
}) {
  const [base, setBase] = useState(value)
  const ref = useRef<HTMLDivElement>(null)
  const first = base - SPAN
  const was = useRef({ first, drawn: false })
  /* a value the list's own scrolling chose: the list is already there, and writing its place would fight the finger */
  const byScroll = useRef(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useLayoutEffect(() => {
    const n = ref.current
    if (!n) return
    /* walked past half the window: re-centre it on the chosen row, and keep what is on screen where it is */
    if (Math.abs(value - base) > SPAN / 2) { setBase(value); return }
    if (was.current.first !== first) { n.scrollTop += (was.current.first - first) * ROW; was.current.first = first }
    const top = (value - first) * ROW
    const jump = !was.current.drawn
    was.current.drawn = true
    if (byScroll.current) { byScroll.current = false; return }
    if (Math.abs(n.scrollTop - top) < 1) return
    const still = jump || !window.matchMedia || window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!still && typeof n.scrollTo === 'function') n.scrollTo({ top, behavior: 'smooth' })
    else n.scrollTop = top
  }, [value, base, first])
  useLayoutEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  const settle = () => {
    const n = ref.current
    if (!n) return
    const at = first + Math.round(n.scrollTop / ROW)
    if (at !== value) { byScroll.current = true; onChange(at) }
  }
  const onScroll = () => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(settle, 110)
  }
  const onKey = (e: KeyboardEvent) => {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return
    e.preventDefault()
    onChange(value + (e.key === 'ArrowDown' ? 1 : -1))
  }

  const rows: ReactNode[] = []
  for (let i = first; i <= base + SPAN; i++) {
    rows.push(
      <div key={i} role="option" id={`${tid}-o${i}`} aria-selected={i === value} className={'dcal-opt' + (i === value ? ' is-at' : '')} onClick={() => onChange(i)}>{label(i)}</div>,
    )
  }
  return (
    <div className="dcal-col" ref={ref} role="listbox" tabIndex={0} aria-label={name} aria-activedescendant={`${tid}-o${value}`}
      data-testid={tid} onScroll={onScroll} onKeyDown={onKey}>{rows}</div>
  )
}

export function DateCal(p: {
  /** one date (the default), or a run of dates */
  mode?: 'one' | 'run'
  /** one date: the date picked, "" for none */
  value?: string
  /** one date: a tap on a date */
  onPick?: (iso: string) => void
  /** a run: its first and last day ("" for none; one day is the same day twice) */
  from?: string
  to?: string
  /** a run: a tap made it, or began it over */
  onRun?: (from: string, to: string) => void
  /** a weekday that stands out (0 = Monday) — "Every Thursday" (D795); every date may still be picked */
  markWd?: number
  /** the first date that may be picked; earlier ones are faint */
  min?: string
  /** the month to open on when no date is picked — a date in it */
  at?: string
  /** today's date; the real one unless a test holds it still */
  today?: string
  /** the prefix of its test ids — a calendar inside a form takes its form's */
  tid?: string
  /** a run said in words beneath, as its form says it */
  foot?: ReactNode
}) {
  const tid = p.tid || 'dcal'
  const run = p.mode === 'run'
  const today = p.today || isoToday()
  const from = run ? p.from || '' : p.value || ''
  const to = run ? p.to || p.from || '' : p.value || ''
  const [ym, setYm] = useState(() => ymOf(validIso(from) ? from : validIso(p.at) ? p.at : validIso(p.min) && p.min > today ? p.min : today))
  const [lists, setLists] = useState(false)
  /* the month list's own number: it goes round, so it is kept apart from the month it stands for */
  const [mi, setMi] = useState(0)
  /* the date the keyboard is on (one tab stop for the whole month), and a date to put the keyboard on once drawn */
  const [kb, setKb] = useState<string | null>(null)
  const want = useRef<string | null>(null)
  const grid = useRef<HTMLDivElement>(null)

  const dates = monthDates(ym.y, ym.m)
  const may = (iso: string) => !p.min || iso >= p.min
  const step = (by: number) => setYm(({ y, m }) => { const n = y * 12 + (m - 1) + by; return { y: Math.floor(n / 12), m: (n % 12) + 1 } })
  const openLists = () => { setMi(ym.m - 1); setLists(v => !v) }
  const goToday = () => { setLists(false); setYm(ymOf(today)) }

  const tap = (iso: string) => {
    if (!may(iso)) return
    setKb(iso)
    if (!run) { p.onPick?.(iso); return }
    /* a finished run starts over; one day stretches forward; a tap before it starts over there */
    if (!from || from !== to || iso < from) p.onRun?.(iso, iso)
    else p.onRun?.(from, iso)
  }

  /* ONE TAB STOP for the whole month — the date the keyboard was last on, else the picked one, else today, else the
     first that may be picked */
  const stop = [kb, from, today].find(d => !!d && d.slice(0, 7) === dates[0].slice(0, 7) && may(d)) || dates.find(may) || ''
  useLayoutEffect(() => {
    const iso = want.current
    if (!iso) return
    const el = grid.current?.querySelector<HTMLElement>(`[data-iso="${iso}"]`)
    if (el) { want.current = null; el.focus({ preventScroll: true }) }
  })
  const onKey = (e: KeyboardEvent) => {
    const cur = (e.target as HTMLElement).getAttribute?.('data-iso')
    if (!cur) return
    let to2 = ''
    if (e.key === 'ArrowLeft') to2 = addDays(cur, -1)
    else if (e.key === 'ArrowRight') to2 = addDays(cur, 1)
    else if (e.key === 'ArrowUp') to2 = addDays(cur, -7)
    else if (e.key === 'ArrowDown') to2 = addDays(cur, 7)
    else if (e.key === 'PageUp' || e.key === 'PageDown') {
      /* the same day of the month before or after — its last day, where that month is shorter */
      const n = +cur.slice(0, 4) * 12 + (+cur.slice(5, 7) - 1) + (e.key === 'PageDown' ? 1 : -1)
      const md = monthDates(Math.floor(n / 12), (n % 12) + 1)
      to2 = md[Math.min(+cur.slice(8, 10), md.length) - 1]
    } else return
    e.preventDefault()
    if (!may(to2)) return
    want.current = to2
    setKb(to2)
    setYm(ymOf(to2))
  }

  const lead = weekdayOf(dates[0])
  const cells: ReactNode[] = []
  for (let i = 0; i < 42; i++) {
    const iso = dates[i - lead]
    if (!iso) { cells.push(<span key={'b' + i} className="dcal-d is-blank" aria-hidden="true" />); continue }
    const wd = i % 7
    const sel = !!from && (iso === from || iso === to)
    const band = !!from && to > from && iso >= from && iso <= to
    const cls = ['dcal-d']
    if (wd >= 5) cls.push('is-we')
    if (p.markWd === wd) cls.push('is-mk')
    if (iso === today) cls.push('is-today')
    if (sel) cls.push('is-sel')
    if (band) cls.push('is-in', iso === from ? 'is-from' : iso === to ? 'is-to' : 'is-mid')
    if (!may(iso)) cls.push('is-out')
    cells.push(
      <button key={iso} type="button" className={cls.join(' ')} data-iso={iso} data-testid={`${tid}-day-${iso}`}
        tabIndex={iso === stop ? 0 : -1} disabled={!may(iso)} aria-pressed={sel}
        aria-label={sayDateY(iso) + (sel ? ', picked' : iso === today ? ', today' : '')}
        onClick={() => tap(iso)}><b>{+iso.slice(8, 10)}</b></button>,
    )
  }

  return (
    <div className={'dcal' + (p.markWd != null ? ' is-marked' : '')} data-testid={tid} data-month={dates[0].slice(0, 7)}>
      <div className="dcal-hd">
        <button type="button" className={'dcal-title' + (lists ? ' is-open' : '')} data-testid={`${tid}-title`} aria-expanded={lists}
          aria-label={`${MONTHS[ym.m - 1]} ${ym.y} — ${lists ? 'show the dates' : 'choose the month and year'}`} onClick={openLists}>
          <span className="dcal-my">{MONTHS[ym.m - 1]} {ym.y}</span><i aria-hidden="true">{lists ? '▾' : '›'}</i>
        </button>
        {/* the page with today's number — the icon "Jump to a date" has (08-windows-tools.css `.wc-today`) */}
        <button type="button" className="wc-today" data-testid={`${tid}-today`} aria-label="Go to today" title="Go to today" onClick={goToday}>
          <span className="wc-pg"><span className="wc-n">{+today.slice(8, 10)}</span></span>
        </button>
        <span className="dcal-sp" />
        {!lists && <button type="button" className="dcal-nav" data-testid={`${tid}-prev`} aria-label="Previous month" onClick={() => step(-1)}>&#8249;</button>}
        {!lists && <button type="button" className="dcal-nav" data-testid={`${tid}-next`} aria-label="Next month" onClick={() => step(1)}>&#8250;</button>}
      </div>
      {lists ? (
        <div className="dcal-lists" data-testid={`${tid}-lists`}>
          <div className="dcal-band" aria-hidden="true" />
          <Wheel tid={`${tid}-months`} name="Month" value={mi} label={i => MONTHS[mod12(i)]}
            onChange={i => { setMi(i); setYm(v => ({ y: v.y, m: mod12(i) + 1 })) }} />
          <Wheel tid={`${tid}-years`} name="Year" value={ym.y} label={i => String(i)} onChange={y => setYm(v => ({ y, m: v.m }))} />
        </div>
      ) : (
        <>
          <div className="dcal-dow" data-testid={`${tid}-dow`} aria-hidden="true">
            {DOW.map((d, i) => <span key={d} className={p.markWd === i ? 'is-mk' : undefined}>{d}</span>)}
          </div>
          <div className="dcal-grid" data-testid={`${tid}-grid`} ref={grid} role="group" aria-label={`${MONTHS[ym.m - 1]} ${ym.y}`} onKeyDown={onKey}>{cells}</div>
        </>
      )}
      {p.foot != null && <div className="dcal-foot" data-testid={`${tid}-foot`}>{p.foot}</div>}
    </div>
  )
}
