/* The Personal inputs page — markup mirrored 1:1 from the reference (same
   ids, classes and columns), behaviour through the store. The add/delete
   logic is the reference's verbatim, including the role gate that keeps a
   member view-only, and both go through writeInputs so they join the undo
   stack and re-validate the week. */
import { useEffect, useRef, useState } from 'react'
import { INPUTS, INPUT_TYPES, TYPE_GROUPS, inpMeta, inpId, typeGroup, isLateInput, lateNote, isSansAvail } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { hhmm, parseHM } from '../engine/time'
import { HOOKS } from '../engine/hooks'
import { ME } from '../state/auth'
import { writeInputs, notify } from '../state/store'
/* the halves, the span control, the draft shape and the commit are shared with
   the dialog the week and the board open — see ui/inputedit.tsx */
import {
  fmt, unfmt, hasHalf, spanOf, spanFields, SpanPicker, typeOptions,
  draftOf, commitInputEdit, removeInput, SansPicker, sansRefusal, sansFlags,
  rosterOptions as people,
} from './inputedit'
import { useVersion } from './useStore'
import { exportCSV } from './export'
import { RangeCal } from './RangeCal'

const MON = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

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

/* ---- the table's own view state: which window, and sorted how ------------
   (owner, Aug 5). The list is a planning tool, so it opens on what is COMING:
   sorted by start date, today at the top, the next two months below it. */

const pad = (n: number) => String(n).padStart(2, '0')
const isoOf = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
/* Date normalises an overflowing month for us — 31 Dec + 2 months is 3 Mar,
   not 31 Feb — which is the behaviour a "two months from now" window wants */
const plusMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, d.getDate())
export const DEFAULT_SPAN_MONTHS = 2
const defaultRange = (now = new Date()) => ({ from: isoOf(now), to: isoOf(plusMonths(now, DEFAULT_SPAN_MONTHS)) })

/* THE TABLE OPENS ON TODAY → TWO WEEKS, AND ONLY ON THAT (owner, 12 Aug 26 —
   "it is ok to show any inputs from the today's date to 2 weeks down the
   road by default").
   It briefly anchored to the loaded week whenever today fell outside it,
   because with the demo week sitting in Jul 26 and the clock past it the
   page opened EMPTY and read as "my leave vanished". The owner looked at
   that and chose the simpler rule instead: the window is always relative to
   today, full stop. **So the empty table is back whenever the data does not
   reach the next fortnight, and it is deliberate** — a squadron running this
   for real has inputs around today, which is the case being designed for,
   and a window that silently jumps somewhere else is harder to reason about
   than one that is always "the next two weeks". The empty state already
   names the way out ("Change the dates, or pick 'All dates'").
   Two WEEKS, not the two MONTHS the range button offers: this is the glance
   a scheduler wants on opening, while `#inRangeDef` stays the wider sweep. */
export const DEFAULT_SPAN_DAYS = 14
const plusDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
export function initialRange(now = new Date()) {
  return { from: isoOf(now), to: isoOf(plusDays(now, DEFAULT_SPAN_DAYS)) }
}

/* The sort key per column. Dates sort on the ISO date the label implies, with
   the minutes appended, so two inputs on the same day order by time of day.
   The minutes run 0–1439, so they are padded to FOUR digits — the shared
   two-digit pad() let '600' (10:00) sort before '65' (01:05), which put a
   mid-morning input above a small-hours one (audit, 12 Aug 26).
   `mod` is 'now' for anything edited this session and a yyyy-mm-dd stamp
   otherwise — 'now' IS the most recent, so it sorts above every stamp.
   `?? 0`, not `|| 0` (found seeding the demo SANS records, 14 Aug 26): a
   timed row that genuinely starts AT midnight (an AM-half preset — s:0)
   has a real, meaningful minute value of 0, and `0 || 0` reads the same as
   a missing value, so it collapsed onto the exact same sort key as an
   all-day row on the same date — indistinguishable, and the sort's own
   tie-break (this same key, see below) could then no longer tell them
   apart. `??` only falls back to 0 for a genuinely absent s/e. */
const pad4 = (m: any) => String(m).padStart(4, '0')
const SORTKEY: any = {
  name: (r: any) => (PEOPLE[r.person] ? PEOPLE[r.person].cs : String(r.person || '')).toLowerCase(),
  start: (r: any) => unfmt(r.date) + pad4(r.allday ? 0 : (r.s ?? 0)),
  end: (r: any) => unfmt(r.endDate || r.date) + pad4(r.allday ? 1439 : (r.e ?? 0)),
  type: (r: any) => String(r.type || '').toLowerCase(),
  remarks: (r: any) => String(r.remarks || '').toLowerCase(),
  recur: (r: any) => String(r.recur || '').toLowerCase(),
  mod: (r: any) => (r.mod === 'now' ? '9999-99-99' : String(r.mod || '')),
}

/* How long a just-added row stays lit — harmonized 15 Aug 26 to the board's
   .sb-fresh timing (FRESH_MS in state/view.ts) so a fresh row reads the same
   way everywhere in the app: a steady box that holds most of this, fading
   only in its last 550ms (see @keyframes inflash in scheduler.css). Long
   enough to still be lit by the time a phone user looks up from the form
   this page's own scroll-into-view now carries them to. */
const FLASH_MS = 6000

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

/* The legend the owner asked for: a button by the type field saying what each
   abbreviation means. Generated from INPUT_META so it cannot describe a rule
   the engine does not apply — which is the whole reason the table exists.
   It reuses the anchored-popover pattern already on this page (#inRangeBtn),
   rather than a modal: it is a reference card, not a task. */
function typeRule(t: string) {
  const m = inpMeta(t); if (!m) return ''
  /* not an absence — the other three branches all describe a man who is
     unavailable in one way or another, which SANS Availability is not */
  if (m.grp === 'sans') return 'not an absence — the boxes ticked say which events he is available for, and when'
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
  /* SANS Availability's own Fly/AMT/OFT payload — see SansPicker/sansRefusal
     in ui/inputedit.tsx. Only read by add() when `type` is the SANS type. */
  const [sans, setSans] = useState<any>(null)
  const [fPerson, setFPerson] = useState('all')
  const [fType, setFType] = useState('all')
  const [fSearch, setFSearch] = useState('')
  const [editRow, setEditRow] = useState<any>(null)
  const [draft, setDraft] = useState<any>(null)
  const [range, setRange] = useState(initialRange)
  const [calOpen, setCalOpen] = useState(false)
  const [sort, setSort] = useState({ key: 'start', dir: 1 })
  /* Rows just added, newest first, and rows still flashing. Both hold the input
     OBJECT rather than its index, for the same reason the row editor does:
     adding, deleting or undoing renumbers INPUTS underneath us. */
  const [pinned, setPinned] = useState<any[]>([])
  const [flash, setFlash] = useState<any[]>([])
  const timers = useRef<any[]>([])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  /* SCROLL THE NEW ROW INTO VIEW (owner — "once an input is made, the view
     will snap to the input u just made"). The row already pins to the top
     and flashes, but on a phone the user is still looking at the form below
     the fold, not at the table. add() can only SCHEDULE the scroll — the new
     <tr> commits to the DOM after this render, on the same clock the pin/
     flash lists already ride — so the lookup runs from an effect keyed off
     the iid add() just set, which fires once React has painted it. */
  const [justAddedIid, setJustAddedIid] = useState<string | null>(null)
  useEffect(() => {
    if (!justAddedIid) return
    const el = document.querySelector(`[data-iid="${justAddedIid}"]`)
    /* GUARDED exactly like interactions.ts:72-79 — jsdom implements no
       scrolling at all, so scrollIntoView is simply absent on its elements;
       unguarded it throws out of this effect where no test assertion sees it. */
    if (el && typeof (el as any).scrollIntoView === 'function')
      (el as any).scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [justAddedIid])

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
  /* the row's own address, minted INSIDE the write so the snapshot this add
     pushes already carries it (see mintInpIds in engine/inputs.ts) */
  const withId = (r: any) => { inpId(r); return r }
  const add = () => {
    /* the calendar asks for a pick and the readout says so — accepting the
       click anyway and quietly dating it Monday was a trap */
    if (!start) return HOOKS.toast('Pick a start date on the calendar first', 'warn')
    const date = fmt(start), endDate = end && fmt(end) !== date ? fmt(end) : undefined
    /* SANS AVAILABILITY IS RESTRICTED TO SANS AIRCREW, AND NEEDS AT LEAST ONE
       BOX TICKED (owner, 14 Aug 26) — checked here, ahead of the timing
       refusals below, through the one shared check every editor's commit
       runs (sansRefusal) so the wording can never drift between them. It is
       a NORMAL timed input now (rework, 14 Aug 26 — the owner's own phone
       bug with a per-event time pair that could not be cleared with one
       tap): its one window rides the exact same allday/half/s/e path as any
       other half-day type below, no separate branch and no forced all-day. */
    if (isSansAvail(type)) {
      const why = sansRefusal(person, sans)
      if (why) return HOOKS.toast(why, 'warn')
    }
    /* timing is the owner's ask (Aug 26): the validator reasons in minutes, so
       a timed input carries the times the aircrew actually stated — no more
       silent 06:00–18:00. The overlap math assumes s < e within one day. */
    const s = allday ? 0 : parseHM(sTime), e = allday ? 1439 : parseHM(eTime)
    if (!allday && (s == null || e == null)) return HOOKS.toast('Give the input a start and end time, or tick All day', 'warn')
    /* an end earlier than the start crosses midnight, as it does on every other
       row type — see commitInputEdit for the reasoning. Only equal times are
       refused, being a zero-length absence. */
    if (!allday && (e as number) === (s as number)) return HOOKS.toast('Give the input a start and end that are not the same time', 'warn')
    writeInputs(() => INPUTS.unshift(withId({
      person, date, endDate, allday, s, e,
      /* only carried when it is one — an absence typed as an exact range is
         not a half-day and must not read as one */
      ...(!allday && half ? { half } : {}),
      /* SANS's own Fly/AMT/OFT flags — never carried by a non-SANS type */
      ...(isSansAvail(type) ? { sans: sansFlags(sans) } : {}),
      type, remarks: remarks.trim(),
      recur: (+repeat || 0) ? ('x' + repeat + ' wks') : '', mod: 'now',
    })))
    /* the row INPUTS.unshift just made — pin it to the top of the table and
       light it, so the add is visible even from a view that would filter it
       out. The flash comes off on a timer; the pin waits for the user. */
    const row = INPUTS[0]
    setPinned(p => [row, ...p])
    setFlash(f => [row, ...f])
    setJustAddedIid(row.iid)
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
    setDraft(draftOf(r))
  }
  /* SAID, not just done (owner audit — a tap with no feedback reads as "did
     it register?"). The board's own input dialog (inputedit.tsx) already
     toasts these two same words for the identical commit/removeInput calls;
     this page's own inline ✓/✕ ran the same functions silently. */
  const saveEdit = () => {
    if (commitInputEdit(editRow, draft)) { setEditRow(null); setDraft(null); HOOKS.toast('Input updated', 'ok') }
    else if (editRow && INPUTS.indexOf(editRow) < 0) { setEditRow(null); setDraft(null) }
  }

  const del = (inx: number) => {
    const r = INPUTS[inx]
    if (removeInput(r)) {
      if (editRow === r) { setEditRow(null); setDraft(null) }
      HOOKS.toast('Input deleted', 'ok')
    }
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
       match on the sorted column still come out in a stable, useful order —
       deliberately NOT multiplied by sort.dir, so that secondary order reads
       the same (earliest first) whichever way the primary column is sorted.
       A FINAL index tiebreak, found seeding the demo SANS records (14 Aug
       26): sorting BY 'start' (or 'end') itself makes that "secondary"
       check a no-op — same key as the primary, by construction — so ties
       fell through to Array.sort's native stability, which keeps the
       PRE-SORT array order in both directions alike. Two rows sharing an
       exact key usually show identical text (several "all day" rows on one
       date), where that is invisible; it stopped being invisible the moment
       one tied row had its OWN distinct label (a half-day AM offer, minute
       0, keying identically to "all day" on the same date) — a second click
       no longer inverted the visible list. Breaking the remaining tie on
       each row's ORIGINAL position, WITH sort.dir this time, guarantees a
       genuine reversal regardless of what ties on the sorted column itself. */
    const idx = new Map(rows.map((r: any, i: number) => [r, i]))
    rows.sort((a: any, b: any) =>
      cmp(key(a), key(b)) * sort.dir || cmp(SORTKEY.start(a), SORTKEY.start(b))
      || (idx.get(a)! - idx.get(b)!) * sort.dir)
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
          {/* SANS Availability's own Fly/AMT/OFT ticks sit ABOVE the standard
              How-long control now (owner rework, 14 Aug 26) — it is a normal
              timed input with one extra field, not a stand-in for the timing
              controls every other input uses (the owner's own phone bug: a
              per-event time pair could not be cleared with one tap). Leave,
              medical and SANS all get the four-way span picker, because
              INPUT_META now gives SANS half:true same as them; everything
              else keeps the plain tick, because those types take an exact
              range and a half-day would be coarser than what they already
              say. */}
          {isSansAvail(type) && <div className="ifield sans"><label>Available for</label>
            <SansPicker id="inSans" sans={sans} onChange={setSans} /></div>}
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
              /* same reasoning for the SANS payload: seed an empty one when
                 switching in, drop it when switching out */
              setSans(isSansAvail(t) ? (sans || {}) : null)
            }}>
              {typeOptions()}
            </select></div>
          <div className="ifield"><label>Repeat wks</label><input id="inRepeat" type="number" value={repeat} min={0} max={52}
            onChange={e => setRepeat(Math.max(0, Math.min(52, Math.floor(+e.target.value || 0))))} /></div>
          <div className="ifield"><label>Remarks</label><input id="inRemarks" placeholder="e.g. medical appt" maxLength={200} value={remarks} onChange={e => setRemarks(e.target.value)} /></div>
          <div className="ifield"><label>&nbsp;</label><button className="abtn primary" id="inAdd" onClick={add}>Add input</button></div>
        </div>
      </div>
      <div className="infilter">
        <span className="lab">Filter</span>
        <select id="inFPerson" aria-label="Filter by person" value={fPerson} onChange={e => { unpin(); setFPerson(e.target.value); notify() }}>
          <option value="all">Everyone</option>
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
          /* a phone browser often shows nothing at all when a download lands —
             no bar, no tray notification the user is looking at — so the tap
             otherwise reads as dead (owner audit) */
          HOOKS.toast('CSV downloaded', 'ok')
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
                <tr key={inx} className="ined" data-iid={r.iid}>
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
                    {/* same split as the add form: SANS's ticks sit ABOVE the
                        span picker now, not in place of it — the standard
                        span picker (or plain tick, for a type with no
                        halves) always follows */}
                    {isSansAvail(draft.type) && <SansPicker id="inedSans" sans={draft.sans} onChange={sans => setDraft({ ...draft, sans })} />}
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
                      setDraft({ ...draft, type: t, ...(hasHalf(t) ? {} : { half: '' }), sans: isSansAvail(t) ? (draft.sans || {}) : null })
                    }}>
                    {typeOptions()}
                  </select></td>
                  <td><input aria-label="Remarks" data-ed="remarks" maxLength={200} value={draft.remarks}
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
                <tr key={inx} className={flash.indexOf(r) >= 0 ? 'innew' : undefined} data-iid={r.iid}>
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
