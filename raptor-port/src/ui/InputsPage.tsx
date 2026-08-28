/* The Personal inputs page — markup mirrored 1:1 from the reference (same
   ids, classes and columns), behaviour through the store. The add/delete
   logic is the reference's verbatim, including the role gate that keeps a
   member view-only, and both go through writeInputs so they join the undo
   stack and re-validate the week. */
import { useEffect, useRef, useState } from 'react'
import { INPUTS, INPUT_TYPES, TYPE_GROUPS, inpMeta, inpId, typeGroup, isLateInput, lateNote, isSansAvail, isDownchit, isUpchit, needsDoc, sansLetters, defaultAllday, withRemarksTail, baseYear, dateOrd, oilAsks } from '../engine/inputs'
import { upchitTrimPlan, upchitEffects, newMedTrimPlan, medClashes, ordLabel } from '../engine/medical'
import { UpchitConfirm } from './UpchitConfirm'
import { MedClashConfirm } from './MedClashConfirm'
import { OilConfirm } from './OilConfirm'
import { oilAskPlan } from '../leavewar/sync'
import { PEOPLE } from '../engine/people'
import { hhmm, parseHM } from '../engine/time'
import { HOOKS } from '../engine/hooks'
import { autoAcceptInput } from '../engine/slots'
import { LOOK_CFG, LOOK_MAX, LOOK_MIN, lookaheadLabel, lookaheadRange, setLookahead } from '../engine/lookahead'
import { ME, SESSION, canEditSched } from '../state/auth'
import { writeInputsBatch, notify } from '../state/store'
import { INPVIEW, setInpView } from '../state/view'
import { setDocView } from './pops'
import { ClipIcon, MedIcon } from './icons'
import { MedicalView } from './MedicalView'
import { medDownAsOf, pendingUpchits } from '../engine/medical'
import { TODAY, keyToIso } from './weeknav'
import { InputsCal } from './InputsCal'
/* the halves, the span control, the draft shape and the commit are shared with
   the dialog the week and the board open — see ui/inputedit.tsx */
import {
  fmt, fmtDay, fmtDMY, unfmt, hasHalf, spanOf, spanFields, SpanPicker, typeOptions,
  draftOf, commitInputEdit, removeInput, SansPicker, sansRefusal, sansOverlapRefusal, sansFlags,
  medOverlapRefusal, upchitRefusal, downOverUpchitRefusal, applyMedPlan, normalizeInputDraft,
  medKeptSegments, mintMedSegments, ordISO, DocField, oilGate,
  rosterOptions as people, inputTone,
} from './inputedit'
import { useVersion } from './useStore'
import { exportCSV } from './export'
import { RangeCal } from './RangeCal'

/* The remarks tail (owner, Aug 26; single-day "till" added 18 Aug 26). Picking
   a range on the calendar writes its date into Remarks as `till 15 Jul`, so an
   input says how long it runs wherever remarks are read — nobody types it, and
   nobody forgets. A ONE-DAY pick now writes "till <that day>" too (owner,
   18 Aug 26: "a single-day input should still show till <date>"); on the first
   click of a two-click range that reads "till <start>", and the second click
   just moves the date.

   The tail belongs to the CALENDAR, not the typist: re-picking rewrites the
   `till 15 Jul` token IN PLACE — wherever it sits, not only at the end — so a
   note the typist put in front OR after it survives the dates moving (owner,
   18 Aug 26: "till 13 Jul Bangkok" → change the end → "till 18 Jul Bangkok",
   Bangkok stays), and starting a fresh range takes only the old token with it.
   All the logic is `withRemarksTail`. */
const withTill = (rm: any, s: string, e: string) => withRemarksTail(rm, s, e, 'till')

/* ---- the table's own view state: which window, and sorted how ------------
   (owner, Aug 5). The list is a planning tool, so it opens on what is COMING:
   sorted by start date, today at the top, the next two months below it. */

const pad = (n: number) => String(n).padStart(2, '0')
const isoOf = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
/* Date normalises an overflowing month for us — 31 Dec + 2 months is 3 Mar,
   not 31 Feb — which is the behaviour a "two months from now" window wants */
const plusMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, d.getDate())
export const DEFAULT_SPAN_MONTHS = 2
/* The quick button now applies the SQUADRON'S look-ahead rather than a fixed
   two months (owner, 28 Aug 26 — "i am able to change the button function to
   show the set duration i can click by default by everyone"). One setting, so
   what the page opens on and what this button offers cannot disagree.
   `plusMonths` and DEFAULT_SPAN_MONTHS are kept: the month arithmetic is still
   the reference's, and the constant is exported and read elsewhere. */
const defaultRange = (now = new Date()) => lookaheadRange(now)

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
/* The fortnight is now the DEFAULT of a squadron setting rather than a literal
   (owner, 28 Aug 26): `LOOK_STD` is 2 weeks with no Sunday extension, which is
   exactly the today+14 above, so an untouched squadron opens on the same window
   it always did. An admin can make it any number of weeks, optionally running
   on to that week's Sunday. */
export function initialRange(now = new Date()) {
  return lookaheadRange(now)
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
  if (m.grp === 'upchit') return 'closes a medical-down period — records the date he is fit to fly again; needs the medical document attached'
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
  const [allday, setAllday] = useState(defaultAllday(INPUT_TYPES[0]))
  /* '' | 'am' | 'pm' — a LABEL for the window below, never a second source of
     truth. s/e stay the only thing the engine reads. */
  const [half, setHalf] = useState('')
  /* the defaults reproduce the old hardcoded window, so an untouched form
     still writes 06:00–18:00 */
  const [sTime, setSTime] = useState('06:00')
  const [eTime, setETime] = useState('18:00')
  const [remarks, setRemarks] = useState('')
  /* SANS Availability's own Fly/AMT/OFT payload — see SansPicker/sansRefusal
     in ui/inputedit.tsx. Only read by add() when `type` is the SANS type. */
  const [sans, setSans] = useState<any>(null)
  /* the supporting document a medical input is filed with (owner, 27 Aug 26)
     — the id into state/docs; cleared after a successful add because the
     file belongs to the input just filed, not to the next one */
  const [docId, setDocId] = useState<string | null>(null)
  /* A member lands on THEIR OWN inputs (owner, 27 Aug 26) — the page is their
     paperwork first — with "Everyone" one pick away in the same filter. A
     scheduler (admin) still opens on the whole squadron. */
  const [fPerson, setFPerson] = useState(canEditSched() ? 'all' : ME)
  const [fType, setFType] = useState('all')
  const [fSearch, setFSearch] = useState('')
  const [editRow, setEditRow] = useState<any>(null)
  const [draft, setDraft] = useState<any>(null)
  const [range, setRange] = useState(initialRange)
  /* The admin's default-window editor (owner, 28 Aug 26). Draft values while
     open, so a half-typed number never becomes the squadron's setting. */
  const [lookEdit, setLookEdit] = useState(false)
  const [lookWeeks, setLookWeeks] = useState(String(LOOK_CFG.weeks))
  const [lookSun, setLookSun] = useState(LOOK_CFG.toSunday)
  const [calOpen, setCalOpen] = useState(false)
  const [sort, setSort] = useState({ key: 'start', dir: 1 })
  /* Rows just added, newest first, and rows still flashing. Both hold the input
     OBJECT rather than its index, for the same reason the row editor does:
     adding, deleting or undoing renumbers INPUTS underneath us. */
  /* the upchit save-time summary (owner, 27 Aug 26) — holds the effects to
     show and the commit to run on Save; null = no sheet. One state serves
     both the add form and the row editor, so the sheet has one render site. */
  const [upConf, setUpConf] = useState<any>(null)
  /* the medical clash sheet (owner, 27 Aug 26) — same shape, same one
     render site for the add form and the row editor */
  const [medConf, setMedConf] = useState<any>(null)
  /* the OIL ask (owner, 28 Aug 26) — the oilGate payload plus the commit to
     run on Save; one state, one render site, both editors */
  const [oilConf, setOilConf] = useState<any>(null)
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
  /* WHO the add files for (owner, 22 Aug 26 — "for normal user account they
     can only input their own self. Which is whoever they are viewing as").
     A scheduler picks anyone from the form's Person select; a member's add
     always lands on the view-as person, read LIVE from ME at commit rather
     than from the select's state — the topbar's View-as can change while
     this page sits open, and a member's `person` state (seeded once, no
     control left to move it) would silently lag it. The calendar's add
     already worked exactly this way (InputsCal.tsx openAdd seeds ME and the
     dialog hides Person for a member); this is the page catching up. */
  const filedFor = () => canEditSched() ? person : ME
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
      const why = sansRefusal(filedFor(), sans)
      if (why) return HOOKS.toast(why, 'warn')
      const dup = sansOverlapRefusal(filedFor(), date, endDate, null)
      if (dup) return HOOKS.toast(dup, 'warn')
    }
    /* a medical input does not go in without its document (owner, 27 Aug 26)
       — needsDoc is the same body that draws the upload button below */
    if (needsDoc(type) && !docId)
      return HOOKS.toast('Attach the medical document first — use the upload button', 'warn')
    /* the medical refusals (owner, 27 Aug 26) — one shared check per rule so
       this form, the row editor and the board dialog can never disagree */
    if (isDownchit(type)) {
      const dup = medOverlapRefusal(filedFor(), type, date, endDate, null)
      if (dup) return HOOKS.toast(dup, 'warn')
      const over = downOverUpchitRefusal(filedFor(), date, endDate)
      if (over) return HOOKS.toast(over, 'warn')
    }
    if (isUpchit(type)) {
      const why = upchitRefusal(filedFor(), date, endDate, null)
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
    /* writeInputsBatch, not writeInputs: the medical trims below run engine
       helpers (Leave-War retraction) that push history of their own, and the
       add plus its trims must land as ONE undo step. Wrapped in a closure
       because an UPCHIT does not write yet — the save-time summary sheet
       (owner, 27 Aug 26) runs first, and its Save calls this with the
       leftovers the filer ticked Remove on. */
    /* one row body for every segment the save files (the clash sheet can
       split an entry around a kept status) — dates and remarks vary, the
       rest is the form's state verbatim */
    const rowBody = (d: string, ed: string | undefined, rem: string) => withId({
      /* yr anchors the bare labels to the year they were picked under —
         the same stamp every other creation path writes (24 Aug 26) */
      person: filedFor(), date: d, allday, s, e, yr: baseYear(),
      ...(ed ? { endDate: ed } : {}),
      /* only carried when it is one — an absence typed as an exact range is
         not a half-day and must not read as one */
      ...(!allday && half ? { half } : {}),
      /* SANS's own Fly/AMT/OFT flags — never carried by a non-SANS type */
      ...(isSansAvail(type) ? { sans: sansFlags(sans) } : {}),
      /* the id only — the blob lives in state/docs, outside every snapshot.
         Gated on the type needing one: a certificate uploaded under a
         medical pick, then the type switched to leave, must not ride onto
         the leave row */
      ...(docId && needsDoc(type) ? { docId } : {}),
      type, remarks: rem, mod: 'now',
    })
    /* the row INPUTS.unshift just made — pin it to the top of the table and
       light it, so the add is visible even from a view that would filter it
       out. The flash comes off on a timer; the pin waits for the user. The
       dates stay on the form after an add, so the tail that describes them
       stays too — only what the typist wrote is cleared. The document goes
       with its input; the next one needs its own. */
    const finishAdd = () => {
      const row = INPUTS[0]
      setPinned(p => [row, ...p])
      setFlash(f => [row, ...f])
      setJustAddedIid(row.iid)
      timers.current.push(setTimeout(() => setFlash(f => f.filter(x => x !== row)), FLASH_MS))
      setRemarks(withTill('', start, end))
      setDocId(null)
    }
    const commit = (removals: any[], oilDec?: Record<string, number>) => {
      writeInputsBatch(() => {
        INPUTS.unshift(rowBody(date, endDate, remarks.trim()))
        /* the OIL answers land on the just-unshifted row inside the same
           batch — add plus acknowledgment is ONE undo step (owner, 28 Aug 26) */
        if (oilDec) INPUTS[0].oil = oilDec
        /* a new medical input wins its overlapping days from a different-type
           downchit (no clash reached the sheet on this path); an upchit cuts
           everything covering its date to end the day before — the upchit
           day is a fit day (owner, 27 Aug 26) */
        if (isDownchit(type))
          applyMedPlan(newMedTrimPlan(INPUTS[0].person, type, dateOrd(date, INPUTS[0].yr), dateOrd(endDate || date, INPUTS[0].yr), INPUTS[0]))
        if (isUpchit(type))
          applyMedPlan(upchitTrimPlan(INPUTS[0].person, dateOrd(date, INPUTS[0].yr), INPUTS[0]).map((p: any) => ({ ...p, why: 'closed by the upchit' })))
        /* the leftovers the filer chose to remove on the summary sheet ride
           the SAME undo step, logged with the honest reason */
        if (removals.length)
          applyMedPlan(removals.map((lr: any) => ({ row: lr, action: 'delete', why: 'removed with the upchit' })))
        /* an ACTIVITY input files straight onto the Ground Programme (owner, Aug
           26 — "by default all inputs are accepted"); leave/medical/SANS and a
           published day are silent no-ops. Inside the SAME write so add-plus-land
           is one undo step, exactly as commitNewInput's toGround already is. */
        autoAcceptInput(INPUTS[0])
      })
      finishAdd()
    }
    /* an upchit is NEVER saved silently (owner, 27 Aug 26): the summary sheet
       says what it ends and puts every later-dated entry to the filer as an
       explicit Keep/Remove before anything is written */
    if (isUpchit(type)) {
      setUpConf({
        who: PEOPLE[filedFor()] ? PEOPLE[filedFor()].cs : filedFor(),
        dateLabel: date,
        effects: upchitEffects(filedFor(), dateOrd(date, baseYear()), null),
        commit,
      })
      return
    }
    /* a DIFFERENT-type medical overlap is asked about, never resolved
       silently (owner, 27 Aug 26 — the clash sheet): the choices become the
       kept segments, filed as one row plus minted siblings, one undo step */
    if (isDownchit(type)) {
      const aOrd = dateOrd(date, baseYear()), bOrd = dateOrd(endDate || date, baseYear())
      const clashes = medClashes(filedFor(), type, aOrd, bOrd, null)
      if (clashes.length) {
        setMedConf({
          who: PEOPLE[filedFor()] ? PEOPLE[filedFor()].cs : filedFor(),
          newType: type,
          span: date + (endDate ? ' – ' + endDate : ''),
          clashes, a: aOrd, b: bOrd,
          commit: (choices: string[], keepTail: any[]) => {
            const segs = medKeptSegments(aOrd, bOrd, clashes, choices)
            if (!segs.length) return          // toasted; nothing written
            writeInputsBatch(() => {
              const g0 = segs[0]
              INPUTS.unshift(rowBody(
                ordLabel(g0.startOrd, baseYear()),
                g0.endOrd > g0.startOrd ? ordLabel(g0.endOrd, baseYear()) : undefined,
                withRemarksTail(remarks.trim(), ordISO(g0.startOrd), ordISO(g0.endOrd), 'till')))
              applyMedPlan(newMedTrimPlan(INPUTS[0].person, type, g0.startOrd, g0.endOrd, INPUTS[0], keepTail, bOrd))
              mintMedSegments(INPUTS[0], segs.slice(1), keepTail, bOrd)
              autoAcceptInput(INPUTS[0])
            })
            finishAdd()
          },
        })
        return
      }
    }
    /* a duty-&-commitments input over a weekend/PH asks before it writes
       (owner, 28 Aug 26). This path validated by hand above rather than via
       normalizeInputDraft, so the plan is computed off the same values the
       row body will carry — disjoint from the two medical branches by type. */
    if (oilAsks(type)) {
      const plan = oilAskPlan({ person: filedFor(), date, endDate, yr: baseYear(), allday, s, e })
      if (plan.length) {
        setOilConf({
          who: PEOPLE[filedFor()] ? PEOPLE[filedFor()].cs : filedFor(),
          typeLabel: type, plan, prev: {},
          commit: (dec: Record<string, number>) => commit([], dec),
        })
        return
      }
    }
    commit([])
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
    if (!editRow || !draft) return
    /* an upchit EDIT re-runs its trims against the (possibly moved) date, so
       it goes through the same save-time summary a new upchit does (owner,
       27 Aug 26 — nothing silent); the sheet's Save then commits the edit and
       the ticked leftover removals as ONE undo step (the nested batch is
       safe: the inner writeInputsBatch's push is a no-op under the outer). A
       missing date skips straight to the commit, whose own refusal says so. */
    if (isUpchit(draft.type) && draft.start) {
      /* the shared refusals run FIRST — a bad draft toasts at once instead
         of after the summary sheet was already shown */
      if (!normalizeInputDraft(draft, editRow)) return
      const dateLabel = fmt(draft.start)
      setUpConf({
        who: PEOPLE[draft.person] ? PEOPLE[draft.person].cs : draft.person,
        dateLabel,
        effects: upchitEffects(draft.person, dateOrd(dateLabel, editRow.yr), editRow),
        commit: (removals: any[]) => {
          let ok = false
          writeInputsBatch(() => {
            ok = commitInputEdit(editRow, draft)
            if (ok && removals.length)
              applyMedPlan(removals.map((lr: any) => ({ row: lr, action: 'delete', why: 'removed with the upchit' })))
          })
          if (ok) { setEditRow(null); setDraft(null); HOOKS.toast('Input updated', 'ok') }
          else if (INPUTS.indexOf(editRow) < 0) { setEditRow(null); setDraft(null) }
        },
      })
      return
    }
    /* a DIFFERENT-type medical overlap on an EDIT asks too (owner, 27 Aug 26
       — the clash sheet): the edited row becomes the first kept segment, the
       rest are minted as siblings, all one undo step */
    if (isDownchit(draft.type) && draft.start) {
      if (!normalizeInputDraft(draft, editRow)) return
      const aOrd = dateOrd(fmt(draft.start), editRow.yr)
      const bOrd = dateOrd(draft.end ? fmt(draft.end) : fmt(draft.start), editRow.yr)
      const clashes = medClashes(draft.person, draft.type, aOrd, bOrd, editRow)
      if (clashes.length) {
        setMedConf({
          who: PEOPLE[draft.person] ? PEOPLE[draft.person].cs : draft.person,
          newType: draft.type,
          span: fmt(draft.start) + (draft.end && draft.end !== draft.start ? ' – ' + fmt(draft.end) : ''),
          clashes, a: aOrd, b: bOrd,
          commit: (choices: string[], keepTail: any[]) => {
            const segs = medKeptSegments(aOrd, bOrd, clashes, choices)
            if (!segs.length) return
            const g0 = segs[0]
            const d2 = {
              ...draft,
              start: ordISO(g0.startOrd),
              end: g0.endOrd > g0.startOrd ? ordISO(g0.endOrd) : '',
              remarks: withRemarksTail(draft.remarks, ordISO(g0.startOrd), ordISO(g0.endOrd), 'till'),
            }
            let ok = false
            writeInputsBatch(() => {
              ok = commitInputEdit(editRow, d2, keepTail, bOrd)
              if (ok) mintMedSegments(editRow, segs.slice(1), keepTail, bOrd)
            })
            if (ok) { setEditRow(null); setDraft(null); HOOKS.toast('Input updated', 'ok') }
            else if (INPUTS.indexOf(editRow) < 0) { setEditRow(null); setDraft(null) }
          },
        })
        return
      }
    }
    /* the OIL ask on an EDIT (owner, 28 Aug 26) — oilGate runs the shared
       refusals first (a bad draft toasts at once) and re-asks only when the
       plan went stale; its Save commits edit + decisions as one batch */
    const g = oilGate(draft, editRow)
    if (g.kind === 'refused') return
    if (g.kind === 'ask') {
      setOilConf({
        ...g,
        commit: (dec: Record<string, number>) => {
          let ok = false
          writeInputsBatch(() => { ok = commitInputEdit(editRow, draft); if (ok) editRow.oil = dec })
          if (ok) { setEditRow(null); setDraft(null); HOOKS.toast('Input updated', 'ok') }
          else if (INPUTS.indexOf(editRow) < 0) { setEditRow(null); setDraft(null) }
        },
      })
      return
    }
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
    : (range.from ? fmtDay(range.from) : '…') + ' → ' + (range.to ? fmtDay(range.to) : '…')
  /* the arrow reads as the direction the column is going, not as a button */
  const th = (key: string, label: string) => (
    <th className={'insort' + (sort.key === key ? ' on' : '')} data-sort={key}
      aria-sort={sort.key === key ? (sort.dir > 0 ? 'ascending' : 'descending') : 'none'}
      title={`Sort by ${label.toLowerCase()}`} onClick={() => sortBy(key)}>
      {label}<span className="inarrow">{sort.key === key ? (sort.dir > 0 ? '▲' : '▼') : ''}</span>
    </th>
  )

  /* the Medical button's badges: TWO counts in the sections' own colours —
     red for down now, amber for owing an upchit (owner, 27 Aug 26 — "show
     the amber count as well"; one summed red number hid which kind of
     attention was needed). As of the app's notional today (weeknav.TODAY —
     the one literal). Derived per render like everything medical, so they
     can never lag the table. */
  const medIso = keyToIso(TODAY)
  const medOrd = +medIso.slice(0, 4) * 10000 + +medIso.slice(5, 7) * 100 + +medIso.slice(8, 10)
  const medDownN = medDownAsOf(medOrd).length
  const medPendN = pendingUpchits(medOrd).length

  return (
    <>
      {/* the Calendar-view switch leads the page now (owner, 22 Aug 26 — "make
          the calendar button more obvious… I want people to see it"): a prominent
          accent button in the title row, not a plain grey one buried at the end
          of the wrapping filter bar. Same id/handler as before, so every caller
          and test is unchanged — it still just flips INPVIEW over the same
          filtered/windowed data. */}
      <div className="title">
        <h1>Personal Inputs</h1>
        <button className="abtn calview" id="inCalBtn" title="See a whole month at a glance"
          onClick={() => { setInpView('cal'); notify() }}>📅 Calendar view</button>
        {/* the Medical view (owner, 27 Aug 26): who is down, who owes an
            upchit, who upchitted. The count is down-now + pending as of the
            notional today — the button SIGNALS instead of the page
            restructuring itself (a control that appears and disappears with
            the data is a trap; a badge that reads 0-quiet is not). */}
        <button className="abtn calview" id="inMedBtn"
          title="Who is medically down, owing an upchit, or upchitted"
          onClick={() => { setInpView('med'); notify() }}>
          <MedIcon /> Medical
          {medDownN > 0 && <span className="medcount" title="Medically down now">{medDownN}</span>}
          {medPendN > 0 && <span className="medcount pend" title="Owing an upchit">{medPendN}</span>}</button>
      </div>
      <div className="inbar">
        <div className="ingrid">
          {/* A MEMBER'S PERSON IS A VALUE, NOT A CHOICE (owner, 22 Aug 26 —
              admin files for anyone, a member only for whoever they are
              viewing as). The full-roster select is a scheduler's; a member
              gets the view-as callsign printed plainly — a one-entry dropdown
              would only pretend to be a control (the SANS fixed-type
              precedent, inputedit.tsx) — and it follows the topbar's View-as
              live, which is exactly what add() then commits (filedFor). */}
          <div className="ifield"><label>Person</label>
            {canEditSched()
              ? <select id="inPerson" aria-label="Person" value={person} onChange={e => setPerson(e.target.value)}>
                {people().map(id => <option key={id} value={id}>{PEOPLE[id].cs}</option>)}
              </select>
              : <div className="inper-fixed" id="inPersonFixed" aria-label="Person">{PEOPLE[ME] ? PEOPLE[ME].cs : String(ME)}</div>}</div>
          <div className="ifield cal"><label>Dates</label>
            <RangeCal idPrefix="in" start={start} end={end}
              onPick={(s2, e2) => { setStart(s2); setEnd(e2); setRemarks(r => withTill(r, s2, e2)) }} />
            <div className="rc-read" id="inDates">{start ? (fmtDay(start) + (end ? ' → ' + fmtDay(end) : '')) : 'pick a start date'}</div>
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
              /* the All day tick follows the type's default: OFF for the
                 timed "Duty & other commitments" types, ON for leave, medical
                 and SANS (see defaultAllday). This is the form's default, so
                 it re-seeds on every type change — like the half and sans
                 payload below — and the user is free to re-tick it after. */
              setAllday(defaultAllday(t))
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
          {/* the "e.g. medical appt" hint is dropped for SANS Availability
              (owner, 22 Aug 26) — a SANS availability line is not a medical note,
              so the example only misleads on that type */}
          {/* the mandatory supporting document — drawn for exactly the types
              whose add() refuses without one (needsDoc, one body) */}
          {needsDoc(type) && <div className="ifield"><label>Document</label>
            <DocField docId={docId} onDoc={setDocId} /></div>}
          <div className="ifield"><label>Remarks</label><input id="inRemarks" placeholder={isSansAvail(type) ? '' : 'e.g. medical appt'} maxLength={200} value={remarks} onChange={e => setRemarks(e.target.value)} /></div>
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
                ? fmtDay(range.from) + (range.to ? ' → ' + fmtDay(range.to) : ' → pick an end date')
                : 'showing every date'}</div>
              <div className="inrange-btns">
                {/* The quick button SAYS the squadron's setting and applies it
                    — everyone gets the same default, an admin decides what it
                    is (owner, 28 Aug 26). */}
                <button className="abtn" id="inRangeDef" onClick={() => { unpin(); setRange(defaultRange()); setCalOpen(false) }}>{lookaheadLabel()}</button>
                <button className="abtn" id="inRangeAll" onClick={() => { unpin(); setRange({ from: '', to: '' }); setCalOpen(false) }}>{RANGE_ALL}</button>
              </div>
              {/* The admin's pencil: how far ahead the page looks by default.
                  Admin only, and re-checked at the write (`setLookahead` is the
                  one path) rather than merely hidden here. */}
              {SESSION && SESSION.role === 'admin' && (
                <div className="inrange-cfg" id="inRangeCfg">
                  {!lookEdit && (
                    <button className="abtn ghost" id="inRangeEdit" onClick={() => { setLookWeeks(String(LOOK_CFG.weeks)); setLookSun(LOOK_CFG.toSunday); setLookEdit(true) }}>
                      ✎ Default window
                    </button>
                  )}
                  {lookEdit && (
                    <>
                      <label className="la-lbl" htmlFor="inLookWeeks">Weeks ahead</label>
                      <input id="inLookWeeks" className="la-in" inputMode="numeric" value={lookWeeks}
                        aria-label="Weeks ahead" onChange={e => setLookWeeks(e.target.value)} />
                      <label className="la-sun">
                        <input type="checkbox" id="inLookSun" checked={lookSun} onChange={e => setLookSun(e.target.checked)} />
                        run to that week&rsquo;s Sunday
                      </label>
                      <button className="abtn primary" id="inLookSave" onClick={() => {
                        if (!SESSION || SESSION.role !== 'admin') return
                        if (!setLookahead(lookWeeks, lookSun)) {
                          // a refused value goes back to the live one on screen,
                          // never left looking saved
                          setLookWeeks(String(LOOK_CFG.weeks))
                          HOOKS.toast(`Give a number of weeks between ${LOOK_MIN} and ${LOOK_MAX}`)
                          return
                        }
                        setLookEdit(false)
                        setRange(defaultRange())
                        HOOKS.toast(`Everyone now opens on ${lookaheadLabel().toLowerCase()}`, 'ok')
                        notify()
                      }}>Save</button>
                      <button className="abtn ghost" id="inLookCancel" onClick={() => setLookEdit(false)}>Cancel</button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="searchbox">🔍<input id="inFSearch" placeholder="search" value={fSearch} onChange={e => { unpin(); setFSearch(e.target.value) }} /></div>
        {/* the Calendar-view switch moved to the title row (see above) — it opens
            over whatever the table is already filtered and windowed to
            (INPVIEW, state/view.ts); wherever it sits, the filters still apply */}
        <button className="abtn" id="inExport" onClick={() => {
          const out: any[][] = [['Name', 'Date', 'Start', 'End', 'Type', 'Remarks']]
          INPUTS.forEach((r: any) => out.push([PEOPLE[r.person] ? PEOPLE[r.person].cs : r.person, r.date, r.allday ? 'all day' : hhmm(r.s), r.allday ? 'all day' : hhmm(r.e), r.type, r.remarks]))
          exportCSV('142-inputs.csv', out)
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
            {th('remarks', 'Remarks')}{th('mod', 'Last modified')}
            <th></th>
          </tr></thead>
          <tbody id="inBody">
            {rows.map((r: any) => {
              const cs = PEOPLE[r.person] ? PEOPLE[r.person].cs : r.person
              /* DAY-FIRST and de-duplicated (owner, 21 Aug 26 — standardise +
                 compress). Start carries the day-first date + its time; End
                 drops the date when the span stays on one day, so a same-day
                 timed input reads '13 Jul 10:00 → 11:00' rather than repeating
                 the date, and an all-day one-day input reads just '13 Jul' (its
                 End is empty and the card hides it). fmtDay(unfmt(...)) converts
                 the stored 'Jul 13' label without touching what is stored. */
              const sameDay = (r.endDate || r.date) === r.date
              /* A same-day TIMED input keeps its whole span in ONE cell —
                 '13 Jul 10:00–11:00' — so the card reads it on line one without
                 the date wrapping the end time onto a line of its own; End is
                 then empty and the card hides it. A span (all-day range or a
                 timed input crossing midnight) keeps Start and End as two cells
                 joined by the '→', and the desktop table's two columns with it. */
              const day0 = fmtDay(unfmt(r.date))
              const day1 = fmtDay(unfmt(r.endDate || r.date))
              /* the time run rides its own .tnw span so the phone card's
                 narrow date column wraps '13 Jul' / '12:01–23:59' at the
                 SPACE — never after the en-dash mid-range (owner, 22 Aug 26
                 alignment pass); textContent is unchanged, the desktop Start
                 column is sized to hold the whole thing on one line */
              const stT = r.allday ? '' : sameDay ? `${hhmm(r.s)}–${hhmm(r.e)}` : `${hhmm(r.s)}`
              const st = stT ? <>{day0} <span className="tnw">{stT}</span></> : day0
              const en = sameDay ? '' : (r.allday ? day1 : `${day1} ${hhmm(r.e)}`)
              const inx = INPUTS.indexOf(r)
              if (editRow === r && draft) return (
                <tr key={inx} className="ined" data-iid={r.iid}>
                  {/* same rule as the add form (owner, 22 Aug 26): moving an
                      input onto a DIFFERENT person is a scheduler's act — a
                      member editing a row keeps its person, printed as the
                      plain name every closed row already shows. The write
                      path repeats the check (commitInputEdit), so a hand-made
                      select could not get past this render gate anyway. */}
                  <td data-fld="Person">{canEditSched()
                    ? <select aria-label="Person" data-ed="person" value={draft.person}
                      onChange={e => setDraft({ ...draft, person: e.target.value })}>
                      {people().map(id => <option key={id} value={id}>{PEOPLE[id].cs}</option>)}
                    </select>
                    : (PEOPLE[draft.person] ? PEOPLE[draft.person].cs : String(draft.person))}</td>
                  <td colSpan={2} data-fld="Dates">
                    {/* the editor's calendar owns the tail the same way — but only
                        from a click: OPENING the editor leaves an existing remark
                        exactly as it was written */}
                    <RangeCal idPrefix="ined" start={draft.start} end={draft.end}
                      onPick={(s2, e2) => setDraft({ ...draft, start: s2, end: e2, remarks: withTill(draft.remarks, s2, e2) })} />
                    <div className="rc-read">{draft.start ? (fmtDay(draft.start) + (draft.end ? ' → ' + fmtDay(draft.end) : '')) : 'pick a start date'}</div>
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
                  <td data-fld="Type"><select aria-label="Type" data-ed="type" value={draft.type}
                    onChange={e => {
                      const t = e.target.value
                      setDraft({ ...draft, type: t, ...(hasHalf(t) ? {} : { half: '' }), sans: isSansAvail(t) ? (draft.sans || {}) : null })
                    }}>
                    {/* GUARD RAIL (owner, 27 Aug 26): a medical row stays
                        medical here too — a downchit edits only within the
                        downchit family, an upchit stays an upchit; the full
                        cross-group list is kept for every other row. */}
                    {typeOptions(isDownchit(r.type) ? isDownchit : isUpchit(r.type) ? isUpchit : undefined)}
                  </select>
                    {/* replace (or first-attach, on a retype into medical) the
                        supporting document without leaving the row */}
                    {needsDoc(draft.type) && <DocField docId={draft.docId} onDoc={id => setDraft({ ...draft, docId: id })} />}</td>
                  <td data-fld="Remarks"><input aria-label="Remarks" data-ed="remarks" maxLength={200} value={draft.remarks}
                    onChange={e => setDraft({ ...draft, remarks: e.target.value })} /></td>
                  <td className="mono ined-sec" style={{ color: 'var(--ink-3)' }}>{fmtDMY(r.mod)}</td>
                  <td className="inact">
                    <span className="rok" data-save={inx} title="Save" onClick={saveEdit}>✓</span>
                    <span className="rmx" data-cancel={inx} title="Cancel" onClick={() => { setEditRow(null); setDraft(null) }}>✕</span>
                  </td>
                </tr>
              )
              /* the stripe mirrors the month calendar's chip tones — both
                 read inputTone so the two surfaces can't disagree on a
                 colour (see ui/inputedit.tsx) */
              const rowCls = ['in-' + inputTone(r.type), ...(flash.indexOf(r) >= 0 ? ['innew'] : [])].join(' ')
              return (
                <tr key={inx} className={rowCls} data-iid={r.iid}>
                  {/* data-same now marks an EMPTY End — an all-day one-day
                      input, whose date already reads once in Start — so the
                      phone card drops it and reads just "13 Jul". A timed
                      same-day input keeps a non-empty End (the bare end time),
                      so it shows "13 Jul 10:00 → 11:00" (scheduler.css, the
                      inputs card block); the desktop table renders both cells. */}
                  <td data-label="Name">{cs}</td><td data-label="Start">{st}</td><td data-label="End" data-same={en === '' ? '' : undefined}>{en}</td>
                  {/* The two chips too wide for the phone card's aligned type
                      column wear the board day name's split-span idiom (owner,
                      22 Aug 26 — "if there's no space like sans availability u
                      can make it a short form on the phone to be sans avail"):
                      one markup path, the .bl tail hidden under 820px, so the
                      chip reads SANS AVAIL / APPOINT there while textContent
                      stays the raw type string every test and export reads.
                      Appointment (88px, the only other label over the 76px
                      track — measured) rides the same rule. */}
                  {/* a SANS row also wears its F/O/A offer letters (owner,
                      24 Aug 26 — "include the F/O/A in the inputs as well"), the
                      same read the calendar popover and the month chip already
                      give (sansLetters, InputsCal). The letters sit in a chip
                      BESIDE .intag, never inside it, so .intag's textContent
                      stays the pure type string the sort/export/tests read
                      (inputs.test.tsx pins '.intag' === 'OML'). Empty ticks fall
                      back to F/O/A, meaning "offered". The offer's WINDOW is
                      already reflected in the Start/End columns — a timed SANS
                      row reads its span there like any other timed input. */}
                  <td data-label="Type"><span className="intag">{
                    isSansAvail(r.type) ? <>SANS Avail<span className="bl">ability</span></>
                      : r.type === 'Appointment' ? <>Appoint<span className="bl">ment</span></>
                        : r.type
                  }</span>{isSansAvail(r.type) && <span className="foa" title="Available for">{sansLetters(r) || 'F/O/A'}</span>}</td>
                  {/* the mark reads in Remarks, not beside the type (owner,
                      9 Aug 26) — same column on every surface that draws an
                      input, and the type column stays pure identity */}
                  <td data-label="Remarks">{isLateInput(r) && <span className="latetag" title={lateNote(r)}>LATE</span>}{r.remarks || ''}</td>
                  <td className="mono" data-label="Modified" style={{ color: 'var(--ink-3)' }}>{fmtDMY(r.mod)}</td>
                  <td className="inact">
                    {/* the paperwork behind a medical row — EVERY account may
                        view it (owner, 27 Aug 26), so this sits ungated where
                        the row's other actions live */}
                    {r.docId && <span className="rclip" data-doc={inx} title="View the document"
                      onClick={() => { setDocView({ row: r }); notify() }}><ClipIcon /></span>}
                    {/* Edit and delete are the owner's OWN-INPUT rights for a
                        member (owner, 27 Aug 26): a scheduler works every row,
                        a member only their own — someone else's row is view
                        only (the document clip above stays, so they can still
                        read the paperwork). The write path repeats this gate. */}
                    {(canEditSched() || r.person === ME) && <>
                      <span className="red" data-edit={inx} title="Edit this input" onClick={() => startEdit(inx)}>✎</span>
                      <span className="rmx" data-inx={inx} onClick={() => del(inx)}>✕</span>
                    </>}
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
      {/* the table stays mounted underneath — closing the calendar is then a
          free round trip, scroll position and all, rather than a re-navigate
          that has to rebuild the list from scratch */}
      {INPVIEW === 'cal' && <InputsCal fPerson={fPerson} fType={fType} fSearch={fSearch}
        seedIso={range.from || isoOf(new Date())}
        onClose={() => { setInpView('table'); notify() }} />}
      {INPVIEW === 'med' && <MedicalView onClose={() => { setInpView('table'); notify() }} />}
      {/* the upchit save-time summary (owner, 27 Aug 26) — one render site
          for the add form and the row editor; Save runs the stashed commit
          with the removals the filer ticked, Cancel writes nothing */}
      {upConf && <UpchitConfirm who={upConf.who} dateLabel={upConf.dateLabel} effects={upConf.effects}
        onCancel={() => setUpConf(null)}
        onSave={removals => { const c = upConf.commit; setUpConf(null); c(removals) }} />}
      {/* the medical clash sheet — same contract as the upchit one */}
      {medConf && <MedClashConfirm who={medConf.who} newType={medConf.newType} span={medConf.span}
        clashes={medConf.clashes} aOrd={medConf.a} bOrd={medConf.b}
        onCancel={() => setMedConf(null)}
        onSave={(choices, keepTail) => { const c = medConf.commit; setMedConf(null); c(choices, keepTail) }} />}
      {/* the OIL ask (owner, 28 Aug 26) — same contract again: Save runs the
          stashed commit with the day decisions, Cancel writes nothing */}
      {oilConf && <OilConfirm who={oilConf.who} typeLabel={oilConf.typeLabel}
        plan={oilConf.plan} prev={oilConf.prev}
        onCancel={() => setOilConf(null)}
        onSave={dec => { const c = oilConf.commit; setOilConf(null); c(dec) }} />}
    </>
  )
}
