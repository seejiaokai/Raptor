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
import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react'
import { INPUTS, inputCoversDate, inpLabel, defaultAllday, isSansAvail, sansLetters } from '../engine/inputs'
import { dayFacts, flyMonth, useWarFacts } from '../leavewar/sync'
import { PEOPLE, QCOLOR, byCrew } from '../engine/people'
import { hhmm } from '../engine/time'
import { puck } from './html'
import { PLANPUCKS, DAYRMK, setDayRemark, addPlanPuck, editPlanPuck, removePlanPuck, addPuckRow, addPuckPeople, togglePuckPerson, movePuckPerson, movePlanSection } from '../state/plan'
import { notify, writeInputs } from '../state/store'
import { CALMONTH, setCalMonth, matchesHiSet, INPREVEAL, clearInpReveal } from '../state/view'
import { HL_GROUPS } from './hlchips'
import { canEditSched } from '../state/auth'
import { me } from '../state/perms'
import { inputsInMode } from './sans-calendar-model'
import { fmt, fmtDay, inputTone, firstPersonalType } from './inputedit'
import { INPEDIT, setInpEdit } from './pops'
import { initCalDrag } from './caldrag'
import { initCalPick, SWIPE_MIN } from './calpick'
import { barText, dayTag, fitLanes, itemsOn, layoutBars, monthItems, type BarItem } from './inputscal-model'
import { placedLineOf } from './placedline'
import { dayWord } from './sanscal-model'
import { WD } from './daysfmt'
import { landOn, markLand, paintLand } from './lift'
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
  /* a run of days being drawn by the pointer, first day first */
  const [drawn, setDrawn] = useState<{ a: string; b: string } | null>(null)
  const [savedId,setSavedId]=useState<string|null>(null)
  const reveal=INPREVEAL
  const shown=useRef<typeof INPREVEAL>(null)
  useLayoutEffect(()=>{
    const saved=reveal&&INPUTS.find((r:any)=>r.iid===reveal.iid&&inputsInMode([r],mode).length)
    if(!saved||!reveal||(mode&&reveal.mode!==mode)){setSavedId(null);return}
    setSavedId(saved.iid);setPopIso(reveal.iso);shown.current=reveal
    setCalMonth({y:+reveal.iso.slice(0,4),m:+reveal.iso.slice(5,7)})
  },[reveal,mode])
  /* THE REVEAL IS SPENT ONCE ITS DAY HAS BEEN SHOWN AND LEFT (Opus's own read of the build, step 0, 7 Oct 26). It is
     view state that outlives this component — so the List can pin the same row — and nothing took it back when the
     day was closed: List and back to Calendar (or Medical and back) mounted a new calendar, which opened the saved
     day again and pulled the month back to it. Closing the day, opening another, or leaving the calendar spends it.
     Guarded by identity, so a NEWER reveal set while this calendar unmounts (a save that switches mode) is kept. */
  const spendReveal=()=>{ if(shown.current&&INPREVEAL===shown.current)clearInpReveal(); shown.current=null }
  /* every press that opens or closes a day goes through here — the one place the reveal is spent */
  const showDay=(iso:string|null)=>{ if(shown.current&&iso!==shown.current.iso)spendReveal(); setPopIso(iso) }
  useEffect(()=>()=>spendReveal(),[])
  const pickDate=(iso:string)=>{ showDay(iso);setPopPuckEdit(null) }
  const [popPuckEdit, setPopPuckEdit] = useState<string | null>(null)
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

  /* ESCAPE peels one layer of what THIS calendar has open — the people picker, then the day — and stands down while
     the input editor is up over them (it has its own; both listen on the document in the capture phase, where
     stopPropagation cannot silence a sibling). It never leaves the calendar: the month is a tab's screen, not a layer
     to close. */
  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || INPEDIT) return
      if (pickFor != null) { e.stopPropagation(); setPickFor(null); setPickSel(new Set()); setPickHi(new Set()); setPickGrp(''); return }
      if (popIso) { e.stopPropagation(); showDay(null); setPopPuckEdit(null) }
    }
    document.addEventListener('keydown', esc, true)
    return () => document.removeEventListener('keydown', esc, true)
  }, [popIso, pickFor])

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
  const closePop = () => { showDay(null); setPopPuckEdit(null) }

  /* ---- the pointer: two machines on the one grid, wired once; they read the latest handlers through a ref -------- */
  const tapEntry = (entry: any) => {
    if (entry.kind === 'input') {
      const r = INPUTS.find((x: any) => x.iid === entry.iid)
      if (r) { setInpEdit(r); notify() } // object resolve — never index
      return
    }
    showDay(entry.fromIso)
    /* a NOTE opens already in its own edit box; a PUCKS row has no text to edit, so its tap just opens the day (its
       people are edited through the row's own picker there) */
    const sec = PLANPUCKS.find((p: any) => p.id === entry.pid)
    if (sec && sec.kind === 'pucks') { setPopPuckEdit(null) }
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
      onTap: iso => live.current.pickDate(iso),
      onPicking: setDrawn,
      onRange: (a, b) => live.current.openAdd(a, b),
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

  const KIND_SAY: Record<string, string> = { ph: 'public holiday', off: 'Off day', nf: 'no-fly day' }
  const nameOf = (id: any) => (PEOPLE[id] ? PEOPLE[id].cs : String(id))
  /* a desktop bar's tooltip (D632 — "pointing at a bar shows who placed it"): who, what, when, and the small-print line */
  const tip = (it: BarItem) => {
    const r = it.rows[0]
    const dates = it.a === it.b ? fmtDay(it.a) : `${fmtDay(it.a)} – ${fmtDay(it.b)}`
    const hours = r.allday ? '' : ` · ${hhmm(r.s)}–${hhmm(r.e)}`
    return [`${it.rows.map((x: any) => nameOf(x.person)).join(', ')} · ${it.word} · ${dates}${hours}`, placedLineOf(it.rows)].filter(Boolean).join('\n')
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
    const revealed=!!saved&&!entries.inputs.includes(saved)
    if(revealed) entries.inputs.unshift(saved)
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
    return (
      <div className="ic-popwrap" onPointerDown={e => { if (e.target === e.currentTarget) closePop() }}>
        <div className="ic-pop" role="dialog" aria-label={`${fmtDay(iso)} details`}>
          {/* the day TITLE lives beside the date (owner, 22 Aug 26 — "beside
              the date, I can input free text there, and it will show up as
              the title on the calendar view"). A scheduler edits it in place
              (draft-apart-from-model, commit on Enter/blur); a member reads
              it as plain text. It is the same per-day store the old Day
              remark field wrote (DAYRMK), promoted to the header. */}
          <div className="ic-pop-head">
            <b>{fmtDay(iso)}</b>
            {sched ? (
              <input id="icRmkEdit" className="ic-title-edit" placeholder="Day title…"
                aria-label="Day title" value={rmkDraft}
                onChange={e => setRmkDraft(e.target.value)}
                onBlur={() => writeInputs(() => setDayRemark(iso, rmkDraft))}
                onKeyDown={blurOnEnter} />
            ) : hasRmk ? (
              <span className="ic-title-ro">{DAYRMK[iso]}</span>
            ) : null}
            <button type="button" className="x" id="icPopClose" aria-label="Close" onClick={closePop}>✕</button>
          </div>
          <div className="ic-pop-body">
            {/* THE SECTIONS (owner, 22 Aug 26): small + Note / + Pucks buttons
                at the top; each section is a full-width block below — a note
                is free text, a pucks row is people — and an admin drags the ⠿
                handle to rearrange them. Members read them, nothing more. */}
            {sched && (
              <div className="ic-secbtns">
                <button type="button" className="abtn sm" id="icAddPuck"
                  onClick={() => { setPopPuckEdit(''); setPuckDraft('') }}>+ Note</button>
                <button type="button" className="abtn sm" id="icAddPucks"
                  onClick={() => { setPickFor(''); setPickIso(iso); setPickSel(new Set()) }}>+ Pucks</button>
              </div>
            )}
            {entries.pucks.length > 0 && (
              <div className="ic-secs">
                {entries.pucks.map((p: any) => {
                  /* an EMPTY pucks row is a scheduler's work-in-progress; a
                     member would see only a bare band with nothing in it and
                     nothing to do — skip it for them (review fix, 22 Aug 26) */
                  if (!sched && p.kind === 'pucks' && !(p.ids || []).some(Boolean)) return null
                  const dragCls = secDrag === p.id ? ' dragging'
                    : secDrag && secOver && secOver.id === p.id ? (secOver.after ? ' dragover after' : ' dragover') : ''
                  return (
                    <div key={p.id} className={'ic-sec' + dragCls} data-sec={p.id}>
                      {sched && (
                        <span className="ic-sechandle" data-sechandle={p.id} title="Drag to reorder"
                          style={{ touchAction: 'none' }}
                          onPointerDown={e => startSecDrag(e, p.id)}>⠿</span>
                      )}
                      {p.kind === 'pucks' ? (
                        /* a full-width row of the app's own canonical pucks;
                           the picker adds one per pick, its ✕ drops one, and
                           the trailing ✕ deletes the whole row (always drawn
                           for a scheduler — review fix, 22 Aug 26: it used to
                           appear only once the row was emptied, which made a
                           filled row look undeletable). Clicks STOP here: the
                           injected puck() markup matches the document-level
                           routeClick's `.puck[data-person]` branch, which
                           would silently toggle the schedule pages' selection
                           from inside this overlay. */
                        <div className="ic-secpucks" data-secpucks={p.id} onClick={e => e.stopPropagation()}>
                          {/* the pucks sit in a fixed 3-column grid (owner, 24 Aug
                              26 — "3 pucks per row"). A removed puck BLANKS its slot
                              rather than closing the gap (togglePuckPerson), so an
                              empty cell holds the position and the survivors never
                              shift; only trailing blanks are trimmed. data-pkidx is
                              the slot's index, read by startPkDrag to swap one puck
                              onto another (or onto an empty slot). */}
                          <div className="ic-secpk-grid">
                            {(p.ids || []).map((id: string, i: number) => !id ? (
                              <span key={'g' + i} className="ic-secpk ic-secpk-gap" data-pkidx={i} aria-hidden="true" />
                            ) : (
                              /* a seated puck carries NO ✕ (owner, 24 Aug 26): drag
                                 it onto another puck to SWAP, onto an empty slot to
                                 MOVE, or off the row to REMOVE; a right-click also
                                 removes (desktop). touchAction:none so the drag
                                 doesn't scroll the sheet under the finger. */
                              <span key={id} className="ic-secpk" data-pkidx={i} style={sched ? { touchAction: 'none' } : undefined}
                                onPointerDown={sched ? (e => startPkDrag(e, p.id, id, i)) : undefined}
                                onContextMenu={sched ? (e => { e.preventDefault(); writeInputs(() => togglePuckPerson(p.id, id)) }) : undefined}
                                title={sched ? `${PEOPLE[id] ? PEOPLE[id].cs : id} — drag to swap, off the row to remove` : (PEOPLE[id] ? PEOPLE[id].cs : id)}>
                                <span className="seat" dangerouslySetInnerHTML={{ __html: puck(id, 0, true, '') }} />
                              </span>
                            ))}
                          </div>
                          {sched && (
                            <button type="button" className="ic-pkadd" data-pkadd={p.id}
                              onClick={() => { setPickFor(p.id); setPickIso(iso); setPickSel(new Set()) }}>+ add</button>
                          )}
                          {sched && <button type="button" data-ppdel={p.id}
                            className="ic-pkdel ic-rowdel" aria-label="Delete pucks row" title="Delete this pucks row"
                            onClick={() => writeInputs(() => removePlanPuck(p.id))}>✕</button>}
                        </div>
                      ) : sched && popPuckEdit === p.id ? (
                        <input className="ic-poppuck-edit" autoFocus value={puckDraft}
                          aria-label="Edit planning note" onChange={e => setPuckDraft(e.target.value)}
                          onBlur={() => {
                            const t = puckDraft.trim()
                            if (t && t !== p.text) writeInputs(() => editPlanPuck(p.id, t))
                            setPopPuckEdit(null)
                          }}
                          onKeyDown={blurOnEnter} />
                      ) : (
                        <div className="ic-poppuck">
                          <span className="ic-poppuck-txt">{p.text}</span>
                          {sched && <>
                            <button type="button" data-ppedit={p.id} aria-label="Edit note"
                              onClick={() => { setPopPuckEdit(p.id); setPuckDraft(p.text) }}>✏</button>
                            <button type="button" data-ppdel={p.id} aria-label="Delete note"
                              onClick={() => writeInputs(() => removePlanPuck(p.id))}>✕</button>
                          </>}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
            {sched && popPuckEdit === '' && (
              <input className="ic-poppuck-edit" autoFocus value={puckDraft} aria-label="New planning note"
                placeholder="e.g. brief the new guy"
                onChange={e => setPuckDraft(e.target.value)}
                onBlur={() => {
                  const t = puckDraft.trim()
                  if (t) writeInputs(() => addPlanPuck(iso, t))
                  setPopPuckEdit(null); setPuckDraft('')
                }}
                onKeyDown={blurOnEnter} />
            )}

            {/* THE INPUTS, at the BOTTOM (owner, 22 Aug 26 — "have the inputs
                at the bottom, then the + input button at the very top of all
                inputs on the top left, a small button"). Everyone may add —
                page-rights parity with the openAdd seed above, the same reach
                a member already has on the Inputs table's own + Add. */}
            <div className="ic-inp-sec">
              <button type="button" className="abtn sm primary" id="icPopAdd" onClick={() => openAdd(iso)}>+ Input</button>
              {entries.inputs.length === 0 ? (
                <div className="ic-pop-empty">No inputs on this day — hold the cell or tap + Input</div>
              ) : (
                <div className="ic-pop-rows">
                  {entries.inputs.map((r: any) => (
                    <button key={r.iid} type="button" className={'ic-poprow ' + inputTone(r.type)}
                      data-popiid={r.iid} onClick={() => { setInpEdit(r); notify() }}>
                      {/* the identity line — callsign, type, and (timed only) the
                          window pinned right, the same three fields the row always
                          carried; wrapped now so a remark can sit under it */}
                      <span className="ic-poprow-top">
                        <span className="ic-poprow-who">{PEOPLE[r.person] ? PEOPLE[r.person].cs : r.person}</span>
                        {/* a SANS row reads as its F/O/A offer letters, not the
                            generic "SANS Availability" type name (owner, 23 Aug
                            26 — "show the F/O/A on the inputs"); the same read
                            the month-cell chip already gives, so the two agree.
                            Empty ticks fall back to F/O/A, meaning "offered". */}
                        <span className="ic-poprow-lbl">{isSansAvail(r.type) ? (sansLetters(r) || 'F/O/A') : inpLabel(r)}</span>
                        {!r.allday && <span className="ic-poprow-win">{hhmm(r.s)}–{hhmm(r.e)}</span>}
                      </span>
                      {/* the remark as its own aligned line under the identity
                          (owner, 22 Aug 26 — "show remarks too and align them
                          nicely"); absent when the input carries none, so a
                          remark-less row stays the single tidy line it was */}
                      {r.remarks && <span className="ic-poprow-rmk">{r.remarks}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* THE MULTI-SELECT PUCK PICKER (owner, 23 Aug 26 — "a placeholder view to
     select a few pucks at 1 go by clicking a few then press ok"). Opens from
     + Pucks (pickFor='' → a NEW row is made on OK) or a row's + add (pickFor is
     that row's id → the ticks are added to it). The category buttons LIGHT UP
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
    const close = () => { setPickFor(null); setPickSel(new Set()); setPickHi(new Set()); setPickGrp('') }
    const confirm = () => {
      const ids = [...pickSel]
      if (ids.length) {
        if (pickFor === '') writeInputs(() => addPuckRow(pickIso, ids))
        else writeInputs(() => addPuckPeople(pickFor!, ids))
      }
      close()
    }
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
        <div className="ic-pick" role="dialog" aria-label="Add people" onClick={e => e.stopPropagation()}>
          <div className="ic-pick-head">
            <b>Add people</b>
            <span className="ic-pick-n">{pickSel.size} picked</span>
            <button type="button" className="x" id="icPickClose" aria-label="Close" onClick={close}>✕</button>
          </div>
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
        {under}
      </div>
      <div className="ib-dow" aria-hidden="true">{WD.map((d, i) => <span key={d} className={i >= 5 ? 'is-we' : ''}>{d}</span>)}</div>
      <div className={'ib-grid' + (drawn ? ' is-picking' : '')} ref={gridRef} data-testid="ib-grid"
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
                  const picked = !!drawn && iso >= drawn.a && iso <= drawn.b
                  const cls = 'ib-day' + (ci >= 5 ? ' is-we' : '') + (iso === todayIso ? ' is-today' : '') + (tag ? ' k-' + tag.kind : '') +
                    (picked ? ' is-picked' : '') + (iso === popIso ? ' is-open' : '')
                  return (
                    <div key={iso} className={cls} data-icday={iso} role="button" tabIndex={0} aria-pressed={iso === popIso}
                      aria-label={`${dayWord(iso)}${tag ? ', ' + KIND_SAY[tag.kind] : ''}, ${n ? `${n} input${n > 1 ? 's' : ''}` : 'no inputs'}`}
                      onKeyDown={e => { if (e.target !== e.currentTarget) return; if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pickDate(iso) } }} />
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
                      {pucks.map((p: any) => p.kind === 'pucks' ? (
                        /* a pucks section as a row of TINY person chips, styled like the app's standard puck (owner,
                           23 Aug 26): the CATEGORY a colour line on the right, a SANS person a purple line on the left */
                        <div key={'p' + p.id} className="ic-pks" data-pid={p.id} data-icdrag>
                          {(p.ids || []).filter(Boolean).map((id: string) => {
                            const per = PEOPLE[id]
                            const cat = per && QCOLOR[per.q]
                            return <span key={id} className={'ic-pk' + (per && per.san ? ' sans' : '')}
                              style={cat ? ({ ['--pk-cat']: cat } as React.CSSProperties) : undefined}>{per ? per.cs : id}</span>
                          })}
                        </div>
                      ) : (
                        <div key={'p' + p.id} className="ic-chip plan" data-pid={p.id} data-icdrag>{p.text}</div>
                      ))}
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
