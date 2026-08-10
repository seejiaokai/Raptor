/* The Personal inputs page — markup mirrored 1:1 from the reference (same
   ids, classes and columns), behaviour through the store. The add/delete
   logic is the reference's verbatim, including the role gate that keeps a
   member view-only, and both go through writeInputs so they join the undo
   stack and re-validate the week. */
import { useEffect, useRef, useState } from 'react'
import { INPUTS, INPUT_TYPES, TYPE_GROUPS, DATES, inpMeta, typeGroup, inputCoversDate, isLateInput, lateNote } from '../engine/inputs'
import { acceptInput, unacceptInput, acceptedDay } from '../engine/slots'
import { PEOPLE } from '../engine/people'
import { hhmm, parseHM } from '../engine/time'
import { HOOKS } from '../engine/hooks'
import { ME } from '../state/auth'
import { writeInputs, writeInputsBatch, notify } from '../state/store'
import { useVersion } from './useStore'
import { exportCSV } from './export'
import { RangeCal } from './RangeCal'

const people = () => Object.keys(PEOPLE).filter(id => !PEOPLE[id].archived)
  .sort((a, b) => PEOPLE[a].cs.localeCompare(PEOPLE[b].cs))

const MON = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/* the reference's date formatter, verbatim (yyyy-mm-dd → 'Jul 14') */
const fmt = (d: any) => { if (!d) return DATES[0]; const [, m, da] = d.split('-'); return MON[+m] + ' ' + String(+da) }

/* The remarks tail (owner, Aug 26). Closing a range on the calendar writes its
   last day into Remarks as `till 15 Jul`, so a multi-day input says how long it
   runs wherever remarks are read — nobody has to type it, and nobody forgets.

   The tail belongs to the CALENDAR, not the typist: re-picking rewrites it and
   starting a fresh range removes it. Everything in front of it is the typist's
   and is kept verbatim, so `LL till 15 Jul` becomes `LL till 17 Jul` when the
   end moves — the whole point of the ask. It is matched anchored at the END
   because that is where the calendar puts it; text typed AFTER it is prose the
   calendar has no business rewriting, so it is left alone. */
const TILL = /\s*till\s+\d{1,2}\s+[A-Za-z]{3}\s*$/i
const withTill = (rm: any, s: string, e: string) => {
  const head = String(rm || '').replace(TILL, '').trimEnd()
  /* a range that ends where it starts is one day: add() drops endDate for it,
     so a tail there would name a span the input does not have */
  if (!e || e === s) return head
  const [, m, da] = e.split('-')
  return (head ? head + ' ' : '') + 'till ' + (+da) + ' ' + MON[+m]
}

/* fmt's inverse — the model stores 'Jul 14' labels, the calendar speaks
   yyyy-mm-dd. The demo week is 2026, which is the only year the labels imply. */
const unfmt = (lbl: any) => {
  const p = String(lbl || '').trim().split(/\s+/)
  const mi = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(p[0])
  if (mi < 0 || !p[1]) return ''
  return `2026-${String(mi + 1).padStart(2, '0')}-${String(+p[1]).padStart(2, '0')}`
}

/* ---- the table's own view state: which window, and sorted how ------------
   (owner, Aug 5). The list is a planning tool, so it opens on what is COMING:
   sorted by start date, today at the top, the next two months below it. */

const pad = (n: number) => String(n).padStart(2, '0')
const isoOf = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
/* Date normalises an overflowing month for us — 31 Dec + 2 months is 3 Mar,
   not 31 Feb — which is the behaviour a "two months from now" window wants */
const plusMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, d.getDate())
export const DEFAULT_SPAN_MONTHS = 2
const defaultRange = () => {
  const now = new Date()
  return { from: isoOf(now), to: isoOf(plusMonths(now, DEFAULT_SPAN_MONTHS)) }
}

/* The sort key per column. Dates sort on the ISO date the label implies, with
   the minutes appended, so two inputs on the same day order by time of day.
   `mod` is 'now' for anything edited this session and a yyyy-mm-dd stamp
   otherwise — 'now' IS the most recent, so it sorts above every stamp. */
const SORTKEY: any = {
  name: (r: any) => (PEOPLE[r.person] ? PEOPLE[r.person].cs : String(r.person || '')).toLowerCase(),
  start: (r: any) => unfmt(r.date) + pad(r.allday ? 0 : (r.s || 0)),
  end: (r: any) => unfmt(r.endDate || r.date) + pad(r.allday ? 1439 : (r.e || 0)),
  type: (r: any) => String(r.type || '').toLowerCase(),
  remarks: (r: any) => String(r.remarks || '').toLowerCase(),
  recur: (r: any) => String(r.recur || '').toLowerCase(),
  mod: (r: any) => (r.mod === 'now' ? '9999-99-99' : String(r.mod || '')),
}

/* How long a just-added row stays lit (owner, Aug 5). Long enough to catch the
   eye after the click that caused it, short enough that it is over before the
   user reads the row it landed on. */
const FLASH_MS = 1500

/* Does this input have any day inside the window? OVERLAP, not "starts
   inside": a downchit that began last week and runs through next month is
   live today, and a list that hid it would be lying about who is available. */
const inWindow = (r: any, from: string, to: string) => {
  if (!from && !to) return true
  const s = unfmt(r.date)
  if (!s) return true                       // unreadable label — never hide data
  const e = unfmt(r.endDate || r.date) || s
  if (from && e < from) return false
  if (to && s > to) return false
  return true
}

/* ---- THE TYPE CONTROLS (owner, 10 Aug 26) ---------------------------------
   Twenty types is too many for a flat list, so all three dropdowns are cut
   into the same three groups the legend uses. Both are generated from
   INPUT_META, which is the point of that table: the list you pick from, the
   explanation you read and the rule the engine applies are one thing. */
const typeOptions = () => TYPE_GROUPS.map((g: any) =>
  <optgroup key={g.k} label={g.t}>
    {INPUT_TYPES.filter((t: string) => typeGroup(t) === g.k).map((t: string) => <option key={t}>{t}</option>)}
  </optgroup>)

/* AM is 04:00–12:00 and PM is 12:01 to late, the squadron's own halves. The
   control writes nothing new: it fills in the two time fields the form
   already had, so the engine still reads only s/e. `half` rides along as a
   label, so reopening the editor says "AM" rather than guessing from minutes,
   and the week can print "local leave (AM)".
   Offered for leave and medical only (owner's call) — the other types take an
   exact range, which is finer than a half-day. */
export const HALF_AM: [string, string] = ['04:00', '12:00']
export const HALF_PM: [string, string] = ['12:01', '23:59']
const hasHalf = (t: string) => !!(inpMeta(t) || {}).half
type Span = 'all' | 'am' | 'pm' | 'custom'
const spanOf = (allday: boolean, half: string): Span => allday ? 'all' : half === 'am' ? 'am' : half === 'pm' ? 'pm' : 'custom'
/* what a span means in the four fields it drives */
const spanFields = (m: Span) => m === 'all' ? { allday: true, half: '', sTime: '06:00', eTime: '18:00' }
  : m === 'am' ? { allday: false, half: 'am', sTime: HALF_AM[0], eTime: HALF_AM[1] }
    : m === 'pm' ? { allday: false, half: 'pm', sTime: HALF_PM[0], eTime: HALF_PM[1] }
      : { allday: false, half: '', sTime: '', eTime: '' }      // custom keeps whatever is typed

const SPANS: Array<[Span, string, string]> = [
  ['all', 'All day', 'The whole day'],
  ['am', 'AM', 'Morning — 04:00 to 12:00'],
  ['pm', 'PM', 'Afternoon and evening — 12:01 onwards'],
  ['custom', 'Custom', 'Type your own start and end time'],
]
function SpanPicker({ id, span, onPick }: { id: string, span: Span, onPick: (m: Span) => void }) {
  return <div className="spanpick" id={id} role="group" aria-label="How much of the day">
    {SPANS.map(([m, label, title]) =>
      <button key={m} type="button" className={'spanbtn' + (span === m ? ' on' : '')}
        aria-pressed={span === m} title={title} data-span={m}
        onClick={() => onPick(m)}>{label}</button>)}
  </div>
}

/* The legend the owner asked for: a button by the type field saying what each
   abbreviation means. Generated from INPUT_META so it cannot describe a rule
   the engine does not apply — which is the whole reason the table exists.
   It reuses the anchored-popover pattern already on this page (#inRangeBtn),
   rather than a modal: it is a reference card, not a task. */
function typeRule(t: string) {
  const m = inpMeta(t); if (!m) return ''
  if (m.work) return 'no flying — may still stand a duty, sit a sim or take a ground slot'
  if (!m.local) return 'out of reach — cannot be planned for anything, an SC spare included'
  if (m.grp === 'med') return 'cannot be planned, and cannot stand an SC spare'
  return 'cannot be planned, but may still stand an SC spare'
}
/* "Training — training" says nothing twice. A code only earns a spelt-out
   name when it IS an abbreviation, the same test offWord makes. */
function typeName(t: string) {
  const n = ((inpMeta(t) || {}).name || '')
  return n.toLowerCase() === t.toLowerCase() ? '' : n
}
/* the rule the most of a group shares, or '' when they genuinely differ */
function groupRule(ts: string[]) {
  const n: any = {}
  ts.forEach(t => { const r = typeRule(t); n[r] = (n[r] || 0) + 1 })
  const best = Object.keys(n).sort((a, b) => n[b] - n[a])[0] || ''
  return n[best] > 1 ? best : ''
}
function TypeLegend() {
  const [open, setOpen] = useState(false)
  const box = useRef<any>(null)
  /* mousedown rather than click, for the same reason the date window uses it:
     a click that starts inside and ends outside must not close the popover */
  useEffect(() => {
    if (!open) return
    const away = (e: any) => { if (box.current && !box.current.contains(e.target)) setOpen(false) }
    const esc = (e: any) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', away)
    document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('mousedown', away); document.removeEventListener('keydown', esc) }
  }, [open])
  return <span className="tylegend" ref={box}>
    <button type="button" className={'tylegend-b' + (open ? ' on' : '')} id="inTypeHelp"
      aria-expanded={open} title="What do these mean?" onClick={() => setOpen(o => !o)}>?</button>
    {open && <div className="tylegend-pop" id="inTypePop">
      <div className="tylegend-h">What each type means</div>
      {TYPE_GROUPS.map((g: any) => {
        const ts = INPUT_TYPES.filter((t: string) => typeGroup(t) === g.k)
        /* Most of a group shares one rule — eight identical lines under Leave
           is noise a reader has to look past to find the one that differs. So
           the shared rule goes on the GROUP, and a row prints its own only
           when it is an exception (OL, OD, ATT B). */
        const common = groupRule(ts)
        return <div key={g.k} className="tylegend-g">
          <div className="tylegend-gt">{g.t}</div>
          {common && <div className="tylegend-gr">{common}</div>}
          {ts.map((t: string) => {
            const r = typeRule(t)
            return <div key={t} className="tylegend-r">
              <b>{t}</b><span>{typeName(t)}{r !== common && <i>{r}</i>}</span>
            </div>
          })}
        </div>
      })}
    </div>}
  </span>
}

export function InputsPage() {
  useVersion()
  const [person, setPerson] = useState(ME)
  const [type, setType] = useState(INPUT_TYPES[0])
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [allday, setAllday] = useState(true)
  /* '' | 'am' | 'pm' — a LABEL for the window below, never a second source of
     truth. s/e stay the only thing the engine reads. */
  const [half, setHalf] = useState('')
  /* the defaults reproduce the old hardcoded window, so an untouched form
     still writes 06:00–18:00 */
  const [sTime, setSTime] = useState('06:00')
  const [eTime, setETime] = useState('18:00')
  const [repeat, setRepeat] = useState(0)
  const [remarks, setRemarks] = useState('')
  const [fPerson, setFPerson] = useState('all')
  const [fType, setFType] = useState('all')
  const [fSearch, setFSearch] = useState('')
  const [editRow, setEditRow] = useState<any>(null)
  const [draft, setDraft] = useState<any>(null)
  const [range, setRange] = useState(defaultRange)
  const [calOpen, setCalOpen] = useState(false)
  const [sort, setSort] = useState({ key: 'start', dir: 1 })
  /* Rows just added, newest first, and rows still flashing. Both hold the input
     OBJECT rather than its index, for the same reason the row editor does:
     adding, deleting or undoing renumbers INPUTS underneath us. */
  const [pinned, setPinned] = useState<any[]>([])
  const [flash, setFlash] = useState<any[]>([])
  const timers = useRef<any[]>([])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  /* A just-added input rides at the top of the table whatever the filters, the
     window and the sort say (owner, Aug 5). Adding something and watching it
     vanish because it falls outside today's view reads as "it didn't save" —
     the one thing the feedback has to rule out. It is a HOLD, not a new
     ordering: the next touch of the filter bar or a column heading is the user
     arranging the table for themselves, and it releases every pin. */
  const unpin = () => setPinned(p => (p.length ? [] : p))

  /* first click on a heading sorts it ascending, a second click inverts it —
     every column the same way round, so there is one rule to remember */
  const sortBy = (key: string) => {
    unpin()
    setSort(s => ({ key, dir: s.key === key ? -s.dir : 1 }))
  }

  /* A dropdown that only closes on the button that opened it is a trap: the
     next click is nearly always the thing the user opened it to get at, and it
     lands on a page the popover is still covering. Close on any press outside
     the picker — mousedown, so it is gone before that press becomes a click. */
  const rangeRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!calOpen) return
    const away = (e: Event) => {
      if (!rangeRef.current || !rangeRef.current.contains(e.target as Node)) setCalOpen(false)
    }
    document.addEventListener('mousedown', away)
    return () => document.removeEventListener('mousedown', away)
  }, [calOpen])

  /* A MEMBER MAY EDIT INPUTS (owner, 5 Aug 26). The reference's role gate
     turned all three of these away with "View only — ask a scheduler"; the
     squadron's inputs are the crews' OWN leave, downchits and detachments, so
     the people they belong to now enter them. Nothing else opened with it:
     the schedule itself is still `canEditSched()` (admin), and ACCEPTING an
     input into the programme is still a scheduler's act — `interactions.ts`
     refuses it for a member exactly as before. */
  const add = () => {
    /* the calendar asks for a pick and the readout says so — accepting the
       click anyway and quietly dating it Monday was a trap */
    if (!start) return HOOKS.toast('Pick a start date on the calendar first', 'warn')
    const date = fmt(start), endDate = end && fmt(end) !== date ? fmt(end) : undefined
    /* timing is the owner's ask (Aug 26): the validator reasons in minutes, so
       a timed input carries the times the aircrew actually stated — no more
       silent 06:00–18:00. The overlap math assumes s < e within one day. */
    const s = allday ? 0 : parseHM(sTime), e = allday ? 1439 : parseHM(eTime)
    if (!allday && (s == null || e == null)) return HOOKS.toast('Give the input a start and end time, or tick All day', 'warn')
    if (!allday && (e as number) <= (s as number)) return HOOKS.toast('End time must be after start time', 'warn')
    writeInputs(() => INPUTS.unshift({
      person, date, endDate, allday, s, e,
      /* only carried when it is one — an absence typed as an exact range is
         not a half-day and must not read as one */
      ...(!allday && half ? { half } : {}),
      type, remarks: remarks.trim(),
      recur: (+repeat || 0) ? ('x' + repeat + ' wks') : '', mod: 'now',
    }))
    /* the row INPUTS.unshift just made — pin it to the top of the table and
       light it, so the add is visible even from a view that would filter it
       out. The flash comes off on a timer; the pin waits for the user. */
    const row = INPUTS[0]
    setPinned(p => [row, ...p])
    setFlash(f => [row, ...f])
    timers.current.push(setTimeout(() => setFlash(f => f.filter(x => x !== row)), FLASH_MS))
    /* the dates stay on the form after an add, so the tail that describes them
       stays too — only what the typist wrote is cleared */
    setRemarks(withTill('', start, end))
  }

  /* the pencil turns ONE row into fields in place (owner, Aug 26). The draft is
     held apart from the model so Cancel is a real cancel, and the commit runs
     through writeInputs like every other mutation — so an edit joins the undo
     stack and re-validates the week. */
  const startEdit = (inx: number) => {
    const r = INPUTS[inx]
    /* the ROW ITSELF is held, never its index: adding, deleting or undoing
       while an editor is open renumbers INPUTS, and an index captured before
       that would commit the draft onto somebody else's input */
    setEditRow(r)
    setDraft({
      person: r.person, type: r.type, allday: !!r.allday, half: r.half || '',
      start: unfmt(r.date), end: r.endDate ? unfmt(r.endDate) : '',
      sTime: r.allday ? '06:00' : hhmm(r.s), eTime: r.allday ? '18:00' : hhmm(r.e),
      remarks: r.remarks || '',
    })
  }
  const saveEdit = () => {
    const r = editRow
    if (!r || !draft) return
    if (INPUTS.indexOf(r) < 0) {                 // deleted or undone underneath us
      setEditRow(null); setDraft(null)
      return HOOKS.toast('That input is no longer there — nothing was saved', 'warn')
    }
    const s = draft.allday ? 0 : parseHM(draft.sTime), e = draft.allday ? 1439 : parseHM(draft.eTime)
    if (!draft.allday && (s == null || e == null)) return HOOKS.toast('Give the input a start and end time, or tick All day', 'warn')
    if (!draft.allday && (e as number) <= (s as number)) return HOOKS.toast('End time must be after start time', 'warn')
    const date = fmt(draft.start), endDate = draft.end && fmt(draft.end) !== date ? fmt(draft.end) : undefined
    writeInputsBatch(() => {
      /* An ACCEPTED input is linked to the row it created by `src`, a content
         key of person|date|type|s. Editing any of those silently broke the
         link: the row stayed on the programme, undo could no longer find it,
         and it could never be removed. So an accepted input is un-accepted
         through the real path FIRST, edited, then re-accepted — which also
         moves the row when the date moves it to another day. */
      const wasAcc = r.acc
      /* the row may sit on any day the input spans, not its start date */
      const wasDi = wasAcc === 'g' ? acceptedDay(r) : -1
      if (wasAcc) unacceptInput(wasDi, r)
      r.person = draft.person; r.type = draft.type; r.allday = draft.allday
      r.s = s; r.e = e; r.date = date; r.remarks = draft.remarks.trim(); r.mod = 'now'
      if (!draft.allday && draft.half) r.half = draft.half; else delete r.half
      if (endDate) r.endDate = endDate; else delete r.endDate
      if (wasAcc) {
        /* put it back on the day it was on, if the edit still covers that day;
           otherwise its new start date */
        const keep = wasDi >= 0 && DATES[wasDi] && inputCoversDate(r, DATES[wasDi])
        const di = keep ? wasDi : DATES.indexOf(r.date)
        if (di >= 0) acceptInput(di, r, wasAcc)
        else HOOKS.toast('Moved outside the programmed week — it is no longer accepted', 'warn')
      }
    })
    setEditRow(null); setDraft(null)
  }

  const del = (inx: number) => {
    const r = INPUTS[inx]
    /* deleting an ACCEPTED input used to leave its ground row on the programme
       for good — nothing pointed at it any more, so it could never be removed
       and it still printed and validated as a real commitment */
    writeInputsBatch(() => {
      if (r && r.acc) unacceptInput(acceptedDay(r), r)
      INPUTS.splice(inx, 1)
      if (editRow === r) { setEditRow(null); setDraft(null) }
    })
  }

  let rows = INPUTS.slice()
  if (fPerson !== 'all') rows = rows.filter((r: any) => r.person === fPerson)
  if (fType !== 'all') rows = rows.filter((r: any) => r.type === fType)
  if (fSearch) { const s = fSearch.toLowerCase(); rows = rows.filter((r: any) => (r.remarks || '').toLowerCase().includes(s) || (PEOPLE[r.person] ? PEOPLE[r.person].cs.toLowerCase() : '').includes(s)) }
  rows = rows.filter((r: any) => inWindow(r, range.from, range.to))
  /* the row being edited stays put whatever the sort and the window say —
     retyping a date must not make the open editor jump or vanish mid-edit */
  if (editRow && INPUTS.indexOf(editRow) >= 0 && rows.indexOf(editRow) < 0) rows.push(editRow)
  {
    const key = SORTKEY[sort.key] || SORTKEY.start
    const cmp = (a: any, b: any) => (a < b ? -1 : a > b ? 1 : 0)
    /* start date is the tie-break on every other column, so two rows that
       match on the sorted column still come out in a stable, useful order */
    rows.sort((a: any, b: any) =>
      cmp(key(a), key(b)) * sort.dir || cmp(SORTKEY.start(a), SORTKEY.start(b)))
  }
  /* the pinned rows go on top, ahead of everything the sort just decided, and
     they are removed from the body of the list so a pin never shows twice.
     Deleted and undone rows fall out here — the pin points at an object, so a
     row that has left INPUTS simply stops matching. */
  {
    const pins = pinned.filter((r: any) => INPUTS.indexOf(r) >= 0)
    if (pins.length) rows = pins.concat(rows.filter((r: any) => pins.indexOf(r) < 0))
  }

  const RANGE_ALL = 'All dates'
  const rangeLabel = (!range.from && !range.to) ? RANGE_ALL
    : (range.from ? fmt(range.from) : '…') + ' → ' + (range.to ? fmt(range.to) : '…')
  /* the arrow reads as the direction the column is going, not as a button */
  const th = (key: string, label: string) => (
    <th className={'insort' + (sort.key === key ? ' on' : '')} data-sort={key}
      aria-sort={sort.key === key ? (sort.dir > 0 ? 'ascending' : 'descending') : 'none'}
      title={`Sort by ${label.toLowerCase()}`} onClick={() => sortBy(key)}>
      {label}<span className="inarrow">{sort.key === key ? (sort.dir > 0 ? '▲' : '▼') : ''}</span>
    </th>
  )

  return (
    <>
      <div className="title"><h1>Personal Inputs</h1></div>
      <div className="inbar">
        <div className="ingrid">
          <div className="ifield"><label>Person</label>
            <select id="inPerson" aria-label="Person" value={person} onChange={e => setPerson(e.target.value)}>
              {people().map(id => <option key={id} value={id}>{PEOPLE[id].cs}</option>)}
            </select></div>
          <div className="ifield cal"><label>Dates</label>
            <RangeCal idPrefix="in" start={start} end={end}
              onPick={(s2, e2) => { setStart(s2); setEnd(e2); setRemarks(r => withTill(r, s2, e2)) }} />
            <div className="rc-read" id="inDates">{start ? (fmt(start) + (end ? ' → ' + fmt(end) : '')) : 'pick a start date'}</div>
          </div>
          {/* Leave and medical get the four-way span picker; everything else
              keeps the plain tick, because those types take an exact range and
              a half-day would be coarser than what they already say. */}
          {hasHalf(type)
            ? <div className="ifield span"><label>How long</label>
              <SpanPicker id="inSpan" span={spanOf(allday, half)} onPick={m => {
                const f = spanFields(m)
                setAllday(f.allday); setHalf(f.half)
                if (f.sTime) { setSTime(f.sTime); setETime(f.eTime) }
              }} /></div>
            : <div className="ifield chk"><label>All day</label><input id="inAllday" type="checkbox" checked={allday} onChange={e => setAllday(e.target.checked)} /></div>}
          {/* All day owns the whole window, so the two time fields fade to say
              so. They were already `disabled`, but a disabled control that
              still looks live invites the click it cannot accept. */}
          <div className={'ifield' + (allday ? ' dim' : '')}><label>Start time</label><input id="inStartT" type="time" value={sTime} disabled={allday} onChange={e => setSTime(e.target.value)} /></div>
          <div className={'ifield' + (allday ? ' dim' : '')}><label>End time</label><input id="inEndT" type="time" value={eTime} disabled={allday} onChange={e => setETime(e.target.value)} /></div>
          <div className="ifield"><label className="withhelp">Type <TypeLegend /></label>
            <select id="inType" aria-label="Input type" value={type} onChange={e => {
              const t = e.target.value
              setType(t)
              /* a half-day belongs to the types that offer one. Switching to a
                 type without the picker would otherwise strand an invisible
                 'am' on the record, and the row would claim a half nobody
                 could see or change. */
              if (!hasHalf(t) && half) setHalf('')
            }}>
              {typeOptions()}
            </select></div>
          <div className="ifield"><label>Repeat wks</label><input id="inRepeat" type="number" value={repeat} min={0} onChange={e => setRepeat(+e.target.value)} /></div>
          <div className="ifield"><label>Remarks</label><input id="inRemarks" placeholder="e.g. medical appt" value={remarks} onChange={e => setRemarks(e.target.value)} /></div>
          <div className="ifield"><label>&nbsp;</label><button className="abtn primary" id="inAdd" onClick={add}>Add input</button></div>
        </div>
      </div>
      <div className="infilter">
        <span className="lab">Filter</span>
        <select id="inFPerson" aria-label="Filter by person" value={fPerson} onChange={e => { unpin(); setFPerson(e.target.value); notify() }}>
          <option value="all">Personnel</option>
          {people().map(id => <option key={id} value={id}>{PEOPLE[id].cs}</option>)}
        </select>
        <select id="inFType" aria-label="Filter by type" value={fType} onChange={e => { unpin(); setFType(e.target.value); notify() }}>
          <option value="all">Show all types</option>
          {typeOptions()}
        </select>
        {/* the window, picked on the same two-click calendar as the form above:
            first click is the from-date, second the to-date */}
        <div className="inrange" ref={rangeRef}>
          <button className={'abtn' + (calOpen ? ' primary' : '')} id="inRangeBtn"
            aria-expanded={calOpen} onClick={() => setCalOpen(o => !o)}>📅 {rangeLabel}</button>
          {calOpen && (
            <div className="inrange-pop" id="inRangePop">
              <RangeCal idPrefix="inRange" start={range.from} end={range.to}
                onPick={(s2, e2) => { unpin(); setRange({ from: s2, to: e2 }) }} />
              <div className="rc-read">{range.from
                ? fmt(range.from) + (range.to ? ' → ' + fmt(range.to) : ' → pick an end date')
                : 'showing every date'}</div>
              <div className="inrange-btns">
                <button className="abtn" id="inRangeDef" onClick={() => { unpin(); setRange(defaultRange()); setCalOpen(false) }}>Next {DEFAULT_SPAN_MONTHS} months</button>
                <button className="abtn" id="inRangeAll" onClick={() => { unpin(); setRange({ from: '', to: '' }); setCalOpen(false) }}>{RANGE_ALL}</button>
              </div>
            </div>
          )}
        </div>
        <div className="searchbox">🔍<input id="inFSearch" placeholder="search" value={fSearch} onChange={e => { unpin(); setFSearch(e.target.value) }} /></div>
        <button className="abtn" id="inExport" onClick={() => {
          const out: any[][] = [['Name', 'Date', 'Start', 'End', 'Type', 'Remarks']]
          INPUTS.forEach((r: any) => out.push([PEOPLE[r.person] ? PEOPLE[r.person].cs : r.person, r.date, r.allday ? 'all day' : hhmm(r.s), r.allday ? 'all day' : hhmm(r.e), r.type, r.remarks]))
          exportCSV('142SQN-inputs.csv', out)
        }}>Export to Excel</button>
      </div>
      <div className="inwrap">
        <table className="intbl" id="intbl">
          <thead><tr>
            {th('name', 'Name')}{th('start', 'Start')}{th('end', 'End')}{th('type', 'Type')}
            {th('remarks', 'Remarks')}{th('recur', 'Recurring')}{th('mod', 'Last modified')}
            <th></th>
          </tr></thead>
          <tbody id="inBody">
            {rows.map((r: any) => {
              const cs = PEOPLE[r.person] ? PEOPLE[r.person].cs : r.person
              const st = r.date + (r.allday ? '' : ' ' + hhmm(r.s))
              const en = (r.endDate || r.date) + (r.allday ? '' : ' ' + hhmm(r.e))
              const inx = INPUTS.indexOf(r)
              if (editRow === r && draft) return (
                <tr key={inx} className="ined">
                  <td><select aria-label="Person" data-ed="person" value={draft.person}
                    onChange={e => setDraft({ ...draft, person: e.target.value })}>
                    {people().map(id => <option key={id} value={id}>{PEOPLE[id].cs}</option>)}
                  </select></td>
                  <td colSpan={2}>
                    {/* the editor's calendar owns the tail the same way — but only
                        from a click: OPENING the editor leaves an existing remark
                        exactly as it was written */}
                    <RangeCal idPrefix="ined" start={draft.start} end={draft.end}
                      onPick={(s2, e2) => setDraft({ ...draft, start: s2, end: e2, remarks: withTill(draft.remarks, s2, e2) })} />
                    <div className="rc-read">{draft.start ? (fmt(draft.start) + (draft.end ? ' → ' + fmt(draft.end) : '')) : 'pick a start date'}</div>
                    {/* same split as the add form: the span picker where the
                        type offers halves, the plain tick everywhere else */}
                    {hasHalf(draft.type)
                      ? <SpanPicker id="inedSpan" span={spanOf(draft.allday, draft.half)} onPick={m => {
                        const f = spanFields(m)
                        setDraft({
                          ...draft, allday: f.allday, half: f.half,
                          ...(f.sTime ? { sTime: f.sTime, eTime: f.eTime } : {}),
                        })
                      }} />
                      : <label className="ined-ad"><input type="checkbox" data-ed="allday" checked={draft.allday}
                        onChange={e => setDraft({ ...draft, allday: e.target.checked })} /> all day</label>}
                    <span className="ined-t" hidden={draft.allday}>
                      <input type="time" aria-label="Start time" data-ed="stime" value={draft.sTime}
                        onChange={e => setDraft({ ...draft, sTime: e.target.value })} />
                      <input type="time" aria-label="End time" data-ed="etime" value={draft.eTime}
                        onChange={e => setDraft({ ...draft, eTime: e.target.value })} />
                    </span>
                  </td>
                  <td><select aria-label="Type" data-ed="type" value={draft.type}
                    onChange={e => {
                      const t = e.target.value
                      setDraft({ ...draft, type: t, ...(hasHalf(t) ? {} : { half: '' }) })
                    }}>
                    {typeOptions()}
                  </select></td>
                  <td><input aria-label="Remarks" data-ed="remarks" value={draft.remarks}
                    onChange={e => setDraft({ ...draft, remarks: e.target.value })} /></td>
                  <td>{r.recur || ''}</td>
                  <td className="mono" style={{ color: 'var(--ink-3)' }}>{r.mod || ''}</td>
                  <td className="inact">
                    <span className="rok" data-save={inx} title="Save" onClick={saveEdit}>✓</span>
                    <span className="rmx" data-cancel={inx} title="Cancel" onClick={() => { setEditRow(null); setDraft(null) }}>✕</span>
                  </td>
                </tr>
              )
              return (
                <tr key={inx} className={flash.indexOf(r) >= 0 ? 'innew' : undefined}>
                  <td>{cs}</td><td>{st}</td><td>{en}</td>
                  <td><span className="intag">{r.type}</span></td>
                  {/* the mark reads in Remarks, not beside the type (owner,
                      9 Aug 26) — same column on every surface that draws an
                      input, and the type column stays pure identity */}
                  <td>{isLateInput(r) && <span className="latetag" title={lateNote(r)}>LATE</span>}{r.remarks || ''}</td>
                  <td>{r.recur || ''}</td>
                  <td className="mono" style={{ color: 'var(--ink-3)' }}>{r.mod || ''}</td>
                  <td className="inact">
                    <span className="red" data-edit={inx} title="Edit this input" onClick={() => startEdit(inx)}>✎</span>
                    <span className="rmx" data-inx={inx} onClick={() => del(inx)}>✕</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {/* an empty table under a date window is almost always the WINDOW, not
            an empty roster — say which, and where the way out is */}
        <div className="empty" id="inEmpty" hidden={rows.length > 0}>
          {(range.from || range.to)
            ? `No inputs between ${rangeLabel}. Change the dates, or pick “${RANGE_ALL}”.`
            : 'No inputs match.'}
        </div>
      </div>
    </>
  )
}
