/* THE INPUTS CALENDAR — THE MONTH (the build plan docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.6).

   Owner, D626 (7 Oct 26): "I like bars the way Google calendar does" — an input is ONE bar across the days it covers,
   cut at a week's end and carried on. D632 / D639: a desktop shows seven a day before "+N more", compact, no roomy /
   compact switch. D653 / D664: on a phone the week rows share the height the screen gives and the lines a day are what
   fits — never fewer than three; where that cannot fit the WHOLE PAGE scrolls, the month is never a box scrolled
   inside it. D627: a public holiday, an Off day and a no-fly day show as on the SANS calendar, tint and tag — the sun
   and the moon are that calendar's alone. D621 / D626: several days are picked by a mouse drag, or a finger held and
   then dragged; the "Select dates" button is gone. D620: no SANS availability here. D655: a group filing is one bar.

   A REACT component, not a string builder like the week and the board ("React owns chrome, strings own density"): at
   most 42 dates carrying a few bars apiece, no reference to stay byte-for-byte with, and free-text fields (the day's
   title, a note) that live in component state.

   THE MONTH WORKS NOTHING OUT. Which bar sits on which line of which week is ui/inputscal-model.ts (pure); a date's
   class and tag are the ONE resolver's answer (leavewar/sync.ts flyMonth) with the Leave War's short form (dayFacts).
   It hears both stores, so a holiday declared on the war is on the month at once.

   A WEEK IS THREE LAYERS, because a bar lies ACROSS dates and so can sit inside none of them:
     · the DATES themselves (`.ib-day`, `data-icday`) — what a press on empty space lands on, and what the keyboard is on;
     · their HEADS (the number, the tag, the day's title, the planning notes and pucks — drawn in full, as before);
     · the LINES (`.ib-lanes`) — the bars, each placed by its columns and its line, and "+N more".
   The heads and the lines let a press through to the date beneath, except on what they hold.

   WHAT A PRESS DOES is two machines on the one grid, which cannot both take a press: ui/caldrag.ts takes one that
   begins on a bar or a planning note (a tap opens it, a drag moves it by days); ui/calpick.ts takes one that begins on
   a date (a tap opens the day, a mouse drag or a held finger picks several days for "+ Input", a finger slid sideways
   turns the month). Both ask the date under the pointer of the page (ui/caldays.ts), never of the bar.

   THE FIRST CALENDAR WAS A LAYER OVER THE WHOLE SCREEN (22 Aug 26); since the calendar-first Inputs (D574 / D580) it
   has only ever been part of the Inputs page. Its overlay half went with this re-make — the page's scroll lock, its
   own close cross, its failed-save band, and an Escape that left the calendar "back to the list". */
import { Fragment, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react'
import { INPUTS, inputCoversDate, inpLabel, defaultAllday, isSansAvail, sansLetters } from '../engine/inputs'
import { dayFacts, flyAnswer, flyMonth, useWarFacts } from '../leavewar/sync'
import { PEOPLE, QCOLOR, byCrew } from '../engine/people'
import { hhmm } from '../engine/time'
import { puck } from './html'
import { PLANPUCKS, DAYRMK, setDayRemark, addPlanPuck, editPlanPuck, removePlanPuck, addPuckPeople, togglePuckPerson, movePuckPerson, movePlanSection } from '../state/plan'
import { notify, writeInputs } from '../state/store'
import { CALMONTH, setCalMonth, matchesHiSet, INPREVEAL, clearInpReveal, PLANREVEAL, clearPlanReveal } from '../state/view'
import { HL_GROUPS } from './hlchips'
import { canEditSched } from '../state/auth'
import { isMe, mayDeleteInput, me } from '../state/perms'
import { addDays } from '../state/flyplan-model'
import { HOOKS } from '../engine/hooks'
import { inputsInMode } from './sans-calendar-model'
import { fmt, fmtDay, inputTone, firstPersonalType, removeInput, removeEntry } from './inputedit'
import { INPEDIT, setInpEdit } from './pops'
import { initCalDrag } from './caldrag'
import { initCalPick, SWIPE_MIN } from './calpick'
import { barText, dayTag, fitLanes, itemsOn, layoutBars, monthItems, type BarItem, personFilterPasses } from './inputscal-model'
import { placedLineOf, placedShort } from './placedline'
import { cutParts, dayWord, hoursOf, lateWord } from './sanscal-model'
import { FloatWin } from './FloatWindow'
import { WD } from './daysfmt'
import { landOn, markLand, paintLand } from './lift'
import { bringRowOnScreen, rowOnScreen } from './onscreen'
import { useVersion } from './useStore'
import { useMedia } from './usemedia'

const MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December']

/* THE LINES OF A DAY. A desktop: seven before "+N more" (owner D632, D639 — "compact, no switch"). A phone: whatever
   the screen's height gives, worked out by fitLanes from these three heights, which the stylesheet reads back from the
   grid as custom properties — ONE source, so what is measured is what is drawn. */
export const DESK_LANES = 7
/* "+N more" stands on a line of its own, as tall as a bar's */
const PHONE = { head: 22, lane: 16, more: 16 }
const DESK = { head: 26, lane: 20, more: 20 }

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
export function dayEntries(iso: string, f: { fPerson: string, fType: string, fSearch: string }, mode?: 'member') {
  const label = fmt(iso)
  let inputs = inputsInMode(INPUTS, mode).filter((r: any) => inputCoversDate(r, label))
  inputs = inputs.filter((r: any) => personFilterPasses(f.fPerson, r.person))   // one body with the List and the month
  if (f.fType !== 'all') inputs = inputs.filter((r: any) => r.type === f.fType)
  if (f.fSearch) {
    const s = f.fSearch.toLowerCase()
    /* …and by its NAME — its own title, or its kind — as the List and the month do: a bar found by its title opened a
       day that then hid it ([INPUT-OWN-TITLE], Sol's read of the plan — 5) */
    inputs = inputs.filter((r: any) =>
      (r.remarks || '').toLowerCase().includes(s) || inpLabel(r).toLowerCase().includes(s) ||
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

export function InputsCal({ fPerson, fType, fSearch, seedIso, lead, tools, under }:
  { fPerson: string, fType: string, fSearch: string, seedIso?: string,
    /** the Inputs page's three tabs — drawn at the head of this calendar's own top row, so a desktop has ONE row of
     *  controls above the month and a phone the tabs and one tools row (the plan §3.6) */
    lead?: ReactNode,
    /** the page's own tools for the Inputs tab — the Calendar | List switch and the filters — after the month's arrows */
    tools?: ReactNode,
    /** a line of the page's own under the top row (what the filters are set to) */
    under?: ReactNode }) {
  const mode = 'member' as const
  useVersion()
  useWarFacts()
  useVersion()
  const gridRef = useRef<HTMLDivElement>(null)
  /* on a phone the month's name is its first three letters, so the arrows, Today, the switch and the filter button hold
     ONE line across 390px (the SANS month's own rule, ui/SansCal.tsx) */
  const narrow = useMedia('(max-width:820px)')
  /* the deps-`[]` gesture effect below must always call the CURRENT month
     stepper, never the one captured on its first render (which would page
     from the wrong month forever). A ref updated every render is the
     standard "latest callback" seam for that — the effect reads
     stepRef.current at gesture time, when it is fresh. */
  const stepRef = useRef<(n: number) => void>(() => {})
  /* The month-change slide (owner, 22 Aug 26 — "I want swipe animation when I
     swipe left and right"). `slideDirRef` records which way the last step went
     so the layout effect below can slide the new grid IN from that side, then
     consumes it (back to 0). Only a real ‹ › / swipe / Today sets it, so the
     first open and the seed-month jump both read 0 and DON'T slide. The grid
     itself is never re-keyed/remounted, so the pointer listeners wired on it
     (the deps-[] effect) survive every page. */
  const slideDirRef = useRef(0)

  /* The day popover: which day (if any) is open, and whether it should land
     already switched into one puck's inline edit box — a puck-chip tap opens
     the popover FOR that puck already editing (see the onTap below), not
     just for its day. `null` closed; `''` is a second, narrower meaning —
     the + Note box is open for a brand-new puck rather than an existing
     one's text — so there is exactly one flag for "something on this
     popover is mid-edit" instead of a second one that could fall out of
     step with it. */
  const [popIso, setPopIso] = useState<string | null>(null)
  /* a run of days being drawn by the pointer, first day first — and one stretched by the keyboard */
  const [drawn, setDrawn] = useState<{ a: string; b: string } | null>(null)
  const [kb, setKb] = useState<{ anchor: string; end: string } | null>(null)
  /* the date the keyboard is on (ONE tab stop for the whole month), and a date to focus once it is drawn */
  const [at, setAt] = useState<string | null>(null)
  const wantFocus = useRef<string | null>(null)
  /* which input of the opened day Delete has asked about (its entry's key) */
  const [delAsk, setDelAsk] = useState<string | null>(null)
  const [savedId,setSavedId]=useState<string|null>(null)
  const reveal=INPREVEAL
  const shown=useRef<typeof INPREVEAL>(null)
  /* A SAVED INPUT, OR ONE BROUGHT BACK BY UNDO, IS SHOWN WHERE IT IS (owner D672, 8 Oct 26: "if it's already in view,
     undo/redo don't need to snap to view. Unless it's outside the screen view then it's ok to snap into view" — and its
     reading 9: a save follows the same rule). The month turns to it if it is in another month (unaltered). Then, once
     that month is drawn (`pending`): an input whose BAR is on the month flashes where it stands — brought on screen
     first if the page had it scrolled away — and nothing opens over the month. Only one with no bar (behind "+N more",
     or let through by no filter), or a save made from a day that is open, opens the day, where it is listed. The first
     calendar opened the day every time: an Undo of a bar's move threw a sheet over the month he was looking at. */
  const [pending, setPending] = useState<typeof INPREVEAL>(null)
  useLayoutEffect(()=>{
    const saved=reveal&&INPUTS.find((r:any)=>r.iid===reveal.iid&&inputsInMode([r],mode).length)
    if(!saved||!reveal||(mode&&reveal.mode!==mode)){setSavedId(null);return}
    /* THE MONTH TURNS ONLY WHEN NONE OF IT IS ON THE MONTH SHOWN (D672). It used to turn to the month the input STARTS
       in, whatever was on screen: an input running 29 Jul to 3 Aug, looked at in August, was thrown back to July by an
       Undo of its move (the calendar job's bug check, 8 Oct 26 — walker E). Its span is the model's own (monthItems). */
    const span=monthItems([saved],{fPerson:'all',fType:'all',fSearch:''})[0]
    const at=CALMONTH,lo=at?`${at.y}-${String(at.m).padStart(2,'0')}-01`:'',hi=at?`${at.y}-${String(at.m).padStart(2,'0')}-31`:''
    if(!(span&&at&&span.a<=hi&&span.b>=lo))setCalMonth({y:+reveal.iso.slice(0,4),m:+reveal.iso.slice(5,7)})
    setPending(reveal)
  },[reveal,mode])
  useLayoutEffect(()=>{
    if(!pending)return
    setPending(null)
    if(INPREVEAL!==pending)return
    const key=items.find(it=>it.rows.some((r:any)=>r.iid===pending.iid))?.key
    const bar=key&&popIso==null?gridRef.current?.querySelector(`.ib-bar[data-iid="${key}"]`) as HTMLElement|null:null
    if(bar){
      if(!rowOnScreen(bar))bringRowOnScreen(bar)
      landOn(bar)
      clearInpReveal()
      return
    }
    setSavedId(pending.iid);setPopIso(pending.iso);shown.current=pending
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[pending])
  /* THE REVEAL IS SPENT ONCE ITS DAY HAS BEEN SHOWN AND LEFT (Opus's own read of the build, step 0, 7 Oct 26). It is
     view state that outlives this component — so the List can pin the same row — and nothing took it back when the
     day was closed: List and back to Calendar (or Medical and back) mounted a new calendar, which opened the saved
     day again and pulled the month back to it. Closing the day, opening another, or leaving the calendar spends it.
     Guarded by identity, so a NEWER reveal set while this calendar unmounts (a save that switches mode) is kept. */
  const spendReveal=()=>{ if(shown.current&&INPREVEAL===shown.current)clearInpReveal(); shown.current=null }
  /* every press that opens or closes a day goes through here — the one place the reveal is spent */
  const showDay=(iso:string|null)=>{
    /* A PICKER ENDS WITH ITS DAY (Sol S2): the day closed or changed with the picker up used to leave the picker
       standing, and its Cancel, Escape or OK then wrote onto a day no longer open. It is settled first, as Cancel
       settles it — a new note keeps its words once, unconfirmed ticks are dropped. */
    if(iso!==popIso&&settlePick.current)settlePick.current()
    if(shown.current&&iso!==shown.current.iso)spendReveal(); setPopIso(iso)
  }
  const settlePick=useRef<(()=>void)|null>(null)
  useEffect(()=>()=>spendReveal(),[])
  const pickDate=(iso:string)=>{ showDay(iso);setPopPuckEdit(null);setDelAsk(null) }
  const [popPuckEdit, setPopPuckEdit] = useState<string | null>(null)
  /* "How this works" — folded away each time the calendar is opened: it is read once, not looked at daily */
  const [how, setHow] = useState(false)
  /* which late input's note is showing in the opened day (its entry's key) */
  const [lateOpen, setLateOpen] = useState<string | null>(null)
  const [rmkDraft, setRmkDraft] = useState('')
  const [puckDraft, setPuckDraft] = useState('')
  /* the section being DRAGGED to a new position in the popover (owner, 22 Aug
     26 — "shift these up and down by drag and dropping"), and which section
     the pointer is over + which half (the Matrix roster drag's half rule:
     the lower half means "after this one", which is what makes the last
     position reachable at all). Both null outside a drag. */
  const [secDrag, setSecDrag] = useState<string | null>(null)
  const [secOver, setSecOver] = useState<{ id: string, after: boolean } | null>(null)
  /* An in-flight seated-puck or section drag parks a "cancel me, don't commit"
     here (review fix, 24 Aug 26). Both drags run on WINDOW listeners for the
     life of one press; if the popover closes mid-drag (Escape, the ✕, a tap
     outside), the chip unmounts but those window listeners survive, and the
     next stray pointerup anywhere would fire the drop — silently pulling a
     puck off the day that just closed. The effect below fires this canceller
     the instant the popover closes, tearing the listeners down WITHOUT
     committing. Each drag clears it again when it ends on its own. */
  const dragCancelRef = useRef<(() => void) | null>(null)
  useEffect(() => {
    if (popIso == null && dragCancelRef.current) { dragCancelRef.current(); dragCancelRef.current = null }
  }, [popIso])
  /* the multi-select puck picker (owner, 23 Aug 26 — "a placeholder view to
     select a few pucks at 1 go … then press ok"). `pickFor` is the pucks row
     the ticks land on — a real row id, or '' meaning "make a NEW row on OK" —
     and null when the picker is closed; `pickIso` is the day that new row
     belongs to; `pickSel` is the people ticked so far. */
  const [pickFor, setPickFor] = useState<string | null>(null)
  const [pickIso, setPickIso] = useState<string>('')
  /* THE WORDS OF THE NOTE THE PICKER IS FOR, when it is a NEW one (pickFor === ''): taken the moment its "+ people" is
     pressed — so nothing typed or opened elsewhere while the picker is up can become this note's words (the day-window
     check, Astra's scenario 2.2: the one shared draft could have lent a new note another note's words) */
  const [pickWords, setPickWords] = useState('')
  /* true from the press of a new note's "+ people" until its picker closes: the button's own blur must not finish the note */
  const pickingNew = useRef(false)
  const [pickSel, setPickSel] = useState<Set<string>>(new Set())
  /* the picker's HIGHLIGHT is a pure visual filter, NOT a selection (owner,
     24 Aug 26 — "when I mentioned highlight, it just means u will fade those
     pucks so that I know which puck is applicable. Not select them"). `pickHi`
     is the set of lit category keys; a puck matching any of them stays bright,
     the rest fade. `pickGrp` is which of the CAT/Type/Quals tabs is expanded. */
  const [pickHi, setPickHi] = useState<Set<string>>(new Set())
  const [pickGrp, setPickGrp] = useState<string>('')

  /* the remark draft is seeded fresh every time a DIFFERENT day's popover
     opens, never on a repaint — the same "seed on prop change, not on every
     render" rule inputedit.tsx's own draft follows (draftOf re-seeds on `r`
     changing). Re-seeding on every render would stomp what is being typed
     the moment any unrelated store write repaints the page underneath it. */
  useEffect(() => { setRmkDraft(popIso ? (DAYRMK[popIso] || '') : '') }, [popIso])

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
    /* the render that ran before this effect fell back to the CURRENT month —
       right only when the seed IS this month. A past-window seed needs the
       repaint, and setCalMonth alone repaints nothing (see step below). */
    notify()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ESCAPE peels one layer: the people picker (a blocking chooser over the day's window — this handler, which stops the
     key there), then the day's window (the shell's own rule, ui/FloatWindow.tsx: the front window, when the keyboard
     is in a window or nowhere). It stands down while the input editor is up (that has its own). It never leaves the
     calendar: the month is a tab's screen, not a layer to close. */
  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || INPEDIT) return
      /* Escape ends the picker exactly as Cancel does (a new note keeps its words — cancelPick) */
      if (pickFor != null) { e.stopPropagation(); cancelPick() }
    }
    document.addEventListener('keydown', esc, true)
    return () => document.removeEventListener('keydown', esc, true)
  }, [pickFor, pickWords, pickIso])

  /* THE PICKER'S THREE ENDS, one body each — its Cancel, Escape and OK all come here. A note being WRITTEN is finished
     by its picker whichever way that closes: with the people ticked, or — with none — as its words alone, exactly as
     leaving its box would have made it; no words and no people, no note (a note with neither is not kept, D695). */
  /* ONE OPENER, AND IT IS OWNED (Sol S1): while a picker is up it belongs to the note it was opened for — a second
     "+" (the keyboard could reach one under it) is not a take-over; it does nothing until this one has ended. `words`
     is given for a NEW note (target ''), taken from its box at that moment. The control that opened it gets the
     keyboard back when it ends. */
  const pickOpener = useRef<HTMLElement | null>(null)
  const openPick = (target: string, day: string, words?: string) => {
    if (pickFor != null) return false
    pickOpener.current = document.activeElement as HTMLElement | null
    setPickWords(words || ''); setPickFor(target); setPickIso(day); setPickSel(new Set())
    return true
  }
  const shutPick = () => {
    pickingNew.current = false; setPickFor(null); setPickSel(new Set()); setPickHi(new Set()); setPickGrp(''); setPickWords('')
    const back = pickOpener.current; pickOpener.current = null
    if (back && back.isConnected) setTimeout(() => { if (back.isConnected) back.focus() }, 0)
  }
  const finishNewNote = (ids: string[]) => { if (pickWords || ids.length) writeInputs(() => addPlanPuck(pickIso, pickWords, ids)) }
  const cancelPick = () => { if (pickFor === '') finishNewNote([]); shutPick() }
  settlePick.current = pickFor != null ? cancelPick : null
  /* THE KEYBOARD STAYS IN THE PICKER while it is up (Sol S1): it is a blocking chooser, and Tab used to walk out of it
     onto the notes beneath. It takes the focus as it opens; Tab and Shift+Tab turn round at its ends. */
  useEffect(() => {
    if (pickFor == null) return
    const box = document.querySelector('.ic-pick') as HTMLElement | null
    if (box && !box.contains(document.activeElement)) box.focus()
    const tab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !box) return
      const stops = [...box.querySelectorAll<HTMLElement>('button:not([disabled]), [href], input, select, [tabindex]:not([tabindex="-1"])')].filter(n => n.offsetParent !== null || n === document.activeElement)
      if (!stops.length) { e.preventDefault(); return }
      const first = stops[0], last = stops[stops.length - 1], at = document.activeElement as HTMLElement | null
      if (!at || !box.contains(at) || at === box) { e.preventDefault(); (e.shiftKey ? last : first).focus() }
      else if (e.shiftKey && at === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && at === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', tab, true)
    return () => document.removeEventListener('keydown', tab, true)
  }, [pickFor])
  /* A NOTE CHANGED BY UNDO OR REDO (state/undo-wire.ts → PLANREVEAL; D672, Sol S3): the month has been turned to it; a
     day window open on ANOTHER day is brought to its day — it stood over the change. With no day open, or its own day
     open already, nothing is opened or moved. Spent as it is read. */
  const planReveal = PLANREVEAL
  useLayoutEffect(() => {
    if (!planReveal) return
    clearPlanReveal()
    if (popIso != null && popIso !== planReveal.iso) { setPopPuckEdit(null); setDelAsk(null); showDay(planReveal.iso) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planReveal])
  const confirmPick = () => {
    const ids = [...pickSel]
    if (pickFor === '') finishNewNote(ids)
    else if (ids.length && pickFor) writeInputs(() => addPuckPeople(pickFor, ids))
    shutPick()
  }

  /* Seed the add-input modal exactly the way a board's "+ Add" does
     (interactions.ts ~592-608) — same fields, same defaults — but with NO
     canEditSched refusal: page-rights parity means everyone may file their
     OWN input from their own calendar, the same reach a member already has
     on the Inputs table's own + Add. A member's Person field is already
     hidden inside the dialog (inputedit.tsx ~695, canEditSched-gated), so
     the ME seed here is exactly what ends up saved regardless of who opened
     it. */
  const openAdd = (from: string, until?:string) => {
    const [iso,end]=until&&until<from?[until,from]:[from,until]
    const t = firstPersonalType()
    setInpEdit({ _new: true, _calendar:true, _ctx: 'i', person: me(), type: t, date: fmt(iso), endDate:end&&end!==iso?fmt(end):undefined, allday: defaultAllday(t), s: 360, e: 1080 })
    notify()
  }
  const closePop = () => { showDay(null); setPopPuckEdit(null); setDelAsk(null) }

  /* ---- the pointer: two machines on the one grid, wired once; they read the latest handlers through a ref -------- */
  const tapEntry = (entry: any) => {
    if (entry.kind === 'input') {
      const r = INPUTS.find((x: any) => x.iid === entry.iid)
      if (r) { setInpEdit(r); notify() } // object resolve — never index
      return
    }
    showDay(entry.fromIso)
    /* a note with WORDS opens already in its own edit box; one that holds people and no words has none to edit, so
       its tap just opens the day (its people are changed on the note there) */
    const sec = PLANPUCKS.find((p: any) => p.id === entry.pid)
    if (sec && !String(sec.text || '').trim()) { setPopPuckEdit(null) }
    else { setPopPuckEdit(entry.pid); setPuckDraft(sec?.text || '') }
  }
  const live = useRef({ tapEntry, pickDate, openAdd, step: (_n: number) => {} })
  live.current.tapEntry = tapEntry; live.current.pickDate = pickDate; live.current.openAdd = openAdd
  useEffect(() => {
    const el = gridRef.current
    if (!el) return
    /* a press that begins on a bar or a planning note: a tap opens it, a drag moves it by days; a finger slid sideways
       from one turns the month, as it does from empty space */
    const offDrag = initCalDrag(el, {
      onTap: entry => live.current.tapEntry(entry),
      onSwipe: (dx, dy) => { if (Math.abs(dx) >= SWIPE_MIN && Math.abs(dx) > Math.abs(dy)) live.current.step(dx < 0 ? 1 : -1) },
    })
    /* a press that begins on a date: everyone may file his OWN input from his own calendar (the reach a member already
       has on the List's add form), so a pick is never refused here */
    const offPick = initCalPick(el, {
      canPick: () => true,
      onTap: iso => { setKb(null); setAt(iso); live.current.pickDate(iso) },
      onPicking: setDrawn,
      onRange: (a, b) => { setKb(null); live.current.openAdd(a, b) },
      onSwipe: dir => live.current.step(dir),
    })
    return () => { offDrag(); offPick() }
  }, [])

  const cur = CALMONTH || { y: new Date().getFullYear(), m: new Date().getMonth() + 1 }
  /* year rollover mirrors RangeCal.tsx's own step(), adjusted for CALMONTH's
     1-12 month (RangeCal's `view.m` is the 0-11 a JS Date uses).
     setCalMonth is a bare module-let write (state/view.ts's idiom) — it
     repaints NOTHING on its own, so each step must notify() the store the
     way InputsPage's own toggle does. Caught on the live view, not by the
     suite: the tests drove CALMONTH directly and never saw the stuck title. */
  const step = (n: number) => {
    slideDirRef.current = n
    const m0 = (cur.m - 1) + n
    setCalMonth({ y: cur.y + Math.floor(m0 / 12), m: ((m0 % 12) + 12) % 12 + 1 })
    notify()
  }
  /* keep the pointer machines' stepper current — see `live` above */
  stepRef.current = step
  live.current.step = step
  const goToday = () => {
    const d = new Date(); const ny = d.getFullYear(), nm = d.getMonth() + 1
    /* Today reads as a jump, not a page — slide only when it actually crosses a
       month, and in the direction it travels (forward if it lands later). */
    slideDirRef.current = (ny * 12 + nm) - (cur.y * 12 + cur.m) < 0 ? -1 : 1
    setCalMonth({ y: ny, m: nm }); notify()
  }

  /* ---- THE KEYBOARD (owner D621, D626 — the set stands as drawn): arrows move from date to date and turn the month at
     its ends; Shift and the arrows stretch a run; Enter opens the day, or files "+ Input" for the run; Escape closes
     the front window, then lets a run go; Delete, on an input in the opened day, removes it — asking first (below, in
     the day's list). ONE tab stop for the month, as the SANS month has. ---- */
  useLayoutEffect(() => {
    const iso = wantFocus.current
    if (!iso) return
    const el = gridRef.current?.querySelector<HTMLElement>(`[data-icday="${iso}"]`)
    if (el) { wantFocus.current = null; el.focus({ preventScroll: false }) }
  })
  const moveTo = (iso: string) => {
    const y = +iso.slice(0, 4), m = +iso.slice(5, 7)
    setAt(iso); wantFocus.current = iso
    if (y !== cur.y || m !== cur.m) { slideDirRef.current = y * 12 + m > cur.y * 12 + cur.m ? 1 : -1; setCalMonth({ y, m }); notify() }
  }
  const ARROWS: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }
  const onKey = (iso: string) => (e: ReactKeyboardEvent) => {
    if (e.target !== e.currentTarget) return
    const by = ARROWS[e.key]
    if (by !== undefined) {
      e.preventDefault()
      const to = addDays(iso, by)
      if (e.shiftKey) setKb(k => ({ anchor: k ? k.anchor : iso, end: to }))
      else setKb(null)
      moveTo(to)
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (kb) { const [a, b] = kb.anchor <= kb.end ? [kb.anchor, kb.end] : [kb.end, kb.anchor]; setKb(null); openAdd(a, b) }
      else pickDate(iso)
    } else if (e.key === 'Escape') {
      /* the front window first, then the run (the plan §3.6). The keyboard is on a date — the page BEHIND the window —
         where the shell leaves Escape to whatever has it (ui/FloatWindow.tsx), so the date itself closes its day. */
      if (popIso) { e.preventDefault(); e.stopPropagation(); closePop() }
      else if (kb) { e.preventDefault(); e.stopPropagation(); setKb(null) }
    }
  }

  /* THE SLIDE. After the month's DOM is in place, run the new grid in from the
     side the page turned: next (finger swept left, or ›) enters from the right,
     previous from the left. The Web Animations API plays it on the SAME element
     — no re-key, no second panel — so it never disturbs the gesture listeners
     or the layout. `dir` is consumed each run, so only a real page slides; the
     first open and the seed-month jump (dir 0) don't. Also a no-op when the
     browser honours prefers-reduced-motion, and where `animate` is absent
     (jsdom under test). */
  useLayoutEffect(() => {
    const dir = slideDirRef.current
    slideDirRef.current = 0
    if (!dir) return
    const el = gridRef.current
    if (!el || typeof el.animate !== 'function') return
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const from = dir > 0 ? 28 : -28
    el.animate(
      [{ transform: `translateX(${from}px)`, opacity: 0.25 }, { transform: 'translateX(0)', opacity: 1 }],
      { duration: 240, easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)' },
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cur.y, cur.m])

  /* ONE LIFT, EVERY DRAG (owner, 6 Sep 26 — "once I drop the item it should
     flash to show where the new item ended up"). A drop here writes to the
     store, and that write REBUILDS this whole surface, so the landing cannot be
     painted at the drop: the drag marks an address first (lift.ts markLand) and
     this pass flashes it in the very commit that rebuilt it. Deliberately NO
     dep list — every commit is a candidate, and the marked node may appear in
     one that no single dependency describes (the popover's sections and seated
     pucks, and the month grid's chips once a chip move marks one). Its idle
     cost is one null check; lift.ts, not this effect, decides when the mark is
     spent, so a repaint can never restart a flash. */
  useLayoutEffect(() => { paintLand() })

  const cells = monthCells(cur.y, cur.m)
  /* the flat cell list chunked into weeks of 7 — each renders as its own flex
     row (.ic-week) so a packed day grows its week's height instead of spilling
     over the weeks below; see the body's own comment. monthCells always pads to
     a multiple of 7, so every chunk is a full week. */
  const weeks: (string | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  const todayIso = isoToday()

  /* ---- the bars: every input the filters let through, as entries; each week lays out its own ---------------------- */
  const items = monthItems(INPUTS, { fPerson, fType, fSearch })
  const answers = flyMonth(cur.y, cur.m)

  /* ---- ON A PHONE THE MONTH TAKES THE FULL SCREEN (D653, D664): the week rows share the height from the month's top
     to the foot of the screen — measured from what the browser really shows, and measured again when that changes (its
     own bars sliding away, a turn of the phone, the rows above the month growing). A FLOOR, never a limit: a row is
     never squeezed under three lines, so a short screen or a six-week month makes the month taller than the screen and
     the WHOLE PAGE scrolls — the month has no scroll of its own. On a desktop the rows share the height the same way
     and the lines are seven. ---- */
  const topRef = useRef<HTMLDivElement>(null)
  const sizes = narrow ? PHONE : DESK
  const [fit, setFit] = useState(() => fitLanes(NaN, weeks.length, sizes))
  useLayoutEffect(() => {
    const el = gridRef.current
    if (!el) return
    const measure = () => {
      const vv = window.visualViewport
      const h = vv ? vv.height : window.innerHeight
      const top = el.getBoundingClientRect().top + (window.scrollY || 0)
      const next = fitLanes(h - top - 12, weeks.length, sizes)
      setFit(f => (f.row === next.row && f.lanes === next.lanes ? f : next))
    }
    measure()
    window.addEventListener('resize', measure)
    window.visualViewport?.addEventListener('resize', measure)
    const ro = typeof ResizeObserver !== 'undefined' && topRef.current ? new ResizeObserver(measure) : null
    if (ro && topRef.current) ro.observe(topRef.current)
    return () => { window.removeEventListener('resize', measure); window.visualViewport?.removeEventListener('resize', measure); ro?.disconnect() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weeks.length, narrow])
  const lanes = narrow ? fit.lanes : DESK_LANES
  /* the month's one tab stop: where the keyboard last was, else today, else the 1st */
  const firstIso = cells.find(Boolean) as string
  const tabAt = at && at.slice(0, 7) === firstIso.slice(0, 7) ? at : todayIso.slice(0, 7) === firstIso.slice(0, 7) ? todayIso : firstIso
  const run = drawn || (kb ? (kb.anchor <= kb.end ? { a: kb.anchor, b: kb.end } : { a: kb.end, b: kb.anchor }) : null)

  const KIND_SAY: Record<string, string> = { ph: 'public holiday', off: 'Off day', nf: 'no-fly day' }
  const nameOf = (id: any) => (PEOPLE[id] ? PEOPLE[id].cs : String(id))
  /* a desktop bar's tooltip (D632 — "pointing at a bar shows who placed it"): who, what, when, and the small-print line */
  const tip = (it: BarItem) => {
    const r = it.rows[0]
    const dates = it.a === it.b ? fmtDay(it.a) : `${fmtDay(it.a)} – ${fmtDay(it.b)}`
    const hours = r.allday ? '' : ` · ${hhmm(r.s)}–${hhmm(r.e)}`
    /* a titled input's bar has room for its name only — its kind is said here (D717's row for the month) */
    return [`${it.rows.map((x: any) => nameOf(x.person)).join(', ')} · ${it.word}${it.kind ? ' · ' + it.kind : ''} · ${dates}${hours}`, placedLineOf(it.rows)].filter(Boolean).join('\n')
  }

  /* THE DAY POPOVER — a day's inputs, remark and planning notes without
     leaving the month view. A plain function rather than a separate
     component: it closes over this component's own state setters
     (setPopIso, setPopPuckEdit, the two drafts) the same way the render
     body below already does, and splitting it out avoids a wall of
     ternaries inline in the JSX return. */
  const renderPop = (iso: string) => {
    const entries = dayEntries(iso, { fPerson, fType, fSearch }, mode)
    const saved=INPUTS.find((r:any)=>r.iid===savedId&&inputsInMode([r],mode).length&&inputCoversDate(r,fmt(iso)))
    const revealed=!!saved&&!itemsOn(iso,items).some(it=>it.rows.includes(saved))
    const hasRmk = !!DAYRMK[iso]
    const sched = canEditSched()
    /* Enter commits by handing off to the SAME blur handler that already
       commits (rather than a second copy of the write), so there is exactly
       one place per field that decides what "commit" means. */
    const blurOnEnter = (e: ReactKeyboardEvent) => { if (e.key === 'Enter') (e.target as HTMLElement).blur() }
    /* SECTION DRAG (admin) — the Matrix roster drag's shape scaled down: the
       handle starts it, elementFromPoint + the row-half rule track it, and
       the release resolves "after X" to "before whatever follows X" in this
       day's own section order. Window listeners for the life of one drag. */
    const startSecDrag = (e: React.PointerEvent, id: string) => {
      if (e.button != null && e.button !== 0) return
      e.preventDefault()
      setSecDrag(id)
      let over: { id: string, after: boolean } | null = null
      const move = (ev: PointerEvent) => {
        const el = document.elementFromPoint(ev.clientX, ev.clientY)
        const row = el && (el as Element).closest ? (el as Element).closest('[data-sec]') : null
        const overId = row?.getAttribute('data-sec') ?? null
        let after = false
        if (row) {
          const r = (row as HTMLElement).getBoundingClientRect()
          after = r.height > 0 && ev.clientY > r.top + r.height / 2
        }
        if (overId !== (over?.id ?? null) || after !== (over?.after ?? false)) {
          over = overId ? { id: overId, after } : null
          setSecOver(over)
        }
      }
      const end = (commit: boolean) => {
        window.removeEventListener('pointermove', move)
        window.removeEventListener('pointerup', up)
        window.removeEventListener('pointercancel', cancel)
        if (dragCancelRef.current === cancel) dragCancelRef.current = null
        setSecDrag(null); setSecOver(null)
        /* A COMMITTED DROP WITH A TARGET FLASHES WHERE THE THING ENDED UP,
           MOVED OR NOT (7 Sep 26; the owner's words are "once I drop the item
           it should flash to show where the new item ended up", and IN PLACE is
           where it ended up — the Leave War grid already reads this way for a
           drop on a row's own grip). Only a cancel, or a release with nothing
           under it, shows nothing — hence this one early return.
           The flash is DEFERRED through a mark rather than written here, on
           every branch, because the state clears above already guarantee a
           re-render: React is about to rewrite this row's className to drop
           `dragging`, and an imperative class added now would go with it. The
           layout effect paints in that very commit, so nothing is left waiting. */
        if (!commit || !over) return
        const landSel = `[data-sec="${id}"]`     // one address, whichever way the drop resolves
        if (over.id === id) { markLand(landSel); return }   // dropped on itself
        const secs = dayEntries(iso, { fPerson, fType, fSearch }).pucks
        let beforeId: string | null = over.id
        if (over.after) {
          const ix = secs.findIndex((s: any) => s.id === over!.id)
          beforeId = secs[ix + 1]?.id ?? null
        }
        if (beforeId === id) { markLand(landSel); return }  // resolves to its own place
        /* a real move: the same mark, but the write is what rebuilds the
           popover, and movePlanSection may still refuse it as a no-op — either
           way the section is there to flash when the layout effect runs. */
        markLand(landSel)
        writeInputs(() => movePlanSection(id, beforeId))
      }
      const up = () => end(true)
      const cancel = () => end(false)
      window.addEventListener('pointermove', move)
      window.addEventListener('pointerup', up)
      window.addEventListener('pointercancel', cancel)
      dragCancelRef.current = cancel        // popover close → cancel, don't reorder
    }
    /* DRAG A SEATED PUCK — reorder it, swap it, or lift it off the row (owner,
       23 Aug 26 "i just drag them out … just like edit schedule mode"; 24 Aug 26
       "shift the pucks around … when I move pucks over each other it will swap
       the crew"). It rides the puck itself (no handle): a small drift arms the
       drag and the chip follows the finger. On release —
         • over ANOTHER slot in the same row → SWAP the two (dropping onto an
           empty slot just moves it there, the blank riding back to the vacated
           slot — movePuckPerson),
         • back on its OWN slot / between cells → nothing, a cancel,
         • OUTSIDE the row → drop the person (togglePuckPerson, the removal).
       A press that never drifts is left alone, so a plain tap still does nothing
       destructive (right-click is the other deliberate remove). The lifted chip
       is pointer-events:none (.pk-drag), so elementFromPoint reads the slot UNDER
       the finger, not the chip; the gaps are opacity:0 (not visibility:hidden)
       so an empty slot is a real drop target too. */
    const startPkDrag = (e: React.PointerEvent, rowId: string, personId: string, fromIx: number) => {
      if (e.button != null && e.button !== 0) return       // left button / touch only
      const chip = e.currentTarget as HTMLElement
      const x0 = e.clientX, y0 = e.clientY
      let dragging = false
      try { chip.setPointerCapture(e.pointerId) } catch (_) { /* older engines */ }
      /* which slot is the finger over? cell null / ix -1 when the point is
         between cells; inRow false once it has left the row altogether. */
      const slotAt = (ev: PointerEvent) => {
        const over = document.elementFromPoint(ev.clientX, ev.clientY) as Element | null
        const inRow = !!(over && over.closest && over.closest(`[data-secpucks="${rowId}"]`))
        const cell = over && over.closest ? over.closest(`[data-secpucks="${rowId}"] .ic-secpk`) as HTMLElement | null : null
        const ix = cell && cell.dataset.pkidx != null ? +cell.dataset.pkidx : -1
        return { inRow, ix, cell }
      }
      const clearLit = () => document.querySelectorAll(`[data-secpucks="${rowId}"] .pk-swap-target`).forEach(x => x.classList.remove('pk-swap-target'))
      const move = (ev: PointerEvent) => {
        if (!dragging && Math.abs(ev.clientX - x0) < 6 && Math.abs(ev.clientY - y0) < 6) return
        if (!dragging) { dragging = true; chip.classList.add('pk-drag'); document.body.classList.add('ic-dragging') }
        chip.style.transform = `translate(${ev.clientX - x0}px, ${ev.clientY - y0}px)`
        const { ix, cell } = slotAt(ev)
        clearLit()
        if (cell && ix >= 0 && ix !== fromIx) cell.classList.add('pk-swap-target')   // show the swap target
      }
      const done = (ev: PointerEvent | null) => {
        window.removeEventListener('pointermove', move)
        window.removeEventListener('pointerup', up)
        window.removeEventListener('pointercancel', cancel)
        if (dragCancelRef.current === cancel) dragCancelRef.current = null
        clearLit()
        chip.classList.remove('pk-drag'); chip.style.transform = ''
        document.body.classList.remove('ic-dragging')
        if (!dragging || !ev) return                        // a tap, not a drag — leave the puck seated
        const { inRow, ix } = slotAt(ev)
        if (!inRow) writeInputs(() => togglePuckPerson(rowId, personId))                          // off the row → drop
        /* Released back on its OWN slot: a committed drop with a target, so it
           flashes where it ended up — in place (7 Sep 26; the owner's "show
           where the new item ended up"). Straight onto the chip, no mark: there
           is no write, so nothing rebuilds this row and nothing re-renders that
           could wipe the class (the seated puck's className is a constant, and
           this whole drag is imperative — that is why `.pk-drag` works too). */
        else if (ix === fromIx) landOn(chip)
        /* a swap/move LANDS somewhere else, so it flashes there — the SLOT it
           landed in, marked before the write that rebuilds the row
           (src/ui/lift.ts). A drop OFF the row is a removal with no landing
           place, so it marks nothing. */
        else if (ix >= 0) {
          markLand(`[data-secpucks="${rowId}"] .ic-secpk[data-pkidx="${ix}"]`)
          writeInputs(() => movePuckPerson(rowId, fromIx, ix))
        }
        // inRow but between cells (ix -1) → a cancel, leave it seated, no flash
      }
      const up = (ev: PointerEvent) => done(ev)
      const cancel = () => done(null)
      window.addEventListener('pointermove', move)
      window.addEventListener('pointerup', up)
      window.addEventListener('pointercancel', cancel)
      dragCancelRef.current = cancel        // popover close → cancel, don't drop/swap
    }
    /* what the day lists: every input covering it, as the month's own items (a group is one — ui/inputscal-model.ts),
       plus the one just saved where no filter lets it through, so a save is never answered with an empty day */
    const list = itemsOn(iso, items)
    if (revealed) list.unshift(...monthItems([saved], { fPerson: 'all', fType: 'all', fSearch: '' }))
    const kind = dayTag(answers[iso] || flyAnswer(iso), dayFacts(iso).short)
    const name = dayFacts(iso).name
    const kindWord = !kind ? undefined
      : kind.kind === 'nf' ? 'No fly'
        : (kind.kind === 'ph' ? 'Public holiday' : 'Off day') + (name && !/^(ph|off day|off)$/i.test(name.trim()) ? ' · ' + name : '')
    /* when an input is, said the way the approved day says it: its hours, "All day", or — for one that runs on past
       this day — the day it runs till */
    const whenOf = (it: BarItem) => (it.b > iso ? (it.allday ? '' : hoursOf(it.rows[0]) + ' · ') + 'till ' + fmtDay(it.b) : hoursOf(it.rows[0]))
    const openInput = (r: any) => { setInpEdit(r); notify() }
    /* DELETE on a line removes that input — ASKING FIRST (D621): a key pressed by a slip must not take a man's leave
       away. Only where its reader may delete it (the write path's own rule, perms.ts — the screen mirrors it and says
       who can); the question is put under the line, and Escape puts it away without closing the day. */
    const onLineKey = (it: BarItem) => (e: ReactKeyboardEvent) => {
      if (e.key !== 'Delete' && e.key !== 'Backspace') return
      e.preventDefault()
      const r = it.rows[0]
      /* A SHARED INPUT (the plan §3.13): its filer or an admin is asked about everyone; a man in it who is neither is
         asked about himself; anyone else is told who can */
      if (it.rows.length > 1) {
        if (!it.rows.every(x => mayDeleteInput(x)) && !it.rows.some(x => isMe(x.person))) {
          const by = it.rows.find(x => x.grpBy)?.grpBy ?? it.rows.find(x => x.by)?.by
          HOOKS.toast(`Only ${PEOPLE[by] ? PEOPLE[by].cs : 'whoever filed it'} — who filed it — or an admin can delete this for everyone`, 'warn'); return
        }
        setDelAsk(it.key); return
      }
      /* an input filed for ALL AVAIL / ALL has no owner to name — the one who may is whoever FILED it (Sol's read of the
         code, 9 Oct 26: the editor's read-only line was corrected and this keyboard door still said "Only ALL AVAIL …") */
      if (!mayDeleteInput(r)) {
        const ph = PEOPLE[r.person] && PEOPLE[r.person].special
        HOOKS.toast(ph ? `Only ${(r.by != null && PEOPLE[r.by] && PEOPLE[r.by].cs) || 'whoever filed it'} — who filed it — or an admin can delete this input`
          : `Only ${PEOPLE[r.person] ? PEOPLE[r.person].cs : 'its owner'} or an admin can delete this input`, 'warn'); return
      }
      setDelAsk(it.key)
    }
    const doDelete = (it: BarItem) => {
      setDelAsk(null)
      if (it.rows.length > 1) {
        const rows = it.rows.map(x => INPUTS.find((y: any) => y.iid === x.iid)).filter(Boolean) as any[]
        if (rows.every(x => mayDeleteInput(x))) { if (removeEntry(rows)) HOOKS.toast(`Input deleted for ${rows.length} people`, 'ok'); return }
        const mine = rows.find(x => isMe(x.person))
        if (mine && removeInput(mine)) HOOKS.toast('You are out of this input', 'ok')
        return
      }
      const live = INPUTS.find((x: any) => x.iid === it.rows[0].iid)
      if (live && removeInput(live)) HOOKS.toast('Input deleted', 'ok')
    }
    return (
      /* A WINDOW ON THE SHELL (owner D641: it is dragged about and the month behind it still works — so a tap on
         another date re-points this same window, and an input saved behind it shows in it at once). No veil, no close
         on an outside press; it closes by its ✕, by Escape, or by another date taking its place. On a phone it stands
         on the foot of the screen at two heights (D648, the SANS day's own manner) — and opens at the TALL one, with
         an admin's "+ Note" and "+ Pucks" in its bar beside the date (owner D683, 9 Oct 26, from his phone). */
      <FloatWin id="inputsday" title={dayWord(iso)} sub={kindWord} testid="win-inputsday" className="inputsday" rests tallFirst onClose={closePop}
        tools={sched ? <>
          <button type="button" className="abtn sm" id="icAddPuck"
            onClick={() => { setPopPuckEdit(''); setPuckDraft('') }}>+ Note</button>
        </> : null}>
        {/* PINNED: the day's title and "+ Input" stay while the list scrolls under them */}
        <div className="sd-top">
          {/* the day TITLE (owner, 22 Aug 26 — "beside the date, I can input free text there, and it will show up as the
              title on the calendar view"). A scheduler edits it in place (commit on Enter / blur); a member reads it. */}
          {sched ? (
            <input id="icRmkEdit" className="ic-title-edit" placeholder="Day title…"
              aria-label="Day title" value={rmkDraft}
              onChange={e => setRmkDraft(e.target.value)}
              onBlur={() => writeInputs(() => setDayRemark(iso, rmkDraft))}
              onKeyDown={blurOnEnter} />
          ) : hasRmk ? (
            <span className="ic-title-ro">{DAYRMK[iso]}</span>
          ) : null}
          {/* everyone may add — the reach a member already has on the List's own add form */}
          <div className="sd-acts">
            <button type="button" className="abtn primary sd-add" id="icPopAdd" onClick={() => openAdd(iso)}>+ Input</button>
          </div>
        </div>
        <div className="sd-list" data-testid="idy-list">
            {/* THE NOTES (owner D684, 9 Oct 26 — "For the +note, perhaps just have a function to add pucks on the text
                written, instead of a +pucks button"; D688 "more compact"; D692 drawing A; D694; D695). ONE kind of
                section: a note holds words, people, or both. Its words are one slim line with a small pencil and
                cross; its people stand four across straight under them, the schedule's own pucks, a dashed "+" the
                last of them; a note of people and no words has no line of words at all — the people, the "+", then
                the pencil (which adds words) and the cross. An admin drags the ⠿ handle to rearrange notes; members
                read them, nothing more. A person is taken off as before (D689): his puck dragged off the note, or
                onto another to swap; a right-click removes too. "+ Note" is in the window's bar (D683). */}
            {entries.pucks.length > 0 && (
              <div className="ic-secs">
                {entries.pucks.map((p: any) => {
                  const ids: string[] = Array.isArray(p.ids) ? p.ids : []
                  const ppl = ids.some(Boolean), words = String(p.text || '').trim()
                  /* a note with neither is not kept (state/plan.ts) — one saved empty before D684 draws nothing */
                  if (!words && !ppl) return null
                  const editing = sched && popPuckEdit === p.id
                  const dragCls = secDrag === p.id ? ' dragging'
                    : secDrag && secOver && secOver.id === p.id ? (secOver.after ? ' dragover after' : ' dragover') : ''
                  const pick = () => { openPick(p.id, iso) }
                  const tools = sched && <>
                    {!ppl && <button type="button" data-pkadd={p.id} className="ic-note-ppl" aria-label="Add people to this note" title="Add people" onClick={pick}>+</button>}
                    <button type="button" data-ppedit={p.id} aria-label={words ? 'Edit note' : 'Add words to this note'} title={words ? 'Edit' : 'Add words'}
                      onClick={() => { setPopPuckEdit(p.id); setPuckDraft(words) }}>✏</button>
                    <button type="button" data-ppdel={p.id} aria-label="Delete note" title="Delete this note"
                      onClick={() => writeInputs(() => removePlanPuck(p.id))}>✕</button>
                  </>
                  return (
                    <div key={p.id} className={'ic-sec' + dragCls} data-sec={p.id}>
                      {sched && (
                        <span className="ic-sechandle" data-sechandle={p.id} title="Drag to reorder"
                          style={{ touchAction: 'none' }}
                          onPointerDown={e => startSecDrag(e, p.id)}>⠿</span>
                      )}
                      {/* `data-secpucks` is the whole note: a puck let go anywhere on it is a swap or a cancel, and only
                          one let go OUTSIDE it is taken off (startPkDrag) */}
                      <div className={'ic-poppuck ic-note' + (ppl ? ' has-ppl' : '') + (!words && !editing ? ' no-words' : '')} data-secpucks={p.id} data-testid={'idy-note-' + p.id}>
                        {editing ? (
                          <input className="ic-poppuck-edit" autoFocus value={puckDraft}
                            aria-label="Edit planning note" onChange={e => setPuckDraft(e.target.value)}
                            onBlur={() => {
                              /* emptied, a note WITH people loses its words and stays (D695); one without is left as it was */
                              const t = puckDraft.trim()
                              if (t !== words && (t || ppl)) writeInputs(() => editPlanPuck(p.id, t))
                              setPopPuckEdit(null)
                            }}
                            onKeyDown={blurOnEnter} />
                        ) : words ? <span className="ic-poppuck-txt">{words}</span> : null}
                        {(words || editing) && tools}
                        {ppl && (
                          /* the app's own canonical pucks. Clicks STOP here: the injected puck() markup matches the
                             document-level routeClick's `.puck[data-person]` branch, which would silently toggle the
                             schedule pages' selection from inside this window. A removed puck BLANKS its slot rather
                             than closing the gap (togglePuckPerson), so an empty cell holds the position and the
                             survivors never shift; data-pkidx is the slot's index, read by startPkDrag. */
                          <div className="ic-secpucks" onClick={e => e.stopPropagation()}>
                            <div className="ic-secpk-grid">
                              {ids.map((id: string, i: number) => !id ? (
                                <span key={'g' + i} className="ic-secpk ic-secpk-gap" data-pkidx={i} aria-hidden="true" />
                              ) : (
                                /* a seated puck carries NO ✕ (owner, 24 Aug 26): drag it onto another puck to SWAP, onto
                                   an empty slot to MOVE, or off the note to REMOVE; a right-click also removes (desktop).
                                   touchAction:none so the drag doesn't scroll the window under the finger. */
                                <span key={id} className="ic-secpk" data-pkidx={i} style={sched ? { touchAction: 'none' } : undefined}
                                  onPointerDown={sched ? (e => startPkDrag(e, p.id, id, i)) : undefined}
                                  onContextMenu={sched ? (e => { e.preventDefault(); writeInputs(() => togglePuckPerson(p.id, id)) }) : undefined}
                                  title={sched ? `${PEOPLE[id] ? PEOPLE[id].cs : id} — drag to swap, off the note to remove` : (PEOPLE[id] ? PEOPLE[id].cs : id)}>
                                  <span className="seat" dangerouslySetInnerHTML={{ __html: puck(id, 0, true, '') }} />
                                </span>
                              ))}
                              {sched && <button type="button" className="ic-pkadd" data-pkadd={p.id} aria-label="Add people to this note" title="Add people" onClick={pick}>+</button>}
                            </div>
                          </div>
                        )}
                        {!words && !editing && tools}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            {/* A NEW NOTE: its words, and "+ people" beside the box — so a note of people and no words can be made
                (D695). The box and its button are ONE thing being made: the keyboard moving between the two saves
                nothing (a Tab from the words used to save them as a note of their own and take the button away before
                it could be pressed — the day-window check, Astra's scenario 2.1); leaving the pair saves the words.
                "+ people" hands the words to the picker and closes the box: the picker's OK makes the note, words
                and people together, in one step. */}
            {sched && popPuckEdit === '' && (() => {
              const leave = (e: { relatedTarget: EventTarget | null }) => {
                const to = e.relatedTarget as HTMLElement | null
                if (pickingNew.current || (to && to.closest && to.closest('.ic-newnote'))) return
                const t = puckDraft.trim()
                if (t) writeInputs(() => addPlanPuck(iso, t))
                setPopPuckEdit(null); setPuckDraft('')
              }
              return (
                <div className="ic-newnote">
                  <input className="ic-poppuck-edit" autoFocus value={puckDraft} aria-label="New planning note"
                    placeholder="e.g. brief the new guy"
                    onChange={e => setPuckDraft(e.target.value)} onBlur={leave} onKeyDown={blurOnEnter} />
                  <button type="button" className="ic-pkadd ic-newnote-ppl" id="icNewNotePpl" aria-label="Add people to this note"
                    onPointerDown={e => e.preventDefault()} onBlur={leave}
                    onClick={() => { if (!openPick('', iso, puckDraft.trim())) return; pickingNew.current = true; setPopPuckEdit(null); setPuckDraft('') }}>+ people</button>
                </div>
              )
            })()}

            {/* THE INPUTS — everyone listed, the list scrolls, never "+ more" (D648). One line each: who, the kind and
                when; a remark under it; the LATE tag, which says the cut-off it missed when pressed (D646); and in
                small print who placed it and when (D629). The line's BUTTON is the name and the kind — what a keyboard
                and a screen reader meet; a press anywhere else on the line opens the input too. */}
            {list.length === 0 ? (
              <p className="sd-empty" data-testid="idy-empty">No inputs on this day. Tap + Input to add one.</p>
            ) : (
              <>
                <h3 className="sd-gh" data-testid="idy-count">{list.length} input{list.length > 1 ? 's' : ''}</h3>
                {list.map(it => {
                  const r = it.rows[0]
                  const who = it.more > 0 ? `${it.who} +${it.more}` : it.who
                  const when = whenOf(it)
                  /* a shared input's late tags are each man's own, beside his puck — a man added later can be late alone */
                  const team = it.rows.length > 1
                  /* …unless EVERY man is late alike: then the line says LATE once, as an ordinary input does */
                  const lates = it.rows.map(x => lateWord(x))
                  const allLate = team && lates.every(w => w && w === lates[0])
                  const late = team && !allLate ? '' : lates[0]
                  const forAll = team && it.rows.every(x => mayDeleteInput(x))
                  const placed = placedLineOf(it.rows)
                  /* a remark is said under the line whatever the input is called: an Other USED TO be named by its
                     remark, which was then not said twice — since D716 (3) its remarks are plain remarks, and a filer who
                     typed the same word as title and as remark typed both (Astra's read of the plan — 5) */
                  const rmk = r.remarks ? String(r.remarks) : ''
                  return (
                    <div key={it.key} className={'sd-row idy-row ' + it.tone} data-popiid={it.key} data-testid={'idy-row-' + it.key}
                      onClick={ev => { if (!(ev.target as HTMLElement).closest('button')) openInput(r) }}>
                      <button type="button" className="sd-open" data-testid="idy-open" aria-label={`${who}, ${it.word}, ${it.kind ? it.kind + ', ' : ''}${when}`} onClick={() => openInput(r)} onKeyDown={onLineKey(it)}>
                        <span className="idy-sq" aria-hidden="true" />
                        <b className="idy-who">{who}</b>
                        <span className="idy-kind">{it.word}</span>
                      </button>
                      {late ? (
                        <button type="button" className="sd-late" data-testid="idy-late" aria-expanded={lateOpen === it.key} title={late}
                          onClick={() => setLateOpen(o => (o === it.key ? null : it.key))}>LATE</button>
                      ) : <span />}
                      <span className="sd-hours" data-testid="idy-when">{when}</span>
                      {late && lateOpen === it.key && <span className="sd-latenote" data-testid="idy-latenote" role="status">{late}</span>}
                      {/* THE REMARK AND THE SMALL PRINT SHARE ONE LINE (owner D699, D701, 9 Oct 26 — drawing B: "put the placed
                          by sentence to the 2nd row if the remarks is short. If the remarks is too long then move the placed
                          by down to a 3rd row but still the same horizontal alignment"): the remark first, the small print at
                          the line's right end; where the two do not fit, the small print goes under the remark, still at the
                          right end (`.sd-foot`, 24-sans-calendar.css). The small print is the SHORT form — the name, the
                          date, the time — with the full "Placed by …" as its title. */}
                      {/* THE KIND, KEPT IN SIGHT (owner D717, 9 Oct 26 — "Kind kept in sight"): an input named by its own title
                          says its kind small at the head of this line. The line above has no room for it on a phone — with
                          the kind beside the title, the LATE mark and the hours, the title was cut to "Sports …". */}
                      {(it.kind || rmk || placed) && (
                        <span className="sd-foot">
                          {it.kind && <span className="sd-kindtag" data-testid="idy-kindtag">{it.kind}</span>}
                          {rmk && <span className="sd-rmk">{rmk}</span>}
                          {placed && <span className="sd-placed" data-testid="idy-placed" title={placed}>{placedShort(placed, +iso.slice(0, 4))}</span>}
                        </span>
                      )}
                      {/* ITS PEOPLE, as the schedule's own pucks (ui/html.ts puck() — D649), compact, A to Z */}
                      {team && (
                        <span className="idy-people" data-testid="idy-people">
                          {it.rows.map(x => (
                            <span key={x.iid} className="idy-man">
                              <span className="sd-puck" aria-hidden="true" dangerouslySetInnerHTML={{ __html: puck(x.person, false, true, false).replace(' tabindex="0"', '') }} />
                              {!allLate && lateWord(x) && <span className="sd-late idy-manlate" data-testid={'idy-late-' + x.person} title={lateWord(x)}>LATE</span>}
                            </span>
                          ))}
                        </span>
                      )}
                      {delAsk === it.key && (
                        <span className="idy-ask" data-testid="idy-ask" role="alertdialog" aria-label="Delete this input?"
                          onKeyDown={e => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); setDelAsk(null) } }}>
                          <span className="idy-ask-q">{!team ? 'Delete this input?' : forAll ? `Delete this input for all ${it.rows.length} people?` : 'Take yourself out of this input?'}</span>
                          <button type="button" className="abtn danger" data-testid="idy-del-yes" autoFocus onClick={() => doDelete(it)}>{team && !forAll ? 'Take me out' : 'Delete'}</button>
                          <button type="button" className="abtn ghost" data-testid="idy-del-no" onClick={() => setDelAsk(null)}>{team && !forAll ? 'Stay in' : 'Keep'}</button>
                        </span>
                      )}
                    </div>
                  )
                })}
              </>
            )}
        </div>
      </FloatWin>
    )
  }

  /* THE MULTI-SELECT PUCK PICKER (owner, 23 Aug 26 — "a placeholder view to
     select a few pucks at 1 go by clicking a few then press ok"). Opens from
     a note's "+" (pickFor is that note's id → the ticks are added to it) or the "+ people" of a note being written
     (pickFor='' → the note is made on OK, its words and its people together — D684, D695). The category buttons LIGHT UP
     everyone in a category at once (personMatchesCat, the same predicate the
     highlight chips use), toggling the whole group. People already on the
     target row are shown ticked-and-locked so a re-pick can't double them. */
  const renderPicker = () => {
    const roster = Object.keys(PEOPLE).filter(id => !PEOPLE[id].archived && !PEOPLE[id].special)
    const seated = new Set<string>(pickFor ? (((PLANPUCKS.find((p: any) => p.id === pickFor)?.ids) || []).filter(Boolean)) : [])
    const toggle = (id: string) => setPickSel(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
    /* HIGHLIGHT = a visual fade, never a selection (owner, 24 Aug 26). Toggling
       a chip lights/darkens its key in pickHi; a puck stays bright when it
       clears the lit chips, otherwise it fades. Selecting is still one tap on
       the puck itself, bright or faded. */
    const toggleHi = (k: string) => setPickHi(prev => { const n = new Set(prev); n.has(k) ? n.delete(k) : n.add(k); return n })
    /* chips within a category are alternatives, across categories they narrow —
       (A or B) and SC-Day (owner, 24 Aug 26 — "CAT A and B for SC D"). Same body
       as the schedule pages' highlight (matchesHiSet, state/view.ts), so the
       picker and the strip can't disagree. */
    const matchesHi = (id: string) => matchesHiSet(PEOPLE[id], pickHi)
    const close = cancelPick, confirm = confirmPick     // the picker's ends are the component's (above): Escape uses them too
    /* the roster is grouped by seat, the way the aircrew palette lays its crew
       out (owner, 24 Aug 26 — "arrange them just like how the placeholders
       arranges them"): Pilots, WSOs, then SANS — split the SAME pilots-then-WSOs
       way (owner, 24 Aug 26) — then Personnel. An empty group is simply dropped
       rather than drawn as a bare heading.
       Within every group the crew read in CAT-ladder order, highest first: FI,
       IR, IP, … for pilots; FI, IW, … for WSOs (owner, 24 Aug 26 — "the cat
       hierarchy order … the order I told previously"). byCrew is the shared
       reading-order comparator (engine/people.ts) — seat, then CAT ladder
       descending, then callsign — the SAME order the availability panel uses,
       one body so the two cannot drift. Each group here is one seat, so byCrew's
       seat term ties and the ladder decides; Personnel (no CAT) stay callsign-
       sorted. */
    const inSeat = (seat: string) => roster.filter(id => !PEOPLE[id].san && PEOPLE[id].seat === seat).sort(byCrew)
    /* SANS carry a seat too; FCP are the SANS pilots, everyone else (RCP — the
       only other aircrew seat) the SANS WSOs. Using `!== 'FCP'` for the WSO side
       rather than `=== 'RCP'` guarantees no SANS member can fall through the two
       groups and vanish from the picker. */
    const sansSeat = (fcp: boolean) =>
      roster.filter(id => PEOPLE[id].san && (fcp ? PEOPLE[id].seat === 'FCP' : PEOPLE[id].seat !== 'FCP')).sort(byCrew)
    const groups: [string, string[]][] = [
      ['Pilots', inSeat('FCP')], ['WSOs', inSeat('RCP')],
      ['SANS · Pilots', sansSeat(true)], ['SANS · WSOs', sansSeat(false)],
      ['Personnel', inSeat('GND')],
    ]
    const puckBtn = (id: string) => {
      const on = pickSel.has(id), already = seated.has(id), dim = !already && !matchesHi(id)
      return (
        <button key={id} type="button" disabled={already} aria-pressed={on || already}
          className={'ic-pickp' + (on ? ' on' : '') + (already ? ' already' : '') + (dim ? ' dim' : '')}
          data-pickp={id} title={already ? 'Already on this row' : (PEOPLE[id] ? PEOPLE[id].cs : id)}
          onClick={() => { if (!already) toggle(id) }}>
          <span className="seat" dangerouslySetInnerHTML={{ __html: puck(id, 0, true, '') }} />
        </button>
      )
    }
    return (
      <div className="ic-pickwrap" onPointerDown={e => { if (e.target === e.currentTarget) close() }}>
        <div className="ic-pick" role="dialog" aria-modal="true" aria-label="Add people" tabIndex={-1} onClick={e => e.stopPropagation()}>
          <div className="ic-pick-head">
            <b>Add people</b>
            <span className="ic-pick-n">{pickSel.size} picked</span>
            <button type="button" className="x" id="icPickClose" aria-label="Close" onClick={close}>✕</button>
          </div>
          {/* a NEW note's words, in sight while its people are picked (its box has handed over to this picker) */}
          {pickFor === '' && pickWords && <div className="ic-pick-for" data-testid="ic-pick-for">For the note: <b>{pickWords}</b></div>}
          {/* the CAT/Type/Quals tabs — the SAME grouped strip as the schedule
              (owner, 24 Aug 26: "apply these to all pages"). A chip tap FADES
              everyone NOT in the lit categories so the applicable pucks stand
              out; it never selects them. */}
          <div className="ic-pick-cats">
            {HL_GROUPS.map(([gk, glabel, chips]) => {
              const open = pickGrp === gk
              const active = chips.filter(([k]) => pickHi.has(k)).length
              return (
                <span key={gk} className={'hl-grp' + (open ? ' open' : '')} data-hlgrp={gk}>
                  <button type="button" className={'hl-gtab' + (open ? ' open' : '') + (active ? ' has' : '')}
                    aria-expanded={open} title={`${glabel} filters — fade everyone not in them`}
                    onClick={() => setPickGrp(g => g === gk ? '' : gk)}>{glabel}{active ? <span className="hl-gn">{active}</span> : null}</button>
                  <span className="hl-gchips">{chips.map(([k, t, ttl]) => (
                    <button key={k} type="button" className={'fchip' + (pickHi.has(k) ? ' on' : '')} data-pickcat={k}
                      title={ttl} onClick={() => toggleHi(k)}>{t}</button>
                  ))}</span>
                </span>
              )
            })}
          </div>
          <div className="ic-pick-body">
            {groups.map(([label, ids]) => ids.length === 0 ? null : (
              <div className="ic-pick-grp" key={label}>
                <div className="ic-pick-gh">{label}<span className="ic-pick-gn">{ids.length}</span></div>
                <div className="ic-pick-row">{ids.map(puckBtn)}</div>
              </div>
            ))}
          </div>
          <div className="ic-pick-foot">
            <button type="button" className="abtn" id="icPickCancel" onClick={close}>Cancel</button>
            <button type="button" className="abtn primary" id="icPickOk" disabled={pickSel.size === 0}
              onClick={confirm}>✓ Add{pickSel.size ? ` ${pickSel.size}` : ''}</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={'inpcal ib' + (popIso ? ' ic-with-day' : '')} id="inpCal">
      <div className="ib-top" ref={topRef}>
        <div className="ic-head inputs-top">
          {lead}
          <div className="ic-nav">
            <button type="button" className="abtn" id="icPrev" aria-label="Previous month" onClick={() => step(-1)}>‹</button>
            <span className="ic-mon" aria-live="polite" aria-label={`${MON[cur.m - 1]} ${cur.y}`}>{narrow ? MON[cur.m - 1].slice(0, 3) : MON[cur.m - 1]} {cur.y}</span>
            <button type="button" className="abtn" id="icNext" aria-label="Next month" onClick={() => step(1)}>›</button>
            <button type="button" className="abtn" id="icToday" onClick={goToday}>Today</button>
          </div>
          {tools}
        </div>
        {/* "HOW THIS WORKS" AND THE LEGEND — one quiet line under the tools. The fold is five short lines (owner D646:
            "abit wordy" — cut, "the same on the Inputs calendar"); its last states the late cut-off AS IT IS SET, from
            the setting, so it changes when the setting does (D628) — no worked date and no "later is marked LATE"; the
            date an input missed is said by its own LATE tag, in the opened day. The legend names the two colours of a
            bar — the List's own: an absence, a duty or commitment — for everyone. */}
        <div className="ib-sub">
          <button type="button" className="sc-how" data-testid="ib-how" aria-expanded={how} aria-controls="ibHowList" onClick={() => setHow(h => !h)}>
            <span className="sc-how-v" aria-hidden="true" />How this works
          </button>
          <span className="ib-legend" data-testid="ib-legend">
            <span className="ib-key red">absence</span>
            <span className="ib-key amb">duty or commitment</span>
          </span>
        </div>
        {how && (
          <ol className="sc-how-list" id="ibHowList" data-testid="ib-how-list">
            <li>Tap a day to see its inputs and add one. Tap a <b>bar</b> to open it; drag it to move it.</li>
            <li>A bar runs across the days an input covers: <b>red</b> is an absence, <b>amber</b> a duty or another commitment.</li>
            <li>To file for <b>several days</b>, drag across them — on a phone, hold first, then drag.</li>
            <li><b>NF</b> is a no-fly day. Green is a public holiday. Grey is an Off day.</li>
            {/* the cut-off itself in bold (D691) - the same bold the lines above give "bar" and "several days" */}
            <li><span data-testid="ib-how-cut">{(p => <>{p.before}<b>{p.cut}</b>{p.after}</>)(cutParts('inputs', 'File'))}</span></li>
          </ol>
        )}
        {under}
      </div>
      <div className="ib-dow" aria-hidden="true">{WD.map((d, i) => <span key={d} className={i >= 5 ? 'is-we' : ''}>{d}</span>)}</div>
      <div className={'ib-grid' + (run ? ' is-picking' : '')} ref={gridRef} data-testid="ib-grid"
        style={{ ['--ib-row']: fit.row + 'px', ['--ib-head']: sizes.head + 'px', ['--ib-lane']: sizes.lane + 'px', ['--ib-more']: sizes.more + 'px' } as React.CSSProperties}>
        {weeks.map((week, wi) => {
          const wk = layoutBars(week, items, lanes)
          return (
            <div key={wi} className="ib-week" data-testid={'ib-week-' + wi}>
              {/* THE DATES — what a press on empty space lands on */}
              <div className="ib-cells">
                {week.map((iso, ci) => {
                  if (!iso) return <div key={'x' + ci} className="ib-x" />
                  const tag = dayTag(answers[iso], dayFacts(iso).short)
                  const n = itemsOn(iso, items).length
                  const picked = !!run && iso >= run.a && iso <= run.b
                  const cls = 'ib-day' + (ci >= 5 ? ' is-we' : '') + (iso === todayIso ? ' is-today' : '') + (tag ? ' k-' + tag.kind : '') +
                    (picked ? ' is-picked' : '') + (iso === popIso ? ' is-open' : '')
                  return (
                    <div key={iso} className={cls} data-icday={iso} role="button" tabIndex={iso === tabAt ? 0 : -1} aria-pressed={iso === popIso}
                      aria-label={`${dayWord(iso)}${tag ? ', ' + KIND_SAY[tag.kind] : ''}, ${n ? `${n} input${n > 1 ? 's' : ''}` : 'no inputs'}`}
                      onKeyDown={onKey(iso)} onFocus={() => setAt(iso)} />
                  )
                })}
              </div>
              {/* THEIR HEADS — the number and the tag, then the day's TITLE and the planning notes and pucks, drawn in
                  full above the bars (owner, 22 Aug 26: "if it fills up the whole day box, so be it") */}
              <div className="ib-heads">
                {week.map((iso, ci) => {
                  if (!iso) return <div key={'x' + ci} />
                  const tag = dayTag(answers[iso], dayFacts(iso).short)
                  const rmk = DAYRMK[iso]
                  const pucks = PLANPUCKS.filter((p: any) => p.date === iso)
                  return (
                    <div key={iso} className={'ib-head' + (ci >= 5 ? ' is-we' : '') + (iso === todayIso ? ' is-today' : '')} data-ichead={iso}>
                      <div className="ib-date">
                        <span className="ib-num">{+iso.slice(8, 10)}</span>
                        {tag && <span className={'ib-tag k-' + tag.kind} data-testid={'ib-tag-' + iso}>{tag.text}</span>}
                      </div>
                      {rmk && <div className="ic-rmk" title={rmk}>{rmk}</div>}
                      {/* a note: its words as a chip, and its people as a row of TINY person chips, styled like the app's
                          standard puck (owner, 23 Aug 26): the CATEGORY a colour line on the right, a SANS person a
                          purple line on the left. One note may draw both (D684); either is the note, and drags it. */}
                      {pucks.map((p: any) => {
                        const who = (Array.isArray(p.ids) ? p.ids : []).filter(Boolean), words = String(p.text || '').trim()
                        return (
                          <Fragment key={'p' + p.id}>
                            {words && <div className="ic-chip plan" data-pid={p.id} data-icdrag>{words}</div>}
                            {who.length > 0 && (
                              <div className="ic-pks" data-pid={p.id} data-icdrag>
                                {who.map((id: string) => {
                                  const per = PEOPLE[id]
                                  const cat = per && QCOLOR[per.q]
                                  return <span key={id} className={'ic-pk' + (per && per.san ? ' sans' : '')}
                                    style={cat ? ({ ['--pk-cat']: cat } as React.CSSProperties) : undefined}>{per ? per.cs : id}</span>
                                })}
                              </div>
                            )}
                          </Fragment>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
              {/* THE LINES — one bar across the days an input covers (D626); a bar is not a tab stop: the keyboard opens
                  the day, where every input is listed and reached */}
              <div className="ib-lanes">
                {wk.segs.map(sg => (
                  <div key={sg.item.key} className={'ib-bar ' + sg.item.tone + (sg.head ? '' : ' is-cont') + (sg.tail ? '' : ' is-on')}
                    data-iid={sg.item.key} data-icdrag data-testid={'ib-bar-' + sg.item.key} aria-hidden="true" title={tip(sg.item)}
                    style={{ gridColumn: `${sg.c0 + 1} / ${sg.c1 + 2}`, gridRow: sg.lane + 1 }}>{barText(sg.item, narrow)}</div>
                ))}
                {wk.more.map((more, c) => more > 0 && (
                  <button key={'m' + c} type="button" className="ib-more" data-icmore={week[c]!} title={`${more} more on ${fmtDay(week[c])} — open the day`}
                    style={{ gridColumn: c + 1, gridRow: lanes + 1 }} onClick={() => pickDate(week[c]!)}>+{more} more</button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
      {popIso != null && renderPop(popIso)}
      {pickFor != null && renderPicker()}
    </div>
  )
}
