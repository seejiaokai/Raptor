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

   A DATE NO LEAVE PERIOD COVERS has nowhere to be written (a holiday lives in the period HOLDING its date). The list
   says so before he tries: where no period reaches the year at all, D19's line and its way out — "No leave period
   covers 2027 yet. Create it" (`createOilPeriodFor`, a whole year, in draft); where the year is covered in part, the
   dates left out are named. */
import { useState } from 'react'
import { FloatWin } from './FloatWindow'
import {
  createOilPeriodFor, holidayAdd, holidayChange, holidayRemove, holidayWord, holidaysIn, uncoveredIn,
  MAX_HOLIDAY_NAME, type HolidayDraft, type HolidayLine, type HolidayResult,
} from '../leavewar/sync'
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
const gapSaid = (g: { from: string; to: string }): string => (g.to > g.from ? `${dayMon(g.from)} – ${dayMon(g.to)}` : dayMon(g.from))

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
  /* one run that is the whole year: no period reaches it at all */
  const none = gaps.length === 1 && gaps[0].from === `${year}-01-01` && gaps[0].to === `${year}-12-31`
  const createYear = () => {
    const made = createOilPeriodFor(String(year))
    setWhy(made === 'created' ? '' : made === 'overlap'
      ? `A leave period already covers part of ${year} — open the Leave War and extend it instead.`
      : `The ${year} leave period could not be created.`)
  }
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
  /* a new one starts today on this year's list, and on the first day of any other year's */
  const first = line ? line.from : +today.slice(0, 4) === year ? today : `${year}-01-01`
  const [kind, setKind] = useState<Kind>(line ? line.kind : 'ph')
  const [name, setName] = useState(line ? line.name : '')
  /* ON GRID: what the calendars and the grid print for it. A line being changed shows what it prints now; left alone,
     a change keeps the short form the holiday had (the store's rule) — so only a box he TOUCHED is sent */
  const [short, setShort] = useState(line && line.short ? line.short : '')
  const [shortTouched, setShortTouched] = useState(false)
  const [from, setFrom] = useState(first)
  const [to, setTo] = useState(line ? line.to : first)
  const [err, setErr] = useState('')
  const [saved, setSaved] = useState('')
  /* any edit takes the last complaint — and the last "Saved" note — down: they were about what the form held then */
  const edit = () => { setErr(''); setSaved('') }
  /* the last day follows the first while the two are one day, and never falls before it */
  const pickFrom = (v: string) => {
    edit()
    if (to === from || (validIso(v) && to < v)) setTo(v)
    setFrom(v)
  }

  /* what a save would hold, or the sentence that says what is missing */
  const draft = (): HolidayDraft | string => {
    if (!validIso(from)) return 'Choose its first day.'
    const last = validIso(to) ? to : from
    if (last < from) return 'The last day cannot be before the first.'
    const d: HolidayDraft = { kind, name, from, to: last }
    if (line ? shortTouched : short.trim() !== '') d.short = short
    return d
  }
  const refused = (r: HolidayResult): boolean => { if (r.ok) return false; setErr(r.message); return true }
  const save = (more: boolean) => {
    const d = draft()
    if (typeof d === 'string') { setSaved(''); setErr(d); return }
    if (refused(line ? holidayChange(line, d) : holidayAdd(d))) { setSaved(''); return }
    if (!more) { onClose(); return }
    /* "Save and add another": the kind stays, the day after is ready, the name and its short form are cleared */
    const next = addDays(d.to, 1)
    setErr(''); setSaved(`Saved: ${name.trim() || holidayWord(kind)}, ${when(d.from, d.to)}.`)
    setName(''); setShort(''); setShortTouched(false); setFrom(next); setTo(next)
  }
  const remove = () => { if (line && !refused(holidayRemove(line))) onClose() }

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

      <div className="hol-row">
        <label className="hol-f grow">
          <span className="every-lab">First day</span>
          <input type="date" className="every-date" data-testid="hol-from" value={from} onChange={e => pickFrom(e.target.value)} />
        </label>
        <label className="hol-f grow">
          <span className="every-lab">Last day</span>
          <input type="date" className="every-date" data-testid="hol-to" min={validIso(from) ? from : undefined} value={to} onChange={e => { edit(); setTo(e.target.value) }} />
        </label>
      </div>

      {saved && <p className="hol-saved" data-testid="hol-saved" role="status">{saved}</p>}
      {err && <p className="every-err" data-testid="hol-err" role="alert">{err}</p>}
      <div className={'every-acts' + (line ? '' : ' three')}>
        <button type="button" className="abtn" data-testid="hol-cancel" onClick={onClose}>Cancel</button>
        {!line && <button type="button" className="abtn" data-testid="hol-save-more" onClick={() => save(true)}>Save and add another</button>}
        <button type="button" className="abtn primary" data-testid="hol-save" onClick={() => save(false)}>Save</button>
      </div>
      {line && (
        <div className="hol-del">
          <button type="button" className="abtn danger" data-testid="hol-delete" onClick={remove}>Delete this {KIND_SAID[line.kind]}</button>
        </div>
      )}
    </FloatWin>
  )
}
