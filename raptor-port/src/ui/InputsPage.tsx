/* The Personal inputs page — markup mirrored 1:1 from the reference (same
   ids, classes and columns), behaviour through the store. The add/delete
   logic is the reference's verbatim, including the role gate that keeps a
   member view-only, and both go through writeInputs so they join the undo
   stack and re-validate the week. */
import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { bringRowOnScreen, rowOnScreen } from './onscreen'
import { INPUTS, INPUT_TYPES, TYPE_GROUPS, inpMeta, inputRuleText, inpId, typeGroup, isLateInput, lateNote, isSansAvail, isDownchit, isUpchit, needsDoc, sansLetters, defaultAllday, withRemarksTail, baseYear, dateOrd, oilAsks, nowStamp, isoLabel } from '../engine/inputs'
import { upchitTrimPlan, upchitEffects, newMedTrimPlan, medClashes, ordLabel } from '../engine/medical'
import { UpchitConfirm } from './UpchitConfirm'
import { MedClashConfirm } from './MedClashConfirm'
import { OilConfirm } from './OilConfirm'
import { oilAskPlan } from '../leavewar/sync'
import { PEOPLE } from '../engine/people'
import { hhmm, parseHM } from '../engine/time'
import { HOOKS } from '../engine/hooks'
import { LOOK_CFG, LOOK_MAX, LOOK_MIN, lookaheadLabel, lookaheadRange, setLookahead } from '../engine/lookahead'
import { canEditSched } from '../state/auth'
import { me, isAdmin, mayEditInput } from '../state/perms'
import { writeInputsBatch, notify, inputProtected } from '../state/store'
import { INPVIEW, setInpView, INPMODE, setInpMode, INPREVEAL, clearInpReveal, revealInput } from '../state/view'
import { inputsInMode } from './sans-calendar-model'
import { setDocView, setInpSet, setInpEdit } from './pops'
import { CalIcon, ClipIcon, FilterIcon, ListIcon, MedIcon, UsersIcon } from './icons'
import { MedicalView } from './MedicalView'
import { medDownAsOf, pendingUpchits } from '../engine/medical'
import { TODAY, keyToIso } from './weeknav'
import { InputsCal } from './InputsCal'
import { SansCal } from './SansCal'
/* the halves, the span control, the draft shape and the commit are shared with
   the dialog the week and the board open — see ui/inputedit.tsx */
import {
  fmt, fmtDay, fmtDMY, unfmt, hasHalf, spanOf, spanFields, SpanPicker, typeOptions,
  draftOf, commitInputEdit, commitGroup, removeInput, saveBatch, SansPicker, sansRefusal, sansOverlapRefusal, sansFlags,
  medOverlapRefusal, upchitRefusal, downOverUpchitRefusal, applyMedPlan, normalizeInputDraft,
  medKeptSegments, mintMedSegments, ordISO, DocField, oilGate, oilAnswered, oilUnansweredDay, docGate,
  rosterOptions as people, archivedOptions, inputTone, medPlanProtected, medSegmentsProtected,
  medAskFor, commitEditMedChoices, commitEditUpchit,
} from './inputedit'
import { DocConfirm } from './DocConfirm'
import { docFields, docHas, rowDocIds } from '../state/docs'
import { stampPlaced, stampChanged } from '../state/inputstamp'
import { placedLine, placedLineOf } from './placedline'
import { entriesOf } from '../state/inputgroup'
import { PeoplePick, pickProblem } from './PeoplePick'
import { useVersion } from './useStore'
import { exportCSV, inputRows } from './export'
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

/* SANS availability is filed on the SANS calendar and nowhere else (D620): no type list on this page offers it */
const notSans = (t: string) => !isSansAvail(t)
const pad = (n: number) => String(n).padStart(2, '0')
const isoOf = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
/* Date normalises an overflowing month for us — 31 Dec + 2 months is 3 Mar,
   not 31 Feb — which is the behaviour a "two months from now" window wants */
const plusMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, d.getDate())

/* The archived / posted-out bodies as their own group in an admin's person
   picker ([ARCH-STACK] step 4, H5 — clearing leave is filed for them). */
function ArchivedGroup() {
  const ids = archivedOptions()
  if (!ids.length) return null
  return <optgroup label="Posted out / archived">{ids.map(id => <option key={id} value={id}>{PEOPLE[id].cs}</option>)}</optgroup>
}
/* A DELETED man's past inputs stay on record (D299 — [POST-OUT-OUTCOMES], 27 Sep 26), so the filter must still find them:
   the deleted men who still have an input, as their own group. Never offered as WHO a new input is for (they are on no
   picker — D287); in a row's own editor his name is kept as the row's value (DeletedSelf). */
function DeletedGroup() {
  const ids = Object.keys(PEOPLE).filter(id => PEOPLE[id].deleted && INPUTS.some((r: any) => r && r.person === id))
  if (!ids.length) return null
  return <optgroup label="Deleted">{ids.map(id => <option key={id} value={id}>{PEOPLE[id].cs} (deleted)</option>)}</optgroup>
}
/* the row's own person when he has been deleted — kept as its value, so the box shows HIS name (with no option the box
   drew the first man on the list while the row still belonged to him; Fable's scenario 7) */
function DeletedSelf({ id }: { id: string }) {
  return PEOPLE[id] && PEOPLE[id].deleted ? <option value={id}>{PEOPLE[id].cs} (deleted)</option> : null
}

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
   `mod` is a yyyy-mm-dd stamp, frozen at the edit (ARCH-STACK 1b). Anything
   stamped TODAY is the most recent, so it sorts above every older stamp — the
   same top-of-list position the literal 'now' used to hold (kept as a fallback
   for any pre-freeze record).
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
  mod: (r: any) => (r.mod === 'now' || r.mod === nowStamp() ? '9999-99-99' : String(r.mod || '')),
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
/* The cost sentence is inputRuleText (engine/inputs) — the SAME source the
   Logic page's type matrix reads, so this legend and the rule book cannot tell
   different stories. It used to hand-write its own shorter copy here; a guard
   test now fails if either surface stops reading the shared source. */
function typeRule(t: string) {
  return inputRuleText(t)
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
  const [person, setPerson] = useState(me() ?? '')
  const [type, setType] = useState(INPUT_TYPES.find(t => !isSansAvail(t))!)
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
  /* the supporting documents a medical input is filed with (owner, 27 Aug
     26; several files per entry since 1 Sep 26) — ids into state/docs;
     cleared after a successful add because the files belong to the input
     just filed, not to the next one */
  const [docIds, setDocIds] = useState<string[]>([])
  /* A member lands on THEIR OWN inputs (owner, 27 Aug 26) — the page is their
     paperwork first — with "Everyone" one pick away in the same filter. A
     scheduler (admin) still opens on the whole squadron. */
  const [memberPerson, setMemberPerson] = useState(canEditSched() ? 'all' : (me() ?? ''))
  const [memberType, setMemberType] = useState('all')
  const [memberSearch, setMemberSearch] = useState('')
  /* the filters are the Inputs tab's alone — the SANS calendar has none (the plan §3.5; its own remembered person and
     search went with its list, D620). What is typed here is kept while he looks at the SANS tab and is there when he
     comes back. */
  const fPerson = memberPerson, setFPerson = setMemberPerson
  const fType = memberType, setFType = setMemberType
  const fSearch = memberSearch, setFSearch = setMemberSearch
  const [filtersOpen,setFiltersOpen] = useState(false)
  /* THE THREE TABS (owner D620, D626, 7 Oct 26 — "I like the 3 tabs across the top but make it less tall"): Inputs · SANS
     · Medical. They replace the mode pair and the view trio as buttons; the state behind them is the same two facts
     (state/view.ts INPMODE — which calendar; INPVIEW — the Inputs tab's Calendar or List, or Medical). `inputsView` is
     which of its two the Inputs tab was left on, so Medical — a tab, not a place opened from somewhere — never decides
     where a tab press lands. */
  const inputsView = useRef<'cal'|'table'>(INPVIEW === 'table' ? 'table' : 'cal')
  if (INPVIEW !== 'med') inputsView.current = INPVIEW
  type Tab = 'inputs' | 'sans' | 'med'
  const tab: Tab = INPVIEW === 'med' ? 'med' : INPMODE === 'sans' ? 'sans' : 'inputs'
  /* ARRIVING ON THE PAGE SHOWS IT FROM ITS TOP. The app keeps the window's scroll from page to page (the week opens
     scrolled to its day on a phone), and this page starts with its tabs: found on the first look at the running build
     — the calendar came up scrolled, its tabs and tools hidden under the top bar. (The Tracker does the same on its
     own arrival.) Only where the window IS scrolled, so a layout-less test environment is never asked to scroll. */
  useEffect(() => { if (window.scrollY) window.scrollTo(0, 0) }, [])
  /* AND A CALENDAR TAB TAKES THE SCREEN, NO MORE (owner D664: "It should be a full screen of the phone"). The app's
     body keeps 120px of room at its foot for the week pages' pinned chrome; under a month that fills the screen that
     room made the whole page scroll by an empty strip. While a calendar is up — the Inputs month or the SANS month —
     the body carries `in-cal`, which drops it (the Tracker's `tr-on`, without the lock: a month too tall for the
     screen must still scroll the page). The List and Medical are ordinary long pages and keep it. */
  const monthUp = tab === 'sans' || (tab === 'inputs' && INPVIEW === 'cal')
  useEffect(() => {
    if (!monthUp) return
    document.body.classList.add('in-cal')
    return () => document.body.classList.remove('in-cal')
  }, [monthUp])
  /* the tab the keyboard has just chosen takes the keyboard with it, once it is drawn as the selected one */
  const wantTab = useRef<string | null>(null)
  useLayoutEffect(() => { const id = wantTab.current; if (!id) return; wantTab.current = null; document.getElementById(id)?.focus() })
  const chooseTab = (t: Tab) => {
    if (t === tab) return
    clearInpReveal(); setPinned([]); setEditRow(null); setDraft(null)
    if (t === 'med') setInpView('med')
    else { setInpMode(t === 'sans' ? 'sans' : 'member'); setInpView(inputsView.current) }
    notify()
  }
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
  /* the medical-document ask (owner, [SYNC-INTEG]) — {who, typeLabel, resume};
     resume() re-runs the pending add/edit with the document treated as resolved */
  const [docConf, setDocConf] = useState<any>(null)
  const [pinned, setPinned] = useState<any[]>([])
  const [flash, setFlash] = useState<any[]>([])
  const timers = useRef<any[]>([])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  useEffect(()=>()=>clearInpReveal(),[])

  /* SCROLL THE NEW ROW INTO VIEW (owner — "once an input is made, the view
     will snap to the input u just made"). The row already pins to the top
     and flashes, but on a phone the user is still looking at the form below
     the fold, not at the table. add() can only SCHEDULE the scroll — the new
     <tr> commits to the DOM after this render, on the same clock the pin/
     flash lists already ride — so the lookup runs from an effect keyed off
     the iid add() just set, which fires once React has painted it. */
  const [justAddedIid, setJustAddedIid] = useState<{iid:string} | null>(null)
  const reveal=INPREVEAL
  useLayoutEffect(()=>{
    const row=reveal&&INPUTS.find((r:any)=>r.iid===reveal.iid&&inputsInMode([r],INPMODE).length)
    if(!row||!reveal||reveal.mode!==INPMODE)return
    /* MOVED TO THE TOP OF THE LIST ONLY WHEN ITS ROW IS NOT ALREADY ON SCREEN (owner, D672, 8 Oct 26 — "if it's already
       in view, undo/redo don't need to snap to view"): an Undo of an input he is looking at used to lift it to the top
       every time. A row brought back by the Undo (it was not drawn a moment ago) is still lifted, so it is found. */
    if(!rowOnScreen(document.querySelector(`[data-iid="${row.iid}"]`)))setPinned(p=>[row,...p.filter(r=>r.iid!==row.iid)])
    setJustAddedIid({iid:row.iid})
  },[reveal])
  useEffect(() => {
    if (!justAddedIid) return
    const el = document.querySelector(`[data-iid="${justAddedIid.iid}"]`)
    /* BROUGHT ON SCREEN BY THE LEAST MOVEMENT, CLEAR OF THE TOP BAR (ui/onscreen.ts bringRowOnScreen). The browser's own
       "nearest edge" scroll, which this was until 8 Oct 26, put a row that was ABOVE the screen at the window's very top
       — behind the app's sticky bar: an Undo of an input scrolled out of view lifted it to the head of the list and hid
       it there (found by the browser check of D672). Where nothing is laid out it is still that scroll, GUARDED exactly
       like interactions.ts:72-79 — jsdom implements no scrolling at all, so scrollIntoView is simply absent on its
       elements; unguarded it throws out of this effect where no test assertion sees it. */
    bringRowOnScreen(el)
  }, [justAddedIid])

  /* A just-added input rides at the top of the table whatever the filters, the
     window and the sort say (owner, Aug 5). Adding something and watching it
     vanish because it falls outside today's view reads as "it didn't save" —
     the one thing the feedback has to rule out. It is a HOLD, not a new
     ordering: the next touch of the filter bar or a column heading is the user
     arranging the table for themselves, and it releases every pin. */
  const unpin = () => { clearInpReveal();setPinned(p => (p.length ? [] : p)) }

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
  /* SINCE THE GROUP INPUT (owner D654–D656; the plan §3.13): the form's Person field is the people picker. A member may
     now pick another man for a duty or a commitment (`memberPick` — his own choice, made on this form; until he makes
     one it is still whoever he is signed in as, read live), and "Several people" files ONE shared input (`team`). */
  const [memberPick, setMemberPick] = useState<string | null>(null)
  const [several, setSeveral] = useState(false)
  const [team, setTeam] = useState<string[]>([])
  const filedFor = (): string => canEditSched() ? person : (memberPick ?? me() ?? '')
  const picked = (): string[] => several && team.length ? team : [filedFor()]
  const add = (skipDoc = false) => {
    /* the calendar asks for a pick and the readout says so — accepting the
       click anyway and quietly dating it Monday was a trap */
    if (!start) return HOOKS.toast('Pick a start date on the calendar first', 'warn')
    const date = fmt(start), endDate = end && fmt(end) !== date ? fmt(end) : undefined
    /* nothing is substituted for the people he picked: where he may not file this kind for them, the add is refused in
       the picker's own sentence (ui/PeoplePick.tsx) */
    const pb = pickProblem(picked(), several, type)
    if (pb) return HOOKS.toast(pb.why, 'warn')
    /* READ-ONLY QUARANTINE preflight (P2-QREV-01/04): refuse an add onto a
       protected week BEFORE any branch, confirm sheet, or write — so a rejection
       never leaves partial state (a Leave War withdrawal, a finishAdd flash on an
       unrelated row, a cleared form and an orphaned document). The medical trim
       cascade is preflighted separately in each commit path below. */
    if (inputProtected({ date, endDate, yr: baseYear(), person: filedFor() })) {
      return HOOKS.toast('This week is locked — it was published by an older version and can’t be edited', 'warn')
    }
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
    /* a medical input with no certificate PROMPTS now (owner, [SYNC-INTEG]) —
       [Upload] or [No document] — instead of a hard refusal; "No document" files
       it with none. docGate is the one shared decision every editor runs. */
    if (!skipDoc && docGate({ type, docIds }, null) === 'ask') {
      setDocConf({
        who: PEOPLE[filedFor()] ? PEOPLE[filedFor()].cs : filedFor(),
        typeLabel: type,
        resume: () => add(true),
      })
      return
    }
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
    /* FOR SEVERAL PEOPLE: one shared input, one command (ui/inputedit.tsx commitGroup) — every refusal asked for every
       man before anything is written; the OIL question asked ONCE, its answer every man's (D660) */
    if (several && team.length > 1) {
      const d = draftOf({ person: team[0], type, date, endDate, allday, s, e, yr: baseYear(), remarks, ...(!allday && half ? { half } : {}) })
      const go = (dec?: Record<string, number>) => {
        const had = new Set(INPUTS.map((x: any) => x.iid))
        if (!commitGroup(null, d, team, dec)) return
        const row = INPUTS.find((x: any) => !had.has(x.iid))
        HOOKS.toast(`Input added for ${team.length} people`, 'ok')
        if (row) {
          revealInput(row)
          setFlash(f => [row, ...f])
          timers.current.push(setTimeout(() => setFlash(f => f.filter(x => x !== row)), FLASH_MS))
        }
        setRemarks(withTill('', start, end))
      }
      const g = oilGate(d, null)
      if (g.kind === 'refused') return
      if (g.kind === 'ask') { setOilConf({ ...g, who: `${PEOPLE[team[0]] ? PEOPLE[team[0]].cs : team[0]} +${team.length - 1}`, commit: go }); return }
      return go()
    }
    /* writeInputsBatch, not writeInputs: the medical trims below run engine
       helpers (Leave-War retraction) that push history of their own, and the
       add plus its trims must land as ONE undo step. Wrapped in a closure
       because an UPCHIT does not write yet — the save-time summary sheet
       (owner, 27 Aug 26) runs first, and its Save calls this with the
       leftovers the filer ticked Remove on. */
    /* one row body for every segment the save files (the clash sheet can
       split an entry around a kept status) — dates and remarks vary, the
       rest is the form's state verbatim */
    /* …and who placed it, and when (D629): this form is its own maker, not the editor's — state/inputstamp.ts */
    const rowBody = (d: string, ed: string | undefined, rem: string) => stampPlaced(withId({
      /* yr anchors the bare labels to the year they were picked under —
         the same stamp every other creation path writes (24 Aug 26) */
      person: filedFor(), date: d, allday, s, e, yr: baseYear(),
      ...(ed ? { endDate: ed } : {}),
      /* only carried when it is one — an absence typed as an exact range is
         not a half-day and must not read as one */
      ...(!allday && half ? { half } : {}),
      /* SANS's own Fly/AMT/OFT flags — never carried by a non-SANS type */
      ...(isSansAvail(type) ? { sans: sansFlags(sans) } : {}),
      /* the ids only — the blobs live in state/docs, outside every snapshot.
         Gated on the type needing one: a certificate uploaded under a
         medical pick, then the type switched to leave, must not ride onto
         the leave row */
      ...(needsDoc(type) ? docFields(docIds) : {}),
      type, remarks: rem, mod: nowStamp(),
    }))
    /* the row INPUTS.unshift just made — pin it to the top of the table and
       light it, so the add is visible even from a view that would filter it
       out. The flash comes off on a timer; the pin waits for the user. The
       dates stay on the form after an add, so the tail that describes them
       stays too — only what the typist wrote is cleared. The document goes
       with its input; the next one needs its own. */
    const finishAdd = (row:any) => {
      if(!row||!INPUTS.includes(row))return
      revealInput(row)
      /* ITS HISTORY LINE (AB8a, 26 Sep 26 — this page's Add, the door people use most, once wrote nothing) is written
         by the change history's ONE writer now, from the command itself (state/changelines.ts — [DRAFT-PENDING],
         Astra DP-03, 28 Sep 26), so no door writes it twice and none can forget it */
      setFlash(f => [row, ...f])
      timers.current.push(setTimeout(() => setFlash(f => f.filter(x => x !== row)), FLASH_MS))
      setRemarks(withTill('', start, end))
      setDocIds([])
    }
    const commit = (removals: any[], oilDec?: Record<string, number>) => {
      /* preflight the medical trim cascade (P2-QREV-01): its trims/deletes and
         Leave War withdrawals cannot be rolled back, so refuse the whole op if any
         trimmed row — or an upchit removal — falls on a protected week. `null`
         except == the in-batch INPUTS[0] except (the new row is not filed yet). */
      const aOrd = dateOrd(date, baseYear()), bOrd = dateOrd(endDate || date, baseYear())
      const checkPlan = isDownchit(type) ? newMedTrimPlan(filedFor(), type, aOrd, bOrd, null)
        : isUpchit(type) ? upchitTrimPlan(filedFor(), aOrd, null) : []
      if (medPlanProtected(checkPlan) || medPlanProtected((removals || []).map((lr: any) => ({ row: lr })))) {
        return HOOKS.toast('This week is locked — it was published by an older version and can’t be edited', 'warn')
      }
      let savedRow:any=null
      const ok = writeInputsBatch(() => {
        INPUTS.unshift(rowBody(date, endDate, remarks.trim()))
        savedRow=INPUTS[0]
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
        /* an ACTIVITY input goes straight onto the Ground Programme (owner, Aug 26 — "by default all inputs are
           accepted"); leave/medical/SANS never do. */
        /* the request's row is worked out AFTER this command, from the request, by the one pass every scheduler command ends with
           ([DB-READINESS] phase 6 (c) — state/holderbase.ts): a member's filing writes his request and no day (D450); on a
           PUBLISHED day it lands on the working copy as a pending amendment (owner 16 Sep 26), the issued face frozen — and a
           reload, or another device, shows the same */
      })
      if (ok) finishAdd(savedRow)   // don't flash/clear the form if the funnel rolled the add back (P2-QREV-04)
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
            /* preflight the trim cascade before any withdrawal/write (P2-QREV-01) */
            if (medSegmentsProtected({ person: filedFor(), type, yr: baseYear() }, segs, keepTail, bOrd, null)) {
              return HOOKS.toast('This week is locked — it was published by an older version and can’t be edited', 'warn')
            }
            let savedRow:any=null
            const ok = writeInputsBatch(() => {
              const g0 = segs[0]
              INPUTS.unshift(rowBody(
                ordLabel(g0.startOrd, baseYear()),
                g0.endOrd > g0.startOrd ? ordLabel(g0.endOrd, baseYear()) : undefined,
                withRemarksTail(remarks.trim(), ordISO(g0.startOrd), ordISO(g0.endOrd), 'till')))
              savedRow=INPUTS[0]
              applyMedPlan(newMedTrimPlan(INPUTS[0].person, type, g0.startOrd, g0.endOrd, INPUTS[0], keepTail, bOrd))
              mintMedSegments(INPUTS[0], segs.slice(1), keepTail, bOrd)
              /* a medical never goes on the programme; an activity's row is worked out after the command (phase 6 (c)) */
            })
            if (ok) finishAdd(savedRow)
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
  const saveEdit = (skipDoc = false) => {
    if (!editRow || !draft) return
    /* THE DOCUMENT ASK runs FIRST (owner, [SYNC-INTEG]): editing an input INTO
       the medical group with no certificate opens [Upload] / [No document] before
       the upchit/downchit/OIL sheets; "No document" resumes through them. An
       already-medical row never prompts — docGate returns 'ok' for it (the
       replace-don't-strip guard still refuses stripping its last file). */
    if (!skipDoc && docGate(draft, editRow) === 'ask') {
      setDocConf({
        who: PEOPLE[draft.person] ? PEOPLE[draft.person].cs : String(draft.person || ''),
        typeLabel: draft.type,
        resume: () => saveEdit(true),
      })
      return
    }
    /* THE MEDICAL QUESTIONS on an EDIT (owner, 27 Aug 26 — nothing silent): an upchit re-runs its trims against the
       (possibly moved) date through the summary sheet; a DIFFERENT-type medical overlap goes to the clash sheet, the
       edited row becoming the first kept segment. What to ask and what each Save writes are the ONE body the
       calendar's drag and the schedule's reassign now share too (inputedit.tsx medAskFor / commitEditUpchit /
       commitEditMedChoices — the absence-record re-test, AB4, 26 Sep 26), so the three doors cannot drift. The shared
       refusals run first; each Save is one undo step. */
    const after = (ok: boolean) => {
      if (ok) { revealInput(editRow);setEditRow(null); setDraft(null); HOOKS.toast('Input updated', 'ok') }
      else if (INPUTS.indexOf(editRow) < 0) {
        /* a REFUSED save puts the list back as new objects ([INPUT-SAVE-SAYS-OK-WHEN-REFUSED]): the row being edited is
           found again by its id and stays in edit, with what was typed; one that is truly gone closes the edit */
        const live = INPUTS.find((x: any) => x.iid === editRow.iid)
        if (live) setEditRow(live); else { setEditRow(null); setDraft(null) }
      }
    }
    const ask = medAskFor(editRow, draft)
    if (ask === 'refused') return
    if (ask && ask.kind === 'up') {
      setUpConf({ who: ask.who, dateLabel: ask.dateLabel, effects: ask.effects,
        commit: (removals: any[]) => after(commitEditUpchit(editRow, draft, removals)) })
      return
    }
    if (ask && ask.kind === 'clash') {
      setMedConf({ who: ask.who, newType: ask.newType, span: ask.span, clashes: ask.clashes, a: ask.a, b: ask.b,
        commit: (choices: string[], keepTail: any[]) => after(commitEditMedChoices(editRow, draft, ask, choices, keepTail)) })
      return
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
          /* the OUTER save's answer, never the inner one's (inputedit.tsx saveBatch) */
          after(saveBatch(() => { const ok = commitInputEdit(editRow, draft); if (ok) editRow.oil = dec; return ok }))
        },
      })
      return
    }
    after(commitInputEdit(editRow, draft))
  }

  const del = (inx: number) => {
    const r = INPUTS[inx]
    if (removeInput(r)) {
      if (editRow === r) { setEditRow(null); setDraft(null) }
      HOOKS.toast('Input deleted', 'ok')
    }
  }

  /* REVISE A RECORDED OIL ANSWER from the row itself (owner, 29 Aug 26 — a
     mistaken "No OIL" used to be revisable only by nudging the input's
     times). No field edit rides along: the sheet re-opens over every
     applicable day with the standing answers pre-loaded (oilGate's force),
     priced off the saved row's own fields (draftOf), and Save rewrites
     row.oil alone — one batch, one undo step. The sync pass reads the new
     answers off the notify like any other write. */
  const reviseOil = (r: any) => {
    const g = oilGate(draftOf(r), r, true)
    if (g.kind !== 'ask') return
    setOilConf({
      ...g,
      commit: (dec: Record<string, number>) => {
        /* an answer alone is a change to the record: who gave it, and when (D629). `mod` — the date the late rule
           reads — is NOT moved by it, as before */
        if (saveBatch(() => { r.oil = dec; stampChanged(r) })) HOOKS.toast('OIL decision updated', 'ok')
      },
    })
  }

  let rows = inputsInMode(INPUTS, INPMODE)
  /* A SHARED INPUT IS ONE LINE (owner D655 — "shown and edited as one thing"; the plan §3.13): the records of one entry
     (state/inputgroup.ts — worked out on read) are drawn as its FIRST record's row, the Name reading "Saber +3". The
     filters show an entry when ANY of its people passes; it sorts by its first callsign. */
  const entryOf = new Map<any, any[]>()
  for (const e of entriesOf(rows)) if (e.rows.length > 1) for (const r of e.rows) entryOf.set(r, e.rows)
  if (fPerson !== 'all') rows = rows.filter((r: any) => r.person === fPerson)
  if (fType !== 'all') rows = rows.filter((r: any) => r.type === fType)
  if (fSearch) { const s = fSearch.toLowerCase(); rows = rows.filter((r: any) => (r.remarks || '').toLowerCase().includes(s) || (PEOPLE[r.person] ? PEOPLE[r.person].cs.toLowerCase() : '').includes(s)) }
  rows = rows.filter((r: any) => inWindow(r, range.from, range.to))
  if (entryOf.size) {
    const seen = new Set<any[]>(), one: any[] = []
    for (const r of rows) {
      const e = entryOf.get(r)
      if (!e) { one.push(r); continue }
      if (!seen.has(e)) { seen.add(e); one.push(e[0]) }
    }
    rows = one
  }
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
    /* A PIN IS ITS ENTRY'S ONE ROW (Sol's read of the calendar job's bug check, 8 Oct 26 — and what a walker had seen):
       a pin points at a RECORD, and a shared input is drawn as its first record's row. A man sorting first, added
       from the List, made another record the first — and the pinned one went on top as a row of its own: one filing,
       drawn twice. Each pin is turned into the row its entry is drawn as, once. */
    const pins = [...new Set(inputsInMode(pinned, INPMODE).filter((r: any) => INPUTS.indexOf(r) >= 0).map((r: any) => (entryOf.get(r) || [r])[0]))]
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
  /* THE SANS TAB IS THE SANS CALENDAR AND NOTHING ELSE (owner D620, 7 Oct 26: SANS availability "leaves the List and is
     filed on the SANS calendar only, which has no list of its own"; the plan §3.5: "the SANS tab has no filters" — the
     Highlight does that job, and the counts ignore filters by ruling, D581). So in that mode the Calendar | List pair,
     the Filters button and the List itself are not drawn; Medical stays, as it is one tab of the three. */
  const sansUp = tab === 'sans'
  const listUp = tab === 'inputs' && INPVIEW === 'table'
  const calUp = tab === 'inputs' && INPVIEW === 'cal'
  const appliedFilters = tab !== 'inputs' ? [] : [fPerson!=='all'?(PEOPLE[fPerson]?.cs??fPerson):'',fType!=='all'?fType:'',fSearch.trim()?`Search: ${fSearch.trim()}`:''].filter(Boolean)

  /* the tabs: a tab list in the usual manner — one tab stop, the arrow keys move along it and round its ends, and the
     keyboard goes with the tab it chose */
  const TABS: [Tab, string, string][] = [['inputs', 'inMemberMode', 'Inputs'], ['sans', 'inSansMode', 'SANS'], ['med', 'inMedBtn', 'Medical']]
  const tabKey = (e: ReactKeyboardEvent, i: number) => {
    const by = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    if (!by) return
    e.preventDefault()
    const to = TABS[(i + by + TABS.length) % TABS.length]
    wantTab.current = to[1]
    chooseTab(to[0])
  }
  const tabsRow = (
    <div className="inputs-tabs" role="tablist" aria-label="Inputs">
      {TABS.map(([t, id, label], i) => (
        <button key={t} type="button" role="tab" id={id} className="intab" aria-selected={tab === t} tabIndex={tab === t ? 0 : -1}
          title={t === 'inputs' ? 'Leave, medical, duties and other commitments' : t === 'sans' ? 'SANS availability — who has committed, and how many more are needed'
            : 'Who is medically down, owing an upchit, or upchitted'}
          onClick={() => chooseTab(t)} onKeyDown={e => tabKey(e, i)}>
          {t === 'inputs' ? <CalIcon /> : t === 'sans' ? <UsersIcon /> : <MedIcon />}
          <span className="intab-t">{label}</span>
          {/* the Medical tab SIGNALS (owner, 27 Aug 26): red for down now, amber for owing an upchit — a badge that reads
              0-quiet, never a control that comes and goes with the data */}
          {t === 'med' && medDownN > 0 && <span className="medcount" title="Medically down now">{medDownN}</span>}
          {t === 'med' && medPendN > 0 && <span className="medcount pend" title="Owing an upchit">{medPendN}</span>}
        </button>
      ))}
    </div>
  )
  /* UNDER THE INPUTS TAB: one small switch, Calendar | List (D620 — "for inputs maybe still have the option to have list
     mode"), and the filters — the Inputs tab's alone; the SANS calendar has neither (its Highlight does that job, and
     its counts ignore filters by ruling, D581). On a phone the filters fold behind one button. */
  const tools = tab !== 'inputs' ? null : (<>
    <div className="inputs-views" role="group" aria-label="Show inputs as">
      <button className="abtn" id="inCalBtn" title="Calendar — a whole month at a glance" aria-label="Calendar"
        aria-pressed={INPVIEW==='cal'} onClick={() => { setInpView('cal'); notify() }}><CalIcon /><span className="inv-t">Calendar</span></button>
      <button className="abtn" id="inListBtn" title="List" aria-label="List" aria-pressed={INPVIEW==='table'} onClick={()=>{setInpView('table');notify()}}><ListIcon /><span className="inv-t">List</span></button>
    </div>
    <span className="inputs-spring" />
    <button className="abtn" id="inFiltersBtn" title="Filters" aria-label={appliedFilters.length ? `Filters, ${appliedFilters.length} set` : 'Filters'} aria-expanded={filtersOpen} aria-controls="inFilters" onClick={()=>setFiltersOpen(o=>!o)}><FilterIcon /><span className="inv-t">Filters</span>{appliedFilters.length>0&&<span className="inputs-filter-count">{appliedFilters.length}</span>}</button>
    <div className={'inputs-filterfields'+(filtersOpen?' open':'')} id="inFilters">
      <label><span>Person</span><select id="inFPerson" aria-label="Person" value={fPerson} onChange={e => { unpin(); setFPerson(e.target.value); notify() }}>
        <option value="all">Everyone</option>
        {people().map(id => <option key={id} value={id}>{PEOPLE[id].cs}</option>)}
        <ArchivedGroup /><DeletedGroup />
      </select></label>
      <label><span>Type</span><select id="inFType" aria-label="Type" value={fType} onChange={e => { unpin(); setFType(e.target.value); notify() }}>
        <option value="all">All types</option>{typeOptions(notSans)}
      </select></label>
      <label className="inputs-search"><span>Search</span><input id="inFSearch" type="search" aria-label="Search inputs" placeholder="Search inputs" value={fSearch} onChange={e => { unpin(); setFSearch(e.target.value) }} /></label>
    </div>
    {/* THE GEAR (D635, D639): the app's own cog — the Leave War's settings button — never a drawing with rays. Admins
        only. It opens the Inputs calendar's settings window: the late cut-off for inputs, the members' switch, and the
        door to "Calendar…" (ui/InputsSettings.tsx); the Logic page's rows open the same window. */}
    {isAdmin() && (
      <button type="button" className="abtn inputs-gear" id="inGear" data-testid="in-gear" title="Inputs calendar settings — the late cut-off, who may file for other people, the Calendar"
        aria-label="Inputs calendar settings" onClick={() => { setInpSet(true); notify() }}>&#9881;</button>
    )}
  </>)
  const filterSummary = appliedFilters.length>0&&<div className="inputs-filter-summary" id="inFilterSummary"><span>{appliedFilters.join(' · ')}</span><button className="abtn ghost" id="inFiltersClear" onClick={()=>{unpin();setFPerson('all');setFType('all');setFSearch('');notify()}}>Clear filters</button></div>

  return (
    <div className={'inputs-workspace tab-' + tab}>
      <div className="title"><h1>Inputs</h1></div>
      {/* the Inputs calendar draws the tabs and the tools in its OWN top row, beside the month's arrows — one row of
          controls above the month on a desktop, the tabs and ONE tools row on a phone (the plan §3.6: "four rows of
          buttons above the month" was a fault seen while drawing) */}
      {!calUp && <div className="inputs-top">{tabsRow}{tools}</div>}
      {!calUp && filterSummary}
      <div className="inbar" hidden={!listUp}>
        <div className="ingrid">
          {/* A MEMBER'S PERSON IS A VALUE, NOT A CHOICE (owner, 22 Aug 26 —
              admin files for anyone, a member only for whoever they are
              viewing as). The full-roster select is a scheduler's; a member
              gets the view-as callsign printed plainly — a one-entry dropdown
              would only pretend to be a control (the SANS fixed-type
              precedent, inputedit.tsx) — and it follows the topbar's View-as
              live, which is exactly what add() then commits (filedFor). */}
          {/* SINCE THE GROUP INPUT (D656): the same field, drawn by the people picker — the scheduler's list as it was
              (with its posted-out group), a member's list where he may file this kind for another man and his callsign
              where he may not, and "Several people" for one shared input. */}
          <PeoplePick form people={picked()} several={several} type={type} more={canEditSched() ? <ArchivedGroup /> : undefined}
            onChange={(p, s2) => {
              setSeveral(s2); setTeam(s2 ? p : [])
              if (p.length && !s2) { if (canEditSched()) setPerson(p[0]); else setMemberPick(p[0]) }
            }} />
          <div className="ifield cal"><label>Dates</label>
            <RangeCal idPrefix="in" start={start} end={end}
              onPick={(s2, e2) => { setStart(s2); setEnd(e2); setRemarks(r => withTill(r, s2, e2)) }} />
            <div className="rc-read" id="inDates">{start ? (fmtDay(start) + (end ? ' → ' + fmtDay(end) : '')) : 'pick a start date'}</div>
          </div>
          {/* NO SANS AVAILABILITY HERE (owner D620, 7 Oct 26 — "in list mode remove sans avail and move that function to
              sans calendar solely"): the type list below leaves it out, and its Fly / OFT / AMT ticks went with it. */}
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
              {typeOptions(notSans)}
            </select></div>
          {/* the "e.g. medical appt" hint is dropped for SANS Availability
              (owner, 22 Aug 26) — a SANS availability line is not a medical note,
              so the example only misleads on that type */}
          {/* the mandatory supporting document — drawn for exactly the types
              whose add() refuses without one (needsDoc, one body) */}
          {needsDoc(type) && <div className="ifield"><label>Document</label>
            <DocField ids={docIds} onIds={setDocIds} /></div>}
          <div className="ifield"><label>Remarks</label><input id="inRemarks" maxLength={200} value={remarks} onChange={e => setRemarks(e.target.value)} /></div>
          <div className="ifield"><label>&nbsp;</label><button className="abtn primary" id="inAdd" onClick={() => add(false)}>Add input</button></div>
        </div>
      </div>
      <div className="infilter inputs-listtools" hidden={!listUp}>
        {/* the window, picked on the same two-click calendar as the form above:
            first click is the from-date, second the to-date */}
        <div className="inrange" hidden={!listUp} ref={rangeRef}>
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
              {isAdmin() && (
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
                        if (!isAdmin()) return
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
        <button className="abtn" id="inExport" hidden={!listUp} onClick={() => {
          /* EVERY input, each one's whole span (AB10) — never only the rows the list is filtered to. The calendar
             build had narrowed it to the filtered rows, so a member (whose list opens on himself) exported his own
             inputs only, and a search that matched nothing wrote an empty file (Opus's own read, step 0, 7 Oct 26) */
          exportCSV('142-inputs.csv', inputRows(INPUTS))
          /* a phone browser often shows nothing at all when a download lands —
             no bar, no tray notification the user is looking at — so the tap
             otherwise reads as dead (owner audit) */
          HOOKS.toast('CSV downloaded', 'ok')
        }}>Export to Excel</button>
      </div>
      <div className="inwrap" hidden={!listUp}>
        <table className="intbl" id="intbl">
          <thead><tr>
            {th('name', 'Name')}{th('start', 'Start')}{th('end', 'End')}{th('type', 'Type')}
            {th('remarks', 'Remarks')}{th('mod', 'Last modified')}
            <th></th>
          </tr></thead>
          <tbody id="inBody">
            {rows.map((r: any) => {
              const cs = PEOPLE[r.person] ? PEOPLE[r.person].cs : r.person
              /* the entry this row stands for — a shared input's people, A to Z — or undefined for an ordinary input */
              const team = entryOf.get(r)
              const placed = team ? placedLineOf(team) : placedLine(r)
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
                      <DeletedSelf id={draft.person} />
                      {people().map(id => <option key={id} value={id}>{PEOPLE[id].cs}</option>)}
                      <ArchivedGroup />
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
                    {typeOptions(isDownchit(r.type) ? isDownchit : isUpchit(r.type) ? isUpchit : notSans)}
                  </select>
                    {/* manage (or first-attach, on a retype into medical) the
                        supporting documents without leaving the row */}
                    {needsDoc(draft.type) && <DocField ids={draft.docIds} onIds={ids => setDraft({ ...draft, docIds: ids })} />}</td>
                  <td data-fld="Remarks"><input aria-label="Remarks" data-ed="remarks" maxLength={200} value={draft.remarks}
                    onChange={e => setDraft({ ...draft, remarks: e.target.value })} /></td>
                  <td className="mono ined-sec" style={{ color: 'var(--ink-3)' }}>{fmtDMY(r.mod)}</td>
                  <td className="inact">
                    <span className="rok" data-save={inx} title="Save" onClick={() => saveEdit(false)}>✓</span>
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
                  <td data-label="Name">{team ? <span title={team.map((x: any) => (PEOPLE[x.person] ? PEOPLE[x.person].cs : x.person)).join(', ')}>{cs} +{team.length - 1}</span> : cs}</td><td data-label="Start">{st}</td><td data-label="End" data-same={en === '' ? '' : undefined}>{en}</td>
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
                  {/* …and under the remark, in small print, who placed the input and when (owner D629 — "wherever an
                      entry is listed or opened"; ui/placedline.ts writes the one line; a record that never recorded a
                      filer shows none, D56). In the Remarks cell because that is the column with room for it. */}
                  {/* a shared input is LATE on its line where any of its people is — a man added later can be late alone,
                      and the note says who */}
                  <td data-label="Remarks">{(team || [r]).some((x: any) => isLateInput(x)) && <span className="latetag"
                    title={team ? team.filter((x: any) => isLateInput(x)).map((x: any) => `${PEOPLE[x.person] ? PEOPLE[x.person].cs : x.person}: ${lateNote(x)}`).join(' · ') : lateNote(r)}>LATE</span>}{r.remarks || ''}
                    {placed && <span className="in-placed" data-testid="in-placed">{placed}</span>}</td>
                  <td className="mono" data-label="Modified" style={{ color: 'var(--ink-3)' }}>{fmtDMY(r.mod)}</td>
                  <td className="inact">
                    {/* the paperwork behind a medical row — EVERY account may
                        view it (owner, 27 Aug 26), so this sits ungated where
                        the row's other actions live */}
                    {rowDocIds(r).some(docHas) && <span className="rclip" data-doc={inx} title="View the document"
                      onClick={() => { setDocView({ row: r }); notify() }}><ClipIcon /></span>}
                    {/* Edit and delete are the owner's OWN-INPUT rights for a
                        member (owner, 27 Aug 26): a scheduler works every row,
                        a member only their own — someone else's row is view
                        only (the document clip above stays, so they can still
                        read the paperwork). The write path repeats this gate.
                        Since the group input (D655): also a duty or commitment
                        he FILED for another man — the one rule, perms.ts
                        mayEditInput, which takes the record. */}
                    {/* A SHARED INPUT'S ONE BUTTON opens its window — for everyone, to change it or to read it. Deleting
                        it and its OIL answer are there, asked for everyone (the plan §3.13); an edit in place, a ✕ or an
                        OIL chip here would act on the first man's record alone. */}
                    {team && <span className="red" data-edit={inx} title="Open this input" onClick={() => { setInpEdit(r); notify() }}>✎</span>}
                    {!team && mayEditInput(r) && <>
                      {/* revise a recorded OIL answer in place (owner, 29 Aug
                          26) — shown exactly where a decision exists to
                          change (oilAnswered), same right as editing the row */}
                      {oilAnswered(r) && <span className="roil" data-oilrev={inx} title="Change the OIL decision"
                        onClick={() => reviseOil(r)}>OIL</span>}
                      {/* AND THE SIGN WHEN NOBODY HAS ANSWERED YET (Fable F6,
                          22 Sep 26). The revise control above appears only where
                          an answer EXISTS, so a request whose question was asked
                          and dismissed — a hand-over where the sheet was
                          cancelled — showed nothing at all outside the mode. The
                          bell is per-member, so it lights for the man and never
                          for the scheduler who made the change. Same predicate
                          family, same place, and it opens the same sheet. */}
                      {!oilAnswered(r) && oilUnansweredDay(r) && <span className="roil ask" data-oilask={inx}
                        title={`Nobody has answered the OIL question for ${isoLabel(oilUnansweredDay(r))} — tap to answer it`}
                        onClick={() => reviseOil(r)}>OIL?</span>}
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
      {sansUp && <SansCal />}
      {calUp && <InputsCal fPerson={fPerson} fType={fType} fSearch={fSearch}
        seedIso={range.from || isoOf(new Date())} lead={tabsRow} tools={tools} under={filterSummary} />}
      {tab === 'med' && <MedicalView />}
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
      {/* the medical-document ask (owner, [SYNC-INTEG]): "No document" resumes
          the pending add/edit with the certificate treated as resolved */}
      {docConf && <DocConfirm who={docConf.who} typeLabel={docConf.typeLabel}
        onUpload={() => setDocConf(null)}
        onNoDoc={() => { const r = docConf.resume; setDocConf(null); r() }} />}
    </div>
  )
}
