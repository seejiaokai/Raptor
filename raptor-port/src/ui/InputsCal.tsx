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
import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { INPUTS, inputCoversDate, inpLabel, defaultAllday } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { hhmm } from '../engine/time'
import { PLANPUCKS, DAYRMK, setDayRemark, addPlanPuck, editPlanPuck, removePlanPuck } from '../state/plan'
import { notify, writeInputs } from '../state/store'
import { CALMONTH, setCalMonth } from '../state/view'
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
export const MAX_CHIPS = 3

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
      if (popIso) { setPopIso(null); setPopPuckEdit(null); return }
      onClose()
    }
    document.addEventListener('keydown', esc, true)
    return () => document.removeEventListener('keydown', esc, true)
  }, [onClose, popIso])

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
        setPopPuckEdit(entry.pid)
        setPuckDraft(PLANPUCKS.find((p: any) => p.id === entry.pid)?.text || '')
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
    const m0 = (cur.m - 1) + n
    setCalMonth({ y: cur.y + Math.floor(m0 / 12), m: ((m0 % 12) + 12) % 12 + 1 })
    notify()
  }
  /* keep the swipe gesture's stepper current — see stepRef above */
  stepRef.current = step
  const goToday = () => { const d = new Date(); setCalMonth({ y: d.getFullYear(), m: d.getMonth() + 1 }); notify() }

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
    return (
      <div className="ic-popwrap" onPointerDown={e => { if (e.target === e.currentTarget) closePop() }}>
        <div className="ic-pop" role="dialog" aria-label={`${fmtDay(iso)} details`}>
          <div className="ic-pop-head">
            <b>{fmtDay(iso)}</b>
            <button type="button" className="x" id="icPopClose" aria-label="Close" onClick={closePop}>✕</button>
          </div>
          <div className="ic-pop-body">
            {entries.inputs.length === 0 && !hasRmk && (
              <div className="ic-pop-empty">Nothing on this day — hold the cell or tap + Add input</div>
            )}
            {entries.inputs.length > 0 && (
              <div className="ic-pop-rows">
                {entries.inputs.map((r: any) => (
                  <button key={r.iid} type="button" className={'ic-poprow ' + inputTone(r.type)}
                    data-popiid={r.iid} onClick={() => { setInpEdit(r); notify() }}>
                    {/* the identity line — callsign, type, and (timed only) the
                        window pinned right, the same three fields the row always
                        carried; wrapped now so a remark can sit under it */}
                    <span className="ic-poprow-top">
                      <span className="ic-poprow-who">{PEOPLE[r.person] ? PEOPLE[r.person].cs : r.person}</span>
                      <span className="ic-poprow-lbl">{inpLabel(r)}</span>
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

            {/* the day remark — a scheduler edits it with a draft-apart-from-
                model field (the page's own idiom: type freely, commit once on
                Enter/blur so a stray tap elsewhere never loses what was
                typed); a member reads it as plain text, or sees nothing when
                there isn't one. */}
            {sched ? (
              <label className="inped-f">
                <span className="inped-k">Day remark</span>
                <input id="icRmkEdit" value={rmkDraft} onChange={e => setRmkDraft(e.target.value)}
                  onBlur={() => writeInputs(() => setDayRemark(iso, rmkDraft))}
                  onKeyDown={blurOnEnter} />
              </label>
            ) : hasRmk ? (
              <div className="inped-f">
                <span className="inped-k">Day remark</span>
                <span className="ic-poprmk-ro">{DAYRMK[iso]}</span>
              </div>
            ) : null}

            {/* planning notes — visible to everyone, editable only by a
                scheduler. Shown even with zero notes when a scheduler could
                add one; hidden for a member seeing none, so an empty section
                heading never sits there for nothing. */}
            {(entries.pucks.length > 0 || sched) && (
              <div className="ic-poppucks-wrap">
                <span className="inped-k">Planning notes</span>
                <div className="ic-poppucks">
                  {entries.pucks.map((p: any) => sched && popPuckEdit === p.id ? (
                    <input key={p.id} className="ic-poppuck-edit" autoFocus value={puckDraft}
                      aria-label="Edit planning note" onChange={e => setPuckDraft(e.target.value)}
                      onBlur={() => {
                        const t = puckDraft.trim()
                        if (t && t !== p.text) writeInputs(() => editPlanPuck(p.id, t))
                        setPopPuckEdit(null)
                      }}
                      onKeyDown={blurOnEnter} />
                  ) : (
                    <div key={p.id} className="ic-poppuck">
                      <span className="ic-poppuck-txt">{p.text}</span>
                      {sched && <>
                        <button type="button" data-ppedit={p.id} aria-label="Edit note"
                          onClick={() => { setPopPuckEdit(p.id); setPuckDraft(p.text) }}>✏</button>
                        <button type="button" data-ppdel={p.id} aria-label="Delete note"
                          onClick={() => writeInputs(() => removePlanPuck(p.id))}>✕</button>
                      </>}
                    </div>
                  ))}
                </div>
                {sched && (popPuckEdit === '' ? (
                  <input className="ic-poppuck-edit" autoFocus value={puckDraft} aria-label="New planning note"
                    placeholder="e.g. brief the new guy"
                    onChange={e => setPuckDraft(e.target.value)}
                    onBlur={() => {
                      const t = puckDraft.trim()
                      if (t) writeInputs(() => addPlanPuck(iso, t))
                      setPopPuckEdit(null); setPuckDraft('')
                    }}
                    onKeyDown={blurOnEnter} />
                ) : (
                  <button type="button" className="abtn" id="icAddPuck"
                    onClick={() => { setPopPuckEdit(''); setPuckDraft('') }}>+ Note</button>
                ))}
              </div>
            )}

            {/* EVERYONE may add — page-rights parity with the openAdd seed
                above, and the same reach a member already has to file their
                own input from the Inputs table's own + Add. */}
            <button type="button" className="abtn primary" id="icPopAdd" onClick={() => openAdd(iso)}>+ Add input</button>
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
          const chips = [
            ...inputs.map((r: any) => ({ kind: 'input' as const, row: r })),
            ...pucks.map((p: any) => ({ kind: 'puck' as const, row: p })),
          ]
          const shown = chips.slice(0, MAX_CHIPS)
          const extra = chips.length - shown.length
          const day = +iso.slice(8, 10)
          const rmk = DAYRMK[iso]
          return (
            <div key={iso} className={'ic-day' + (isToday ? ' ic-today' : '') + (wk ? ' ic-wk' : '')} data-icday={iso}>
              <div className="ic-num">{day}</div>
              {rmk && <div className="ic-rmk" title={rmk}>{rmk}</div>}
              {shown.map(c => c.kind === 'input' ? (
                <div key={'i' + c.row.iid} className={'ic-chip ' + inputTone(c.row.type)} data-iid={c.row.iid} data-icdrag>
                  {PEOPLE[c.row.person] ? PEOPLE[c.row.person].cs : c.row.person} {inpLabel(c.row)}
                  {!c.row.allday ? ` ${hhmm(c.row.s)}–${hhmm(c.row.e)}` : ''}
                </div>
              ) : (
                <div key={'p' + c.row.id} className="ic-chip plan" data-pid={c.row.id} data-icdrag>{c.row.text}</div>
              ))}
              {extra > 0 && <button type="button" className="ic-more" data-icmore={iso}
                onClick={() => { setPopIso(iso); setPopPuckEdit(null) }}>+{extra} more</button>}
            </div>
          )
        })}
      </div>
      {popIso != null && renderPop(popIso)}
    </div>
  )
}
