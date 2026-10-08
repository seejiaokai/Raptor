/* DAYS — THE YEAR'S HOLIDAYS (the build plan docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.4, §3.12).

   Owner, D631 (7 Oct 26): "the year's public holidays are seen and set in one list." D638: "a public holiday and an Off
   day each have two doors onto ONE record — the Leave War's Event row, the Holidays list." D652: "the Holidays list's
   'Add a day' form carries the short form too — 'On grid' beside the name — because it writes the same record the Leave
   War's Event sheet does."

   THE LIST IS THE WAR'S OWN RECORD SEEN AS A LIST — it keeps nothing. `HolidaysPanel` draws leavewar/sync.ts
   `holidaysIn(year)`: one line per public holiday or Off day — its date or run of dates, its name, a PH or OFF tag —
   the ones already over dimmed. It is drawn by Days, which repaints on the war's signal (`useWarFacts`), so a holiday
   set on the Leave War's Event row appears here at once, and one saved here appears there.

   THE FORM (`HolidayForm`) is a window on the windows shell (D641 — "adding a holiday" is one of the windows of the
   mock-ups that can be dragged and leave the page working). It writes with the war's three commands — `holidayAdd`,
   `holidayChange`, `holidayRemove` — one named command and one Undo step each; which period a date goes to, the Event
   row it takes, a band for a run are theirs (leavewar/state/store.ts), and every refusal of theirs is said in the
   window with what he typed left as it was.

   ITS DATES ARE PICKED ON THE LEAVE WAR'S OWN RANGE CALENDAR (owner, D671, 8 Oct 26 — "Instead of selecting first day
   and last day. Could u use the same calendar interface and logic for selecting start and end date?", with a picture of
   the war's Event sheet): `leavewar/ui/RangePicker` itself, not a copy — one tap is one day, a second tap on a later
   day makes the run, the span said in words beneath, "Clear". (The two date boxes it replaces also ran off the form's
   edge on an iPhone.) A new holiday opens with NOTHING picked — a date he did not choose is never saved, and in this
   picker a day already picked is a START, so his first tap would have made a run from it — on the month of today (this
   year's list) or that January (another year's). A line being changed opens with its own day or run picked.

   A DATE NO LEAVE PERIOD COVERS has nowhere to be written (a holiday lives in the period HOLDING its date). The list
   says so before he tries: where no period reaches the year at all, D19's line and its way out — "No leave period
   covers 2027 yet. Create it" (`createOilPeriodFor`, a whole year, in draft); where the year is covered in part, the
   dates left out are named, each run with a button that asks the Leave War for its OWN New-period sheet on those dates
   (`sync.ts openNewPeriod` — nothing about making a period is rebuilt here).

   AND A HOLIDAY REFUSED FOR THAT REASON WAITS. The form keeps what he typed, offers the same way out, and saves the
   holiday BY ITSELF the moment a leave period covers its first day — however that period came to be (the plan §3.4:
   "the holiday being added is kept and saved once that period exists"). An edit, Cancel or ✕ ends the wait: what is
   saved is only ever what the form held when he pressed Save. */
import { useEffect, useState } from 'react'
import { FloatWin } from './FloatWindow'
import {
  createOilPeriodFor, holidayAdd, holidayChange, holidayRemove, holidayWord, holidaysIn, openNewPeriod, uncoveredIn,
  MAX_HOLIDAY_NAME, type HolidayDraft, type HolidayLine, type HolidayResult,
} from '../leavewar/sync'
import { RangePicker, type Range } from '../leavewar/ui/RangePicker'
import { addDays, validIso, weekdayOf } from '../state/flyplan-model'
import { MONTHS, WD, isoToday, sayDate } from './daysfmt'

type Kind = 'ph' | 'off'
const KIND_SAID: Record<Kind, string> = { ph: 'public holiday', off: 'Off day' }
const TAG: Record<Kind, string> = { ph: 'PH', off: 'OFF' }
/** a line's dates as the list says them: "Mon 9 Nov"; a run inside one month names the month once — "Mon 28 – Wed 30
 *  Dec" — and one across two names both, "Thu 31 Dec – Fri 1 Jan" */
const when = (from: string, to: string): string => {
  if (to <= from) return sayDate(from)
  return from.slice(0, 7) === to.slice(0, 7) ? `${WD[weekdayOf(from)]} ${+from.slice(8, 10)} – ${sayDate(to)}` : `${sayDate(from)} – ${sayDate(to)}`
}
/** "1 Apr" */
const dayMon = (iso: string): string => `${+iso.slice(8, 10)} ${MONTHS[+iso.slice(5, 7) - 1].slice(0, 3)}`
/** a run of dates no period covers, as the notice says it: "1 Apr – 31 Dec", or "5 Apr" for one day */
type Gap = { from: string; to: string }
const gapSaid = (g: Gap): string => (g.to > g.from ? `${dayMon(g.from)} – ${dayMon(g.to)}` : dayMon(g.from))
/** one run that is the whole year: no period reaches it at all */
const wholeYear = (g: Gap): boolean => g.from === `${g.from.slice(0, 4)}-01-01` && g.to === `${g.from.slice(0, 4)}-12-31`
/** the run of uncovered dates a date sits in, or null where a leave period holds it */
const gapOf = (iso: string): Gap | null => (validIso(iso) ? uncoveredIn(iso.slice(0, 4)).find(g => g.from <= iso && iso <= g.to) ?? null : null)
/** why the year could not be created, in a sentence */
const createWhy = (made: string, year: string | number): string => (made === 'created' ? '' : made === 'overlap'
  ? `A leave period already covers part of ${year} — open the Leave War and extend it instead.`
  : `The ${year} leave period could not be created.`)

export function HolidaysPanel({ year, setYear, onOpen }: {
  year: number
  setYear: (y: number) => void
  /** open the form: a line to change it, null to add one */
  onOpen: (line: HolidayLine | null) => void
}) {
  const [why, setWhy] = useState('')
  const lines = holidaysIn(year)
  const gaps = uncoveredIn(year)
  const today = isoToday()
  const none = gaps.length === 1 && wholeYear(gaps[0])
  const createYear = () => setWhy(createWhy(createOilPeriodFor(String(year)), year))
  const step = (by: number) => { setWhy(''); setYear(year + by) }

  return (
    <div className="hol" data-testid="days-part-holidays">
      <div className="hol-head">
        <span className="hol-ttl">Holidays</span>
        <button type="button" className="abtn" data-testid="hol-prev" aria-label="Previous year" onClick={() => step(-1)}>&#8249;</button>
        <span className="hol-year" data-testid="hol-year" aria-live="polite">{year}</span>
        <button type="button" className="abtn" data-testid="hol-next" aria-label="Next year" onClick={() => step(1)}>&#8250;</button>
        <button type="button" className="abtn primary" data-testid="hol-add" onClick={() => onOpen(null)}>+ Add</button>
      </div>
      <p className="days-hint">Public holidays and Off days, the whole year.</p>
      {gaps.length > 0 && (
        <div className="hol-nocover" data-testid="hol-nocover" role="status">
          <span>{none
            ? `No leave period covers ${year} yet.`
            : `No leave period covers ${gaps.map(gapSaid).join(' or ')} ${year} yet.`}</span>
          {none && <button type="button" className="abtn" data-testid="hol-create-year" onClick={createYear}>Create it</button>}
          {/* covered in part: the Leave War's own New-period sheet, on each run left out */}
          {!none && gaps.map(g => (
            <button key={g.from} type="button" className="abtn" data-testid={`hol-new-period-${g.from}`} onClick={() => openNewPeriod(g.from, g.to)}>
              Add a period for {gapSaid(g)}…
            </button>
          ))}
          {why && <span className="hol-why" data-testid="hol-why" role="alert">{why}</span>}
        </div>
      )}
      {lines.length === 0
        ? !none && <p className="hol-empty" data-testid="hol-empty">No public holidays or Off days in {year}.</p>
        : (
          <div className="hol-list" data-testid="hol-list">
            {lines.map(h => (
              <button
                key={h.id}
                type="button"
                className={'hol-line' + (h.to < today ? ' is-past' : '')}
                data-from={h.from}
                aria-label={`Change: ${h.name}, ${when(h.from, h.to)}, ${KIND_SAID[h.kind]}`}
                onClick={() => onOpen(h)}
              >
                <span className="hol-when">{when(h.from, h.to)}</span>
                <span className="hol-name">{h.name}</span>
                <span className={'hol-tag t-' + h.kind}>{TAG[h.kind]}</span>
              </button>
            ))}
          </div>
        )}
    </div>
  )
}

export function HolidayForm({ line, year, onClose }: {
  /** the line being changed; null = a new one */
  line: HolidayLine | null
  /** the year the list is showing — where a new one starts */
  year: number
  onClose: () => void
}) {
  const today = isoToday()
  /* a line being changed: its own day or run. A new one: nothing — he picks it (D671) */
  const first: Range | null = line ? { from: line.from, to: line.to } : null
  const [kind, setKind] = useState<Kind>(line ? line.kind : 'ph')
  const [name, setName] = useState(line ? line.name : '')
  /* ON GRID: what the calendars and the grid print for it. A line being changed shows what it prints now; left alone,
     a change keeps the short form the holiday had (the store's rule) — so only a box he TOUCHED is sent */
  const [short, setShort] = useState(line && line.short ? line.short : '')
  const [shortTouched, setShortTouched] = useState(false)
  const [range, setRange] = useState<Range | null>(first)
  /* the month the calendar opens on while nothing is picked: today's on this year's list, January on another year's;
     after "Save and add another", the month of the day after the one just saved. The calendar keeps which month it is
     showing, so it is drawn afresh (`calKey`) when that moves */
  const [anchor, setAnchor] = useState(+today.slice(0, 4) === year ? today : `${year}-01-01`)
  const [calKey, setCalKey] = useState(0)
  const from = range ? range.from : ''
  const [err, setErr] = useState('')
  const [saved, setSaved] = useState('')
  /* refused because no leave period covers its first day: it is kept, and saved by itself once one does */
  const [waiting, setWaiting] = useState(false)
  /* any edit takes the last complaint — and the last "Saved" note — down: they were about what the form held then. And
     it ends a wait: what is saved by itself is only ever what the form held when he pressed Save */
  const edit = () => { setErr(''); setSaved(''); setWaiting(false) }
  /* what a save would hold, or the sentence that says what is missing */
  const draft = (): HolidayDraft | string => {
    if (!range) return 'Pick its day — or its first and last day — on the calendar.'
    const d: HolidayDraft = { kind, name, from: range.from, to: range.to }
    if (line ? shortTouched : short.trim() !== '') d.short = short
    return d
  }
  const refused = (r: HolidayResult): boolean => {
    if (r.ok) return false
    setErr(r.message); setWaiting(r.reason === 'noperiod')
    return true
  }
  const save = (more: boolean) => {
    const d = draft()
    if (typeof d === 'string') { setSaved(''); setWaiting(false); setErr(d); return }
    if (refused(line ? holidayChange(line, d) : holidayAdd(d))) { setSaved(''); return }
    setWaiting(false)
    if (!more) { onClose(); return }
    /* "Save and add another": the kind stays, the calendar is on the month of the day after with nothing picked, the
       name and its short form are cleared */
    const next = addDays(d.to, 1)
    setErr(''); setSaved(`Saved: ${name.trim() || holidayWord(kind)}, ${when(d.from, d.to)}.`)
    setName(''); setShort(''); setShortTouched(false); setRange(null); setAnchor(next); setCalKey(k => k + 1)
  }
  const remove = () => { if (line && !refused(holidayRemove(line))) onClose() }

  /* THE WAIT. While it waits, the run of uncovered dates its first day sits in is read at every paint (Days repaints on
     the war's signal); the moment there is none — a period now holds that day — the same Save is pressed for him.
     Refused again for another reason (the period ends before its last day), it says so and stops waiting. */
  const gap = waiting ? gapOf(from) : null
  const coveredNow = waiting && validIso(from) && !gap
  useEffect(() => {
    if (coveredNow) save(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fires on the moment of cover; `save` is this paint's own
  }, [coveredNow])
  const createYear = () => {
    const y = from.slice(0, 4)
    const why = createWhy(createOilPeriodFor(y), y)
    if (why) { setWaiting(false); setErr(why) }
  }

  return (
    <FloatWin id="holiday" title={line ? 'Change a holiday' : 'Add a holiday'} testid="win-holiday" className="everywin holwin" onClose={onClose}>
      <div className="every-lab" id="holKindLab">Kind</div>
      <div className="every-seg two" role="group" aria-labelledby="holKindLab">
        {(['ph', 'off'] as const).map(k => (
          <button
            key={k}
            type="button"
            className={'every-opt' + (kind === k ? ' lit' : '')}
            data-testid={`hol-kind-${k}`}
            aria-pressed={kind === k}
            onClick={() => { edit(); setKind(k) }}
          >{k === 'ph' ? 'Public holiday' : 'Off day'}</button>
        ))}
      </div>

      <div className="hol-row">
        <label className="hol-f grow">
          <span className="every-lab">Name</span>
          {/* the empty box shows the word it will be saved under */}
          <input type="text" className="every-date" data-testid="hol-name" maxLength={MAX_HOLIDAY_NAME} placeholder={holidayWord(kind)} value={name}
            autoComplete="off" onChange={e => { edit(); setName(e.target.value) }} />
        </label>
        <label className="hol-f short">
          <span className="every-lab">On grid</span>
          <input type="text" className="every-date" data-testid="hol-short" maxLength={3} value={short} autoComplete="off" autoCapitalize="characters"
            title="What the calendars and the Leave War grid print for it — one to three letters or digits"
            onChange={e => { edit(); setShortTouched(true); setShort(e.target.value.toUpperCase()) }} />
        </label>
      </div>

      <div className="every-lab">Dates</div>
      {/* the Leave War's own range calendar (D671); `data-from` / `data-to` say what is picked, for the tests */}
      <div className="hol-cal" data-testid="hol-dates" data-from={range ? range.from : ''} data-to={range ? range.to : ''}>
        <RangePicker key={calKey} testid="holcal" compact anchor={anchor} value={range} onChange={r => { edit(); setRange(r) }} />
      </div>

      {saved && <p className="hol-saved" data-testid="hol-saved" role="status">{saved}</p>}
      {err && <p className="every-err" data-testid="hol-err" role="alert">{err}</p>}
      {waiting && gap && (
        <div className="hol-wait">
          <p className="hol-waiting" data-testid="hol-waiting" role="status">It is kept here, and saved by itself as soon as a leave period covers it.</p>
          {wholeYear(gap)
            ? <button type="button" className="abtn" data-testid="hol-wait-create" onClick={createYear}>Create the {gap.from.slice(0, 4)} leave period</button>
            : <button type="button" className="abtn" data-testid="hol-wait-period" onClick={() => openNewPeriod(gap.from, gap.to)}>Add a leave period for {gapSaid(gap)}…</button>}
        </div>
      )}
      {/* the buttons stay at the foot of the form while it scrolls under them: with the calendar in it the form is
          taller than a short phone, and Save — and Delete, on a line being changed — must never be under the fold */}
      <div className="every-acts three hol-acts">
        {line
          ? <button type="button" className="abtn danger" data-testid="hol-delete" aria-label={`Delete this ${KIND_SAID[line.kind]}`} onClick={remove}>Delete</button>
          : <button type="button" className="abtn" data-testid="hol-cancel" onClick={onClose}>Cancel</button>}
        {line
          ? <button type="button" className="abtn" data-testid="hol-cancel" onClick={onClose}>Cancel</button>
          : <button type="button" className="abtn" data-testid="hol-save-more" onClick={() => save(true)}>Save and add another</button>}
        <button type="button" className="abtn primary" data-testid="hol-save" onClick={() => save(false)}>Save</button>
      </div>
    </FloatWin>
  )
}
