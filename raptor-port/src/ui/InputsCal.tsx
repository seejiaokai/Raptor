/* Full-screen month-calendar view for the Inputs page (owner ask, Aug 26 —
   see a whole month of leave, activities and SANS offers at a glance instead
   of scrolling the table). A REACT component, not a string builder like the
   week/board/palette (CLAUDE.md: "React owns chrome, strings own density").
   Those surfaces earn the innerHTML/string-diff discipline because they are
   DENSE (hundreds of nodes) and carry a phone perf ceiling and byte-exact
   reference parity. Neither applies here: this is a NEW surface — at most 42
   day cells carrying a handful of chips apiece, a few hundred nodes total —
   with no reference to stay parity with, and its free-text fields (the day
   popover) live in ordinary component state, where React's own diffing is
   exactly the right tool; there is no caret position to preserve across an
   innerHTML replace the way there is on the week grid.

   The first task built the shell, the toggle and the chips' DISPLAY only.
   THIS task wires the interaction the chips were already carrying markup
   for: caldrag.ts's drag/tap machine on `[data-icdrag]`, this file's OWN
   hold-to-add/tap gesture on the empty cell space around those chips, and
   the day popover (`data-icmore` opens it too) that both routes land on. */
import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { INPUTS, inputCoversDate, inpLabel, defaultAllday, isSansAvail, sansLetters } from '../engine/inputs'
import { PEOPLE, QCOLOR, QORDER } from '../engine/people'
import { hhmm } from '../engine/time'
import { puck } from './html'
import { PLANPUCKS, DAYRMK, setDayRemark, addPlanPuck, editPlanPuck, removePlanPuck, addPuckRow, addPuckPeople, togglePuckPerson, movePlanSection } from '../state/plan'
import { notify, writeInputs } from '../state/store'
import { CALMONTH, setCalMonth, personMatchesCat } from '../state/view'
import { HL_GROUPS } from './hlchips'
import { canEditSched, ME } from '../state/auth'
import { fmt, fmtDay, inputTone, firstPersonalType } from './inputedit'
import { INPEDIT, setInpEdit } from './pops'
import { initCalDrag } from './caldrag'
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
/* Applies to the INPUT chips only since the 22 Aug 26 cell redesign — the
   title, notes and pucks sections draw in full ("if it fills up the whole day
   box, so be it"; inputs are the stated lesser priority). Raised 3 → 6 with
   the same redesign: input chips pack side by side now, so six fit where
   three stacked lines used to. */
export const MAX_CHIPS = 6

/* HOLD-TO-ADD on empty cell space — deliberately longer than caldrag's own
   180ms chip hold (caldrag.ts's HOLD). A chip has only one meaning under a
   finger: pick it up. An empty cell has TWO — a quick tap opens the day
   popover, a hold means "add an input here" — so the hold has to be long
   enough that the two can never be confused on a slow, deliberate tap.
   450ms is comfortably past normal tap duration and still well inside what
   reads as a deliberate press-and-hold. Exported so the test drives the same
   number rather than a second 450 that could quietly drift from this one. */
export const HOLD_ADD = 450
const HOLD_SLOP = 8 // px of drift a hold can absorb before it reads as a scroll/pan instead — same idea as caldrag's SLOP
/* a horizontal drag past this, and more sideways than vertical, PAGES the
   month (owner, 22 Aug 26 — "allow me to swipe left and right… to see
   different months"). Well above HOLD_SLOP so a hold/tap is never read as a
   swipe, and about one phone cell wide (~55px on a 390px screen) so it takes
   a deliberate drag, not a stray finger. A DISCRETE step on release, not a
   finger-tracking carousel: this grid is a fixed layout, not a native
   scroller, so none of the board/Leave-War fling-vs-scrollLeft hazards apply
   — the swipe just decides a direction and calls the same step() the ‹ ›
   arrows do. */
export const SWIPE_MIN = 50

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
  const gridRef = useRef<HTMLDivElement>(null)
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
     under it in a single press. The day popover slots into the SAME ladder,
     one layer further down: the modal guard still wins first (it can open
     on top of the popover too, from an entries-list row), then an open
     popover eats the key for itself — closing just the popover, leaving the
     month underneath — and only once neither is open does Escape reach all
     the way out to the calendar. */
  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || INPEDIT) return
      e.stopPropagation()
      /* the picker sits ABOVE the popover, so it eats Escape first — the same
         one-layer-at-a-time ladder the popover follows below the modal */
      if (pickFor != null) { setPickFor(null); setPickSel(new Set()); setPickHi(new Set()); setPickGrp(''); return }
      if (popIso) { setPopIso(null); setPopPuckEdit(null); return }
      onClose()
    }
    document.addEventListener('keydown', esc, true)
    return () => document.removeEventListener('keydown', esc, true)
  }, [onClose, popIso, pickFor])

  /* Seed the add-input modal exactly the way a board's "+ Add" does
     (interactions.ts ~592-608) — same fields, same defaults — but with NO
     canEditSched refusal: page-rights parity means everyone may file their
     OWN input from their own calendar, the same reach a member already has
     on the Inputs table's own + Add. A member's Person field is already
     hidden inside the dialog (inputedit.tsx ~695, canEditSched-gated), so
     the ME seed here is exactly what ends up saved regardless of who opened
     it. */
  const openAdd = (iso: string) => {
    const t = firstPersonalType()
    setInpEdit({ _new: true, _ctx: '', person: ME, type: t, date: fmt(iso), allday: defaultAllday(t), s: 360, e: 1080 })
    notify()
  }
  const closePop = () => { setPopIso(null); setPopPuckEdit(null) }

  /* Wire caldrag's chip machine, and this calendar's OWN empty-cell gesture,
     onto the grid — both as plain native listeners on the same element, so
     they can freely coexist: caldrag's onPointerDown refuses anything that
     is not a chip (its very first line), and this one refuses anything that
     IS one (or is `.ic-more`, which owns its own click). An effect with no
     deps is safe for both: neither closure below reads anything that
     changes across a render — ME/firstPersonalType/INPUTS are module-level,
     and the setState functions are React's own stable identities. */
  useEffect(() => {
    const el = gridRef.current
    if (!el) return

    const onTap = (entry: any) => {
      if (entry.kind === 'input') {
        const r = INPUTS.find((x: any) => x.iid === entry.iid)
        if (r) { setInpEdit(r); notify() } // object resolve — never index; the modal opens above this overlay
      } else {
        setPopIso(entry.fromIso)
        /* a NOTE opens already in its own edit box; a PUCKS row has no text
           to edit, so its tap just opens the day (its people are edited
           through the row's own picker/✕ controls there). */
        const sec = PLANPUCKS.find((p: any) => p.id === entry.pid)
        if (sec && sec.kind === 'pucks') { setPopPuckEdit(null) }
        else { setPopPuckEdit(entry.pid); setPuckDraft(sec?.text || '') }
      }
    }
    const offDrag = initCalDrag(el, { onTap })

    /* HOLD-TO-ADD / TAP-TO-OPEN / SWIPE-TO-PAGE over empty cell space — this
       calendar's own tiny pointer machine, deliberately separate from
       caldrag's rather than a mode bolted onto it: it has no ghost, no drop
       target, and three meanings for a release depending on how the finger
       moved. `rec.fired` records that the hold already added a row, so the
       release must NOT also open the popover or page — the same "one
       gesture, one outcome" rule caldrag's own armed/tap split enforces for
       chips. The swipe verdict is taken on RELEASE from the total travel, so
       no per-move state or animation is needed; onMove only cancels the hold
       timer once the finger has clearly left a hold. */
    let st: { iso: string, x0: number, y0: number, timer: any, fired: boolean, pointerId: number } | null = null
    const reset = () => { if (st) clearTimeout(st.timer); st = null }
    const cancelHold = () => { if (st) clearTimeout(st.timer) } // stop the add timer but keep tracking for a swipe/tap verdict on up
    const onDown = (e: PointerEvent) => {
      const t = e.target as HTMLElement
      if (t.closest('[data-icdrag]') || t.closest('.ic-more')) return // a chip's or +N more's own gesture
      const cell = t.closest('[data-icday]') as HTMLElement | null
      if (!cell) return
      reset()
      const iso = cell.dataset.icday!
      const rec = { iso, x0: e.clientX, y0: e.clientY, timer: 0 as any, fired: false, pointerId: e.pointerId }
      rec.timer = setTimeout(() => { rec.fired = true; openAdd(iso) }, HOLD_ADD)
      st = rec
    }
    const onMove = (e: PointerEvent) => {
      if (!st || e.pointerId !== st.pointerId) return
      // any real drift means this is not a still hold — stop the add timer,
      // but keep `st` alive so the release can still read it as a swipe or tap
      if (Math.abs(e.clientX - st.x0) > HOLD_SLOP || Math.abs(e.clientY - st.y0) > HOLD_SLOP) cancelHold()
    }
    const onUp = (e: PointerEvent) => {
      if (!st || e.pointerId !== st.pointerId) return
      const { iso, fired, x0, y0 } = st
      reset()
      if (fired) return // the hold already added a row — the release does nothing more
      const dx = e.clientX - x0, dy = e.clientY - y0
      /* a decisive sideways drag pages the month: left (finger moves −x) is
         the NEXT month, right the PREVIOUS — the direction a page turns, and
         the way every month-swipe calendar reads. Horizontal-dominant so a
         diagonal scroll never pages by accident. */
      if (Math.abs(dx) >= SWIPE_MIN && Math.abs(dx) > Math.abs(dy)) { stepRef.current(dx < 0 ? 1 : -1); return }
      // barely moved — a tap opens the day popover (a longer pan does nothing)
      if (Math.abs(dx) <= HOLD_SLOP && Math.abs(dy) <= HOLD_SLOP) { setPopIso(iso); setPopPuckEdit(null) }
    }
    const onCancel = (e: PointerEvent) => { if (st && e.pointerId === st.pointerId) reset() }

    /* down FILTERS by target, so it stays on the grid; move/up/cancel go on
       WINDOW so a swipe that ends past the grid's edge still completes and
       resets — a release off-element would otherwise leave the gesture
       half-open. Every handler no-ops unless `st` is the matching pointer. */
    el.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    window.addEventListener('pointercancel', onCancel, { passive: true })
    return () => {
      offDrag()
      reset()
      el.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onCancel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  /* keep the swipe gesture's stepper current — see stepRef above */
  stepRef.current = step
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

  /* THE DAY POPOVER — a day's inputs, remark and planning notes without
     leaving the month view. A plain function rather than a separate
     component: it closes over this component's own state setters
     (setPopIso, setPopPuckEdit, the two drafts) the same way the render
     body below already does, and splitting it out avoids a wall of
     ternaries inline in the JSX return. */
  const renderPop = (iso: string) => {
    const entries = dayEntries(iso, { fPerson, fType, fSearch })
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
        if (!commit || !over || over.id === id) return
        const secs = dayEntries(iso, { fPerson, fType, fSearch }).pucks
        let beforeId: string | null = over.id
        if (over.after) {
          const ix = secs.findIndex((s: any) => s.id === over!.id)
          beforeId = secs[ix + 1]?.id ?? null
        }
        if (beforeId !== id) writeInputs(() => movePlanSection(id, beforeId))
      }
      const up = () => end(true)
      const cancel = () => end(false)
      window.addEventListener('pointermove', move)
      window.addEventListener('pointerup', up)
      window.addEventListener('pointercancel', cancel)
      dragCancelRef.current = cancel        // popover close → cancel, don't reorder
    }
    /* DRAG A SEATED PUCK OUT TO REMOVE IT (owner, 23 Aug 26 — "i just drag them
       out of where they are seated just like … edit schedule mode"), the phone
       AND desktop removal. It rides the puck itself (no handle): a small drift
       arms the drag and the chip follows the finger; releasing OUTSIDE its own
       row drops the person, releasing back inside cancels — the same "off its
       seat = gone, back on = kept" feel drag.ts gives a board puck. A press
       that never drifts is left alone, so a plain tap still does nothing
       destructive (right-click / the ✕ are the deliberate removes). */
    const startPkDrag = (e: React.PointerEvent, rowId: string, personId: string) => {
      if (e.button != null && e.button !== 0) return       // left button / touch only
      const chip = e.currentTarget as HTMLElement
      const x0 = e.clientX, y0 = e.clientY
      let dragging = false
      try { chip.setPointerCapture(e.pointerId) } catch (_) { /* older engines */ }
      const move = (ev: PointerEvent) => {
        if (!dragging && Math.abs(ev.clientX - x0) < 6 && Math.abs(ev.clientY - y0) < 6) return
        if (!dragging) { dragging = true; chip.classList.add('pk-drag'); document.body.classList.add('ic-dragging') }
        chip.style.transform = `translate(${ev.clientX - x0}px, ${ev.clientY - y0}px)`
      }
      const done = (ev: PointerEvent | null) => {
        window.removeEventListener('pointermove', move)
        window.removeEventListener('pointerup', up)
        window.removeEventListener('pointercancel', cancel)
        if (dragCancelRef.current === cancel) dragCancelRef.current = null
        chip.classList.remove('pk-drag'); chip.style.transform = ''
        document.body.classList.remove('ic-dragging')
        if (!dragging || !ev) return                        // a tap, not a drag — leave the puck seated
        const over = document.elementFromPoint(ev.clientX, ev.clientY) as Element | null
        const backInRow = !!(over && over.closest && over.closest(`[data-secpucks="${rowId}"]`))
        if (!backInRow) writeInputs(() => togglePuckPerson(rowId, personId))   // released off its row → drop
      }
      const up = (ev: PointerEvent) => done(ev)
      const cancel = () => done(null)
      window.addEventListener('pointermove', move)
      window.addEventListener('pointerup', up)
      window.addEventListener('pointercancel', cancel)
      dragCancelRef.current = cancel        // popover close → cancel, don't drop
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
                  if (!sched && p.kind === 'pucks' && !(p.ids || []).length) return null
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
                          {(p.ids || []).map((id: string) => (
                            /* a seated puck: RIGHT-CLICK removes it on desktop,
                               and a DRAG off its row removes it on phone or
                               desktop (owner, 23 Aug 26); the ✕ stays as the
                               plain, always-there remove. touchAction:none so a
                               drag doesn't scroll the sheet under the finger. */
                            <span key={id} className="ic-secpk" style={sched ? { touchAction: 'none' } : undefined}
                              onPointerDown={sched ? (e => startPkDrag(e, p.id, id)) : undefined}
                              onContextMenu={sched ? (e => { e.preventDefault(); writeInputs(() => togglePuckPerson(p.id, id)) }) : undefined}>
                              <span className="seat" dangerouslySetInnerHTML={{ __html: puck(id, 0, true, '') }} />
                              {sched && <button type="button" className="ic-pkdel" data-pkdel={`${p.id}.${id}`}
                                aria-label={`Remove ${PEOPLE[id] ? PEOPLE[id].cs : id}`}
                                onPointerDown={e => e.stopPropagation()}
                                onClick={() => writeInputs(() => togglePuckPerson(p.id, id))}>✕</button>}
                            </span>
                          ))}
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
    const seated = new Set<string>(pickFor ? ((PLANPUCKS.find((p: any) => p.id === pickFor)?.ids) || []) : [])
    const toggle = (id: string) => setPickSel(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
    /* HIGHLIGHT = a visual fade, never a selection (owner, 24 Aug 26). Toggling
       a chip lights/darkens its key in pickHi; a puck is "applicable" (bright)
       when nothing is lit OR the person matches any lit category, otherwise it
       fades. Selecting is still one tap on the puck itself, bright or faded. */
    const toggleHi = (k: string) => setPickHi(prev => { const n = new Set(prev); n.has(k) ? n.delete(k) : n.add(k); return n })
    const matchesHi = (id: string) => pickHi.size === 0 || [...pickHi].some(k => personMatchesCat(PEOPLE[id], k))
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
       hierarchy order … the order I told previously"). QORDER is that ladder
       ascending (OCU=0 … FI=8), so we sort by it DESCENDING; callsign breaks a
       tie, and Personnel (no CAT) all tie there and stay callsign-sorted. */
    const byCat = (a: string, b: string) =>
      ((QORDER[PEOPLE[b].q] ?? -1) - (QORDER[PEOPLE[a].q] ?? -1)) || PEOPLE[a].cs.localeCompare(PEOPLE[b].cs)
    const inSeat = (seat: string) => roster.filter(id => !PEOPLE[id].san && PEOPLE[id].seat === seat).sort(byCat)
    /* SANS carry a seat too; FCP are the SANS pilots, everyone else (RCP — the
       only other aircrew seat) the SANS WSOs. Using `!== 'FCP'` for the WSO side
       rather than `=== 'RCP'` guarantees no SANS member can fall through the two
       groups and vanish from the picker. */
    const sansSeat = (fcp: boolean) =>
      roster.filter(id => PEOPLE[id].san && (fcp ? PEOPLE[id].seat === 'FCP' : PEOPLE[id].seat !== 'FCP')).sort(byCat)
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
      <div className="ic-grid" ref={gridRef}>
        {cells.map((iso, i) => {
          if (!iso) return <div key={i} className="ic-x" />
          const wk = i % 7 >= 5
          const isToday = iso === todayIso
          const { inputs, pucks } = dayEntries(iso, { fPerson, fType, fSearch })
          /* THE CELL'S PRIORITY ORDER (owner, 22 Aug 26): the day TITLE, then
             the sections — notes and tiny pucks, drawn in FULL ("if it fills
             up the whole day box, so be it") — then the inputs, the lesser
             priority, as side-by-side mini chips capped at MAX_CHIPS with a
             +N more. Only the INPUTS are counted against the cap now; the
             cap used to cover sections too, back when they shared one
             column. */
          const shown = inputs.slice(0, MAX_CHIPS)
          const extra = inputs.length - shown.length
          const day = +iso.slice(8, 10)
          const rmk = DAYRMK[iso]
          return (
            <div key={iso} className={'ic-day' + (isToday ? ' ic-today' : '') + (wk ? ' ic-wk' : '')} data-icday={iso}>
              <div className="ic-num">{day}</div>
              {/* the day's TITLE — free text typed beside the date in the
                  popover, allowed to wrap (owner: "it will show up as the
                  title on the calendar view for mobile and desktop"). Keeps
                  the .ic-rmk class its tests and store history know it by. */}
              {rmk && <div className="ic-rmk" title={rmk}>{rmk}</div>}
              {pucks.map((p: any) => p.kind === 'pucks' ? (
                /* a pucks section as a row of TINY person chips, styled like the
                   app's standard puck (owner, 23 Aug 26 — "the standard green or
                   yellow"): the olive body lives in .ic-pk, and each person's
                   CATEGORY reads as a colour line on the RIGHT (the QCOLOR
                   ladder the Quals page uses); a SANS person carries an extra
                   purple line on the LEFT — the same purple the real puck wears,
                   just moved to the opposite edge so it never fights the CAT
                   line. Ground crew (no CAT) simply get no right line. */
                <div key={'p' + p.id} className="ic-pks" data-pid={p.id} data-icdrag>
                  {(p.ids || []).map((id: string) => {
                    const per = PEOPLE[id]
                    const cat = per && QCOLOR[per.q]   // category → right line (drawn by .ic-pk::after off this var)
                    return <span key={id} className={'ic-pk' + (per && per.san ? ' sans' : '')}
                      style={cat ? ({ ['--pk-cat']: cat } as React.CSSProperties) : undefined}>{per ? per.cs : id}</span>
                  })}
                </div>
              ) : (
                <div key={'p' + p.id} className="ic-chip plan" data-pid={p.id} data-icdrag>{p.text}</div>
              ))}
              {shown.length > 0 && (
                /* inputs side by side (owner: "coloured pucks arranged side by
                   side, just showing the callsign and the input") — the times
                   live in the popover; a SANS record reads as its F/O/A
                   letters on the purple chip, never the words. */
                <div className="ic-inrow">
                  {shown.map((r: any) => (
                    <div key={'i' + r.iid} className={'ic-chip ' + inputTone(r.type)} data-iid={r.iid} data-icdrag>
                      {PEOPLE[r.person] ? PEOPLE[r.person].cs : r.person} {isSansAvail(r.type) ? (sansLetters(r) || 'F/O/A') : inpLabel(r)}
                    </div>
                  ))}
                </div>
              )}
              {extra > 0 && <button type="button" className="ic-more" data-icmore={iso}
                onClick={() => { setPopIso(iso); setPopPuckEdit(null) }}>+{extra} more</button>}
            </div>
          )
        })}
      </div>
      {popIso != null && renderPop(popIso)}
      {pickFor != null && renderPicker()}
    </div>
  )
}
