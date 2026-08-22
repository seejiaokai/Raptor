/* Full-screen month-calendar view for the Inputs page (owner ask, Aug 26 —
   see a whole month of leave, activities and SANS offers at a glance instead
   of scrolling the table). A REACT component, not a string builder like the
   week/board/palette (CLAUDE.md: "React owns chrome, strings own density").
   Those surfaces earn the innerHTML/string-diff discipline because they are
   DENSE (hundreds of nodes) and carry a phone perf ceiling and byte-exact
   reference parity. Neither applies here: this is a NEW surface — at most 42
   day cells carrying a handful of chips apiece, a few hundred nodes total —
   with no reference to stay parity with, and its free-text fields (the day
   popover, a later task) will live in ordinary component state, where
   React's own diffing is exactly the right tool; there is no caret position
   to preserve across an innerHTML replace the way there is on the week grid.

   THIS TASK builds the shell, the table/calendar toggle, and the chips'
   DISPLAY only — the day popover, hold-to-add and drag are separate, later
   tasks. `data-icday`, `data-iid`/`data-pid`, `data-icdrag` and `data-icmore`
   are those tasks' contract; no pointer handlers are wired to any of them
   yet, on purpose. */
import { useEffect } from 'react'
import { INPUTS, inputCoversDate, inpLabel } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { hhmm } from '../engine/time'
import { PLANPUCKS, DAYRMK } from '../state/plan'
import { CALMONTH, setCalMonth } from '../state/view'
import { fmt, inputTone } from './inputedit'
import { INPEDIT } from './pops'
import { useVersion } from './useStore'

const MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December']
const DOW = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

/* COUNT-based overflow, deliberately not height-based: a height cutoff needs
   a real box model per screen size (the phone chip is a bare colour bar, the
   desktop one carries text, so "how many fit" is a different number on each)
   and jsdom renders no layout at all, so a height rule could never be pinned
   by a test — only eyeballed on the live view, forever. A count is the same
   rule on every screen and is exactly what a test can assert against. */
export const MAX_CHIPS = 3

/* yyyy-mm-dd → today's own iso, local time (the calendar's "Today" jump and
   its today-ring both want the viewer's own day, not UTC's). */
const isoToday = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/* The grid for one month, Monday-first (m is 1-12, calendar convention, the
   same as CALMONTH). Pure and exported so a test can assert the shape
   directly rather than parsing rendered DOM for it. */
export function monthCells(y: number, m: number): (string | null)[] {
  const first = new Date(Date.UTC(y, m - 1, 1))
  /* JS getUTCDay() is Sunday-first; this rotates it Mon=0…Sun=6, the same
     rotation RangeCal.tsx uses for its own grid. */
  const lead = (first.getUTCDay() + 6) % 7
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate()
  const cells: (string | null)[] = []
  for (let i = 0; i < lead; i++) cells.push(null)
  for (let d = 1; d <= days; d++) cells.push(`${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`)
  while (cells.length % 7) cells.push(null)
  return cells
}

/* One day cell's content: every input covering `iso`, filtered exactly the
   way InputsPage's own table filters its rows (~line 368-370 there) so the
   calendar and the list can never disagree about what a filter hides — plus
   whatever plan pucks were dropped on that day. Pure and exported so the
   chip tests can drive a day directly instead of steering the whole page
   through the DOM to get there. */
export function dayEntries(iso: string, f: { fPerson: string, fType: string, fSearch: string }) {
  const label = fmt(iso)
  let inputs = INPUTS.filter((r: any) => inputCoversDate(r, label))
  if (f.fPerson !== 'all') inputs = inputs.filter((r: any) => r.person === f.fPerson)
  if (f.fType !== 'all') inputs = inputs.filter((r: any) => r.type === f.fType)
  if (f.fSearch) {
    const s = f.fSearch.toLowerCase()
    inputs = inputs.filter((r: any) =>
      (r.remarks || '').toLowerCase().includes(s) ||
      (PEOPLE[r.person] ? PEOPLE[r.person].cs.toLowerCase() : '').includes(s))
  }
  /* red (absent) above amber (a local commitment) above purple (SANS, not an
     absence at all) — the same read order the table's row stripes imply,
     then all-day before timed, then earliest start, then callsign. */
  const TONE_ORDER: any = { red: 0, amb: 1, san: 2 }
  inputs = inputs.slice().sort((a: any, b: any) => {
    const dt = TONE_ORDER[inputTone(a.type)] - TONE_ORDER[inputTone(b.type)]
    if (dt) return dt
    if (a.allday !== b.allday) return a.allday ? -1 : 1
    const sa = a.allday ? 0 : (a.s ?? 0), sb = b.allday ? 0 : (b.s ?? 0)
    if (sa !== sb) return sa - sb
    const csA = PEOPLE[a.person] ? PEOPLE[a.person].cs : String(a.person)
    const csB = PEOPLE[b.person] ? PEOPLE[b.person].cs : String(b.person)
    return csA.localeCompare(csB)
  })
  const pucks = PLANPUCKS.filter((p: any) => p.date === iso)
  return { inputs, pucks }
}

export function InputsCal({ fPerson, fType, fSearch, seedIso, onClose }:
  { fPerson: string, fType: string, fSearch: string, seedIso?: string, onClose: () => void }) {
  useVersion()

  /* CALMONTH starts null (state/view.ts) — nobody has opened the calendar
     yet — so the FIRST open derives a month from whatever window the table
     itself is showing (its `range.from`, or today when the table has no
     lower bound) rather than defaulting to "now" and possibly landing
     nowhere near what the scheduler was just looking at. Once a month is
     picked it stays exactly there for the life of the session, the same
     carried-state idea view.ts's own CARRYDAY already uses. */
  useEffect(() => {
    if (CALMONTH) return
    const seed = seedIso || isoToday()
    const y = +seed.slice(0, 4), m = +seed.slice(5, 7)
    const now = new Date()
    setCalMonth({ y: isFinite(y) && y ? y : now.getFullYear(), m: isFinite(m) && m ? m : now.getMonth() + 1 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* BODY SCROLL-LOCK — same pattern and the same reason as the scheduler
     board's own (SchedBoard.tsx lines ~60-90): this overlay is
     position:fixed over the whole viewport, and without this the page
     underneath it stays a live scrolling document that a stray drag can
     still reach. The scroll position is captured and put back by hand on
     close, so returning to the table lands exactly where it was left. */
  useEffect(() => {
    const el = document.scrollingElement || document.documentElement
    const y = el.scrollTop, x = el.scrollLeft
    document.body.classList.add('sb-lock')
    return () => {
      document.body.classList.remove('sb-lock')
      el.scrollTop = y; el.scrollLeft = x
    }
  }, [])

  /* Escape closes the overlay, the same capture-phase idiom inputedit.tsx's
     own dialog uses (~line 650) — captured so it fires ahead of anything
     else on the page that might also be listening for the key. It stands
     DOWN while the input-edit modal is open above this overlay: both
     listeners sit on the same document in the capture phase, where
     stopPropagation cannot silence a sibling listener (only
     stopImmediatePropagation between listeners of ONE registration could),
     so without this guard one Escape would close the modal AND the calendar
     under it in a single press. */
  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || INPEDIT) return
      e.stopPropagation(); onClose()
    }
    document.addEventListener('keydown', esc, true)
    return () => document.removeEventListener('keydown', esc, true)
  }, [onClose])

  const cur = CALMONTH || { y: new Date().getFullYear(), m: new Date().getMonth() + 1 }
  /* year rollover mirrors RangeCal.tsx's own step(), adjusted for CALMONTH's
     1-12 month (RangeCal's `view.m` is the 0-11 a JS Date uses) */
  const step = (n: number) => {
    const m0 = (cur.m - 1) + n
    setCalMonth({ y: cur.y + Math.floor(m0 / 12), m: ((m0 % 12) + 12) % 12 + 1 })
  }
  const goToday = () => { const d = new Date(); setCalMonth({ y: d.getFullYear(), m: d.getMonth() + 1 }) }

  const cells = monthCells(cur.y, cur.m)
  const todayIso = isoToday()

  /* a month emptied by a filter has to say WHY — the product bar's "real
     empty states" rule — so any active filter earns a header pill naming
     what is hiding the rest of the picture. */
  const active = fPerson !== 'all' || fType !== 'all' || !!fSearch
  const pillParts: string[] = []
  if (fPerson !== 'all') pillParts.push(PEOPLE[fPerson] ? PEOPLE[fPerson].cs : String(fPerson))
  if (fType !== 'all') pillParts.push(fType)
  if (fSearch) pillParts.push(`"${fSearch}"`)

  return (
    <div className="inpcal" id="inpCal">
      <div className="ic-head">
        <button type="button" className="abtn" id="icPrev" aria-label="Previous month" onClick={() => step(-1)}>‹</button>
        <span className="ic-mon">{MON[cur.m - 1]} {cur.y}</span>
        <button type="button" className="abtn" id="icNext" aria-label="Next month" onClick={() => step(1)}>›</button>
        <button type="button" className="abtn" id="icToday" onClick={goToday}>Today</button>
        {active && <span className="ic-filterpill">filtered: {pillParts.join(' · ')}</span>}
        <button type="button" className="abtn" id="icClose" onClick={onClose}>✕ List</button>
      </div>
      <div className="ic-dow">{DOW.map(d => <span key={d}>{d}</span>)}</div>
      <div className="ic-grid">
        {cells.map((iso, i) => {
          if (!iso) return <div key={i} className="ic-x" />
          const wk = i % 7 >= 5
          const isToday = iso === todayIso
          const { inputs, pucks } = dayEntries(iso, { fPerson, fType, fSearch })
          const chips = [
            ...inputs.map((r: any) => ({ kind: 'input' as const, row: r })),
            ...pucks.map((p: any) => ({ kind: 'puck' as const, row: p })),
          ]
          const shown = chips.slice(0, MAX_CHIPS)
          const extra = chips.length - shown.length
          const day = +iso.slice(8, 10)
          const rmk = DAYRMK[iso]
          return (
            <div key={iso} className={'ic-day' + (isToday ? ' ic-today' : '') + (wk ? ' ic-wk' : '')} data-icday={iso}>
              <div className="ic-num">{day}</div>
              {rmk && <div className="ic-rmk" title={rmk}>{rmk}</div>}
              {shown.map(c => c.kind === 'input' ? (
                <div key={'i' + c.row.iid} className={'ic-chip ' + inputTone(c.row.type)} data-iid={c.row.iid} data-icdrag>
                  {PEOPLE[c.row.person] ? PEOPLE[c.row.person].cs : c.row.person} {inpLabel(c.row)}
                  {!c.row.allday ? ` ${hhmm(c.row.s)}–${hhmm(c.row.e)}` : ''}
                </div>
              ) : (
                <div key={'p' + c.row.id} className="ic-chip plan" data-pid={c.row.id} data-icdrag>{c.row.text}</div>
              ))}
              {extra > 0 && <button type="button" className="ic-more" data-icmore={iso}>+{extra} more</button>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
