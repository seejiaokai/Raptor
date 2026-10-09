/* The Personal inputs page — the three tabs, the Calendar | List switch and its filters, and the LIST itself: a table
   on a desktop, the input card under a heading a day on a phone.

   THE LIST HAS NO FORM OF ITS OWN (owner D729 — the design vet's V1, 10 Oct 26: "The list opens on a form, not on the
   list … one '+ Input' button that opens that same window"; D726: "I don't like too wordy interface"). Until then this
   page carried a second maker of an input — its own fields, its own `add()` and its own copies of every question (the
   document, the upchit's summary, the medical clash, OIL) — beside the window the calendar opens (ui/inputedit.tsx
   InputEditor). It filled a phone's first screen and the top third of a desktop's. ONE door now: "+ Input" opens that
   window, as a day on the calendar does. What the form did and where each thing is in the window:
   docs/superpowers/plans/2026-10-10-inputs-vet-plan.md §2 — the three it alone did were moved first (the "?" beside
   Type → ui/TypeLegend.tsx; an admin's posted-out people for a NEW input; the just-saved row lit). */
import { Fragment, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { bringRowOnScreen, rowOnScreen } from './onscreen'
import { INPUTS, inpLabel, inpKindTag, isLateInput, lateNote, isSansAvail, sansLetters, baseYear, dateOrd, nowStamp, isoLabel } from '../engine/inputs'
import { OilConfirm } from './OilConfirm'
import { PEOPLE } from '../engine/people'
import { hhmm } from '../engine/time'
import { HOOKS } from '../engine/hooks'
import { LOOK_CFG, LOOK_MAX, LOOK_MIN, lookaheadLabel, lookaheadRange, setLookahead } from '../engine/lookahead'
import { canEditSched } from '../state/auth'
import { me, isAdmin, mayEditInput } from '../state/perms'
import { notify } from '../state/store'
import { INPVIEW, setInpView, INPMODE, setInpMode, INPREVEAL, clearInpReveal } from '../state/view'
import { inputsInMode } from './sans-calendar-model'
import { setDocView, setInpSet, setInpEdit } from './pops'
import { CalIcon, ClipIcon, FilterIcon, ListIcon, MedIcon, UsersIcon } from './icons'
import { MedicalView } from './MedicalView'
import { medDownAsOf, pendingUpchits } from '../engine/medical'
import { TODAY, keyToIso } from './weeknav'
import { InputsCal } from './InputsCal'
import { SansCal } from './SansCal'
/* the draft shape, the OIL question and the new input's seed are the input window's own — see ui/inputedit.tsx */
import {
  fmtDay, fmtDMY, unfmt, typeOptions, draftOf, saveBatch, oilGate, oilAnswered, oilUnansweredDay,
  rosterOptions as people, archivedOptions, inputTone, newInputSeed,
} from './inputedit'
import { docHas, rowDocIds } from '../state/docs'
import { stampChanged } from '../state/inputstamp'
import { entriesOf } from '../state/inputgroup'
import { PlaceholderGroup } from './PeoplePick'
import { EVERYONE, personFilterId, personFilterPasses, personFilterValue } from './inputscal-model'
import { useVersion } from './useStore'
import { exportCSV, inputRows } from './export'
import { RangeCal } from './RangeCal'
import { InputCard } from './InputCard'
import { cardOf, cardWhen, lateNoteOf } from './inputcard-model'
import { dayWord, lateWord } from './sanscal-model'
import { useMedia } from './usemedia'

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
   picker — D287). (The row's own editor, which kept his name as the row's value, went with the List's pencil — D718,
   10 Oct 26; the input's window keeps it the same way.) */
function DeletedGroup() {
  const ids = Object.keys(PEOPLE).filter(id => PEOPLE[id].deleted && INPUTS.some((r: any) => r && r.person === id))
  if (!ids.length) return null
  return <optgroup label="Deleted">{ids.map(id => <option key={id} value={id}>{PEOPLE[id].cs} (deleted)</option>)}</optgroup>
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
/* a date as the engine numbers it (yyyymmdd) → 'yyyy-mm-dd' */
const isoOfOrd = (o: number) => `${Math.floor(o / 10000)}-${pad(Math.floor(o / 100) % 100)}-${pad(o % 100)}`
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
/* an input's row in the List — the desktop table's or the phone's card — by the id it is drawn under */
const listRow = (iid: string) => `#inBody [data-iid="${iid}"], #inList [data-iid="${iid}"]`

/* THE DATES THE LIST IS SHOWING, IN FEW WORDS — for the line an empty list prints (D729 — V5: "No inputs 10–24 Oct. Try
   All dates."). Two days of one month share the month ("10–24 Oct"); otherwise each says its own ("28 Oct – 3 Nov",
   "28 Dec – 3 Jan 2027" — a day outside the loaded year keeps its year, as everywhere). A window with a start and no
   end yet — the first of the picker's two taps — is "from 10 Oct". */
export function rangeWords(from: string, to: string): string {
  if (from && to) {
    if (from.slice(0, 7) === to.slice(0, 7) && fmtDay(from).split(' ').length === 2) return `${+from.slice(8, 10)}–${fmtDay(to)}`
    return `${fmtDay(from)} – ${fmtDay(to)}`
  }
  return from ? `from ${fmtDay(from)}` : `up to ${fmtDay(to)}`
}

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

export function InputsPage() {
  useVersion()
  /* A PHONE, as the stylesheet calls one (06-inputs.css: the same `max-width:820px` at which the table used to be
     restyled into cards) — asked of the browser and followed live, because what is DRAWN differs there, not only how it
     is laid out: the list is the input card under a heading a day (D718, D723), and no table at all. */
  const phone = useMedia('(max-width:820px)')
  /* A member lands on THEIR OWN inputs (owner, 27 Aug 26) — the page is their
     paperwork first — with "Everyone" one pick away in the same filter. A
     scheduler (admin) still opens on the whole squadron. */
  const [memberPerson, setMemberPerson] = useState(canEditSched() ? EVERYONE : (me() ?? ''))
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
    clearInpReveal(); setPinned([])
    if (t === 'med') setInpView('med')
    else { setInpMode(t === 'sans' ? 'sans' : 'member'); setInpView(inputsView.current) }
    notify()
  }
  const [range, setRange] = useState(initialRange)
  /* The admin's default-window editor (owner, 28 Aug 26). Draft values while
     open, so a half-typed number never becomes the squadron's setting. */
  const [lookEdit, setLookEdit] = useState(false)
  const [lookWeeks, setLookWeeks] = useState(String(LOOK_CFG.weeks))
  const [lookSun, setLookSun] = useState(LOOK_CFG.toSunday)
  const [calOpen, setCalOpen] = useState(false)
  const [sort, setSort] = useState({ key: 'start', dir: 1 })
  /* Rows just added, newest first, and rows still flashing. Both hold the input
     OBJECT rather than its index: adding, deleting or undoing renumbers INPUTS
     underneath us. */
  /* the OIL ask (owner, 28 Aug 26) — the oilGate payload plus the commit to run on Save: the desktop row's OIL chip.
     (The upchit's summary, the medical clash and the document question were the add form's and the pencil's; both are
     gone — D718, D729 — and an input opened or added from here asks them through its window's own sheets.) */
  const [oilConf, setOilConf] = useState<any>(null)
  const [pinned, setPinned] = useState<any[]>([])
  const [flash, setFlash] = useState<any[]>([])
  const timers = useRef<any[]>([])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  useEffect(()=>()=>clearInpReveal(),[])

  /* SCROLL THE NEW ROW INTO VIEW (owner — "once an input is made, the view
     will snap to the input u just made"). The row pins to the top and is lit;
     the new <tr> commits to the DOM after this render, so the lookup runs
     from an effect keyed off the id the reveal just set, which fires once
     React has painted it. */
  const [justAddedIid, setJustAddedIid] = useState<{iid:string} | null>(null)
  const reveal=INPREVEAL
  useLayoutEffect(()=>{
    const row=reveal&&INPUTS.find((r:any)=>r.iid===reveal.iid&&inputsInMode([r],INPMODE).length)
    if(!row||!reveal||reveal.mode!==INPMODE)return
    /* MOVED TO THE TOP OF THE LIST ONLY WHEN ITS ROW IS NOT ALREADY ON SCREEN (owner, D672, 8 Oct 26 — "if it's already
       in view, undo/redo don't need to snap to view"): an Undo of an input he is looking at used to lift it to the top
       every time. A row brought back by the Undo (it was not drawn a moment ago) is still lifted, so it is found. */
    /* THE ROW IT IS DRAWN AS (Astra's read of the code, 10 Oct 26 — finding 2): a shared input stands under its FIRST
       record A to Z, and the page is shown whichever record the save made first. Asked for by that record's own id,
       the row was never found: it was pinned and lit, and never brought into view. So the look-up is by the id the
       List draws the entry under — and inside the List, where the month's bars carry ids of their own. */
    const shown=(entriesOf(inputsInMode(INPUTS,INPMODE)).find(e=>e.rows.includes(row))?.rows[0])||row
    if(!rowOnScreen(document.querySelector(listRow(shown.iid))))setPinned(p=>[row,...p.filter(r=>r.iid!==row.iid)])
    setJustAddedIid({iid:shown.iid})
    /* …AND IT IS LIT (D729 — V1). The List's own add form lit the row it had just added — "so the add is visible even
       from a view that would filter it out" — and was the only thing that did: an input saved through its window was
       brought into view dark. With the form gone the window is the List's one door, so the light is given HERE, to
       whatever input the page has just been shown: one added, one changed, one put back by Undo (the month's bar
       has always flashed for all three — `[CAL-CHECK-SEEN]`, "its row does not flash on Undo or Redo"). A shared
       input lights by any of its records (the row below asks `some`). It comes off on a timer; the pin waits for him. */
    setFlash(f=>[row,...f.filter(x=>x!==row)])
    timers.current.push(setTimeout(()=>setFlash(f=>f.filter(x=>x!==row)),FLASH_MS))
  },[reveal])
  useEffect(() => {
    if (!justAddedIid) return
    const el = document.querySelector(listRow(justAddedIid.iid))
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

  /* A MEMBER MAY FILE INPUTS (owner, 5 Aug 26). The reference's role gate turned a member away with "View only — ask
     a scheduler"; the squadron's inputs are the crews' OWN leave, downchits and detachments, so the people they belong
     to enter them — for themselves, and a duty or a commitment for another man while the members' switch is on (D655).
     Who may file what for whom is asked of the one module (state/perms.ts) by the window and at its save; the schedule
     itself is still an admin's, and ACCEPTING an input into the programme is still a scheduler's act.
     "+ INPUT" OPENS THE WINDOW THE CALENDAR OPENS (D729 — V1), with no date picked: the window says "pick a start
     date" and refuses a save until one is (ui/inputedit.tsx newInputSeed). The filters let go of any input they were
     holding in view, as every other touch of the tools does. */
  const openNew = () => { unpin(); setInpEdit(newInputSeed()); notify() }

  /* NO EDIT IN PLACE (owner D718, D723 — 10 Oct 26: "the edit and cross is not needed because … u can click on it to
     edit it or delete it"). The pencil that turned ONE row into fields (Aug 26), its tick, and the row's cross are
     gone: a tap on a row or a card opens the input's own window (ui/inputedit.tsx), which changes every field — its
     dates too, since this change (`datesHere`) — and deletes it. Every question the row's save asked (the document,
     the upchit's summary, the medical clash, OIL) was the window's own body already, so nothing is asked differently. */
  const openInput = (r: any) => { setInpEdit(r); notify() }

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

  let pinCount = 0
  let rows = inputsInMode(INPUTS, INPMODE)
  /* A SHARED INPUT IS ONE LINE (owner D655 — "shown and edited as one thing"; the plan §3.13): the records of one entry
     (state/inputgroup.ts — worked out on read) are drawn as its FIRST record's row, the Name naming EVERYONE in it,
     A to Z (D727 — "Saber +3" until 10 Oct 26). The filters show an entry when ANY of its people passes; it sorts by
     its first callsign — the first name it shows. */
  const entryOf = new Map<any, any[]>()
  for (const e of entriesOf(rows)) if (e.rows.length > 1) for (const r of e.rows) entryOf.set(r, e.rows)
  rows = rows.filter((r: any) => personFilterPasses(fPerson, r.person))   // one body with the month and the opened day
  if (fType !== 'all') rows = rows.filter((r: any) => r.type === fType)
  if (fSearch) { const s = fSearch.toLowerCase(); rows = rows.filter((r: any) => (r.remarks || '').toLowerCase().includes(s) || inpLabel(r).toLowerCase().includes(s) || (PEOPLE[r.person] ? PEOPLE[r.person].cs.toLowerCase() : '').includes(s)) }
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
    pinCount = pins.length
  }
  /* ON A PHONE THE LIST IS THE INPUT CARD UNDER A HEADING A DAY (owner D718, D723 — 10 Oct 26; ui/InputCard.tsx, the
     card the opened day draws). In date order — a phone's list has no column headings to sort by: each day's inputs
     all-day first, then by the hour they start, then by callsign. An input of several days stands under its FIRST
     day and its corner says the day it runs till. A pinned input (just saved, and hidden by a filter or the
     window) is brought to the head of the list WITH ITS DAY: that day's heading comes first — the card carries no
     date of its own, so the heading says it — the pinned input first under it. Worked out only where it is drawn. */
  const dayGroups = !phone ? [] : (() => {
    const first = (r: any) => dateOrd(r.date, r.yr) ?? 0
    const whoOf = (r: any) => (PEOPLE[r.person] ? String(PEOPLE[r.person].cs) : String(r.person || ''))
    const byDay = (a: any, b: any) =>
      first(a) - first(b) || (a.allday === b.allday ? 0 : a.allday ? -1 : 1) || (a.allday ? 0 : (a.s ?? 0) - (b.s ?? 0)) ||
      whoOf(a).localeCompare(whoOf(b), undefined, { sensitivity: 'base' })
    /* ONE HEADING A DAY (Sol's read of the code, 10 Oct 26): a just-saved input kept in view stood under a heading of
       its own, so a day that also held an input the filters show was drawn twice, each with half the count. The day
       is grouped ONCE; a day holding a just-saved input comes first, whole, that input first inside it. */
    const pins = new Set(rows.slice(0, pinCount))
    const byIso = new Map<string, any[]>()
    for (const r of rows.slice().sort(byDay)) { const iso = isoOfOrd(first(r)); if (!byIso.has(iso)) byIso.set(iso, []); byIso.get(iso)!.push(r) }
    const groups = [...byIso].map(([iso, list]) => {
      const held = list.filter(r => pins.has(r))
      return { key: 'day:' + iso, iso, pinned: held.length > 0, rows: held.concat(list.filter(r => !pins.has(r))) }
    })
    groups.sort((a, b) => (a.pinned === b.pinned ? 0 : a.pinned ? -1 : 1))   // a stable sort: date order is kept inside each part
    return groups
  })()

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
  const appliedFilters = tab !== 'inputs' ? [] : [fPerson!==EVERYONE?(PEOPLE[personFilterId(fPerson)]?.cs??fPerson):'',fType!=='all'?fType:'',fSearch.trim()?`Search: ${fSearch.trim()}`:''].filter(Boolean)

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
     its counts ignore filters by ruling, D581). On a phone the filters fold behind one button.

     THE SWITCH KEEPS ITS PLACE (owner D687, 9 Oct 26 — from his iPhone: "the calander/list button jumps to the left when I
     click on the list. Can it remain in the same position?"; his standing rule of 2 Sep 26: a control tapped
     repeatedly must not move). It stood AFTER the month's arrows and "Today", which the List does not have — so it
     slid left the moment "List" was pressed. It is its own piece now, drawn straight after the tabs on both: on the
     Calendar the month's arrows follow it (ui/InputsCal.tsx puts `lead` before them), on the List nothing does. */
  const views = tab !== 'inputs' ? null : (
    <div className="inputs-views" role="group" aria-label="Show inputs as">
      <button className="abtn" id="inCalBtn" title="Calendar — a whole month at a glance" aria-label="Calendar"
        aria-pressed={INPVIEW==='cal'} onClick={() => { setInpView('cal'); notify() }}><CalIcon /><span className="inv-t">Calendar</span></button>
      <button className="abtn" id="inListBtn" title="List" aria-label="List" aria-pressed={INPVIEW==='table'} onClick={()=>{setInpView('table');notify()}}><ListIcon /><span className="inv-t">List</span></button>
    </div>
  )
  const tools = tab !== 'inputs' ? null : (<>
    <span className="inputs-spring" />
    <button className="abtn" id="inFiltersBtn" title="Filters" aria-label={appliedFilters.length ? `Filters, ${appliedFilters.length} set` : 'Filters'} aria-expanded={filtersOpen} aria-controls="inFilters" onClick={()=>setFiltersOpen(o=>!o)}><FilterIcon /><span className="inv-t">Filters</span>{appliedFilters.length>0&&<span className="inputs-filter-count">{appliedFilters.length}</span>}</button>
    {/* NO WORDS OVER THE THREE BOXES (D729 — V5; D726): "Person", "Type" and "Search" stood over them on a phone, where
        the boxes already read "Everyone", "All types" and "Search inputs". Each keeps its name for a screen reader. */}
    <div className={'inputs-filterfields'+(filtersOpen?' open':'')} id="inFilters">
      <label><select id="inFPerson" aria-label="Person" value={fPerson} onChange={e => { unpin(); setFPerson(e.target.value); notify() }}>
        <option value={EVERYONE}>Everyone</option>
        {/* the inputs filed for ALL AVAIL / ALL, each on its own — never "Everyone" ([INPUT-ALL-AVAIL]) */}
        <PlaceholderGroup all value={personFilterValue} />
        {people().map(id => <option key={id} value={id}>{PEOPLE[id].cs}</option>)}
        <ArchivedGroup /><DeletedGroup />
      </select></label>
      <label><select id="inFType" aria-label="Type" value={fType} onChange={e => { unpin(); setFType(e.target.value); notify() }}>
        <option value="all">All types</option>{typeOptions(notSans)}
      </select></label>
      <label className="inputs-search"><input id="inFSearch" type="search" aria-label="Search inputs" placeholder="Search inputs" value={fSearch} onChange={e => { unpin(); setFSearch(e.target.value) }} /></label>
    </div>
    {/* THE GEAR (D635, D639): the app's own cog — the Leave War's settings button — never a drawing with rays. Admins
        only. It opens the Inputs calendar's settings window: the late cut-off for inputs, the members' switch, and the
        door to "Calendar…" (ui/InputsSettings.tsx); the Logic page's rows open the same window. */}
    {isAdmin() && (
      <button type="button" className="abtn inputs-gear" id="inGear" data-testid="in-gear" title="Inputs calendar settings — the late cut-off, who may file for other people, the Calendar"
        aria-label="Inputs calendar settings" onClick={() => { setInpSet(true); notify() }}>&#9881;</button>
    )}
  </>)
  const filterSummary = appliedFilters.length>0&&<div className="inputs-filter-summary" id="inFilterSummary"><span>{appliedFilters.join(' · ')}</span><button className="abtn ghost" id="inFiltersClear" onClick={()=>{unpin();setFPerson(EVERYONE);setFType('all');setFSearch('');notify()}}>Clear filters</button></div>

  return (
    <div className={'inputs-workspace tab-' + tab}>
      <div className="title"><h1>Inputs</h1></div>
      {/* the Inputs calendar draws the tabs and the tools in its OWN top row, beside the month's arrows — one row of
          controls above the month on a desktop, the tabs and ONE tools row on a phone (the plan §3.6: "four rows of
          buttons above the month" was a fault seen while drawing) */}
      {!calUp && <div className="inputs-top">{tabsRow}{views}{tools}</div>}
      {!calUp && filterSummary}
      <div className="infilter inputs-listtools" hidden={!listUp}>
        {/* ONE WAY TO ADD AN INPUT (D729 — V1; the drawing docs/mock/img/inputs-vet/desk-list-drawn.png,
            phone-list-drawn.png): the button stands first in the row, at the left of the dates button — the page's one
            filled button, as "+ Input" is in a day opened on the calendar. */}
        <button type="button" className="abtn primary in-new" id="inNew" data-testid="in-new" hidden={!listUp} onClick={openNew}>+ Input</button>
        {/* the window of dates, picked on a two-click calendar: first click is the from-date, second the to-date */}
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
        {phone ? (
          <div className="inlist" id="inList">
            {dayGroups.map(g => (
              <Fragment key={g.key}>
                <div className="icard-day" data-testid="inl-day" data-iso={g.iso}>
                  <b>{dayWord(g.iso) + (+g.iso.slice(0, 4) !== baseYear() ? ' ' + g.iso.slice(0, 4) : '')}</b>
                  <i>{g.rows.length} input{g.rows.length > 1 ? 's' : ''}</i>
                </div>
                {g.rows.map((r: any) => {
                  const team = entryOf.get(r) || [r]
                  const b0 = r.endDate ? dateOrd(r.endDate, r.yr) : null
                  const when = cardWhen(r, b0 != null ? isoOfOrd(b0) : g.iso, g.iso)
                  return <InputCard key={r.iid} id={r.iid} tid="inl" row facts={cardOf(team, undefined, when)} when={when}
                    late={lateNoteOf(team, lateWord)} flash={team.some((x: any) => flash.indexOf(x) >= 0)} onOpen={() => openInput(r)} />
                })}
              </Fragment>
            ))}
          </div>
        ) : (
        <table className="intbl" id="intbl">
          <thead><tr>
            {th('name', 'Name')}{th('start', 'Start')}{th('end', 'End')}{th('type', 'Type')}
            {th('remarks', 'Remarks')}{th('mod', 'Changed')}
            <th></th>
          </tr></thead>
          <tbody id="inBody">
            {rows.map((r: any) => {
              const cs = PEOPLE[r.person] ? PEOPLE[r.person].cs : r.person
              /* the entry this row stands for — a shared input's people, A to Z — or undefined for an ordinary input */
              const team = entryOf.get(r)
              /* WHO IT IS FOR AND WHO FILED IT ARE THE CARD'S OWN ANSWERS (ui/inputcard-model.ts cardOf), so the desktop
                 list, the phone's list and the opened day cannot say different things:
                 · `names` — EVERY person of a shared input, A to Z, wrapping in the Name column; never "Drifter +3"
                   (owner D727, 10 Oct 26 — drawing A; the kind keeps its pill on this list alone).
                 · `by` — "By Saber", ONLY where someone other than the input's own person filed it, and always for
                   several people (D723, D724) — the design vet's V2 (D729), which NARROWS D629 for this table: the
                   full "Placed by Bolt · 6 Jul 26, 09:10" stood under every remark, repeating the first column's name
                   and the last column's date, and made every row two lines. The whole stamp — who, the day, the time,
                   the last change — is in the input's own window. */
              const said = cardOf(team || [r])
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
              /* the stripe mirrors the month calendar's chip tones — both
                 read inputTone so the two surfaces can't disagree on a
                 colour (see ui/inputedit.tsx) */
              /* LIT BY ANY RECORD OF ITS ENTRY (the host's own find in the walk's pictures, 10 Oct 26): the page is shown
                 ONE record of a shared input — whichever the save made first — and this row stands under the entry's
                 first record A to Z, so a light asked of `r` alone left a just-added shared row dark unless the two
                 were the same man. The phone's card asks the same question the same way. */
              const rowCls = ['in-' + inputTone(r.type), ...((team || [r]).some((x: any) => flash.indexOf(x) >= 0) ? ['innew'] : [])].join(' ')
              return (
                <tr key={inx} className={rowCls} data-iid={r.iid}
                  /* A CLICK ON THE ROW OPENS THE INPUT (D718, D723 — the pencil and the cross are gone). Not a press on
                     one of the row's own controls: its Name button opens it by itself, and the paperclip and the OIL
                     chips of the last cell do their own work. */
                  onClick={ev => { const t = ev.target as HTMLElement; if (!t.closest('button') && !t.closest('.inact > span')) openInput(r) }}>
                  {/* data-same now marks an EMPTY End — an all-day one-day
                      input, whose date already reads once in Start — so the
                      phone card drops it and reads just "13 Jul". A timed
                      same-day input keeps a non-empty End (the bare end time),
                      so it shows "13 Jul 10:00 → 11:00" (scheduler.css, the
                      inputs card block); the desktop table renders both cells. */}
                  <td data-label="Name">
                    {/* the row's BUTTON — what a keyboard and a screen reader meet (the pencil and the cross were spans a
                        Tab never reached: `[TITLE-CHECK-SEEN]` 6) */}
                    <button type="button" className="in-open" data-testid="in-open" title="Open this input"
                      onClick={() => openInput(r)}>{team ? said.names : cs}</button></td><td data-label="Start">{st}</td><td data-label="End" data-same={en === '' ? '' : undefined}>{en}</td>
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
                  <td data-label="Type">{/* a titled input reads by its title, its kind kept beside it (D716 (2), D717) */}
                    {inpKindTag(r) && <b className="intitle" data-testid="in-title">{inpLabel(r)}</b>}<span className="intag">{
                    isSansAvail(r.type) ? <>SANS Avail<span className="bl">ability</span></>
                      : r.type === 'Appointment' ? <>Appoint<span className="bl">ment</span></>
                        : r.type
                  }</span>{isSansAvail(r.type) && <span className="foa" title="Available for">{sansLetters(r) || 'F/O/A'}</span>}</td>
                  {/* the mark reads in Remarks, not beside the type (owner,
                      9 Aug 26) — same column on every surface that draws an
                      input, and the type column stays pure identity */}
                  {/* …and on the remark's own line, in small print, "By Saber" — where the card would say it (`said`,
                      above; a record that never recorded a filer shows none, D56). In the Remarks cell because that is
                      the column with room for it. */}
                  {/* a shared input is LATE on its line where any of its people is — a man added later can be late alone,
                      and the note says who */}
                  <td data-label="Remarks">{(team || [r]).some((x: any) => isLateInput(x)) && <span className="latetag"
                    title={team ? team.filter((x: any) => isLateInput(x)).map((x: any) => `${PEOPLE[x.person] ? PEOPLE[x.person].cs : x.person}: ${lateNote(x)}`).join(' · ') : lateNote(r)}>LATE</span>}{r.remarks || ''}
                    {said.by && <span className={'in-placed' + (r.remarks || (team || [r]).some((x: any) => isLateInput(x)) ? '' : ' alone')} data-testid="in-placed">By {said.by}</span>}</td>
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
                    {/* NO PENCIL, NO CROSS (owner D718, D723): the row opens the input's window, where it is changed and
                        deleted — a shared input's for everyone, asked first (the plan §3.13). What stays here is what
                        acts on the record WITHOUT opening it: the paperclip above, and the OIL chips of an ordinary
                        input its reader may change (a shared input's OIL answer is in its window: here it would act
                        on the first man's record alone). */}
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
                    </>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        )}
        {/* an empty table under a date window is almost always the WINDOW, not
            an empty roster — say which, and where the way out is */}
        <div className="empty" id="inEmpty" hidden={rows.length > 0}>
          {/* fewer words (D729 — V5; D726): "No inputs between 10 Oct → 24 Oct. Change the dates, or pick 'All dates'." */}
          {(range.from || range.to)
            ? `No inputs ${rangeWords(range.from, range.to)}. Try ${RANGE_ALL}.`
            : 'No inputs match.'}
        </div>
      </div>
      {/* the table stays mounted underneath — closing the calendar is then a
          free round trip, scroll position and all, rather than a re-navigate
          that has to rebuild the list from scratch */}
      {sansUp && <SansCal />}
      {calUp && <InputsCal fPerson={fPerson} fType={fType} fSearch={fSearch}
        seedIso={range.from || isoOf(new Date())} lead={<>{tabsRow}{views}</>} tools={tools} under={filterSummary} />}
      {tab === 'med' && <MedicalView />}
      {/* the OIL ask (owner, 28 Aug 26) — the desktop row's OIL chip: Save runs the
          stashed commit with the day decisions, Cancel writes nothing */}
      {oilConf && <OilConfirm who={oilConf.who} typeLabel={oilConf.typeLabel}
        plan={oilConf.plan} prev={oilConf.prev}
        onCancel={() => setOilConf(null)}
        onSave={dec => { const c = oilConf.commit; setOilConf(null); c(dec) }} />}
    </div>
  )
}
